import * as React from 'react'
import { cn } from './lib/utils'

type TransitionProps = {
  open: boolean
  duration?: string
  className?: string
  children: React.ReactNode
  unmountOnClose?: boolean
}

const Fade = React.forwardRef<HTMLDivElement, TransitionProps>(
  ({ open, duration, className, children, unmountOnClose = false, ...props }, ref) => {
    if (unmountOnClose && !open) return null
    return (
      <div
        ref={ref}
        className={cn('transition-opacity ease-entrance', className)}
        style={{
          opacity: open ? 1 : 0,
          transitionDuration: duration || 'var(--duration-enter)',
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Fade.displayName = 'Fade'

const Collapse = React.forwardRef<HTMLDivElement, TransitionProps>(
  ({ open, duration, className, children, ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState<number | undefined>(open ? undefined : 0)

    React.useEffect(() => {
      if (!contentRef.current) return
      if (open) {
        setHeight(contentRef.current.scrollHeight)
        const timer = setTimeout(() => setHeight(undefined), 300)
        return () => clearTimeout(timer)
      } else {
        setHeight(contentRef.current.scrollHeight)
        requestAnimationFrame(() => setHeight(0))
      }
    }, [open])

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden transition-[height] ease-standard', className)}
        style={{
          height: height !== undefined ? `${height}px` : 'auto',
          transitionDuration: duration || 'var(--duration-moderate)',
        }}
        {...props}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    )
  },
)
Collapse.displayName = 'Collapse'

const Grow = React.forwardRef<HTMLDivElement, TransitionProps>(
  ({ open, duration, className, children, unmountOnClose = false, ...props }, ref) => {
    if (unmountOnClose && !open) return null
    return (
      <div
        ref={ref}
        className={cn('transition-[opacity,transform] ease-entrance', className)}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(0)',
          transitionDuration: duration || 'var(--duration-enter)',
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Grow.displayName = 'Grow'

const Slide = React.forwardRef<
  HTMLDivElement,
  TransitionProps & { direction?: 'up' | 'down' | 'left' | 'right' }
>(({ open, direction = 'up', duration, className, children, unmountOnClose = false, ...props }, ref) => {
  if (unmountOnClose && !open) return null
  const translateMap = {
    up: 'translateY(100%)',
    down: 'translateY(-100%)',
    left: 'translateX(100%)',
    right: 'translateX(-100%)',
  }
  return (
    <div
      ref={ref}
      className={cn('transition-transform ease-entrance', className)}
      style={{
        transform: open ? 'translate(0)' : translateMap[direction],
        transitionDuration: duration || 'var(--duration-enter)',
      }}
      {...props}
    >
      {children}
    </div>
  )
})
Slide.displayName = 'Slide'

export { Fade, Collapse, Grow, Slide, type TransitionProps }
