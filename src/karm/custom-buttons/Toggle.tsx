'use client'

import React, { useState, useRef } from 'react'
import { cn } from '../../ui/lib/utils'

export type ToggleSize = 'small' | 'medium' | 'big'
export type ToggleColor = 'filled' | 'tonal'

export interface ToggleOption {
  id: string
  text: string
}

interface ToggleProps {
  size: ToggleSize
  color: ToggleColor
  options: ToggleOption[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
  className?: string
}

const Toggle: React.FC<ToggleProps> = ({
  size,
  color,
  options,
  selectedId,
  onSelect,
  disabled = false,
  className = '',
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const tablistRef = useRef<HTMLDivElement>(null)

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
      ref={tablistRef}
      className={cn(
        'inline-flex gap-0 p-0 rounded-[88px]',
        'bg-[var(--color-layer-02,#fcf7f7)]',
        'border border-solid border-[var(--color-layer-03,#efd5d9)]',
        className,
      )}
      role="tablist"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Toggle options"
    >
      {options.map((option) => (
        <ToggleButton
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
}
Toggle.displayName = 'Toggle'

/* ── size classes ──────────────────────────────────────────── */
const sizeClasses: Record<ToggleSize, string> = {
  small: 'h-9 px-4 py-2',
  medium: 'px-[10px] py-2 pl-3',
  big: 'h-14 px-6 py-4',
}

/* The last child in "medium" size needs flipped padding */
const sizeLastClasses: Record<ToggleSize, string> = {
  small: '',
  medium: 'last:pl-[10px] last:pr-3',
  big: '',
}

/* ── color base classes ───────────────────────────────────── */
const colorClasses: Record<ToggleColor, string> = {
  filled: "text-[var(--color-text-on-color,#fcf7f7)] [text-shadow:0px_1px_1px_rgba(0,0,0,0.15)]",
  tonal: 'text-[var(--color-text-tertiary,#6B6164)]',
}

/* ── hover state per color ────────────────────────────────── */
const hoverColorClasses: Record<ToggleColor, string> = {
  filled: [
    'bg-[var(--color-interactive,#d33163)]',
    'shadow-[0px_4px_8px_0px_var(--shadow-button-hover,#efd5d9),0px_1px_3px_0.05px_var(--color-layer-02,#fff),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
  ].join(' '),
  tonal: 'text-[var(--color-text-primary,#3f181e)]',
}

/* ── selected state per color ─────────────────────────────── */
const selectedColorClasses: Record<ToggleColor, string> = {
  filled: [
    'bg-[var(--color-interactive,#d33163)]',
    'shadow-[0px_1px_3px_0.05px_var(--shadow-button-hover,#efd5d9),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
  ].join(' '),
  tonal: 'bg-[var(--color-field,#f7e9e9)] !text-[var(--color-text-primary,#3f181e)]',
}

/* ── disabled state per color ─────────────────────────────── */
const disabledColorClasses: Record<ToggleColor, string> = {
  filled: 'text-[var(--color-text-placeholder,#8c8084)]',
  tonal: 'text-[var(--color-text-placeholder,#8c8084)]',
}

/* ── ripple bg per color ──────────────────────────────────── */
const rippleBg: Record<ToggleColor, string> = {
  filled: 'bg-[rgba(252,247,247,0.2)]',
  tonal: 'bg-[rgba(140,128,132,0.2)]',
}

interface ToggleButtonProps {
  size: ToggleSize
  color: ToggleColor
  text: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  isFocused: boolean
  onFocus: () => void
  onBlur: () => void
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  size,
  color,
  text,
  isSelected,
  onClick,
  disabled = false,
  isFocused,
  onFocus,
  onBlur,
}) => {
  const [state, setState] = useState<'default' | 'hover' | 'pressed'>('default')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])

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

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    }

    setRipples((prevRipples) => [...prevRipples, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== newRipple.id))
    }, 600)
  }

  return (
    <button
      ref={buttonRef}
      className={cn(
        // Base styles
        'inline-flex items-center gap-2 rounded-[88px] border-none outline-none cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-moderate)] ease-in-out relative overflow-hidden',
        "font-accent text-sm font-semibold leading-none text-center",
        'bg-[var(--color-layer-01,#fcf7f7)]',
        'text-[var(--color-text-tertiary,#6B6164)]',
        // First / last child rounding
        'first:rounded-tr-none first:rounded-br-none',
        'last:rounded-tl-none last:rounded-bl-none',
        // Size
        sizeClasses[size],
        sizeLastClasses[size],
        // Color
        colorClasses[color],
        // Selected state
        isSelected && selectedColorClasses[color],
        // Hover state (only when not selected to avoid overriding selected styles)
        state === 'hover' && hoverColorClasses[color],
        // Disabled state
        disabled && 'cursor-not-allowed pointer-events-none border-none shadow-none [text-shadow:none]',
        disabled && disabledColorClasses[color],
        // SVG icon fill for filled variant
        color === 'filled' && '[&_svg_path]:fill-[#FCF7F7]',
        color === 'filled' && disabled && '[&_svg_path]:fill-[#6B6164]',
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
            'absolute rounded-[var(--radius-full)] -translate-x-1/2 -translate-y-1/2 scale-0 animate-ripple pointer-events-none',
            rippleBg[color],
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      <span className="font-accent text-sm font-normal leading-none tracking-[-0.28px]">{text}</span>
    </button>
  )
}

export { Toggle }
