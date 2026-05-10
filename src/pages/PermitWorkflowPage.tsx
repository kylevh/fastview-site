import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CircleDot, MapPin } from 'lucide-react'
import { RecordLoadScreen } from '../components/RecordLoadScreen'
import { formatPortalDate } from '../lib/recordDerived'
import { buildReviewOverview, type ReviewOverview } from '../lib/reviewOverview'
import { REVIEW_SNAPSHOT_HERO_ICON } from '../lib/reviewSnapshotHeroIcon'
import type { PermitRecordView, WorkflowStageRow } from '../lib/recordApi'
import { usePermitRecordLoad } from '../lib/usePermitRecordLoad'
import './PermitWorkflowPage.css'

/** Visual lane from portal JSON: complete → blue, current → brighter blue, future → grey. */
function toneFromParsedStage(stage: WorkflowStageRow): 'complete' | 'active' | 'pending' {
  if (stage.isComplete) return 'complete'
  if (stage.isActive) return 'active'
  return 'pending'
}

function stageStatusPhrase(tone: 'complete' | 'active' | 'pending') {
  if (tone === 'complete') return 'Completed'
  if (tone === 'active') return 'Current stage'
  return 'Upcoming'
}

/** True when this record is in the Reviews workflow stage (portal stage name + timeline). */
function isReviewsPhaseActive(data: PermitRecordView): boolean {
  const stage = data.summary.currentStage.trim().toLowerCase()
  if (stage === 'reviews') return true
  const reviewsRow = data.parsed.workflowStages.find((s) => s.name.trim().toLowerCase() === 'reviews')
  return reviewsRow?.isActive === true
}

/** Secondary line under the stage name: updates when this stage’s portal events change or when workflow advances. */
function recordStatusSubtext(data: PermitRecordView): string | null {
  const stages = data.parsed.workflowStages
  const activeIdx = stages.findIndex((s) => s.isActive)
  const active = activeIdx >= 0 ? stages[activeIdx] : undefined

  if (active?.events?.length) {
    const dated = active.events.filter((e): e is typeof e & { date: string } => Boolean(e.date && String(e.date).trim()))
    if (dated.length) {
      dated.sort((a, b) => String(b.date).localeCompare(String(a.date)))
      const ev = dated[0]
      return `Latest SDCI activity · ${ev.status} · ${formatPortalDate(ev.date)}`
    }
  }

  const nextName = activeIdx >= 0 ? stages[activeIdx + 1]?.name : undefined
  if (nextName) {
    return `Next in workflow · ${nextName}`
  }

  return null
}

function PermitRecordStatusBar({ data }: { data: PermitRecordView }) {
  const { summary } = data
  const cycleLabel =
    summary.currentReviewCycle != null ? String(summary.currentReviewCycle) : '—'
  const detailLine = recordStatusSubtext(data)

  return (
    <section
      className="card workflowRecordStatusBar"
      aria-label={`Current SDCI workflow stage: ${summary.currentStage}`}
    >
      <div className="workflowRecordStatusBarLead">
        <div className="workflowRecordStatusBarKicker">
          <span className="workflowRecordStatusBarEyebrow">Current SDCI workflow stage</span>
          <span className="workflowRecordStatusLiveBadge">
            <CircleDot className="workflowRecordStatusLiveDot" size={15} strokeWidth={2.25} aria-hidden />
            Active now
          </span>
        </div>
        <p className="workflowRecordStatusBarStage">{summary.currentStage}</p>
        {detailLine ? <p className="workflowRecordStatusBarHint muted">{detailLine}</p> : null}
      </div>
      <div className="workflowRecordStatusBarCycle">
        <span className="workflowMetaLabel">Review cycle</span>
        <p className="workflowMetaValue workflowRecordStatusBarCycleValue">{cycleLabel}</p>
      </div>
    </section>
  )
}

