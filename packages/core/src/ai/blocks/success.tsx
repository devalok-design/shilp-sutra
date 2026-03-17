'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../ui/lib/utils'
import { Alert } from '../../ui/alert'
import { Button } from '../../ui/button'
import { useMotion } from '../../motion/motion-provider'
import type { BlockComponentProps, SuccessBlockData } from '../types'

const DEFAULT_UNDO_TIMEOUT = 5000

const SuccessBlock = React.memo(function SuccessBlock({
  data,
  blockId,
  confidence,
  onAction,
}: BlockComponentProps<SuccessBlockData>) {
  const { reducedMotion } = useMotion()
  const isReduced = reducedMotion
  const undoTimeout = data.undoTimeout ?? DEFAULT_UNDO_TIMEOUT
  const [remaining, setRemaining] = React.useState(undoTimeout)
  const [showUndo, setShowUndo] = React.useState(!!data.undoable)

  React.useEffect(() => {
    if (!data.undoable) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 100
        if (next <= 0) {
          clearInterval(interval)
          setShowUndo(false)
          return 0
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [data.undoable, undoTimeout])

  const handleUndo = React.useCallback(() => {
    onAction?.(blockId || 'unknown', 'undo')
  }, [blockId, onAction])

  const remainingSeconds = Math.ceil(remaining / 1000)

  // Countdown ring dimensions
  const ringSize = 20
  const ringStroke = 2
  const ringRadius = (ringSize - ringStroke) / 2
  const ringCircumference = 2 * Math.PI * ringRadius

  return (
    <div
      className={cn(
        confidence === 'low' && 'border-l-2 border-warning-7 pl-3',
      )}
    >
      <Alert
        color="success"
        variant="subtle"
        title={data.title}
      >
        {data.message}
      </Alert>

      {showUndo && data.undoable && (
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            aria-label={`Undo action, ${remainingSeconds} seconds remaining`}
          >
            <span className="flex items-center gap-1.5">
              <svg
                width={ringSize}
                height={ringSize}
                viewBox={`0 0 ${ringSize} ${ringSize}`}
                className="shrink-0 -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={ringStroke}
                  opacity={0.2}
                />
                <motion.circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={ringStroke}
                  strokeDasharray={ringCircumference}
                  initial={isReduced ? undefined : { strokeDashoffset: 0 }}
                  animate={{
                    strokeDashoffset: ringCircumference,
                  }}
                  transition={
                    isReduced
                      ? { duration: 0 }
                      : {
                          duration: undoTimeout / 1000,
                          ease: 'linear',
                        }
                  }
                />
              </svg>
              Undo
            </span>
          </Button>
        </div>
      )}

      {/* Animated checkmark icon */}
      <svg
        viewBox="0 0 24 24"
        className="hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-testid="success-checkmark"
        aria-hidden="true"
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={isReduced ? undefined : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            isReduced
              ? { duration: 0 }
              : { duration: 0.4, ease: 'easeOut', delay: 0.1 }
          }
        />
      </svg>
    </div>
  )
})

export { SuccessBlock }
