'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconX } from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { springs } from '../ui/lib/motion'

// ============================================================
// Types
// ============================================================

export interface BulkActionBarAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  color?: 'default' | 'error'
  disabled?: boolean
}

export interface BulkActionBarProps {
  show: boolean
  count: number
  onClearSelection: () => void
  actions: BulkActionBarAction[]
  className?: string
}

// ============================================================
// BulkActionBar
// ============================================================

function BulkActionBar({
  show,
  count,
  onClearSelection,
  actions,
  className,
}: BulkActionBarProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={springs.snappy}
          className={cn(
            'fixed bottom-ds-06 left-1/2 z-50 -translate-x-1/2',
            'flex items-center gap-ds-04 rounded-ds-lg border border-surface-border bg-surface-overlay px-ds-05 py-ds-03 shadow-floating',
            className,
          )}
          role="toolbar"
          aria-label={`${count} items selected`}
        >
          <Badge variant="solid" size="sm">
            {count} selected
          </Badge>

          <div className="flex items-center gap-ds-02">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                color={action.color === 'error' ? 'error' : 'default'}
                disabled={action.disabled}
                onClick={action.onClick}
                startIcon={action.icon ? <action.icon className="h-ico-sm w-ico-sm" /> : undefined}
              >
                {action.label}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClearSelection}
            aria-label="Clear selection"
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export { BulkActionBar }
