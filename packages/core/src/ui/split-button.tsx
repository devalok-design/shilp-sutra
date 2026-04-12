'use client'

import * as React from 'react'
import { computePosition, flip, offset, shift, autoUpdate, type Placement } from '@floating-ui/dom'
import { AnimatePresence, motion } from 'framer-motion'
import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from './button'
import { cn } from './lib/utils'

// ── Types ───────────────────────────────────────────────────────

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
  placement?: Placement
  /** Width of the trigger (chevron) half. @default 'auto' */
  triggerWidth?: number | string
  className?: string
}

// ── Styling maps ────────────────────────────────────────────────

const dividerColor: Record<SplitButtonVariant, Record<string, string>> = {
  solid: {
    accent: 'bg-accent-11/20', error: 'bg-error-11/20', success: 'bg-success-11/20',
    warning: 'bg-warning-11/20', neutral: 'bg-neutral-8/30',
  },
  soft: {
    accent: 'bg-accent-6', error: 'bg-error-6', success: 'bg-success-6',
    warning: 'bg-warning-6', neutral: 'bg-surface-border',
  },
  outline: {
    accent: 'bg-accent-7', error: 'bg-error-7', success: 'bg-success-7',
    warning: 'bg-warning-7', neutral: 'bg-surface-border-strong',
  },
}

const heightClass: Record<SplitButtonSize, string> = {
  xs: 'h-ds-xs-plus', sm: 'h-ds-sm', md: 'h-ds-md',
  'icon-xs': 'h-ds-xs-plus', 'icon-sm': 'h-ds-sm', 'icon-md': 'h-ds-md',
}

const textClass: Record<SplitButtonSize, string> = {
  xs: 'text-ds-sm', sm: 'text-ds-sm', md: 'text-ds-md',
  'icon-xs': 'text-ds-sm', 'icon-sm': 'text-ds-sm', 'icon-md': 'text-ds-md',
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
  xs: 'rounded-ds-md', sm: 'rounded-ds-md', md: 'rounded-ds-lg',
  'icon-xs': 'rounded-ds-sm', 'icon-sm': 'rounded-ds-md', 'icon-md': 'rounded-ds-md',
}

function getHalfClasses(variant: SplitButtonVariant, color: string): string {
  const map: Record<SplitButtonVariant, Record<string, string>> = {
    solid: {
      accent: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-11',
      error: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-11',
      success: 'bg-success-9 text-success-fg hover:bg-success-10 active:bg-success-11',
      warning: 'bg-warning-9 text-warning-fg hover:bg-warning-10 active:bg-warning-11',
      neutral: 'bg-neutral-5 text-surface-fg hover:bg-neutral-7 active:bg-neutral-8',
    },
    soft: {
      accent: 'bg-accent-3 text-accent-11 hover:bg-accent-4 active:bg-accent-5',
      error: 'bg-error-3 text-error-11 hover:bg-error-4 active:bg-error-5',
      success: 'bg-success-3 text-success-11 hover:bg-success-4 active:bg-success-5',
      warning: 'bg-warning-3 text-warning-11 hover:bg-warning-4 active:bg-warning-5',
      neutral: 'bg-surface-raised-hover text-surface-fg-muted hover:bg-surface-raised-active active:bg-neutral-5',
    },
    outline: {
      accent: 'bg-transparent text-accent-11 hover:bg-accent-3 active:bg-accent-4',
      error: 'bg-transparent text-error-11 hover:bg-error-3 active:bg-error-4',
      success: 'bg-transparent text-success-11 hover:bg-success-3 active:bg-success-4',
      warning: 'bg-transparent text-warning-11 hover:bg-warning-3 active:bg-warning-4',
      neutral: 'bg-transparent text-surface-fg hover:bg-surface-raised-hover active:bg-surface-raised-active',
    },
  }
  return map[variant][color] ?? map[variant].accent
}

function getOutlineBorderColor(color: string): string {
  const map: Record<string, string> = {
    accent: 'border-accent-7', error: 'border-error-7', success: 'border-success-7',
    warning: 'border-warning-7', neutral: 'border-surface-border-strong',
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
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = openProp !== undefined
    const isOpen = isControlled ? openProp : internalOpen

    const anchorRef = React.useRef<HTMLDivElement>(null)
    const floatingRef = React.useRef<HTMLDivElement>(null)
    const menuId = React.useId()

    const setOpen = React.useCallback(
      (value: boolean) => {
        if (onOpenChange) onOpenChange(value)
        if (!isControlled) setInternalOpen(value)
      },
      [onOpenChange, isControlled],
    )

    // ── Floating UI positioning ──
    React.useEffect(() => {
      if (!isOpen || !anchorRef.current || !floatingRef.current) return

      const anchor = anchorRef.current
      const floating = floatingRef.current

      const update = () => {
        computePosition(anchor, floating, {
          placement: placementProp,
          middleware: [
            offset(8),
            flip({ fallbackPlacements: ['bottom-end', 'top-start', 'bottom-start'] }),
            shift({ padding: 8 }),
          ],
        }).then(({ x, y }) => {
          Object.assign(floating.style, { left: `${x}px`, top: `${y}px` })
        })
      }

      const cleanup = autoUpdate(anchor, floating, update)
      return cleanup
    }, [isOpen, placementProp])

    // ── Close on outside click ──
    React.useEffect(() => {
      if (!isOpen) return
      const handleClick = (e: MouseEvent) => {
        const target = e.target as Node
        if (
          anchorRef.current?.contains(target) ||
          floatingRef.current?.contains(target)
        ) return
        setOpen(false)
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen, setOpen])

    // ── Close on Escape ──
    React.useEffect(() => {
      if (!isOpen) return
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, setOpen])

    const halfClasses = getHalfClasses(variant, color)
    const divider = dividerColor[variant][color] ?? dividerColor[variant].accent

    const triggerStyle = triggerWidth != null
      ? { width: typeof triggerWidth === 'number' ? `${triggerWidth}px` : triggerWidth }
      : undefined

    return (
      <>
        {/* Button group */}
        <div
          ref={ref}
          role="group"
          aria-label={ariaLabel ?? undefined}
          className={cn('relative inline-flex', className)}
        >
          <div
            ref={anchorRef}
            className={cn(
              'inline-flex items-stretch overflow-hidden',
              radiusClass[size],
              variant === 'solid' && 'shadow-raised',
              variant === 'outline' && `border ${getOutlineBorderColor(color)}`,
            )}
          >
            {triggerSide === 'left' && (
              <>
                {/* Dropdown trigger (left) */}
                <button
                  type="button"
                  onClick={() => setOpen(!isOpen)}
                  disabled={disabled}
                  aria-label={dropdownLabel}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? menuId : undefined}
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
                {/* Dropdown trigger (right) */}
                <button
                  type="button"
                  onClick={() => setOpen(!isOpen)}
                  disabled={disabled}
                  aria-label={dropdownLabel}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? menuId : undefined}
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
              </>
            )}
          </div>
        </div>

        {/* Floating dropdown panel */}
        <AnimatePresence>
          {isOpen && dropdownContent && (
            <div
              ref={floatingRef}
              id={menuId}
              role="menu"
              className="fixed z-popover"
              style={{ top: 0, left: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="rounded-ds-lg border border-surface-border-strong bg-surface-overlay shadow-floating"
              >
                {dropdownContent}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    )
  },
)

SplitButton.displayName = 'SplitButton'

export { SplitButton }
export type { SplitButtonVariant, SplitButtonColor, SplitButtonSize }
