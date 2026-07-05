# Wave 1 — Kill the surviving accent rails · LOCKED SPEC

Approved treatments (from the artifact, v3):
- **Toast** — icon + status-colored timer bar; error gets a *faint* surface tint; rail behind opt-in `showAccent` (**default `false`**).
- **AI blocks (low confidence)** — lightened warning wash (~24% warn-2) + "Low confidence" chip pinned top-right, via one shared `BlockShell`.
- **Schedule event** — soft tint (already there) + leading category **dot**; rail removed.
- **Chat mention** — **@token only**: row loses rail *and* tint; mention carried by the in-content @token. `data-highlight` kept as a styling hook.

Breaking? All **non-breaking** except the chat mention visual (a consumer relying on the row tint loses it — behavior change, patch-note it). Toast `showAccent` is additive. One changeset, `patch`.

---

## 1. Toast + Toaster  (`ui/toast.tsx`, `ui/toast-types.ts`)

**Add** `showAccent?: boolean` (default `false`) to `ToastOptions` and `ToastUploadOptions` (`toast-types.ts`).

**`ToastContent`** — add `showAccent = false` prop; gate the existing accent bar on it:
```tsx
// before (toast.tsx:191-196) — always renders when typed
{config.accentClass && (
  <div className={cn('w-1 shrink-0 rounded-l-overlay-sm', config.accentClass)} />
)}
// after — only when explicitly opted in
{showAccent && config.accentClass && (
  <div className={cn('w-1 shrink-0 rounded-l-overlay-sm', config.accentClass)} />
)}
```
Add the faint **error-only** surface tint to the panel wrapper (toast.tsx:184) — **wash = `bg-error-2`** (locked decision A: reuse the DS "Subtle background" step, no mix/no new token):
```tsx
className={cn(
  'group relative flex w-full overflow-hidden rounded-overlay-sm bg-surface-overlay shadow-floating',
  type === 'error' && 'bg-error-2',
)}
```

**`createTypedToast`** — thread `showAccent`:
```tsx
<ToastContent ... showAccent={options?.showAccent} />
```
**`UploadToastContent`** — same gate on its bar (toast.tsx:532-533); add `showAccent` prop, default false.

**Tests** (`ui/toast.test.tsx`):
- :53 "renders an error toast with accent bar and icon" → split: default renders **no** bar (assert absence) + icon present; add new case `showAccent: true` renders the bar.
- :94/:106 plain message (no bar) — still valid.

**Docs**: `docs/components/ui/toast.md` + `toaster.md` + `llms-full.txt:4651` — change "colored left accent bar per type" → "typed status icon + status-colored timer bar; optional `showAccent` bar". Keep the CHANGELOG history lines (4588/4651) but add a new note: rail now opt-in.

---

## 2. AI blocks — new `BlockShell` + 5 call sites

**New file** `ai/blocks/block-shell.tsx`:
```tsx
'use client'
import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { Icon } from '../../ui/icon'
import { IconAlertTriangle } from '@tabler/icons-react'
import type { BlockConfidence } from '../types'

export function BlockShell({
  confidence, className, children,
}: { confidence?: BlockConfidence; className?: string; children: React.ReactNode }) {
  const low = confidence === 'low'
  return (
    <div
      data-confidence={confidence}
      className={cn(
        low && 'relative rounded-surface p-ds-04 pt-ds-07 bg-warning-2',  // wash = status-2 (locked decision A)
        className,
      )}
    >
      {low && (
        <span className="absolute right-ds-03 top-ds-03 inline-flex items-center gap-1
          rounded-pill bg-warning-3 px-ds-02 py-px text-ds-xs font-semibold text-warning-11">
          <Icon icon={IconAlertTriangle} size="xs" aria-hidden />
          Low confidence
        </span>
      )}
      {children}
    </div>
  )
}
```
> `pt-ds-07` reserves clearance so the top-right chip never overlaps content (robust for prose/table blocks). Wash = `bg-warning-2` (locked decision A — the DS "Subtle background" step, no arbitrary class, no TW4-scanner risk).

