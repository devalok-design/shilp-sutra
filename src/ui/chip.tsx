import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const chipVariants = cva(
  'inline-flex items-center gap-ds-02 font-sans text-[length:var(--font-size-sm)] leading-[var(--line-height-relaxed)] rounded-[var(--radius-full)] transition-colors duration-fast',
  {
    variants: {
      variant: {
        filled: 'bg-[var(--color-layer-02)] text-[var(--color-text-primary)] border border-transparent',
        outlined: 'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-default)]',
      },
      size: {
        sm: 'h-6 px-ds-03',
        md: 'h-8 px-ds-04',
      },
      color: {
        default: '',
        primary: '',
        success: '',
        error: '',
        warning: '',
      },
    },
    compoundVariants: [
      { variant: 'filled', color: 'primary', className: 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]' },
      { variant: 'filled', color: 'success', className: 'bg-[var(--color-success-surface)] text-[var(--color-success-text)] border-[var(--color-success-border)]' },
      { variant: 'filled', color: 'error', className: 'bg-[var(--color-error-surface)] text-[var(--color-error-text)] border-[var(--color-error-border)]' },
      { variant: 'filled', color: 'warning', className: 'bg-[var(--color-warning-surface)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]' },
      { variant: 'outlined', color: 'primary', className: 'border-[var(--color-border-interactive)] text-[var(--color-text-interactive)]' },
      { variant: 'outlined', color: 'success', className: 'border-[var(--color-border-success)] text-[var(--color-success-text)]' },
      { variant: 'outlined', color: 'error', className: 'border-[var(--color-border-error)] text-[var(--color-error-text)]' },
      { variant: 'outlined', color: 'warning', className: 'border-[var(--color-border-warning)] text-[var(--color-warning-text)]' },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      color: 'default',
    },
  },
)

type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  color?: 'default' | 'primary' | 'success' | 'error' | 'warning'
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
      ? 'cursor-pointer hover:bg-[var(--color-field-hover)]'
      : ''
    const disabledClass = disabled
      ? 'opacity-[var(--action-disabled-opacity,0.38)] cursor-not-allowed'
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
            className="flex-shrink-0 rounded-[var(--radius-full)] p-0.5 hover:bg-[var(--color-layer-03)] transition-colors duration-fast [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </>,
    )
  },
)
Chip.displayName = 'Chip'

export { Chip, chipVariants, type ChipProps }
