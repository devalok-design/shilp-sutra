'use client'

import * as React from 'react'
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
  /** State machine for loading→success/error transitions. Delegates to Spinner. */
  state?: 'idle' | 'loading' | 'success' | 'error'
  className?: string
}

/**
 * Icon — context-aware wrapper for Tabler icons with standardized sizing,
 * stroke weights, and accessibility.
 *
 * Reads size and stroke from IconContext (provided by Button, IconGroup, etc.).
 * Explicit props always override context.
 *
 * @example
 * <Icon icon={IconPlus} />                           // md size, regular stroke
 * <Icon icon={IconPlus} size="xs" stroke="light" />  // 14px, stroke 1.25
 * <Icon icon={IconPlus} label="Add item" />           // accessible, not decorative
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: TablerIcon, size, stroke, label, animate, state, className }, ref) => {
    const ctx = useIconContext()
    const resolvedSize = size ?? ctx.size ?? 'md'
    const resolvedStroke = stroke ?? ctx.stroke ?? 'regular'
    const px = SIZE_PX[resolvedSize]
    const sw = STROKE_MAP[resolvedStroke][resolvedSize]

    // Animation and state machine will be added in Task 3.
    // ref will be attached to the animation wrapper; for now pass to the SVG icon.

    if (label) {
      return (
        <TablerIcon
          ref={ref}
          size={px}
          stroke={sw}
          className={className}
          title={label}
          aria-label={label}
          role="img"
        />
      )
    }

    return (
      <TablerIcon
        ref={ref}
        size={px}
        stroke={sw}
        className={className}
        aria-hidden="true"
      />
    )
  },
)
Icon.displayName = 'Icon'
