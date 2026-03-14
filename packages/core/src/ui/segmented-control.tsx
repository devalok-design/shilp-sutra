'use client'

import React, { useState, useRef, useId } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { cva } from 'class-variance-authority'
import { cn } from './lib/utils'
import { useRipple } from './lib/use-ripple'
import { springs } from './lib/motion'

/* ── CVA for the item button ────────────────────────────────── */
const segmentedControlItemVariants = cva(
  [
    'inline-flex items-center gap-ds-03 rounded-ds-full border-none outline-none cursor-pointer',
    'transition-[color,background-color,border-color,box-shadow] duration-moderate-02 ease-productive-standard',
    'relative overflow-hidden',
    'font-accent font-semibold leading-none text-center',
    'bg-surface-1',
    'first:rounded-tr-none first:rounded-br-none',
    'last:rounded-tl-none last:rounded-bl-none',
  ],
  {
    variants: {
      size: {
        sm: 'h-ds-sm-plus px-ds-05 py-ds-03 text-ds-sm',
        md: 'px-ds-02b py-ds-03 pl-ds-04 text-ds-md',
        lg: 'h-[56px] px-ds-06 py-ds-05 text-ds-md',
      },
      variant: {
        filled: "text-accent-fg [text-shadow:0px_1px_1px_var(--color-text-shadow)]",
        tonal: 'text-surface-fg-subtle',
      },
      selected: {
        true: '',
        false: '',
      },
      isHovered: {
        true: '',
        false: '',
      },
      isDisabled: {
        true: 'cursor-not-allowed pointer-events-none border-none shadow-none [text-shadow:none]',
        false: '',
      },
    },
    compoundVariants: [
      // Selected + filled — bg/shadow handled by motion indicator
      {
        selected: true,
        variant: 'filled',
        className: '',
      },
      // Selected + tonal — bg handled by motion indicator
      {
        selected: true,
        variant: 'tonal',
        className: 'text-surface-fg',
      },
      // Hover + filled
      {
        isHovered: true,
        variant: 'filled',
        className: [
          'bg-accent-9',
          'shadow-[0px_4px_8px_0px_var(--color-accent-10),0px_1px_3px_0.05px_var(--color-surface-2),inset_0px_8px_16px_0px_var(--color-inset-glow-strong),inset_0px_2px_0px_0px_var(--color-inset-glow-subtle)]',
        ].join(' '),
      },
      // Hover + tonal
      {
        isHovered: true,
        variant: 'tonal',
        className: 'text-surface-fg',
      },
      // Disabled + filled
      {
        isDisabled: true,
        variant: 'filled',
        className: 'text-surface-fg-subtle',
      },
      // Disabled + tonal
      {
        isDisabled: true,
        variant: 'tonal',
        className: 'text-surface-fg-subtle',
      },
      // Filled + SVG icon fill
      {
        variant: 'filled',
        className: '[&_svg_path]:fill-accent-fg',
      },
      // Filled + disabled SVG icon fill
      {
        variant: 'filled',
        isDisabled: true,
        className: '[&_svg_path]:fill-disabled',
      },
      // Medium size last-child padding flip
      {
        size: 'md',
        className: 'last:pl-ds-02b last:pr-ds-04',
      },
    ],
    defaultVariants: {
      size: 'md',
      variant: 'tonal',
      selected: false,
      isHovered: false,
      isDisabled: false,
    },
  },
)

/* ── ripple bg per variant ────────────────────────────────── */
const rippleBgMap: Record<string, string> = {
  filled: 'bg-surface-overlay-light',
  tonal: 'bg-surface-overlay-dark',
}

/* ── Size mapping for backward compatibility ──────────────── */
const sizeLegacyMap: Record<string, SegmentedControlSize> = {
  small: 'sm',
  medium: 'md',
  big: 'lg',
}

