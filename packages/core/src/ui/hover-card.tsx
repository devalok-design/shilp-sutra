'use client'

import * as React from 'react'
import * as HoverCardPrimitive from '@primitives/react-hover-card'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

// ── Internal context to thread `open` state to animated children ──

const HoverCardOpenContext = React.createContext(false)

const HoverCard: React.FC<React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  return (
    <HoverCardOpenContext.Provider value={open}>
      <HoverCardPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </HoverCardOpenContext.Provider>
  )
}
HoverCard.displayName = 'HoverCard'

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
  const open = React.useContext(HoverCardOpenContext)

  return (
    <AnimatePresence>
      {open && (
        <HoverCardPrimitive.Portal forceMount>
          <HoverCardPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            forceMount
            asChild
            {...props}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ...springs.snappy, opacity: tweens.fade }}
              className={cn(
                'z-popover w-64 rounded-ds-lg border border-border bg-layer-01 p-ds-05 shadow-03 outline-none',
                className,
              )}
            >
              {children}
            </motion.div>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      )}
    </AnimatePresence>
  )
})
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export type HoverCardContentProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>

export { HoverCard, HoverCardTrigger, HoverCardContent }
