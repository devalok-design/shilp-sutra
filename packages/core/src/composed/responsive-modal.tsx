'use client'

import * as DialogPrimitive from '@primitives/react-dialog'
import { IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { useIsMobile } from '../hooks/use-mobile'
import { Icon } from '../ui/icon'
import { springs, tweens } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'

/**
 * ResponsiveModal — one overlay that is a centered **Dialog** on desktop (md+)
 * and a partial, content-height **bottom sheet** on mobile (drag-to-dismiss,
 * optional snap points). Built on the same accessible dialog primitive as
 * `Dialog` and `Sheet` (focus trap, Escape, scroll lock), so it is an
 * alternative-to both — not a re-roll.
 *
 * Why it exists: `DialogContent responsive` collapses to a full-screen takeover
 * on mobile (`inset-0`), which leaves dead space under short content and drops
 * the drawer affordances users expect. This composes the two correct halves and
 * owns the fiddly bits (pinned header, internal scroll body with sane height
 * caps, close-button stacking above an optional full-bleed background) so
 * consumers stop hand-rolling a `useIsMobile()` switch.
 *
 * **Parts (in composition order):**
 * - `ResponsiveModal` — open/close state (this root)
 * - `ResponsiveModalTrigger` — opens it (use `asChild`)
 * - `ResponsiveModalContent` — the switching panel (Dialog md+ / bottom sheet below)
 * - `ResponsiveModalBackground` — optional full-bleed layer painted behind content (`-z-10`)
 * - `ResponsiveModalHeader` — pinned; stays put while the body scrolls
 * - `ResponsiveModalTitle` — required for accessibility (labels the dialog)
 * - `ResponsiveModalDescription` — optional subtitle
 * - `ResponsiveModalBody` — internal scroll region (capped 85dvh desktop / 90dvh mobile)
 * - `ResponsiveModalFooter` — pinned action row
 * - `ResponsiveModalClose` — manual close (a close button is built into Content)
 *
 * @compound
 * @example
 * <ResponsiveModal>
 *   <ResponsiveModalTrigger asChild><Button>Open</Button></ResponsiveModalTrigger>
 *   <ResponsiveModalContent>
 *     <ResponsiveModalHeader>
 *       <ResponsiveModalTitle>Filters</ResponsiveModalTitle>
 *       <ResponsiveModalDescription>Narrow the result set.</ResponsiveModalDescription>
 *     </ResponsiveModalHeader>
 *     <ResponsiveModalBody>…form fields…</ResponsiveModalBody>
 *     <ResponsiveModalFooter>
 *       <ResponsiveModalClose asChild><Button variant="soft">Cancel</Button></ResponsiveModalClose>
 *       <Button>Apply</Button>
 *     </ResponsiveModalFooter>
 *   </ResponsiveModalContent>
 * </ResponsiveModal>
 */

// ── Context ──────────────────────────────────────────────────────────────────

type ResponsiveModalContextValue = {
  open: boolean
  isMobile: boolean
  dismissable: boolean
  onClose: () => void
}
const ResponsiveModalContext = React.createContext<ResponsiveModalContextValue>({
  open: false,
  isMobile: false,
  dismissable: true,
  onClose: () => {},
})
const useResponsiveModal = () => React.useContext(ResponsiveModalContext)

// ── Root ──────────────────────────────────────────────────────────────────────

export interface ResponsiveModalProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  /** When false, Escape/overlay/drag cannot dismiss — only an explicit Close/onOpenChange can. @default true */
  dismissable?: boolean
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  dismissable = true,
  children,
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const isMobile = useIsMobile()

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      // A non-dismissable modal ignores the primitive's implicit close attempts
      // (Escape, outside-click); only value=true or an explicit close gets through.
      if (!value && !dismissable) return
      if (!isControlled) setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange, dismissable],
  )

  const contextValue = React.useMemo<ResponsiveModalContextValue>(
    () => ({ open, isMobile, dismissable, onClose: () => handleOpenChange(false) }),
    [open, isMobile, dismissable, handleOpenChange],
  )

  return (
    <ResponsiveModalContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props}>
        {children}
      </DialogPrimitive.Root>
    </ResponsiveModalContext.Provider>
  )
}
ResponsiveModal.displayName = 'ResponsiveModal'

const ResponsiveModalTrigger = DialogPrimitive.Trigger
const ResponsiveModalClose = DialogPrimitive.Close
const ResponsiveModalPortal = DialogPrimitive.Portal

const ResponsiveModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    forceMount
    className={cn('fixed inset-0 z-overlay bg-overlay', className)}
    {...props}
  />
))
ResponsiveModalOverlay.displayName = 'ResponsiveModalOverlay'

