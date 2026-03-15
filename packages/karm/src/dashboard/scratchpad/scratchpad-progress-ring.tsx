'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { motionProps } from '@/ui/lib/motion'
import { useScratchpad } from './scratchpad-context'

// ============================================================
// Types
// ============================================================

export interface ScratchpadProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ring diameter — sm: 16px, md: 20px */
  size?: 'sm' | 'md'
}

// ============================================================
// Constants
// ============================================================

const SIZES = {
  sm: { diameter: 16, stroke: 1.5, fontSize: '7px' },
  md: { diameter: 20, stroke: 2, fontSize: '8px' },
} as const

// ============================================================
// Component
// ============================================================

const ScratchpadProgressRing = React.forwardRef<HTMLDivElement, ScratchpadProgressRingProps>(
  function ScratchpadProgressRing({ size = 'md', className, ...props }, ref) {
    const { items, maxItems } = useScratchpad()

    const count = items.length
    const allDone = count > 0 && items.every((item) => item.done)

    const { diameter, stroke, fontSize } = SIZES[size]
    const radius = (diameter - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const progress = maxItems > 0 ? count / maxItems : 0
    const offset = circumference * (1 - progress)

    return (
      <motion.div
        ref={ref}
        className={cn('relative flex items-center justify-center', className)}
        animate={allDone ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
        {...motionProps(props)}
      >
        <svg
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          className="-rotate-90"
        >
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-surface-2"
          />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              'transition-all duration-300',
              allDone ? 'stroke-success-9' : 'stroke-accent-9',
            )}
          />
        </svg>
        <span
          className="absolute font-medium text-surface-fg-muted"
          style={{ fontSize }}
          data-testid="progress-count"
        >
          {count}/{maxItems}
        </span>
      </motion.div>
    )
  },
)

ScratchpadProgressRing.displayName = 'ScratchpadProgressRing'

export { ScratchpadProgressRing }
