'use client'

import React, { useState, useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../ui/lib/utils'
import { useRipple } from './use-ripple'

/* ── CVA for the item button ────────────────────────────────── */
const segmentedControlItemVariants = cva(
  [
    'inline-flex items-center gap-ds-03 rounded-[88px] border-none outline-none cursor-pointer',
    'transition-[color,background-color,border-color,box-shadow] duration-moderate ease-in-out',
    'relative overflow-hidden',
    'font-accent text-ds-md font-semibold leading-none text-center',
    'bg-layer-01',
    'text-text-tertiary',
    'first:rounded-tr-none first:rounded-br-none',
    'last:rounded-tl-none last:rounded-bl-none',
  ],
  {
    variants: {
      size: {
        small: 'h-9 px-ds-05 py-ds-03',
        medium: 'px-[10px] py-ds-03 pl-ds-04',
        big: 'h-14 px-ds-06 py-ds-05',
      },
      color: {
        filled: "text-text-on-color [text-shadow:0px_1px_1px_var(--color-text-shadow)]",
        tonal: 'text-text-tertiary',
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
      // Selected + filled
      {
        selected: true,
        color: 'filled',
        className: [
          'bg-interactive',
          'shadow-[0px_1px_3px_0.05px_var(--color-interactive-hover),inset_0px_8px_16px_0px_var(--color-inset-glow-strong),inset_0px_2px_0px_0px_var(--color-inset-glow-subtle)]',
        ].join(' '),
      },
      // Selected + tonal
      {
        selected: true,
        color: 'tonal',
        className: 'bg-field !text-text-primary',
      },
      // Hover + filled
      {
        isHovered: true,
        color: 'filled',
        className: [
          'bg-interactive',
          'shadow-[0px_4px_8px_0px_var(--color-interactive-hover),0px_1px_3px_0.05px_var(--color-layer-02),inset_0px_8px_16px_0px_var(--color-inset-glow-strong),inset_0px_2px_0px_0px_var(--color-inset-glow-subtle)]',
        ].join(' '),
      },
      // Hover + tonal
      {
        isHovered: true,
        color: 'tonal',
        className: 'text-text-primary',
      },
      // Disabled + filled
      {
        isDisabled: true,
        color: 'filled',
        className: 'text-text-placeholder',
      },
      // Disabled + tonal
      {
        isDisabled: true,
        color: 'tonal',
        className: 'text-text-placeholder',
      },
      // Filled + SVG icon fill
      {
        color: 'filled',
        className: '[&_svg_path]:fill-icon-on-color',
      },
      // Filled + disabled SVG icon fill
      {
        color: 'filled',
        isDisabled: true,
        className: '[&_svg_path]:fill-icon-disabled',
      },
      // Medium size last-child padding flip
      {
        size: 'medium',
        className: 'last:pl-[10px] last:pr-ds-04',
      },
    ],
    defaultVariants: {
      size: 'medium',
      color: 'tonal',
      selected: false,
      isHovered: false,
      isDisabled: false,
    },
  },
)

/* ── ripple bg per color ──────────────────────────────────── */
const rippleBgMap: Record<string, string> = {
  filled: 'bg-surface-overlay-light',
  tonal: 'bg-surface-overlay-dark',
}

/* ── Types ─────────────────────────────────────────────────── */
export type SegmentedControlSize = 'small' | 'medium' | 'big'
export type SegmentedControlColor = 'filled' | 'tonal'

export interface SegmentedControlOption {
  id: string
  text: string
}

/** @deprecated Use SegmentedControlSize */
export type ToggleSize = SegmentedControlSize
/** @deprecated Use SegmentedControlColor */
export type ToggleColor = SegmentedControlColor
/** @deprecated Use SegmentedControlOption */
export type ToggleOption = SegmentedControlOption

export interface SegmentedControlProps {
  size: SegmentedControlSize
  color: SegmentedControlColor
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
  color,
  options,
  selectedId,
  onSelect,
  disabled = false,
  className = '',
}, forwardedRef) {
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
        'inline-flex gap-0 p-0 rounded-[88px]',
        'bg-layer-02',
        'border border-solid border-layer-03',
        className,
      )}
      role="tablist"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Segmented control options"
    >
      {options.map((option) => (
        <SegmentedControlItem
          key={option.id}
          size={size}
          color={color}
          text={option.text}
          isSelected={option.id === selectedId}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          isFocused={option.id === focusedId}
          onFocus={() => setFocusedId(option.id)}
          onBlur={() => setFocusedId(null)}
        />
      ))}
    </div>
  )
},
)
SegmentedControl.displayName = 'SegmentedControl'

/* ── SegmentedControlItem ─────────────────────────────────── */
export interface SegmentedControlItemProps {
  size: SegmentedControlSize
  color: SegmentedControlColor
  text: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  isFocused: boolean
  onFocus: () => void
  onBlur: () => void
}

const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem({
  size,
  color,
  text,
  isSelected,
  onClick,
  disabled = false,
  isFocused,
  onFocus,
  onBlur,
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
          color,
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
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            'absolute rounded-ds-full -translate-x-1/2 -translate-y-1/2 scale-0 animate-ripple pointer-events-none',
            rippleBgMap[color],
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      <span className="font-accent text-ds-md leading-none">{text}</span>
    </button>
  )
},
)
SegmentedControlItem.displayName = 'SegmentedControlItem'

export { SegmentedControl, SegmentedControlItem, segmentedControlItemVariants }