/** Resolve legacy size names (small/medium/big) to standard (sm/md/lg). */
function resolveSize(size: SegmentedControlSize): 'sm' | 'md' | 'lg' {
  return (sizeLegacyMap[size] ?? size) as 'sm' | 'md' | 'lg'
}

/* ── Types ─────────────────────────────────────────────────── */
export type SegmentedControlSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'big'
export type SegmentedControlVariant = 'filled' | 'tonal'

/**
 * A single option in a `<SegmentedControl>`. The `id` must be unique across all options in
 * the same control — it is used as the selection key for `selectedId` and `onSelect`.
 */
export interface SegmentedControlOption {
  id: string
  text: string
  /** Optional icon component rendered before the text label. */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Props for SegmentedControl — a pill-shaped tab-row for mutually exclusive option selection,
 * similar to a radio group but styled as a single connected control.
 *
 * **`size`:** `'sm'` | `'md'` (default) | `'lg'`. Legacy aliases `'small'` | `'medium'` | `'big'` are
 * also accepted for backward compatibility but prefer the canonical form.
 *
 * **`variant`:** `'tonal'` (default, subdued) | `'filled'` (vibrant brand color when selected).
 *
 * **Options:** Each option needs a unique `id`, a display `text`, and an optional `icon` component.
 *
 * **Controlled only:** `selectedId` + `onSelect` are required. There is no uncontrolled mode.
 *
 * @example
 * // View mode switcher (list vs grid vs board):
 * <SegmentedControl
 *   size="md"
 *   variant="tonal"
 *   options={[
 *     { id: 'list', text: 'List' },
 *     { id: 'grid', text: 'Grid' },
 *     { id: 'board', text: 'Board' },
 *   ]}
 *   selectedId={viewMode}
 *   onSelect={setViewMode}
 * />
 *
 * @example
 * // Time range selector with filled variant (more prominent):
 * <SegmentedControl
 *   size="sm"
 *   variant="filled"
 *   options={[
 *     { id: '7d', text: '7D' },
 *     { id: '30d', text: '30D' },
 *     { id: '90d', text: '90D' },
 *   ]}
 *   selectedId={range}
 *   onSelect={setRange}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  size: SegmentedControlSize
  variant: SegmentedControlVariant
  options: SegmentedControlOption[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
  className?: string
}

/* ── SegmentedControl (root) ──────────────────────────────── */
const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl({
  size,
  variant,
  options,
  selectedId,
  onSelect,
  disabled = false,
  className = '',
  ...props
}, forwardedRef) {
  const resolved = resolveSize(size)
  const instanceId = useId()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const tablistRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = React.useCallback((node: HTMLDivElement | null) => {
    tablistRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
  }, [forwardedRef])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    const currentIndex = options.findIndex(option => option.id === focusedId)
    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        break
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = options.length - 1
        break
      default:
        return
    }

    const nextOption = options[nextIndex]
    setFocusedId(nextOption.id)
    onSelect(nextOption.id)
  }

  return (
    <div
      ref={mergedRef}
      className={cn(
        'inline-flex gap-0 p-0 rounded-ds-full',
        'bg-surface-2',
        'border border-solid border-surface-border-strong',
        className,
      )}
      role="tablist"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label="Segmented control options"
      {...props}
    >
      <LayoutGroup>
        {options.map((option) => (
          <SegmentedControlItem
            key={option.id}
            size={resolved}
            variant={variant}
            text={option.text}
            icon={option.icon}
            isSelected={option.id === selectedId}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            isFocused={option.id === focusedId}
            onFocus={() => setFocusedId(option.id)}
            onBlur={() => setFocusedId(null)}
            layoutId={`${instanceId}-segment-indicator`}
          />
        ))}
      </LayoutGroup>
    </div>
  )
},
)
SegmentedControl.displayName = 'SegmentedControl'

