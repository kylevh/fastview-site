import record7058372 from '../data/record-7058372-CN.json'

export type PermitRecordJson = typeof record7058372

export type WorkflowStageRow = PermitRecordJson['parsed']['workflowStages'][number]

/** Loaded permit record: API JSON (`address` at root is allowed) plus normalized `portal.address` for UI. */
export type PermitRecordView = PermitRecordJson & {
  portal: {
    address: string
  }
}

const DEFAULT_SDCI_API_BASE = 'https://fastview-sdci.onrender.com'

function normalizeRecordId(input: string) {
  return input.trim()
}

/** Same origin as `/api/permit/...` — used for `/health` and status UI. */
export function getPermitApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_SDCI_API_BASE as string | undefined
  const raw = (fromEnv?.trim() || DEFAULT_SDCI_API_BASE).replace(/\/$/, '')
  return raw
}

function permitApiBaseUrl(): string {
  return getPermitApiBaseUrl()
}

export type PermitApiHealthOk = { ok: true; latencyMs: number }

export type PermitApiHealthErr = {
  ok: false
  reason: 'timeout' | 'network' | 'bad_status' | 'invalid_body'
  httpStatus?: number
}

export type PermitApiHealthResult = PermitApiHealthOk | PermitApiHealthErr

/**
 * URL for GET `/health`. In dev (and when `VITE_SDCI_PROXY=true`), uses the Vite proxy at `/sdci-api`
 * so the browser talks same-origin — avoids CORS when only `/api/*` is configured on the server.
 * In production builds, uses `getPermitApiBaseUrl()/health` (your API must allow that origin for GET /health).
 */
function healthCheckRequestUrl(): string {
  const useProxy = import.meta.env.DEV === true || import.meta.env.VITE_SDCI_PROXY === 'true'
  if (useProxy) {
    return '/sdci-api/health'
  }
  return `${getPermitApiBaseUrl()}/health`
}

/** GET `/health` — expects JSON `{ "ok": true }`. Long default timeout supports Render free-tier cold start. */
export async function fetchPermitApiHealth(timeoutMs = 75_000): Promise<PermitApiHealthResult> {
  const url = healthCheckRequestUrl()
  const t0 = performance.now()
  const ac = new AbortController()
  const tid = window.setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    const latencyMs = Math.round(performance.now() - t0)
    clearTimeout(tid)
    if (!res.ok) {
      return { ok: false, reason: 'bad_status', httpStatus: res.status }
    }
    let body: unknown
    try {
      body = await res.json()
    } catch {
      return { ok: false, reason: 'invalid_body' }
    }
    if (body && typeof body === 'object' && (body as { ok?: unknown }).ok === true) {
      return { ok: true, latencyMs }
    }
    return { ok: false, reason: 'invalid_body' }
  } catch (e: unknown) {
    clearTimeout(tid)
    const aborted = e instanceof DOMException && e.name === 'AbortError'
    if (aborted || ac.signal.aborted) {
      return { ok: false, reason: 'timeout' }
    }
    return { ok: false, reason: 'network' }
  }
}

/** Session-scoped cache so routes (e.g. workflow → review status) don't repeat large permit fetches. */
const permitRecordCache = new Map<string, PermitRecordView>()
const permitRecordInflight = new Map<string, Promise<PermitRecordView>>()

/** Drop cached JSON so the next `fetchPermitRecord` hits the network (e.g. explicit refresh). */
export function invalidatePermitRecordCache(recordNumber: string): void {
  const id = normalizeRecordId(recordNumber)
  if (id) permitRecordCache.delete(id)
}

/** Synchronous read for UI that already fetched this record in-session (avoids a loading flash). */
export function getCachedPermitRecord(recordNumber: string): PermitRecordView | undefined {
  const id = normalizeRecordId(recordNumber)
  if (!id) return undefined
  return permitRecordCache.get(id)
}

