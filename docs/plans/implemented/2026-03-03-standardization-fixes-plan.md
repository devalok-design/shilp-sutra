# Standardization Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> Use superpowers:code-reviewer after completing each sprint to verify work.

**Goal:** Fix all ~232 violations found in the 2026-03-03 full standardization audit, bringing the design system from 6.9/10 to 9.0+/10 overall compliance.

**Architecture:** Six sprints of increasing scope — runtime bugs first, then structural fixes, token gaps, spacing standardization, deep refactors, and cleanup. Each sprint is independently committable and verifiable.

**Tech Stack:** React 18, TypeScript 5.7, Tailwind 3.4, CVA, Vitest, pnpm

**Audit Reference:** `docs/audit/2026-03-03-full-standardization-audit.md`

---

## Sprint 1: Critical Runtime Fixes

> 5 tasks — fixes classes that are silently broken at runtime

### Task 1.1: Fix FileUpload malformed token names

**Files:**
- Modify: `src/ui/file-upload.tsx`
- Test: `pnpm typecheck && pnpm build`

**Step 1: Fix all 7 malformed token class names**

Find and replace in `src/ui/file-upload.tsx`:

| Find | Replace |
|------|---------|
| `gap-ds-2` | `gap-ds-02` |
| `px-ds-3` | `px-ds-03` |
| `py-ds-2` | `py-ds-02` |
| `mt-ds-2` | `mt-ds-02` |
| `gap-ds-3` | `gap-ds-03` |
| `p-ds-8` | `p-ds-08` |

**Step 2: Verify no other malformed tokens exist**

Run: `grep -rn "ds-[0-9][^0-9b]" src/ --include="*.tsx" | grep -v node_modules | grep -v ".stories." | grep -v ".test."`

Expected: Zero results after fix.

**Step 3: Build to verify classes resolve**

Run: `pnpm build`
Expected: PASS

**Step 4: Commit**

```
fix(ui): correct malformed spacing token names in FileUpload

gap-ds-2 → gap-ds-02, px-ds-3 → px-ds-03, etc. These single-digit
token names produced no CSS output, causing silent layout breakage.
```

---

### Task 1.2: Fix BreakAdmin non-functional text class

**Files:**
- Modify: `src/karm/admin/break/break-admin.tsx`

**Step 1: Replace invalid class**

In `src/karm/admin/break/break-admin.tsx`, find:
```
text-var(--color-text-primary)
```
Replace with:
```
text-text-primary
```

**Step 2: Commit**

```
fix(karm): replace non-functional text-var() class in BreakAdmin

text-var(--color-text-primary) is not a valid Tailwind class.
Active tab text color was silently not applied.
```

---

### Task 1.3: Fix DashboardHeader and Calendar invalid utility classes

**Files:**
- Modify: `src/karm/admin/dashboard/dashboard-header.tsx`
- Modify: `src/karm/admin/dashboard/calendar.tsx`

**Step 1: Fix dashboard-header.tsx**

In `src/karm/admin/dashboard/dashboard-header.tsx`:

Find all occurrences of `flex-direction-row` and remove them (Tailwind `flex` already defaults to row).
Find `justify-flex-start` and replace with `justify-start`.

**Step 2: Fix calendar.tsx**

In `src/karm/admin/dashboard/calendar.tsx`, find:
```
flex-direction-row justify-flex-start
```
Remove `flex-direction-row` and replace `justify-flex-start` with `justify-start`. Since the element already has `flex`, the default direction is row.

**Step 3: Commit**

```
fix(karm): replace invalid Tailwind utilities in dashboard

flex-direction-row → removed (flex defaults to row)
justify-flex-start → justify-start
These classes produced no CSS output.
```

---

### Task 1.4: Fix Badge primitive color token violations

**Files:**
- Modify: `src/ui/badge.tsx`

**Step 1: Replace primitive color references with semantic tokens**

In `src/ui/badge.tsx`, find the `brand` variant:
```
border-[var(--pink-200)]
```
Replace with:
```
border-interactive
```

Find the `accent` variant:
```
border-[var(--purple-200)]
```
Replace with:
```
border-accent
```

Also in the accent variant, find:
```
text-[var(--color-accent)]
```
Replace with:
```
text-accent
```

**Step 2: Verify dark mode**

Check in Storybook that both `brand` and `accent` badge variants render correctly in both light and dark modes.

