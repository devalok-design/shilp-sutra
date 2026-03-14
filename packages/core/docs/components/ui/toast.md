# Toast

- Import: @devalok/shilp-sutra/ui/toast
- Server-safe: No
- Category: ui

## API
    toast('Plain message')                    // no icon, no accent bar
    toast.message('Same as plain')            // alias for toast()
    toast.success('Saved!')                   // green accent, check icon
    toast.error('Failed', { description })    // red accent, X icon
    toast.warning('Disk low')                 // yellow accent, triangle icon
    toast.info('New version')                 // blue accent, info icon
    toast.loading('Saving...')                // interactive accent, spinner, no timer bar, duration: Infinity
    toast.promise(asyncFn, { loading, success, error })  // dynamic messages
    toast.undo('Item deleted', { onUndo, duration? })    // 8s default, Undo action button
    toast.upload({ files, id?, onRetry?, onRemove? })    // upload toast with per-file progress
    toast.custom((id) => <MyComponent />, options)       // escape hatch
    toast.dismiss(id?)                                   // specific or all

## Options (all methods accept)
    id?: string
    description?: ReactNode
    action?: { label: string, onClick: () => void }
    cancel?: { label: string, onClick: () => void }
    duration?: number (ms, default 5000)

## Types
    UploadFile: { id, name, size (bytes), progress? (0-100), status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error', error?, previewUrl? }

## Utility
    formatFileSize(bytes) => string (B, KB, MB, GB)

## Example
```jsx
// Mount <Toaster /> once at root layout
import { toast } from '@devalok/shilp-sutra/ui/toast'

toast.success('Changes saved!')
toast.error('Upload failed', { description: 'File too large' })
toast.undo('Task deleted', { onUndo: () => restoreTask(id) })
```

## Gotchas
- DO NOT use useToast() hook — it is deprecated, use imperative toast.* methods
- DO NOT use toast({ title, color }) object syntax — use toast.success('message') etc.
- DO NOT call toast() without <Toaster /> mounted at layout root
- Timer bar animates auto-dismiss countdown (hidden on loading toasts)
- Upload toast replaces the old UploadProgress composed component

## Changes
### v0.18.0
- **Changed** (BREAKING) Complete rewrite to Sonner-based imperative API
- **Fixed** Accent bar colors from step 7 to step 9 (decorative fills use solid step)

### v0.4.2
- **Changed** (BREAKING) `color="default"` renamed to `color="neutral"`

### v0.3.0
- **Changed** (BREAKING) `variant` prop renamed to `color` for semantic intent
- **Fixed** Close button now always visible (was hidden until hover)

### v0.1.0
- **Added** Initial release
- **Fixed** Toast now announces to screen readers (`role="status"`, `aria-live`)
