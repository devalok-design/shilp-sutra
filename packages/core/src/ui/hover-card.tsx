'use client'

import * as HoverCardPrimitive from '@primitives/react-hover-card'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { MotionPreference } from '../motion/motion-preference'
import { springs, tweens } from './lib/motion'
import { cn } from './lib/utils'

// ── Internal context to thread `open` state to animated children ──

const HoverCardOpenContext = React.createContext(false)

/**
 * HoverCard displays supplementary content on pointer hover.
 *
 * **Accessibility note:** HoverCard is pointer-only by design (WAI-ARIA HoverCard has no APG pattern).
 * Do NOT use for essential content that keyboard users must access.
 * For essential content, use {@link Popover} instead which supports keyboard activation.
 */
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
    <MotionPreference>
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
                  'z-popover w-64 rounded-overlay bg-surface-overlay p-ds-05 shadow-floating outline-hidden',
                  className,
                )}
              >
                {children}
              </motion.div>
            </HoverCardPrimitive.Content>
          </HoverCardPrimitive.Portal>
        )}
      </AnimatePresence>
    </MotionPreference>
  )
})
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export type HoverCardContentProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>

export { HoverCard, HoverCardContent,HoverCardTrigger }
