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
        filled: 'bg-layer-02 text-text-primary border border-transparent',
        outlined: 'bg-transparent text-text-primary border border-border',
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
      { variant: 'filled', color: 'primary', className: 'bg-interactive text-text-on-color' },
      { variant: 'filled', color: 'success', className: 'bg-success-surface text-success-text border-success-border' },
      { variant: 'filled', color: 'error', className: 'bg-error-surface text-error-text border-error-border' },
      { variant: 'filled', color: 'warning', className: 'bg-warning-surface text-warning-text border-warning-border' },
      { variant: 'filled', color: 'info', className: 'bg-info-surface text-info-text border-info-border' },
      { variant: 'filled', color: 'teal', className: 'bg-category-teal-surface text-category-teal-text border-category-teal-border' },
      { variant: 'filled', color: 'amber', className: 'bg-category-amber-surface text-category-amber-text border-category-amber-border' },
      { variant: 'filled', color: 'slate', className: 'bg-category-slate-surface text-category-slate-text border-category-slate-border' },
      { variant: 'filled', color: 'indigo', className: 'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border' },
      { variant: 'filled', color: 'cyan', className: 'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border' },
      { variant: 'filled', color: 'orange', className: 'bg-category-orange-surface text-category-orange-text border-category-orange-border' },
      { variant: 'filled', color: 'emerald', className: 'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border' },
      { variant: 'outlined', color: 'primary', className: 'border-border-interactive text-text-interactive' },
      { variant: 'outlined', color: 'success', className: 'border-border-success text-success-text' },
      { variant: 'outlined', color: 'error', className: 'border-border-error text-error-text' },
      { variant: 'outlined', color: 'warning', className: 'border-border-warning text-warning-text' },
      { variant: 'outlined', color: 'info', className: 'border-info-border text-info-text' },
      { variant: 'outlined', color: 'teal', className: 'border-category-teal-border text-category-teal-text' },
      { variant: 'outlined', color: 'amber', className: 'border-category-amber-border text-category-amber-text' },
      { variant: 'outlined', color: 'slate', className: 'border-category-slate-border text-category-slate-text' },
      { variant: 'outlined', color: 'indigo', className: 'border-category-indigo-border text-category-indigo-text' },
      { variant: 'outlined', color: 'cyan', className: 'border-category-cyan-border text-category-cyan-text' },
      { variant: 'outlined', color: 'orange', className: 'border-category-orange-border text-category-orange-text' },
      { variant: 'outlined', color: 'emerald', className: 'border-category-emerald-border text-category-emerald-text' },
    ],
    defaultVariants: {
      variant: 'filled',
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
 * - `variant` controls **shape**: `"filled"` (solid background, default) | `"outlined"` (border only)
 * - `color` controls **intent/category**: `"default"` | `"primary"` | `"success"` | `"error"` |
 *   `"warning"` | `"info"` | `"teal"` | `"amber"` | `"slate"` | `"indigo"` | `"cyan"` | `"orange"` | `"emerald"`
 *
 * **Comparison with Badge:** Badge uses `variant=` for intent (e.g. `variant="success"`).
 * Chip uses `color=` for intent. They are different — don't mix them up.
 *
 * **Important:** Use the `label` prop, NOT `children`. Chip does not render children.
 *
 * @example
 * // Basic label chip:
 * <Chip label="In Progress" />
 *
 * // With intent color (use color=, not variant=):
 * <Chip label="High Priority" color="warning" />
 * <Chip label="Done" color="success" variant="outlined" />
 *
 * // Dismissible chip (e.g. in a filter bar):
 * <Chip label="React" color="info" onDelete={() => removeFilter('react')} />
 *
 * // Clickable chip (renders as <button>):
 * <Chip label="View details" color="primary" onClick={() => openPanel(id)} />
 *
 * // WRONG — children are not rendered (TypeScript error in strict mode):
 * // <Chip>High Priority</Chip>
 *
 * // Badge comparison:
 * // <Badge variant="success">Done</Badge>  ← Badge uses variant= for intent
 * // <Chip label="Done" color="success" />  ← Chip uses color= for intent
 */
type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  color?: ChipColor
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler
  onDelete?: () => void
  disabled?: boolean
  className?: string
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  ({ label, variant, size, color, icon, onClick, onDelete, disabled, className, ...props }, ref) => {
    const isClickable = !!onClick
    const Component = isClickable ? 'button' : 'span'
    const interactiveClass = isClickable && !disabled
      ? 'cursor-pointer hover:bg-field-hover'
      : ''
    const disabledClass = disabled
      ? 'opacity-action-disabled cursor-not-allowed'
      : ''

    return React.createElement(
      Component,
      {
        ref,
        className: cn(chipVariants({ variant, size, color }), interactiveClass, disabledClass, className),
        onClick: isClickable ? onClick : undefined,
        disabled: isClickable ? disabled : undefined,
        type: isClickable ? 'button' : undefined,
        ...props,
      },
      <>
        {icon && <span className="flex-shrink-0 [&>svg]:w-ico-sm [&>svg]:h-ico-sm">{icon}</span>}
        <span>{label}</span>
        {onDelete && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="flex-shrink-0 rounded-ds-full p-ds-01 hover:bg-layer-03 transition-colors duration-fast-01 [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        )}
      </>,
    )
  },
)
Chip.displayName = 'Chip'

export { Chip, chipVariants, type ChipProps }
