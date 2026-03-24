'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { springs, tweens } from './lib/motion'
import { cn } from './lib/utils'
import { Spinner } from './spinner'
import { useIconContext, type IconSize, type IconStroke } from './icon-context'

/** Icon size tier → pixel dimensions */
const SIZE_PX: Record<IconSize, number> = {
  xs: 14, sm: 16, md: 18, lg: 20, xl: 24, '2xl': 32,
}

/** Stroke weight → strokeWidth per size tier (lighter strokes on smaller icons) */
const STROKE_MAP: Record<IconStroke, Record<IconSize, number>> = {
  light:   { xs: 1.25, sm: 1.5, md: 1.5, lg: 1.75, xl: 2,    '2xl': 2 },
  regular: { xs: 1.5,  sm: 2,   md: 2,   lg: 2,    xl: 2,    '2xl': 2.25 },
  bold:    { xs: 2,    sm: 2.5, md: 2.5, lg: 2.5,  xl: 2.5,  '2xl': 2.5 },
}

/** Props accepted by Tabler icon components (and most SVG icon libraries) */
type IconComponentProps = Partial<Omit<React.ComponentPropsWithoutRef<'svg'>, 'stroke'>> & {
  size?: string | number
  stroke?: string | number
  title?: string
}

const ANIMATION_PRESETS = {
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' as const },
  },
  pulse: {
    animate: { scale: [1, 1.15, 1] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
  bounce: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const ICON_TO_SPINNER_SIZE: Record<IconSize, 'sm' | 'md' | 'lg'> = {
  xs: 'sm', sm: 'sm', md: 'md', lg: 'md', xl: 'lg', '2xl': 'lg',
}

export interface IconProps {
  /** The Tabler icon component (or any ForwardRef SVG icon component) */
  icon: React.ForwardRefExoticComponent<IconComponentProps & React.RefAttributes<SVGSVGElement>>
  /** Size tier — reads from IconContext if not set */
  size?: IconSize
  /** Stroke weight — reads from IconContext if not set */
  stroke?: IconStroke
  /** Accessible label — renders <title> + sets aria-label. Without this, icon is aria-hidden. */
  label?: string
  /** Preset animation or controlled motion. 'none' disables inherited animation. */
  animate?: 'spin' | 'pulse' | 'bounce' | 'none' | { rotate?: number; scale?: number }
  /**
   * State machine for loading→success/error transitions. Delegates to Spinner (bare variant).
   *
   * **Priority rule:** If both `state` and `animate` are set, `state` wins —
   * the state machine check runs first and short-circuits rendering.
   */
  state?: 'idle' | 'loading' | 'success' | 'error'
  className?: string
}

/**
 * Icon — context-aware wrapper for Tabler icons with standardized sizing,
 * stroke weights, accessibility, animation presets, and loading state machine.
 *
 * Reads size and stroke from IconContext (provided by Button, IconGroup, etc.).
 * Explicit props always override context.
 *
 * **Priority rule:** If both `state` and `animate` are set, `state` wins.
 *
 * @example
 * <Icon icon={IconPlus} />                           // md size, regular stroke
 * <Icon icon={IconPlus} size="xs" stroke="light" />  // 14px, stroke 1.25
 * <Icon icon={IconPlus} label="Add item" />           // accessible, not decorative
 * <Icon icon={IconPlus} animate="spin" />             // continuous rotation
 * <Icon icon={IconPlus} animate="pulse" />            // scale pulse
 * <Icon icon={IconPlus} state="loading" />            // bare spinner
 * <Icon icon={IconPlus} state="success" />            // animated checkmark
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: TablerIcon, size, stroke, label, animate, state, className }, ref) => {
    const ctx = useIconContext()
    const resolvedSize = size ?? ctx.size ?? 'md'
    const resolvedStroke = stroke ?? ctx.stroke ?? 'regular'
    const px = SIZE_PX[resolvedSize]
    const sw = STROKE_MAP[resolvedStroke][resolvedSize]
    const prefersReduced = useReducedMotion()

    // ── State machine (priority: state > animate) ──────────────────────
    if (state && state !== 'idle') {
      const spinnerSize = ICON_TO_SPINNER_SIZE[resolvedSize]
      const spinnerState = state === 'loading' ? 'spinning' : state
      return (
        <AnimatePresence mode="wait">
          <motion.span
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={tweens.fade}
            className="inline-flex"
          >
            <Spinner size={spinnerSize} state={spinnerState} variant="bare" />
          </motion.span>
        </AnimatePresence>
      )
    }

    // ── Determine animation ────────────────────────────────────────────
    const animatePreset =
      typeof animate === 'string' && animate !== 'none'
        ? ANIMATION_PRESETS[animate as keyof typeof ANIMATION_PRESETS]
        : null
    const animateObject =
      typeof animate === 'object' && animate !== null && (animate.rotate !== undefined || animate.scale !== undefined)
        ? animate
        : null

    if (prefersReduced || (!animatePreset && !animateObject)) {
      // Static render (no animation or reduced motion)
      return label ? (
        <TablerIcon ref={ref as any} size={px} stroke={sw} className={className} title={label} aria-label={label} role="img" />
      ) : (
        <TablerIcon ref={ref as any} size={px} stroke={sw} className={className} aria-hidden="true" />
      )
    }

    // ── Animated render ────────────────────────────────────────────────
    const motionProps = animatePreset ?? {
      animate: animateObject!,
      transition: springs.snappy,
    }

    const iconEl = label ? (
      <TablerIcon size={px} stroke={sw} title={label} aria-label={label} role="img" />
    ) : (
      <TablerIcon size={px} stroke={sw} aria-hidden="true" />
    )

    return (
      <motion.span
        ref={ref as any}
        className={cn('inline-flex', className)}
        {...motionProps}
      >
        {iconEl}
      </motion.span>
    )
  },
)
Icon.displayName = 'Icon'