**Step 3: Commit**

```
fix(ui): replace primitive color tokens in Badge with semantic tokens

border-[var(--pink-200)] → border-interactive
border-[var(--purple-200)] → border-accent
These raw primitive references don't adapt to dark mode.
```

---

### Task 1.5: Fix typography migration guide reference

**Files:**
- Modify: `src/tokens/typography-semantic.css`

**Step 1: Remove the non-existent mapping from the migration comment**

In `src/tokens/typography-semantic.css`, find:
```
     B2-Semibold → body-md-semibold
```
Replace with:
```
     B2-Semibold → body-md (use font-semibold utility)
```

**Step 2: Commit**

```
docs(tokens): correct typography migration guide comment

body-md-semibold variant was never implemented. Updated migration
guide to point to body-md with font-semibold utility instead.
```

---

## Sprint 2: Structural Compliance

> 5 tasks — forwardRef, props spread, opacity consistency, legacy tokens

### Task 2.1: Fix opacity-40 → opacity-[0.38] in 7 files

**Files:**
- Modify: `src/ui/data-table.tsx`
- Modify: `src/ui/tree-view/tree-item.tsx`
- Modify: `src/shared/date-picker/calendar-grid.tsx`
- Modify: `src/shared/date-picker/month-picker.tsx`
- Modify: `src/shared/date-picker/year-picker.tsx`
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx`

**Step 1: Replace all opacity-40 with opacity-[0.38]**

In each file, find `opacity-40` and replace with `opacity-[0.38]`.

Note: Do NOT replace `opacity-0` or `opacity-100` — those are valid boolean toggles. Only replace `opacity-40`.

**Step 2: Verify no remaining opacity-40 in components**

Run: `grep -rn "opacity-40" src/ --include="*.tsx" | grep -v ".stories." | grep -v ".test." | grep -v node_modules`

Expected: Zero results.

**Step 3: Commit**

```
fix(a11y): standardize disabled opacity to WCAG-compliant 0.38

Replaced opacity-40 (0.40) with opacity-[0.38] across 7 files
for consistency with the rest of the system's WCAG AA convention.
```

---

### Task 2.2: Replace legacy CSS var and hardcoded font

**Files:**
- Modify: `src/karm/admin/break/breaks.tsx`
- Modify: `src/karm/admin/break/leave-request.tsx`

**Step 1: Fix breaks.tsx legacy token**

In `src/karm/admin/break/breaks.tsx`, find:
```
bg-[var(--mapped-borders-margin-tertiary)]
```
Replace with:
```
bg-layer-02
```

Also find:
```
text-[--color-text-primary]
```
Replace with:
```
text-text-primary
```

**Step 2: Fix leave-request.tsx hardcoded font**

In `src/karm/admin/break/leave-request.tsx`, find:
```
placeholder:font-["Bricolage_Grotesque"]
```
Replace with:
```
placeholder:font-accent
```

**Step 3: Commit**

```
fix(karm): replace legacy token and hardcoded font family

breaks.tsx: --mapped-borders-margin-tertiary → bg-layer-02
leave-request.tsx: font-["Bricolage_Grotesque"] → font-accent
```

---

### Task 2.3: Add forwardRef to ui/ components (3 files)

**Files:**
- Modify: `src/ui/render-adjustment-type.tsx`
- Modify: `src/ui/visually-hidden.tsx`
- Modify: `src/ui/skeleton.tsx`

**Step 1: Fix VisuallyHidden**

Rewrite `src/ui/visually-hidden.tsx` to use `forwardRef`, `sr-only` utility, `displayName`, named export, and exported props interface. The component should be:

```tsx
import * as React from 'react'

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, ...props }, ref) => (
    <span ref={ref} className="sr-only" {...props}>
      {children}
    </span>
  ),
)
VisuallyHidden.displayName = 'VisuallyHidden'

export { VisuallyHidden }
```

**Step 2: Fix Skeleton**

Wrap `Skeleton` in `React.forwardRef`. Keep existing CVA variants. Spread `...props`.

**Step 3: Fix RenderAdjustmentType**

This is a utility function, not a component. Move it to `src/ui/utils/` or add forwardRef if it renders JSX. Evaluate whether it belongs in `src/ui/` at all. If it's a pure render utility, convert to a proper component or relocate.

**Step 4: Run tests**

Run: `pnpm test -- --run`
Expected: All existing tests pass.

**Step 5: Commit**

```
refactor(ui): add forwardRef to VisuallyHidden, Skeleton, RenderAdjustmentType

