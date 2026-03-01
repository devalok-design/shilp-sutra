'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../ui/lib/utils'

export type FABSize = 'small' | 'medium' | 'big'

interface FABProps {
  size: FABSize
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  /** Accessible label for the button. Defaults to "Floating action button". */
  'aria-label'?: string
}

const sizeClasses: Record<FABSize, string> = {
  small: 'w-9 h-9',
  medium: 'w-[52px] h-[52px]',
  big: 'w-[84px] h-[84px]',
}

const FAB: React.FC<FABProps> = ({
  size,
  icon,
  onClick,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Floating action button',
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
        'flex items-center justify-center rounded-full border-none outline-none cursor-pointer transition-all duration-200 ease-in-out relative overflow-hidden',
        'bg-[var(--Surface-Button-primary,#d33163)] text-white',
        // Size
        sizeClasses[size],
        // State: focused
        state === 'focused' && 'border border-solid border-[var(--Surface-Primary,#fff)] bg-[var(--Surface-Button-primary,#d33163)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15),0px_2px_3px_0px_rgba(0,0,0,0.3)]',
        // State: hover
        state === 'hover' && 'bg-[var(--Surface-Button-primary,#d33163)] shadow-[0px_4px_8px_0px_var(--Elevation-Button-hover,#efd5d9),0px_1px_3px_0.05px_var(--Surface-Tertiary,#fff),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
        // Disabled
        disabled && 'bg-[var(--Surface-Disabled,#D3CED0)] cursor-not-allowed pointer-events-none shadow-none',
        className,
      )}
      onClick={(e) => {
        createRipple(e)
        onClick?.()
      }}
      disabled={disabled}
      type="button"
      aria-label={ariaLabel}
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
          className="absolute rounded-full bg-[rgba(252,247,247,0.2)] -translate-x-1/2 -translate-y-1/2 scale-0 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {icon}
    </button>
  )
}
FAB.displayName = 'FAB'

export { FAB }
