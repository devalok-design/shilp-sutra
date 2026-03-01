'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../ui/lib/utils'

export type ExtendedFABSize = 'small' | 'big'
export type ExtendedFABColor = 'filled' | 'tonal'

interface ExtendedFABProps {
  size: ExtendedFABSize
  color: ExtendedFABColor
  text: string
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const colorClasses: Record<ExtendedFABColor, string> = {
  filled: 'bg-[var(--color-interactive,#d33163)] text-[var(--color-text-on-color,#fcf7f7)]',
  tonal: 'border border-solid border-[var(--color-border-subtle,#efd5d9)] bg-[var(--color-field,#f7e9e9)] text-[var(--color-text-secondary,#403a3c)]',
}

const focusedClasses: Record<ExtendedFABColor, string> = {
  filled: 'border border-solid border-[var(--color-border-strong,#dd9eb8)] bg-[var(--color-interactive,#d33163)]',
  tonal: 'border border-solid border-[var(--color-border-strong,#dd9eb8)] bg-[var(--color-field,#f7e9e9)]',
}

const hoverClasses: Record<ExtendedFABColor, string> = {
  filled: 'bg-[var(--color-interactive,#d33163)] shadow-[0px_1px_3px_0.05px_var(--shadow-button-hover,#efd5d9),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
  tonal: 'border border-solid border-[var(--color-border-subtle,#efd5d9)] bg-[var(--color-field,#f7e9e9)] shadow-[0px_1px_3px_0.05px_var(--shadow-button-hover,#efd5d9),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
}

const disabledClasses: Record<ExtendedFABColor, string> = {
  filled: 'bg-[var(--color-field-disabled,#D3CED0)] text-[var(--color-text-tertiary,#6B6164)]',
  tonal: 'bg-[var(--color-field-disabled,#D3CED0)] text-[var(--color-text-tertiary,#6B6164)]',
}

const rippleColorClasses: Record<ExtendedFABColor, string> = {
  filled: 'bg-[rgba(252,247,247,0.2)]',
  tonal: 'bg-[rgba(140,128,132,0.2)]',
}

const ExtendedFAB: React.FC<ExtendedFABProps> = ({
  size,
  color,
  text,
  icon,
  onClick,
  disabled = false,
  className = '',
}) => {
  const [state, setState] = useState<
    'default' | 'focused' | 'hover' | 'pressed'
  >('default')
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
        'inline-flex items-center gap-2 p-3.5 rounded-[48px] border-none outline-none cursor-pointer transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-moderate)] ease-in-out relative overflow-hidden',
        "font-['Ranade'] text-sm font-semibold leading-none",
        // Size
        'h-[46px]',
        // Color
        colorClasses[color],
        // State: focused
        state === 'focused' && focusedClasses[color],
        // State: hover
        state === 'hover' && hoverClasses[color],
        // Disabled
        disabled && 'cursor-not-allowed pointer-events-none shadow-none',
        disabled && disabledClasses[color],
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
            rippleColorClasses[color],
          )}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      <span className="flex items-center justify-center w-[18px] h-[18px]">{icon}</span>
      <span className="text-sm font-medium leading-[1.2]">{text}</span>
    </button>
  )
}
ExtendedFAB.displayName = 'ExtendedFAB'

export { ExtendedFAB }
