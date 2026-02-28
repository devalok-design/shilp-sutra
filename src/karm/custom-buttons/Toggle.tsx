'use client'

import React, { useState, useRef } from 'react'
import styles from './Toggle.module.css'

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

  const toggleClasses = [
    styles.toggleGroup,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={tablistRef}
      className={toggleClasses}
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

  const buttonClasses = [
    styles.toggle,
    styles[size],
    styles[color],
    styles[state],
    isSelected && styles.selected,
    disabled && styles.disabled,
    isFocused && styles.focused,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
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
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      <span className={styles.text}>{text}</span>
    </button>
  )
}

export { Toggle }
