'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { IconCheck, IconX } from '@tabler/icons-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Slot, Slottable } from '@primitives/react-slot'
import * as React from 'react'
import { useButtonGroup } from './button-group'
import { Icon } from './icon'
import { IconProvider } from './icon-context'
import type { IconSize } from './icon-context'
import { springs, tweens, motionProps } from './lib/motion'
import { ProcessingOverlay } from './button-processing'
import type { ProcessingSpeed } from './button-processing'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap font-sans select-none overflow-hidden isolate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled disabled:cursor-not-allowed disabled:saturate-[0.3] [&>span:not([data-grain])]:relative [&>span:not([data-grain])]:z-[2]',
  {
    variants: {
      variant: {
        solid: '',
        soft: '',
        outline: 'border',
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
        xs: 'h-ds-xs-plus rounded-ds-md px-ds-03 text-ds-sm gap-1',
        sm: 'h-ds-sm rounded-ds-md px-ds-04 text-ds-sm gap-1.5',
        md: 'h-ds-md rounded-ds-lg px-ds-05 text-ds-md gap-2',
        lg: 'h-ds-lg rounded-ds-xl px-ds-06 text-ds-base gap-2.5',
        'compact-xs': 'rounded-ds-md px-ds-02 py-[3px] text-ds-sm gap-1',
        'compact-sm': 'rounded-ds-md px-ds-03 py-[5px] text-ds-sm gap-1.5',
        'compact-md': 'rounded-ds-lg px-ds-04 py-ds-03 text-ds-md gap-2',
        icon: 'h-ds-md w-ds-md rounded-ds-md',
        'icon-xs': 'h-ds-xs-plus w-ds-xs-plus rounded-ds-sm',
        'icon-sm': 'h-ds-sm w-ds-sm rounded-ds-md',
        'icon-md': 'h-ds-md w-ds-md rounded-ds-md',
        'icon-lg': 'h-ds-lg w-ds-lg rounded-ds-lg',
      },
    },
    compoundVariants: [
      // ============ SOLID ============ (colored hover shadows — shadow tints with the button's own hue)
      { variant: 'solid', color: 'accent',  className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'solid', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 shadow-raised hover:shadow-error' },
      { variant: 'solid', color: 'success', className: 'bg-success-9 text-success-fg hover:bg-success-10 shadow-raised hover:shadow-success' },
      { variant: 'solid', color: 'warning', className: 'bg-warning-9 text-warning-fg hover:bg-warning-10 shadow-raised hover:shadow-warning' },
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

/** Extra horizontal padding for pill shape — rounded ends eat into visual space */
const pillPaddingClass: Record<string, string> = {
  xs:           'px-ds-04',
  sm:           'px-ds-05',
  md:           'px-ds-06',
  lg:           'px-ds-07',
  'compact-xs': 'px-ds-03',
  'compact-sm': 'px-ds-04',
  'compact-md': 'px-ds-05',
}

/** Negative margin to tighten icon side padding — pulls icon closer to button edge */
const iconInsetClass: Record<string, { start: string; end: string }> = {
  xs:           { start: '-ml-0.5', end: '-mr-0.5' },
  sm:           { start: '-ml-1',   end: '-mr-1' },
  md:           { start: '-ml-1.5', end: '-mr-1.5' },
  lg:           { start: '-ml-2',   end: '-mr-2' },
  'compact-xs': { start: '-ml-0.5', end: '-mr-0.5' },
  'compact-sm': { start: '-ml-0.5', end: '-mr-0.5' },
  'compact-md': { start: '-ml-1',   end: '-mr-1' },
  icon:         { start: '', end: '' },
  'icon-xs':    { start: '', end: '' },
  'icon-sm':    { start: '', end: '' },
  'icon-md':    { start: '', end: '' },
  'icon-lg':    { start: '', end: '' },
}

/** Map button size to spinner size */
const BUTTON_TO_SPINNER_SIZE: Record<string, 'sm' | 'md'> = {
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

/** Map button size to Icon context size */
const BUTTON_TO_ICON_SIZE: Record<string, IconSize> = {
  xs: 'xs', sm: 'sm', md: 'md', lg: 'lg',
  'compact-xs': 'xs', 'compact-sm': 'sm', 'compact-md': 'md',
  icon: 'md', 'icon-xs': 'xs', 'icon-sm': 'sm', 'icon-md': 'md', 'icon-lg': 'lg',
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
 * <Button variant="soft" color="success" startIcon={<Icon icon={IconCheck} />}>
 *   Approved
 * </Button>
 *
 * @example
 * // Destructive delete with loading state:
 * <Button variant="solid" color="error" startIcon={<Icon icon={IconTrash} />} loading={isDeleting}>
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
 * <Button variant="ghost" size="sm" startIcon={<Icon icon={IconEdit} />}>
 *   Edit
 * </Button>
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Button shape — 'pill' applies rounded-full for chip/tag-like buttons */
  shape?: 'default' | 'pill'
  /** Icon element rendered before children — use <Icon icon={...} /> */
  startIcon?: React.ReactElement | null
  /** Icon element rendered after children — use <Icon icon={...} /> */
  endIcon?: React.ReactElement | null
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

  /**
   * Show processing animation — animated border/glow while content stays visible.
   * `true` = "working" speed. Semantic speeds:
   * - `"ambient"` (3s) — background sync, file upload
   * - `"working"` (2s) — standard API call, generation
   * - `"urgent"` (1s) — retry, nearly done
   */
  processing?: boolean | 'ambient' | 'working' | 'urgent'

  /** Override processing animation color. Defaults to button's own color. */
  processingColor?: 'accent' | 'error' | 'success' | 'warning' | 'neutral'

  /** Processing visual style. 'ants' = rotating border, 'glow' = breathing shadow. Default: 'ants' */
  processingStyle?: 'ants' | 'glow'

  /** Disable button during processing. Default: true. Set false for cancel-by-click patterns. */
  processingDisabled?: boolean
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
      shape,
      startIcon,
      endIcon,
      loading: loadingProp = false,
      loadingPosition = 'start',
      fullWidth = false,
      disabled,
      onClick,
      onClickAsync,
      asyncFeedbackDuration = 1500,
      processing: processingProp,
      processingColor,
      processingStyle = 'ants',
      processingDisabled = true,
      children,
      ...props
    },
    ref,
  ) => {
    const group = useButtonGroup()
    const resolvedVariant = variant ?? group.variant
    const resolvedColor = color ?? group.color
    const resolvedWeight = weight ?? group.weight ?? 'semibold'
    const resolvedShape = shape ?? group.shape ?? 'default'
    const resolvedSize = size ?? group.size ?? 'md'

    const prefersReduced = useReducedMotion()

    const processingSpeed: ProcessingSpeed | undefined = processingProp === true ? 'working'
      : processingProp === false || !processingProp ? undefined
      : processingProp
    const isProcessing = !!processingSpeed
    const resolvedProcessingColor = processingColor ?? (resolvedColor === 'default' ? 'accent' : resolvedColor) ?? 'accent'

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

    if (asChild) {
      // Slot merges all props into the child element via cloneElement at runtime.
      // We cast here because SlotProps only types React.HTMLAttributes<HTMLElement>,
      // which excludes button-specific attrs like `disabled`.
      const slotProps = {
        className: cn(
          buttonVariants({ variant: resolvedVariant, color: resolvedColor, weight: resolvedWeight, size: resolvedSize }),
          resolvedShape === 'pill' && 'rounded-full',
          resolvedShape === 'pill' && pillPaddingClass[resolvedSize],
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

    const inset = iconInsetClass[resolvedSize] ?? { start: '', end: '' }
    // Dim icons on filled variants (Radix pattern — icon is decorative, text is primary)
    const dimIcon = resolvedVariant === 'solid' || resolvedVariant === 'soft' || resolvedVariant === 'outline'

    const renderStartSlot = () => {
      if (loading && loadingPosition === 'start') {
        return (
          <motion.span layout={!prefersReduced} className={cn('inline-flex shrink-0 items-center justify-center', startIcon && inset.start)}>
            <Spinner size={BUTTON_TO_SPINNER_SIZE[resolvedSize]} variant="bare" />
          </motion.span>
        )
      }
      if (startIcon) {
        return (
          <motion.span layout={!prefersReduced} className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', inset.start, dimIcon && 'opacity-90')}>
            {startIcon}
          </motion.span>
        )
      }
      return null
    }

    const renderEndSlot = () => {
      if (loading && loadingPosition === 'end') {
        return (
          <motion.span layout={!prefersReduced} className={cn('inline-flex shrink-0 items-center justify-center', endIcon && inset.end)}>
            <Spinner size={BUTTON_TO_SPINNER_SIZE[resolvedSize]} variant="bare" />
          </motion.span>
        )
      }
      if (endIcon) {
        return (
          <motion.span layout={!prefersReduced} className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', inset.end, dimIcon && 'opacity-90')}>
            {endIcon}
          </motion.span>
        )
      }
      return null
    }

    // Separate DevalokGrain elements (need to be direct button children for absolute positioning)
    // from text/other content (needs z-elevation above grain)
    const childArray = React.Children.toArray(children)
    const grainElements: React.ReactNode[] = []
    const contentElements: React.ReactNode[] = []
    childArray.forEach((child) => {
      if (React.isValidElement(child) && (child.type as { displayName?: string })?.displayName === 'DevalokGrain') {
        grainElements.push(child)
      } else {
        contentElements.push(child)
      }
    })

    const renderChildren = () => {
      if (loading && loadingPosition === 'center') {
        return (
          <span className="relative inline-flex items-center justify-center">
            <span className="invisible">{contentElements}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size={BUTTON_TO_SPINNER_SIZE[resolvedSize]} variant="bare" />
            </span>
          </span>
        )
      }
      // Only wrap in z-elevated span when grain is present (to sit above grain layers).
      // Without grain, render children directly to preserve flex layout.
      if (grainElements.length > 0) {
        return <span>{contentElements}</span>
      }
      return <>{contentElements}</>
    }

    // Async feedback: override color to show green/red
    const feedbackColorClass = isAsyncFeedback
      ? asyncState === 'success'
        ? 'bg-success-9 text-accent-fg border-transparent hover:bg-success-9'
        : 'bg-error-9 text-accent-fg border-transparent hover:bg-error-9'
      : undefined

    // Async feedback icon replaces start slot (same inset as normal icon for layout stability)
    const asyncFeedbackIcon = isAsyncFeedback ? (
      <span className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', startIcon && inset.start)}>
        <AnimatePresence mode="wait">
          <motion.span
            key={asyncState}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={springs.bouncy}
            className="inline-flex items-center justify-center"
          >
            <Icon icon={asyncState === 'success' ? IconCheck : IconX} />
          </motion.span>
        </AnimatePresence>
      </span>
    ) : null

    const iconSize = BUTTON_TO_ICON_SIZE[resolvedSize] ?? 'md'

    return (
      <IconProvider size={iconSize}>
        <motion.button
          layout={!prefersReduced}
          transition={{ layout: tweens.layout }}
          {...motionProps(props)}
          className={cn(
            buttonVariants({ variant: resolvedVariant, color: resolvedColor, weight: resolvedWeight, size: resolvedSize }),
            resolvedShape === 'pill' && 'rounded-full',
            resolvedShape === 'pill' && pillPaddingClass[resolvedSize],
            fullWidth && 'w-full',
            // Asymmetric timing: hover-out is slow+relaxed, hover-in is fast+snappy (applied via hover: override)
            !loading && !isAsyncFeedback && 'transition-[color,background-color,border-color,box-shadow,transform,filter] duration-moderate-01 ease-productive-exit',
            !loading && !isAsyncFeedback && 'hover:duration-fast-02 hover:ease-productive-entrance',
            !loading && !isAsyncFeedback && 'active:scale-[0.95] active:brightness-[0.92] active:saturate-[1.1] active:duration-[0ms]',
            feedbackColorClass,
            isAsyncFeedback && 'transition-colors duration-moderate-01 ease-productive-standard',
            className,
          )}
          ref={ref}
          disabled={disabled || loading || isAsyncFeedback || (isProcessing && processingDisabled)}
          aria-busy={loading || isProcessing || undefined}
          onClick={isAsync ? handleAsyncClick : onClick}
        >
          {/* Grain layers render as direct children (need absolute positioning) */}
          {grainElements}
          {/* Processing overlay */}
          {isProcessing && (
            <ProcessingOverlay
              active={isProcessing}
              speed={processingSpeed!}
              style={processingStyle}
              color={resolvedProcessingColor}
            />
          )}
          {/* Content renders above grain via z-[2] span wrapper */}
          {isAsyncFeedback ? asyncFeedbackIcon : renderStartSlot()}
          {isAsyncFeedback ? contentElements : renderChildren()}
          {isAsyncFeedback ? null : renderEndSlot()}
        </motion.button>
      </IconProvider>
    )
  },
)
Button.displayName = 'Button'

export { Button }
