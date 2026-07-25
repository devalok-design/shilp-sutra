'use client'

import { IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import type { IconInput } from '../ui/lib/icon-input'
import { springs } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'

type ButtonColor = React.ComponentProps<typeof Button>['color']

export interface BulkActionBarAction {
  label: string
  icon?: IconInput
  onClick: () => void
  /** Any Button color. @default 'accent' (or 'error' for destructive). */
  color?: ButtonColor
  disabled?: boolean
  /** Show a pending spinner on the action (e.g. slow bulk op in flight). */
  loading?: boolean
  /** Show inline confirmation before executing the action. */
  requiresConfirmation?: boolean
  /** Custom confirmation message. @default 'Are you sure?' */
  confirmMessage?: string
}

export interface BulkActionBarProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    // Keys whose types collide with framer-motion's HTMLMotionProps.
    'children' | 'color' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'style'
  > {
  show: boolean
  count: number
  onClearSelection: () => void
  actions: BulkActionBarAction[]
  /** Total items available for selection (enables "Select all"). */
  totalCount?: number
  /** Called when the user clicks "Select all". */
  onSelectAll?: () => void
}

/**
 * BulkActionBar — floating selection toolbar. Follows the ARIA toolbar model:
 * a single tab stop with roving focus (Arrow keys / Home / End) across ALL
 * controls (Select-all, actions, Clear), focus landing on the real buttons so
 * Enter/Space activate them. Arrow direction mirrors under `dir="rtl"`. Escape
 * clears the selection (or cancels a pending confirmation).
 */
const BulkActionBar = React.forwardRef<HTMLDivElement, BulkActionBarProps>(
  function BulkActionBar(
    { show, count, onClearSelection, actions, totalCount, onSelectAll, className, ...props },
    forwardedRef,
  ) {
    const reduced = useReducedMotion()
    const [mounted, setMounted] = React.useState(false)
    const [focusedIndex, setFocusedIndex] = React.useState(0)
    const [confirming, setConfirming] = React.useState<number | null>(null)
    const controlRefs = React.useRef<Array<HTMLButtonElement | null>>([])
    const confirmRef = React.useRef<HTMLButtonElement | null>(null)

    const hasSelectAll = totalCount != null && totalCount > count && !!onSelectAll
    const selectAllOffset = hasSelectAll ? 1 : 0
    const total = selectAllOffset + actions.length + 1 // + Clear

    React.useEffect(() => { setMounted(true) }, [])
    React.useEffect(() => { setFocusedIndex(0); setConfirming(null) }, [actions.length])
    // Move focus to Confirm when a confirmation opens.
    React.useEffect(() => {
      if (confirming != null) confirmRef.current?.focus()
    }, [confirming])

    const focusAt = (i: number) => {
      const clamped = (i + total) % total
      setFocusedIndex(clamped)
      controlRefs.current[clamped]?.focus()
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (confirming != null) { setConfirming(null); focusAt(focusedIndex) }
        else onClearSelection()
        return
      }
      if (confirming != null) return // roving suspended during confirm
      const rtl = e.currentTarget.dir === 'rtl' || document.dir === 'rtl'
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight'
      const back = rtl ? 'ArrowRight' : 'ArrowLeft'
      if (e.key === fwd) { e.preventDefault(); focusAt(focusedIndex + 1) }
      else if (e.key === back) { e.preventDefault(); focusAt(focusedIndex - 1) }
      else if (e.key === 'Home') { e.preventDefault(); focusAt(0) }
      else if (e.key === 'End') { e.preventDefault(); focusAt(total - 1) }
    }

    if (!mounted) return null

    const slideTransition = reduced ? { duration: 0 } : springs.smooth

    return createPortal(
      <AnimatePresence>
        {show && (
          <motion.div
            ref={forwardedRef}
            initial={reduced ? { opacity: 0 } : { y: 100, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 100, opacity: 0 }}
            transition={slideTransition}
            className={cn(
              'fixed bottom-ds-06 start-1/2 z-sticky -translate-x-1/2',
              'flex items-center gap-ds-04 rounded-surface bg-surface-overlay px-ds-05 py-ds-03 shadow-floating',
              className,
            )}
            role="toolbar"
            aria-label={`${count} items selected`}
            onKeyDown={handleKeyDown}
            {...props}
          >
            <Badge variant="solid" size="sm">{count} selected</Badge>

            {hasSelectAll && (
              <Button
                ref={(el) => { controlRefs.current[0] = el }}
                variant="link"
                size="xs"
                tabIndex={focusedIndex === 0 ? 0 : -1}
                onClick={onSelectAll}
              >
                Select all {totalCount}
              </Button>
            )}

            <div className="flex items-center gap-ds-02">
              {actions.map((action, i) => {
                const controlIndex = selectAllOffset + i
                const isConfirming = confirming === i
                if (isConfirming) {
                  return (
                    <div
                      key={action.label}
                      role="group"
                      aria-live="assertive"
                      className="flex items-center gap-ds-02"
                    >
                      <span className="whitespace-nowrap text-body-sm text-surface-fg-muted">
                        {action.confirmMessage ?? 'Are you sure?'}
                      </span>
                      <Button
                        ref={confirmRef}
                        variant="solid"
                        size="sm"
                        color={action.color === 'error' ? 'error' : (action.color ?? 'accent')}
                        onClick={() => { setConfirming(null); action.onClick() }}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setConfirming(null); focusAt(controlIndex) }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )
                }
                return (
                  <Button
                    key={action.label}
                    ref={(el) => { controlRefs.current[controlIndex] = el }}
                    variant="ghost"
                    size="sm"
                    color={action.color ?? 'accent'}
                    disabled={action.disabled}
                    loading={action.loading}
                    startIcon={action.icon ?? undefined}
                    tabIndex={focusedIndex === controlIndex ? 0 : -1}
                    onClick={action.requiresConfirmation ? () => setConfirming(i) : action.onClick}
                  >
                    {action.label}
                  </Button>
                )
              })}
            </div>

            <Button
              ref={(el) => { controlRefs.current[total - 1] = el }}
              variant="ghost"
              size="icon-sm"
              tabIndex={focusedIndex === total - 1 ? 0 : -1}
              onClick={onClearSelection}
              aria-label="Clear selection"
            >
              <Icon icon={IconX} size="sm" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )
  },
)
BulkActionBar.displayName = 'BulkActionBar'

export { BulkActionBar }
