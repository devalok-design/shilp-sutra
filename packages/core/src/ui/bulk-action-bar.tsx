'use client'

import { IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { Badge } from './badge'
import { Button } from './button'
import { Icon } from './icon'
import type { IconInput } from './lib/icon-input'
import { springs } from './lib/motion'
import { cn } from './lib/utils'

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
  /**
   * Where the bar sits, and — as a consequence — whether it is portalled.
   *
   * `bottom` / `top` pin it to the viewport and render through a portal to
   * `document.body`. `inline` renders it in flow, in place, with no portal.
   *
   * Position and portalling are one prop rather than two because they are not
   * independent: a portal escapes its ancestors' stacking context, so a
   * portalled bar inside a Dialog or Sheet floats over the page rather than
   * belonging to the overlay. `inline` is the answer there, and it can only
   * work in flow.
   *
   * Every system surveyed before building this — Carbon, Polaris, Material —
   * renders its bulk bar in flow, anchored to whatever holds the selection.
   * The default stays `bottom` because that is what this component already did.
   *
   * @default 'bottom'
   */
  placement?: BulkActionsPlacement
}

/** Where the bar sits. `inline` is the only one that is not portalled. */
export type BulkActionsPlacement = 'bottom' | 'top' | 'inline'

const PLACEMENT_CLASSES: Record<BulkActionsPlacement, string> = {
  bottom: 'fixed bottom-ds-06 start-1/2 z-sticky -translate-x-1/2',
  top: 'fixed top-ds-06 start-1/2 z-sticky -translate-x-1/2',
  // No `fixed`, no transform — it takes part in the layout it is placed in.
  inline: 'relative',
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
    {
      show,
      count,
      onClearSelection,
      actions,
      totalCount,
      onSelectAll,
      placement = 'bottom',
      className,
      ...props
    },
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

    const portalled = placement !== 'inline'

    // The mount gate exists only so `document.body` is available for the
    // portal. An inline bar has no portal, so gating it would cost a
    // server-render for no reason and flash on hydrate.
    if (portalled && !mounted) return null

    const slideTransition = reduced ? { duration: 0 } : springs.smooth
    // Slide from the edge it is pinned to; inline just fades, since there is
    // no edge for it to arrive from.
    const offscreen =
      placement === 'top' ? { y: -100, opacity: 0 } : { y: 100, opacity: 0 }

    const tree = (
      <AnimatePresence>
        {show && (
          <motion.div
            ref={forwardedRef}
            initial={reduced || !portalled ? { opacity: 0 } : offscreen}
            animate={reduced || !portalled ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduced || !portalled ? { opacity: 0 } : offscreen}
            transition={slideTransition}
            className={cn(
              PLACEMENT_CLASSES[placement],
              'flex items-center gap-ds-04 rounded-surface bg-surface-overlay px-ds-05 py-ds-03 shadow-floating',
              className,
            )}
            role="toolbar"
            // A stable name describing PURPOSE, not state. The count is
            // already announced by the Badge below and by the live region on
            // "Select all"; putting it in the toolbar's accessible name too
            // means the name changes on every selection change, which a screen
            // reader re-announces. Overridable via aria-label.
            aria-label="Bulk actions"
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
                    // Destructive actions stay solid. Ghost is right for the
                    // rest — the bar itself is already the affordance — but a
                    // Delete that looks like every other button is the one
                    // place where quietness costs something.
                    variant={action.color === 'error' ? 'solid' : 'ghost'}
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
      </AnimatePresence>
    )

    return portalled ? createPortal(tree, document.body) : tree
  },
)
BulkActionBar.displayName = 'BulkActionBar'

export { BulkActionBar }
