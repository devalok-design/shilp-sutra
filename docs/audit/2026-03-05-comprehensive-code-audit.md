# Comprehensive Code Quality Audit — 2026-03-05

**Scope:** All 3 packages (core, brand, karm), 100+ components, configs, tokens, stories
**Method:** 5 parallel code-review agents covering every `.tsx` file in the monorepo
**Overall Health:** 7.2/10

---

## Severity Legend

- **CRITICAL** — Broken at runtime, incorrect behavior, or blocks consumers
- **IMPORTANT** — Consistency violation, potential bug, or architectural issue
- **MINOR** — Style, improvement, or low-priority inconsistency

---

## CRITICAL Issues (14 total)

### Runtime / Correctness

| # | Issue | File(s) | Line(s) |
|---|-------|---------|---------|
| C1 | `items-flex-start` invalid Tailwind class (silently ignored, alignment broken) | `karm/admin/dashboard/attendance-overview.tsx` | 127 |
| C2 | Same invalid class | `karm/admin/dashboard/dashboard-skeleton.tsx` | 78 |
| C3 | `align-left` invalid Tailwind class (not a valid vertical-align) | `core/ui/table.tsx` | 77, 92 |
| C4 | `duration-moderate-02-02` typo (no transition applied, animation broken) | `core/ui/tree-view/tree-item.tsx` | 204 |
| C5 | `flex hidden` conflicting display properties (element always hidden) | `karm/admin/dashboard/leave-requests.tsx` | 324 |
| C6 | `font-bold font-semibold` conflicting font weights | `karm/admin/dashboard/associate-detail.tsx` | 159 |
| C7 | `md:p-0 md:p-ds-06` conflicting responsive padding | `karm/admin/dashboard/dashboard-skeleton.tsx` | 74 |
| C8 | `scrollbar-thin` class requires uninstalled plugin (silently ignored) | `core/composed/date-picker/time-picker.tsx` | 162 |

### Architecture / API

| # | Issue | File(s) | Line(s) |
|---|-------|---------|---------|
| C9 | `next/link` hard import in core library — breaks non-Next.js consumers | `core/shell/sidebar.tsx`, `core/shell/bottom-navbar.tsx` | 12, 10 |
| C10 | `error-boundary.tsx` is NOT an Error Boundary (naming mismatch) | `core/composed/error-boundary.tsx` | — |
| C11 | `useToast` effect dependency `[state]` causes listener churn (should be `[]`) | `core/hooks/use-toast.ts` | 178 |
| C12 | `TOAST_REMOVE_DELAY = 1000000` (~17 min, likely dev placeholder) | `core/hooks/use-toast.ts` | 8 |
| C13 | `BRAND_VERSION = '1.0.0'` but package is `0.1.0` | `brand/src/brand.config.ts` | 1 |
| C14 | Hooks have no public export path (no `./hooks` in core exports map) | `core/package.json` | exports |

### Performance

| # | Issue | File(s) | Line(s) |
|---|-------|---------|---------|
| C15 | BreakAdmin context value not memoized (despite comment saying "memoized") | `karm/admin/break/break-admin.tsx` | 439-465 |

---

## IMPORTANT Issues (28 total)

### Missing `'use client'` Directives (31 files)

All files that use `forwardRef`, hooks, or event handlers need `'use client'` for Next.js App Router compatibility. See full list in implementation plan.

**Core UI (17):** alert, badge, banner, card, chip, code, container, icon-button, input, skeleton, spinner, stack, stat-card, table, text, textarea, visually-hidden

**Core Charts (2):** axes, tooltip

**Core Composed (8):** avatar-group, content-card, empty-state, loading-skeleton, page-header, page-skeletons, priority-indicator, status-badge

**Core Shell (1):** sidebar

**Karm (3):** render-adjustment-type, project-card, page-skeletons

### Missing `forwardRef` (5 karm components)

| Component | File |
|-----------|------|
| DeleteBreak | `karm/admin/break/delete-break.tsx` |
| EditBreak | `karm/admin/break/edit-break.tsx` |
| EditBreakBalance | `karm/admin/break/edit-break-balance.tsx` |
| LeaveRequest | `karm/admin/break/leave-request.tsx` |
| TaskDetailPanel | `karm/tasks/task-detail-panel.tsx` |

### Inline Styles That Should Be Tailwind

