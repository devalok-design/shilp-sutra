# Toast

Transient floating notification. Imperative API — call from event handlers, never render JSX.

```tsx
import { toast } from '@devalok/shilp-sutra/ui/toast'
import { Toaster } from '@devalok/shilp-sutra/ui/toaster'
```

## When to use

- Confirmation after an action (saved, copied, sent).
- Non-blocking error feedback (failed to save — try again).
- Async progress with success/failure resolution — use `toast.promise`.
- File upload progress — use `toast.upload`.
- Inline in-flow message that must stay visible? Use `<Alert>`.
- Page-level strip (cookie banner, account warning)? Use `<Banner>`.
- Modal interruption? Use `<Dialog>`.

## Setup

Mount `<Toaster />` **once** at the app root. Every `toast.*` call routes to this single container.

```tsx
// app/layout.tsx (Next.js) or src/App.tsx
import { Toaster } from '@devalok/shilp-sutra/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

Without a mounted Toaster, every `toast.*` call is a silent no-op.

## API

```ts
toast('Plain message')                                    // no icon, no accent
toast.message('Same as plain')                            // alias
toast.success('Saved!')                                   // green accent + check
toast.error('Failed', { description })                    // red accent + X (assertive a11y)
toast.warning('Disk low')                                 // yellow accent + triangle
toast.info('New version available')                       // blue accent + info
toast.loading('Saving...')                                // spinner, duration: Infinity
toast.promise(asyncFn, { loading, success, error })       // one toast, three states
toast.undo('Item deleted', { onUndo, duration? })         // 8s default, Undo button
toast.upload({ files, id?, onRetry?, onRemove? })         // per-file progress
toast.custom((id) => <MyComponent />, options)            // escape hatch
toast.dismiss(id?)                                        // specific or all
```

## Options (every method)

| Option | Type | Notes |
|---|---|---|
| `id` | `string` | Stable id — pass the same id to update / dismiss. |
| `description` | `ReactNode` | Subline under the main message. |
| `action` | `{ label, onClick }` | Right-aligned action button. |
| `cancel` | `{ label, onClick }` | Right-aligned dismiss button. |
| `duration` | `number` (ms) | Default `5000`. `Infinity` for loading toasts. |

## Toaster props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `position` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Global default. |
| `closeButton` | `boolean` | `false` | Show X on every toast. |
| `duration` | `number` (ms) | `5000` | Global default — overridable per toast. |
| `hotkey` | `string[]` | `['altKey', 'KeyT']` | Keyboard shortcut to focus the toast region. |
| `visibleToasts` | `number` | `3` | Max stacked toasts; older ones move to a "+N" stack. |

## Examples

**Confirmation after save:**
```tsx
async function handleSave() {
  await api.save(data)
  toast.success('Changes saved')
}
```

**Error with description:**
```tsx
toast.error('Upload failed', {
  description: 'File is larger than 10 MB.',
})
```

**Async with three states (`toast.promise`):**
```tsx
toast.promise(
  api.publishPost(post),
  {
    loading: 'Publishing post...',
    success: 'Published',
    error: (err) => `Failed: ${err.message}`,
  }
)
```

One toast, transitions loading → success / error. No manual `.loading()` + `.success()` choreography.

**Undo pattern (soft-delete):**
```tsx
function deleteTask(task) {
  const snapshot = task
  setTasks((prev) => prev.filter((t) => t.id !== task.id))
  toast.undo('Task deleted', {
    onUndo: () => setTasks((prev) => [...prev, snapshot]),
  })
}
```

Default 8s duration — gives the user time to react.

**File upload progress:**
```tsx
const id = 'upload-' + Date.now()

toast.upload({
  id,
  files: [
    { id: 'f1', name: 'doc.pdf', size: 1_200_000, status: 'uploading', progress: 0 },
  ],
})

xhr.onprogress = (e) => {
  toast.upload({
    id,
    files: [{ id: 'f1', name: 'doc.pdf', size: 1_200_000, status: 'uploading', progress: (e.loaded / e.total) * 100 }],
  })
}

xhr.onload = () => {
  toast.upload({
    id,
    files: [{ id: 'f1', name: 'doc.pdf', size: 1_200_000, status: 'complete', progress: 100 }],
  })
}
```

Passing the same `id` updates the existing toast in place — no flicker.

**Custom action:**
```tsx
toast('Project archived', {
  action: { label: 'Open', onClick: () => router.push(`/archive/${id}`) },
})
```

**Loading + manual resolution:**
```tsx
const id = toast.loading('Compiling...')
try {
  await compile()
  toast.success('Compiled', { id })  // replaces the loading toast
} catch (err) {
  toast.error('Compile failed', { id, description: err.message })
}
```

## Accessibility

- `toast.error` uses `aria-live="assertive"` — screen readers interrupt the current announcement.
- Other variants use `aria-live="polite"` — announced after current speech.
- `<Toaster hotkey={['altKey', 'KeyT']}>` lets keyboard users jump to the toast region.

## Composability

- **One Toaster, many toasts:** Mount once in the root layout. Don't mount per-route — toasts will disappear on navigation.
- **Imperative only:** No JSX render path. Call `toast.*` from event handlers, async flows, error boundaries.
- **z-toast (top layer):** Sits above Dialog, Popover, everything. Don't wrap Toaster in a stacking context.
- **SSR:** Toaster is marked `'use client'` — renders nothing on the server, hydrates on mount.

See `foundations/motion.md` for the spring enter/exit, `foundations/color.md` for accent-bar colors.

## Rules

- Mount `<Toaster />` exactly once, at the app root. Multiple Toasters double-render every toast.
- Never call `toast()` in render. Always from a handler, effect, or async function.
- Don't use the removed `useToast()` hook or `toast({ title, color })` object syntax — both were removed in 0.18.
- Use `toast.promise` for async flows — manual loading → success choreography is error-prone.
- For undo affordances, use `toast.undo` — gives the consistent 8s duration plus the styled button.
- Don't use Toast for content the user must read — they auto-dismiss. Use Alert or Banner instead.
- Pass a stable `id` when you want to update / replace a toast — without an id, repeated calls stack.
- `toast.error` is assertive — don't use it for soft warnings. Use `toast.warning`.
