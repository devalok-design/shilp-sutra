import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import monogramBrand from '../assets/devalok/logos/monogram-brand.png'
import monogramBlack from '../assets/devalok/logos/monogram-black.png'
import monogramWhite from '../assets/devalok/logos/monogram-white.png'
import monogramWordmarkBrand from '../assets/devalok/logos/monogram-wordmark-brand.png'
import monogramWordmarkBlack from '../assets/devalok/logos/monogram-wordmark-black.png'
import monogramWordmarkWhite from '../assets/devalok/logos/monogram-wordmark-white.png'
import monogramShellBrand from '../assets/devalok/logos/monogram-shell-brand.png'
import monogramShellBlack from '../assets/devalok/logos/monogram-shell-black.png'
import monogramShellWhite from '../assets/devalok/logos/monogram-shell-white.png'
import monogramShellWordmarkBrand from '../assets/devalok/logos/monogram-shell-wordmark-brand.png'
import monogramShellWordmarkBlack from '../assets/devalok/logos/monogram-shell-wordmark-black.png'
import monogramShellWordmarkWhite from '../assets/devalok/logos/monogram-shell-wordmark-white.png'
import monogramCoinWordmarkBrand from '../assets/devalok/logos/monogram-coin-wordmark-brand.png'
import monogramCoinWordmarkBlack from '../assets/devalok/logos/monogram-coin-wordmark-black.png'
import monogramCoinWordmarkWhite from '../assets/devalok/logos/monogram-coin-wordmark-white.png'
import shlokaBrand from '../assets/devalok/logos/shloka-brand.png'
import shlokaBlack from '../assets/devalok/logos/shloka-black.png'
import shlokaWhite from '../assets/devalok/logos/shloka-white.png'

// --- Types ---

const logoTypes = [
  'monogram',
  'monogram-wordmark',
  'monogram-shell',
  'monogram-shell-wordmark',
  'monogram-coin-wordmark',
  'wordmark',
  'dass',
  'shloka',
  'chakra',
] as const

export type DevalokLogoType = (typeof logoTypes)[number]
export type DevalokLogoColor = 'brand' | 'black' | 'white' | 'auto'
export type DevalokLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DevalokLogoProps {
  /** Logo composition type */
  type?: DevalokLogoType
  /** Color variant. "auto" switches between brand (light) and white (dark). */
  color?: DevalokLogoColor
  /** Predefined size */
  size?: DevalokLogoSize
  /** Below this pixel width, complex types auto-simplify to monogram. Set 0 to disable. */
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

const sizeMap: Record<DevalokLogoSize, string> = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-20 w-auto',
}

const pxMap: Record<DevalokLogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

// --- SVG Registration (for inline-able types: wordmark, dass) ---

type SvgComponent = React.ForwardRefExoticComponent<
  React.SVGAttributes<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
>

const svgComponents: Record<string, SvgComponent> = {}

/** Register an inline SVG component for a given type-color combination */
export function _registerSvg(key: string, component: SvgComponent) {
  svgComponents[key] = component
}

// --- Static asset types (large PNGs served as <img>) ---

const staticTypes = new Set<DevalokLogoType>([
  'monogram',
  'monogram-wordmark',
  'monogram-shell',
  'monogram-shell-wordmark',
  'monogram-coin-wordmark',
  'shloka',
])

const staticAssets: Record<string, string> = {
  'monogram-brand': monogramBrand,
  'monogram-black': monogramBlack,
  'monogram-white': monogramWhite,
  'monogram-wordmark-brand': monogramWordmarkBrand,
  'monogram-wordmark-black': monogramWordmarkBlack,
  'monogram-wordmark-white': monogramWordmarkWhite,
  'monogram-shell-brand': monogramShellBrand,
  'monogram-shell-black': monogramShellBlack,
  'monogram-shell-white': monogramShellWhite,
  'monogram-shell-wordmark-brand': monogramShellWordmarkBrand,
  'monogram-shell-wordmark-black': monogramShellWordmarkBlack,
  'monogram-shell-wordmark-white': monogramShellWordmarkWhite,
  'monogram-coin-wordmark-brand': monogramCoinWordmarkBrand,
  'monogram-coin-wordmark-black': monogramCoinWordmarkBlack,
  'monogram-coin-wordmark-white': monogramCoinWordmarkWhite,
  'shloka-brand': shlokaBrand,
  'shloka-black': shlokaBlack,
  'shloka-white': shlokaWhite,
}

function getStaticAssetPath(type: DevalokLogoType, color: string): string {
  return staticAssets[`${type}-${color}`] ?? ''
}

// --- Utility ---

function resolveColor(color: DevalokLogoColor): 'brand' | 'black' | 'white' {
  if (color !== 'auto') return color
  if (typeof document === 'undefined') return 'brand'
  return document.documentElement.classList.contains('dark') ? 'white' : 'brand'
}

function shouldSimplify(
  type: DevalokLogoType,
  size: DevalokLogoSize,
  simplifyBelow: number,
): boolean {
  if (simplifyBelow <= 0) return false
  if (type === 'monogram') return false
  return pxMap[size] < simplifyBelow
}

// --- Component ---

const DevalokLogo = React.forwardRef<HTMLElement, DevalokLogoProps>(
  (
    {
      type = 'monogram',
      color = 'auto',
      size = 'md',
      simplifyBelow = 32,
      className,
      role = 'img',
      'aria-label': ariaLabel = 'Devalok',
      'aria-hidden': ariaHidden,
      ...props
    },
    ref,
  ) => {
    const resolvedColor = resolveColor(color)
    const resolvedType = shouldSimplify(type, size, simplifyBelow)
      ? 'monogram'
      : type
    const key = `${resolvedType}-${resolvedColor}`
    const isDecorative = role === 'presentation' || ariaHidden === true

    if (staticTypes.has(resolvedType)) {
      // Large SVGs: render as <img>
      return (
        <img
          ref={ref as React.Ref<HTMLImageElement>}
          src={getStaticAssetPath(resolvedType, resolvedColor)}
          alt={isDecorative ? '' : ariaLabel}
          role={role}
          aria-label={isDecorative ? undefined : ariaLabel}
          aria-hidden={isDecorative ? true : undefined}
          className={cn(sizeMap[size], className)}
          draggable={false}
          {...props}
        />
      )
    }

    // Small SVGs: render inline React component
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
DevalokLogo.displayName = 'DevalokLogo'

// --- Compound: DevalokLogo.Link ---

export interface DevalokLogoLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

const DevalokLogoLink = React.forwardRef<
  HTMLAnchorElement,
  DevalokLogoLinkProps
>(
  (
    {
      children,
      'aria-label': ariaLabel = 'Devalok home',
      className,
      ...props
    },
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
DevalokLogoLink.displayName = 'DevalokLogoLink'

// Attach compound
const DevalokLogoCompound = DevalokLogo as typeof DevalokLogo & {
  Link: typeof DevalokLogoLink
}
DevalokLogoCompound.Link = DevalokLogoLink

export { DevalokLogoCompound as DevalokLogo, DevalokLogoLink }
