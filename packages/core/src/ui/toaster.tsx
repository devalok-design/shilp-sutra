'use client'

import * as React from 'react'
import { cn } from './lib/utils'
import { useToast } from '../hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'

/**
 * Toaster — shell component that renders active toast notifications. Mount **once** at your root layout.
 *
 * @see {@link useToast} for the hook-based API
 * @see {@link toast} for the direct imperative function
 *
 * @example
 * // 1. Mount Toaster once in your root layout (e.g. app/layout.tsx in Next.js):
 * import { Toaster } from '@devalok/shilp-sutra'
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   )
 * }
 *
 * // 2. Trigger a toast from any component:
 * import { useToast } from '@devalok/shilp-sutra'
 * function SaveButton() {
 *   const { toast } = useToast()
 *   return (
 *     <button onClick={() => toast({ title: 'Saved!', description: 'Changes saved.', color: 'success' })}>
 *       Save
 *     </button>
 *   )
 * }
 *
 * // Or use the imperative function directly (no hook needed):
 * import { toast } from '@devalok/shilp-sutra'
 * toast({ title: 'Deleted', color: 'error' })
 *
 * // Valid colors: 'neutral' | 'success' | 'warning' | 'error' | 'info'
 */
export function Toaster({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <div className={cn(className)} {...props}>
        {toasts.map(function ({ id, title, description, action, ...toastProps }) {
          return (
            <Toast key={id} {...toastProps}>
              <div className="grid gap-ds-02">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        })}
        <ToastViewport />
      </div>
    </ToastProvider>
  )
}
Toaster.displayName = 'Toaster'
