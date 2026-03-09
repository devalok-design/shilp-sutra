'use client'

import * as React from 'react'
import * as ToastPrimitives from '@primitives/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { IconX } from '@tabler/icons-react'

import { cn } from './lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-toast flex max-h-screen w-full flex-col-reverse p-ds-05 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

/**
 * Toast color styles. Valid `color` values: `'neutral'` | `'success'` | `'warning'` | `'error'` | `'info'`.
 *
 * Note: `'destructive'` and `'karam'` are NOT valid color values and do not exist in this CVA definition.
 * The CSS class `destructive` appears internally as a group selector — it is not a prop value.
 */
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-ds-03 overflow-hidden rounded-ds-md border p-ds-05 pr-ds-06 shadow-03 transition-all duration-moderate-02 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      color: {
        neutral:
          'border-border bg-layer-01 text-text-primary',
        success:
          'border-success-border bg-success-surface text-success-text',
        warning:
          'border-warning-border bg-warning-surface text-warning-text',
        error:
          'destructive group border-border-error bg-error-surface text-error-text',
        info:
          'border-info-border bg-info-surface text-info-text',
      },
    },
    defaultVariants: {
      color: 'neutral',
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, color, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(toastVariants({ color }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-ds-sm shrink-0 items-center justify-center rounded-ds-md border border-border bg-transparent px-ds-04 text-ds-md font-medium transition-colors hover:bg-layer-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38] group-[.destructive]:border-border-error group-[.destructive]:hover:bg-error-surface',
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-ds-02 top-ds-02 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-md p-ds-02 text-text-secondary opacity-70 transition-opacity hover:text-text-primary hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
      className,
    )}
    toast-close=""
    {...props}
  >
    <IconX className="h-ico-sm w-ico-sm" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-ds-md font-semibold [&+div]:text-ds-sm', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-ds-md opacity-[0.9]', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

/**
 * Props for the `Toast` component. For imperative notifications (most common), use
 * the `useToast()` hook or `toast()` function with `<Toaster />` at layout root.
 *
 * @example
 * // Imperative approach (recommended for user-triggered notifications):
 * const { toast } = useToast()
 * toast({ title: 'Saved!', color: 'success' })
 *
 * // Declarative (for tests/Storybook only):
 * <Toast open color="error">
 *   <ToastTitle>Error</ToastTitle>
 *   <ToastDescription>Something went wrong.</ToastDescription>
 *   <ToastClose />
 * </Toast>
 */
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
