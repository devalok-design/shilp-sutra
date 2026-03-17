'use client'

/**
 * DevadootIcon -- Animated Devalok chakra for the AI command system.
 *
 * Renders the Devalok chakra SVG with state-based animations:
 * - idle: subtle slow rotation (breathing feel)
 * - processing: pulsing scale + faster rotation + glow
 * - responded: static with a gentle pop
 * - error: red tint + shake
 */
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { useMotion } from '../motion/motion-provider'

export type DevadootState = 'idle' | 'processing' | 'responded' | 'error'

export interface DevadootIconProps {
  state?: DevadootState
  size?: number
  className?: string
}

// Devalok chakra SVG path — the brand's signature shape
const CHAKRA_PATH =
  'M25.97,21.39c-0.9-1.85,0.08-3.95-1.72-5.39c1.76-1.44,0.8-3.55,1.69-5.39c0.05-0.12,0.04-0.25-0.02-0.35c-0.06-0.1-0.16-0.18-0.29-0.19c-2.05-0.15-3.35-2.04-5.5-1.21c-0.39-2.21-2.7-2.44-3.84-4.13c-0.08-0.1-0.19-0.16-0.31-0.16c-0.12,0-0.23,0.05-0.31,0.16c-1.14,1.69-3.43,1.92-3.82,4.13c-2.14-0.83-3.47,1.07-5.52,1.21c-0.13,0.01-0.23,0.09-0.29,0.19c-0.06,0.1-0.07,0.23-0.02,0.35c0.9,1.85-0.08,3.95,1.72,5.39c-1.76,1.44-0.8,3.55-1.69,5.39C6,21.51,6.02,21.64,6.07,21.74c0.06,0.1,0.16,0.18,0.29,0.19c2.05,0.15,3.38,2.06,5.52,1.23c0.39,2.21,2.67,2.43,3.82,4.12c0.08,0.1,0.19,0.16,0.31,0.16c0.12,0,0.23-0.05,0.31-0.16c1.14-1.69,3.42-1.92,3.81-4.13c2.14,0.83,3.48-1.07,5.53-1.22c0.13-0.01,0.23-0.09,0.29-0.19C26.01,21.64,26.02,21.51,25.97,21.39z'

const DevadootIcon = React.memo(function DevadootIcon({
  state = 'idle',
  size = 20,
  className,
}: DevadootIconProps) {
  const { reducedMotion } = useMotion()

  if (reducedMotion) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={cn(
          state === 'error' ? 'text-error-9' : 'text-accent-9',
          className,
        )}
        aria-hidden="true"
      >
        <path d={CHAKRA_PATH} fill="currentColor" />
      </svg>
    )
  }

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Glow ring — visible during processing */}
      <AnimatePresence>
        {state === 'processing' && (
          <motion.span
            className="absolute inset-0 rounded-full bg-accent-9/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* Chakra SVG */}
      <motion.svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={cn(
          state === 'error' ? 'text-error-9' : 'text-accent-9',
        )}
        // Idle: very slow continuous rotation (meditative)
        // Processing: faster rotation + pulsing scale
        // Responded: gentle pop then settle
        // Error: shake
        animate={
          state === 'idle'
            ? { rotate: 360, scale: 1 }
            : state === 'processing'
              ? { rotate: 360, scale: [1, 1.12, 1] }
              : state === 'responded'
                ? { rotate: 0, scale: [1.15, 1] }
                : { rotate: 0, x: [0, -3, 3, -2, 2, 0], scale: 1 }
        }
        transition={
          state === 'idle'
            ? { rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 0 } }
            : state === 'processing'
              ? {
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                }
              : state === 'responded'
                ? { rotate: { duration: 0 }, scale: { type: 'spring', stiffness: 400, damping: 15 } }
                : { rotate: { duration: 0 }, x: { duration: 0.4, ease: 'easeOut' }, scale: { duration: 0 } }
        }
      >
        <path d={CHAKRA_PATH} fill="currentColor" />
      </motion.svg>
    </span>
  )
})

DevadootIcon.displayName = 'DevadootIcon'

export { DevadootIcon }
