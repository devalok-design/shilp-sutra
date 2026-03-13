'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@primitives/react-popover'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

// ── Internal context to thread `open` state to animated children ──

const PopoverOpenContext = React.createContext(false)

const Popover: React.FC<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>> = ({
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
    <PopoverOpenContext.Provider value={open}>
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </PopoverOpenContext.Provider>
  )
}
Popover.displayName = 'Popover'

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
  const open = React.useContext(PopoverOpenContext)

  return (
    <AnimatePresence>
      {open && (
        <PopoverPrimitive.Portal forceMount>
          <PopoverPrimitive.Content
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
                'z-popover w-72 rounded-ds-lg border border-surface-border-strong bg-surface-1 p-ds-05 text-surface-fg shadow-03 outline-none',
                className,
              )}
            >
              {children}
            </motion.div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </AnimatePresence>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
