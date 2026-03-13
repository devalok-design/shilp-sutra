'use client'

import * as React from 'react'
import * as CollapsiblePrimitive from '@primitives/react-collapsible'
import { motion } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.Trigger

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn('overflow-hidden', className)}
    {...props}
  >
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={tweens.fade}
    >
      {children}
    </motion.div>
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export type CollapsibleProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
