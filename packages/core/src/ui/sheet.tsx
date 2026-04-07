'use client'

import * as React from 'react'
import * as SheetPrimitive from '@primitives/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { IconX } from '@tabler/icons-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens, motionProps } from './lib/motion'
import { Icon } from './icon'
import { useIsMobile } from '../hooks/use-mobile'

// ── Internal open-state context ──────────────────────────────────────

const SheetOpenContext = React.createContext<{ open: boolean; onClose: () => void }>({ open: false, onClose: () => {} })

/**
 * Sheet compound component — accessible sliding panel anchored to a screen edge, with focus trap
 * and Escape dismissal. Built on the Dialog primitive.
 *
 * **Parts (in composition order):**
 * - `Sheet` — manages open/closed state (this root)
 * - `SheetTrigger` — element that opens the sheet (use `asChild` to render your own button)
 * - `SheetContent` — the sliding panel (use `side="right"|"left"|"top"|"bottom"`, default `"right"`)
 * - `SheetHeader` — optional layout wrapper for title + description
 * - `SheetTitle` — required for accessibility (sets the sheet's ARIA label)
 * - `SheetDescription` — optional subtitle text
 * - `SheetFooter` — optional layout wrapper for action buttons
 * - `SheetClose` — manual close trigger (a close button is already built into SheetContent)
 * - `SheetPortal` — low-level portal wrapper (exported for custom layout; used internally by SheetContent)
 * - `SheetOverlay` — the backdrop element (exported for custom overlay styling)
 *
 * @compound
 *
 * Note: The `side` prop goes on `SheetContent`, NOT on `Sheet`.
 * A close button is auto-rendered in the top corner of `SheetContent`.
 *
 * @example
 * // Right-side settings panel (default):
 * <Sheet>
 *   <SheetTrigger asChild><Button>Open settings</Button></SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>Account settings</SheetTitle>
 *       <SheetDescription>Manage your profile and preferences.</SheetDescription>
 *     </SheetHeader>
 *   </SheetContent>
 * </Sheet>
 *
 * @example
 * // Bottom sheet for a mobile-friendly action drawer:
 * <Sheet>
 *   <SheetTrigger asChild><Button variant="ghost">More options</Button></SheetTrigger>
 *   <SheetContent side="bottom">
 *     <SheetTitle>Actions</SheetTitle>
 *     <div className="flex flex-col gap-ds-03 mt-ds-05">
 *       <Button variant="outline" color="error" fullWidth>Delete item</Button>
 *       <Button variant="outline" fullWidth>Duplicate</Button>
 *     </div>
 *   </SheetContent>
 * </Sheet>
 */
const Sheet: React.FC<React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
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

  const contextValue = React.useMemo(
    () => ({ open, onClose: () => handleOpenChange(false) }),
    [open, handleOpenChange],
  )

  return (
    <SheetOpenContext.Provider value={contextValue}>
      <SheetPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props}>
        {children}
      </SheetPrimitive.Root>
    </SheetOpenContext.Provider>
  )
}
Sheet.displayName = 'Sheet'

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay forceMount asChild>
    <motion.div
      ref={ref}
      className={cn('fixed inset-0 z-modal bg-overlay', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={tweens.fade}
      {...motionProps(props)}
    />
  </SheetPrimitive.Overlay>
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// ── Slide direction map ──────────────────────────────────────────────

const slideInitial = {
  top: { y: '-100%' },
  bottom: { y: '100%' },
  left: { x: '-100%' },
  right: { x: '100%' },
} as const

const slideAnimate = {
  top: { y: 0 },
  bottom: { y: 0 },
  left: { x: 0 },
  right: { x: 0 },
} as const

const sheetVariants = cva(
  'fixed z-modal gap-ds-05 bg-surface-overlay p-ds-06 shadow-overlay',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b border-surface-border-strong',
        bottom: 'inset-x-0 bottom-0 border-t border-surface-border-strong',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r border-surface-border-strong sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l border-surface-border-strong sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

/**
 * Props for SheetContent — the sliding panel content that appears from one of four screen edges.
 * Built on the Dialog primitive: accessible, focus-trapped, and dismissible with Escape.
 *
 * **`side` variants:** `right` (default, slide from right) | `left` | `top` | `bottom`
 *
 * **Usage pattern:** Wrap the whole sheet in `<Sheet>`, add a `<SheetTrigger>`, and put content
 * inside `<SheetContent>`. Use `<SheetHeader>`, `<SheetTitle>`, and `<SheetDescription>` for
 * accessible structure. A close button is auto-rendered in the top corner.
 *
 * @example
 * // Right-side settings panel (default):
 * <Sheet>
 *   <SheetTrigger asChild><Button>Open settings</Button></SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>Account settings</SheetTitle>
 *       <SheetDescription>Manage your profile and preferences.</SheetDescription>
 *     </SheetHeader>
 *   </SheetContent>
 * </Sheet>
 *
 * @example
 * // Bottom sheet for a mobile-friendly action drawer:
 * <Sheet>
 *   <SheetTrigger asChild><Button variant="ghost">More options</Button></SheetTrigger>
 *   <SheetContent side="bottom">
 *     <SheetTitle>Actions</SheetTitle>
 *     <div className="flex flex-col gap-ds-03 mt-ds-05">
 *       <Button variant="outline" color="error" fullWidth>Delete item</Button>
 *       <Button variant="outline" fullWidth>Duplicate</Button>
 *     </div>
 *   </SheetContent>
 * </Sheet>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /** When true (default), Sheet slides from bottom on mobile with swipe-to-dismiss. */
  responsive?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', responsive, className, children, ...props }, ref) => {
  const isMobileRaw = useIsMobile()
  const isMobile = responsive !== false && isMobileRaw
  const isReduced = useReducedMotion()
  const { open, onClose } = React.useContext(SheetOpenContext)
  const effectiveSide = isMobile ? 'bottom' : (side ?? 'right')

  const internalRef = React.useRef<HTMLDivElement>(null)
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal forceMount>
          <SheetOverlay />
          <SheetPrimitive.Content forceMount asChild>
            <motion.div
              ref={composedRef}
              className={cn(sheetVariants({ side: effectiveSide }), className)}
              initial={slideInitial[effectiveSide]}
              animate={slideAnimate[effectiveSide]}
              exit={slideInitial[effectiveSide]}
              transition={springs.smooth}
              drag={isMobile && !isReduced ? 'y' : false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={
                isMobile
                  ? (
                      _: unknown,
                      info: { offset: { y: number }; velocity: { y: number } },
                    ) => {
                      const h =
                        internalRef.current?.getBoundingClientRect().height ?? 300
                      if (info.offset.y > h * 0.3 || info.velocity.y > 500)
                        onClose()
                    }
                  : undefined
              }
              {...motionProps(props)}
            >
              {isMobile && (
                <div className="flex justify-center pt-ds-03 pb-ds-02">
                  <div className="h-1 w-8 rounded-ds-full bg-surface-border" />
                </div>
              )}
              <SheetPrimitive.Close title="Close" className="absolute right-ds-05 top-ds-05 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-sm text-surface-fg-subtle transition-colors ease-productive-standard hover:text-surface-fg-muted hover:bg-surface-raised-hover active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 disabled:pointer-events-none">
                <Icon icon={IconX} size="sm" />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
              {children}
            </motion.div>
          </SheetPrimitive.Content>
        </SheetPortal>
      )}
    </AnimatePresence>
  )
})
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-ds-03 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  ),
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-ds-03',
        className,
      )}
      {...props}
    />
  ),
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-ds-lg font-semibold text-surface-fg', className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-ds-md text-surface-fg-muted', className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
