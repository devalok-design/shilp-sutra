'use client'

import * as React from 'react'
import { Badge } from './badge'
import type { BadgeProps } from './badge'
import { AnimatePresence } from 'framer-motion'

/**
 * @deprecated Use `<Badge onClick={...}>` instead of `<Chip>`.
 * This wrapper maps the old Chip API (label prop) to Badge (children).
 */
interface ChipProps extends Omit<BadgeProps, 'children'> {
  label: string
  icon?: React.ReactElement | null
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  ({ label, icon, ...props }, ref) => (
    <Badge ref={ref} startIcon={icon ?? undefined} {...props}>
      {label}
    </Badge>
  ),
)
Chip.displayName = 'Chip'

/**
 * @deprecated Use `<Badge.Group>` for overflow. For exit animations, wrap in `<AnimatePresence>`.
 */
const ChipGroup = AnimatePresence

export { Chip, ChipGroup }
export type { ChipProps }
