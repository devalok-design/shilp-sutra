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
  'inline-flex items-center justify-center whitespace-nowrap font-sans select-none border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled disabled:cursor-not-allowed disabled:saturate-[0.3]',
  {
    variants: {
      variant: {
        solid: '',
        soft: '',
        outline: '',
        ghost: '',
        link: 'underline-offset-4 hover:underline active:opacity-80',
        // Deprecated aliases
        default: '',
        destructive: '',
      },
      color: {
        accent: '',
        error: '',
        success: '',
        warning: '',
        neutral: '',
        // Deprecated alias
        default: '',
      },
      weight: {
        semibold: 'font-semibold',
        normal: 'font-normal',
      },
      size: {
        xs: 'h-ds-xs-plus rounded-ds-sm px-ds-03 text-ds-sm gap-1',
        sm: 'h-ds-sm rounded-ds-md px-ds-04 text-ds-sm gap-1.5',
        md: 'h-ds-md rounded-ds-md px-ds-05 text-ds-md gap-2',
        lg: 'h-ds-lg rounded-ds-lg px-ds-06 text-ds-base gap-2.5',
        'compact-xs': 'rounded-ds-sm px-ds-02 py-ds-01 text-ds-sm gap-1',
        'compact-sm': 'rounded-ds-md px-ds-03 py-[5px] text-ds-sm gap-1.5',
        'compact-md': 'rounded-ds-md px-ds-04 py-ds-02 text-ds-md gap-2',
        icon: 'h-ds-md w-ds-md rounded-ds-md',
        'icon-xs': 'h-ds-xs-plus w-ds-xs-plus rounded-ds-sm',
        'icon-sm': 'h-ds-sm w-ds-sm rounded-ds-md',
        'icon-md': 'h-ds-md w-ds-md rounded-ds-md',
        'icon-lg': 'h-ds-lg w-ds-lg rounded-ds-lg',
      },
    },
    compoundVariants: [
      // ============ SOLID ============
      { variant: 'solid', color: 'accent',  className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'solid', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 shadow-raised' },
      { variant: 'solid', color: 'success', className: 'bg-success-9 text-success-fg hover:bg-success-10 shadow-raised' },
      { variant: 'solid', color: 'warning', className: 'bg-warning-9 text-warning-fg hover:bg-warning-10 shadow-raised' },
      { variant: 'solid', color: 'neutral', className: 'bg-neutral-5 text-surface-fg hover:bg-neutral-7 shadow-raised' },

      // ============ SOFT ============
      { variant: 'soft', color: 'accent',  className: 'bg-accent-3 text-accent-11 hover:bg-accent-4 active:bg-accent-5' },
      { variant: 'soft', color: 'error',   className: 'bg-error-3 text-error-11 hover:bg-error-4 active:bg-error-5' },
      { variant: 'soft', color: 'success', className: 'bg-success-3 text-success-11 hover:bg-success-4 active:bg-success-5' },
      { variant: 'soft', color: 'warning', className: 'bg-warning-3 text-warning-11 hover:bg-warning-4 active:bg-warning-5' },
      { variant: 'soft', color: 'neutral', className: 'bg-surface-raised-hover text-surface-fg-muted hover:bg-surface-raised-active active:bg-neutral-5' },

      // ============ OUTLINE ============
      { variant: 'outline', color: 'accent',  className: 'bg-transparent text-accent-11 border-accent-7 hover:bg-accent-3 active:bg-accent-4' },
      { variant: 'outline', color: 'error',   className: 'bg-transparent text-error-11 border-error-7 hover:bg-error-3 active:bg-error-4' },
      { variant: 'outline', color: 'success', className: 'bg-transparent text-success-11 border-success-7 hover:bg-success-3 active:bg-success-4' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent text-warning-11 border-warning-7 hover:bg-warning-3 active:bg-warning-4' },
      { variant: 'outline', color: 'neutral', className: 'bg-transparent text-surface-fg border-surface-border-strong hover:bg-surface-raised-hover active:bg-surface-raised-active' },

      // ============ GHOST ============
      // ghost+accent uses neutral look for backward compat (most common ghost is toolbar/icon ghost)
      { variant: 'ghost', color: 'accent',  className: 'bg-transparent text-surface-fg-muted hover:bg-surface-raised-hover hover:text-surface-fg active:bg-surface-raised-active' },
      { variant: 'ghost', color: 'error',   className: 'bg-transparent text-error-11 hover:bg-error-3 active:bg-error-4' },
      { variant: 'ghost', color: 'success', className: 'bg-transparent text-success-11 hover:bg-success-3 active:bg-success-4' },
      { variant: 'ghost', color: 'warning', className: 'bg-transparent text-warning-11 hover:bg-warning-3 active:bg-warning-4' },
      { variant: 'ghost', color: 'neutral', className: 'bg-transparent text-surface-fg-muted hover:bg-surface-raised-hover hover:text-surface-fg active:bg-surface-raised-active' },

      // ============ LINK ============
      { variant: 'link', color: 'accent',  className: 'text-accent-11' },
      { variant: 'link', color: 'error',   className: 'text-error-11' },
      { variant: 'link', color: 'success', className: 'text-success-11' },
      { variant: 'link', color: 'warning', className: 'text-warning-11' },
      { variant: 'link', color: 'neutral', className: 'text-surface-fg-muted' },

      // ============ DEPRECATED ALIASES ============
      // "default" variant → solid
      { variant: 'default', color: 'accent',  className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'default', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 shadow-raised' },
      { variant: 'default', color: 'default', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised hover:shadow-brand' },
      // "destructive" → solid + error (ignores color prop)
      { variant: 'destructive', color: 'accent',  className: 'bg-error-9 text-error-fg hover:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'default', className: 'bg-error-9 text-error-fg hover:bg-error-10 shadow-raised' },
      // "default" color alias → accent
      { variant: 'solid',   color: 'default', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'soft',    color: 'default', className: 'bg-accent-3 text-accent-11 hover:bg-accent-4 active:bg-accent-5' },
      { variant: 'outline', color: 'default', className: 'bg-transparent text-accent-11 border-accent-7 hover:bg-accent-3 active:bg-accent-4' },
      { variant: 'ghost',   color: 'default', className: 'bg-transparent text-surface-fg-muted hover:bg-surface-raised-hover hover:text-surface-fg active:bg-surface-raised-active' },
      { variant: 'link',    color: 'default', className: 'text-accent-11' },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'accent',
      weight: 'semibold',
      size: 'md',
    },
  },
)

/** Map button size to icon wrapper size class */
const iconSizeClass: Record<string, string> = {
  xs: 'h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5',
  sm: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  md: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  lg: 'h-ico-md w-ico-md [&>svg]:h-ico-md [&>svg]:w-ico-md',
  'compact-xs': 'h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5',
  'compact-sm': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'compact-md': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  icon: 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-xs': 'h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5',
  'icon-sm': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-md': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'icon-lg': 'h-ico-md w-ico-md [&>svg]:h-ico-md [&>svg]:w-ico-md',
}

/** Map button size to spinner size */
const spinnerSizeMap: Record<string, 'sm' | 'md'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  'compact-xs': 'sm',
  'compact-sm': 'sm',
  'compact-md': 'sm',
  icon: 'sm',
  'icon-xs': 'sm',
  'icon-sm': 'sm',
  'icon-md': 'sm',
  'icon-lg': 'md',
}

/**
 * Props for Button — the primary action component with a two-axis variant system,
 * multiple size options, icon slots, and a built-in loading state.
 *
 * **Two axes:**
 * - `variant` controls **visual style**: `"solid"` (default, filled) | `"soft"` (tinted bg) |
 *   `"outline"` (bordered) | `"ghost"` (transparent, for toolbars) | `"link"` (underline, inline)
 * - `color` controls **semantic intent**: `"accent"` (default, brand) | `"error"` (destructive) |
 *   `"success"` | `"warning"` | `"neutral"` (subdued)
 *
 * **Sizes:** `xs` | `sm` | `md` (default) | `lg` for text buttons;
 * `compact-xs` | `compact-sm` | `compact-md` for height-less inline buttons;
 * `icon` | `icon-xs` | `icon-sm` | `icon-md` | `icon-lg` for square icon-only buttons.
 *
 * **Shape:** `"default"` uses per-size border-radius; `"pill"` applies `rounded-full`.
 *
 * **Weight:** `"semibold"` (default) | `"normal"` for lighter labels.
 *
 * **Note:** `ghost` + `accent` renders with neutral styling for backward compat —
 * most ghost buttons are toolbar/icon actions where neutral is expected.
 *
 * **Loading:** When `loading={true}` the button is disabled and aria-busy is set.
 * Use `loadingPosition` to control where the spinner appears.
 *
 * @example
 * // Primary save action (default variant + color):
 * <Button onClick={handleSave}>Save changes</Button>
 *
 * @example
 * // Soft success feedback:
 * <Button variant="soft" color="success" startIcon={<IconCheck />}>
 *   Approved
 * </Button>
 *
 * @example
 * // Destructive delete with loading state:
 * <Button variant="solid" color="error" startIcon={<IconTrash />} loading={isDeleting}>
 *   Delete project
 * </Button>
 *
 * @example
 * // Compact pill tag:
 * <Button variant="soft" color="warning" size="compact-sm" shape="pill">
 *   Overdue
 * </Button>
 *
 * @example
 * // Ghost toolbar action:
 * <Button variant="ghost" size="sm" startIcon={<IconEdit />}>
 *   Edit
 * </Button>
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Button shape — 'pill' applies rounded-full for chip/tag-like buttons */
  shape?: 'default' | 'pill'
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
      weight,
      size,
      asChild = false,
      shape = 'default',
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
    const resolvedWeight = weight ?? 'semibold'
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
          buttonVariants({ variant: resolvedVariant, color: resolvedColor, weight: resolvedWeight, size: resolvedSize }),
          shape === 'pill' && 'rounded-full',
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
          <span className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', iconClass)}>
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
          <span className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', iconClass)}>
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
          buttonVariants({ variant: resolvedVariant, color: resolvedColor, weight: resolvedWeight, size: resolvedSize }),
          shape === 'pill' && 'rounded-full',
          fullWidth && 'w-full',
          !loading && !isAsyncFeedback && 'active:scale-[0.95] transition-[color,background-color,border-color,box-shadow,transform,filter] duration-fast-01 ease-productive-standard',
          !loading && !isAsyncFeedback && 'active:brightness-[0.92] active:saturate-[1.1]',
          feedbackColorClass,
          isAsyncFeedback && 'transition-colors duration-moderate-01 ease-productive-standard',
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
