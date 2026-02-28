'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './CustomButton.module.css'

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

  const buttonClasses = [
    styles.button,
    styles[type],
    styles[state],
    disabled && styles.disabled,
    shake && !disabled && styles.shakeAnimation,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
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
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <span className={styles.textStyle}>{text}</span>
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </button>
  )
}
CustomButton.displayName = 'CustomButton'

export { CustomButton }
