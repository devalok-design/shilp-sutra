import * as React from 'react'
import { cn } from './lib/utils'

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
} as const

const shapeMap = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-ds-sm',
} as const

/**
 * A tiny color swatch for displaying dynamic runtime colors (e.g. brand colors from a database).
 *
 * @example
 * <ColorSwatch color="#FF5733" />
 * <ColorSwatch color={org.brandColor} size="lg" ring />
 */
export interface ColorSwatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Any valid CSS color string (hex, rgb, oklch, etc.) */
  color: string
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** @default 'circle' */
  shape?: 'circle' | 'square' | 'rounded'
  /** Show subtle ring border — useful for light colors that blend into the background */
  ring?: boolean
}

const ColorSwatch = React.forwardRef<HTMLSpanElement, ColorSwatchProps>(
  ({ color, size = 'md', shape = 'circle', ring = false, className, style, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-block shrink-0',
        sizeMap[size],
        shapeMap[shape],
        ring && 'shadow-ring-sm',
        className,
      )}
      style={{ backgroundColor: color, ...style }}
      role="presentation"
      {...props}
    />
  ),
)
ColorSwatch.displayName = 'ColorSwatch'

export { ColorSwatch }
