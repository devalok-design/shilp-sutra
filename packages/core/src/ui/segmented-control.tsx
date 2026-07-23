'use client'

import { LayoutGroup,motion } from 'framer-motion'
import * as React from 'react'

import { IconProvider } from './icon-context'
import type { IconInput } from './lib/icon-input'
import { normalizeIcon } from './lib/normalize-icon'
import { cn } from './lib/utils'

/* ── Types ─────────────────────────────────────────────────── */

export type SegmentedControlSize = 'sm' | 'md' | 'lg'
export type SegmentedControlVariant = 'default' | 'solid'

export interface SegmentedControlOption {
  id: string
  text: string
  /** Optional icon rendered before the text label. Accepts any `IconInput`. */
  icon?: IconInput
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  size?: SegmentedControlSize
  variant?: SegmentedControlVariant
  options: SegmentedControlOption[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
}

/* ── Size config ───────────────────────────────────────────── */

const sizeConfig = {
  sm: { button: 'h-7 px-ds-04 text-body-sm', icon: 'h-3.5 w-3.5' },
  md: { button: 'h-8 px-ds-05 text-body-md', icon: 'h-4 w-4' },
  lg: { button: 'h-10 px-ds-06 text-body-md', icon: 'h-4 w-4' },
} as const

/* ── Pill styles per variant ───────────────────────────────── */

const pillStyles = {
  default: 'bg-surface-overlay shadow-raised',
  solid: 'bg-accent-9',
} as const

const selectedTextStyles = {
  default: 'text-surface-fg',
  solid: 'text-accent-fg',
} as const

/* ── Spring config (snappy, minimal overshoot) ─────────────── */
/* Intentionally softer than springs.snappy (500/30/0.5) for pill slide feel */

const pillSpring = { type: 'spring' as const, stiffness: 400, damping: 30 }

/* ── SegmentedControl ──────────────────────────────────────── */

const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      size = 'md',
      variant = 'default',
      options,
      selectedId,
      onSelect,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) {
    const instanceId = React.useId()
    const tablistRef = React.useRef<HTMLDivElement | null>(null)

    // Compose refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        tablistRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref],
    )

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      const currentIndex = options.findIndex((o) => o.id === selectedId)
      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
          break
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = options.length - 1
          break
        default:
          return
      }

      onSelect(options[nextIndex].id)
      requestAnimationFrame(() => {
        const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        buttons?.[nextIndex]?.focus()
      })
    }

    const { button: buttonSize, icon: iconSize } = sizeConfig[size]

    return (
      <div
        ref={mergedRef}
        role="radiogroup"
        tabIndex={-1}
        aria-label={props['aria-label'] ?? 'Segmented control'}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex p-[3px] rounded-pill',
          'bg-surface-raised-hover border border-surface-border-subtle shadow-inset',
          disabled && 'opacity-action-disabled pointer-events-none',
          className,
        )}
        {...props}
      >
        <LayoutGroup id={instanceId}>
          {options.map((option) => {
            const isSelected = option.id === selectedId

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                disabled={disabled}
                onClick={() => onSelect(option.id)}
                className={cn(
                  'relative inline-flex items-center justify-center gap-ds-02 rounded-pill',
                  'font-medium transition-colors duration-fast-02 ease-productive-standard',
                  'outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
                  buttonSize,
                  isSelected
                    ? selectedTextStyles[variant]
                    : 'text-surface-fg-muted hover:text-surface-fg',
                )}
              >
                {/* Sliding pill indicator */}
                {isSelected && (
                  <motion.span
                    layoutId="segment-pill"
                    className={cn(
                      'absolute inset-0 rounded-pill pointer-events-none',
                      pillStyles[variant],
                    )}
                    transition={pillSpring}
                  />
                )}

                {/* Content (above pill via z-index) */}
                {option.icon && (
                  <span className={cn('relative z-[1] shrink-0 inline-flex items-center justify-center', iconSize)}>
                    <IconProvider size={size === 'lg' ? 'sm' : 'xs'}>
                      {normalizeIcon(option.icon)}
                    </IconProvider>
                  </span>
                )}
                <span className="relative z-[1]">{option.text}</span>
              </button>
            )
          })}
        </LayoutGroup>
      </div>
    )
  },
)
SegmentedControl.displayName = 'SegmentedControl'

/* ── Exports ───────────────────────────────────────────────── */

export { SegmentedControl }
