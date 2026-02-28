'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './FAB.module.css'

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

  const fabClasses = [
    styles.fab,
    styles[size],
    styles[state],
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={buttonRef}
      className={fabClasses}
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
          className={styles.ripple}
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
