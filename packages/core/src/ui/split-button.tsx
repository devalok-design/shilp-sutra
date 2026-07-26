'use client'

import { type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { buttonVariants } from './button'
import { cn } from './lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

// ── Types ───────────────────────────────────────────────────────

/**
 * Placement of the dropdown panel, in floating-ui's vocabulary.
 *
 * Declared here rather than imported from `@floating-ui/dom`: that package is
 * bundled into dist at runtime but is NOT a consumer dependency, so a type
 * import leaks an unresolvable specifier into the published .d.ts —
 * `error TS2307: Cannot find module '@floating-ui/dom'` for anyone type-checking
 * declarations. The union is stable and two lines; borrowing it is not worth an
 * install. (This component no longer calls floating-ui at all — see the Radix
 * Popover mapping below.)
 */
export type SplitButtonPlacement =
  | 'top' | 'right' | 'bottom' | 'left'
  | 'top-start' | 'top-end'
  | 'right-start' | 'right-end'
  | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end'

type SplitButtonVariant = 'solid' | 'soft' | 'outline'
type SplitButtonColor = NonNullable<VariantProps<typeof buttonVariants>['color']>
type SplitButtonSize = 'xs' | 'sm' | 'md' | 'icon-xs' | 'icon-sm' | 'icon-md'

export interface SplitButtonProps {
  /** Primary action content (left side). */
  children: React.ReactNode
  /** Primary click handler (left side). */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Content rendered inside the floating dropdown panel. */
  dropdownContent?: React.ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Called when open state changes. Uncontrolled if omitted. */
  onOpenChange?: (open: boolean) => void
  /** @default 'solid' */
  variant?: SplitButtonVariant
  /** @default 'accent' */
  color?: SplitButtonColor
  /** @default 'md' */
  size?: SplitButtonSize
  /** Disable both halves. */
  disabled?: boolean
  /** aria-label for the primary button. */
  'aria-label'?: string
  /** aria-label for the dropdown trigger. @default 'More options' */
  dropdownLabel?: string
  /** Custom icon for the dropdown trigger. Defaults to chevron-down. */
  dropdownIcon?: React.ReactNode
  /** Which side the dropdown trigger sits on. @default 'right' */
  triggerSide?: 'left' | 'right'
  /** Preferred placement for the dropdown panel. @default 'top-end' */
  placement?: SplitButtonPlacement
  /** Width of the trigger (chevron) half. @default 'auto' */
  triggerWidth?: number | string
  className?: string
}

// ── Styling maps ────────────────────────────────────────────────

const dividerColor: Record<SplitButtonVariant, Record<string, string>> = {
  solid: {
    accent: 'bg-accent-11/20', error: 'bg-error-11/20', success: 'bg-success-11/20',
    warning: 'bg-warning-11/20', info: 'bg-info-11/20', neutral: 'bg-neutral-8/30',
  },
  soft: {
    accent: 'bg-accent-6', error: 'bg-error-6', success: 'bg-success-6',
    warning: 'bg-warning-6', info: 'bg-info-6', neutral: 'bg-surface-border',
  },
  outline: {
    accent: 'bg-accent-7', error: 'bg-error-7', success: 'bg-success-7',
    warning: 'bg-warning-7', info: 'bg-info-7', neutral: 'bg-surface-border-strong',
  },
}

const heightClass: Record<SplitButtonSize, string> = {
  xs: 'h-ds-xs-plus', sm: 'h-ds-sm', md: 'h-ds-md',
  'icon-xs': 'h-ds-xs-plus', 'icon-sm': 'h-ds-sm', 'icon-md': 'h-ds-md',
}

const textClass: Record<SplitButtonSize, string> = {
  xs: 'text-body-sm', sm: 'text-body-sm', md: 'text-body-md',
  'icon-xs': 'text-body-sm', 'icon-sm': 'text-body-sm', 'icon-md': 'text-body-md',
}

const primaryPadding: Record<SplitButtonSize, string> = {
  xs: 'px-ds-03 gap-1', sm: 'px-ds-04 gap-1.5', md: 'px-ds-05 gap-2',
  'icon-xs': 'px-ds-02', 'icon-sm': 'px-ds-03', 'icon-md': 'px-ds-04',
}

const triggerPadding: Record<SplitButtonSize, string> = {
  xs: 'px-ds-02', sm: 'px-ds-02', md: 'px-ds-03',
  'icon-xs': 'px-ds-01', 'icon-sm': 'px-ds-02', 'icon-md': 'px-ds-02',
}

const radiusClass: Record<SplitButtonSize, string> = {
  xs: 'rounded-control', sm: 'rounded-control', md: 'rounded-control',
  'icon-xs': 'rounded-control', 'icon-sm': 'rounded-control', 'icon-md': 'rounded-control',
}

function getHalfClasses(variant: SplitButtonVariant, color: string): string {
  const map: Record<SplitButtonVariant, Record<string, string>> = {
    solid: {
      accent: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-11',
      error: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-11',
      success: 'bg-success-9 text-success-fg hover:bg-success-10 active:bg-success-11',
      warning: 'bg-warning-9 text-warning-fg hover:bg-warning-10 active:bg-warning-11',
      info: 'bg-info-9 text-info-fg hover:bg-info-10 active:bg-info-11',
      neutral: 'bg-neutral-5 text-surface-fg hover:bg-neutral-7 active:bg-neutral-8',
    },
    soft: {
      accent: 'bg-accent-3 text-accent-11 hover:bg-accent-4 active:bg-accent-5',
      error: 'bg-error-3 text-error-11 hover:bg-error-4 active:bg-error-5',
      success: 'bg-success-3 text-success-11 hover:bg-success-4 active:bg-success-5',
      warning: 'bg-warning-3 text-warning-11 hover:bg-warning-4 active:bg-warning-5',
      info: 'bg-info-3 text-info-11 hover:bg-info-4 active:bg-info-5',
      neutral: 'bg-surface-raised-hover text-surface-fg-muted hover:bg-surface-raised-active active:bg-neutral-5',
    },
    outline: {
      accent: 'bg-transparent text-accent-11 hover:bg-accent-3 active:bg-accent-4',
      error: 'bg-transparent text-error-11 hover:bg-error-3 active:bg-error-4',
      success: 'bg-transparent text-success-11 hover:bg-success-3 active:bg-success-4',
      warning: 'bg-transparent text-warning-11 hover:bg-warning-3 active:bg-warning-4',
      info: 'bg-transparent text-info-11 hover:bg-info-3 active:bg-info-4',
      neutral: 'bg-transparent text-surface-fg hover:bg-surface-raised-hover active:bg-surface-raised-active',
    },
  }
  return map[variant][color] ?? map[variant].accent
}

function getOutlineBorderColor(color: string): string {
  const map: Record<string, string> = {
    accent: 'border-accent-7', error: 'border-error-7', success: 'border-success-7',
    warning: 'border-warning-7', info: 'border-info-7', neutral: 'border-surface-border-strong',
  }
  return map[color] ?? map.accent
}

// ── Chevron SVG ─────────────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ───────────────────────────────────────────────────

const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(
    {
      children,
      onClick,
      dropdownContent,
      open: openProp,
      onOpenChange,
      variant = 'solid',
      color = 'accent',
      size = 'md',
      disabled = false,
      'aria-label': ariaLabel,
      dropdownLabel = 'More options',
      dropdownIcon,
      triggerSide = 'right',
      placement: placementProp = 'top-end',
      triggerWidth,
      className,
    },
    ref,
  ) {
    // Map the floating-ui `placement` (e.g. 'top-end') to Radix side + align.
    // Positioning, focus-in/return, outside-click, and Escape all come from the
    // Popover primitive now — no hand-rolled floating-ui / listeners.
    const [side, align] = React.useMemo(() => {
      const [s, a] = placementProp.split('-')
      return [
        s as 'top' | 'right' | 'bottom' | 'left',
        (a === 'start' ? 'start' : a === 'end' ? 'end' : 'center') as
          | 'start'
          | 'center'
          | 'end',
      ]
    }, [placementProp])

    const halfClasses = getHalfClasses(variant, color)
    const divider = dividerColor[variant][color] ?? dividerColor[variant].accent

    const triggerStyle = triggerWidth != null
      ? { width: typeof triggerWidth === 'number' ? `${triggerWidth}px` : triggerWidth }
      : undefined

    // Dropdown trigger (the chevron half). PopoverTrigger wires aria-haspopup /
    // aria-expanded / focus-return for us.
    const dropdownTrigger = (
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={dropdownLabel}
          className={cn(
            'inline-flex items-center justify-center select-none',
            'transition-colors duration-fast-01 ease-productive-standard',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-inset',
            'disabled:pointer-events-none disabled:opacity-action-disabled',
            halfClasses,
            heightClass[size],
            triggerPadding[size],
          )}
          style={triggerStyle}
        >
          {dropdownIcon ?? <ChevronDown />}
        </button>
      </PopoverTrigger>
    )

    return (
      <Popover open={openProp} onOpenChange={onOpenChange}>
        {/* Button group */}
        <div
          ref={ref}
          role="group"
          aria-label={ariaLabel ?? undefined}
          className={cn('relative inline-flex', className)}
        >
          <div
            className={cn(
              'inline-flex items-stretch overflow-hidden',
              radiusClass[size],
              variant === 'solid' && 'shadow-raised',
              variant === 'outline' && `border ${getOutlineBorderColor(color)}`,
            )}
          >
            {triggerSide === 'left' && (
              <>
                {dropdownTrigger}
                <div className={cn('w-px self-stretch', divider)} />
              </>
            )}

            {/* Primary action */}
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              aria-label={ariaLabel}
              className={cn(
                'inline-flex items-center justify-center font-semibold select-none whitespace-nowrap',
                'transition-[colors,transform] duration-fast-01 ease-productive-standard',
                'active:scale-[0.97]',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-inset',
                'disabled:pointer-events-none disabled:opacity-action-disabled',
                halfClasses,
                heightClass[size],
                textClass[size],
                primaryPadding[size],
              )}
            >
              {children}
            </button>

            {triggerSide === 'right' && (
              <>
                <div className={cn('w-px self-stretch', divider)} />
                {dropdownTrigger}
              </>
            )}
          </div>
        </div>

        {/* Dropdown panel — Popover handles focus, Escape, outside-click, return */}
        {dropdownContent && (
          <PopoverContent
            side={side}
            align={align}
            sideOffset={8}
            className="w-auto min-w-[10rem] p-ds-01"
          >
            {dropdownContent}
          </PopoverContent>
        )}
      </Popover>
    )
  },
)

SplitButton.displayName = 'SplitButton'

export { SplitButton }
export type { SplitButtonColor, SplitButtonSize,SplitButtonVariant }
