import type { PermitRecordView } from './recordApi'

type DisciplineRow = PermitRecordView['parsed']['disciplineReviews'][number]
type EventRow = DisciplineRow['events'][number]

/** Dated portal row with stable array index for timeline ordering. */
type IndexedEv = { ev: EventRow; i: number }

function getDatedIndexed(row: DisciplineRow): IndexedEv[] {
  return row.events.map((ev, i) => ({ ev, i })).filter(({ ev }) => Boolean(ev.date?.trim()))
}

/** True if `a` is strictly later than `b` (newer date, or same ISO date and later in the log). */
function isStrictlyAfterTimeline(a: IndexedEv, b: IndexedEv): boolean {
  const da = String(a.ev.date).trim()
  const db = String(b.ev.date).trim()
  if (da > db) return true
  if (da < db) return false
  return a.i > b.i
}

/**
 * Reassignment / placeholder rows the portal logs after `Corrections Required` — they do not replace
 * the real blocking state until something substantive or terminal happens.
 */
function isAdministrativeNoiseAfterCorrections(status: string): boolean {
  const s = status.trim().toLowerCase()
  if (s === 'assigned' || s === 'pending assignment') return true
  if (s === 'tbd') return true
  return false
}

function findLatestCorrectionsRequiredIndexed(row: DisciplineRow): IndexedEv | undefined {
  const dated = getDatedIndexed(row)
  const hits = dated.filter(({ ev }) => /corrections required/i.test(ev.status ?? ''))
  if (!hits.length) return undefined
  return hits.reduce((best, x) => (isStrictlyAfterTimeline(x, best) ? x : best))
}

/**
 * Latest dated event using calendar-day + same-day tie-break rules only (no corrections-vs-noise).
 * Returns indexed pair for downstream merging.
 */
function pickLatestCalendarDayIndexed(row: DisciplineRow): IndexedEv | undefined {
  if (!row.events?.length) return undefined
  const dated = getDatedIndexed(row)
  if (!dated.length) {
    const i = row.events.length - 1
    return { ev: row.events[i], i }
  }

  let maxDate = ''
  for (const { ev } of dated) {
    const d = String(ev.date).trim()
    if (d > maxDate) maxDate = d
  }

  const onLatestDay = dated.filter(({ ev }) => String(ev.date).trim() === maxDate)
  const winsOnLatestDay = onLatestDay.filter(({ ev }) => isApprovedOrCompletedStatus(ev.status ?? ''))

  if (winsOnLatestDay.length) {
    winsOnLatestDay.sort((a, b) => a.i - b.i)
    const last = winsOnLatestDay[winsOnLatestDay.length - 1]
    return last
  }

  onLatestDay.sort((a, b) => a.i - b.i)
  return onLatestDay[onLatestDay.length - 1]
}

/**
 * After `Corrections Required`, SDCI sometimes appends Assign / TBD rows that are newer by date but
 * not meaningful — keep showing corrections required unless something substantive appears later.
 */
function applyCorrectionsRequiredVsAdministrativeNoise(row: DisciplineRow, cal: IndexedEv): IndexedEv {
  const latestCr = findLatestCorrectionsRequiredIndexed(row)
  if (!latestCr) return cal

  const dated = getDatedIndexed(row)
  const afterCr = dated.filter((x) => isStrictlyAfterTimeline(x, latestCr))
  const nonNoiseAfter = afterCr.filter((x) => !isAdministrativeNoiseAfterCorrections(x.ev.status ?? ''))

  if (nonNoiseAfter.length === 0) {
    return latestCr
  }

  const meaningfulLatest = nonNoiseAfter.reduce((best, x) => (isStrictlyAfterTimeline(x, best) ? x : best))

  if (isAdministrativeNoiseAfterCorrections(cal.ev.status ?? '')) {
    return meaningfulLatest
  }

  return cal
}

export type ReviewEmphasis = 'corrections' | 'follow-up' | 'in-review' | 'waiting' | 'clear'

export type ReviewOverview = {
  reviewCycle: number | null
  pendingCount: number
  pendingDisciplines: string[]
  totalDisciplines: number
  clearedDisciplines: number
  correctionsRequiredCount: number
  inReviewCount: number
  followUpCount: number
  headline: string
  detailLine: string
  emphasis: ReviewEmphasis
}

/**
 * True when this status means the discipline review track is finished (portal sometimes logs
 * Assign after Approve). Review Evaluation ends with `All Reviews Completed`, often followed the
 * same day by `Final Review Coordination` — we treat the former as the outcome.
 */
function isApprovedOrCompletedStatus(status: string): boolean {
  const s = status.trim().toLowerCase()
  if (s === 'approved' || s === 'completed') return true
  if (s === 'all reviews completed') return true
  return false
}

/**
 * Outcomes that mean no further discipline work from the event log, even if the portal summary
 * still lists the discipline under `pendingDisciplines`.
 */