Per CONTRIBUTING.md checklist, all components must use React.forwardRef.
VisuallyHidden rewritten to use sr-only utility.
```

---

### Task 2.4: Add forwardRef to shared/ components (5 files)

**Files:**
- Modify: `src/shared/command-palette.tsx`
- Modify: `src/shared/date-picker/date-picker.tsx`
- Modify: `src/shared/date-picker/date-range-picker.tsx`
- Modify: `src/shared/date-picker/date-time-picker.tsx`
- Modify: `src/shared/date-picker/time-picker.tsx`

**Step 1: Wrap each component in React.forwardRef**

For each file, change the pattern from:
```tsx
export default function ComponentName({ ... }: Props) {
```
To:
```tsx
const ComponentName = React.forwardRef<HTMLDivElement, Props>(
  ({ ... }, ref) => {
```

Attach `ref` to the outermost DOM element. Keep `displayName`. Ensure `...props` spread.

**Step 2: Run tests**

Run: `pnpm test -- --run`
Expected: All existing tests pass.

**Step 3: Commit**

```
refactor(shared): add forwardRef to CommandPalette and date-picker components
```

---

### Task 2.5: Add forwardRef to karm/ and layout/ components (9 files)

**Files:**
- Modify: `src/karm/board/task-card.tsx`
- Modify: `src/karm/chat/chat-panel.tsx`
- Modify: `src/karm/tasks/task-detail-panel.tsx`
- Modify: `src/karm/admin/break/delete-break.tsx`
- Modify: `src/karm/admin/break/edit-break-balance.tsx`
- Modify: `src/karm/admin/break/edit-break.tsx`
- Modify: `src/karm/admin/break/leave-request.tsx`
- Modify: `src/layout/notification-preferences.tsx`
- Modify: `src/layout/app-command-palette.tsx`

**Step 1: Apply forwardRef pattern to each**

Same pattern as Task 2.4. Wrap each in `React.forwardRef`, attach ref to outermost DOM element, ensure `displayName` and `...props` spread.

**Step 2: Run tests**

Run: `pnpm test -- --run`

**Step 3: Commit**

```
refactor(karm,layout): add forwardRef to 9 components per checklist
```

---

## Sprint 3: Token System Gaps

> 6 tasks — fill gaps in the token architecture

### Task 3.1: Add missing tokens to Tailwind preset

**Files:**
- Modify: `src/tailwind/preset.ts`

**Step 1: Add `ds-none` to borderRadius**

In the `borderRadius` section, add at the beginning:
```typescript
'ds-none': '0',
```

**Step 2: Add `focus-inset` to colors**

After the `focus` entry (line 151), add:
```typescript
'focus-inset': 'var(--color-focus-inset)',
```

**Step 3: Add chart tokens to colors**

After `'error-hover'` (line 210), add:
```typescript
'chart-1': 'var(--chart-1)',
'chart-2': 'var(--chart-2)',
'chart-3': 'var(--chart-3)',
'chart-4': 'var(--chart-4)',
'chart-5': 'var(--chart-5)',
'chart-6': 'var(--chart-6)',
'chart-7': 'var(--chart-7)',
'chart-8': 'var(--chart-8)',
```

**Step 4: Add minWidth scale**

After the `maxWidth` section (line 107), add:
```typescript
minWidth: {
  'ds-xs': 'var(--size-xs)',
  'ds-sm': 'var(--size-sm)',
  'ds-md': 'var(--size-md)',
  'ds-lg': 'var(--size-lg)',
  'ds-xl': 'var(--size-xl)',
},
```

**Step 5: Build to verify**

Run: `pnpm build`
Expected: PASS

**Step 6: Commit**

```
feat(tokens): expose chart colors, focus-inset, borderRadius none, minWidth in preset

Fills gaps between semantic.css definitions and Tailwind utility layer.
```

---

### Task 3.2: Decide and implement h-9 (36px) sizing strategy

**Files:**
- Modify: `src/tokens/semantic.css` (if adding token)
- Modify: `src/tailwind/preset.ts` (if adding token)
- Modify: ~15 component files (if normalizing)

**Decision required:** Add `--size-sm-plus: 36px` token OR normalize all `h-9` to `h-ds-sm` (32px).

**Option A — Add token (recommended if 36px is intentional):**

In `src/tokens/semantic.css`, after `--size-sm`:
```css
--size-sm-plus:               36px;
```

In `src/tailwind/preset.ts`, add to `width`, `height`, `minHeight`:
```typescript
'ds-sm-plus': 'var(--size-sm-plus)',
```

Then replace all `h-9 w-9` → `h-ds-sm-plus w-ds-sm-plus` and `h-9` → `h-ds-sm-plus` across:
- `src/ui/input-otp.tsx`
- `src/ui/pagination.tsx`
- `src/ui/menubar.tsx`
- `src/ui/navigation-menu.tsx`
- `src/ui/breadcrumb.tsx`
- `src/shared/date-picker/date-picker.tsx`
- `src/shared/date-picker/date-range-picker.tsx`
- `src/shared/date-picker/date-time-picker.tsx`
- `src/shared/date-picker/time-picker.tsx`
- `src/shared/date-picker/month-picker.tsx`
- `src/shared/date-picker/year-picker.tsx`
- `src/layout/sidebar.tsx`
- `src/layout/top-bar.tsx`
- `src/layout/notification-center.tsx`
- `src/karm/custom-buttons/segmented-control.tsx`
- `src/karm/tasks/files-tab.tsx`

**Option B — Normalize to 32px:**

Replace all `h-9` → `h-ds-sm` and `w-9` → `w-ds-sm`.

**Step: Commit**

```
feat(tokens): add --size-sm-plus (36px) sizing token

Fills the gap between h-ds-sm (32px) and h-ds-md (40px).
Migrates 15+ components from raw h-9 to h-ds-sm-plus.
```

---

### Task 3.3: Decide and implement h-7 (28px) sizing strategy

**Files:** Similar to 3.2 but for 28px.

**Decision required:** Add `--size-xs-plus: 28px` token OR normalize all `h-7` to `h-ds-sm` (32px).

Affected files (~10):
- `src/ui/sidebar.tsx`
- `src/ui/data-table.tsx`
- `src/shared/rich-text-editor.tsx`
- `src/shared/date-picker/calendar-grid.tsx`
- `src/shared/page-skeletons.tsx`
- `src/karm/chat/conversation-list.tsx`
- `src/karm/chat/message-list.tsx`
- `src/karm/board/board-column.tsx`

**Commit:**

```
feat(tokens): add --size-xs-plus (28px) sizing token

Fills the gap between h-ds-xs (24px) and h-ds-sm (32px).
```

---

### Task 3.4: Replace z-10/z-20 with semantic z-index tokens

**Files:**
- Modify: `src/ui/data-table.tsx` (2 instances)
- Modify: `src/ui/navigation-menu.tsx` (1 instance + `z-[1]`)
- Modify: `src/ui/input-otp.tsx` (1 instance)
- Modify: `src/ui/sidebar.tsx` (2 instances: `z-10`, `z-20`)
- Modify: `src/karm/tasks/activity-tab.tsx` (1 instance)
- Modify: `src/karm/tasks/task-detail-panel.tsx` (1 instance)
- Modify: `src/karm/admin/dashboard/calendar.tsx` (1 instance)
- Modify: `src/karm/admin/break/break-admin.tsx` (`z-[1]`)
- Modify: `src/karm/admin/break/edit-break.tsx` (`z-[4]`)
- Modify: `src/karm/admin/break/break-admin-skeleton.tsx` (`z-[1]`)

**Step 1: Replace all**

| Find | Replace | Context |
|------|---------|---------|
| `z-10` | `z-raised` | General raised elements |
| `z-20` | `z-raised` | Sidebar rail (same semantic level) |
| `z-[1]` | `z-base` | Low-level stacking |
| `z-[4]` | `z-raised` | Dropdown-like elements |

**Step 2: Verify no raw z-index remains**

Run: `grep -rn "z-[0-9]" src/ --include="*.tsx" | grep -v ".stories." | grep -v ".test." | grep -v "z-base\|z-raised\|z-dropdown\|z-sticky\|z-overlay\|z-modal\|z-toast\|z-tooltip\|zIndex"`

**Step 3: Commit**

```
refactor: replace raw z-index values with semantic tokens

z-10 → z-raised, z-20 → z-raised, z-[1] → z-base, z-[4] → z-raised
across 10 component files.
```

---

### Task 3.5: Replace rounded-full → rounded-ds-full (12 instances)

**Files:**
- Modify: `src/ui/combobox.tsx`
- Modify: `src/ui/icon-button.tsx`
- Modify: `src/ui/skeleton.tsx`
- Modify: `src/ui/file-upload.tsx` (2)
- Modify: `src/ui/charts/line-chart.tsx`
- Modify: `src/ui/charts/area-chart.tsx`
- Modify: `src/ui/charts/radar-chart.tsx`
- Modify: `src/karm/admin/dashboard/break-request.tsx` (3)
- Modify: `src/karm/admin/dashboard/render-date.tsx` (2)

**Step 1: Find and replace**

In each file, replace `rounded-full` with `rounded-ds-full`.

Note: `rounded-full` and `rounded-ds-full` both resolve to `9999px`, so this is a naming consistency fix with no visual change.

**Step 2: Also replace `rounded-none` → `rounded-ds-none` in 6 instances**

Files: `calendar-grid.tsx`, `approved-adjustments.tsx`, `break-admin.tsx`, `admin-dashboard.tsx`, `render-date.tsx` (2)

**Step 3: Commit**

```
refactor: standardize border-radius to ds-* token names

rounded-full → rounded-ds-full (12 instances)
rounded-none → rounded-ds-none (6 instances)
```

---

### Task 3.6: Replace h-8 w-8 → h-ds-sm w-ds-sm where 32px is exact match

**Files:** ~15 components where `h-8` (32px) maps exactly to `h-ds-sm`.

Key files:
- `src/ui/data-table.tsx` (pagination buttons)
- `src/ui/data-table-toolbar.tsx`
- `src/ui/number-input.tsx`
- `src/shared/empty-state.tsx`
- `src/shared/error-boundary.tsx`
- `src/layout/bottom-navbar.tsx`
- `src/layout/notification-preferences.tsx`
- `src/karm/chat/chat-input.tsx`
- `src/karm/chat/chat-panel.tsx`
- `src/karm/client/client-portal-header.tsx`
- `src/karm/admin/dashboard/correction-list.tsx`

**Step 1: Replace `h-8 w-8` → `h-ds-sm w-ds-sm`**

Also replace standalone `h-8` → `h-ds-sm` where used for interactive element heights.

**Step 2: Commit**

```
refactor: replace raw h-8/w-8 with h-ds-sm/w-ds-sm token (32px)
```

---

## Sprint 4: Spacing Standardization

> 3 tasks — the largest mechanical cleanup

### Task 4.1: Replace raw half-step spacing (78 instances)

**Files:** ~25 component files across all modules

**Mapping table (use for all replacements):**

| Raw | Pixels | Token Replacement | Notes |
|-----|--------|-------------------|-------|
| `0.5` | 2px | `ds-01` | `p-0.5` → `p-ds-01`, `mt-0.5` → `mt-ds-01`, etc. |
| `1.5` | 6px | `ds-02b` | `top-1.5` → `top-ds-02b` |
| `2.5` | 10px | `ds-03` | `px-2.5` → `px-ds-03`, `gap-2.5` → `gap-ds-03` (8px is close enough) |
| `3.5` | 14px | `ds-04` | `py-3.5` → `py-ds-04` (12px) — accept 2px visual shift |

**Step 1: Batch replace using the mapping above**

Process files module by module. The worst files (by count):
1. `src/karm/tasks/task-properties.tsx` — 10 instances
2. `src/ui/sidebar.tsx` — 8 instances
3. `src/shared/loading-skeleton.tsx` — 4 instances
4. `src/shared/page-skeletons.tsx` — 3 instances
5. `src/shared/command-palette.tsx` — 4 instances

**Step 2: Verify zero raw half-steps remain**

Run: `grep -rn "\-[0-9]\+\.5" src/ --include="*.tsx" | grep -v ".stories." | grep -v ".test." | grep -v node_modules | grep -v "opacity\|scale\|translate\|rotate"`

Expected: Zero results (excluding opacity/transform values).

**Step 3: Run full test suite**

Run: `pnpm test -- --run`

**Step 4: Commit**

```
refactor: replace 78 raw half-step spacing values with ds-* tokens

0.5 → ds-01, 1.5 → ds-02b, 2.5 → ds-03, 3.5 → ds-04
Standardizes spacing across all 4 modules.
```

---

### Task 4.2: Replace p-[10px] and other arbitrary spacing

**Files:**
- Modify: `src/karm/admin/adjustments/approved-adjustments.tsx` (12 instances of `p-[10px]`)
- Modify: `src/karm/admin/break/break-balance.tsx` (`py-[10px]`)
- Modify: `src/karm/admin/break/break-admin-skeleton.tsx` (`py-[10px]`)

**Step 1: Replace `p-[10px]` → `p-ds-03`**

`p-ds-03` = 8px, which is the closest standard token. The 2px visual difference is acceptable.

**Step 2: Commit**

```
refactor(karm): replace arbitrary p-[10px] with p-ds-03 token
```

---

### Task 4.3: Replace raw Tailwind sizing with ds-* equivalents

**Files:** Various — where exact token equivalents exist

**Mapping for exact matches only:**

| Raw | Pixels | Token |
|-----|--------|-------|
| `h-6 w-6` | 24px | `h-ico-lg w-ico-lg` (icon context) or `h-ds-xs w-ds-xs` (container) |
| `h-10 w-10` | 40px | `h-ds-md w-ds-md` |
| `h-12 w-12` | 48px | `h-ds-lg w-ds-lg` |
| `h-16` | 64px | `h-ds-xl` (56px) — no exact match, flag as exception |
| `h-3 w-3` | 12px | `h-ico-sm w-ico-sm` (16px) — close match, or define micro-icon token |
| `h-4 w-4` | 16px | `h-ico-sm w-ico-sm` |
| `h-5 w-5` | 20px | `h-ico-md w-ico-md` |

Process file by file:
- `src/shared/empty-state.tsx`: `h-10 w-10` → `h-ds-md w-ds-md`, `h-12 w-12` → `h-ds-lg w-ds-lg`, `h-6 w-6` → `h-ico-lg w-ico-lg`
- `src/shared/error-boundary.tsx`: `h-8 w-8` → `h-ico-xl w-ico-xl`
- `src/karm/admin/break/leave-request.tsx`: `h-10 w-10` → `h-ds-md w-ds-md`
- `src/karm/admin/dashboard/correction-list.tsx`: `h-10 w-10` → `h-ds-md w-ds-md`
- Button icon sizes in `src/ui/button.tsx`: `h-4 w-4` → `h-ico-sm w-ico-sm`, `h-5 w-5` → `h-ico-md w-ico-md`
- And ~20 more files with similar patterns

**Commit:**

```
refactor: replace raw Tailwind sizing with ds-*/ico-* tokens

h-8 w-8 → h-ds-sm w-ds-sm, h-10 w-10 → h-ds-md w-ds-md,
h-6 w-6 → h-ico-lg w-ico-lg, etc. across ~25 files.
```

---

## Sprint 5: karm/admin Deep Refactor

> 5 tasks — the hardest and most impactful sprint

### Task 5.1: Replace arbitrary viewport calc heights

**Files:**
- Modify: `src/karm/admin/dashboard/correction-list.tsx`
- Modify: `src/karm/admin/dashboard/leave-requests.tsx`
- Modify: `src/karm/admin/adjustments/approved-adjustments.tsx`
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx`
- Modify: `src/karm/admin/dashboard/dashboard-skeleton.tsx`

**Strategy:** Replace fragile `max-md:h-[calc(100vh-586px)]` patterns with flexbox-based overflow:

```tsx
// Instead of: max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)]
// Use: max-md:flex-1 max-md:min-h-0 overflow-y-auto
```

This makes the content fill available space naturally instead of computing exact pixel offsets.

**Commit:**

```
refactor(karm): replace viewport calc heights with flex overflow pattern

Removes fragile magic-number pixel calculations (586px, 407.2px, etc.)
in favor of flex-1 + min-h-0 + overflow-y-auto.
```

---

### Task 5.2: Replace arbitrary shadows with tokens

**Files:**
- Modify: `src/karm/admin/dashboard/render-date.tsx` (5 instances)
- Modify: `src/karm/admin/break/edit-break.tsx` (1 instance)
- Modify: `src/karm/admin/dashboard/calendar.tsx` (1 instance)

**Step 1: Replace arbitrary shadow patterns**

Find patterns like:
```
shadow-[0px_4px_4px_0px_var(--color-inset-glow)_inset,0px_0px_4px_0px_var(--color-interactive-hover)_inset]
```

Replace with the closest semantic shadow:
```
shadow-brand
```

Or for inset-glow specific cases, use `ring` utilities:
```
ring-2 ring-inset ring-interactive
```

**Commit:**

```
refactor(karm): replace arbitrary shadow values with token shadows

shadow-[...] → shadow-brand or ring utilities across 3 files.
```

---

### Task 5.3: Fix Stack gap prop to enforce token values

**Files:**
- Modify: `src/ui/stack.tsx`

**Step 1: Type the gap prop to only accept ds-* values**

```tsx
type SpacingToken = 'ds-01' | 'ds-02' | 'ds-02b' | 'ds-03' | 'ds-04' | 'ds-05' | 'ds-05b' | 'ds-06' | 'ds-07' | 'ds-08' | 'ds-09' | 'ds-10' | 'ds-11' | 'ds-12' | 'ds-13'

interface StackProps {
  gap?: SpacingToken
  // ... existing props
}
```

Update the className construction:
```tsx
gap && `gap-${gap}`
```

This ensures only token values can be passed.

**Step 2: Update any consumers passing raw values**

Search: `grep -rn "<Stack.*gap=" src/ --include="*.tsx"`

**Commit:**

```
refactor(ui): enforce ds-* spacing tokens in Stack gap prop
```

---

### Task 5.4: Fix cn() usage and window.confirm()

**Files:**
- Modify: `src/karm/dashboard/daily-brief.tsx`
- Modify: `src/karm/tasks/task-properties.tsx`

**Step 1: Fix DailyBrief className**

Replace `${className || ''}` pattern with `cn()`:
```tsx
className={cn('existing-classes', className)}
```

**Step 2: Replace window.confirm() with onConfirm callback prop**

In `task-properties.tsx`, replace `window.confirm()` with a prop:
```tsx
interface TaskPropertiesProps {
  onConfirmDelete?: () => Promise<boolean>
  // ... existing props
}
```

Or use the existing Dialog component for an inline confirmation.

**Commit:**

```
refactor(karm): fix cn() usage and remove window.confirm() anti-pattern
```

---

### Task 5.5: Fix remaining karm/admin arbitrary values

**Files:** All remaining karm/admin files with arbitrary pixel widths/heights

**Strategy:** For arbitrary dimensions that have no token equivalent:
- `w-[300px]` (board column width) → CSS custom property `--board-column-width`
- `w-[440px]` (dialog width) → `sm:max-w-layout-body` or standard dialog sizing
- `w-[335px]`, `w-[308px]` (dialog widths) → standard dialog sizing
- `min-w-[800px]` (table min-width) → keep as documented exception or add layout token
- Percentage widths in `breaks.tsx` → keep but document as table-layout exception

For each arbitrary value, decide:
1. **Has a token equivalent?** → Replace
2. **Needs a new token?** → Add to semantic.css + preset.ts
3. **Intentional one-off?** → Document with a comment `/* intentional: board column width */`

**Commit:**

```
refactor(karm): standardize arbitrary dimensions in admin module
```

---

## Sprint 6: Cleanup

> 5 tasks — documentation and token architecture polish

### Task 6.1: Remove legacy typography.css from import chain

**Files:**
- Modify: `src/tokens/index.css`

**Step 1: Remove the import**

In `src/tokens/index.css`, remove:
```css
@import './typography.css';
```

**Step 2: Verify no component references legacy classes**

Run: `grep -rn "T[0-9]-Reg\|B[0-9]-Reg\|L[0-9] " src/ --include="*.tsx" | grep -v ".test." | grep -v ".stories."`

Expected: Zero results.

**Step 3: Build**

Run: `pnpm build`

**Step 4: Commit**

```
chore(tokens): remove deprecated typography.css from import chain

Legacy T1-Reg/B2-Reg classes are no longer used. All components
use semantic typography tokens from typography-semantic.css.
```

---

### Task 6.2: Clean up redundant dark mode declarations

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Remove redundant non-color tokens from .dark block**

Remove from the `.dark` block:
```css
--max-width: 1280px;
--max-width-body: 960px;
```

These are layout tokens that don't change with dark mode.

**Commit:**

```
chore(tokens): remove redundant layout tokens from .dark block
```

---

### Task 6.3: Fix GaugeChart hex fallback and raw font size

**Files:**
- Modify: `src/ui/charts/gauge-chart.tsx`

**Step 1: Remove hex fallback**

Find:
```
trackColor = 'var(--color-border-subtle, #e2e8f0)'
```
Replace with:
```
trackColor = 'var(--color-border-subtle)'
```

**Step 2: Fix raw font size**

Find `text-2xl` and replace with `text-ds-2xl`.

**Commit:**

```
fix(charts): remove hex fallback and use ds-* font size in GaugeChart
```

---

### Task 6.4: Add missing ...props spread to layout/ components

**Files:**
- Modify: `src/layout/sidebar.tsx`
- Modify: `src/layout/top-bar.tsx`
- Modify: `src/layout/bottom-navbar.tsx`
- Modify: `src/layout/notification-center.tsx`

**Step 1: In each forwardRef callback, add `...props` spread to root element**

Pattern:
```tsx
const Component = React.forwardRef<HTMLElement, Props>(
  ({ namedProp1, namedProp2, className, ...props }, ref) => (
    <div ref={ref} className={cn('classes', className)} {...props}>
```

**Commit:**

```
refactor(layout): add ...props spread to 4 layout components per checklist
```

---

### Task 6.5: Final verification and CHANGELOG update

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Run full test suite**

Run: `pnpm test -- --run`
Expected: All pass.

**Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: Clean.

**Step 3: Run build**

Run: `pnpm build`
Expected: Clean.

**Step 4: Run Storybook build**

Run: `pnpm build-storybook`
Expected: Clean.

**Step 5: Update CHANGELOG**

Add under `## [Unreleased]`:

```markdown
### Fixed
- FileUpload malformed spacing token names causing silent CSS failures
- BreakAdmin non-functional text class
- DashboardHeader/Calendar invalid Tailwind utilities
- Badge primitive color tokens breaking dark mode
- opacity-40 → opacity-[0.38] WCAG standardization (7 files)
- Legacy CSS var in breaks.tsx
- Hardcoded font family in leave-request.tsx
- GaugeChart hex fallback and raw font size

### Changed
- Added forwardRef to 17 components per CONTRIBUTING.md checklist
- Added ...props spread to 4 layout components
- Replaced raw z-index values with semantic tokens (13 instances)
- Replaced rounded-full/rounded-none with ds-* token names (18 instances)
- Replaced raw h-8/w-8 with h-ds-sm/w-ds-sm (15+ instances)
- Replaced 78 raw half-step spacing values with ds-* tokens
- Replaced p-[10px] with p-ds-03 in admin tables
- Replaced viewport calc heights with flex overflow pattern
- Replaced arbitrary shadows with token shadows
- Enforced ds-* token types in Stack gap prop
- Replaced window.confirm() with Dialog in TaskProperties
- Standardized arbitrary dimensions in karm/admin

### Added
- --size-sm-plus (36px) and --size-xs-plus (28px) sizing tokens
- Chart color tokens (chart-1 through chart-8) in Tailwind preset
- focus-inset color token in Tailwind preset
- rounded-ds-none border radius token
- minWidth scale in Tailwind preset

### Removed
- Legacy typography.css from import chain
- Redundant dark mode layout token declarations
```

**Step 6: Commit**

```
docs: update CHANGELOG with standardization audit fixes
```

---

## Verification Checklist

After all 6 sprints, run the superpowers:code-reviewer agent to verify:

- [ ] Zero malformed token names (`grep "ds-[0-9][^0-9b]"`)
- [ ] Zero raw hex colors in components (`grep "#[0-9a-fA-F]"`)
- [ ] Zero `opacity-40` (`grep "opacity-40"`)
- [ ] Zero raw `z-10`/`z-20`/`z-[N]` (`grep "z-[0-9]"`)
- [ ] Zero `rounded-full`/`rounded-none` (`grep "rounded-full\|rounded-none"`)
- [ ] Zero `flex-direction-row` (`grep "flex-direction"`)
- [ ] All exported components have `forwardRef`
- [ ] All exported components have `displayName`
- [ ] `pnpm test -- --run` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] `pnpm build-storybook` passes
