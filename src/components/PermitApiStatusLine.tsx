import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPermitApiHealth, type PermitApiHealthErr } from '../lib/recordApi'

type UiState =
  | { kind: 'loading' }
  | { kind: 'up' }
  | { kind: 'down'; err: PermitApiHealthErr }

function unavailableCopy(err: PermitApiHealthErr): { headline: string; body: string } {
  switch (err.reason) {
    case 'timeout':
      return {
        headline: 'Readiness check timed out',
        body: 'The API did not answer in time—idle hosts often need several minutes (sometimes up to about five minutes) before the first request succeeds. Try Retry or search anyway.',
      }
    case 'network':
      return {
        headline: 'Cannot reach permit scraper backend from this browser',
        body: 'Check your connection, try Retry, or search anyway if you believe the service is up.',
      }
    case 'bad_status':
      return {
        headline: 'Permit Scraper backend rejected the health check',
        body: 'The server responded with an error status. Try again shortly or continue with a permit search.',
      }
    case 'invalid_body':
      return {
        headline: 'Permit scraper backend returned an unexpected payload',
        body: 'We did not get { ok: true } from /health. You can still try a permit search.',
      }
    default:
      return {
        headline: 'Could not confirm API status',
        body: 'Try Retry or continue with your permit search.',
      }
  }
}

export function PermitApiStatusLine() {
  const [ui, setUi] = useState<UiState>({ kind: 'loading' })
  const [loadingElapsed, setLoadingElapsed] = useState(0)
  const alive = useRef(true)

  const check = useCallback(async (silent: boolean) => {
    if (!silent) setUi({ kind: 'loading' })
    const result = await fetchPermitApiHealth()
    if (!alive.current) return
    if (result.ok) {
      setUi({ kind: 'up' })
    } else {
      setUi({ kind: 'down', err: result })
    }
  }, [])

  useEffect(() => {
    alive.current = true
    queueMicrotask(() => void check(false))
    const interval = window.setInterval(() => void check(true), 90_000)
    return () => {
      alive.current = false
      window.clearInterval(interval)
    }
  }, [check])

  useEffect(() => {
    if (ui.kind !== 'loading') {
      queueMicrotask(() => setLoadingElapsed(0))
      return
    }
    const t = window.setInterval(() => setLoadingElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [ui.kind])

  const dotClass =
    ui.kind === 'loading' ? 'metaDot metaDot--checking' : ui.kind === 'up' ? 'metaDot metaDot--online' : 'metaDot metaDot--offline'

  const metaClass =
    ui.kind === 'down'
      ? 'findRecordMeta findRecordMeta--down'
      : ui.kind === 'loading'
        ? 'findRecordMeta findRecordMeta--checking'
        : 'findRecordMeta findRecordMeta--up'

  const downCopy = ui.kind === 'down' ? unavailableCopy(ui.err) : null

  return (
    <div className="permitApiStatusWrap">
      <div className={metaClass} aria-live="polite">
        <div className="findRecordMetaBody">
          <span className={dotClass} aria-hidden="true" />
          <div className="findRecordMetaMain">
            {ui.kind === 'loading' ? (
              <span className="findRecordMetaStrong">Checking permit API availability…</span>
            ) : ui.kind === 'up' ? (
              <span className="findRecordMetaStrong">Service ready</span>
            ) : downCopy ? (
              <>
                <span className="findRecordMetaStrong">{downCopy.headline}</span>
                <span className="findRecordMetaDetail">{downCopy.body}</span>
              </>
            ) : null}
          </div>
        </div>
        {ui.kind === 'down' ? (
          <div className="findRecordMetaRetryWrap">
            <button type="button" className="metaRetryButton" onClick={() => void check(false)}>
              Retry
            </button>
          </div>
        ) : null}
      </div>
      {ui.kind === 'loading' && loadingElapsed >= 5 ? (
        <p className="metaColdHint">
          No reply yet? Idle services can take several minutes to start—often within about five minutes on free plans.
        </p>
      ) : null}
    </div>
  )
}
