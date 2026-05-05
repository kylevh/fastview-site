export type PermitStage =
  | 'Application'
  | 'Intake'
  | 'Review'
  | 'Corrections'
  | 'Issuance'
  | 'Closed'

export type ReviewStatus = 'Not started' | 'In review' | 'Corrections' | 'Complete'

export type PermitOverview = {
  recordNumber: string
  projectName: string
  address: string
  type: string
  applicant: string
  stage: PermitStage
  stageUpdatedAt: string
}

export type ReviewRow = {
  department: string
  reviewer: string
  status: ReviewStatus
  updatedAt: string
}

export type PermitDetails = {
  overview: PermitOverview
  timeline: { stage: PermitStage; status: 'complete' | 'current' | 'upcoming' }[]
  reviews: ReviewRow[]
}

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function getPermitDetails(recordNumber: string): PermitDetails {
  const normalized = recordNumber.trim()
  const isDemo = normalized.toUpperCase().includes('DEMO')

  const overview: PermitOverview = {
    recordNumber: normalized,
    projectName: isDemo ? 'Residential Demo' : 'Tenant Improvement',
    address: isDemo ? '1234 Example Ave, Seattle, WA' : '455 Pine St, Seattle, WA',
    type: isDemo ? 'Demolition permit' : 'Construction permit',
    applicant: 'Example Applicant LLC',
    stage: 'Review',
    stageUpdatedAt: isoDaysAgo(3),
  }

  const timeline: PermitDetails['timeline'] = [
    { stage: 'Application', status: 'complete' },
    { stage: 'Intake', status: 'complete' },
    { stage: 'Review', status: 'current' },
    { stage: 'Corrections', status: 'upcoming' },
    { stage: 'Issuance', status: 'upcoming' },
  ]

  const reviews: ReviewRow[] = [
    { department: 'Fire', reviewer: 'J. Smith', status: 'Corrections', updatedAt: isoDaysAgo(2) },
    { department: 'Drainage', reviewer: 'A. Patel', status: 'In review', updatedAt: isoDaysAgo(5) },
    { department: 'Transportation', reviewer: 'M. Chen', status: 'Complete', updatedAt: isoDaysAgo(7) },
    { department: 'City Light', reviewer: '—', status: 'Not started', updatedAt: isoDaysAgo(10) },
  ]

  return { overview, timeline, reviews }
}

export function statusToChipClass(status: ReviewStatus) {
  if (status === 'Complete') return 'chip chipOk'
  if (status === 'Corrections') return 'chip chipWarn'
  return 'chip chipNeutral'
}

export function stageToChip(stage: PermitStage) {
  if (stage === 'Issuance' || stage === 'Closed') return { label: stage, className: 'chip chipOk' }
  if (stage === 'Corrections') return { label: stage, className: 'chip chipWarn' }
  if (stage === 'Review') return { label: stage, className: 'chip chipNeutral' }
  return { label: stage, className: 'chip chipNeutral' }
}

