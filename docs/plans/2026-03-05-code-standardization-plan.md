# Code Standardization & Quality Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all code quality issues across the monorepo — runtime bugs, invalid classes, missing directives, architectural issues, hardcoded values, and token compliance.

**Architecture:** 7 phases: critical runtime fixes, critical architecture fixes, mechanical `'use client'` additions, Tailwind preset gaps, token compliance (source), token compliance (stories), verification.

**Tech Stack:** React 18, TypeScript 5.7, Tailwind 3.4, CVA, pnpm workspaces

**Audit reference:** `docs/audit/2026-03-05-comprehensive-code-audit.md`

---

## Phase 1: Critical Runtime Fixes (10 min)

### Task 1: Fix invalid/conflicting Tailwind classes

**Files and exact changes:**

| File | Line | Before | After |
|------|------|--------|-------|
| `packages/karm/src/admin/dashboard/attendance-overview.tsx` | 127 | `items-flex-start flex flex-row` | `flex items-start` |
| `packages/karm/src/admin/dashboard/dashboard-skeleton.tsx` | 78 | `items-flex-start flex flex-row` | `flex items-start` |
| `packages/core/src/ui/table.tsx` | 77 | `align-left` | Remove (or replace with `align-middle` if vertical align intended) |
| `packages/core/src/ui/table.tsx` | 92 | `align-left` | Remove |
| `packages/core/src/ui/tree-view/tree-item.tsx` | 204 | `duration-moderate-02-02` | `duration-moderate-02` |
| `packages/karm/src/admin/dashboard/leave-requests.tsx` | 324 | `flex hidden` | `hidden` (remove `flex items-center justify-center`) |
| `packages/karm/src/admin/dashboard/associate-detail.tsx` | 159 | `font-bold font-semibold` | `font-semibold` (pick one) |
| `packages/karm/src/admin/dashboard/dashboard-skeleton.tsx` | 74 | `md:p-0 md:p-ds-06` | `md:p-ds-06` (remove `md:p-0`) |

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck && pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Commit:** `fix(ui,karm): fix invalid and conflicting Tailwind classes`

### Task 2: Replace inline styles with Tailwind classes

| File | Line | Before | After |
|------|------|--------|-------|
| `packages/karm/src/admin/break/break-admin.tsx` | 342 | `style={{ color: 'var(--color-success-text)' }}` | `className="text-success-text"` |
| `packages/karm/src/admin/break/break-admin.tsx` | 402 | `style={{ color: 'var(--color-error-text)' }}` | `className="text-error-text"` |
| `packages/karm/src/admin/dashboard/attendance-overview.tsx` | 128 | `style={{ minWidth: 'max-content' }}` | Add `min-w-max` to className |
| `packages/karm/src/admin/dashboard/dashboard-skeleton.tsx` | 79 | `style={{ minWidth: 'max-content' }}` | Add `min-w-max` to className |

**Commit:** `fix(karm): replace inline styles with Tailwind utility classes`

---

## Phase 2: Critical Architecture Fixes (20 min)

### Task 3: Fix `useToast` effect dependency and remove delay

**File:** `packages/core/src/hooks/use-toast.ts`

**Step 1:** Change line 178 dependency from `[state]` to `[]`:
```ts
// Before:
}, [state])
// After:
}, [])
```

**Step 2:** Change line 8 `TOAST_REMOVE_DELAY` from `1000000` to `5000`:
```ts
// Before:
const TOAST_REMOVE_DELAY = 1000000
// After:
const TOAST_REMOVE_DELAY = 5000
```

**Verify:** `pnpm --filter @devalok/shilp-sutra test`

**Commit:** `fix(hooks): fix useToast listener churn and reduce remove delay to 5s`

### Task 4: Fix `BRAND_VERSION` mismatch

**File:** `packages/brand/src/brand.config.ts`

```ts
// Before:
export const BRAND_VERSION = '1.0.0'
// After:
export const BRAND_VERSION = '0.1.0'
```

**Commit:** `fix(brand): correct BRAND_VERSION to match package version 0.1.0`

### Task 5: Add `./hooks` export to core package

**File:** `packages/core/package.json`

Add to exports map:
```json
"./hooks": {
  "import": "./dist/hooks/index.js",
  "types": "./dist/hooks/index.d.ts"
}
```

**Verify:** `pnpm --filter @devalok/shilp-sutra build` then check `dist/hooks/index.js` exists.

**Commit:** `feat(core): add ./hooks public export path for useToast, useColorMode, useIsMobile`

### Task 6: Memoize BreakAdmin context value

**File:** `packages/karm/src/admin/break/break-admin.tsx`

Wrap the `contextValue` object (lines 439-465) in `React.useMemo` with appropriate dependencies.

**Commit:** `fix(karm): memoize BreakAdmin context value to prevent unnecessary re-renders`

### Task 7: Fix Stack dynamic class construction (Tailwind JIT)

**File:** `packages/core/src/ui/stack.tsx`

Replace `` `gap-${gap}` `` with a lookup map (like `alignMap` already does):
```ts
const gapMap: Record<string, string> = {
  '0': 'gap-0',
  '1': 'gap-ds-01',
  '2': 'gap-ds-02',
  '3': 'gap-ds-03',
  '4': 'gap-ds-04',
  '5': 'gap-ds-05',
  '6': 'gap-ds-06',
  '7': 'gap-ds-07',
  '8': 'gap-ds-08',
}
```

**Commit:** `fix(ui): replace dynamic gap class construction with static lookup map`

### Task 8: Add `aria-invalid` to Textarea

**File:** `packages/core/src/ui/textarea.tsx`

Add `aria-invalid={state === 'error' || undefined}` to the textarea element, matching the Input component pattern.

**Commit:** `fix(ui): add aria-invalid to Textarea for error state accessibility`

### Task 9: Escalate module boundary rules to error

**File:** `eslint.config.js`

Change all 4 `no-restricted-imports` rules from `'warn'` to `'error'`.

**Commit:** `fix(lint): escalate module boundary rules from warn to error`

### Task 10: Add lint/test scripts to brand and karm packages

**File:** `packages/brand/package.json` — add `"lint": "eslint src/"` to scripts
**File:** `packages/karm/package.json` — add `"lint": "eslint src/"` to scripts

**Commit:** `fix(ci): add lint scripts to brand and karm packages`

---

## Phase 3: Add Missing `'use client'` Directives (15 min)

### Task 11: Add `'use client'` to 33 component files

Add `'use client'` as the very first line of each file. Mechanical change.

**Core UI (17):** alert, badge, banner, card, chip, code, container, icon-button, input, skeleton, spinner, stack, stat-card, table, text, textarea, visually-hidden

**Core Charts (2):** `charts/_internal/axes.tsx`, `charts/_internal/tooltip.tsx`

**Core Composed (8):** avatar-group, content-card, empty-state, loading-skeleton, page-header, page-skeletons, priority-indicator, status-badge

**Core Shell (1):** sidebar

**Brand (2):** `devalok/devalok-logo.tsx`, `karm/karm-logo.tsx`

**Karm (3):** `admin/utils/render-adjustment-type.tsx`, `client/project-card.tsx`, `page-skeletons.tsx`

**Verify:** `pnpm typecheck`

**Commit:** `fix(core,brand,karm): add missing 'use client' directives to 33 interactive components`

---

## Phase 4: Expand Tailwind Preset (10 min)

### Task 12: Add 19 missing semantic tokens to Tailwind preset

**File:** `packages/core/src/tailwind/preset.ts`

Add letter-spacing (6 tokens), line-height (6 tokens), opacity (5 action tokens), border-focus-width (1 token), text-shadow color (1 token).

See Phase 3 Task 4 in previous plan version for exact code.

**Commit:** `feat(tokens): expose 19 missing semantic tokens in Tailwind preset`

---

## Phase 5: Token Compliance — Source Files (45 min)

### Task 13: Standardize opacity values

Replace `opacity-NN` with `opacity-[0.NN]` across ~15 source files (see audit doc for exact list).

**Commit:** `fix(ui,karm): standardize opacity values to decimal format`

### Task 14: Fix `!important` in segmented-control

**File:** `packages/core/src/ui/segmented-control.tsx:58`

Resolve the specificity issue that requires `!text-text-primary` without using `!important`.

**Commit:** `fix(ui): resolve segmented-control text color specificity without !important`

### Task 15: Fix hardcoded sizes in source components

Replace `h-16 w-16` → `h-ds-lg w-ds-lg` in error-boundary, `h-16` → `h-ds-lg` in client-portal-header, and other clear token equivalents.

