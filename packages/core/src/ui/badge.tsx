'use client'

import { IconCheck, IconX } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from './lib/motion'
import { Slot } from '@primitives/react-slot'
import * as React from 'react'
import { Icon } from './icon'
import { cn } from './lib/utils'

const badgeVariants = cva(
  'relative inline-flex items-center rounded-full font-sans font-medium overflow-hidden isolate transition-[color,background-color,border-color,padding] duration-fast-02 ease-productive-standard select-none [&>span:not([data-grain])]:relative [&>span:not([data-grain])]:z-[2]',
  {
    variants: {
      variant: {
        subtle: 'border',
        solid: 'border border-transparent',
        outline: 'border',
        soft: 'border border-transparent',
      },
      color: {
        default: '',
        accent: '',
        error: '',
        success: '',
        warning: '',
        info: '',
        neutral: '',
        teal: '',
        amber: '',
        slate: '',
        indigo: '',
        cyan: '',
        orange: '',
        emerald: '',
        custom: '',
      },
      size: {
        xs: 'h-4 px-1.5 text-[10px] gap-1',
        sm: 'h-5 px-2 text-ds-xs gap-1',
        md: 'h-6 px-2.5 text-ds-xs gap-1.5',
        lg: 'h-7 px-3 text-ds-sm gap-1.5',
      },
    },
    compoundVariants: [
      // ── subtle × colors ──────────────────────────────────────────
      { variant: 'subtle', color: 'default', className: 'bg-surface-raised-hover text-surface-fg-muted border-surface-border-strong' },
      { variant: 'subtle', color: 'accent', className: 'bg-accent-3 text-accent-11 border-accent-7' },
      { variant: 'subtle', color: 'error', className: 'bg-error-3 text-error-11 border-error-7' },
      { variant: 'subtle', color: 'success', className: 'bg-success-3 text-success-11 border-success-7' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-3 text-warning-11 border-warning-7' },
      { variant: 'subtle', color: 'info', className: 'bg-info-3 text-info-11 border-info-7' },
      { variant: 'subtle', color: 'neutral', className: 'bg-surface-raised-hover text-surface-fg-muted border-surface-border-strong' },
      { variant: 'subtle', color: 'teal', className: 'bg-category-teal-3 text-category-teal-11 border-category-teal-7' },
      { variant: 'subtle', color: 'amber', className: 'bg-category-amber-3 text-category-amber-11 border-category-amber-7' },
      { variant: 'subtle', color: 'slate', className: 'bg-category-slate-3 text-category-slate-11 border-category-slate-7' },
      { variant: 'subtle', color: 'indigo', className: 'bg-category-indigo-3 text-category-indigo-11 border-category-indigo-7' },
      { variant: 'subtle', color: 'cyan', className: 'bg-category-cyan-3 text-category-cyan-11 border-category-cyan-7' },
      { variant: 'subtle', color: 'orange', className: 'bg-category-orange-3 text-category-orange-11 border-category-orange-7' },
      { variant: 'subtle', color: 'emerald', className: 'bg-category-emerald-3 text-category-emerald-11 border-category-emerald-7' },

      // ── solid × colors ───────────────────────────────────────────
      { variant: 'solid', color: 'default', className: 'bg-neutral-5 text-surface-fg border-transparent' },
      { variant: 'solid', color: 'accent', className: 'bg-accent-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'error', className: 'bg-error-9 text-error-fg border-transparent' },
      { variant: 'solid', color: 'success', className: 'bg-success-9 text-success-fg border-transparent' },
      { variant: 'solid', color: 'warning', className: 'bg-warning-9 text-warning-fg border-transparent' },
      { variant: 'solid', color: 'info', className: 'bg-info-9 text-info-fg border-transparent' },
      { variant: 'solid', color: 'neutral', className: 'bg-neutral-5 text-surface-fg border-transparent' },
      { variant: 'solid', color: 'teal', className: 'bg-category-teal-9 text-white border-transparent' },
      { variant: 'solid', color: 'amber', className: 'bg-category-amber-9 text-white border-transparent' },
      { variant: 'solid', color: 'slate', className: 'bg-category-slate-9 text-white border-transparent' },
      { variant: 'solid', color: 'indigo', className: 'bg-category-indigo-9 text-white border-transparent' },
      { variant: 'solid', color: 'cyan', className: 'bg-category-cyan-9 text-white border-transparent' },
      { variant: 'solid', color: 'orange', className: 'bg-category-orange-9 text-white border-transparent' },
      { variant: 'solid', color: 'emerald', className: 'bg-category-emerald-9 text-white border-transparent' },

      // ── outline × colors ─────────────────────────────────────────
      { variant: 'outline', color: 'default', className: 'bg-transparent text-surface-fg-muted border-surface-border-strong' },
      { variant: 'outline', color: 'accent', className: 'bg-transparent text-accent-11 border-accent-7' },
      { variant: 'outline', color: 'error', className: 'bg-transparent text-error-11 border-error-7' },
      { variant: 'outline', color: 'success', className: 'bg-transparent text-success-11 border-success-7' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent text-warning-11 border-warning-7' },
      { variant: 'outline', color: 'info', className: 'bg-transparent text-info-11 border-info-7' },
      { variant: 'outline', color: 'neutral', className: 'bg-transparent text-surface-fg-muted border-surface-border-strong' },
      { variant: 'outline', color: 'teal', className: 'bg-transparent text-category-teal-11 border-category-teal-7' },
      { variant: 'outline', color: 'amber', className: 'bg-transparent text-category-amber-11 border-category-amber-7' },
      { variant: 'outline', color: 'slate', className: 'bg-transparent text-category-slate-11 border-category-slate-7' },
      { variant: 'outline', color: 'indigo', className: 'bg-transparent text-category-indigo-11 border-category-indigo-7' },
      { variant: 'outline', color: 'cyan', className: 'bg-transparent text-category-cyan-11 border-category-cyan-7' },
      { variant: 'outline', color: 'orange', className: 'bg-transparent text-category-orange-11 border-category-orange-7' },
      { variant: 'outline', color: 'emerald', className: 'bg-transparent text-category-emerald-11 border-category-emerald-7' },

      // ── soft × colors ────────────────────────────────────────────
      { variant: 'soft', color: 'default', className: 'bg-surface-raised-hover text-surface-fg-muted border-transparent' },
      { variant: 'soft', color: 'accent', className: 'bg-accent-3 text-accent-11 border-transparent' },
      { variant: 'soft', color: 'error', className: 'bg-error-3 text-error-11 border-transparent' },
      { variant: 'soft', color: 'success', className: 'bg-success-3 text-success-11 border-transparent' },
      { variant: 'soft', color: 'warning', className: 'bg-warning-3 text-warning-11 border-transparent' },
      { variant: 'soft', color: 'info', className: 'bg-info-3 text-info-11 border-transparent' },
      { variant: 'soft', color: 'neutral', className: 'bg-surface-raised-hover text-surface-fg-muted border-transparent' },
      { variant: 'soft', color: 'teal', className: 'bg-category-teal-3 text-category-teal-11 border-transparent' },
      { variant: 'soft', color: 'amber', className: 'bg-category-amber-3 text-category-amber-11 border-transparent' },
      { variant: 'soft', color: 'slate', className: 'bg-category-slate-3 text-category-slate-11 border-transparent' },
      { variant: 'soft', color: 'indigo', className: 'bg-category-indigo-3 text-category-indigo-11 border-transparent' },
      { variant: 'soft', color: 'cyan', className: 'bg-category-cyan-3 text-category-cyan-11 border-transparent' },
      { variant: 'soft', color: 'orange', className: 'bg-category-orange-3 text-category-orange-11 border-transparent' },
      { variant: 'soft', color: 'emerald', className: 'bg-category-emerald-3 text-category-emerald-11 border-transparent' },
    ],
    defaultVariants: {
      variant: 'subtle',
      color: 'default',
      size: 'md',
    },
  },
)

/** Icon sizing per badge size */
const iconSizeMap: Record<string, string> = {
  xs: '[&>svg]:h-2.5 [&>svg]:w-2.5',
  sm: '[&>svg]:h-3 [&>svg]:w-3',
  md: '[&>svg]:h-3 [&>svg]:w-3',
  lg: '[&>svg]:h-3.5 [&>svg]:w-3.5',
}

/** Reduced left padding when leading content (icon/dot/selected) is present */
const paddingLeftWithIcon: Record<string, string> = {
  xs: 'pl-1',
  sm: 'pl-1.5',
  md: 'pl-2',
  lg: 'pl-2.5',
}

/** Reduced right padding when trailing content (dismiss/endIcon) is present */
const paddingRightWithTrailing: Record<string, string> = {
  xs: 'pr-0.5',
  sm: 'pr-1',
  md: 'pr-1',
  lg: 'pr-1.5',
}

/**
 * Badge — a compact inline label with a two-axis variant system.
 *
 * **Two axes:**
 * - `variant` controls **visual style**: `"subtle"` | `"solid"` | `"outline"` | `"soft"`
 * - `color` controls **semantic intent/category**: 16 built-in colors + `"custom"` (CSS variable)
 *
 * **Interactive:** Pass `onClick` to make it a button. Pass `selected` for toggle state.
 * **Dismissible:** Pass `onDismiss` to show a dismiss button.
 * **Custom colors:** Set `color="custom"` and CSS variable `--badge-color` on a parent or via `style`.
 * For light custom colors on solid variant, set `--badge-fg-color` to a dark value.
 *
 * @example
 * <Badge color="success">Active</Badge>
 *
 * @example
 * <Badge variant="solid" size="sm" dot>3 new</Badge>
 *
 * @example
 * <Badge color="custom" style={{ '--badge-color': '#8b5cf6' } as React.CSSProperties}>
 *   Custom
 * </Badge>
 */
interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  startIcon?: React.ReactElement | null
  endIcon?: React.ReactElement | null
  dot?: boolean
  onDismiss?: () => void
  selected?: boolean
  disabled?: boolean
  maxWidth?: number
  circle?: boolean
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  (
    {
      className,
      variant,
      color,
      size,
      asChild,
      startIcon,
      endIcon,
      dot,
      onDismiss,
      onClick,
      selected,
      disabled,
      maxWidth,
      circle,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant = variant ?? 'subtle'
    const resolvedColor = color ?? 'default'
    const resolvedSize = size ?? 'md'

    // When both onClick + onDismiss, use div with role="button" to avoid nested <button>
    const Comp = asChild
      ? Slot
      : onClick && onDismiss
        ? 'div'
        : onClick
          ? 'button'
          : 'span'

    // Custom color inline styles via CSS variable
    const customStyles =
      resolvedColor === 'custom'
        ? {
            ...(resolvedVariant === 'subtle' && {
              backgroundColor: 'color-mix(in oklch, var(--badge-color) 15%, transparent)',
              color: 'var(--badge-color)',
              borderColor: 'color-mix(in oklch, var(--badge-color) 40%, transparent)',
            }),
            ...(resolvedVariant === 'solid' && {
              backgroundColor: 'var(--badge-color)',
              color: 'var(--badge-fg-color, white)',
              borderColor: 'transparent',
            }),
            ...(resolvedVariant === 'outline' && {
              backgroundColor: 'transparent',
              color: 'var(--badge-color)',
              borderColor: 'color-mix(in oklch, var(--badge-color) 50%, transparent)',
            }),
            ...(resolvedVariant === 'soft' && {
              backgroundColor: 'color-mix(in oklch, var(--badge-color) 12%, transparent)',
              color: 'var(--badge-color)',
              borderColor: 'transparent',
            }),
          }
        : undefined

    // Keyboard handler for div[role="button"] (onClick + onDismiss case)
    const handleKeyDown =
      onClick && onDismiss
        ? (e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!disabled) onClick(e as unknown as React.MouseEvent<HTMLElement>)
            }
            props.onKeyDown?.(e)
          }
        : props.onKeyDown

    const hasLeading = !!(dot || startIcon || (onClick && selected && !startIcon && !dot))
    const hasTrailing = !!(onDismiss || endIcon)

    return (
      <Comp
        ref={ref as React.Ref<never>}
        className={cn(
          badgeVariants({ variant: resolvedVariant, color: resolvedColor, size: resolvedSize }),
          hasLeading && paddingLeftWithIcon[resolvedSize],
          hasTrailing && paddingRightWithTrailing[resolvedSize],
          onClick &&
            'cursor-pointer hover:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-1 transition-[color,background-color,border-color,transform,filter] duration-moderate-01 ease-productive-exit hover:duration-fast-02 hover:ease-productive-entrance active:scale-[0.95] active:brightness-[0.92] active:duration-[0ms]',
          selected && 'ring-1 ring-current/20 transition-shadow duration-fast-02',
          disabled && 'opacity-action-disabled pointer-events-none saturate-[0.3]',
          circle && 'justify-center px-0 aspect-square',
          className,
        )}
        style={{ ...style, ...customStyles, ...(maxWidth ? { maxWidth } : undefined) }}
        onClick={disabled ? undefined : (onClick as React.MouseEventHandler<HTMLElement>)}
        onKeyDown={handleKeyDown}
        {...(Comp === 'button' && { type: 'button' as const })}
        {...(Comp === 'button' && disabled ? { disabled: true } : {})}
        {...(Comp === 'div' && onClick ? { role: 'button' as const, tabIndex: 0 } : {})}
        {...props}
      >
        {/* Dot indicator — animated entrance + continuous pulse */}
        <AnimatePresence>
          {dot && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={springs.snappy}
              className="relative inline-flex h-1.5 w-1.5 shrink-0"
              aria-hidden="true"
            >
              <motion.span
                className="absolute inset-0 rounded-full bg-current"
                animate={{ scale: [1, 2.5], opacity: [0.35, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 0.3, duration: 1.2, ease: [0, 0, 0.58, 1] }}
              />
              <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Selected check icon — always mounted for interactive badges */}
        {onClick && !startIcon && !dot && (
          <motion.span
            initial={false}
            animate={selected
              ? { opacity: 1, scale: 1, width: 'auto', marginRight: 0 }
              : { opacity: 0, scale: 0.5, width: 0, marginRight: -4 }
            }
            transition={{ type: 'tween', duration: 0.15, ease: [0.2, 0, 0.38, 0.9] }}  /* ease-productive-standard */
            className="inline-flex shrink-0 overflow-hidden"
            aria-hidden={!selected}
          >
            <Icon icon={IconCheck} size="xs" />
          </motion.span>
        )}

        {/* Start icon */}
        {startIcon && (
          <span className={cn('shrink-0', iconSizeMap[resolvedSize])}>{startIcon}</span>
        )}

        {/* Children — with optional truncation */}
        {maxWidth ? (
          <span
            className="truncate"
            title={typeof children === 'string' ? children : undefined}
          >
            {children}
          </span>
        ) : (
          children
        )}

        {/* End icon */}
        {endIcon && (
          <span className={cn('shrink-0', iconSizeMap[resolvedSize])}>{endIcon}</span>
        )}

        {/* Dismiss button */}
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
            className={cn(
              'shrink-0 rounded-full text-current/60 hover:text-current hover:bg-current/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-9',
              resolvedSize === 'xs'
                ? 'p-0 -mr-0.5 min-w-[16px] min-h-[16px]'
                : 'p-px',
            )}
            aria-label={
              `Remove ${typeof children === 'string' ? children : ''}`.trim() || 'Remove'
            }
          >
            <Icon icon={IconX} size="xs" />
          </button>
        )}
      </Comp>
    )
  },
)
Badge.displayName = 'Badge'

import { BadgeIndicator } from './badge-indicator'
import { BadgeGroup } from './badge-group'

const BadgeCompound = Object.assign(Badge, {
  Indicator: BadgeIndicator,
  Group: BadgeGroup,
})

export { BadgeCompound as Badge, badgeVariants, type BadgeProps }
