'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '../ui/lib/utils'

interface GlobalLoadingProps {
  isLoading: boolean
}

function GlobalLoading({ isLoading }: GlobalLoadingProps) {
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
      role="progressbar"
      aria-hidden={!isLoading}
      aria-valuetext={isLoading ? 'Loading' : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1"
    >
      <div
        ref={ref}
        className={cn(
          'h-full transition-all duration-[var(--duration-slow)] ease-in-out',
          isLoading && 'w-4/5 opacity-100',
          !isLoading && animationComplete && 'w-0 opacity-0',
          !isLoading && !animationComplete && 'w-full opacity-100',
        )}
        style={{ backgroundColor: 'var(--color-interactive)' }}
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
}

GlobalLoading.displayName = 'GlobalLoading'

export { GlobalLoading }
export type { GlobalLoadingProps }
