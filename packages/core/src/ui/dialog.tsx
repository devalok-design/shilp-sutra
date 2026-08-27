'use client'

import * as DialogPrimitive from '@primitives/react-dialog'
import { IconX as CloseIcon } from '@tabler/icons-react'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { useIsMobile } from '../hooks/use-mobile'
import { Icon } from './icon'
import { springs, tweens } from './lib/motion'
import { useControllableOpen } from './lib/use-controllable-open'
import { cn } from './lib/utils'

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
  const { open, setOpen } = useControllableOpen({ open: openProp, defaultOpen, onOpenChange })

  const contextValue = React.useMemo(() => ({ open }), [open])

  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
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

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** When true (default), Dialog fills the screen on mobile (<768px). Set false to always use centered modal. */
  responsive?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, responsive, ...props }, ref) => {
  const { open } = useDialogOpen()
  const isMobileRaw = useIsMobile()
  const isMobile = responsive !== false && isMobileRaw

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
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={isMobile
                ? springs.smooth
                : { ...springs.smooth, opacity: tweens.fade }
              }
              className={cn(
                'fixed z-modal grid w-full gap-ds-05 bg-surface-overlay p-ds-06',
                responsive !== false
                  ? 'inset-0 md:inset-auto md:left-[50%] md:top-[50%] md:max-w-lg md:rounded-overlay-lg md:shadow-overlay'
                  : 'left-[50%] top-[50%] max-w-lg rounded-overlay-lg shadow-overlay',
                className,
              )}
            >
              {children}
              <DialogPrimitive.Close title="Close" className="absolute right-ds-05 top-ds-05 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-control-inner text-surface-fg-subtle transition-colors duration-fast-01 ease-productive-standard hover:text-surface-fg-muted hover:bg-surface-panel-hover active:scale-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 disabled:pointer-events-none">
                <Icon icon={CloseIcon} size="lg" />
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
      'text-heading-xs font-semibold',
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
    className={cn('text-body-md text-surface-fg-muted', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export type { DialogContentProps }
export type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogContentRaw,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
