import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const chipVariants = cva(
  'inline-flex items-center gap-ds-02 font-sans leading-[var(--line-height-relaxed)] rounded-ds-full transition-colors duration-fast',
  {
    variants: {
      variant: {
        filled: 'bg-layer-02 text-text-primary border border-transparent',
        outlined: 'bg-transparent text-text-primary border border-border',
      },
      size: {
        sm: 'h-ds-xs px-ds-03 text-ds-xs',
        md: 'h-ds-sm px-ds-04 text-ds-sm',
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
      { variant: 'filled', color: 'primary', className: 'bg-interactive text-text-on-color' },
      { variant: 'filled', color: 'success', className: 'bg-success-surface text-success-text border-success-border' },
      { variant: 'filled', color: 'error', className: 'bg-error-surface text-error-text border-error-border' },
      { variant: 'filled', color: 'warning', className: 'bg-warning-surface text-warning-text border-warning-border' },
      { variant: 'outlined', color: 'primary', className: 'border-border-interactive text-text-interactive' },
      { variant: 'outlined', color: 'success', className: 'border-border-success text-success-text' },
      { variant: 'outlined', color: 'error', className: 'border-border-error text-error-text' },
      { variant: 'outlined', color: 'warning', className: 'border-border-warning text-warning-text' },
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
      ? 'cursor-pointer hover:bg-field-hover'
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
            className="flex-shrink-0 rounded-ds-full p-ds-01 hover:bg-layer-03 transition-colors duration-fast [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
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
