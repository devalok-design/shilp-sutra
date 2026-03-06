'use client'

import * as React from 'react'
import { IconX } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const chipVariants = cva(
  'inline-flex items-center gap-ds-02 font-sans leading-ds-relaxed rounded-ds-full transition-colors duration-fast-01',
  {
    variants: {
      variant: {
        subtle: 'bg-layer-02 text-text-primary border border-transparent',
        outline: 'bg-transparent text-text-primary border border-border',
      },
      size: {
        sm: 'h-ds-xs px-ds-03 text-ds-xs',
        md: 'h-ds-sm px-ds-04 text-ds-sm',
        lg: 'h-ds-md px-ds-05 text-ds-base gap-ds-03',
      },
      color: {
        default: '',
        primary: '',
        success: '',
        error: '',
        warning: '',
        info: '',
        teal: '',
        amber: '',
        slate: '',
        indigo: '',
        cyan: '',
        orange: '',
        emerald: '',
      },
    },
    compoundVariants: [
      { variant: 'subtle', color: 'primary', className: 'bg-interactive text-text-on-color' },
      { variant: 'subtle', color: 'success', className: 'bg-success-surface text-success-text border-success-border' },
      { variant: 'subtle', color: 'error', className: 'bg-error-surface text-error-text border-error-border' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-surface text-warning-text border-warning-border' },
      { variant: 'subtle', color: 'info', className: 'bg-info-surface text-info-text border-info-border' },
      { variant: 'subtle', color: 'teal', className: 'bg-category-teal-surface text-category-teal-text border-category-teal-border' },
      { variant: 'subtle', color: 'amber', className: 'bg-category-amber-surface text-category-amber-text border-category-amber-border' },
      { variant: 'subtle', color: 'slate', className: 'bg-category-slate-surface text-category-slate-text border-category-slate-border' },
      { variant: 'subtle', color: 'indigo', className: 'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border' },
      { variant: 'subtle', color: 'cyan', className: 'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border' },
      { variant: 'subtle', color: 'orange', className: 'bg-category-orange-surface text-category-orange-text border-category-orange-border' },
      { variant: 'subtle', color: 'emerald', className: 'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border' },
      { variant: 'outline', color: 'primary', className: 'border-border-interactive text-text-interactive' },
      { variant: 'outline', color: 'success', className: 'border-border-success text-success-text' },
      { variant: 'outline', color: 'error', className: 'border-border-error text-error-text' },
      { variant: 'outline', color: 'warning', className: 'border-border-warning text-warning-text' },
      { variant: 'outline', color: 'info', className: 'border-info-border text-info-text' },
      { variant: 'outline', color: 'teal', className: 'border-category-teal-border text-category-teal-text' },
      { variant: 'outline', color: 'amber', className: 'border-category-amber-border text-category-amber-text' },
      { variant: 'outline', color: 'slate', className: 'border-category-slate-border text-category-slate-text' },
      { variant: 'outline', color: 'indigo', className: 'border-category-indigo-border text-category-indigo-text' },
      { variant: 'outline', color: 'cyan', className: 'border-category-cyan-border text-category-cyan-text' },
      { variant: 'outline', color: 'orange', className: 'border-category-orange-border text-category-orange-text' },
      { variant: 'outline', color: 'emerald', className: 'border-category-emerald-border text-category-emerald-text' },
    ],
    defaultVariants: {
      variant: 'subtle',
      size: 'md',
      color: 'default',
    },
  },
)

type ChipColor = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'teal' | 'amber' | 'slate' | 'indigo' | 'cyan' | 'orange' | 'emerald'

/**
 * Props for Chip — a compact label-tag component with a two-axis variant system.
 *
 * **Two axes:**
 * - `variant` controls **shape**: `"subtle"` (surface background, default) | `"outline"` (border only)
 * - `color` controls **intent/category**: `"default"` | `"primary"` | `"success"` | `"error"` |
 *   `"warning"` | `"info"` | `"teal"` | `"amber"` | `"slate"` | `"indigo"` | `"cyan"` | `"orange"` | `"emerald"`
 *
 * **Comparison with Badge:** Badge now uses `color=` for intent (e.g. `color="success"`), same as Chip.
 * Badge also has `variant=` for visual style (`subtle` | `solid` | `outline`).
 *
 * **Important:** Use the `label` prop, NOT `children`. Chip does not render children.
 *
 * @example
 * // Basic label chip:
 * <Chip label="In Progress" />
 *
 * // With intent color (use color=, not variant=):
 * <Chip label="High Priority" color="warning" />
 * <Chip label="Done" color="success" variant="outline" />
 *
 * // Dismissible chip (e.g. in a filter bar):
 * <Chip label="React" color="info" onDismiss={() => removeFilter('react')} />
 *
 * // Clickable chip (renders as <button>):
 * <Chip label="View details" color="primary" onClick={() => openPanel(id)} />
 *
 * // WRONG — children are not rendered (TypeScript error in strict mode):
 * // <Chip>High Priority</Chip>
 *
 * // Badge comparison:
 * // <Badge color="success">Done</Badge>  ← Badge uses color= for intent
 * // <Chip label="Done" color="success" />  ← Chip uses color= for intent
 */
type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  color?: ChipColor
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler
  onDismiss?: () => void
  disabled?: boolean
  className?: string
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  ({ label, variant, size, color, icon, onClick, onDismiss, disabled, className, ...props }, ref) => {
    const isClickable = !!onClick
    const Component = isClickable ? 'button' : 'span'
    const interactiveClass = isClickable && !disabled
      ? 'cursor-pointer hover:bg-field-hover'
      : ''
    const disabledClass = disabled
      ? 'opacity-action-disabled cursor-not-allowed'
      : ''

    return (
      <Component
        ref={ref as React.Ref<HTMLButtonElement & HTMLSpanElement>}
        className={cn(chipVariants({ variant, size, color }), interactiveClass, disabledClass, className)}
        onClick={isClickable ? onClick : undefined}
        disabled={isClickable ? disabled : undefined}
        type={isClickable ? 'button' : undefined}
        {...props}
      >
        {icon && <span className="flex-shrink-0 [&>svg]:w-ico-sm [&>svg]:h-ico-sm">{icon}</span>}
        <span>{label}</span>
        {onDismiss && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="flex-shrink-0 min-h-6 min-w-6 flex items-center justify-center rounded-ds-full p-ds-01 hover:bg-layer-03 transition-colors duration-fast-01 [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        )}
      </Component>
    )
  },
)
Chip.displayName = 'Chip'

export { Chip, chipVariants, type ChipProps }
