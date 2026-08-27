'use client'

import { Slot } from '@primitives/react-slot'
import { IconCheck, IconX } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'

import { Dot } from './dot'
import { Icon } from './icon'
import type { IconInput } from './lib/icon-input'
import { durations,springs } from './lib/motion'
import { normalizeIcon } from './lib/normalize-icon'
import { cn } from './lib/utils'

// ── Color map — single source of truth for all badge color × variant combos ──
const colorMap = {
  default: { bg: 'bg-surface-panel-hover', softBg: 'bg-surface-panel-hover', fg: 'text-surface-fg-muted', border: 'border-surface-border-strong', solid: 'bg-neutral-5', solidFg: 'text-surface-fg' },
  accent:  { bg: 'bg-accent-2', softBg: 'bg-accent-3',  fg: 'text-accent-11',  border: 'border-accent-4',  solid: 'bg-accent-9',  solidFg: 'text-accent-fg' },
  error:   { bg: 'bg-error-2', softBg: 'bg-error-3',   fg: 'text-error-11',   border: 'border-error-4',   solid: 'bg-error-9',   solidFg: 'text-error-fg' },
  success: { bg: 'bg-success-2', softBg: 'bg-success-3', fg: 'text-success-11', border: 'border-success-4', solid: 'bg-success-9', solidFg: 'text-success-fg' },
  warning: { bg: 'bg-warning-2', softBg: 'bg-warning-3', fg: 'text-warning-11', border: 'border-warning-4', solid: 'bg-warning-9', solidFg: 'text-warning-fg' },
  info:    { bg: 'bg-info-2', softBg: 'bg-info-3',    fg: 'text-info-11',    border: 'border-info-4',    solid: 'bg-info-9',    solidFg: 'text-info-fg' },
  neutral: { bg: 'bg-surface-panel-hover', softBg: 'bg-surface-panel-hover', fg: 'text-surface-fg-muted', border: 'border-surface-border-strong', solid: 'bg-neutral-5', solidFg: 'text-surface-fg' },
  teal:    { bg: 'bg-category-teal-2', softBg: 'bg-category-teal-3',    fg: 'text-category-teal-11',    border: 'border-category-teal-4',    solid: 'bg-category-teal-9',    solidFg: 'text-category-fg' },
  amber:   { bg: 'bg-category-amber-2', softBg: 'bg-category-amber-3',   fg: 'text-category-amber-11',   border: 'border-category-amber-4',   solid: 'bg-category-amber-9',   solidFg: 'text-category-fg' },
  slate:   { bg: 'bg-category-slate-2', softBg: 'bg-category-slate-3',   fg: 'text-category-slate-11',   border: 'border-category-slate-4',   solid: 'bg-category-slate-9',   solidFg: 'text-category-fg' },
  indigo:  { bg: 'bg-category-indigo-2', softBg: 'bg-category-indigo-3',  fg: 'text-category-indigo-11',  border: 'border-category-indigo-4',  solid: 'bg-category-indigo-9',  solidFg: 'text-category-fg' },
  cyan:    { bg: 'bg-category-cyan-2', softBg: 'bg-category-cyan-3',    fg: 'text-category-cyan-11',    border: 'border-category-cyan-4',    solid: 'bg-category-cyan-9',    solidFg: 'text-category-fg' },
  orange:  { bg: 'bg-category-orange-2', softBg: 'bg-category-orange-3',  fg: 'text-category-orange-11',  border: 'border-category-orange-4',  solid: 'bg-category-orange-9',  solidFg: 'text-category-fg' },
  emerald: { bg: 'bg-category-emerald-2', softBg: 'bg-category-emerald-3', fg: 'text-category-emerald-11', border: 'border-category-emerald-4', solid: 'bg-category-emerald-9', solidFg: 'text-category-fg' },
} as const

/**
 * A palette name. These fourteen ship with the design system; any palette
 * registered in CSS (`[data-palette='…']`) works too, which is why the type
 * stays open. `custom` is the older escape hatch — it drives colour through
 * inline styles from a `--badge-color` variable and is superseded by
 * registering a palette, but still works.
 */
type BadgeColor = keyof typeof colorMap | 'custom' | (string & {})

/**
 * Colour classes per variant. Four lines instead of a 14 × 6 map — the hue
 * arrives via `data-palette` on the element.
 *
 * `subtle` and `soft` map to two different roles on purpose. subtle moved to
 * step 2 and soft stayed at step 3 (design call, Yogin/Goutham 2026-08-24), and
 * the palette contract keeps them as separate roles precisely so that decision
 * survives rather than being averaged away.
 */