**Commit:** `fix(core,karm): replace raw size classes with design system tokens`

### Task 16: Fix default exports → named exports

Convert 4 files from `export default` to named exports:
- `core/shell/app-command-palette.tsx`
- `core/shell/notification-preferences.tsx`
- `karm/dashboard/attendance-cta.tsx`
- `karm/dashboard/daily-brief.tsx`

Update any import sites.

**Commit:** `fix(shell,karm): convert default exports to named exports for consistency`

---

## Phase 6: Token Compliance — Story Files (30 min)

### Task 17: Fix 3 critical hardcoded colors in stories

| File | Line | Before | After |
|------|------|--------|-------|
| `core/ui/alert-dialog.stories.tsx` | 71 | `hover:bg-red-700` | `hover:bg-error-hover` |
| `karm/board/kanban-board.stories.tsx` | 254 | `bg-gray-50` | `bg-background` |
| `karm/dashboard/daily-brief.stories.tsx` | 118 | `border-blue-300` | `border-border-interactive` |

**Commit:** `fix(stories): replace hardcoded color classes with semantic tokens`

### Task 18: Batch-replace raw Tailwind in stories

Apply find-and-replace across all `.stories.tsx`:
- `text-sm` → `text-ds-sm` (~80 instances)
- `text-xs` → `text-ds-xs` (~15 instances)
- `text-lg` → `text-ds-lg` (~8 instances)
- `gap-N` → `gap-ds-0N` (~40 instances)
- `p-N` / `px-N` / `py-N` → `p-ds-0N` (~30 instances)
- `space-y-N` / `space-x-N` → `space-y-ds-0N` (~20 instances)
- `rounded-md` / `rounded-lg` / `rounded-full` → `rounded-ds-*` (~22 instances)
- `opacity-NN` → `opacity-[0.NN]` (~4 instances)
- `mb-N` / `mt-N` → `mb-ds-0N` / `mt-ds-0N` (~10 instances)

**Verify:** `pnpm typecheck`

**Commit:** `fix(stories): replace ~300 raw Tailwind classes with design system tokens`

---

## Phase 7: Verification & Cleanup (10 min)

### Task 19: Full verification pass

1. `pnpm typecheck` — all packages
2. `pnpm --filter @devalok/shilp-sutra test` — full test suite
3. `pnpm --filter @devalok/shilp-sutra lint` — core lint
4. `pnpm --filter @devalok/shilp-sutra build && pnpm --filter @devalok/shilp-sutra-karm build` — build

### Task 20: Update CONTRIBUTING.md

Document acceptable exceptions:
- Subpixel adjustments (`py-[1px]`, `top-[1px]`)
- Layout-specific widths in shell components
- `underline-offset-4` — standard Tailwind
- Menu min-widths (`min-w-[8rem]`)
- Skeleton placeholder sizes (decorative, not semantic)

---

## Summary

| Phase | Tasks | Est. Time | Files Changed |
|-------|-------|-----------|---------------|
| 1. Critical runtime | 1-2 | 10 min | ~8 |
| 2. Critical architecture | 3-10 | 20 min | ~10 |
| 3. 'use client' | 11 | 15 min | 33 |
| 4. Tailwind preset | 12 | 10 min | 1 |
| 5. Source tokens | 13-16 | 45 min | ~25 |
| 6. Story tokens | 17-18 | 30 min | ~48 |
| 7. Verification | 19-20 | 10 min | 1 |
| **Total** | **20** | **~2.5 hours** | **~125** |

---

## Out of Scope (separate efforts)

These were identified in the audit but require design decisions or larger refactoring:

- **`next/link` coupling in core** (C9) — needs design decision on polymorphic link pattern
- **`error-boundary.tsx` naming** (C10) — rename to `error-display.tsx` or add real ErrorBoundary class
- **Missing forwardRef on 5 karm dialog components** — these return Dialog/Fragment, not DOM elements
- **Karm duplicate dependencies** — consider moving to peerDependencies
- **Brand `cn()` inconsistency** — sync with core's `extendTailwindMerge`
- **Writing new tests** — large effort, separate session
- **Accessibility fixes** (aria-labels, keyboard handlers) — requires per-component design
- **Variant naming taxonomy** — needs design discussion
