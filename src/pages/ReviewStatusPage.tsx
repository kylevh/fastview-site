import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MapPin, ShieldCheck } from 'lucide-react'
import { RecordLoadScreen } from '../components/RecordLoadScreen'
import { formatPortalDate } from '../lib/recordDerived'
import { usePermitRecordLoad } from '../lib/usePermitRecordLoad'
import { buildReviewOverview, type ReviewEmphasis } from '../lib/reviewOverview'
import { REVIEW_SNAPSHOT_HERO_ICON } from '../lib/reviewSnapshotHeroIcon'
import {
  buildDisciplineReviewRows,
  groupDisciplineReviews,
  type DisciplineReviewBucket,
  type DisciplineReviewRow,
} from '../lib/reviewDisciplineList'
import './PermitWorkflowPage.css'
import './ReviewStatusPage.css'

function statusTone(bucket: DisciplineReviewBucket): string {
  switch (bucket) {
    case 'corrections':
      return 'reviewStatusPill--danger'
    case 'follow-up':
      return 'reviewStatusPill--warn'
    case 'in-review':
      return 'reviewStatusPill--active'
    case 'waiting':
      return 'reviewStatusPill--queue'
    case 'approved':
      return 'reviewStatusPill--ok'
    case 'skipped':
      return 'reviewStatusPill--muted'
    default:
      return 'reviewStatusPill--other'
  }
}

function ReviewSnapshotHero({ emphasis, headline }: { emphasis: ReviewEmphasis; headline: string }) {
  const HeroIcon = REVIEW_SNAPSHOT_HERO_ICON[emphasis]
  return (
    <section
      className={`card workflowReviewsHero workflowReviewsHero--${emphasis}`}
      aria-label={`Review summary: ${headline}`}
    >
      <div className="workflowReviewsHeroHeader">
        <span className="workflowReviewsHeroIconWrap" aria-hidden="true">
          <HeroIcon className="workflowReviewsHeroIcon" size={26} strokeWidth={2} />
        </span>
        <div className="workflowReviewsHeroText">
          <h2 className="workflowReviewsHeroHeadline">{headline}</h2>
        </div>
      </div>
    </section>
  )
}

