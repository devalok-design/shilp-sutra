# Design System Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all hardcoded colors, dark mode breakages, code pattern issues, and token adoption gaps identified in the comprehensive code review.

**Architecture:** CSS custom properties flow through 3 tiers (primitives → semantic → Tailwind preset). Components must only reference semantic tokens via Tailwind utility classes. Dark mode works automatically via `.dark` class overriding semantic tokens. No `dark:` prefixes, no primitive token leaks, no hardcoded hex/rgba values in components.

**Tech Stack:** React 18, TypeScript, Tailwind 3.4, CVA, CSS Custom Properties

---

## Phase 0: Token Layer Fixes (define missing tokens, fix broken rendering)

### Task 1: Define missing `--color-layer-accent-subtle` token + add `--color-error-hover`

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Add missing tokens to `:root`**

In `semantic.css` `:root` block, after the existing `--color-layer-03` line, add:

```css
--color-layer-accent-subtle: var(--pink-50);
```

After `--color-error-surface`, add:

```css
--color-error-hover:          var(--red-700);
```

**Step 2: Add dark overrides in `.dark` block**

In the `.dark` block, in the Background & Layers section, add:

```css
--color-layer-accent-subtle: var(--pink-950);
```

In the Status / Feedback section, add:

```css
--color-error-hover:          var(--red-400);
```

**Step 3: Verify build**

Run: `pnpm tsc --noEmit`
Expected: PASS (CSS-only change, no TS impact)

