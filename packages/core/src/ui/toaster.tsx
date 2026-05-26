'use client'

import * as React from 'react'
import { Toaster as SonnerToaster } from 'sonner'

import { cn } from './lib/utils'
import { registerToaster } from './toast-registry'

/**
 * Toaster — mount once at your root layout to enable toast notifications.
 *
 * **⚠ Peer dependency required:** `sonner`. Without it your build fails with
 * `Cannot find module 'sonner'`. Install:
 * ```bash
 * pnpm add sonner    # or: npm i sonner / yarn add sonner / bun add sonner
 * ```
 * `sonner` is listed as an optional peer because consumers who never render
 * `<Toaster />` shouldn't pay the install cost — but once you import this
 * component, it becomes effectively required.
 *
 * @example
 * import { Toaster } from '@devalok/shilp-sutra/ui/toaster'
 *
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
 * // Then from any component:
 * import { toast } from '@devalok/shilp-sutra/ui/toast'
 * toast.success('Saved!')
 */
export interface ToasterProps {
  /** Toast position on screen. Default: 'bottom-right' */
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  /** Show close button on all toasts. Default: false */
  closeButton?: boolean
  /** Default auto-dismiss duration in ms. Default: 5000 */
  duration?: number
  /** Keyboard shortcut to focus toast region. Default: ['altKey', 'KeyT'] */
  hotkey?: string[]
  /** Max visible toasts before stacking. Default: 3 */
  visibleToasts?: number
  /** Additional CSS class */
  className?: string
}

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  (
    {
      position = 'bottom-right',
      closeButton = false,
      duration = 5000,
      hotkey = ['altKey', 'KeyT'],
      visibleToasts = 3,
      className,
    },
    ref,
  ) => {
    React.useEffect(() => registerToaster(), [])
    return (
      <div ref={ref} className={cn('z-toast', className)}>
        <SonnerToaster
          position={position}
          closeButton={closeButton}
          duration={duration}
          hotkey={hotkey}
          visibleToasts={visibleToasts}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'w-full',
            },
          }}
        />
      </div>
    )
  },
)
Toaster.displayName = 'Toaster'
