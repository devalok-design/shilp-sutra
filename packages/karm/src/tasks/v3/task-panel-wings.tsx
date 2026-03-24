'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { tweens } from '@/ui/lib/motion'

// ---------------------------------------------------------------------------
// TaskPanelWings — composable container for wing cards left of the sheet
// ---------------------------------------------------------------------------

export interface TaskPanelWingsProps {
  children: React.ReactNode
  className?: string
}

export function TaskPanelWings({ children, className }: TaskPanelWingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ ...tweens.fade, delay: 0.15 }}
      className={cn(
        'absolute right-full top-ds-05 mr-ds-04 hidden lg:flex lg:flex-col gap-ds-03',
        className,
      )}
    >
      <AnimatePresence>{children}</AnimatePresence>
    </motion.div>
  )
}

TaskPanelWings.displayName = 'TaskPanelWings'
