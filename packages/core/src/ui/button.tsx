'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Slot, Slottable } from '@primitives/react-slot'
import * as React from 'react'
import { useButtonGroup } from './button-group'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans font-semibold select-none border border-transparent transition-[color,background-color,border-color,box-shadow] duration-fast-01 ease-productive-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]',
  {
    variants: {
      variant: {
        solid: '',
        outline: '',
        ghost: '',
        link: 'text-text-link underline-offset-4 hover:underline active:opacity-[0.8]',
      },
      color: {
        default: '',
        error: '',
      },
      size: {
        sm: 'h-ds-sm rounded-ds-md px-ds-04 text-ds-sm',
        md: 'h-ds-md rounded-ds-md px-ds-05 text-ds-md',
        lg: 'h-ds-lg rounded-ds-lg px-ds-06 text-ds-base',
        'icon-sm': 'h-ds-sm w-ds-sm rounded-ds-md',
        'icon-md': 'h-ds-md w-ds-md rounded-ds-md',
        'icon-lg': 'h-ds-lg w-ds-lg rounded-ds-lg',
      },
    },
    compoundVariants: [
      // solid + default (primary)
      { variant: 'solid', color: 'default', className: 'bg-interactive text-text-on-color hover:bg-interactive-hover active:bg-interactive-active shadow-01 hover:shadow-brand' },
      // solid + error
      { variant: 'solid', color: 'error', className: 'bg-error text-text-on-color hover:bg-error-hover active:bg-error-hover shadow-01' },
      // outline + default (secondary)
      { variant: 'outline', color: 'default', className: 'bg-transparent text-interactive border-border-interactive hover:bg-interactive-subtle active:bg-layer-active' },
      // outline + error (error-ghost)
      { variant: 'outline', color: 'error', className: 'bg-transparent text-error border border-border-error hover:bg-error-surface active:bg-error-surface' },
      // ghost + default
      { variant: 'ghost', color: 'default', className: 'bg-transparent text-text-secondary hover:bg-layer-02 hover:text-text-primary active:bg-layer-active' },
      // ghost + error
      { variant: 'ghost', color: 'error', className: 'bg-transparent text-error hover:bg-error-surface hover:text-error active:bg-error-surface' },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'default',
      size: 'md',
    },
  },
)

/** Map button size to icon wrapper size class */
const iconSizeClass: Record<string, string> = {
  sm: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  md: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  lg: 'h-ico-md w-ico-md [&>svg]:h-ico-md [&>svg]:w-ico-md',
  'icon-sm': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-md': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-lg': 'h-ico-md w-ico-md [&>svg]:h-ico-md [&>svg]:w-ico-md',
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

/**
 * Props for Button — the primary action component with a two-axis variant system,
 * 6 size options, icon slots, and a built-in loading state.
 *
 * **Two axes:**
 * - `variant` controls **visual style**: `"solid"` (default, filled brand) | `"outline"` (bordered) |
 *   `"ghost"` (transparent, for toolbars) | `"link"` (underline, inline text actions)
 * - `color` controls **semantic intent**: `"default"` (brand interactive) | `"error"` (destructive)
 *
 * **Sizes:** `sm` | `md` (default) | `lg` for text buttons;
 * `icon-sm` | `icon-md` | `icon-lg` for square icon-only buttons (prefer `IconButton` for icon-only).
 *
 * **Loading:** When `loading={true}` the button is disabled and aria-busy is set.
 * Use `loadingPosition` to control where the spinner appears.
 *
 * @example
 * // Primary save action (default variant + color):
 * <Button onClick={handleSave}>Save changes</Button>
 *
 * @example
 * // Destructive delete with confirmation icon and loading state:
 * <Button variant="solid" color="error" startIcon={<IconTrash />} loading={isDeleting}>
 *   Delete project
 * </Button>
 *
 * @example
 * // Ghost toolbar action (compact icon-adjacent button):
 * <Button variant="ghost" size="sm" startIcon={<IconEdit />}>
 *   Edit
 * </Button>
 *
 * @example
 * // Full-width form submit with centered loading spinner:
 * <Button fullWidth loading={isPending} loadingPosition="center">
 *   Sign in
 * </Button>
 *
 * @example
 * // Link variant for inline text actions (renders as a <button>):
 * <Button variant="link" onClick={openTerms}>View terms of service</Button>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
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
      color,
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
    const resolvedColor = color ?? group.color
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
          buttonVariants({ variant: resolvedVariant, color: resolvedColor, size: resolvedSize }),
          fullWidth && 'w-full',
          className,
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
          buttonVariants({ variant: resolvedVariant, color: resolvedColor, size: resolvedSize }),
          fullWidth && 'w-full',
          className,
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
