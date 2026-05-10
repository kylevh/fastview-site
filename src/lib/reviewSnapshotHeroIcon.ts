import { AlertTriangle, CheckCircle, ClipboardList, type LucideIcon } from 'lucide-react'
import type { ReviewEmphasis } from './reviewOverview'

/** Lucide icon for the review snapshot hero (stable component references; do not call as functions). */
export const REVIEW_SNAPSHOT_HERO_ICON: Record<ReviewEmphasis, LucideIcon> = {
  corrections: AlertTriangle,
  'follow-up': AlertTriangle,
  'in-review': ClipboardList,
  waiting: ClipboardList,
  clear: CheckCircle,
}
