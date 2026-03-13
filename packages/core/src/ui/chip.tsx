'use client'

import * as React from 'react'
import { IconX } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'

import { springs } from './lib/motion'
import { motionProps } from './lib/motion'
import { cn } from './lib/utils'

// TODO(v1): rename color="primary" → color="brand" for consistency with Badge (breaking change)
const chipVariants = cva(
  'inline-flex items-center gap-ds-02 font-sans leading-ds-relaxed rounded-ds-full transition-colors duration-fast-01',
  {
    variants: {
      variant: {
        subtle: 'bg-surface-2 text-surface-fg border border-transparent',
        outline: 'bg-transparent text-surface-fg border border-surface-border-strong',
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
      { variant: 'subtle', color: 'primary', className: 'bg-accent-9 text-accent-fg' },
      { variant: 'subtle', color: 'success', className: 'bg-success-3 text-success-11 border-success-7' },
      { variant: 'subtle', color: 'error', className: 'bg-error-3 text-error-11 border-error-7' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-3 text-warning-11 border-warning-7' },
      { variant: 'subtle', color: 'info', className: 'bg-info-3 text-info-11 border-info-7' },
      { variant: 'subtle', color: 'teal', className: 'bg-category-teal-3 text-category-teal-11 border-category-teal-7' },
      { variant: 'subtle', color: 'amber', className: 'bg-category-amber-3 text-category-amber-11 border-category-amber-7' },
      { variant: 'subtle', color: 'slate', className: 'bg-category-slate-3 text-category-slate-11 border-category-slate-7' },
      { variant: 'subtle', color: 'indigo', className: 'bg-category-indigo-3 text-category-indigo-11 border-category-indigo-7' },
      { variant: 'subtle', color: 'cyan', className: 'bg-category-cyan-3 text-category-cyan-11 border-category-cyan-7' },
      { variant: 'subtle', color: 'orange', className: 'bg-category-orange-3 text-category-orange-11 border-category-orange-7' },
      { variant: 'subtle', color: 'emerald', className: 'bg-category-emerald-3 text-category-emerald-11 border-category-emerald-7' },
      { variant: 'outline', color: 'primary', className: 'border-accent-7 text-accent-11' },
      { variant: 'outline', color: 'success', className: 'border-success-7 text-success-11' },
      { variant: 'outline', color: 'error', className: 'border-error-7 text-error-11' },
      { variant: 'outline', color: 'warning', className: 'border-warning-7 text-warning-11' },
      { variant: 'outline', color: 'info', className: 'border-info-7 text-info-11' },
      { variant: 'outline', color: 'teal', className: 'border-category-teal-7 text-category-teal-11' },
      { variant: 'outline', color: 'amber', className: 'border-category-amber-7 text-category-amber-11' },
      { variant: 'outline', color: 'slate', className: 'border-category-slate-7 text-category-slate-11' },
      { variant: 'outline', color: 'indigo', className: 'border-category-indigo-7 text-category-indigo-11' },
      { variant: 'outline', color: 'cyan', className: 'border-category-cyan-7 text-category-cyan-11' },
      { variant: 'outline', color: 'orange', className: 'border-category-orange-7 text-category-orange-11' },
      { variant: 'outline', color: 'emerald', className: 'border-category-emerald-7 text-category-emerald-11' },
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
    const MotionComponent = isClickable ? motion.button : motion.span
    const interactiveClass = isClickable && !disabled
      ? 'cursor-pointer hover:bg-surface-4 active:scale-95'
      : ''
    const disabledClass = disabled
      ? 'opacity-action-disabled cursor-not-allowed'
      : ''

    return (
      <MotionComponent
        ref={ref as React.Ref<HTMLButtonElement & HTMLSpanElement>}
        layout
        initial={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={springs.snappy}
        className={cn(chipVariants({ variant, size, color }), interactiveClass, disabledClass, className)}
        onClick={isClickable ? onClick : undefined}
        disabled={isClickable ? disabled : undefined}
        type={isClickable ? 'button' : undefined}
        {...motionProps(props)}
      >
        {icon && <span className="flex-shrink-0 [&>svg]:w-ico-sm [&>svg]:h-ico-sm">{icon}</span>}
        <span>{label}</span>
        {onDismiss && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="flex-shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full p-ds-01 hover:bg-surface-3 hover:rotate-90 transition-[color,transform] duration-fast-02 [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        )}
      </MotionComponent>
    )
  },
)
Chip.displayName = 'Chip'

export { AnimatePresence as ChipGroup } from 'framer-motion'
export { Chip, chipVariants, type ChipProps }