// ── Snap points ────────────────────────────────────────────────────────────────
// A snap point is a fraction (0,1] of the viewport height the sheet rests at.
// Omitted → the sheet is content-height (capped at 90dvh) with a single rest at
// its natural height. Provided → the sheet is tall enough for the largest snap
// and rests at each fraction; dragging below the smallest past a threshold
// dismisses (when dismissable).

function nearestSnapIndex(currentVisibleFraction: number, snapPoints: number[]) {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < snapPoints.length; i++) {
    const d = Math.abs(snapPoints[i] - currentVisibleFraction)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

// ── Content ──────────────────────────────────────────────────────────────────

export interface ResponsiveModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * Mobile-only. Rest heights as ascending fractions of viewport height, e.g.
   * `[0.5, 0.9]`. Omit for a content-height sheet. The largest fraction caps the
   * sheet height. Ignored on desktop.
   */
  snapPoints?: number[]
  /** Mobile-only. Index into `snapPoints` the sheet opens at. @default last (tallest) */
  defaultSnapPoint?: number
}

const DRAG_DISMISS_THRESHOLD_PX = 120
const DRAG_DISMISS_VELOCITY = 500

const ResponsiveModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResponsiveModalContentProps
>(({ className, children, snapPoints, defaultSnapPoint, ...props }, ref) => {
  const { open, isMobile, dismissable, onClose } = useResponsiveModal()
  const reduced = useReducedMotion()
  const dragControls = useDragControls()

  const hasSnaps = isMobile && Array.isArray(snapPoints) && snapPoints.length > 0
  const sortedSnaps = React.useMemo(
    () => (hasSnaps ? [...snapPoints!].sort((a, b) => a - b) : []),
    [hasSnaps, snapPoints],
  )
  const maxSnap = sortedSnaps.length ? sortedSnaps[sortedSnaps.length - 1] : 1
  const initialSnap = React.useMemo(() => {
    if (!sortedSnaps.length) return 0
    const d = defaultSnapPoint ?? sortedSnaps.length - 1
    return Math.min(Math.max(d, 0), sortedSnaps.length - 1)
  }, [sortedSnaps, defaultSnapPoint])

  const [activeSnap, setActiveSnap] = React.useState(initialSnap)
  const [sheetHeight, setSheetHeight] = React.useState(0)
  const internalRef = React.useRef<HTMLDivElement>(null)

  // Reset to the opening snap each time it re-opens.
  React.useEffect(() => {
    if (open) setActiveSnap(initialSnap)
  }, [open, initialSnap])

  // Measure the laid-out sheet height so snap rest positions can be expressed in px.
  React.useEffect(() => {
    if (!isMobile) return
    const el = internalRef.current
    if (!el) return
    const measure = () => setSheetHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMobile, open])

  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  // Rest translateY for a snap index: at the tallest snap y=0; smaller snaps push
  // the sheet down so only that fraction of viewport height shows.
  const restY = React.useCallback(
    (index: number) => {
      if (!sortedSnaps.length || !sheetHeight) return 0
      const visible = sortedSnaps[index]
      return ((maxSnap - visible) / maxSnap) * sheetHeight
    },
    [sortedSnaps, sheetHeight, maxSnap],
  )

  const canDrag = isMobile && dismissable && !reduced

  const handleDragEnd = React.useCallback(
    (
      _e: unknown,
      info: { offset: { y: number }; velocity: { y: number } },
    ) => {
      if (!sortedSnaps.length) {
        // Content-height sheet: single rest; drag down past threshold dismisses.
        if (info.offset.y > DRAG_DISMISS_THRESHOLD_PX || info.velocity.y > DRAG_DISMISS_VELOCITY) {
          onClose()
        }
        return
      }
      // Snapped sheet: project the release point onto the visible-fraction axis.
      const currentY = restY(activeSnap) + info.offset.y
      const draggedVisible = maxSnap - (currentY / sheetHeight) * maxSnap
      const belowLowest = sortedSnaps[0] - draggedVisible
      if (
        activeSnap === 0 &&
        (belowLowest > 0.15 || info.velocity.y > DRAG_DISMISS_VELOCITY)
      ) {
        onClose()
        return
      }
      setActiveSnap(nearestSnapIndex(draggedVisible, sortedSnaps))
    },
    [sortedSnaps, restY, activeSnap, maxSnap, sheetHeight, onClose],
  )

  // ── Desktop: centered Dialog ──
  const desktopClasses =
    'fixed left-[50%] top-[50%] z-modal flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-overlay-lg bg-surface-overlay shadow-overlay'

  // ── Mobile: bottom sheet ──
  const mobileClasses = cn(
    'fixed inset-x-0 bottom-0 z-modal flex flex-col overflow-hidden rounded-t-overlay-lg border-t border-surface-border-strong bg-surface-overlay shadow-overlay',
    // Snap sheets are as tall as the largest snap; content sheets hug content up to 90dvh.
    hasSnaps ? undefined : 'max-h-[90dvh]',
  )

  const closeButton = dismissable ? (
    <DialogPrimitive.Close
      title="Close"
      className="absolute right-ds-05 top-ds-05 z-10 flex min-h-ds-xs min-w-ds-xs items-center justify-center rounded-control-inner text-surface-fg-subtle transition-colors duration-fast-01 ease-productive-standard hover:bg-surface-raised-hover hover:text-surface-fg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 active:scale-90 disabled:pointer-events-none"
    >
      <Icon icon={IconX} size="lg" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  ) : null

  return (
    <AnimatePresence>
      {open && (
        <ResponsiveModalPortal forceMount>
          <ResponsiveModalOverlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={tweens.fade}
            />
          </ResponsiveModalOverlay>
          <DialogPrimitive.Content
            ref={composedRef}
            forceMount
            asChild
            onPointerDownOutside={dismissable ? undefined : (e) => e.preventDefault()}
            {...props}
          >
            <motion.div
              className={cn(isMobile ? mobileClasses : desktopClasses, className)}
              style={
                hasSnaps
                  ? { height: `${maxSnap * 100}dvh` }
                  : undefined
              }
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
              animate={
                isMobile
                  ? { y: hasSnaps ? restY(activeSnap) : 0 }
                  : { opacity: 1, scale: 1, x: '-50%', y: '-50%' }
              }
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
              transition={isMobile ? springs.smooth : { ...springs.smooth, opacity: tweens.fade }}
              drag={canDrag ? 'y' : false}
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={0.15}
              onDragEnd={canDrag ? handleDragEnd : undefined}
            >
              {/* Drag handle — the only surface that initiates a drag, so the
                  scroll body below never fights the gesture (useDragControls). */}
              {isMobile && (
                <div
                  className={cn('flex shrink-0 justify-center pb-ds-01 pt-ds-03', canDrag && 'cursor-grab touch-none')}
                  onPointerDown={canDrag ? (e) => dragControls.start(e) : undefined}
                >
                  <div className="h-1 w-8 rounded-pill bg-surface-border" />
                </div>
              )}
              {closeButton}
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </ResponsiveModalPortal>
      )}
    </AnimatePresence>
  )
})
ResponsiveModalContent.displayName = 'ResponsiveModalContent'