**Replace the outer `<div className={cn(..., confidence === 'low' && 'border-l-2 border-warning-7 pl-3')}>` in all 5:**
- `confirm.tsx:28-32` → `<BlockShell confidence={confidence}>` (no extra class)
- `text.tsx:15-24` → `<BlockShell confidence={confidence} className={cn('prose prose-sm', ...)}>` (keep prose classes)
- `error.tsx:16-20` → `<BlockShell confidence={confidence}>`
- `success.tsx:57-61` → `<BlockShell confidence={confidence}>`
- `block-table.tsx:96-101` → `<BlockShell confidence={confidence} className="overflow-x-auto">`

**Tests** — rewrite the rail assertions to the new treatment:
- `ai/__tests__/blocks/confirm.test.tsx:102-111`, `error.test.tsx:66`, `text.test.tsx:37-47`, `ai-components.test.tsx:131/139`: replace `toContain('border-l-2')` / `border-warning-7` with `data-confidence="low"` + presence of the "Low confidence" chip; `not.toContain` cases → assert no chip / `data-confidence` != low.

---

## 3. Schedule event  (`composed/schedule-view.tsx`)

Remove the rail; add a category dot. eventColorMap currently `bg-{c}-2/3 border-{c}-7 text-{c}-11` — drop the now-dead `border-{c}-7`, add a dot color map.
```tsx
// add near eventColorMap
const eventDotMap: Record<EventColor, string> = {
  primary: 'bg-accent-9', success: 'bg-success-9', warning: 'bg-warning-9',
  error: 'bg-error-9', info: 'bg-info-9',
}
```
Event button (schedule-view.tsx:220-233):
```tsx
// before
'absolute left-ds-01 right-ds-01 rounded-control-inner border-l-[3px] px-ds-02 py-ds-01',
...
<span className="line-clamp-2">{event.title}</span>
// after — no border-l-[3px]; dot precedes title
'absolute left-ds-01 right-ds-01 rounded-control-inner px-ds-02 py-ds-01',
...
<span className="flex items-start gap-ds-02">
  <span className={cn('mt-[3px] h-ds-01 w-ds-01 shrink-0 rounded-pill', eventDotMap[event.color ?? 'primary'])} aria-hidden />
  <span className="line-clamp-2">{event.title}</span>
</span>
```
(eventColorMap values become `bg-{c}-2/3 text-{c}-11` — border color removed.)

**Tests**: `composed/schedule-view.test.tsx` — if it asserts `border-l-[3px]`/`border-*-7`, swap to asserting the dot (`rounded-pill` + color class) is present.

---

## 4. Chat mention  (`ui/chat/message.tsx`)

**flat variant (:130)** — remove rail + tint + pl:
```tsx
// before
highlight === 'mention' && 'border-l-2 border-l-accent-9 bg-accent-2 pl-ds-03 rounded-control-inner',
// after — nothing on the row (mention carried by the in-content @token)
// (line removed)
```
**bubble variant (:98)** — remove tint for consistency:
```tsx
// before
highlight === 'mention' && 'bg-accent-2 pl-ds-03 rounded-control-inner',
// after — (line removed)
```
Add `data-highlight={highlight}` to both roots so consumers keep a styling hook and the prop still has a DOM effect.
Leave `highlight === 'internal'` (`bg-warning-2/50`) untouched — it's a subtle wash, not a rail, out of scope.

> Verify during build: the mention extension renders an accent-styled inline @token (it's now the sole mention signal). If the inline token isn't clearly accent, strengthen it (`text-accent-11 font-medium`).

**Tests**: `ui/chat/message.test.tsx:99` `toHaveClass('border-l-accent-9')` → assert the mention row has **no** rail/tint and carries `data-highlight="mention"`.

---

## Verification (all four)
`pnpm typecheck` → `pnpm test` (toast, ai blocks, schedule-view, chat message) → `pnpm build` (catches TW4-scanner issues on the wash/color-mix) → Storybook spot-check + Chromatic for the visual diff. One changeset `patch`: "Removed residual accent-rail tell from toast, AI blocks, schedule-view, and chat mention (extends the v0.44.0 Card decision); toast rail now opt-in via `showAccent`."

## Open flags — RESOLVED
1. Wash = **`bg-{status}-2`** (locked decision A: reuse the DS "Subtle background" step; no new token, no `color-mix`, no TW4-scanner risk). Toast error → `bg-error-2`; block low-confidence → `bg-warning-2`.
2. All four treatments approved via the artifact (v3). Ready to build.
