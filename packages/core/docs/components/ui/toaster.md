# Toaster

- Import: @devalok/shilp-sutra/ui/toaster
- Server-safe: No
- Category: ui

## Props
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    closeButton: boolean
    duration: number (ms)
    hotkey: string[]
    visibleToasts: number

## Defaults
    position: "bottom-right"
    closeButton: false
    duration: 5000
    hotkey: ['altKey', 'KeyT']
    visibleToasts: 3

## Example
```jsx
// Mount once at root layout
import { Toaster } from '@devalok/shilp-sutra/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
```

## Composability
- **Mount once, use everywhere.** Render `<Toaster />` in the root layout file once. Every `toast.*` call anywhere in the tree routes to this single container.
- **Global config lives here.** Set `position`, `duration`, `visibleToasts` on Toaster to control default behavior for all toasts. Individual `toast.*` calls can override `duration` per toast.
- **Keyboard shortcut:** `hotkey` prop sets a global shortcut to focus the toast region (default: Alt+T). Useful for keyboard users to review recent notifications.
- **Next.js / App Router:** Mount inside your root `app/layout.tsx`'s `<body>`. It's marked `'use client'` so it doesn't render on the server (Toaster is client-only).
- **Portal rendering:** z-toast (highest layer) — Toaster content appears above Dialog, Popover, everything. Don't wrap it in a stacking context.

## Gotchas
- Must be mounted once at the layout root for toast notifications to work
- Use the `toast` import from `@devalok/shilp-sutra/ui/toast` to trigger toasts
- NOT server-safe — mounts with 'use client'; rendering during SSR has no visual effect

## Changes
### v0.18.0
- **Changed** (BREAKING) Rewritten to Sonner-based engine with custom ToastContent rendering
- **Added** `ToasterProps` type export
- **Added** Visual: neutral bg-layer-01 base, colored left accent bar per type, status icon, timer bar

### v0.1.0
- **Added** Initial release
