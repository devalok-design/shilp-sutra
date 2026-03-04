'use client'

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
 *     <button onClick={() => toast({ title: 'Saved!', description: 'Changes saved.', variant: 'success' })}>
 *       Save
 *     </button>
 *   )
 * }
 *
 * // Or use the imperative function directly (no hook needed):
 * import { toast } from '@devalok/shilp-sutra'
 * toast({ title: 'Deleted', variant: 'error' })
 *
 * // Valid variants: 'default' | 'success' | 'warning' | 'error' | 'info'
 */
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
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
    </ToastProvider>
  )
}
Toaster.displayName = 'Toaster'
