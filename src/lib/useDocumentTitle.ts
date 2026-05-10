import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Product name — always Title Case. */
export const DOCUMENT_TITLE_BRAND = 'FastView'

/** Uniform separator (minimal, works well in tabs). */
const SEP = ' · '

/** Default / fallback — matches `index.html` for first paint before hydration. */
export const DOCUMENT_TITLE_DEFAULT = `Seattle Permits${SEP}${DOCUMENT_TITLE_BRAND}`

function decodeRecordSegment(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * Browser titles: Title Case for UI phrases, record IDs unchanged, single separator throughout.
 * Pattern: `{context}${SEP}{brand}` or `{record}${SEP}{page}${SEP}{brand}` when a record is in play.
 */
export function documentTitleForPath(pathname: string, search: string): string {
  const brand = DOCUMENT_TITLE_BRAND

  if (pathname === '/' || pathname === '') {
    return DOCUMENT_TITLE_DEFAULT
  }

  if (pathname === '/support') {
    return `Support${SEP}${brand}`
  }

  const wfPrefix = '/permit-workflow'
  if (pathname === wfPrefix) {
    return `Permit Workflow${SEP}${brand}`
  }

  if (pathname.startsWith(`${wfPrefix}/`)) {
    const seg = pathname.slice(wfPrefix.length + 1)
    const record = decodeRecordSegment(seg)
    if (record) {
      return `${record}${SEP}Permit Workflow${SEP}${brand}`
    }
    return `Permit Workflow${SEP}${brand}`
  }

  if (pathname === '/review-status') {
    const record = new URLSearchParams(search).get('record')?.trim()
    if (record) {
      return `${record}${SEP}Review Status${SEP}${brand}`
    }
    return `Review Status${SEP}${brand}`
  }

  return DOCUMENT_TITLE_DEFAULT
}

/** Keeps `document.title` in sync with the route. */
export function useDocumentTitle() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    document.title = documentTitleForPath(pathname, search)
  }, [pathname, search])
}