/* ── SegmentedControlItem ─────────────────────────────────── */
/**
 * Props for SegmentedControlItem — the individual button segment within a `<SegmentedControl>`.
 * Normally you don't use this directly; compose via `<SegmentedControl options={...} />` instead.
 * Use `SegmentedControlItem` directly only when building a fully custom segmented tab row.
 *
 * **Note:** `isFocused`, `onFocus`, and `onBlur` are managed by the parent `SegmentedControl`.
 * You must wire them yourself when using the item standalone.
 *
 * @example
 * // Standalone custom segmented row (without parent SegmentedControl):
 * const [view, setView] = useState<'list' | 'grid'>('list')
 * const [focused, setFocused] = useState<string | null>(null)
 *
 * <div role="tablist" className="inline-flex rounded-full border border-surface-border-strong bg-surface-2">
 *   <SegmentedControlItem
 *     size="md" variant="tonal" text="List"
 *     isSelected={view === 'list'} isFocused={focused === 'list'}
 *     onClick={() => setView('list')}
 *     onFocus={() => setFocused('list')} onBlur={() => setFocused(null)}
 *   />
 *   <SegmentedControlItem
 *     size="md" variant="tonal" text="Grid" icon={IconLayoutGrid}
 *     isSelected={view === 'grid'} isFocused={focused === 'grid'}
 *     onClick={() => setView('grid')}
 *     onFocus={() => setFocused('grid')} onBlur={() => setFocused(null)}
 *   />
 * </div>
 *
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SegmentedControlItemProps {
  size: 'sm' | 'md' | 'lg'
  variant: SegmentedControlVariant
  text: string
  /** Optional icon component rendered before the text label. */
  icon?: React.ComponentType<{ className?: string }>
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  isFocused: boolean
  onFocus: () => void
  onBlur: () => void
  /** @internal Unique layout animation ID — provided by the parent SegmentedControl. */
  layoutId?: string
}

const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem({
  size,
  variant,
  text,
  icon: Icon,
  isSelected,
  onClick,
  disabled = false,
  isFocused,
  onFocus,
  onBlur,
  layoutId = 'segment-indicator',
}, ref) {
  const [state, setState] = useState<'default' | 'hover' | 'pressed'>('default')
  const { ripples, createRipple } = useRipple()

  const handleMouseEnter = () => {
    if (!disabled && !isFocused) {
      setState('hover')
    }
  }

  const handleMouseLeave = () => {
    if (!disabled) {
      setState('default')
    }
  }

  const handleMouseDown = () => {
    if (!disabled) {
      setState('pressed')
    }
  }

  const handleMouseUp = () => {
    if (!disabled) {
      setState('hover')
    }
  }

  return (
    <button
      ref={ref}
      className={cn(
        segmentedControlItemVariants({
          size,
          variant,
          selected: isSelected,
          isHovered: state === 'hover',
          isDisabled: disabled,
        }),
      )}
      onClick={(e) => {
        createRipple(e)
        onClick()
      }}
      disabled={disabled}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* Sliding active indicator — only mounted in the selected segment */}
      {isSelected && (
        <motion.span
          layoutId={layoutId}
          className={cn(
            'absolute inset-0 rounded-ds-full pointer-events-none',
            variant === 'filled'
              ? 'bg-accent-9 shadow-[0px_1px_3px_0.05px_var(--color-accent-10),inset_0px_8px_16px_0px_var(--color-inset-glow-strong),inset_0px_2px_0px_0px_var(--color-inset-glow-subtle)]'
              : 'bg-surface-3',
          )}
          transition={springs.smooth}
        />
      )}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className={cn(
              'absolute rounded-ds-full -translate-x-1/2 -translate-y-1/2 pointer-events-none',
              rippleBgMap[variant],
            )}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
      {Icon && <Icon className="relative z-[1] h-ico-sm w-ico-sm shrink-0" />}
      <span className="relative z-[1] font-accent leading-none">{text}</span>
    </button>
  )
},
)
SegmentedControlItem.displayName = 'SegmentedControlItem'

export { SegmentedControl, SegmentedControlItem, segmentedControlItemVariants }