export function isTerminalDisciplineReviewStatus(status: string): boolean {
  const s = status.trim().toLowerCase()
  if (s === 'approved' || s === 'completed' || s === 'all reviews completed') return true
  if (/not required/i.test(s) || /deferred/i.test(s)) return true
  return false
}

/**
 * Effective "current" discipline event for UX and summaries.
 *
 * 1. Latest calendar date, with same-day preference for Approved / Completed / All Reviews Completed.
 * 2. After `Corrections Required`, ignore newer Assigned / Pending assignment / TBD-only rows until a
 *    substantive or terminal status appears (portal reorder noise).
 */
export function getLatestDisciplineEvent(row: DisciplineRow): EventRow | undefined {
  const cal = pickLatestCalendarDayIndexed(row)
  if (!cal) return undefined
  return applyCorrectionsRequiredVsAdministrativeNoise(row, cal).ev
}

function effectivePendingDisciplineNames(
  portalPending: string[],
  byName: Map<string, DisciplineRow>,
): string[] {
  return portalPending.filter((name) => {
    const row = byName.get(name)
    if (!row) return true
    const ev = getLatestDisciplineEvent(row)
    const st = ev?.status ?? ''
    if (!st.trim()) return true
    return !isTerminalDisciplineReviewStatus(st)
  })
}

/**
 * Snapshot for dashboard cards: uses `summary.pendingDisciplines` filtered by effective outcome from
 * each discipline’s event log (`getLatestDisciplineEvent`), so stale portal “pending” rows don’t
 * drive the headline when the log already shows Approved / Completed / All Reviews Completed / ….
 */
export function buildReviewOverview(data: PermitRecordView): ReviewOverview {
  const summary = data.summary
  const total = summary.totalDisciplines
  const cycle = summary.currentReviewCycle ?? null
  const byName = new Map(data.parsed.disciplineReviews.map((d) => [d.discipline, d]))

  const portalPendingNames = [...summary.pendingDisciplines]
  const pendingNames = effectivePendingDisciplineNames(portalPendingNames, byName)
  const pendingCount = pendingNames.length

  let correctionsRequiredCount = 0
  let inReviewCount = 0
  let followUpCount = 0

  for (const name of pendingNames) {
    const row = byName.get(name)
    const ev = row ? getLatestDisciplineEvent(row) : undefined
    const st = ev?.status ?? ''
    if (/corrections required/i.test(st)) correctionsRequiredCount++
    else if (/^in review$/i.test(st.trim())) inReviewCount++
    else if (/final review required|additional cycle required/i.test(st)) followUpCount++
  }

  const segCorrections = (n: number) =>
    n === 1 ? 'Corrections required on 1 review' : `Corrections required on ${n} reviews`
  const segFollowUp = (n: number) =>
    n === 1 ? 'Follow-up required on 1 review' : `Follow-up required on ${n} reviews`
  const segInProgress = (n: number) =>
    n === 1 ? '1 in progress' : `${n} in progress`
  const segFollowUpExtra = (n: number) =>
    n === 1 ? '1 needs follow-up' : `${n} need follow-up`

  let headline: string
  let emphasis: ReviewEmphasis

  if (correctionsRequiredCount > 0) {
    const extra: string[] = []
    if (inReviewCount > 0) extra.push(segInProgress(inReviewCount))
    if (followUpCount > 0) extra.push(segFollowUpExtra(followUpCount))
    headline =
      extra.length > 0 ? `${segCorrections(correctionsRequiredCount)} · ${extra.join(' · ')}` : segCorrections(correctionsRequiredCount)
    emphasis = 'corrections'
  } else if (followUpCount > 0) {
    headline =
      inReviewCount > 0
        ? `${segFollowUp(followUpCount)} · ${segInProgress(inReviewCount)}`
        : segFollowUp(followUpCount)
    emphasis = 'follow-up'
  } else if (inReviewCount > 0) {
    headline =
      inReviewCount === 1
        ? '1 review in progress'
        : `${inReviewCount} reviews in progress`
    emphasis = 'in-review'
  } else if (pendingCount > 0) {
    headline =
      pendingCount === 1 ? 'Waiting on 1 review' : `Waiting on ${pendingCount} reviews`
    emphasis = 'waiting'
  } else {
    headline = 'No open reviews'
    emphasis = 'clear'
  }

  const clearedDisciplines = Math.max(0, total - pendingCount)

  const detailLine =
    pendingCount > 0
      ? pendingCount === 1
        ? '1 review open'
        : `${pendingCount} reviews open`
      : ''

  return {
    reviewCycle: cycle,
    pendingCount,
    pendingDisciplines: pendingNames,
    totalDisciplines: total,
    clearedDisciplines,
    correctionsRequiredCount,
    inReviewCount,
    followUpCount,
    headline,
    detailLine,
    emphasis,
  }
}
