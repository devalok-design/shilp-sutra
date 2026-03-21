'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconArrowLeft } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'
import { tweens } from '@/ui/lib/motion'
import { Button } from '@/ui/button'
import { useTaskPanel } from './task-panel-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelFullProps {
  className?: string
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// FullPageContainer
// ---------------------------------------------------------------------------

export function TaskPanelFull({ className, children }: TaskPanelFullProps) {
  const { onClose } = useTaskPanel()

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'flex h-full flex-col bg-surface-raised',
          className,
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={tweens.fade}
      >
        {/* Back button */}
        <div className="flex items-center border-b border-surface-border-subtle px-ds-05 py-ds-03">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-ds-02"
          >
            <IconArrowLeft className="h-ico-sm w-ico-sm" />
            Back
          </Button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

TaskPanelFull.displayName = 'TaskPanelFull'
