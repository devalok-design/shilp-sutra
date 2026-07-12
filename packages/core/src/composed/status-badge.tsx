'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'

import { Badge } from '../ui/badge'
import { Dot, type DotColor } from '../ui/dot'
import type { IconInput } from '../ui/lib/icon-input'
import { motionProps } from '../ui/lib/motion'

/**
 * Domain work-statuses → the shared intent colour used by both the Badge pill
 * and the leading Dot. StatusBadge is a thin semantic wrapper: it owns the
 * status vocabulary and composes `<Badge>` + `<Dot>` rather than re-styling a pill.
 */
type StatusKey =
  | 'active' | 'pending' | 'approved' | 'rejected' | 'completed'
  | 'blocked' | 'in-progress' | 'review' | 'cancelled' | 'draft'

// Intent colours shared by Badge + Dot (never 'current' — that's a Badge-internal mode).
type IntentColor = Exclude<DotColor, 'current'>

const STATUS_TO_COLOR: Record<StatusKey, IntentColor> = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  pending: 'warning',
  rejected: 'error',
  blocked: 'error',
  'in-progress': 'accent',
  review: 'info',
  cancelled: 'neutral',
  draft: 'neutral',
}

type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface StatusBadgeBaseProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  label?: string
  hideDot?: boolean
  size?: 'sm' | 'md'
  onClick?: () => void
  /** Trailing icon. When omitted on a clickable badge, a chevron is shown. */
  icon?: IconInput
}

interface StatusBadgeWithStatus extends StatusBadgeBaseProps {
  status?: StatusKey
  color?: never
}

interface StatusBadgeWithColor extends StatusBadgeBaseProps {
  status?: never
  color: StatusColor
}

export type StatusBadgeProps = StatusBadgeWithStatus | StatusBadgeWithColor

/* Between durations.moderate02 (0.24) and slow01 (0.4) — smooth status morph. */
const statusMorphTransition = { duration: 0.3, ease: 'easeOut' as const }

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const StatusBadge = React.forwardRef<HTMLElement, StatusBadgeProps>(
  ({ status, color, size = 'md', label, hideDot = false, onClick, icon, className, ...props }, ref) => {
    // A `color` wins if given; otherwise derive from `status` (default 'pending').
    const key = color ?? status ?? 'pending'
    const dotColor: IntentColor = color ?? STATUS_TO_COLOR[(status ?? 'pending') as StatusKey]
    const displayLabel = label ?? titleCase(color ?? status ?? 'pending').replace('-', ' ')
    const isClickable = onClick != null

    // Trailing: an explicit icon, else a chevron for clickable badges.
    const endIcon: IconInput | undefined = icon ?? (isClickable ? IconChevronDown : undefined)

    return (
      <AnimatePresence mode="wait">
        <motion.span
          key={key}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.6, scale: 0.95 }}
          transition={statusMorphTransition}
          className="inline-flex"
          {...motionProps(props)}
        >
          <Badge
            ref={ref}
            variant="soft"
            color={dotColor}
            size={size}
            onClick={onClick}
            startIcon={!hideDot ? <Dot color={dotColor} size="sm" /> : undefined}
            endIcon={endIcon}
            className={className}
          >
            {displayLabel}
          </Badge>
        </motion.span>
      </AnimatePresence>
    )
  },
)
StatusBadge.displayName = 'StatusBadge'

export { StatusBadge }
