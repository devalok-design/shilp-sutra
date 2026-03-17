'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet'

// ============================================================
// Types
// ============================================================

export interface ResponsiveOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  /** Below this breakpoint renders as bottom Sheet @default 'md' */
  breakpoint?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

// ============================================================
// Hook
// ============================================================

const breakpointValues: Record<string, string> = {
  sm: '640px',
  md: '768px',
}

function useIsMobileOverlay(breakpoint: string): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(`(max-width: ${breakpointValues[breakpoint]})`)
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

// ============================================================
// ResponsiveOverlay
// ============================================================

function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  breakpoint = 'md',
  children,
  className,
}: ResponsiveOverlayProps) {
  const isMobile = useIsMobileOverlay(breakpoint)

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className={className}>
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
          )}
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { ResponsiveOverlay }
