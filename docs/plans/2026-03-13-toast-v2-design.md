# Toast v2 — Sonner-Powered Redesign

**Date:** 2026-03-13
**Status:** Approved
**Breaking:** Yes (minor version bump while 0.x)

## Goal

Replace the current Radix-based Toast with a Sonner-powered implementation featuring a professional hybrid visual design, promise toasts, upload tracking, auto-dismiss timer bars, and modern stacking animations. Delete the `UploadProgress` composed component — upload tracking moves entirely into the toast system.

## Current State

- `src/ui/toast.tsx` — Radix Toast wrapper, 5 color variants (neutral/success/warning/error/info), compound component API
- `src/ui/toaster.tsx` — Shell that renders active toasts from `useToast()` state
- `src/hooks/use-toast.ts` — Hook + imperative `toast()` function, TOAST_LIMIT=2, TOAST_REMOVE_DELAY=5000ms
- `src/composed/upload-progress.tsx` — Multi-file upload tracker with 5 statuses, compact/default variants, staggered animations
- Karm usage: break admin panel (approve/reject/delete/edit flows) via `useToast()`

### Problems with Current Implementation

1. **No `toast.promise()`** — table-stakes for async apps, Karm needs this everywhere
2. **No loading state** — no spinner/loading toast type
3. **No pause on hover** — toasts disappear while users are reading them
4. **No stacking animation** — toasts just stack vertically, no depth/perspective
5. **No timer indicator** — users have no sense of when the toast will disappear
6. **Flat visual design** — colored rectangles with text, no status icons, no visual hierarchy between types
7. **Upload tracking is a separate component** — `UploadProgress` exists but Karm doesn't use it; uploads should live in toasts
8. **No undo pattern** — destructive actions in Karm need undo toasts (currently ad-hoc)
9. **Compound component API is verbose** — requires `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastClose`, `ToastAction` for basic usage

## Industry Research

Surveyed: Sonner, shadcn/ui, Radix Toast, Vercel Geist, Linear, Chakra UI v3, Mantine, React Hot Toast, Fluent UI 2, HeroUI.

**Key findings:**
- shadcn/ui deprecated their Radix Toast in favor of wrapping Sonner
- Sonner is the de facto standard (13M+ weekly downloads, used by Vercel, Cursor, OpenAI, Adobe)
- `toast.promise()` is universal across all modern libraries
- Stacking with depth animation is the expected UX (pioneered by Linear, open-sourced by Sonner)
- Pause-on-hover is standard everywhere
- Mantine's `notifications.update()` pattern is elegant for morphing loading→success
- Fluent UI's progress toasts are unique — determinate progress bars for long operations
- Auto-dismiss timer bars appear in Mantine and some Fluent implementations
- Accessibility consensus: `aria-live="polite"` for standard toasts, never auto-dismiss actionable content, respect `prefers-reduced-motion`

## Design

### Foundation

- **Sonner** as rendering engine, added as a bundled dependency in core
- Styled with our semantic design tokens
- Exposed through our own API surface (not raw Sonner exports)

### Visual Design — Hybrid Professional

Inspired by Linear/Vercel's clean aesthetic with semantic color accents for scanability.

**Standard toast anatomy:**

```
┌─────────────────────────────────────────┐
│ ┃  ✓  Changes saved              [×]   │
│ ┃     Your project has been updated.    │
│ ┃                          [ Undo ]     │
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
 ↑         ↑                        ↑
 accent   icon                   timer bar
 bar      (semantic color)       (fading)
```

**Design tokens used:**

| Element | Token |
|---------|-------|
| Background | `bg-layer-01` (neutral for all types) |
| Border | `border-border` |
| Shadow | `shadow-02` |
| Border radius | `rounded-ds-md` |
| Left accent bar | 3-4px, semantic color per type |
| Status icon | 16px, semantic color, filled style |
| Title | `text-ds-md font-semibold text-text-primary` |
| Description | `text-ds-sm text-text-secondary` |
| Action button | `text-interactive`, no border, hover underline |
| Cancel button | `text-text-secondary` |
| Close button | Top-right, `text-text-secondary`, `opacity-50` → `opacity-100` on hover |
| Timer bar | Bottom edge, 2px, accent color at 30% opacity, animates width 100%→0% |

**Accent bar colors by type:**

| Type | Accent color | Icon |
|------|-------------|------|
| `message` (plain) | None | None |
| `success` | `bg-success-border` | `IconCircleCheck` |
| `warning` | `bg-warning-border` | `IconAlertTriangle` |
| `error` | `bg-error-border` | `IconCircleX` |
| `info` | `bg-info-border` | `IconInfoCircle` |
| `loading` | `bg-interactive` | `IconLoader2` (spinning) |

**Dark mode:** Same structure, tokens handle the color swap automatically.

**Upload toast anatomy:**

```
┌─────────────────────────────────────────┐
│ ┃  ↑  Uploading 2 files           [×]  │
│ ┃     1 of 2 complete                   │
│ ┃  ┌─────────────────────────────────┐  │
│ ┃  │ 📄 report.pdf       ████░░ 62% │  │
│ ┃  │ 📄 avatar.png       ✓ Complete  │  │
│ ┃  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

- **Header:** Upload icon + "Uploading X files" title + "N of M complete" summary
- **File rows:** Compact single-line — file icon, truncated name, progress bar (sm) or status badge
- **Per-file status:** `pending` | `uploading` | `processing` | `complete` | `error`
- **Per-file actions:** Retry (on error), remove/cancel (on uploading/pending)
- **Scrollable** file list if > 3 files (max-height constrained)
- **Accent bar:** `bg-interactive` while uploading → `bg-success-border` on all complete → `bg-error-border` if any failed
- **No auto-dismiss** while uploads in progress; 3s auto-dismiss after all terminal
- **Timer bar** appears only after all files reach terminal state

### API Surface

```tsx
// ─── Simple toasts ───
toast('Something happened')                    // plain, no icon, no accent
toast.message('Copied to clipboard')           // alias for plain
toast.success('Saved successfully')
toast.error('Failed to save')
toast.warning('Connection unstable')
toast.info('New version available')
toast.loading('Processing...')

// ─── Promise toast (loading → success/error) ───
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
})

// Dynamic messages from resolved/rejected value
toast.promise(uploadFile(), {
  loading: 'Uploading...',
  success: (data) => `Uploaded ${data.name}`,
  error: (err) => err.message,
})

// ─── Action buttons ───
toast('File deleted', {
  action: { label: 'Undo', onClick: () => restore() },
  cancel: { label: 'Dismiss' },
})

// ─── Undo helper (convenience preset) ───
toast.undo('Break request deleted', {
  onUndo: () => restoreBreak(id),
  duration: 8000,                              // longer for destructive undo
})
// Internally: toast('Break request deleted', { action: { label: 'Undo', ... }, duration: 8000 })

// ─── Upload toast ───
const id = toast.upload({
  files: uploadFiles,                          // UploadFile[]
  onRetry: (fileId) => retryUpload(fileId),
  onRemove: (fileId) => cancelUpload(fileId),
})

// Update upload progress (pass existing id)
toast.upload({
  id,
  files: updatedFiles,
})

// ─── Custom JSX (escape hatch) ───
toast.custom((id) => (
  <div className="flex items-center gap-ds-03">
    <Avatar src={user.avatar} size="sm" />
    <span>{user.name} joined the project</span>
  </div>
))

// ─── Dismiss ───
toast.dismiss(id)                              // specific toast
toast.dismiss()                                // all toasts
```

### Toaster Setup

```tsx
// Mount once at root layout
import { Toaster } from '@devalok/shilp-sutra'

<Toaster
  position="bottom-right"       // default; options: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
  closeButton                   // show close button on all toasts
  pauseWhenPageIsHidden         // pause auto-dismiss when tab is backgrounded
  duration={5000}               // default auto-dismiss (ms)
  hotkey={['altKey', 'KeyT']}   // Alt+T to focus toast region
  visibleToasts={3}             // max visible before stacking
/>
```

### Types

```tsx
interface UploadFile {
  id: string
  name: string
  size: number                                 // bytes
  progress?: number                            // 0-100, undefined = indeterminate
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  previewUrl?: string
}

interface ToastUploadOptions {
  id?: string                                  // pass to update existing upload toast
  files: UploadFile[]
  onRetry?: (fileId: string) => void
  onRemove?: (fileId: string) => void
  onDismissAll?: () => void
}

interface ToastUndoOptions {
  onUndo: () => void
  duration?: number                            // default: 8000
  description?: string
}

interface ToastActionOptions {
  label: string
  onClick: () => void
}
```

### Behavior

| Aspect | Value |
|--------|-------|
| Max visible | 3 (configurable via `visibleToasts`) |
| Default duration | 5000ms |
| Undo duration | 8000ms |
| Upload auto-dismiss | 3000ms after all files terminal |
| Stacking | Sonner depth animation (scale 0.05/index), expand on hover |
| Pause on hover | Timer bar + auto-dismiss freeze |
| Swipe to dismiss | Momentum-based (Sonner built-in) |
| Position | Bottom-right default, 6 positions available |
| Keyboard | Alt+T focuses toast region |
| `prefers-reduced-motion` | Fade only, no slide/stack/scale animations |
| Z-index | `z-toast: 1500` (unchanged) |
| Dark mode | `.dark` class, tokens handle swap |

### Timer Bar

- 2px height, anchored to bottom edge of toast, full width
- Color matches the accent bar (semantic color at 30% opacity)
- Animates width from 100% → 0% over the toast's duration
- Pauses on hover (CSS `animation-play-state: paused`)
- Not shown on: loading toasts, upload toasts (while in progress), custom toasts
- Appears on upload toasts only after all files reach terminal state

## Breaking Changes

| Removed | Replacement |
|---------|-------------|
| `useToast()` hook | Direct `toast()` / `toast.success()` etc. (Sonner manages state) |
| `ToastProvider` | `<Toaster />` (mount once) |
| `ToastViewport` | Handled by Sonner internally |
| `ToastTitle` | `title` option in `toast()` |
| `ToastDescription` | `description` option in `toast()` |
| `ToastAction` | `action: { label, onClick }` option |
| `ToastClose` | `closeButton` prop on `<Toaster />` |
| `color` prop | Type methods: `toast.success()`, `toast.error()`, etc. |
| `UploadProgress` composed component | `toast.upload()` |
| `UploadFile` type from composed/ | Re-exported from toast module |

### Migration Examples

**Before (v1):**
```tsx
const { toast } = useToast()
toast({ title: 'Saved!', color: 'success' })
toast({ title: 'Error', description: 'Failed to save', color: 'error' })
toast({
  title: 'Deleted',
  action: <ToastAction altText="Undo deletion" onClick={restore}>Undo</ToastAction>,
})
```

**After (v2):**
```tsx
toast.success('Saved!')
toast.error('Failed to save')
toast('Deleted', {
  action: { label: 'Undo', onClick: restore },
})
```

## Files Changed

| File | Action |
|------|--------|
| `packages/core/src/ui/toast.tsx` | Rewrite — Sonner wrapper, upload toast, timer bar |
| `packages/core/src/ui/toaster.tsx` | Rewrite — Sonner `<Toaster />` wrapper |
| `packages/core/src/hooks/use-toast.ts` | Delete or re-export `toast` from toast module for back-compat |
| `packages/core/src/composed/upload-progress.tsx` | **Delete** |
| `packages/core/src/composed/upload-progress.stories.tsx` | **Delete** |
| `packages/core/src/composed/upload-progress.test.tsx` | **Delete** (if exists) |
| `packages/core/src/ui/toast.stories.tsx` | Rewrite — all new stories |
| `packages/core/src/ui/toaster.stories.tsx` | Rewrite — interactive demos |
| `packages/core/src/ui/toast.test.tsx` | Rewrite — new API, a11y tests |
| Barrel files (`ui/index.ts`, `composed/index.ts`, `hooks/index.ts`) | Update exports |
| `packages/core/package.json` | Add `sonner` to dependencies |
| `packages/core/vite.config.ts` | Add `sonner` to bundled deps / manual chunks |
| `packages/karm/src/admin/break/*.tsx` | Migrate to new toast API |
| `packages/core/llms.txt` | Update toast section |
| `packages/core/llms-full.txt` | Update toast + remove upload-progress entries |
| `CHANGELOG.md` | Document breaking changes |

## What Stays Unchanged

- `Progress` UI component — general-purpose, still needed elsewhere
- `FileUpload` UI component — handles file picking, not progress tracking
- Z-index token `--z-toast: 1500`
- Semantic color tokens (reused for accent bars, icons, timer bars)
- Dark mode via `.dark` class

## Future Considerations (Not in Scope)

- **Notification center / history** — separate feature, toasts are transient by definition
- **Sound/vibration** — over-engineered for current needs
- **Persistent/pinned toasts** — belongs in Alert/Banner redesign (separate effort)
- **Alert/Banner redesign** — planned as follow-up work using same research-driven approach
