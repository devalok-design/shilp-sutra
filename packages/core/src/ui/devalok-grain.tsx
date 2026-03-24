'use client'

import * as React from 'react'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' seed='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`

export type GrainIntensity = 'subtle' | 'medium' | 'heavy'

const NOISE_OPACITY = {
  subtle: { solid: 0.20, soft: 0.14 },
  medium: { solid: 0.35, soft: 0.22 },
  heavy:  { solid: 0.55, soft: 0.35 },
} as const

const GRADIENT = {
  subtle: { ld: 0.12, ll: 0.15, dk: 0.15 },
  medium: { ld: 0.18, ll: 0.20, dk: 0.22 },
  heavy:  { ld: 0.25, ll: 0.28, dk: 0.30 },
} as const

export interface DevalokGrainProps {
  /** Grain intensity level. Default: 'subtle' */
  intensity?: GrainIntensity
  /**
   * Surface type hint — affects noise opacity.
   * 'solid' for filled backgrounds (higher opacity).
   * 'soft' for tinted/muted backgrounds (lower opacity).
   * Default: 'solid'
   */
  surface?: 'solid' | 'soft'
  /**
   * Add an inner highlight (top-lit emboss) for a premium 3D feel.
   * Adds an inset shadow: light highlight on top edge, dark shadow on bottom edge.
   * Works best on solid variant buttons. Default: false
   */
  sheen?: boolean
}

/**
 * DevalokGrain — Brand texture that adds a subtle noise grain + directional gradient
 * to any surface. The Devalok signature: warm, tactile, paper-like.
 *
 * Drop as a child of any element that has `relative overflow-hidden isolate`.
 * The grain layers are absolute-positioned at z-[1] and use `rounded-[inherit]`
 * to match the parent's border-radius.
 *
 * @example
 * // Inside a Button (Button already has relative/overflow-hidden/isolate):
 * <Button>
 *   <DevalokGrain />
 *   Save changes
 * </Button>
 *
 * @example
 * // Inside a Card:
 * <Card className="relative overflow-hidden isolate">
 *   <DevalokGrain surface="soft" />
 *   Card content
 * </Card>
 *
 * @example
 * // Heavier grain for a hero section:
 * <div className="relative overflow-hidden isolate rounded-ds-lg bg-accent-9 p-8">
 *   <DevalokGrain intensity="heavy" />
 *   <h1 className="relative z-[2]">Hero</h1>
 * </div>
 */
export function DevalokGrain({
  intensity = 'subtle',
  surface = 'solid',
  sheen = false,
}: DevalokGrainProps) {
  const noise = NOISE_OPACITY[intensity][surface]
  const g = GRADIENT[intensity]

  return (
    <span
      data-grain=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] isolate overflow-hidden"
    >
      {/* Gradient — light mode */}
      <span
        className="absolute inset-0 dark:hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0 0 0 / ${g.ld}), oklch(1 0 0 / ${g.ll}))`,
        }}
      />
      {/* Gradient — dark mode */}
      <span
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `linear-gradient(135deg, transparent, oklch(0 0 0 / ${g.dk}))`,
        }}
      />
      {/* Noise texture — blend mode is contained within this isolate wrapper */}
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundSize: '100px 100px',
          mixBlendMode: 'hard-light' as const,
          filter: 'contrast(250%) brightness(130%)',
          opacity: noise,
        }}
      />
      {/* Sheen — inner highlight */}
      {sheen && (
        <span className="absolute inset-0 shadow-raised-inner" />
      )}
    </span>
  )
}

DevalokGrain.displayName = 'DevalokGrain'
