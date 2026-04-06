'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  IconCircleCheck,
  IconCircle,
  IconCircleX,
} from '@tabler/icons-react'
import { Icon } from '../../ui/icon'
import { cn } from '../../ui/lib/utils'
import { Skeleton } from '../../ui/skeleton'
import { useMotion } from '../../motion/motion-provider'
import type { BlockComponentProps, LoadingBlockData, ProcessingStep } from '../types'

/** Spinning indicator for active steps */
function StepSpinner() {
  return (
    <motion.span
      className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent text-accent-9"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      aria-hidden="true"
      data-testid="step-spinner"
    />
  )
}

/** Icon for a processing step based on its status */
function StepIcon({ status }: { status: ProcessingStep['status'] }) {
  switch (status) {
    case 'done':
      return (
        <span data-testid="step-icon-done">
          <Icon icon={IconCircleCheck} size="sm" className="text-success-11" />
        </span>
      )
    case 'active':
      return <StepSpinner />
    case 'error':
      return (
        <span data-testid="step-icon-error">
          <Icon icon={IconCircleX} size="sm" className="text-error-11" />
        </span>
      )
    case 'pending':
    default:
      return (
        <span data-testid="step-icon-pending">
          <Icon icon={IconCircle} size="sm" className="text-surface-fg-subtle opacity-50" />
        </span>
      )
  }
}

const LoadingBlock = React.memo(function LoadingBlock({
  data,
}: BlockComponentProps<LoadingBlockData>) {
  const { reducedMotion } = useMotion()
  const isReduced = reducedMotion

  // Mode A: Skeleton lines
  if (data.lines != null) {
    const lineCount = Math.max(1, data.lines)
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading"
        className="flex flex-col gap-2"
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <Skeleton
            key={i}
            animation="shimmer"
            className={cn(
              'h-4',
              i === lineCount - 1 ? 'w-3/5' : 'w-full',
            )}
          />
        ))}
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  // Mode B: Processing steps
  if (data.steps) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Processing"
        className="flex flex-col gap-2"
      >
        {data.steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center gap-2"
            initial={isReduced ? undefined : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              isReduced
                ? { duration: 0 }
                : { duration: 0.2, delay: index * 0.06 }
            }
          >
            <StepIcon status={step.status} />
            <span
              className={cn(
                'text-ds-sm',
                step.status === 'done' || step.status === 'active'
                  ? 'text-surface-fg'
                  : 'text-surface-fg-subtle',
              )}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
        <span className="sr-only">Processing</span>
      </div>
    )
  }

  // Fallback: empty status container
  return (
    <div role="status" aria-busy="true" aria-label="Loading">
      <span className="sr-only">Loading</span>
    </div>
  )
})

LoadingBlock.displayName = 'LoadingBlock'

export { LoadingBlock }
