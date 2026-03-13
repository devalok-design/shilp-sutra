'use client'

import * as React from 'react'
import * as DialogPrimitive from '@primitives/react-dialog'
import { IconX as CloseIcon } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

// ── Internal context to thread `open` state to animated children ──

type DialogContextValue = { open: boolean }
const DialogContext = React.createContext<DialogContextValue>({ open: false })
const useDialogOpen = () => React.useContext(DialogContext)

/**
 * Dialog compound component — accessible modal overlay with focus trap and Escape dismissal.
 *
 * **Parts (in composition order):**
 * - `Dialog` — manages open/closed state (this root)
 * - `DialogTrigger` — element that opens the dialog (use `asChild` to render your own button)
 * - `DialogContent` — the modal panel (auto-includes portal, overlay, and close button)
 * - `DialogHeader` — optional layout wrapper for title + description
 * - `DialogTitle` — required for accessibility (sets the dialog's ARIA label)
 * - `DialogDescription` — optional subtitle text
 * - `DialogFooter` — optional layout wrapper for action buttons
 * - `DialogClose` — manual close trigger (a close button is already built into DialogContent)
 * - `DialogContentRaw` — use instead of DialogContent when you need full portal/overlay control
 * - `DialogPortal` — low-level portal wrapper (exported for custom layout; used internally by DialogContent)
 * - `DialogOverlay` — the backdrop element (exported for custom overlay styling or positioning)
 *
 * @compound
 * @example
 * // Confirmation dialog:
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button variant="solid" color="error">Delete project</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Are you absolutely sure?</DialogTitle>
 *       <DialogDescription>
 *         This action cannot be undone. This will permanently delete your project.
 *       </DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
 *       <Button variant="solid" color="error" onClick={handleDelete}>Delete</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 *
 * @example
 * // Controlled open state (no trigger in markup):
 * const [open, setOpen] = useState(false)
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogContent>
 *     <DialogTitle>Edit profile</DialogTitle>
 *     // form fields
 *   </DialogContent>
 * </Dialog>
 */
const Dialog: React.FC<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>> = ({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}) => {
  // Track internal open state for uncontrolled usage
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  const contextValue = React.useMemo(() => ({ open }), [open])

  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </DialogContext.Provider>
  )
}
Dialog.displayName = 'Dialog'

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    forceMount
    className={cn(
      'fixed inset-0 z-overlay bg-overlay',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { open } = useDialogOpen()

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal forceMount>
          <DialogOverlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={tweens.fade}
            />
          </DialogOverlay>
          <DialogPrimitive.Content
            ref={ref}
            forceMount
            asChild
            {...props}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ...springs.smooth, opacity: tweens.fade }}
              className={cn(
                'fixed left-[50%] top-[50%] z-modal grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-ds-05 border border-surface-border-strong bg-surface-1 p-ds-06 shadow-04 rounded-ds-xl',
                className,
              )}
            >
              {children}
              <DialogPrimitive.Close className="absolute right-ds-05 top-ds-05 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-sm text-surface-fg-subtle transition-colors hover:text-surface-fg-muted hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 disabled:pointer-events-none">
                <CloseIcon className="h-ico-lg w-ico-lg" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * DialogContentRaw -- a minimal forwardRef wrapper around the primitive Content.
 * Unlike DialogContent, it does NOT include Portal, Overlay, or CloseButton.
 * Use this when you need full control over portal/overlay/close behaviour
 * (e.g. CommandPalette in shared/).
 */
const DialogContentRaw = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
DialogContentRaw.displayName = 'DialogContentRaw'

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-ds-02b text-center sm:text-left',
        className,
      )}
      {...props}
    />
  ),
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-ds-lg font-semibold',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-ds-md text-surface-fg-muted', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
export type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogContentRaw,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