function PermitReviewsOverviewCard({
  overview,
  reviewHref,
  inReviewsPhase,
}: {
  overview: ReviewOverview
  reviewHref: string
  inReviewsPhase: boolean
}) {
  const HeroIcon = REVIEW_SNAPSHOT_HERO_ICON[overview.emphasis]

  return (
    <section
      className={`card workflowReviewsHero workflowReviewsHero--${overview.emphasis} ${
        inReviewsPhase ? 'workflowReviewsHero--phaseActive' : ''
      }`}
      aria-label={`Review status: ${overview.headline}`}
    >
      <div className="workflowReviewsHeroHeader">
        <span className="workflowReviewsHeroIconWrap" aria-hidden="true">
          <HeroIcon className="workflowReviewsHeroIcon" size={26} strokeWidth={2} />
        </span>
        <div className="workflowReviewsHeroText">
          <h2 className="workflowReviewsHeroHeadline">{overview.headline}</h2>
          {overview.detailLine ? (
            <p className="workflowReviewsHeroDetail muted">{overview.detailLine}</p>
          ) : null}
        </div>
      </div>
      <Link className="workflowReviewsHeroCta" to={reviewHref}>
        <span className="workflowReviewsHeroCtaLabel">Review details</span>
        <ArrowRight size={22} aria-hidden="true" />
      </Link>
    </section>
  )
}

function PermitWorkflowDiagram({ data }: { data: PermitRecordView }) {
  const stages = data.parsed.workflowStages

  return (
    <div className="workflowDiagram workflowDiagram--compact">
      <ol className="workflowTimeline" aria-label="SDCI workflow stages">
        {stages.map((stage, index) => {
          const tone = toneFromParsedStage(stage)
          const statusPhrase = stageStatusPhrase(tone)

          return (
            <li
              key={stage.name}
              className={`workflowTimelineStep workflowStage-${tone}`}
              aria-current={tone === 'active' ? 'step' : undefined}
            >
              <div className="workflowTimelineRail" aria-hidden="true">
                <div className={`workflowTimelineMarker workflowTimelineMarker-${tone}`}>
                  {tone === 'complete' ? (
                    <Check className="workflowTimelineMarkIcon" strokeWidth={2.75} aria-hidden />
                  ) : tone === 'active' ? (
                    <span className="workflowTimelineMarkPulse" />
                  ) : (
                    <span className="workflowTimelineMarkPending" />
                  )}
                </div>
                {index < stages.length - 1 ? (
                  <div
                    className={`workflowTimelineSeg ${stage.isComplete ? 'workflowTimelineSeg-done' : ''}`}
                  />
                ) : null}
              </div>
              <div className="workflowTimelineBody">
                <div className="workflowTimelinePanel">
                  <span className="workflowTimelineMeta">{statusPhrase}</span>
                  <span className="workflowTimelineLabel">{stage.name}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function PermitWorkflowPage() {
  const { recordNumber } = useParams()
  const navigate = useNavigate()
  const state = usePermitRecordLoad(recordNumber)

  if (!recordNumber) {
    return <Navigate to="/" replace />
  }

  const reviewHref = `/review-status?record=${encodeURIComponent(recordNumber)}`

  return (
    <div className="page pageStack workflowDashboardPage">
      {state.status === 'loading' ? <RecordLoadScreen recordNumber={state.recordNumber} mode="workflow" /> : null}

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

      {state.status === 'ready' ? (
        <div className="workflowFadeIn">
          <div className="workflowBackRow">
            <button className="backToDashboard" type="button" onClick={() => navigate('/')} aria-label="Back to search">
              <ArrowLeft size={18} aria-hidden="true" />
              Search
            </button>
          </div>

          <div>
            <div className="recordHeading">Record: {state.data.recordNumber}</div>
            <div className="addressRow">
              <span className="addressIcon" aria-hidden="true">
                <MapPin size={18} />
              </span>
              <span>{state.data.portal?.address ?? 'Address not available'}</span>
            </div>
          </div>

          <PermitRecordStatusBar data={state.data} />

          <div className="workflowDashboardGrid">
            <section className="card workflowRecordPanel">
              <div className="cardTitle">Workflow overview</div>
              <PermitWorkflowDiagram data={state.data} />
            </section>
            <div className="workflowReviewsColumn">
              <PermitReviewsOverviewCard
                overview={buildReviewOverview(state.data)}
                reviewHref={reviewHref}
                inReviewsPhase={isReviewsPhaseActive(state.data)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
