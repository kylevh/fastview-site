import type { PermitRecordView } from './recordApi'
import { getLatestDisciplineEvent, isTerminalDisciplineReviewStatus } from './reviewOverview'

export type DisciplineReviewBucket =
  | 'corrections'
  | 'follow-up'
  | 'in-review'
  | 'waiting'
  | 'approved'
  | 'skipped'
  | 'other'

export type DisciplineReviewRow = {
  discipline: string
  reviewCycle: number | null
  latestStatus: string
  latestDate: string | null
  assignedTo: string | null
  bucket: DisciplineReviewBucket
  /**
   * Portal `summary.pendingDisciplines` still includes this review area **and** the derived status
   * from the event log is not already terminal (approved/completed/not required). When those disagree,
   * we trust the event log for status and omit the chip.
   */
  isPendingSummary: boolean
}

export function bucketFromLatestStatus(status: string): DisciplineReviewBucket {
  const s = status.trim().toLowerCase()
  if (/corrections required/i.test(s)) return 'corrections'
  if (/final review required|additional cycle required/i.test(s)) return 'follow-up'
  if (s === 'in review') return 'in-review'
  if (s === 'assigned' || s === 'pending assignment') return 'waiting'
  if (s === 'approved' || s === 'completed' || s === 'all reviews completed') return 'approved'
  if (/not required/i.test(s) || /deferred/i.test(s)) return 'skipped'
  return 'other'
}

function compareDiscipline(a: DisciplineReviewRow, b: DisciplineReviewRow) {
  return a.discipline.localeCompare(b.discipline, undefined, { sensitivity: 'base' })
}

export type GroupedDisciplineReviews = {
  corrections: DisciplineReviewRow[]
  followUp: DisciplineReviewRow[]
  inProgress: DisciplineReviewRow[]
  approved: DisciplineReviewRow[]
  other: DisciplineReviewRow[]
  skipped: DisciplineReviewRow[]
}

/** One row per discipline with bucket derived from the latest portal event. */
function portalString(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length ? t : null
}

/** Assigned reviewer for display; portal often sends "TBD" when unknown — show an em dash instead. */
function reviewerDisplay(v: unknown): string | null {
  const s = portalString(v)
  if (!s) return null
  if (/^tbd$/i.test(s)) return null
  return s
}

export function buildDisciplineReviewRows(data: PermitRecordView): DisciplineReviewRow[] {
  const pendingSet = new Set(data.summary.pendingDisciplines)
  return data.parsed.disciplineReviews.map((row) => {
    const ev = getLatestDisciplineEvent(row)
    const latestStatus = ev?.status?.trim() || '—'
    const bucket = bucketFromLatestStatus(latestStatus)
    const inSummaryPending = pendingSet.has(row.discipline)
    return {
      discipline: row.discipline,
      reviewCycle: row.reviewCycle ?? null,
      latestStatus,
      latestDate: portalString(ev?.date),
      assignedTo: reviewerDisplay(ev?.assignedTo),
      bucket,
      isPendingSummary: inSummaryPending && !isTerminalDisciplineReviewStatus(latestStatus),
    }
  })
}

export function groupDisciplineReviews(rows: DisciplineReviewRow[]): GroupedDisciplineReviews {
  const corrections = rows.filter((r) => r.bucket === 'corrections').sort(compareDiscipline)
  const followUp = rows.filter((r) => r.bucket === 'follow-up').sort(compareDiscipline)
  const inProgress = rows
    .filter((r) => r.bucket === 'in-review' || r.bucket === 'waiting')
    .sort(compareDiscipline)
  const approved = rows.filter((r) => r.bucket === 'approved').sort(compareDiscipline)
  const other = rows.filter((r) => r.bucket === 'other').sort(compareDiscipline)
  const skipped = rows.filter((r) => r.bucket === 'skipped').sort(compareDiscipline)

  return { corrections, followUp, inProgress, approved, other, skipped }
}