| File | Line(s) | Style | Replacement |
|------|---------|-------|-------------|
| `karm/admin/break/break-admin.tsx` | 342 | `color: 'var(--color-success-text)'` | `className="text-success-text"` |
| `karm/admin/break/break-admin.tsx` | 402 | `color: 'var(--color-error-text)'` | `className="text-error-text"` |
| `karm/admin/dashboard/associate-detail.tsx` | 114-119 | width/height/opacity/bg inline | Tailwind equivalents |
| `karm/admin/dashboard/attendance-overview.tsx` | 121-128 | scrollbar + minWidth | `no-scrollbar min-w-max` |
| `karm/admin/dashboard/dashboard-skeleton.tsx` | 79, 85 | minWidth | `min-w-max`, `min-w-[200px]` |

### Token Compliance — Hardcoded Values in Source

~100+ instances of raw Tailwind classes bypassing the token system in source files (not stories). Major categories:

- **Icon sizes**: `h-3 w-3`, `h-2 w-2`, `h-4 w-4` across ~30 components (should use `h-ico-sm`/`w-ico-sm`)
- **Component sizes**: `h-5`, `h-6`, `w-11` in switch, badge, input-otp, etc.
- **Spacing**: `pl-10 pr-9`, `py-16`, `py-12` in search-input, empty-state, conversation-list
- **Opacity**: `opacity-50`, `opacity-70`, `opacity-80`, `opacity-90` across ~15 files
- **Border radius**: Bare `rounded` (no `-ds-*`) in ~10 instances

### `!important` Usage

| File | Line | Class |
|------|------|-------|
| `core/ui/segmented-control.tsx` | 58 | `!text-text-primary` — specificity battle |

### Stack Dynamic Class Construction (Tailwind JIT purge risk)

| File | Line | Pattern |
|------|------|---------|
| `core/ui/stack.tsx` | 59 | `` `gap-${gap}` `` — dynamic class not detectable by JIT |

### Missing `aria-invalid` on Textarea

| File | Notes |
|------|-------|
| `core/ui/textarea.tsx` | Input sets `aria-invalid` for error state; Textarea does not |

### Inconsistent Export Patterns

| File | Pattern | Should Be |
|------|---------|-----------|
| `core/shell/app-command-palette.tsx` | `export default` | Named export |
| `core/shell/notification-preferences.tsx` | `export default` | Named export |
| `karm/dashboard/attendance-cta.tsx` | `export default` | Named export |
| `karm/dashboard/daily-brief.tsx` | `export default` | Named export |

### Props Interfaces Not Extending HTML Attributes

| File | Component |
|------|-----------|
| `core/shell/app-command-palette.tsx` | AppCommandPaletteProps |
| `core/shell/notification-preferences.tsx` | NotificationPreferencesProps |
| `core/composed/error-boundary.tsx` | ErrorDisplayProps |

### Brand Package Issues

| Issue | File |
|-------|------|
| `cn()` uses plain `twMerge` instead of `extendTailwindMerge` (inconsistent with core) | `brand/src/lib/utils.ts` |
| `resolveColor('auto')` reads DOM synchronously, not reactive to theme changes | `brand/src/devalok/devalok-logo.tsx`, `brand/src/karm/karm-logo.tsx` |
| Missing `'use client'` on logo components that access `document` | Same files |

### Karm Package Issues

| Issue | File |
|-------|------|
| Duplicate markdown component definitions | `karm/chat/message-list.tsx` + `karm/chat/streaming-text.tsx` |
| Fragile synthetic MouseEvent construction | `karm/admin/break/leave-request.tsx` |
| Inline SVGs instead of Tabler icons | `karm/admin/break/edit-break.tsx`, `karm/dashboard/attendance-cta.tsx` |
| Karm duplicates 6 deps already in core peer dep | `karm/package.json` |

### CI / Config Issues

| Issue | File |
|-------|------|
| Brand & karm packages have no `lint` or `test` scripts (silently skipped in CI) | `brand/package.json`, `karm/package.json` |
| Module boundary rules use `'warn'` not `'error'` | `eslint.config.js` |
| `use-toast.ts` uses `@/ui/toast` alias while all others use relative paths | `core/hooks/use-toast.ts` |
| Root tsconfig excludes stories but not test files | `tsconfig.json` |

---

## MINOR Issues (25 total)

