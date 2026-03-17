'use client'

/**
 * DevadootIcon -- Animated Devalok chakra for the AI command system.
 *
 * Renders the Devalok chakra SVG with **fill-first** animations:
 * - idle: gradient color breathing (pink ↔ rose, slow cycle)
 * - processing: gradient sweep (pink → purple → blue → pink cycle) + glow pulse
 * - responded: bright flash → settle to solid brand + brief scale pop
 * - error: red fill + glow pulse
 *
 * Inspired by Google Gemini's gradient-as-identity approach: the color IS
 * the animation, not just rotation/scale applied to a static shape.
 */
import * as React from 'react'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { useMotion } from '../motion/motion-provider'

export type DevadootState = 'idle' | 'processing' | 'responded' | 'error'

export interface DevadootIconProps {
  state?: DevadootState
  size?: number
  className?: string
}

// Devalok chakra SVG path
const CHAKRA_PATH =
  'M25.97,21.39c-0.9-1.85,0.08-3.95-1.72-5.39c1.76-1.44,0.8-3.55,1.69-5.39c0.05-0.12,0.04-0.25-0.02-0.35c-0.06-0.1-0.16-0.18-0.29-0.19c-2.05-0.15-3.35-2.04-5.5-1.21c-0.39-2.21-2.7-2.44-3.84-4.13c-0.08-0.1-0.19-0.16-0.31-0.16c-0.12,0-0.23,0.05-0.31,0.16c-1.14,1.69-3.43,1.92-3.82,4.13c-2.14-0.83-3.47,1.07-5.52,1.21c-0.13,0.01-0.23,0.09-0.29,0.19c-0.06,0.1-0.07,0.23-0.02,0.35c0.9,1.85-0.08,3.95,1.72,5.39c-1.76,1.44-0.8,3.55-1.69,5.39C6,21.51,6.02,21.64,6.07,21.74c0.06,0.1,0.16,0.18,0.29,0.19c2.05,0.15,3.38,2.06,5.52,1.23c0.39,2.21,2.67,2.43,3.82,4.12c0.08,0.1,0.19,0.16,0.31,0.16c0.12,0,0.23-0.05,0.31-0.16c1.14-1.69,3.42-1.92,3.81-4.13c2.14,0.83,3.48-1.07,5.53-1.22c0.13-0.01,0.23-0.09,0.29-0.19C26.01,21.64,26.02,21.51,25.97,21.39z'

// Brand colors
const BRAND_PINK = '#D33163'
const BRAND_ROSE = '#E8457A'
const BRAND_PURPLE = '#9B5DE5'
const BRAND_BLUE = '#00BBF9'
const BRAND_BRIGHT = '#FF6B9D'
const ERROR_RED = '#E5383B'

/**
 * Gradient rotation driver — animates the angle of the SVG gradient.
 * This creates the "sweep" effect: colors appear to flow across the shape.
 */
function useGradientRotation(state: DevadootState) {
  const angle = useMotionValue(0)

  React.useEffect(() => {
    const controls = animate(angle, 360, {
      duration: state === 'processing' ? 2 : 8,
      repeat: Infinity,
      ease: 'linear',
    })
    return () => controls.stop()
  }, [angle, state])

  return useTransform(angle, (v) => `rotate(${v}, 16, 16)`)
}

const DevadootIcon = React.memo(function DevadootIcon({
  state = 'idle',
  size = 20,
  className,
}: DevadootIconProps) {
  const { reducedMotion } = useMotion()
  const gradientRotation = useGradientRotation(state)
  const gradientId = React.useId()
  const filterId = React.useId()

  // Static fallback for reduced motion
  if (reducedMotion) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <path
          d={CHAKRA_PATH}
          fill={state === 'error' ? ERROR_RED : BRAND_PINK}
        />
      </svg>
    )
  }

  // Resolve gradient stop colors based on state
  const stops =
    state === 'error'
      ? { s1: ERROR_RED, s2: '#FF6B6B', s3: ERROR_RED }
      : state === 'processing'
        ? { s1: BRAND_PINK, s2: BRAND_PURPLE, s3: BRAND_BLUE }
        : state === 'responded'
          ? { s1: BRAND_BRIGHT, s2: BRAND_PINK, s3: BRAND_BRIGHT }
          : { s1: BRAND_PINK, s2: BRAND_ROSE, s3: BRAND_PINK }

  // Glow blur intensity
  const glowBlur = state === 'processing' ? 3 : state === 'error' ? 2.5 : 0

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        // Responded: brief pop. Error: shake. Others: no transform.
        animate={
          state === 'responded'
            ? { scale: [1.18, 1] }
            : state === 'error'
              ? { x: [0, -2, 2, -1.5, 1.5, 0] }
              : { scale: 1, x: 0 }
        }
        transition={
          state === 'responded'
            ? { scale: { type: 'spring', stiffness: 500, damping: 15 } }
            : state === 'error'
              ? { x: { duration: 0.4 } }
              : { duration: 0.3 }
        }
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Animated gradient — colors + rotation create the sweep */}
          <motion.linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
            gradientTransform={gradientRotation}
          >
            <motion.stop
              offset="0%"
              animate={{ stopColor: stops.s1 }}
              transition={{ duration: state === 'processing' ? 1.5 : 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
            <motion.stop
              offset="50%"
              animate={{ stopColor: stops.s2 }}
              transition={{ duration: state === 'processing' ? 1.5 : 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: stops.s3 }}
              transition={{ duration: state === 'processing' ? 1.5 : 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.6 }}
            />
          </motion.linearGradient>

          {/* Glow filter — blur applied to shadow layer */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <motion.feGaussianBlur
              in="SourceGraphic"
              animate={{ stdDeviation: glowBlur }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </filter>
        </defs>

        {/* Layer 1: Glow shadow (blurred, semi-transparent copy behind) */}
        <AnimatePresence>
          {(state === 'processing' || state === 'error') && (
            <motion.path
              d={CHAKRA_PATH}
              fill={`url(#${gradientId})`}
              filter={`url(#${filterId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          )}
        </AnimatePresence>

        {/* Layer 2: Shimmer highlight (bright overlay that pulses) */}
        <AnimatePresence>
          {state === 'processing' && (
            <motion.path
              d={CHAKRA_PATH}
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          )}
        </AnimatePresence>

        {/* Layer 3: Main shape — gradient fill */}
        <motion.path
          d={CHAKRA_PATH}
          fill={`url(#${gradientId})`}
          // Responded: brief bright flash via fill override
          animate={
            state === 'responded'
              ? { fill: [`url(#${gradientId})`, `url(#${gradientId})`] }
              : {}
          }
        />
      </motion.svg>
    </span>
  )
})

DevadootIcon.displayName = 'DevadootIcon'

export { DevadootIcon }
