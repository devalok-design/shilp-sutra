# Toast v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Radix-based Toast with a Sonner-powered implementation featuring professional hybrid visuals, promise toasts, upload tracking, timer bars, and stacking animations. Delete UploadProgress composed component.

**Architecture:** Wrap Sonner as the rendering engine, style with our semantic design tokens. Expose our own API (`toast()`, `toast.success()`, `toast.promise()`, `toast.upload()`, `toast.undo()`, `toast.custom()`). Upload tracking is built natively into the toast, not embedded from another component.

**Tech Stack:** React 18, TypeScript 5.7, Sonner, Tailwind 3.4, CVA, Vitest + RTL + vitest-axe, @tabler/icons-react

**Design doc:** `docs/plans/2026-03-13-toast-v2-design.md`

---

### Task 1: Install Sonner and Configure Build

**Files:**
- Modify: `packages/core/package.json` (dependencies section)
- Modify: `packages/core/vite.config.ts:93-113` (manualChunks)

**Step 1: Install sonner**

Run: `cd packages/core && pnpm add sonner`

**Step 2: Add sonner to vendor-client chunk**

In `packages/core/vite.config.ts`, the `manualChunks` function (lines 93-113) routes dependencies to chunks. Add `sonner` to the `vendor-client` chunk (lines 98-108) since it's a client-side library that needs the `"use client"` directive:

```typescript
// Inside the manualChunks function, in the vendor-client condition:
if (
  id.includes('@floating-ui') ||
  id.includes('aria-hidden') ||
  id.includes('react-remove-scroll') ||
  id.includes('sonner') ||  // ADD THIS LINE
  // ... rest of conditions
) {
  return 'vendor-client'
}
```

**Step 3: Verify build**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds, `sonner` appears in `vendor-client` chunk.

**Step 4: Commit**

```bash
git add packages/core/package.json packages/core/pnpm-lock.yaml packages/core/vite.config.ts
git commit -m "feat(toast): install sonner and add to vendor-client chunk"
```

---

### Task 2: Create Toast Types Module

**Files:**
- Create: `packages/core/src/ui/toast-types.ts`

The `UploadFile` type currently lives in `packages/core/src/composed/upload-progress.tsx` (lines 20-33). We'll recreate it in the toast module so it survives the deletion of upload-progress.

**Step 1: Create the types file**

```typescript
// packages/core/src/ui/toast-types.ts

export interface UploadFile {
  id: string
  name: string
  size: number
  progress?: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  previewUrl?: string
}

export interface ToastActionOptions {
  label: string
  onClick: () => void
}

export interface ToastUndoOptions {
  onUndo: () => void
  duration?: number
  description?: string
}

export interface ToastUploadOptions {
  id?: string
  files: UploadFile[]
  onRetry?: (fileId: string) => void
  onRemove?: (fileId: string) => void
  onDismissAll?: () => void
}
```

**Step 2: Commit**

```bash
git add packages/core/src/ui/toast-types.ts
git commit -m "feat(toast): add Toast v2 type definitions"
```

---

### Task 3: Rewrite Toast Component (Sonner Wrapper)

**Files:**
- Rewrite: `packages/core/src/ui/toast.tsx` (currently 160 lines — Radix-based)
- Reference: Design doc visual spec (hybrid professional style)

This is the core rewrite. We wrap Sonner's `toast` function, adding our styling, icons, timer bar, and upload toast.

**Step 1: Write the new toast.tsx**

Key implementation details:
- Import `toast as sonnerToast` from `sonner` and re-export our wrapped version
- Use `sonnerToast.custom()` internally to render our styled toast UI for every type
- Each toast renders: left accent bar (3-4px, semantic color), status icon (16px, @tabler), title, description, action/cancel buttons, close button, timer bar
- `toast.upload()` renders file rows with inline `Progress` component (from `../ui/progress`)
- Timer bar: 2px `div` at bottom, CSS animation `width: 100% → 0%` over `duration`, `animation-play-state: paused` on `.group:hover`
- `toast.undo()` is a convenience wrapper: calls `toast()` with an Undo action button and `duration: 8000`
- `toast.promise()` delegates to `sonnerToast.promise()` with our custom rendering
- `toast.custom()` delegates to `sonnerToast.custom()` directly

Icon mapping (all from `@tabler/icons-react`):
- success: `IconCircleCheck`
- warning: `IconAlertTriangle`
- error: `IconCircleX`
- info: `IconInfoCircle`
- loading: `IconLoader2` (with `animate-spin`)

Accent bar color mapping (Tailwind classes):
- success: `bg-success-border`
- warning: `bg-warning-border`
- error: `bg-error-border`
- info: `bg-info-border`
- loading: `bg-interactive`
- message/plain: no accent bar

Upload toast specifics:
- Header: upload icon + "Uploading X files" + "N of M complete"
- File rows: compact single-line with file icon, truncated name, `<Progress size="sm" />` or status badge
- Per-file actions: retry (on error via `IconRefresh`), remove/cancel (via `IconX`)
- Scrollable if > 3 files (`max-h-[140px] overflow-y-auto`)
- Accent bar: `bg-interactive` while uploading → `bg-success-border` all complete → `bg-error-border` if any failed
- No auto-dismiss while in progress; 3s after all terminal
- Uses `sonnerToast.custom()` with an `id` param for updates

`prefers-reduced-motion`: wrap slide/scale animations in `@media (prefers-reduced-motion: no-preference)`, fall back to simple fade.

**Step 2: Verify typecheck**

Run: `cd packages/core && pnpm typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/core/src/ui/toast.tsx
git commit -m "feat(toast): rewrite toast with Sonner wrapper, upload tracking, timer bar"
```

---

### Task 4: Rewrite Toaster Component

**Files:**
- Rewrite: `packages/core/src/ui/toaster.tsx` (currently 81 lines)

**Step 1: Write the new toaster.tsx**

The Toaster becomes a thin wrapper around Sonner's `<Toaster />`:

```tsx
'use client'

import * as React from 'react'
import { Toaster as SonnerToaster } from 'sonner'
import { cn } from './lib/utils'

export interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  closeButton?: boolean
  pauseWhenPageIsHidden?: boolean
  duration?: number
  hotkey?: string[]
  visibleToasts?: number
  className?: string
}

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  ({
    position = 'bottom-right',
    closeButton = false,
    pauseWhenPageIsHidden = true,
    duration = 5000,
    hotkey = ['altKey', 'KeyT'],
    visibleToasts = 3,
    className,
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn('z-toast', className)}>
        <SonnerToaster
          position={position}
          closeButton={closeButton}
          pauseWhenPageIsHidden={pauseWhenPageIsHidden}
          duration={duration}
          hotkey={hotkey}
          visibleToasts={visibleToasts}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'w-full',
            },
          }}
          {...props}
        />
      </div>
    )
  }
)
Toaster.displayName = 'Toaster'
```

Key: `unstyled: true` tells Sonner to not apply its default styles — we handle all styling in our custom toast render function (Task 3).

**Step 2: Verify typecheck**

Run: `cd packages/core && pnpm typecheck`

**Step 3: Commit**

```bash
git add packages/core/src/ui/toaster.tsx
git commit -m "feat(toast): rewrite Toaster as Sonner wrapper"
```

---

### Task 5: Update use-toast Hook

**Files:**
- Rewrite: `packages/core/src/hooks/use-toast.ts` (currently 189 lines)

The hook becomes a thin re-export. Sonner manages state internally — no more reducer, no more `TOAST_LIMIT`, no more `listeners` array.

**Step 1: Write the simplified hook**

```typescript
'use client'

/**
 * @deprecated Use `toast` directly from `@devalok/shilp-sutra/ui/toast`.
 * This hook is provided for back-compatibility during migration.
 */
export { toast } from '../ui/toast'
export type { UploadFile, ToastActionOptions, ToastUndoOptions, ToastUploadOptions } from '../ui/toast-types'
```

**Step 2: Commit**

```bash
git add packages/core/src/hooks/use-toast.ts
git commit -m "refactor(toast): simplify use-toast to re-export from toast module"
```

---

### Task 6: Update Barrel Exports

**Files:**
- Modify: `packages/core/src/ui/index.ts:105-116` (toast exports)
- Modify: `packages/core/src/composed/index.ts:70-71` (remove upload-progress exports)
- Modify: `packages/core/src/hooks/index.ts:3` (update use-toast exports)

**Step 1: Update UI barrel**

Replace the old compound component exports (lines 105-116) with:

```typescript
export { toast, type ToastProps } from './toast'
export { Toaster, type ToasterProps } from './toaster'
export type { UploadFile, ToastActionOptions, ToastUndoOptions, ToastUploadOptions } from './toast-types'
```

**Step 2: Update composed barrel**

Remove lines 70-71 from `packages/core/src/composed/index.ts`:
```typescript
// DELETE these lines:
export { UploadProgress, formatFileSize } from './upload-progress'
export type { UploadProgressProps, UploadFile } from './upload-progress'
```

**Step 3: Update hooks barrel**

Update line 3 in `packages/core/src/hooks/index.ts`:
```typescript
export { toast } from './use-toast'
export type { UploadFile, ToastActionOptions, ToastUndoOptions, ToastUploadOptions } from './use-toast'
```

**Step 4: Update package.json exports**

In `packages/core/package.json`, add the toast-types entry point:
```json
"./ui/toast-types": {
  "import": "./dist/ui/toast-types.js",
  "types": "./dist/ui/toast-types.d.ts"
}
```

**Step 5: Verify typecheck**

Run: `cd packages/core && pnpm typecheck`

**Step 6: Commit**

```bash
git add packages/core/src/ui/index.ts packages/core/src/composed/index.ts packages/core/src/hooks/index.ts packages/core/package.json
git commit -m "refactor(toast): update barrel exports for Toast v2 API"
```

---

### Task 7: Delete UploadProgress Component

**Files:**
- Delete: `packages/core/src/composed/upload-progress.tsx`
- Delete: `packages/core/src/composed/upload-progress.stories.tsx`

**Step 1: Delete files**

```bash
rm packages/core/src/composed/upload-progress.tsx
rm packages/core/src/composed/upload-progress.stories.tsx
```

**Step 2: Verify build**

Run: `cd packages/core && pnpm typecheck && pnpm build`
Expected: No import errors — barrel was already updated in Task 6.

**Step 3: Commit**

```bash
git add -u packages/core/src/composed/
git commit -m "refactor(toast): delete UploadProgress — upload tracking now lives in toast.upload()"
```

---

### Task 8: Write Tests

**Files:**
- Rewrite: `packages/core/src/ui/toast.test.tsx` (currently 37 lines)

**Step 1: Write comprehensive tests**

Test cases to cover:

```typescript
// 1. Rendering
- 'renders a success toast with title and description'
- 'renders an error toast with correct accent color and icon'
- 'renders a warning toast'
- 'renders an info toast'
- 'renders a plain message toast with no icon and no accent bar'
- 'renders a loading toast with spinner icon'

// 2. Accessibility
- 'toast has role="status" and aria-live="polite"'
- 'action button is keyboard-accessible'
- 'close button has accessible label'
- 'vitest-axe: no a11y violations for each toast type'

// 3. Action buttons
- 'renders action button and fires onClick'
- 'renders cancel button'

// 4. Undo helper
- 'toast.undo() renders with Undo action button'
- 'toast.undo() calls onUndo callback when clicked'

// 5. Timer bar
- 'timer bar is visible on auto-dismissing toasts'
- 'timer bar is NOT visible on loading toasts'

// 6. Upload toast
- 'renders upload toast with file list'
- 'shows progress bar for uploading files'
- 'shows complete status for finished files'
- 'shows error status with retry button'
- 'calls onRetry when retry button clicked'
- 'calls onRemove when remove button clicked'
- 'shows summary header with completion count'

// 7. Toast.promise (integration)
- 'promise toast transitions from loading to success'
- 'promise toast transitions from loading to error'
```

Note: Sonner tests require mounting `<Toaster />` in the test wrapper. Use `act()` and `waitFor()` for async toast transitions. Mock `sonner` internals if needed for unit isolation.

**Step 2: Run tests**

Run: `cd packages/core && pnpm vitest run src/ui/toast.test.tsx`
Expected: ALL PASS

**Step 3: Run a11y tests**

Ensure vitest-axe assertions pass for each toast type.

**Step 4: Commit**

```bash
git add packages/core/src/ui/toast.test.tsx
git commit -m "test(toast): comprehensive tests for Toast v2 — rendering, a11y, actions, upload, promise"
```

---

### Task 9: Write Stories

**Files:**
- Rewrite: `packages/core/src/ui/toast.stories.tsx` (currently 207 lines)
- Rewrite: `packages/core/src/ui/toaster.stories.tsx` (currently 220 lines)

**Step 1: Write toast.stories.tsx**

Stories to create (all interactive via button triggers):

```
1. Default — plain toast (no icon, no accent)
2. Success — toast.success()
3. Error — toast.error()
4. Warning — toast.warning()
5. Info — toast.info()
6. Loading — toast.loading()
7. WithAction — toast with action + cancel buttons
8. UndoPattern — toast.undo() after destructive action
9. PromiseToast — toast.promise() with simulated async
10. UploadSingle — toast.upload() with 1 file progressing
11. UploadMultiple — toast.upload() with 3+ files, mixed statuses
12. UploadWithErrors — toast.upload() showing retry flow
13. CustomJSX — toast.custom() with avatar + message
14. AllTypes — grid showing all toast types side by side
15. TimerBar — demonstrates timer bar animation + pause on hover
16. Stacking — triggers multiple toasts to show stacking animation
```

Each story renders a button that triggers the toast, with `<Toaster />` in the decorator.

**Step 2: Write toaster.stories.tsx**

Stories for Toaster configuration:

```
1. BottomRight — default position
2. TopCenter — alternate position
3. WithCloseButton — closeButton={true}
4. CustomDuration — duration={10000}
5. VisibleToasts — visibleToasts={5}
```

**Step 3: Verify stories render**

Run: `pnpm storybook` and manually verify all stories render correctly.

**Step 4: Commit**

```bash
git add packages/core/src/ui/toast.stories.tsx packages/core/src/ui/toaster.stories.tsx
git commit -m "docs(toast): rewrite Storybook stories for Toast v2"
```

---

### Task 10: Migrate Karm Break Admin

**Files:**
- Modify: `packages/karm/src/admin/break/break-admin.tsx` (lines 32, 276, 336-421)
- Modify: `packages/karm/src/admin/break/delete-break.tsx` (lines 7, 24, 38-50)
- Modify: `packages/karm/src/admin/break/edit-break-balance.tsx` (lines 7, 47, 70-80)
- Modify: `packages/karm/src/admin/break/edit-break.tsx` (lines 7, 103, 193-371)

**Step 1: Migrate each file**

Pattern — replace `useToast` hook with direct `toast` import:

Before:
```tsx
import { useToast } from '@/hooks/use-toast'
// ...
const { toast } = useToast()
toast({ title: 'Error', description: 'Failed to save', color: 'error' })
toast({ description: 'Break request deleted successfully', color: 'neutral' })
```

After:
```tsx
import { toast } from '@/ui/toast'
// ...
// Remove: const { toast } = useToast()
toast.error('Failed to save')
toast.success('Break request deleted successfully')
// For neutral/plain: toast('Some message')
```

Specific migrations per file:

**break-admin.tsx:**
- Line 32: Change import from `useToast` → `toast`
- Line 276: Remove `const { toast } = useToast()`
- Lines 336-351: Approval success → `toast.success('Break request approved')` (simplify JSX description to string)
- Lines 354-361: Approval error → `toast.error(error.message || 'Failed to approve')`
- Lines 396-411: Rejection success → `toast.success('Break request rejected')`
- Lines 414-421: Rejection error → `toast.error(error.message || 'Failed to reject')`

**delete-break.tsx:**
- Line 7: Change import
- Line 24: Remove hook call
- Lines 38-41: → `toast.success('Break request deleted successfully')`
- Lines 46-50: → `toast.error('Failed to delete break request')`

**edit-break-balance.tsx:**
- Line 7: Change import
- Line 47: Remove hook call
- Lines 70-72: → `toast.success('Break balance updated successfully')`
- Lines 76-79: → `toast.error('Failed to update break balance')`

**edit-break.tsx:**
- Line 7: Change import
- Line 103: Remove hook call
- Lines 193-196: → `toast.warning('Status not updated')`
- Lines 216-218: → `toast.success('Break request updated')`
- Lines 222-225: → `toast.error('Failed to update break request')`
- Lines 326-330, 340-344, 367-371: → `toast.error('Date conflict/overlap message')`

**Step 2: Verify Karm typecheck**

Run: `cd packages/karm && pnpm typecheck`

**Step 3: Run Karm tests**

Run: `cd packages/karm && pnpm test`
Note: Break admin test files (`__tests__/break-admin.test.tsx`, `delete-break.test.tsx`, `edit-break-balance.test.tsx`) may need their `useToast` mocks updated to mock `@/ui/toast` instead.

**Step 4: Commit**

```bash
git add packages/karm/src/admin/break/
git commit -m "refactor(karm): migrate break admin to Toast v2 API"
```

---

### Task 11: Update AI Documentation

**Files:**
- Modify: `packages/core/llms.txt` (lines 67, 126-135)
- Modify: `packages/core/llms-full.txt` (lines 1149-1177 toast section, lines 1840-1875 upload-progress section)

**Step 1: Update llms.txt**

Replace the toast section with:

```
## Toast (Sonner-powered)

Setup: Mount `<Toaster />` once at root layout.

toast('Plain message')
toast.success('Saved!')
toast.error('Failed')
toast.warning('Caution')
toast.info('FYI')
toast.loading('Working...')

toast.promise(asyncFn(), { loading: '...', success: '...', error: '...' })
toast.undo('Deleted', { onUndo: () => restore() })
toast.upload({ files, onRetry, onRemove })
toast.custom((id) => <YourJSX />)
toast.dismiss(id?)

Toaster props: position(6 options), closeButton, duration, visibleToasts, hotkey
Default: bottom-right, 5s duration, 3 visible, Alt+T hotkey

DO NOT use useToast() — it is deprecated. Use toast.success() etc. directly.
DO NOT use color prop — use typed methods instead.
```

**Step 2: Update llms-full.txt**

- Replace toast section (lines 1149-1177) with full v2 API reference
- Delete upload-progress section (lines 1840-1875)
- Add toast.upload() documentation with UploadFile type reference

**Step 3: Commit**

```bash
git add packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs(toast): update llms.txt and llms-full.txt for Toast v2"
```

---

### Task 12: Full Verification

**Step 1: Typecheck all packages**

Run: `pnpm typecheck`
Expected: PASS across core, brand, karm

**Step 2: Run all tests**

Run: `pnpm test`
Expected: ALL PASS

**Step 3: Build all packages**

Run: `pnpm build`
Expected: All packages build successfully, sonner bundled into vendor-client chunk

**Step 4: Verify Storybook**

Run: `pnpm storybook`
Manually verify: all toast stories render, stacking works, upload toast progresses, timer bar animates, dark mode works

**Step 5: Final commit if any fixes needed**

```bash
git commit -m "fix(toast): address verification issues"
```

---

## Task Dependency Graph

```
Task 1 (install sonner)
  └→ Task 2 (types)
       └→ Task 3 (toast.tsx rewrite) ←── the big one
            └→ Task 4 (toaster.tsx rewrite)
                 └→ Task 5 (use-toast simplify)
                      └→ Task 6 (barrel exports)
                           ├→ Task 7 (delete upload-progress)
                           ├→ Task 8 (tests)
                           ├→ Task 9 (stories)
                           └→ Task 10 (karm migration)
                                └→ Task 11 (docs)
                                     └→ Task 12 (verification)
```

Tasks 7, 8, 9, 10 can run in parallel after Task 6.
