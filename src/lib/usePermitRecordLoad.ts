import { useEffect, useRef, useState } from 'react'
import { fetchPermitRecord, getCachedPermitRecord, type PermitRecordView } from './recordApi'

export type PermitRecordLoadState =
  | { status: 'idle' }
  | { status: 'loading'; recordNumber: string }
  | { status: 'ready'; recordNumber: string; data: PermitRecordView }
  | { status: 'error'; recordNumber: string; message: string }

function initialLoadState(recordNumber: string | undefined | null): PermitRecordLoadState {
  const id = recordNumber?.trim()
  if (!id) return { status: 'idle' }
  const cached = getCachedPermitRecord(id)
  if (cached) return { status: 'ready', recordNumber: id, data: cached }
  return { status: 'loading', recordNumber: id }
}

/**
 * Loads one permit JSON for the SPA session: uses `getCachedPermitRecord` first so navigating
 * workflow → review status shows data immediately with no second network request when the cache is warm.
 */
export function usePermitRecordLoad(recordNumber: string | undefined | null): PermitRecordLoadState {
  const key = recordNumber?.trim() ?? ''

  const [state, setState] = useState<PermitRecordLoadState>(() => initialLoadState(recordNumber))
  const keySynced = useRef(key)
  if (keySynced.current !== key) {
    keySynced.current = key
    setState(initialLoadState(key || null))
  }

  useEffect(() => {
    if (!key) return

    const cached = getCachedPermitRecord(key)
    if (cached) return

    let cancelled = false

    fetchPermitRecord(key)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', recordNumber: key, data })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load record'
          setState({ status: 'error', recordNumber: key, message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [key])

  return state
}
