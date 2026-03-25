'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' seed='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`

export type GrainIntensity = 'subtle' | 'medium' | 'heavy'

const NOISE_OPACITY = {
  subtle: { solid: 0.15, soft: 0.12 },
  medium: { solid: 0.28, soft: 0.22 },
  heavy:  { solid: 0.45, soft: 0.35 },
} as const

const GRADIENT = {
  subtle: { ld: 0.06, ll: 0.08, dk: 0.08 },
  medium: { ld: 0.10, ll: 0.12, dk: 0.12 },
  heavy:  { ld: 0.16, ll: 0.18, dk: 0.18 },
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
  /**
   * Animate the grain entrance (fade in on mount). Default: false
   * When true, the grain fades in over 600ms with a slight scale for a natural reveal.
   */
  animated?: boolean
  /**
   * Increase grain visibility on parent hover. Default: false
   * When the parent element is hovered, the noise opacity increases by ~40%
   * and the gradient deepens slightly, creating a tactile "pressing into paper" feel.
   * Requires the parent to have a `group` class for `group-hover:` to work.
   */
  hoverIntensify?: boolean
  /**
   * Tint color for the directional gradient. Accepts any CSS color value.
   * The gradient goes from a darker shade of this color to a lighter shade.
   * Default: neutral black-to-white wash.
   *
   * @example
   * // Warm pink tint (Devalok brand)
   * <DevalokGrain tint="oklch(0.55 0.19 360)" />
   *
   * // Cool blue tint
   * <DevalokGrain tint="oklch(0.55 0.12 240)" />
   *
   * // Use a CSS variable
   * <DevalokGrain tint="var(--color-accent-9)" />
   */
  tint?: string
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
  tint,
  animated = false,
  hoverIntensify = false,
}: DevalokGrainProps) {
  const prefersReduced = useReducedMotion()
  const noise = NOISE_OPACITY[intensity][surface]
  const hoverNoise = Math.min(noise * 1.4, 0.6) // 40% more on hover, capped
  const g = GRADIENT[intensity]

  const lightGradient = tint
    ? `linear-gradient(135deg, color-mix(in oklch, ${tint} ${Math.round(g.ld * 100)}%, transparent), color-mix(in oklch, white ${Math.round(g.ll * 100)}%, transparent))`
    : `linear-gradient(135deg, oklch(0 0 0 / ${g.ld}), oklch(1 0 0 / ${g.ll}))`
  const darkGradient = tint
    ? `linear-gradient(135deg, transparent, color-mix(in oklch, ${tint} ${Math.round(g.dk * 100)}%, transparent))`
    : `linear-gradient(135deg, transparent, oklch(0 0 0 / ${g.dk}))`

  const shouldAnimate = animated && !prefersReduced

  const Wrapper = shouldAnimate ? motion.span : 'span'
  const wrapperProps = shouldAnimate
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.6, ease: [0.2, 0, 0.38, 0.9] },
      }
    : {}

  return (
    <Wrapper
      data-grain=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] isolate overflow-hidden"
      {...(wrapperProps as any)}
    >
      {/* Gradient — light mode */}
      <span
        className={`absolute inset-0 dark:hidden transition-opacity duration-300 ${
          hoverIntensify ? 'group-hover:opacity-100 opacity-80' : ''
        }`}
        style={{ background: lightGradient }}
      />
      {/* Gradient — dark mode */}
      <span
        className={`absolute inset-0 hidden dark:block transition-opacity duration-300 ${
          hoverIntensify ? 'group-hover:opacity-100 opacity-80' : ''
        }`}
        style={{ background: darkGradient }}
      />
      {/* Noise texture */}
      <span
        className={`absolute inset-0 transition-opacity duration-300 ${
          hoverIntensify ? 'group-hover:opacity-[var(--grain-hover-opacity)]' : ''
        }`}
        style={{
          backgroundImage: NOISE_SVG,
          backgroundSize: '100px 100px',
          filter: 'contrast(250%) brightness(105%)',
          opacity: noise,
          '--grain-hover-opacity': hoverIntensify ? hoverNoise : undefined,
        } as React.CSSProperties}
      />
      {/* Sheen — inner highlight */}
      {sheen && (
        <span className="absolute inset-0 shadow-raised-inner" />
      )}
    </Wrapper>
  )
}

DevalokGrain.displayName = 'DevalokGrain'
