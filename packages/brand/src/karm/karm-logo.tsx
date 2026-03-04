'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { getKarmSvgComponents } from './svg-components'

// --- Types ---

export type KarmLogoType = 'icon' | 'wordmark' | 'wordmark-icon'
export type KarmLogoColor = 'brand' | 'black' | 'white' | 'auto'
export type KarmLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface KarmLogoProps {
  /** Logo type */
  type?: KarmLogoType
  /** Color variant. "auto" switches between brand (light) and white (dark). */
  color?: KarmLogoColor
  /** Predefined size */
  size?: KarmLogoSize
  /** Below this pixel width, complex types auto-simplify to icon. Set 0 to disable. */
  simplifyBelow?: number
  /** Accessible label */
  'aria-label'?: string
  /** Set to true for decorative usage */
  'aria-hidden'?: boolean
  /** ARIA role */
  role?: string
  /** Additional CSS class */
  className?: string
}

const sizeMap: Record<KarmLogoSize, string> = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-20 w-auto',
}

const pxMap: Record<KarmLogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

// --- SVG lookup ---

type SvgComponent = React.ForwardRefExoticComponent<
  React.SVGAttributes<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
>

const svgComponents: Record<string, SvgComponent> = { ...getKarmSvgComponents() }

/** Register an additional inline SVG component for a given type-color combination */
export function _registerKarmSvg(key: string, component: SvgComponent) {
  svgComponents[key] = component
}

// --- Utility ---

function resolveColor(color: KarmLogoColor): 'brand' | 'black' | 'white' {
  if (color !== 'auto') return color
  if (typeof document === 'undefined') return 'brand'
  return document.documentElement.classList.contains('dark') ? 'white' : 'brand'
}

function shouldSimplify(
  type: KarmLogoType,
  size: KarmLogoSize,
  simplifyBelow: number,
): boolean {
  if (simplifyBelow <= 0) return false
  if (type === 'icon') return false
  return pxMap[size] < simplifyBelow
}

// --- Component ---

const KarmLogo = React.forwardRef<HTMLElement, KarmLogoProps>(
  (
    {
      type = 'icon',
      color = 'auto',
      size = 'md',
      simplifyBelow = 32,
      className,
      role = 'img',
      'aria-label': ariaLabel = 'Karm',
      'aria-hidden': ariaHidden,
      ...props
    },
    ref,
  ) => {
    const resolvedColor = resolveColor(color)
    const resolvedType = shouldSimplify(type, size, simplifyBelow)
      ? 'icon'
      : type
    const key = `${resolvedType}-${resolvedColor}`
    const isDecorative = role === 'presentation' || ariaHidden === true

    // All types are now inline SVGs
    const SvgComponent = svgComponents[key]

    if (!SvgComponent) {
      return null
    }

    return (
      <SvgComponent
        ref={ref as React.Ref<SVGSVGElement>}
        role={role}
        aria-label={isDecorative ? undefined : ariaLabel}
        aria-hidden={isDecorative ? true : undefined}
        focusable="false"
        className={cn(sizeMap[size], className)}
        {...props}
      />
    )
  },
)
KarmLogo.displayName = 'KarmLogo'

// --- Compound: KarmLogo.Link ---

export interface KarmLogoLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

const KarmLogoLink = React.forwardRef<HTMLAnchorElement, KarmLogoLinkProps>(
  (
    { children, 'aria-label': ariaLabel = 'Karm home', className, ...props },
    ref,
  ) => (
    <a
      ref={ref}
      aria-label={ariaLabel}
      className={cn('inline-flex items-center', className)}
      {...props}
    >
      {children}
    </a>
  ),
)
KarmLogoLink.displayName = 'KarmLogoLink'

const KarmLogoCompound = KarmLogo as typeof KarmLogo & {
  Link: typeof KarmLogoLink
}
KarmLogoCompound.Link = KarmLogoLink

export { KarmLogoCompound as KarmLogo, KarmLogoLink }
