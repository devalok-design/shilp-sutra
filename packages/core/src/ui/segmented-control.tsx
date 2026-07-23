'use client'

import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { IconProvider } from './icon-context'
import type { IconInput } from './lib/icon-input'
import { normalizeIcon } from './lib/normalize-icon'
import { cn } from './lib/utils'

/* ── Types ─────────────────────────────────────────────────── */

export type SegmentedControlSize = 'sm' | 'md' | 'lg'
export type SegmentedControlVariant = 'soft' | 'solid'

/** @deprecated `variant="default"` was renamed to `"soft"`. Still accepted at
 *  runtime (maps to `"soft"`); update call sites — the alias is removed in a
 *  future major. */
type DeprecatedVariant = 'default'

export interface SegmentedControlOption {
  id: string
  /** Visible label. Accepts a `ReactNode` so an option can carry a count badge
   *  or custom node, not just a string. Optional — omit for an icon-only
   *  segment, in which case set `ariaLabel`. */
  text?: React.ReactNode
  /** Optional icon rendered before the text label. Accepts any `IconInput`. */
  icon?: IconInput
  /** Accessible name for the segment. Required for icon-only segments (no
   *  `text`); otherwise the visible text provides the name. */
  ariaLabel?: string
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'defaultValue'> {
  size?: SegmentedControlSize
  variant?: SegmentedControlVariant | DeprecatedVariant
  options: SegmentedControlOption[]
  /** Selected option id (controlled). Aligns with Tabs/ToggleGroup. */
  value?: string
  /** Initial selected id for uncontrolled mode. Ignored when `value` is set;
   *  defaults to the first option. */
  defaultValue?: string
  /** Fires with the newly-selected id (both modes). */
  onValueChange?: (id: string) => void
  disabled?: boolean
  /** Fill the container: segments split the available width equally instead of
   *  hugging their content. Use for full-width toggles and view switchers. */
  fullWidth?: boolean

  /** @deprecated Use `value`. Still accepted; kept for back-compat. */
  selectedId?: string
  /** @deprecated Use `onValueChange`. Still accepted; kept for back-compat. */
  onSelect?: (id: string) => void
}

/* ── RTL detection ─────────────────────────────────────────────
 * Reads the nearest `dir` attribute (testable, the common case), falling
 * back to the computed style for CSS-set direction. In RTL the horizontal
 * arrow keys invert so Arrow keys always track reading order. */

function isRtl(el: HTMLElement | null): boolean {
  if (!el) return false
  const dirEl = el.closest('[dir]') as HTMLElement | null
  if (dirEl) return (dirEl.getAttribute('dir') ?? '').toLowerCase() === 'rtl'
  try {
    return getComputedStyle(el).direction === 'rtl'
  } catch {
    return false
  }
}

/* ── Size config ───────────────────────────────────────────── */

const sizeConfig = {
  sm: { button: 'h-7 px-ds-04 text-body-sm', icon: 'h-3.5 w-3.5' },
  md: { button: 'h-8 px-ds-05 text-body-md', icon: 'h-4 w-4' },
  lg: { button: 'h-10 px-ds-06 text-body-md', icon: 'h-4 w-4' },
} as const

/* ── Thumb (sliding indicator) styles per variant ──────────────
 * The track carries no border/inset (see tokens/semantic.css
 * --color-segment-track), so the thumb defines its own edge with a
 * single ring-less soft shadow (--shadow-segment). */

const thumbStyles = {
  soft: 'bg-segment-thumb shadow-segment',
  solid: 'bg-accent-9 shadow-segment',
} as const

const selectedTextStyles = {
  soft: 'text-surface-fg',
  solid: 'text-accent-fg',
} as const

/* ── SegmentedControl ──────────────────────────────────────── */

const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      size = 'md',
      variant = 'soft',
      options,
      value,
      defaultValue,
      onValueChange,
      selectedId,
      onSelect,
      disabled = false,
      fullWidth = false,
      className,
      ...props
    },
    ref,
  ) {
    const instanceId = React.useId()
    const tablistRef = React.useRef<HTMLDivElement | null>(null)
    const reduceMotion = useReducedMotion()

    // Back-compat: 'default' was renamed to 'soft'. Map silently.
    const resolvedVariant: SegmentedControlVariant = variant === 'default' ? 'soft' : variant

    // Controlled/uncontrolled resolution. `value` is canonical; `selectedId` is
    // the deprecated alias. Controlled when either is provided; otherwise the
    // hook owns state, seeded from `defaultValue` (or the first option).
    const controlledValue = value ?? selectedId
    const isControlled = controlledValue !== undefined
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? options[0]?.id)
    const selected = isControlled ? controlledValue : uncontrolled

    const emit = React.useCallback(
      (id: string) => {
        if (!isControlled) setUncontrolled(id)
        ;(onValueChange ?? onSelect)?.(id)
      },
      [isControlled, onValueChange, onSelect],
    )

    // Thumb glide. This is a frequent, functional toggle, so the motion is
    // crisp and bounce-free (Apple spring notation: settles ~300ms, no
    // overshoot) rather than playful. Snaps instantly under reduced motion —
    // the slide is the only movement here.
    const thumbTransition = reduceMotion
      ? { duration: 0 }
      : { type: 'spring' as const, duration: 0.3, bounce: 0 }

    // Compose refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        tablistRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref],
    )

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      const currentIndex = options.findIndex((o) => o.id === selected)
      let nextIndex = currentIndex

      const prev = currentIndex > 0 ? currentIndex - 1 : options.length - 1
      const next = currentIndex < options.length - 1 ? currentIndex + 1 : 0
      const rtl = isRtl(tablistRef.current)

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = rtl ? next : prev
          break
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = rtl ? prev : next
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = options.length - 1
          break
        default:
          return
      }

      emit(options[nextIndex].id)
      requestAnimationFrame(() => {
        const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        buttons?.[nextIndex]?.focus()
      })
    }

    const { button: buttonSize, icon: iconSize } = sizeConfig[size]

    return (
      <div
        ref={mergedRef}
        role="radiogroup"
        tabIndex={-1}
        aria-label={props['aria-label'] ?? 'Segmented control'}
        onKeyDown={handleKeyDown}
        className={cn(
          'p-ds-01 rounded-surface bg-segment-track',
          fullWidth ? 'flex w-full' : 'inline-flex w-fit',
          disabled && 'opacity-action-disabled pointer-events-none',
          className,
        )}
        {...props}
      >
        <LayoutGroup id={instanceId}>
          {options.map((option) => {
            const isSelected = option.id === selected

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={option.ariaLabel}
                tabIndex={isSelected ? 0 : -1}
                disabled={disabled}
                onClick={() => emit(option.id)}
                className={cn(
                  'relative inline-flex items-center justify-center gap-ds-02 rounded-control',
                  'font-medium outline-hidden',
                  // `touch-target` adds a 44px min hit area via ::before without
                  // changing the visual (dense) height.
                  'touch-target',
                  // Exact properties (not `all`); press-scale gives instant
                  // tactile feedback, gated to motion-safe so reduced-motion
                  // users keep only the color change.
                  'transition-[color,transform] duration-fast-02 ease-productive-standard',
                  'motion-safe:active:scale-[0.97]',
                  'focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  buttonSize,
                  fullWidth && 'flex-1 min-w-16',
                  isSelected
                    ? selectedTextStyles[resolvedVariant]
                    : 'text-surface-fg-muted hover:text-surface-fg',
                )}
              >
                {/* Sliding thumb indicator. Rendered before the content so the
                    positioned content siblings paint above it (no z-index). */}
                {isSelected && (
                  <motion.span
                    layoutId="segment-thumb"
                    initial={false}
                    className={cn(
                      'absolute inset-0 rounded-control pointer-events-none',
                      thumbStyles[resolvedVariant],
                    )}
                    transition={thumbTransition}
                  />
                )}

                {/* Content — `relative` so it paints over the thumb */}
                {option.icon && (
                  <span className={cn('relative shrink-0 inline-flex items-center justify-center', iconSize)}>
                    <IconProvider size={size === 'lg' ? 'sm' : 'xs'}>
                      {normalizeIcon(option.icon)}
                    </IconProvider>
                  </span>
                )}
                {option.text != null && <span className="relative">{option.text}</span>}
              </button>
            )
          })}
        </LayoutGroup>
      </div>
    )
  },
)
SegmentedControl.displayName = 'SegmentedControl'

/* ── Exports ───────────────────────────────────────────────── */

export { SegmentedControl }
