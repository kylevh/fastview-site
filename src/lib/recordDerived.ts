import { formatPermitAddressFromPayload, type PermitRecordJson } from './recordApi'

/** Portal date strings are YYYY-MM-DD; format in local calendar without TZ drift. */
export function formatPortalDate(isoDay: string): string {
  const parts = isoDay.split('-').map((x) => Number(x))
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return isoDay
  const [y, m, d] = parts
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Latest dated portal touch across workflow stages and discipline reviews (ISO max). */
export function maxIsoDateInRecord(data: PermitRecordJson): string | null {
  let max = ''
  const bump = (s: string | null | undefined) => {
    if (s && /^\d{4}-\d{2}-\d{2}$/.test(s.trim()) && s > max) max = s
  }

  for (const st of data.parsed.workflowStages) {
    for (const ev of st.events ?? []) {
      bump(ev.date)
    }
  }
  for (const dr of data.parsed.disciplineReviews ?? []) {
    for (const ev of dr.events ?? []) {
      bump(ev.date)
    }
  }

  return max || null
}

/** Dashboard row shape built only from a permit JSON payload. */
export function dashboardPermitRowFromRecord(data: PermitRecordJson): {
  recordNumber: string
  address: string
  type: string
  status: string
  lastUpdated: string
} {
  const latest = maxIsoDateInRecord(data)
  const raw = data as PermitRecordJson & { portal?: { address?: unknown }; address?: unknown }
  const address = formatPermitAddressFromPayload(raw) ?? '—'
  return {
    recordNumber: data.recordNumber,
    address,
    type: '—',
    status: data.summary.currentStage,
    lastUpdated: latest ? formatPortalDate(latest) : '—',
  }
}
