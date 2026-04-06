'use client'

import * as React from 'react'
import * as DialogPrimitive from '@primitives/react-dialog'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { tweens } from './motion'

export interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  /** Show drag handle bar at top. @default true */
  dragHandle?: boolean
  /** Allow swipe-to-dismiss. @default true */
  swipeable?: boolean
  /** Title for accessibility (sets aria-label on the dialog). */
  title?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  className,
  dragHandle = true,
  swipeable = true,
  title,
}: BottomSheetProps) {
  const isReduced = useReducedMotion()
  const sheetRef = React.useRef<HTMLDivElement>(null)

  const handleDragEnd = React.useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      const sheetHeight = sheetRef.current?.getBoundingClientRect().height ?? 300
      if (info.offset.y > sheetHeight * 0.3 || info.velocity.y > 500) {
        onOpenChange(false)
      }
    },
    [onOpenChange],
  )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay forceMount asChild>
              <motion.div
                className="fixed inset-0 z-modal bg-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={tweens.fade}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              forceMount
              asChild
              aria-label={title}
            >
              <motion.div
                ref={sheetRef}
                className={cn(
                  'fixed inset-x-0 bottom-0 z-modal max-h-[85vh] overflow-y-auto rounded-t-ds-xl border-t border-surface-border-strong bg-surface-overlay shadow-overlay outline-none',
                  className,
                )}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={isReduced ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
                drag={swipeable && !isReduced ? 'y' : false}
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                {dragHandle && (
                  <div className="flex justify-center pt-ds-03 pb-ds-02">
                    <div className="h-1 w-8 rounded-ds-full bg-surface-border" />
                  </div>
                )}
                <div className="px-ds-05 pb-ds-06">
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
