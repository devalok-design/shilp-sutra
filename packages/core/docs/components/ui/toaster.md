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

## Gotchas
- Must be mounted once at the layout root for toast notifications to work
- Use the `toast` import from `@devalok/shilp-sutra/ui/toast` to trigger toasts

## Changes
### v0.18.0
- **Changed** (BREAKING) Rewritten to Sonner-based engine with custom ToastContent rendering
- **Added** `ToasterProps` type export
- **Added** Visual: neutral bg-layer-01 base, colored left accent bar per type, status icon, timer bar

### v0.1.0
- **Added** Initial release
