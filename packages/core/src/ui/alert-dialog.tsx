'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@primitives/react-alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'
import { useIsMobile } from '../hooks/use-mobile'

// ── Internal context to thread `open` state to animated children ──

type AlertDialogContextValue = { open: boolean }
const AlertDialogContext = React.createContext<AlertDialogContextValue>({ open: false })
const useAlertDialogOpen = () => React.useContext(AlertDialogContext)

const AlertDialog: React.FC<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>> = ({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}) => {
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
    <AlertDialogContext.Provider value={contextValue}>
      <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </AlertDialogContext.Provider>
  )
}
AlertDialog.displayName = 'AlertDialog'

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    forceMount
    className={cn(
      'fixed inset-0 z-modal bg-overlay',
      className,
    )}
    {...props}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  /** When true (default), AlertDialog fills the screen on mobile (<768px). Set false to always use centered modal. */
  responsive?: boolean
}

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, children, responsive, ...props }, ref) => {
  const { open } = useAlertDialogOpen()
  const isMobileRaw = useIsMobile()
  const isMobile = responsive !== false && isMobileRaw

  return (
    <AnimatePresence>
      {open && (
        <AlertDialogPortal forceMount>
          <AlertDialogOverlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={tweens.fade}
            />
          </AlertDialogOverlay>
          <AlertDialogPrimitive.Content
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
                  ? 'inset-0 md:inset-auto md:left-[50%] md:top-[50%] md:max-w-lg md:rounded-ds-xl md:border md:border-surface-border-strong md:shadow-overlay'
                  : 'left-[50%] top-[50%] max-w-lg rounded-ds-xl border border-surface-border-strong shadow-overlay',
                className,
              )}
            >
              {children}
            </motion.div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPortal>
      )}
    </AnimatePresence>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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
AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
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
AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-ds-lg font-semibold',
      className,
    )}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-ds-md text-surface-fg-muted', className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-ds-md items-center justify-center rounded-ds-md px-ds-05 text-ds-md font-semibold transition-colors bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-raised focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled',
      className,
    )}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      'inline-flex h-ds-md items-center justify-center rounded-ds-md px-ds-05 text-ds-md font-semibold transition-colors bg-transparent text-surface-fg-muted border border-surface-border-strong hover:bg-surface-raised hover:text-surface-fg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled',
      className,
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export type { AlertDialogContentProps }
export type AlertDialogActionProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
export type AlertDialogCancelProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
