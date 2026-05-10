import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPermitApiHealth, type PermitApiHealthErr } from '../lib/recordApi'

type UiState =
  | { kind: 'loading' }
  | { kind: 'up' }
  | { kind: 'down'; err: PermitApiHealthErr }

/** One short line per reason — calm copy; lookup may still succeed. */
function statusLine(err: PermitApiHealthErr): string {
  switch (err.reason) {
    case 'timeout':
      return 'Slow to respond—you can still try search'
    case 'network':
      return "Can't verify backend—search may still work"
    case 'bad_status':
      return "Couldn't verify service—you can still try"
    case 'invalid_body':
      return "Couldn't verify status—try search anyway"
    default:
      return "Couldn't verify backend—you can still search"
  }
}

export function PermitApiStatusLine() {
  const [ui, setUi] = useState<UiState>({ kind: 'loading' })
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

  const dotClass =
    ui.kind === 'loading' ? 'metaDot metaDot--checking' : ui.kind === 'up' ? 'metaDot metaDot--online' : 'metaDot metaDot--offline'

  const metaClass =
    ui.kind === 'down'
      ? 'findRecordMeta findRecordMeta--down'
      : ui.kind === 'loading'
        ? 'findRecordMeta findRecordMeta--checking'
        : 'findRecordMeta findRecordMeta--up'

  const line =
    ui.kind === 'loading'
      ? 'Checking connection…'
      : ui.kind === 'up'
        ? 'Ready to search'
        : statusLine(ui.err)

  return (
    <div className="permitApiStatusWrap">
      <div className={metaClass} aria-live="polite">
        <div className="findRecordMetaBody">
          <span className={dotClass} aria-hidden="true" />
          <span className="findRecordMetaStrong permitApiStatusLineText">{line}</span>
        </div>
      </div>
    </div>
  )
}
