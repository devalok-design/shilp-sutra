'use client'

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
 * <ColorSwatch color="rgba(0,0,0,0.5)" checkerboard copyable />
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
  /** Render as a button that copies the color string to clipboard on click */
  copyable?: boolean
  /** Show a checkerboard pattern behind the color — useful for transparent colors */
  checkerboard?: boolean
}

const ColorSwatch = React.forwardRef<HTMLSpanElement, ColorSwatchProps>(
  ({ color, size = 'md', shape = 'circle', ring = false, copyable = false, checkerboard = false, className, style, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false)
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    React.useEffect(() => () => clearTimeout(timerRef.current), [])

    const sharedClasses = cn(
      'inline-block shrink-0 relative',
      sizeMap[size],
      shapeMap[shape],
      ring && 'shadow-ring-sm',
      copyable && 'cursor-pointer',
      className,
    )

    const checkerboardStyle: React.CSSProperties = checkerboard
      ? {
          backgroundImage: `repeating-conic-gradient(var(--color-neutral-5) 0% 25%, transparent 0% 50%)`,
          backgroundSize: '8px 8px',
        }
      : {}

    const colorOverlayStyle: React.CSSProperties = {
      backgroundColor: color,
      ...style,
    }

    function handleCopy() {
      navigator.clipboard.writeText(color).then(() => {
        setCopied(true)
        timerRef.current = setTimeout(() => setCopied(false), 1500)
      })
    }

    const inner = checkerboard ? (
      <>
        <span
          className={cn('absolute inset-0', shapeMap[shape])}
          style={checkerboardStyle}
          aria-hidden="true"
        />
        <span
          className={cn('absolute inset-0', shapeMap[shape])}
          style={colorOverlayStyle}
        />
      </>
    ) : null

    if (copyable) {
      return (
        <button
          type="button"
          ref={ref as React.Ref<HTMLButtonElement>}
          className={sharedClasses}
          style={checkerboard ? {} : colorOverlayStyle}
          onClick={handleCopy}
          aria-label={`Copy color ${color}`}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {inner}
          {copied && (
            <span
              role="status"
              className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-ds-sm bg-surface-overlay px-1.5 py-0.5 text-[10px] font-sans text-surface-fg shadow-floating"
            >
              Copied!
            </span>
          )}
        </button>
      )
    }

    return (
      <span
        ref={ref}
        className={sharedClasses}
        style={checkerboard ? {} : colorOverlayStyle}
        role="presentation"
        {...props}
      >
        {inner}
      </span>
    )
  },
)
ColorSwatch.displayName = 'ColorSwatch'

export { ColorSwatch }