function getColorClasses(variant: 'subtle' | 'solid' | 'outline' | 'soft', color: BadgeColor): string {
  if (color === 'custom') return ''
  switch (variant) {
    case 'subtle':  return 'bg-palette-subtle text-palette-text border-palette-border'
    case 'solid':   return 'bg-palette-solid text-palette-fg border-transparent'
    case 'outline': return 'bg-transparent text-palette-text border-palette-border'
    case 'soft':    return 'bg-palette-soft text-palette-text border-transparent'
  }
}

const badgeVariants = cva(
  'relative inline-flex items-center rounded-pill font-sans font-medium overflow-hidden isolate transition-[color,background-color,border-color,padding] duration-fast-02 ease-productive-standard select-none [&>span:not([data-grain])]:relative [&>span:not([data-grain])]:z-[2]',
  {
    variants: {
      variant: {
        subtle: 'border',
        solid: 'border border-transparent',
        outline: 'border',
        soft: 'border border-transparent',
      },
      size: {
        xs: 'h-4 px-ds-02b text-body-xs gap-ds-02',
        sm: 'h-5 px-ds-03 text-body-xs gap-ds-02',
        md: 'h-6 px-2.5 text-body-xs gap-ds-02b', /* px-2.5=10px — no exact DS token */
        lg: 'h-7 px-ds-04 text-body-sm gap-ds-02b',
      },
    },
    defaultVariants: {
      variant: 'subtle',
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
  xs: 'pl-ds-02',
  sm: 'pl-ds-02b',
  md: 'pl-ds-03',
  lg: 'pl-2.5', /* 10px — no exact DS token */
}

/** Reduced right padding when trailing content (dismiss/endIcon) is present */
const paddingRightWithTrailing: Record<string, string> = {
  xs: 'pr-ds-01',
  sm: 'pr-ds-02',
  md: 'pr-ds-02',
  lg: 'pr-ds-02b',
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
  /** Semantic intent or category color. Use `"custom"` with `--badge-color` CSS variable. */
  color?: BadgeColor
  asChild?: boolean
  startIcon?: IconInput
  endIcon?: IconInput
  dot?: boolean
  /** Pulse the status dot (opt-in; static by default). @default false */
  dotPulse?: boolean
  onDismiss?: () => void
  selected?: boolean
  disabled?: boolean
  maxWidth?: number
  /**
   * Truncate children with ellipsis when they overflow the badge width.
   * Use with a fixed width (e.g. `className="w-20"`) or `maxWidth` for
   * constrained pill badges. Always adds a title tooltip on the full text.
   */
  truncate?: boolean
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
      dotPulse,
      onDismiss,
      onClick,
      selected,
      disabled,
      maxWidth,
      truncate,
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
        // `custom` keeps driving colour through inline styles from
        // `--badge-color`; every other value is a palette name.
        data-palette={resolvedColor === 'custom' ? undefined : resolvedColor}
        className={cn(
          badgeVariants({ variant: resolvedVariant, size: resolvedSize }),
          getColorClasses(resolvedVariant, resolvedColor),
          hasLeading && paddingLeftWithIcon[resolvedSize],
          hasTrailing && paddingRightWithTrailing[resolvedSize],
          onClick &&
            'cursor-pointer hover:brightness-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-1 transition-[color,background-color,border-color,transform,filter] duration-moderate-01 ease-productive-exit hover:duration-fast-02 hover:ease-productive-entrance active:scale-[0.95] active:brightness-[0.92] active:duration-[0ms]',
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
        {/* Dot indicator — animated entrance, uses the shared <Dot> (current colour + pulse) */}
        <AnimatePresence>
          {dot && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={springs.snappy}
              className="inline-flex shrink-0"
            >
              <Dot color="current" size="sm" pulse={dotPulse} />
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
            transition={{ type: 'tween', duration: durations.moderate01, ease: [0.2, 0, 0.38, 0.9] }}  /* ease-productive-standard */
            className="inline-flex shrink-0 overflow-hidden"
            aria-hidden={!selected}
          >
            <Icon icon={IconCheck} size="xs" />
          </motion.span>
        )}

        {/* Start icon */}
        {startIcon && (
          <span className={cn('shrink-0', iconSizeMap[resolvedSize])}>{normalizeIcon(startIcon)}</span>
        )}

        {/* Children — with optional truncation */}
        {truncate || maxWidth ? (
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
          <span className={cn('shrink-0', iconSizeMap[resolvedSize])}>{normalizeIcon(endIcon)}</span>
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
              'shrink-0 rounded-pill text-current/60 hover:text-current hover:bg-current/10 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-accent-9',
              resolvedSize === 'xs'
                ? 'p-0 -mr-0.5 min-w-ds-05 min-h-ds-05'
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

import { BadgeGroup } from './badge-group'
import { BadgeIndicator } from './badge-indicator'

const BadgeCompound = Object.assign(Badge, {
  Indicator: BadgeIndicator,
  Group: BadgeGroup,
})

export { BadgeCompound as Badge, type BadgeColor,type BadgeProps, badgeVariants }