/**
 * Builds one display line for permit headers / dashboard. API may send:
 * - `portal.address` or root `address` as a string, or
 * - root `address` as `{ line1, city, state, zip }`.
 */
export function formatPermitAddressFromPayload(raw: {
  address?: unknown
  portal?: { address?: unknown }
}): string | null {
  const portalAddr = raw.portal?.address
  if (typeof portalAddr === 'string' && portalAddr.trim().length > 0) return portalAddr.trim()

  const addr = raw.address
  if (typeof addr === 'string' && addr.trim().length > 0) return addr.trim()

  if (addr && typeof addr === 'object' && !Array.isArray(addr)) {
    const o = addr as Record<string, unknown>
    const line1 = typeof o.line1 === 'string' ? o.line1.trim() : ''
    const city = typeof o.city === 'string' ? o.city.trim() : ''
    const state = typeof o.state === 'string' ? o.state.trim() : ''
    const zip = typeof o.zip === 'string' ? o.zip.trim() : ''
    if (!line1 && !city && !state && !zip) return null
    const cityStateZip = [city, state].filter(Boolean).join(', ')
    const head = [line1, cityStateZip].filter(Boolean).join(', ')
    if (head && zip) return `${head} ${zip}`.trim()
    return head || zip || null
  }

  return null
}

/** Normalize API payloads: address may be string, structured object, or `portal.address` string. */
function withPortalDefaults(raw: Partial<PermitRecordJson> & { portal?: { address?: unknown } }): PermitRecordView {
  const trimmed = formatPermitAddressFromPayload(raw)

  const basePortal =
    raw.portal && typeof raw.portal === 'object' ? { ...raw.portal } : {}

  return {
    ...(raw as PermitRecordJson),
    portal: {
      ...basePortal,
      address: trimmed ?? 'Address not available',
    },
  }
}

async function fetchPermitRecordFromNetwork(recordNumber: string): Promise<PermitRecordView> {
  const id = normalizeRecordId(recordNumber)
  const url = `${permitApiBaseUrl()}/api/permit/${encodeURIComponent(id)}`

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Could not reach the permit API. Check your connection.')
  }

  if (res.status === 404) {
    throw new Error(`Record "${id}" was not found.`)
  }

  if (!res.ok) {
    const hint = res.statusText || 'Unknown error'
    throw new Error(`Permit API error (${res.status}): ${hint}`)
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new Error('Permit API returned invalid JSON.')
  }

  if (!body || typeof body !== 'object') {
    throw new Error('Permit API returned an empty response.')
  }

  const data = body as Partial<PermitRecordJson> & { portal?: { address?: unknown }; address?: unknown }
  if (typeof data.recordNumber !== 'string') {
    throw new Error('Permit API response is missing recordNumber.')
  }

  return withPortalDefaults(data)
}

/**
 * Fetch a permit record from the Fastview SDCI HTTP API.
 *
 * Base URL: `VITE_SDCI_API_BASE` (Vite env), or `https://fastview-sdci.onrender.com` when unset.
 * Path: `/api/permit/{recordNumber}`
 *
 * Responses are cached in memory for the SPA session (keyed by trimmed record id) so navigating
 * between pages that need the same record does not repeat the request. Concurrent callers share one
 * in-flight request.
 */
export async function fetchPermitRecord(recordNumber: string): Promise<PermitRecordView> {
  const id = normalizeRecordId(recordNumber)
  if (!id) {
    throw new Error('Record number is required.')
  }

  const cached = permitRecordCache.get(id)
  if (cached) return cached

  let pending = permitRecordInflight.get(id)
  if (!pending) {
    pending = fetchPermitRecordFromNetwork(id).then((data) => {
      permitRecordCache.set(id, data)
      return data
    })
    pending.finally(() => permitRecordInflight.delete(id))
    permitRecordInflight.set(id, pending)
  }

  return pending
}
