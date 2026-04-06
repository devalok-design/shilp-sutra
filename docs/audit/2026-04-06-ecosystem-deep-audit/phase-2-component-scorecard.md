# Phase 2: Component-by-Component Scorecard — Executive Summary

**Date:** 2026-04-06
**Components audited:** 123 across 4 layers (ui, composed, shell, ai)
**Dimensions:** WCAG 2.2 AA, APG Keyboard, API/DX, Test Quality, Bundle/SSR, Documentation

## Overall Score

| Layer | Components | Pass | Fix | Critical | Pass Rate |
|-------|-----------|------|-----|----------|-----------|
| UI — Form Controls | 19 | 12 | 5 | 2 | 63% |
| UI — Feedback/Overlays | 13 | 8 | 3 | 2 | 62% |
| UI — Data Display | 27 | 16 | 11 | 0 | 59% |
| UI — Navigation/Layout | 21 | 10 | 8 | 3 | 48% |
| Composed | 35 | 14 | 18 | 3 | 40% |
| Shell | 8 | 2 | 2 | 4 | 25% |
| AI | 14 | 8 | 6 | 0 | 57% |
| **Total** | **137** | **70** | **53** | **14** | **51%** |

---

## P0: Critical Issues (14)

### Accessibility Failures (WCAG violations)

| # | Component | Layer | Issue | WCAG |
|---|-----------|-------|-------|------|
| 1 | SegmentedControl | ui | No visible focus indicator (`outline-none` with no replacement) | 2.4.7 |
| 2 | SegmentedControl | ui | Keyboard nav changes selection but doesn't move DOM focus | 2.1.1 |
| 3 | TopBar | shell | Renders `<div>` not `<header>` — invisible to landmark nav | 1.3.1 |
| 4 | TopBar.IconButton | shell | No accessible name (tooltip not forwarded as aria-label) | 4.1.2 |
| 5 | TopBar.UserMenu | shell | `outline-none` with no focus replacement | 2.4.7 |
| 6 | Sidebar (ui) | ui | Renders `<div>` — no nav/aside landmark role | 1.3.1 |
| 7 | BulkActionBar | composed | Zero keyboard support (no Escape, no focus management, no toolbar nav) | 2.1.1 |
| 8 | RichTextEditor | composed | Toolbar missing `role="toolbar"`, buttons have `title` not `aria-label` | 4.1.2 |
| 9 | MasterDetail | composed | `role="listbox"` but no roving tabindex, no Enter/Space to select | 2.1.1 |
| 10 | HoverCard | ui | Keyboard-inaccessible (pointer-only trigger, no focus activation) | 2.1.1 |
| 11 | BottomNavbar | shell | "More" overlay has no keyboard support, no dialog role, no Escape | 2.1.1 |
| 12 | CommandRegistry | shell | Missing `"use client"` directive (uses React context/hooks) | Build |
| 13 | Stepper | ui | Step states invisible to screen readers (no `aria-current="step"`) | 1.3.1 |
| 14 | BlockTable | ai | Sortable headers have onClick but no tabIndex/keyboard handler | 2.1.1 |

