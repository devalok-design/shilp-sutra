'use client'

import * as TooltipPrimitive from '@primitives/react-tooltip'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { springs, tweens } from './lib/motion'
import { cn } from './lib/utils'

// ── Auto-provider: wraps with TooltipPrimitive.Provider if none exists ──

const TooltipProviderContext = React.createContext(false)

const TooltipProvider: React.FC<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>> = ({
  children,
  ...props
}) => (
  <TooltipProviderContext.Provider value={true}>
    <TooltipPrimitive.Provider {...props}>
      {children}
    </TooltipPrimitive.Provider>
  </TooltipProviderContext.Provider>
)

function AutoProvider({ children }: { children: React.ReactNode }) {
  const hasProvider = React.useContext(TooltipProviderContext)
  if (hasProvider) return <>{children}</>
  return (
    <TooltipProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider delayDuration={300}>
        {children}
      </TooltipPrimitive.Provider>
    </TooltipProviderContext.Provider>
  )
}

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

  const contextValue = React.useMemo(() => ({ open }), [open])

  return (
    <AutoProvider>
      <TooltipContext.Provider value={contextValue}>
        <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
      </TooltipContext.Provider>
    </AutoProvider>
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
>(({ className, sideOffset: sideOffsetProp = 4, side = 'top', children, ...props }, ref) => {
  const { open } = React.useContext(TooltipContext)
  const slideInit = sideOffset[side] ?? {}

  return (
    <AnimatePresence>
      {open && (
        <TooltipPrimitive.Portal forceMount>
          <TooltipPrimitive.Content
            ref={ref}
            forceMount
            sideOffset={sideOffsetProp}
            side={side}
            {...props}
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, ...slideInit }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, ...slideInit }}
              transition={{ ...springs.snappy, opacity: tweens.fade }}
              className={cn(
                'z-tooltip overflow-hidden rounded-overlay-sm bg-surface-inverted px-ds-04 py-ds-02b text-ds-sm text-surface-inverted-fg shadow-floating',
                className,
              )}
            >
              {children}
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>

export { Tooltip, TooltipContent, TooltipProvider,TooltipTrigger }
