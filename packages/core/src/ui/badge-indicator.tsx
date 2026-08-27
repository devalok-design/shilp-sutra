'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { springs } from './lib/motion'
import { cn } from './lib/utils'

const PLACEMENT_CLASSES = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
} as const

/** The five palettes this indicator offers. Colour itself is a role. */
const COLOR_NAMES = ['error', 'success', 'warning', 'accent', 'info'] as const

/** One line for every palette — the hue comes from `data-palette`. */
const COLOR_CLASSES = 'bg-palette-solid text-palette-fg'

export interface BadgeIndicatorProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  count?: number
  max?: number
  dot?: boolean
  /** Palette name. Any registered palette works, not just these five. */
  color?: (typeof COLOR_NAMES)[number] | (string & {})
  invisible?: boolean
  showZero?: boolean
  placement?: keyof typeof PLACEMENT_CLASSES
  children: React.ReactNode
}

export const BadgeIndicator = React.forwardRef<HTMLSpanElement, BadgeIndicatorProps>(
  function BadgeIndicator(
    {
      count,
      max = 99,
      dot = false,
      color = 'error',
      invisible = false,
      showZero = false,
      placement = 'top-right',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const prefersReduced = useReducedMotion()
    const show = !invisible && (dot || (count !== undefined && (count > 0 || showZero)))
    const displayCount = count !== undefined && count > max ? `${max}+` : count

    return (
      <span ref={ref} className={cn('relative inline-flex', className)} {...rest}>
        {children}
      <AnimatePresence>
        {show && (
          <motion.span
            key="indicator"
            initial={prefersReduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={springs.smooth}
            data-palette={color}
            className={cn(
              'absolute flex items-center justify-center rounded-pill font-sans font-semibold ring-2 ring-surface-panel',
              COLOR_CLASSES,
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
})

BadgeIndicator.displayName = 'BadgeIndicator'
