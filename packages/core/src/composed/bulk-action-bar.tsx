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
  /** Show inline confirmation before executing the action */
  requiresConfirmation?: boolean
  /** Custom confirmation message @default 'Are you sure?' */
  confirmMessage?: string
}

export interface BulkActionBarProps {
  show: boolean
  count: number
  onClearSelection: () => void
  actions: BulkActionBarAction[]
  /** Total number of items available for selection */
  totalCount?: number
  /** Called when user clicks "Select all" */
  onSelectAll?: () => void
  className?: string
}

// ============================================================
// ActionButton — handles inline confirmation
// ============================================================

function ActionButton({ action }: { action: BulkActionBarAction }) {
  const [confirming, setConfirming] = React.useState(false)

  if (confirming) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex items-center gap-ds-02"
      >
        <span className="text-ds-sm text-surface-fg-muted whitespace-nowrap">
          {action.confirmMessage ?? 'Are you sure?'}
        </span>
        <Button
          variant="solid"
          size="sm"
          color="error"
          onClick={() => {
            setConfirming(false)
            action.onClick()
          }}
        >
          Confirm
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Button
        variant="ghost"
        size="sm"
        color={action.color === 'error' ? 'error' : 'default'}
        disabled={action.disabled}
        onClick={action.requiresConfirmation ? () => setConfirming(true) : action.onClick}
        startIcon={action.icon ? <action.icon className="h-ico-sm w-ico-sm" /> : undefined}
      >
        {action.label}
      </Button>
    </motion.div>
  )
}

// ============================================================
// BulkActionBar
// ============================================================

function BulkActionBar({
  show,
  count,
  onClearSelection,
  actions,
  totalCount,
  onSelectAll,
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

          {totalCount != null && totalCount > count && onSelectAll && (
            <button
              type="button"
              onClick={onSelectAll}
              className="text-ds-sm text-accent-11 hover:underline cursor-pointer"
            >
              Select all {totalCount}
            </button>
          )}

          <div className="flex items-center gap-ds-02">
            <AnimatePresence mode="popLayout">
              {actions.map((action) => (
                <ActionButton key={action.label} action={action} />
              ))}
            </AnimatePresence>
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
