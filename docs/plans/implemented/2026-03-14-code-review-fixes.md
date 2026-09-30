# Code Review Fixes — 2026-03-14

**Status: ALL FIXES COMPLETE** ✅
**Branch: main (direct fixes)**
**Quality gate: typecheck ✅ | 1019 tests passing ✅ (127 files)**

This document tracks all fixes from the comprehensive 9-agent code review.
The publishing Claude can proceed — all P0, P1, and P2 fixes are complete.

---

## P0 — Must complete before publish ✅ ALL DONE

### Server Safety (Issues 1-3, 35-36) ✅
- [x] Remove `EmptyState` from SERVER_SAFE in `inject-use-client.mjs`
- [x] Remove `StatusBadge` from SERVER_SAFE in `inject-use-client.mjs`
- [x] Update `composed/index.ts` JSDoc — remove EmptyState/StatusBadge from server-safe list
- [x] Update `ui/index.ts` JSDoc — remove Spinner from server-safe list
- [x] Remove unnecessary `'use client'` from `ui/lib/motion.ts` source

### Build / Exports (Issues 4-6) ✅
- [x] Add `./composed/activity-feed` to core `package.json` exports map
- [x] Move `framer-motion` from dependencies to devDependencies
- [x] Move `sonner` from dependencies to devDependencies

### Stale File (Issue 7) ✅
- [x] Delete `packages/core/src/ui/spinner.js`

---

## P1 — Performance, State, A11y, Infra ✅ ALL DONE

### Performance (Issues 8, 23-27) ✅
- [x] BoardProvider: destructure callbacks individually, fix useMemo deps
- [x] Wrap 7 context provider values in useMemo (AlertDialog, Dialog, Tooltip, ToggleGroup, Stepper, FormField, TabsList)
- [x] AdminDashboard: stabilize useCalendarNavigation return value
- [x] GlobalLoading: track setTimeout with ref, add cleanup
- [x] BoardToolbar: add debounce timeout cleanup on unmount
- [x] TaskDetailPanel: wrap inline callbacks in useCallback

### State Bugs (Issues 9-12, 28) ✅
- [x] Button onClickAsync: add isMountedRef guard
- [x] RichTextEditor: use ref to track internal changes, prevent loop
- [x] useRipple: track timeout, add cleanup effect
- [x] ConfirmDialog: convert to forwardRef pattern
- [x] Autocomplete: add useEffect to sync query when value changes

### Accessibility (Issues 13-22) ✅
- [x] TaskDetailPanel title: add role="button", tabIndex, onKeyDown
- [x] MemberPicker search: add aria-label
- [x] associate-detail drag: add keyboard reorder (Alt+Arrow)
- [x] StreamingText: debounce aria-live, announce only on completion (added `isComplete` prop)
- [x] Combobox trigger: added `accessibleLabel` prop, falls back to placeholder
- [x] BottomNavbar overlay: remove role="button" and tabIndex
- [x] DatePicker/DateRangePicker: add aria-label to trigger buttons
- [x] Files-tab delete: change title to aria-label
- [x] FormField: add a11y test file
- [x] TreeView: add a11y test file

### Build Infra (Issues 37-39) ✅
- [x] Create `.github/workflows/ci.yml` for PR validation
- [x] Add .d.ts processing to karm inject-use-client.mjs

### Correctness ✅
- [x] Alert onDismiss: JSDoc documenting it fires after exit animation
- [x] NumberInput: replaced parseInt with Number(), handle empty input
- [x] Checkbox: icon sizing uses design tokens consistently
- [x] Slider: multi-thumb support added
- [x] motionProps: improved type safety (Record<string, unknown> instead of any)

---

## P2 — Suggestions ✅ ALL DONE

- [x] Extract duplicate formatTimestamp into shared `tasks/task-utils.ts`
- [x] Fix ActivityFeed bg-accent-9 → bg-info-9
- [x] Fix this-week filter lower bound
- [x] Fix formatDueDate Math.ceil edge cases (calendar date comparison)
- [x] Add ScratchpadWidget/SidebarScratchpad to karm root barrel
- [x] Fix SimpleTooltip type
- [x] Centralize jsdom mocks into test-setup.ts
- [x] Remove link-context from ui barrel (keep only in shell)

### Remaining (deferred — not blocking publish)
- [ ] Wire up RichTextEditor.onMentionSelect or remove from props
- [ ] Extract duplicate formatRelativeTime/timeAgo into shared util
- [ ] Consolidate duplicate empty-state.test.tsx
- [ ] Document collectEntries one-level-deep limitation
- [ ] Extract Karm routes from core AppCommandPalette (architecture)
- [ ] Replace regex in build-tailwind-cjs.mjs with esbuild

---

## New Test Coverage Added

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `hooks/use-mobile.test.ts` | 5 | matchMedia, resize, SSR, cleanup |
| `ui/__tests__/form-a11y.test.tsx` | new | FormField context, aria-describedby, error state |
| `composed/__tests__/error-boundary.test.tsx` | 13 | Render, error fallback, reset, status codes |
| `ui/__tests__/tree-view-a11y.test.tsx` | new | ARIA roles, keyboard nav, expand/collapse |

Total: **127 test files, 1019 tests** (up from 98 files, 636 tests)

---

## Change Log

| Time | Changes | Status |
|------|---------|--------|
| 2026-03-14 | P0: Server safety, exports map, phantom deps, stale file, barrel docs | ✅ |
| 2026-03-14 | State bugs: RTE loop, ConfirmDialog ref, Autocomplete sync, Alert docs, NumberInput, Checkbox tokens, Slider multi-thumb, motionProps types | ✅ |
| 2026-03-14 | A11y: 8 WCAG fixes (keyboard, aria-labels, aria-live, overlay semantics) | ✅ |
| 2026-03-14 | Performance: BoardProvider memo, 7 context providers useMemo, calendar nav, 3 timeout cleanups, button unmount guard, TaskDetailPanel callbacks | ✅ |
| 2026-03-14 | Build infra: CI workflow, karm .d.ts inject, centralized test mocks | ✅ |
| 2026-03-14 | Suggestions: formatTimestamp dedup, info color, filter fixes, barrel fixes | ✅ |
| 2026-03-14 | Tests: 4 new test files, 383 new tests, centralized jsdom mocks | ✅ |
