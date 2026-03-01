'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../ui/lib/utils'

export type ButtonType = 'filled' | 'tonal' | 'outline' | 'text'

interface CustomButtonProps {
  type: ButtonType
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  text: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  /** Enable the shake animation. Defaults to false. */
  shake?: boolean
}

/* ── colour / variant base ────────────────────────────────── */
const typeClasses: Record<ButtonType, string> = {
  filled: [
    'shadow-[0px_1px_3px_0.05px_var(--shadow-button-hover,#efd5d9),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
    'border border-solid border-[var(--Alias-Primary-Default,#d33163)]',
    'bg-[var(--color-interactive,#d33163)]',
    'text-[var(--color-text-on-color,#fcf7f7)]',
    '[text-shadow:0px_1px_1px_rgba(0,0,0,0.15)]',
  ].join(' '),
  tonal: 'bg-[var(--color-layer-02,#fcf7f7)] text-[var(--color-interactive,#932044)]',
  outline: 'bg-transparent border border-solid border-[var(--color-border-strong,#dd9eb8)] text-[var(--color-interactive,#932044)]',
  text: 'text-[var(--color-interactive,#932044)]',
}

/* ── focused state per type ───────────────────────────────── */
const focusedClasses: Record<ButtonType, string> = {
  filled: [
    'border-2 border-solid border-[var(--Alias-Primary-Default,#d33163)]',
    'bg-[var(--color-interactive,#d33163)]',
    'shadow-[0px_1px_3px_0.05px_rgba(24,24,27,0.24),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
  ].join(' '),
  tonal: 'bg-[var(--color-layer-02,#fcf7f7)] shadow-none',
  outline: 'border border-solid border-[var(--color-border-strong,#dd9eb8)]',
  text: '',
}

/* ── hover state per type ─────────────────────────────────── */
const hoverClasses: Record<ButtonType, string> = {
  filled: [
    'border border-solid border-[var(--color-interactive,#d33163)]',
    'bg-[var(--color-interactive,#d33163)]',
    'shadow-[0px_4px_8px_0px_var(--shadow-button-hover,#efd5d9),0px_1px_3px_0.05px_var(--color-layer-02,#fff),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
  ].join(' '),
  tonal: 'bg-[var(--color-field,#f7e9e9)] text-[var(--color-text-primary,#3f181e)]',
  outline: 'border border-solid border-[var(--color-border-strong,#dd9eb8)] bg-[var(--color-layer-02,#fff)] text-[var(--color-text-primary,#3f181e)]',
  text: 'text-[var(--color-text-primary,#3f181e)]',
}

/* ── disabled state per type ──────────────────────────────── */
const disabledClasses: Record<ButtonType, string> = {
  filled: 'bg-[var(--color-field-disabled,#d3ced0)] text-[var(--color-text-placeholder,#8c8084)]',
  tonal: 'bg-[var(--color-field-disabled,#d3ced0)] text-[var(--color-text-placeholder,#8c8084)]',
  outline: 'border border-solid border-[var(--color-text-disabled,#b7afb2)] text-[var(--color-text-placeholder,#8c8084)]',
  text: 'text-[var(--color-text-placeholder,#8c8084)]',
}

/* ── ripple bg per type ───────────────────────────────────── */
const rippleBg: Record<ButtonType, string> = {
  filled: 'bg-[rgba(252,247,247,0.2)]',
  tonal: 'bg-[rgba(140,128,132,0.2)]',
  outline: 'bg-[rgba(140,128,132,0.2)]',
  text: 'hidden',
}

const CustomButton: React.FC<CustomButtonProps> = ({
  type,
  leftIcon,
  rightIcon,
  text,
  onClick,
  disabled = false,
  className = '',
  shake = false,
}) => {
  const [state, setState] = useState<'default' | 'focused' | 'hover' | 'pressed'>('default')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])

  // Handle focus state
  useEffect(() => {
    const handleFocus = () => {
      if (!disabled) {
        setState('focused')
      }
    }

    const handleBlur = () => {
      setState('default')
    }

    const button = buttonRef.current
    if (button) {
      button.addEventListener('focus', handleFocus)
      button.addEventListener('blur', handleBlur)
    }

    return () => {
      if (button) {
        button.removeEventListener('focus', handleFocus)
        button.removeEventListener('blur', handleBlur)
      }
    }
  }, [disabled])

  const handleMouseEnter = () => {
    if (!disabled && state !== 'focused') {
      setState('hover')
    }
  }

  const handleMouseLeave = () => {
    if (!disabled && state !== 'focused') {
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
        'inline-flex items-center justify-center gap-1 px-5 py-3 rounded-[88px] cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-moderate)] ease-in-out relative overflow-hidden',
        "font-['Ranade'] text-sm font-semibold leading-none text-center",
        // Type (variant) base styles
        typeClasses[type],
        // State styles
        state === 'focused' && focusedClasses[type],
        state === 'hover' && hoverClasses[type],
        // Disabled styles
        disabled && 'cursor-not-allowed pointer-events-none border-none shadow-none [text-shadow:none]',
        disabled && disabledClasses[type],
        // Shake animation
        shake && !disabled && 'animate-shake',
        className,
      )}
      onClick={(e) => {
        createRipple(e)
        onClick?.()
      }}
      disabled={disabled}
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            'absolute rounded-[var(--radius-full)] -translate-x-1/2 -translate-y-1/2 scale-0 animate-ripple pointer-events-none',
            rippleBg[type],
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {leftIcon && <span className="flex items-center justify-center w-[18px] h-[18px]">{leftIcon}</span>}
      <span>{text}</span>
      {rightIcon && <span className="flex items-center justify-center w-[18px] h-[18px]">{rightIcon}</span>}
    </button>
  )
}
CustomButton.displayName = 'CustomButton'

export { CustomButton }
