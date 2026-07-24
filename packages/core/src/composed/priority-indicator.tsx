import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconMinus,
} from '@tabler/icons-react'
import * as React from 'react'

import { Badge, type BadgeColor, type BadgeProps } from '../ui/badge'
import type { IconInput } from '../ui/lib/icon-input'

export type Priority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

/**
 * Severity is conveyed by **icon + color + weight**, never motion. URGENT uses
 * a solid fill so the top tier reads at a glance without any animation
 * (matches Linear/Jira; also removes the prior WCAG 2.2.2 infinite-pulse issue).
 */
const priorityConfig: Record<
  'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  { icon: IconInput; color: BadgeColor; variant: NonNullable<BadgeProps['variant']>; label: string }
> = {
  LOW: { icon: IconArrowDown, color: 'slate', variant: 'soft', label: 'Low' },
  MEDIUM: { icon: IconMinus, color: 'warning', variant: 'soft', label: 'Medium' },
  HIGH: { icon: IconArrowUp, color: 'error', variant: 'soft', label: 'High' },
  URGENT: { icon: IconAlertTriangle, color: 'error', variant: 'solid', label: 'Urgent' },
}

export interface PriorityIndicatorProps extends React.HTMLAttributes<HTMLElement> {
  priority: Priority
  /** Render an icon-only chip (no visible text). Set an accessible name is handled automatically. */
  iconOnly?: boolean
  /**
   * @deprecated Use `iconOnly`. `'compact'` → icon-only, `'full'` → labeled.
   * Accepted for back-compat; maps to `iconOnly`.
   */
  display?: 'compact' | 'full'
  /** Override the label text (i18n / custom copy). Defaults to the priority name. */
  children?: React.ReactNode
}

/**
 * Presentational priority chip — composes `Badge` so radius, color semantics,
 * a11y labeling, and reduced-motion handling come from one place.
 */
const PriorityIndicator = React.forwardRef<HTMLElement, PriorityIndicatorProps>(
  ({ priority, iconOnly, display, children, ...props }, ref) => {
    const key = priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    // Defensive fallback: an unexpected priority string renders as MEDIUM
    // rather than throwing on `config.icon`.
    const config = priorityConfig[key] ?? priorityConfig.MEDIUM
    const compact = iconOnly ?? display === 'compact'
    const label = children ?? config.label

    if (compact) {
      return (
        <Badge
          ref={ref}
          {...props}
          variant={config.variant}
          color={config.color}
          size="sm"
          startIcon={config.icon}
          role="img"
          aria-label={typeof label === 'string' ? label : config.label}
        />
      )
    }

    return (
      <Badge
        ref={ref}
        {...props}
        variant={config.variant}
        color={config.color}
        size="sm"
        startIcon={config.icon}
      >
        {label}
      </Badge>
    )
  },
)
PriorityIndicator.displayName = 'PriorityIndicator'

export { PriorityIndicator }
