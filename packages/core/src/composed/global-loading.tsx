'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../ui/lib/utils'

export interface GlobalLoadingProps extends React.ComponentPropsWithoutRef<'div'> {
  isLoading: boolean
}

const GlobalLoading = React.forwardRef<HTMLDivElement, GlobalLoadingProps>(
  function GlobalLoading({ isLoading, className, ...props }, forwardedRef) {
  const ref = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => { clearTimeout(timeoutRef.current) }
  }, [])

  useEffect(() => {
    if (!ref.current) return

    if (isLoading) {
      setAnimationComplete(false)
    }
  }, [isLoading])

  return (
    <div
      ref={forwardedRef}
      role="progressbar"
      aria-label="Page loading"
      aria-hidden={!isLoading}
      aria-valuetext={isLoading ? 'Loading' : undefined}
      {...props}
      className={cn("pointer-events-none fixed inset-x-0 top-0 z-toast h-1", className)}
    >
      <div
        ref={ref}
        className={cn(
          'h-full bg-accent-9 transition-all duration-slow-01 ease-productive-standard',
          isLoading && 'w-4/5 opacity-100',
          !isLoading && animationComplete && 'w-0 opacity-0',
          !isLoading && !animationComplete && 'w-full opacity-100',
        )}
        onTransitionEnd={() => {
          if (!isLoading) {
            // After the "complete" animation finishes, hide the bar
            timeoutRef.current = setTimeout(() => {
              setAnimationComplete(true)
            }, 200)
          }
        }}
      />
    </div>
  )
},
)

GlobalLoading.displayName = 'GlobalLoading'

export { GlobalLoading }