// ── Background slot ────────────────────────────────────────────────────────────

/**
 * Full-bleed layer painted behind the modal content (`-z-10`), clipped to the
 * panel's rounded corners. Render whatever you want behind the content (a
 * gradient, an aurora, an image). It is non-interactive by default.
 */
const ResponsiveModalBackground = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]', className)}
      {...props}
    />
  ),
)
ResponsiveModalBackground.displayName = 'ResponsiveModalBackground'

// ── Layout parts ───────────────────────────────────────────────────────────────

/** Pinned header — sits above the scroll body and does not scroll with it. */
const ResponsiveModalHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex shrink-0 flex-col gap-ds-02b px-ds-06 pb-ds-04 pt-ds-05 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  ),
)
ResponsiveModalHeader.displayName = 'ResponsiveModalHeader'

/** Internal scroll region — grows to fill, scrolls when content exceeds the height cap. */
const ResponsiveModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('min-h-0 flex-1 overflow-y-auto px-ds-06 py-ds-02', className)}
      {...props}
    />
  ),
)
ResponsiveModalBody.displayName = 'ResponsiveModalBody'

/** Pinned footer action row. Stacks on mobile, right-aligned inline on desktop. */
const ResponsiveModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex shrink-0 flex-col-reverse gap-ds-03 px-ds-06 pb-ds-06 pt-ds-04 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  ),
)
ResponsiveModalFooter.displayName = 'ResponsiveModalFooter'

const ResponsiveModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-heading-xs font-semibold text-surface-fg', className)}
    {...props}
  />
))
ResponsiveModalTitle.displayName = 'ResponsiveModalTitle'

const ResponsiveModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-body-md text-surface-fg-muted', className)}
    {...props}
  />
))
ResponsiveModalDescription.displayName = 'ResponsiveModalDescription'

export {
  ResponsiveModal,
  ResponsiveModalBackground,
  ResponsiveModalBody,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalOverlay,
  ResponsiveModalPortal,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
}