| # | Issue | File |
|---|-------|------|
| M1 | `TableCell` conflicting padding `p-ds-03 px-0` — unclear intent | `core/ui/table.tsx:92` |
| M2 | `AccordionContent` className not merged on outer element | `core/ui/accordion.tsx:94` |
| M3 | `max-h-60` hardcoded in Autocomplete popup | `core/ui/autocomplete.tsx:184` |
| M4 | `Chip` uses `React.createElement` instead of JSX | `core/ui/chip.tsx:125-155` |
| M5 | `NumberInput` inner input has no `bg-*` class | `core/ui/number-input.tsx:106` |
| M6 | `-mx-1` hardcoded in menu separators (4 files) | context-menu, dropdown-menu, menubar, select |
| M7 | `ChartContainer` SVG missing `aria-label` | `core/ui/charts/chart-container.tsx:50` |
| M8 | `data-table.tsx` eslint-disable for exhaustive-deps | `core/ui/data-table.tsx:367` |
| M9 | `sidebar.tsx` is 758 lines (consider splitting) | `core/ui/sidebar.tsx` |
| M10 | DataTable/Toaster are plain functions, not forwardRef | `core/ui/data-table.tsx:214`, `core/ui/toaster.tsx:50` |
| M11 | `MutableRefObject` casting in Autocomplete & SegmentedControl | `core/ui/autocomplete.tsx:82-84`, `core/ui/segmented-control.tsx:216` |
| M12 | `PriorityIndicator` CVA has empty variant strings | `core/composed/priority-indicator.tsx:48-51` |
| M13 | Skeleton components don't accept className | `core/composed/page-skeletons.tsx` |
| M14 | Missing `type="button"` on buttons in shell components | `core/shell/bottom-navbar.tsx:148`, `core/shell/top-bar.tsx:127,146,164` |
| M15 | `getInitials` crashes on empty string | `core/composed/lib/string-utils.ts:7` |
| M16 | `use-color-mode.ts` initial flash when stored theme is 'system' | `core/hooks/use-color-mode.ts` |
| M17 | `copy-tokens.mjs` has dead code for brand assets | `core/scripts/copy-tokens.mjs:17-21` |
| M18 | Brand `sideEffects` claims `**/*.css` but has no CSS files | `brand/package.json` |
| M19 | `useIsMobile` returns `false` during SSR instead of `undefined` | `core/hooks/use-mobile.ts:20` |
| M20 | SVG `<title>` hardcoded, ignores `aria-label` prop | `brand/src/devalok/svg-components.tsx:25` |
| M21 | Missing `aria-label` on icon buttons in karm admin | Multiple karm/admin files |
| M22 | Hardcoded fallback image `Goutham.png` | `karm/admin/dashboard/correction-list.tsx:85` |
| M23 | External CSS class dependencies undocumented in EditBreak calendar | `karm/admin/break/edit-break.tsx:559-567` |
| M24 | `@dnd-kit/utilities` may be unnecessary with sortable v10 | `karm/package.json` |
| M25 | `lint:fix` scripts missing from all packages | All package.json files |

---

## Story Files — 308 Token Violations

**3 Critical** hardcoded color classes:
- `alert-dialog.stories.tsx:71` — `hover:bg-red-700` (use `hover:bg-error-hover`)
- `kanban-board.stories.tsx:254` — `bg-gray-50` (use `bg-background`)
- `daily-brief.stories.tsx:118` — `border-blue-300` (use `border-border-interactive`)

**~305 Important** violations:
- 101 font size (`text-sm` → `text-ds-sm`, etc.)
- ~150 spacing (`gap-4` → `gap-ds-04`, `p-4` → `p-ds-04`, etc.)
- 22 border radius (`rounded-md` → `rounded-ds-md`, etc.)
- 4 opacity (`opacity-40` → `opacity-[0.4]`, etc.)
- ~15 hardcoded hex values in chart/composed stories
- ~10 raw h-N/w-N where ds-token equivalents exist

**48 files** have at least one violation. **39 files** are clean.

---

## What's Working Well

- **Module boundaries**: Zero violations — ESLint enforcement working
- **TypeScript**: Zero `as any` or `@ts-ignore` outside vendored primitives
- **File naming**: 100% kebab-case compliance
- **Named exports**: Consistent (with 4 noted exceptions)
- **displayName**: Set on all forwardRef components
- **cn() usage**: Consistent across all packages (with minor brand difference)
- **No console.log/TODO/FIXME**: Clean codebase
- **Compound component patterns**: Well-implemented (Card, Dialog, BreakAdmin, AdminDashboard)
- **Token system architecture**: 3-tier system is sound and well-documented

---

## Counts by Severity

| Severity | Source Files | Story Files | Total |
|----------|-------------|-------------|-------|
| Critical | 15 | 3 | 18 |
| Important | 28 | ~305 | ~333 |
| Minor | 25 | ~30 | ~55 |
| **Total** | **68** | **~338** | **~406** |
