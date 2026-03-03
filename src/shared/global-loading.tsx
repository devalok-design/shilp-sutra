'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../ui/lib/utils'

export interface GlobalLoadingProps {
  isLoading: boolean
}

const GlobalLoading = React.forwardRef<HTMLDivElement, GlobalLoadingProps>(
  function GlobalLoading({ isLoading }, forwardedRef) {
  const ref = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(true)

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
      className="pointer-events-none fixed inset-x-0 top-0 z-toast h-1"
    >
      <div
        ref={ref}
        className={cn(
          'h-full bg-interactive transition-all duration-slow ease-in-out',
          isLoading && 'w-4/5 opacity-100',
          !isLoading && animationComplete && 'w-0 opacity-0',
          !isLoading && !animationComplete && 'w-full opacity-100',
        )}
        onTransitionEnd={() => {
          if (!isLoading) {
            // After the "complete" animation finishes, hide the bar
            setTimeout(() => {
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
