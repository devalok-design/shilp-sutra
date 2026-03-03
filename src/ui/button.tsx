import { cva, type VariantProps } from 'class-variance-authority'
import { Slot, Slottable } from '@primitives/react-slot'
import * as React from 'react'
import { useButtonGroup } from './button-group'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans text-ds-md font-semibold select-none border border-transparent transition-[color,background-color,border-color,box-shadow] duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-interactive text-text-on-color hover:bg-interactive-hover active:bg-interactive-active shadow-01 hover:shadow-brand',
        secondary:
          'bg-transparent text-interactive border-border-interactive hover:bg-interactive-subtle',
        ghost:
          'bg-transparent text-text-secondary hover:bg-layer-02 hover:text-text-primary',
        danger:
          'bg-error text-text-on-color hover:bg-error-hover shadow-01',
        'danger-ghost':
          'bg-transparent text-error border border-border-error hover:bg-error-surface',
        link: 'text-text-link underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-ds-sm rounded-ds-md px-ds-04',
        md: 'h-ds-md rounded-ds-md px-ds-05',
        lg: 'h-ds-lg rounded-ds-lg px-ds-06',
        'icon-sm': 'h-ds-sm w-ds-sm rounded-ds-md',
        'icon-md': 'h-ds-md w-ds-md rounded-ds-md',
        'icon-lg': 'h-ds-lg w-ds-lg rounded-ds-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

/** Map button size to icon wrapper size class */
const iconSizeClass: Record<string, string> = {
  sm: 'h-4 w-4 [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  lg: 'h-5 w-5 [&>svg]:h-5 [&>svg]:w-5',
  'icon-sm': 'h-4 w-4 [&>svg]:h-4 [&>svg]:w-4',
  'icon-md': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-lg': 'h-5 w-5 [&>svg]:h-5 [&>svg]:w-5',
}

/** Map button size to spinner size */
const spinnerSizeMap: Record<string, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  'icon-sm': 'sm',
  'icon-md': 'sm',
  'icon-lg': 'md',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Icon element rendered before children */
  startIcon?: React.ReactNode
  /** Icon element rendered after children */
  endIcon?: React.ReactNode
  /** Show loading spinner and disable button */
  loading?: boolean
  /** Where to render the spinner: replaces startIcon, endIcon, or centers over children */
  loadingPosition?: 'start' | 'end' | 'center'
  /** Stretch to full width of parent */
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      startIcon,
      endIcon,
      loading = false,
      loadingPosition = 'start',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const group = useButtonGroup()
    const resolvedVariant = variant ?? group.variant
    const resolvedSize = size ?? group.size ?? 'md'
    const iconClass = iconSizeClass[resolvedSize]
    const spinnerSize = spinnerSizeMap[resolvedSize]

    const spinnerNode = loading ? (
      <Spinner size={spinnerSize} />
    ) : null

    if (asChild) {
      // Slot merges all props into the child element via cloneElement at runtime.
      // We cast here because SlotProps only types React.HTMLAttributes<HTMLElement>,
      // which excludes button-specific attrs like `disabled`.
      const slotProps = {
        className: cn(
          buttonVariants({ variant: resolvedVariant, size: resolvedSize, className }),
          fullWidth && 'w-full',
        ),
        ref,
        disabled: disabled || loading,
        'aria-busy': loading || undefined,
        ...props,
      } as React.ComponentPropsWithRef<typeof Slot>
      return (
        <Slot {...slotProps}>
          <Slottable>{children}</Slottable>
        </Slot>
      )
    }

    const renderStartSlot = () => {
      if (loading && loadingPosition === 'start') {
        return spinnerNode
      }
      if (startIcon) {
        return (
          <span className={cn('inline-flex shrink-0 items-center justify-center', iconClass)}>
            {startIcon}
          </span>
        )
      }
      return null
    }

    const renderEndSlot = () => {
      if (loading && loadingPosition === 'end') {
        return spinnerNode
      }
      if (endIcon) {
        return (
          <span className={cn('inline-flex shrink-0 items-center justify-center', iconClass)}>
            {endIcon}
          </span>
        )
      }
      return null
    }

    const renderChildren = () => {
      if (loading && loadingPosition === 'center') {
        return (
          <span className="relative inline-flex items-center justify-center">
            <span className="invisible">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              {spinnerNode}
            </span>
          </span>
        )
      }
      return children
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant: resolvedVariant, size: resolvedSize, className }),
          fullWidth && 'w-full',
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {renderStartSlot()}
        {renderChildren()}
        {renderEndSlot()}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
