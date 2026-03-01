'use client'

import * as React from 'react'
import { Slot } from '../../ui/lib/slot'
import { cn } from '../../ui/lib/utils'
import { useState } from 'react'

type IconButtonSize = 'small' | 'medium' | 'large'
type IconButtonState = 'default' | 'focused' | 'hover' | 'pressed'

const sizeClasses: Record<IconButtonSize, string> = {
  small: 'h-7 w-7 rounded-[128px] [&_svg]:size-5',
  medium: 'h-8 w-8 rounded-[128px] [&_svg]:size-6',
  large: 'h-12 w-12 p-1 rounded-[128px] [&_svg]:size-6',
}

const stateClasses: Record<IconButtonState, string> = {
  default: '',
  focused: 'border-[1px] border-[var(--border-tertiary)]',
  hover: 'hover:bg-[var(--color-layer-02)]',
  pressed: 'bg-[var(--color-layer-02)]',
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  icon?: React.ReactNode
  size?: IconButtonSize
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'medium', asChild = false, icon, children, disabled = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const content = icon || children
    const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
    const [isRippling, setIsRippling] = useState(false)
    const [state, setState] = useState<'default' | 'focused' | 'hover' | 'pressed'>('default')
    const mouseDown = React.useRef(false)

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

    const handleMouseDown = (_e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (!disabled) {
        mouseDown.current = true
        setState('pressed')
      }
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (!disabled) {
        mouseDown.current = false
        const rect = e.currentTarget.getBoundingClientRect()
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY
        setRipplePosition({
          x: x - rect.left,
          y: y - rect.top,
        })
        setIsRippling(true)
        setState('hover')
        setTimeout(() => {
          setIsRippling(false)
        }, 600)
      }
    }

    const handleFocus = () => {
      if (!disabled && !mouseDown.current) {
        setState('focused')
      }
    }

    const handleBlur = () => {
      if (!disabled) {
        setState('default')
      }
    }

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-[10px] relative overflow-hidden hover:border-none focus:border-none active:border-none outline-none focus:outline-none !border-none',
          sizeClasses[size],
          `${disabled ? 'opacity-50 cursor-default hover:bg-transparent' : ''}`,
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={disabled ? undefined : onClick}
        {...props}
        type="button"
      >
        <div className={`relative z-10 w-full overflow-hidden h-full flex items-center justify-center rounded-[128px] ${size === 'large' ? 'p-2' : 'p-1'} ${!disabled && stateClasses[state]} ${disabled ? 'opacity-50 cursor-default hover:bg-transparent border-none' : ''}`}>
          {content}
          {!disabled && isRippling && (
            <div
              className="absolute w-[100px] h-[100px] rounded-[var(--radius-full)] bg-[var(--color-text-on-color)] pointer-events-none opacity-50 animate-ripple-icon"
              style={{
                left: `${ripplePosition.x - 50}px`,
                top: `${ripplePosition.y - 50}px`,
              }}
            />
          )}
        </div>
      </Comp>
    )
  },
)
IconButton.displayName = 'IconButton'

export { IconButton }
