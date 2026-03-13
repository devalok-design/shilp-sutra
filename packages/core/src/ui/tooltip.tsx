'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@primitives/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

const TooltipProvider = TooltipPrimitive.Provider

// ── Internal context to thread `open` state to animated children ──

type TooltipContextValue = { open: boolean }
const TooltipContext = React.createContext<TooltipContextValue>({ open: false })

const Tooltip: React.FC<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>> = ({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <TooltipContext.Provider value={{ open }}>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </TooltipContext.Provider>
  )
}
Tooltip.displayName = 'Tooltip'

const TooltipTrigger = TooltipPrimitive.Trigger

// ── Side-based slide offsets ──

const sideOffset: Record<string, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset: sideOffsetProp = 4, side = 'top', ...props }, ref) => {
  const { open } = React.useContext(TooltipContext)
  const slideInit = sideOffset[side] ?? {}

  return (
    <AnimatePresence>
      {open && (
        <TooltipPrimitive.Portal forceMount>
          <TooltipPrimitive.Content
            ref={ref}
            forceMount
            asChild
            sideOffset={sideOffsetProp}
            side={side}
            {...props}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, ...slideInit }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, ...slideInit }}
              transition={{ ...springs.snappy, opacity: tweens.fade }}
              className={cn(
                'z-tooltip overflow-hidden rounded-ds-md bg-surface-fg px-ds-04 py-ds-02b text-ds-sm text-accent-fg shadow-02',
                className,
              )}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
