'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './lib/utils'
import { springs } from './lib/motion'

const PLACEMENT_CLASSES = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
} as const

const COLOR_CLASSES = {
  error: 'bg-error-9 text-error-fg',
  success: 'bg-success-9 text-success-fg',
  warning: 'bg-warning-9 text-warning-fg',
  accent: 'bg-accent-9 text-accent-fg',
  info: 'bg-info-9 text-info-fg',
} as const

export interface BadgeIndicatorProps {
  count?: number
  max?: number
  dot?: boolean
  color?: keyof typeof COLOR_CLASSES
  invisible?: boolean
  showZero?: boolean
  placement?: keyof typeof PLACEMENT_CLASSES
  className?: string
  children: React.ReactNode
}

export function BadgeIndicator({
  count,
  max = 99,
  dot = false,
  color = 'error',
  invisible = false,
  showZero = false,
  placement = 'top-right',
  className,
  children,
}: BadgeIndicatorProps) {
  const prefersReduced = useReducedMotion()
  const show = !invisible && (dot || (count !== undefined && (count > 0 || showZero)))
  const displayCount = count !== undefined && count > max ? `${max}+` : count

  return (
    <span className={cn('relative inline-flex', className)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            key="indicator"
            initial={prefersReduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={springs.bouncy}
            className={cn(
              'absolute flex items-center justify-center rounded-full font-sans font-semibold ring-2 ring-surface-raised',
              COLOR_CLASSES[color],
              PLACEMENT_CLASSES[placement],
              dot
                ? 'h-2.5 w-2.5'
                : 'min-w-[18px] h-[18px] px-1 text-[11px] leading-none',
            )}
          >
            {!dot && displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

BadgeIndicator.displayName = 'BadgeIndicator'
