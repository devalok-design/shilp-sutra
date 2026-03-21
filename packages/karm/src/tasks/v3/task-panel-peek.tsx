'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/ui/lib/utils'
import { springs, tweens } from '@/ui/lib/motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskPanelPeekProps {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// PeekContainer
// ---------------------------------------------------------------------------

export function TaskPanelPeek({
  open,
  onClose,
  className,
  children,
}: TaskPanelPeekProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Dismiss on Escape
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Dismiss on click outside
  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // Use a microtask delay so the opening click doesn't immediately close
    const id = requestAnimationFrame(() => {
      document.addEventListener('pointerdown', handlePointerDown)
    })

    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          className={cn(
            'fixed right-ds-06 top-ds-06 z-modal max-h-[500px] w-full max-w-[400px] overflow-y-auto rounded-ds-xl border border-surface-border-strong bg-surface-overlay p-ds-05 shadow-floating',
            className,
          )}
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-surface-border) transparent' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ ...springs.snappy, opacity: tweens.fade }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

TaskPanelPeek.displayName = 'TaskPanelPeek'