**Step 4: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "fix(tokens): add missing --color-layer-accent-subtle and --color-error-hover tokens"
```

---

## Phase 1: Critical Dark Mode Fixes (hardcoded colors, broken rendering)

### Task 2: Fix hardcoded hex colors in break-admin toast messages

**Files:**
- Modify: `src/karm/admin/break/break-admin.tsx:209,267`

**Step 1: Replace hardcoded hex values**

Line 209: Replace `style={{ color: '#C3F0C2' }}` with `style={{ color: 'var(--color-success-text)' }}`
Line 267: Replace `style={{ color: '#F87179' }}` with `style={{ color: 'var(--color-error-text)' }}`

**Step 2: Commit**

```bash
git add src/karm/admin/break/break-admin.tsx
git commit -m "fix(break-admin): replace hardcoded hex toast colors with semantic tokens"
```

---

### Task 3: Fix hardcoded hex label color in leave-request

**Files:**
- Modify: `src/karm/admin/break/leave-request.tsx:190`

**Step 1: Replace `text-[#8C8084]` with `text-[var(--color-text-helper)]`**

**Step 2: Commit**

```bash
git add src/karm/admin/break/leave-request.tsx
git commit -m "fix(leave-request): replace hardcoded hex label color with semantic token"
```

---

### Task 4: Fix hardcoded hex avatar bg and wrong fallback values in admin dashboard

**Files:**
- Modify: `src/karm/admin/dashboard/leave-requests.tsx:162`
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx:186`
- Modify: `src/karm/admin/dashboard/dashboard-skeleton.tsx:20`
- Modify: `src/karm/admin/dashboard/associate-detail.tsx:117,298`

**Step 1: Fix leave-requests avatar bg**

Line 162: Replace `bg-[#FCF7F7]` with `bg-[var(--color-interactive-subtle)]`

**Step 2: Remove wrong fallback values in admin-dashboard**

Line 186: Replace `border-[var(--color-border-default,#F7E9E9)]` with `border-[var(--color-border-default)]`
Line 186: Replace `shadow-[0px_25px_40px_0px_var(--shadow-01,#E6E4E5)]` with `shadow-[var(--shadow-05)]`

**Step 3: Apply identical fix to dashboard-skeleton**

Line 20: Same replacements as admin-dashboard line 186.

**Step 4: Fix associate-detail**

Line 117: Replace `background: 'var(--color-border-strong, #DD9EB8)'` with `background: 'var(--color-border-strong)'`
Line 298: Replace `border-[var(--color-border-default,#F7E9E9)]` with `border-[var(--color-border-default)]`

**Step 5: Commit**

```bash
git add src/karm/admin/dashboard/leave-requests.tsx src/karm/admin/dashboard/admin-dashboard.tsx src/karm/admin/dashboard/dashboard-skeleton.tsx src/karm/admin/dashboard/associate-detail.tsx
git commit -m "fix(admin-dashboard): remove hardcoded hex fallbacks, use semantic tokens"
```

---

### Task 5: Fix nonexistent token + primitive fallback in edit-break

**Files:**
- Modify: `src/karm/admin/break/edit-break.tsx:590`

**Step 1: Replace `--color-interactive-accent` with `--color-accent`**

Replace `bg-[var(--color-interactive-accent)]` with `bg-[var(--color-accent)]`.
Replace `var(--purple-400,#AB9DED)` with `var(--color-accent-hover)` in the shadow value.

**Step 2: Commit**

```bash
git add src/karm/admin/break/edit-break.tsx
git commit -m "fix(edit-break): replace nonexistent token and primitive fallback with semantic tokens"
```

---

### Task 6: Fix primitive token leaks in button.tsx and chat-input.tsx danger hover

**Files:**
- Modify: `src/ui/button.tsx:18`
- Modify: `src/karm/chat/chat-input.tsx:71`

**Step 1: Fix button.tsx danger variant**

Replace `hover:bg-[var(--red-700)]` with `hover:bg-[var(--color-error-hover)]`

**Step 2: Fix chat-input.tsx stop button**

Replace `hover:bg-[var(--red-700)]` with `hover:bg-[var(--color-error-hover)]`

**Step 3: Commit**

```bash
git add src/ui/button.tsx src/karm/chat/chat-input.tsx
git commit -m "fix(button,chat-input): replace primitive --red-700 hover with semantic --color-error-hover"
```

---

### Task 7: Fix primitive token leaks in board-column accents

**Files:**
- Modify: `src/karm/board/board-column.tsx:40-42`

**Step 1: Replace last 3 primitive entries in COLUMN_ACCENTS**

Replace:
```tsx
'border-l-[var(--blue-300)]',
'border-l-[var(--yellow-300)]',
'border-l-[var(--green-300)]',
```
With:
```tsx
'border-l-[var(--color-info-border)]',
'border-l-[var(--color-warning-border)]',
'border-l-[var(--color-success-border)]',
```

**Step 2: Commit**

```bash
git add src/karm/board/board-column.tsx
git commit -m "fix(board-column): replace primitive color tokens with semantic border tokens"
```

---

### Task 8: Fix primitive tokens in task-properties visibility dot

**Files:**
- Modify: `src/karm/tasks/task-properties.tsx:492-493`

**Step 1: Replace primitives**

Replace `'bg-[var(--green-500)]'` with `'bg-[var(--color-success)]'`
Replace `'bg-[var(--neutral-400)]'` with `'bg-[var(--color-icon-disabled)]'`

**Step 2: Commit**

```bash
git add src/karm/tasks/task-properties.tsx
git commit -m "fix(task-properties): replace primitive tokens with semantic tokens for visibility dot"
```

---

### Task 9: Fix primitive gradient in attendance-cta

**Files:**
- Modify: `src/karm/dashboard/attendance-cta.tsx:167`

**Step 1: Replace primitives in gradient**

Replace:
```
from-[var(--pink-50)] via-[var(--neutral-0)] to-[var(--green-50)]
```
With:
```
from-[var(--color-interactive-subtle)] via-[var(--color-background)] to-[var(--color-success-surface)]
```

**Step 2: Commit**

```bash
git add src/karm/dashboard/attendance-cta.tsx
git commit -m "fix(attendance-cta): replace primitive gradient tokens with semantic tokens"
```

---

### Task 10: Fix bg-black overlays with bg-overlay token

**Files:**
- Modify: `src/layout/bottom-navbar.tsx:127`
- Modify: `src/shared/command-palette.tsx:165`

**Step 1: Fix bottom-navbar**

Replace `bg-black/40` with `bg-overlay`

**Step 2: Fix command-palette**

Replace `bg-black/60` with `bg-overlay`

**Step 3: Commit**

```bash
git add src/layout/bottom-navbar.tsx src/shared/command-palette.tsx
git commit -m "fix(overlay): replace hardcoded bg-black with bg-overlay semantic token"
```

---

### Task 11: Fix hardcoded rgba shadows in custom buttons (3 files)

**Files:**
- Modify: `src/karm/custom-buttons/CustomButton.tsx:46,75-77`
- Modify: `src/karm/custom-buttons/segmented-control.tsx:90,96,116-117`
- Modify: `src/karm/custom-buttons/Toggle.tsx:148-149,254-255`

**Step 1: Fix SVG fill hardcoded hex values**

In `segmented-control.tsx` and `Toggle.tsx`, replace:
- `'[&_svg_path]:fill-[#FCF7F7]'` → `'[&_svg_path]:fill-[var(--color-icon-on-color)]'`
- `'[&_svg_path]:fill-[#6B6164]'` → `'[&_svg_path]:fill-[var(--color-icon-disabled)]'`

**Step 2: Fix ripple bg hardcoded rgba values**

In all three files, replace:
- `'bg-[rgba(252,247,247,0.2)]'` → `'bg-[var(--color-text-on-color)]/20'` (Note: Tailwind syntax — may need `bg-[rgba(var(--color-text-on-color),0.2)]` — test this)
- `'bg-[rgba(140,128,132,0.2)]'` → `'bg-[var(--color-text-secondary)]/20'`

If Tailwind opacity modifier syntax doesn't work with CSS custom properties, use `bg-[color-mix(in_srgb,var(--color-text-on-color)_20%,transparent)]` or keep the rgba but reference the token system via a new `--color-ripple-light` / `--color-ripple-dark` pair in semantic.css.

**Step 3: Commit**

```bash
git add src/karm/custom-buttons/CustomButton.tsx src/karm/custom-buttons/segmented-control.tsx src/karm/custom-buttons/Toggle.tsx
git commit -m "fix(custom-buttons): replace hardcoded hex/rgba with semantic tokens for fills and ripples"
```

---

### Task 12: Fix hardcoded inline boxShadow in break-request (3 occurrences)

**Files:**
- Modify: `src/karm/admin/dashboard/break-request.tsx:147,254,318`

**Step 1: Replace all 3 inline style boxShadow**

Replace the `style={{ boxShadow: '0px 1px 3px ...' }}` with `style={{ boxShadow: 'var(--shadow-02)' }}` at all three locations.

**Step 2: Commit**

```bash
git add src/karm/admin/dashboard/break-request.tsx
git commit -m "fix(break-request): replace hardcoded rgba shadow with shadow token"
```

---

### Task 13: Fix hardcoded rgba shadow in dashboard-header

**Files:**
- Modify: `src/karm/admin/dashboard/dashboard-header.tsx:72`

**Step 1: Replace `shadow-md shadow-[rgba(77,10,28,0.2)]` with `shadow-brand`**

**Step 2: Commit**

```bash
git add src/karm/admin/dashboard/dashboard-header.tsx
git commit -m "fix(dashboard-header): replace hardcoded rgba shadow with shadow-brand token"
```

---

### Task 14: Replace Tailwind default shadows with token shadows

**Files:**
- Modify: `src/shared/command-palette.tsx:170` — `shadow-2xl` → `shadow-05`
- Modify: `src/shared/error-boundary.tsx:111` — `shadow-sm` → `shadow-01`
- Modify: `src/layout/notification-center.tsx:330` — `shadow-lg` → `shadow-03`
- Modify: `src/karm/board/board-column.tsx:126` — `shadow-xl` → `shadow-04`
- Modify: `src/karm/dashboard/attendance-cta.tsx:187` — `shadow-md` → `shadow-02`, `hover:shadow-lg` → `hover:shadow-03`
- Modify: `src/ui/input-otp.tsx:44` — `shadow-sm` → `shadow-01`
- Modify: `src/ui/switch.tsx:12,20` — `shadow-sm` → `shadow-01`, `shadow-md` → `shadow-02`

**Step 1: Apply all shadow replacements**

**Step 2: Commit**

```bash
git add src/shared/command-palette.tsx src/shared/error-boundary.tsx src/layout/notification-center.tsx src/karm/board/board-column.tsx src/karm/dashboard/attendance-cta.tsx src/ui/input-otp.tsx src/ui/switch.tsx
git commit -m "fix(shadows): replace Tailwind default shadow classes with design system token shadows"
```

---

### Task 15: Fix z-index values to use semantic tokens

**Files:**
- Modify: `src/layout/top-bar.tsx:114` — `z-20` → `z-sticky`
- Modify: `src/layout/sidebar.tsx:128` — `z-10` → `z-raised`
- Modify: `src/layout/bottom-navbar.tsx:124` — `z-40` → `z-overlay`
- Modify: `src/layout/bottom-navbar.tsx:173` — `z-30` → `z-sticky`
- Modify: `src/shared/global-loading.tsx:27` — `z-50` → `z-toast`
- Modify: `src/shared/command-palette.tsx:165` — `z-50` → `z-overlay`
- Modify: `src/shared/command-palette.tsx:169` — `z-50` → `z-modal`
- Modify: `src/layout/notification-center.tsx:382` — `z-10` → `z-raised`
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx:186` — `z-[1]` → `z-raised`
- Modify: `src/karm/admin/dashboard/dashboard-skeleton.tsx:20` — `z-[1]` → `z-raised`

**Step 1: Apply all z-index replacements**

**Step 2: Commit**

```bash
git add src/layout/top-bar.tsx src/layout/sidebar.tsx src/layout/bottom-navbar.tsx src/shared/global-loading.tsx src/shared/command-palette.tsx src/layout/notification-center.tsx src/karm/admin/dashboard/admin-dashboard.tsx src/karm/admin/dashboard/dashboard-skeleton.tsx
git commit -m "fix(z-index): replace raw numeric z-index values with semantic token classes"
```

---

## Phase 2: Code Pattern Fixes

### Task 16: Fix `"false"` rendering in className (icon-button.tsx + admin-dashboard.tsx)

**Files:**
- Modify: `src/karm/custom-buttons/icon-button.tsx:114`
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx:304-332`

**Step 1: Fix icon-button template literal**

Replace the template literal on line 114 with `cn()`:
```tsx
<div className={cn(
  'relative z-10 w-full overflow-hidden h-full flex items-center justify-center rounded-[var(--radius-full)]',
  size === 'large' ? 'p-2' : 'p-1',
  !disabled && stateClasses[state],
  disabled && 'opacity-50 cursor-default hover:bg-transparent border-none',
)}>
```

Also replace `rounded-[128px]` with `rounded-[var(--radius-full)]` in `sizeClasses` (lines 12-14) and line 114.

**Step 2: Fix admin-dashboard template literals**

Convert template literal className strings in the `AdminDashboardCalendar` render (lines 304-332) to use `cn()`.

**Step 3: Commit**

```bash
git add src/karm/custom-buttons/icon-button.tsx src/karm/admin/dashboard/admin-dashboard.tsx
git commit -m "fix(classname): replace template literals with cn() to prevent false in DOM"
```

---

### Task 17: Delete dead Toggle.tsx, update direct imports

**Files:**
- Delete: `src/karm/custom-buttons/Toggle.tsx`
- Modify: `src/karm/admin/dashboard/calendar.tsx:15`
- Modify: `src/karm/admin/dashboard/dashboard-header.tsx:16`

**Step 1: Update direct imports from Toggle.tsx to use the barrel export**

In `calendar.tsx` line 15, replace:
```tsx
import { Toggle } from '../../custom-buttons/Toggle'
```
With:
```tsx
import { Toggle } from '../../custom-buttons'
```

Same change in `dashboard-header.tsx` line 16.

**Step 2: Delete Toggle.tsx**

**Step 3: Verify build**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add -A src/karm/custom-buttons/Toggle.tsx src/karm/admin/dashboard/calendar.tsx src/karm/admin/dashboard/dashboard-header.tsx
git commit -m "refactor(custom-buttons): delete dead Toggle.tsx, update imports to barrel export"
```

---

### Task 18: Fix spinner size tokens

**Files:**
- Modify: `src/ui/spinner.tsx:6-7`

**Step 1: Replace hardcoded sizes with icon tokens**

```tsx
const sizeClasses = {
  sm: 'h-[var(--icon-sm)] w-[var(--icon-sm)]',
  md: 'h-[var(--icon-md)] w-[var(--icon-md)]',
  lg: 'h-[var(--icon-lg)] w-[var(--icon-lg)]',
} as const
```

**Step 2: Commit**

```bash
git add src/ui/spinner.tsx
git commit -m "fix(spinner): use icon size tokens for md and lg sizes"
```

---

### Task 19: Fix rounded-[128px] → rounded-[var(--radius-full)] across admin files

**Files:**
- Modify: `src/karm/admin/dashboard/leave-requests.tsx:228,280,323` — `rounded-[128px]` → `rounded-[var(--radius-full)]`
- Modify: `src/karm/admin/dashboard/calendar.tsx:188` — `rounded-[60px]` → `rounded-[var(--radius-full)]`

**Step 1: Replace all non-token border-radius values**

**Step 2: Commit**

```bash
git add src/karm/admin/dashboard/leave-requests.tsx src/karm/admin/dashboard/calendar.tsx
git commit -m "fix(border-radius): replace hardcoded px values with radius-full token"
```

---

### Task 20: Typecheck + build verification

**Step 1: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS (only pre-existing primitives @ts-nocheck errors)

**Step 2: Run tests**

Run: `pnpm test`
Expected: All tests pass

**Step 3: Run build**

Run: `pnpm build`
Expected: Build succeeds

---

## Execution Notes

**Phases 0-2 are the critical fixes** — they resolve broken rendering, dark mode failures, and code bugs. These should be done first and committed incrementally.

**Typography migration (type scale) and spacing token migration (ds-* classes)** are larger systemic efforts that touch every file. They should be planned as separate follow-up phases once the critical fixes land, potentially with their own dedicated plan documents:
- Phase 3: Typography scale adoption (~30+ files)
- Phase 4: Spacing ds-* token migration (~140+ instances)

These are best done module-by-module (ui/ first, then shared/, then layout/, then karm/) to keep PRs reviewable.
