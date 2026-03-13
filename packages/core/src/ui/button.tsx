'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { IconCheck, IconX } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slot, Slottable } from '@primitives/react-slot'
import * as React from 'react'
import { useButtonGroup } from './button-group'
import { springs } from './lib/motion'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans font-semibold select-none border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled',
  {
    variants: {
      variant: {
        solid: '',
        default: '',    // alias → solid
        outline: '',
        ghost: '',
        destructive: '', // alias → solid + error
        link: 'text-info-11 underline-offset-4 hover:underline active:opacity-80',
      },
      color: {
        default: '',
        error: '',
      },
      size: {
        sm: 'h-ds-sm rounded-ds-md px-ds-04 text-ds-sm',
        md: 'h-ds-md rounded-ds-md px-ds-05 text-ds-md',
        lg: 'h-ds-lg rounded-ds-lg px-ds-06 text-ds-base',
        icon: 'h-ds-md w-ds-md rounded-ds-md', // alias → icon-md
        'icon-sm': 'h-ds-sm w-ds-sm rounded-ds-md',
        'icon-md': 'h-ds-md w-ds-md rounded-ds-md',
        'icon-lg': 'h-ds-lg w-ds-lg rounded-ds-lg',
      },
    },
    compoundVariants: [
      // solid + default (primary)
      { variant: 'solid', color: 'default', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-01 hover:shadow-brand' },
      // "default" alias → same as solid + default
      { variant: 'default', color: 'default', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-01 hover:shadow-brand' },
      { variant: 'default', color: 'error', className: 'bg-error-9 text-accent-fg hover:bg-error-9 active:bg-error-9 shadow-01' },
      // "destructive" alias → solid + error
      { variant: 'destructive', color: 'default', className: 'bg-error-9 text-accent-fg hover:bg-error-9 active:bg-error-9 shadow-01' },
      { variant: 'destructive', color: 'error', className: 'bg-error-9 text-accent-fg hover:bg-error-9 active:bg-error-9 shadow-01' },
      // solid + error
      { variant: 'solid', color: 'error', className: 'bg-error-9 text-accent-fg hover:bg-error-9 active:bg-error-9 shadow-01' },
      // outline + default (secondary)
      { variant: 'outline', color: 'default', className: 'bg-transparent text-accent-11 border-accent-7 hover:bg-accent-2 active:bg-surface-4' },
      // outline + error (error-ghost)
      { variant: 'outline', color: 'error', className: 'bg-transparent text-error-11 border border-error-7 hover:bg-error-3 active:bg-error-3' },
      // ghost + default
      { variant: 'ghost', color: 'default', className: 'bg-transparent text-surface-fg-muted hover:bg-surface-2 hover:text-surface-fg active:bg-surface-4' },
      // ghost + error
      { variant: 'ghost', color: 'error', className: 'bg-transparent text-error-11 hover:bg-error-3 hover:text-error-11 active:bg-error-3' },
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
  icon: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-sm': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-md': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-lg': 'h-ico-md w-ico-md [&>svg]:h-ico-md [&>svg]:w-ico-md',
}

/** Map button size to spinner size */
const spinnerSizeMap: Record<string, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  icon: 'sm',
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
  /**
   * Async click handler — auto-manages loading → success/error states.
   * When provided, the button shows a spinner while the promise is pending,
   * then briefly flashes green (success) or red (error) before reverting.
   * Overrides `onClick` and `loading` when active.
   */
  onClickAsync?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>
  /** How long (ms) to show the success/error state before reverting. Default: 1500 */
  asyncFeedbackDuration?: number
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
      loading: loadingProp = false,
      loadingPosition = 'start',
      fullWidth = false,
      disabled,
      onClick,
      onClickAsync,
      asyncFeedbackDuration = 1500,
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

    // Async state machine: idle → loading → success | error → idle
    type AsyncState = 'idle' | 'loading' | 'success' | 'error'
    const [asyncState, setAsyncState] = React.useState<AsyncState>('idle')
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()
    const isMountedRef = React.useRef(true)

    React.useEffect(() => () => {
      isMountedRef.current = false
      clearTimeout(timeoutRef.current)
    }, [])

    const handleAsyncClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClickAsync || asyncState !== 'idle') return
      setAsyncState('loading')
      onClickAsync(e)
        .then(() => { if (isMountedRef.current) setAsyncState('success') })
        .catch(() => { if (isMountedRef.current) setAsyncState('error') })
        .finally(() => {
          if (isMountedRef.current) {
            timeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) setAsyncState('idle')
            }, asyncFeedbackDuration)
          }
        })
    }

    const isAsync = !!onClickAsync
    const loading = isAsync ? asyncState === 'loading' : loadingProp
    const isAsyncFeedback = asyncState === 'success' || asyncState === 'error'

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

    // Async feedback: override color to show green/red
    const feedbackColorClass = isAsyncFeedback
      ? asyncState === 'success'
        ? 'bg-success-9 text-accent-fg border-transparent hover:bg-success-9'
        : 'bg-error-9 text-accent-fg border-transparent hover:bg-error-9'
      : undefined

    // Async feedback icon replaces start slot
    const asyncFeedbackIcon = isAsyncFeedback ? (
      <AnimatePresence mode="wait">
        <motion.span
          key={asyncState}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={springs.bouncy}
          className={cn('inline-flex shrink-0 items-center justify-center', iconClass)}
        >
          {asyncState === 'success'
            ? <IconCheck className="h-full w-full" />
            : <IconX className="h-full w-full" />}
        </motion.span>
      </AnimatePresence>
    ) : null

    return (
      <button
        {...props}
        className={cn(
          buttonVariants({ variant: resolvedVariant, color: resolvedColor, size: resolvedSize }),
          fullWidth && 'w-full',
          !loading && !isAsyncFeedback && 'active:scale-[0.97] transition-transform duration-100',
          feedbackColorClass,
          isAsyncFeedback && 'transition-colors duration-200',
          className,
        )}
        ref={ref}
        disabled={disabled || loading || isAsyncFeedback}
        aria-busy={loading || undefined}
        onClick={isAsync ? handleAsyncClick : onClick}
      >
        {isAsyncFeedback ? asyncFeedbackIcon : renderStartSlot()}
        {isAsyncFeedback ? children : renderChildren()}
        {isAsyncFeedback ? null : renderEndSlot()}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
