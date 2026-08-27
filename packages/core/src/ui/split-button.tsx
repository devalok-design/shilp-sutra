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
  /**
   * Palette name. The six built-ins are unchanged; any palette registered in
   * CSS (`[data-palette='…']`) now works too. Widened from a closed union, so
   * every existing value still type-checks.
   *
   * @default 'accent'
   */
  color?: SplitButtonColor | (string & {})
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

// The hairline between the two halves. One line per variant instead of one
// per variant × colour — the hue arrives via `data-palette` on the group.
const dividerColor: Record<SplitButtonVariant, string> = {
  solid: 'bg-palette-solid-active/20',
  soft: 'bg-palette-border-subtle',
  outline: 'bg-palette-border',
}

// `neutral` diverges from the roles here, and both cases predate this work:
// its solid divider is 30% rather than 20% (a flat grey needs more presence
// than a saturated one to read at 1px), and its soft divider sits on
// `surface-border` rather than the subtle tier the role resolves to.
const neutralDivider: Partial<Record<SplitButtonVariant, string>> = {
  solid: 'bg-neutral-8/30',
  soft: 'bg-surface-border',
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

// Three lines, not eighteen. Colour comes from `data-palette`.
const halfClasses: Record<SplitButtonVariant, string> = {
  solid:
    'bg-palette-solid text-palette-fg hover:bg-palette-solid-hover active:bg-palette-solid-active',
  soft: 'bg-palette-soft text-palette-text hover:bg-palette-soft-hover active:bg-palette-soft-active',
  outline:
    'bg-transparent text-palette-text hover:bg-palette-soft active:bg-palette-soft-hover',
}

function getHalfClasses(variant: SplitButtonVariant, color: string): string {
  // Same exception Button carries: on neutral, an outlined control's label
  // wants full contrast rather than the muted text role.
  const neutralOutline = variant === 'outline' && color === 'neutral' ? ' text-surface-fg' : ''
  return halfClasses[variant] + neutralOutline
}

function getOutlineBorderColor(color: string): string {
  // An outlined control's edge owes WCAG 1.4.11, so neutral takes the
  // interactive border tier rather than the decorative one the role resolves
  // to. The chromatic palettes already satisfy it from their own ramp.
  return color === 'neutral' ? 'border-surface-border-interactive' : 'border-palette-border'
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

    const halfClassNames = getHalfClasses(variant, color)
    const divider =
      (color === 'neutral' ? neutralDivider[variant] : undefined) ?? dividerColor[variant]

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
            halfClassNames,
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
          // One palette for the whole group: both halves and the hairline
          // between them inherit it, so they can never disagree.
          data-palette={color}
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
                halfClassNames,
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
