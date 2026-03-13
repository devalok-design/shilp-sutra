'use client'

import type { Transition } from 'framer-motion'

// ── Spring configs (spatial: position, scale, size, rotation) ──

export const springs = {
  /** Micro-interactions: buttons, hover, form inputs */
  snappy: { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 } as Transition,
  /** Dialogs, sheets, panels, navigation */
  smooth: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as Transition,
  /** Toasts, pop-ins, celebration feedback */
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.5 } as Transition,
  /** Collapse/expand, accordion, height changes */
  gentle: { type: 'spring', stiffness: 200, damping: 25, mass: 0.8 } as Transition,
} as const

// ── Tween configs (non-spatial: opacity, color, background) ──

export const tweens = {
  /** Opacity enter/exit */
  fade: { type: 'tween', duration: 0.15, ease: 'easeOut' } as Transition,
  /** Hover color, bg, border transitions */
  colorShift: { type: 'tween', duration: 0.1, ease: 'easeOut' } as Transition,
} as const

// ── Stagger helper ──

export function stagger(delay = 0.04) {
  return {
    visible: { transition: { staggerChildren: delay } },
    hidden: { transition: { staggerChildren: delay } },
  }
}

// ── Reduced motion helper ──

export function withReducedMotion(transition: Transition): Transition {
  return { ...transition, duration: 0 }
}

// ── Preset types ──

export type SpringPreset = keyof typeof springs
export type TweenPreset = keyof typeof tweens
