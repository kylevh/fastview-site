import { useLocation, useSearchParams } from 'react-router-dom'

/**
 * Record id reflected in the global top search bar: workflow path segment,
 * search page `q` query (before redirect), or review-status `record` query.
 */
export function useGlobalRecordSearchValue(): string {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const path = location.pathname
  const segments = path.split('/').filter(Boolean)

  if (segments[0] === 'permit-workflow' && segments[1]) {
    try {
      return decodeURIComponent(segments[1])
    } catch {
      return segments[1]
    }
  }

  if (path === '/') {
    return searchParams.get('q')?.trim() ?? ''
  }

  if (path === '/review-status') {
    return searchParams.get('record')?.trim() ?? ''
  }

  return ''
}
