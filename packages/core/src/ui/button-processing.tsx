'use client'

import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'

// ── Types ──────────────────────────────────────────────────────────

export type ProcessingSpeed = 'ambient' | 'working' | 'urgent'
export type ProcessingStyleType = 'ants' | 'glow'

export interface ProcessingOverlayProps {
  active: boolean
  speed: ProcessingSpeed
  style: ProcessingStyleType
  /** Resolved color name — maps to CSS token `--color-{name}-9` */
  color: string
}

// ── Color mapping ──────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  accent:  'var(--color-accent-9)',
  error:   'var(--color-error-9)',
  success: 'var(--color-success-9)',
  warning: 'var(--color-warning-9)',
  neutral: 'var(--color-neutral-9)',
}

// ── Animation class mapping ────────────────────────────────────────

const ANTS_ANIMATION: Record<ProcessingSpeed, string> = {
  ambient: 'animate-processing-ants-ambient',
  working: 'animate-processing-ants-working',
  urgent:  'animate-processing-ants-urgent',
}

const GLOW_ANIMATION: Record<ProcessingSpeed, string> = {
  ambient: 'animate-processing-glow-ambient',
  working: 'animate-processing-glow-working',
  urgent:  'animate-processing-glow-urgent',
}

// ── Component ──────────────────────────────────────────────────────

/**
 * Internal overlay component for button processing state.
 * Renders either a rotating conic-gradient border ("ants") or a breathing
 * box-shadow ("glow"). Not exported from the barrel — used only by Button.
 */
export function ProcessingOverlay({ active, speed, style, color }: ProcessingOverlayProps) {
  const solidColor = COLOR_MAP[color] ?? COLOR_MAP.accent

  if (style === 'glow') {
    return <GlowOverlay active={active} speed={speed} color={solidColor} />
  }
  return <AntsOverlay active={active} speed={speed} color={solidColor} />
}

// ── Ants (rotating conic-gradient border) ──────────────────────────

function AntsOverlay({
  active,
  speed,
  color,
}: {
  active: boolean
  speed: ProcessingSpeed
  color: string
}) {
  // Reduced motion: detect via media query
  const prefersReduced = useReducedMotion()

  return (
    <AnimatePresence>
      {active && (
        <motion.span
          key="processing-ants"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          className={`absolute inset-[-1.5px] z-[3] rounded-[inherit] pointer-events-none ${
            prefersReduced ? '' : ANTS_ANIMATION[speed]
          }`}
          style={
            prefersReduced
              ? {
                  // Static dashed border fallback
                  border: `1.5px dashed ${color}`,
                }
              : {
                  // Conic gradient rotated by --border-angle (animated via CSS @property)
                  background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, transparent 60%, ${color})`,
                  // Mask to a 1.5px border ring
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1.5px',
                }
          }
        />
      )}
    </AnimatePresence>
  )
}

// ── Glow (breathing box-shadow) ────────────────────────────────────

function GlowOverlay({
  active,
  speed,
  color,
}: {
  active: boolean
  speed: ProcessingSpeed
  color: string
}) {
  const prefersReduced = useReducedMotion()

  // The glow color at 25% opacity for the box-shadow keyframes
  const glowColor = `color-mix(in oklch, ${color} 25%, transparent)`

  return (
    <AnimatePresence>
      {active && (
        <motion.span
          key="processing-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
          aria-hidden="true"
          className={`absolute inset-0 z-[3] rounded-[inherit] pointer-events-none ${
            prefersReduced ? '' : GLOW_ANIMATION[speed]
          }`}
          style={{
            '--processing-glow-color': glowColor,
            ...(prefersReduced
              ? {
                  // Static subtle shadow fallback
                  boxShadow: `0 0 4px 1px ${glowColor}`,
                }
              : {}),
          } as React.CSSProperties}
        />
      )}
    </AnimatePresence>
  )
}

// ── Reduced motion hook ────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}