### Classification
- **6 keyboard-inaccessible components** (#1, #2, #7, #9, #11, #14)
- **4 missing landmark/semantic roles** (#3, #5, #6, #13)
- **2 missing accessible names** (#4, #8)
- **1 pointer-only interaction** (#10)
- **1 build issue** (#12)

---

## P1: Systemic Issues (Fix Once, Fix Many)

### Missing `forwardRef` / `displayName`

10 composed/AI components lack `forwardRef` or `displayName`:
- BulkActionBar, DeadlineIndicator, EmojiPicker, FilterBar, FormSection, InlineEdit, MarkdownViewer (composed)
- AIConversation, BlockRenderer, IconGroup (ai/ui)

### Missing Axe Tests

16 components have tests but no `toHaveNoViolations()`:
- **UI:** Button, Tabs, ButtonGroup, VisuallyHidden, Stepper
- **Composed:** BulkActionBar, DeadlineIndicator, FilePreview, FormSection, InlineEdit, MarkdownViewer, CalendarGrid
- **Shell:** CommandRegistry
- **AI:** DevadootIcon

### Missing Test Files Entirely

6 components have zero test coverage:
- Breadcrumb, Link, IconContext, ButtonProcessing (ui)
- CommandRegistry (shell)
- DevadootIcon (ai)

### `prefers-reduced-motion` Gaps

5 components with animations that don't respect reduced motion:
- StatusDot (animate-ping)
- Badge dot pulse
- ProgressRing spring animation
- BottomNavbar framer animations
- NotificationCenter framer animations

### Date Picker Keyboard Inconsistency

CalendarGrid has full APG grid keyboard navigation, but MonthPicker and YearPicker have NO grid keyboard nav — creating inconsistency within the same date-picker family.

---

## P2: Per-Component Issues

| Component | Layer | Issue | Priority |
|-----------|-------|-------|----------|
| Toast buttons | ui | Retry/cancel buttons 16x16px (WCAG 2.5.8: need 24px) | P2 |
| Toast timer | ui | Doesn't pause on keyboard focus (only mouse hover) | P2 |
| ColorInput | ui | 10px text, tiny Undo/Reset buttons, no keyboard for color picker gradient | P2 |
| Autocomplete | ui | Fragile 150ms blur timeout for dropdown close | P2 |
| NumberInput | ui | Inconsistent focus ring (ring-1 ring-accent-7 vs standard ring-2 ring-accent-9) | P2 |
| DropdownMenu | ui | Only 2 axe tests, no functional tests (ContextMenu has 11) | P2 |
| Sheet | ui | Only 1 axe test, no functional tests | P2 |
| Dialog | ui | Tests lack keyboard regression (Escape, focus trap, focus restore) | P2 |
| DataTable | ui | Missing `aria-sort` on sortable column headers | P2 |
| 6 Charts | ui | Hardcoded generic aria-labels, no configurable override, no table fallback | P2 |
| MenubarContent | ui | No exit animation (snaps closed) | P3 |
| InfoBlock | ai | Uses `role="alert"` for informational messages (should be `role="status"`) | P3 |
| 9 AI blocks | ai | Missing `displayName` (DevTools only) | P3 |

---

## What's Working Well

- **Combobox** — Gold standard: discriminated union types, full APG keyboard, disabled option skipping, `aria-activedescendant`, pill overflow
- **CommandPalette** — Full APG combobox, reduced motion, customizable keybindings, excellent tests
- **Form/useFormField** — Clean a11y backbone: auto-ID generation, role="alert" for errors, context wiring
- **CalendarGrid** — Proper APG grid keyboard (arrows, Home/End, Enter/Space, cross-month focus)
- **Spinner** — Exemplary reduced-motion handling, sr-only text per state
- **TreeView** — Complete APG tree pattern
- **AIConversation** — Proper `aria-live="polite"`, `role="status"` + `aria-busy` on processing
- **CommandBar** — Correct combobox pattern with full keyboard nav
- **All components** have correct `@server-safe` / `"use client"` annotations
- **All components** have Storybook stories (except 3 internal ones)

---

## Detailed Batch Reports

- [Batch 1: Form Controls](phase-2-batch1-form-controls.md) — 19 components
- [Batch 2: Feedback/Overlays](phase-2-batch2-feedback-overlays.md) — 13 components
- [Batch 3: Data Display](phase-2-batch3-data-display.md) — 27 components
- [Batch 4: Navigation/Layout](phase-2-batch4-navigation-layout.md) — 21 components
- [Batch 5: Composed](phase-2-batch5-composed.md) — 35 components
- [Batch 6: Shell](phase-2-batch6-shell.md) — 8 components
- [Batch 7: AI](phase-2-batch7-ai.md) — 14 components