function DisciplineTable({ rows }: { rows: DisciplineReviewRow[] }) {
  if (!rows.length) return null
  return (
    <div className="reviewDisciplineTableWrap">
      <table className="reviewDisciplineTable">
        <thead>
          <tr>
            <th scope="col">Review area</th>
            <th scope="col">Status</th>
            <th scope="col">Cycle</th>
            <th scope="col">Last update</th>
            <th scope="col">Assigned</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.discipline}>
              <td>
                <span className="reviewDisciplineName">{r.discipline}</span>
                {r.isPendingSummary ? (
                  <span
                    className="reviewPendingTag"
                    title="SDCI summary still marks this review as pending — event log may update first."
                  >
                    Pending
                  </span>
                ) : null}
              </td>
              <td>
                <span className={`reviewStatusPill ${statusTone(r.bucket)}`}>{r.latestStatus}</span>
              </td>
              <td>{r.reviewCycle != null ? r.reviewCycle : '—'}</td>
              <td>{r.latestDate ? formatPortalDate(r.latestDate) : '—'}</td>
              <td className="reviewAssignedCell">{r.assignedTo || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReviewSkippedCollapsible({ rows }: { rows: DisciplineReviewRow[] }) {
  const [open, setOpen] = useState(false)

  return (
    <details className="card reviewSkippedDetails" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="reviewSkippedSummary">
        <div className="reviewSkippedSummaryMain">
          <div className="reviewSectionHead reviewSkippedSummaryHead">
            <h2 className="cardTitle" id="review-skipped-heading">
              <ShieldCheck size={18} aria-hidden className="reviewSkippedIcon" />
              Not required / deferred
              <span className="reviewSectionCount reviewSectionCount--muted">{rows.length}</span>
            </h2>
          </div>
          <span className="reviewSkippedExpandCue">
            <span className="reviewSkippedExpandCueLabel">{open ? 'Collapse' : 'Expand'}</span>
            <ChevronDown size={18} strokeWidth={2.25} className="reviewSkippedChevron" />
          </span>
        </div>
      </summary>
      <DisciplineTable rows={rows} />
    </details>
  )
}

function ReviewSection({
  id,
  title,
  rows,
  tone,
}: {
  id: string
  title: string
  rows: DisciplineReviewRow[]
  tone?: 'corrections'
}) {
  if (!rows.length) return null
  const toneClass = tone === 'corrections' ? ' reviewSection--corrections' : ''
  return (
    <section className={`card reviewSection${toneClass}`} aria-labelledby={`${id}-title`}>
      <div className="reviewSectionHead">
        <h2 className="cardTitle" id={`${id}-title`}>
          {title}
          <span className="reviewSectionCount">{rows.length}</span>
        </h2>
      </div>
      <DisciplineTable rows={rows} />
    </section>
  )
}

export function ReviewStatusPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const recordParam = params.get('record')?.trim() ?? ''
  const state = usePermitRecordLoad(recordParam || null)

  const grouped = useMemo(() => {
    if (state.status !== 'ready') return null
    const rows = buildDisciplineReviewRows(state.data)
    return groupDisciplineReviews(rows)
  }, [state])

  const overview = useMemo(() => {
    if (state.status !== 'ready') return null
    return buildReviewOverview(state.data)
  }, [state])

  if (!recordParam) {
    return <Navigate to="/" replace />
  }

  const workflowBack = `/permit-workflow/${encodeURIComponent(recordParam)}`

  const showPageTitleBar = state.status !== 'ready'

  return (
    <div className="page pageStack reviewStatusPage">
      {showPageTitleBar ? (
        <div className="pageHeader">
          <div>
            <h1 className="h1">Review status</h1>
          </div>
        </div>
      ) : null}

      {state.status === 'loading' ? <RecordLoadScreen recordNumber={state.recordNumber} mode="reviews" /> : null}

      {state.status === 'error' ? (
        <section className="card workflowError">
          <div className="cardTitle">Couldn’t load record</div>
          <div className="muted mt-sm">{state.message}</div>
          <div className="mt-lg rowGap">
            <button className="commandButton" type="button" onClick={() => navigate('/')}>
              Back to search
            </button>
            <button className="commandButton" type="button" onClick={() => navigate(0)}>
              Retry
            </button>
          </div>
        </section>
      ) : null}

      {state.status === 'ready' && grouped && overview ? (
        <div className="workflowFadeIn">
          <h1 className="sr-only">Review status</h1>
          <header className="reviewStatusIntro">
            <div className="reviewStatusIntroNav">
              <Link className="reviewBackWorkflow" to={workflowBack}>
                <ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
                <span>Permit workflow</span>
              </Link>
            </div>
            <div className="reviewStatusIntroMain">
              <div className="recordHeading reviewStatusRecordTitle">Record: {state.data.recordNumber}</div>
              <div className="addressRow reviewStatusAddressRow">
                <span className="addressIcon" aria-hidden="true">
                  <MapPin size={18} />
                </span>
                <span className="reviewRecordAddress">{state.data.portal?.address ?? 'Address not available'}</span>
              </div>
              <div className="reviewStatusCycleBlock">
                <span className="workflowMetaLabel">Review cycle</span>
                <p className="workflowMetaValue reviewStatusCycleValue">
                  {overview.reviewCycle != null ? overview.reviewCycle : '—'}
                </p>
              </div>
            </div>
          </header>

          <ReviewSnapshotHero emphasis={overview.emphasis} headline={overview.headline} />

          <ReviewSection id="corr" title="Corrections required" rows={grouped.corrections} tone="corrections" />

          <ReviewSection id="follow" title="Follow-up cycle" rows={grouped.followUp} />

          <ReviewSection id="progress" title="In progress" rows={grouped.inProgress} />

          <ReviewSection id="approved" title="Approved or completed" rows={grouped.approved} />

          <ReviewSection id="other" title="Other statuses" rows={grouped.other} />

          {grouped.skipped.length ? (
            <ReviewSkippedCollapsible key={recordParam} rows={grouped.skipped} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
