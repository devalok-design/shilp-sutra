# Fix Plan — Ecosystem Deep Audit

**Date:** 2026-04-06
**Source:** 3-phase audit across tokens, 123 components, build, docs, tests, bundle, security

---

## P0: Critical (Must Fix Before Next Release)

### Token Layer

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | Dark mode button text contrast fails (1.79-2.72:1 vs 4.5:1) | `tokens/semantic.css` `.dark {}` block | Revert `--color-*-fg` tokens to `var(--neutral-1)` in dark mode, or darken step-9 backgrounds |
| 2 | Dark mode invisible border (1.00:1 contrast) | `tokens/semantic.css` dark `--color-surface-border-subtle` | Use a visibly different neutral step (e.g., neutral-5 instead of matching neutral-3) |

### Component Layer

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 3 | SegmentedControl: no visible focus indicator | `ui/segmented-control.tsx` | Add `focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2` to tab items |
| 4 | SegmentedControl: keyboard nav doesn't move DOM focus | `ui/segmented-control.tsx` | Add `.focus()` call on the target button element when ArrowLeft/Right fires |
| 5 | TopBar: renders `<div>` not `<header>` | `shell/top-bar.tsx` | Change root element to `<header>` with appropriate landmark role |
| 6 | TopBar.IconButton: no accessible name | `shell/top-bar.tsx` | Forward `tooltip` prop as `aria-label` on the button |
| 7 | TopBar.UserMenu: outline-none with no replacement | `shell/top-bar.tsx` | Add `focus-visible:ring-2` focus indicator |
| 8 | Sidebar (ui): renders `<div>` with no landmark | `ui/sidebar.tsx` | Change to `<aside>` or `<nav>` with `aria-label` |
| 9 | BulkActionBar: zero keyboard support | `composed/bulk-action-bar.tsx` | Add `role="toolbar"`, `aria-label`, Escape to dismiss, arrow key navigation between actions, focus management on mount |
| 10 | RichTextEditor toolbar: missing role and aria-labels | `composed/rich-text-editor.tsx` | Add `role="toolbar"` to toolbar container, replace `title` with `aria-label` on buttons |
| 11 | MasterDetail listbox: no roving tabindex | `composed/master-detail.tsx` | Implement roving tabindex on list items, add Enter/Space to select |
| 12 | HoverCard: keyboard-inaccessible | `ui/hover-card.tsx` | Document as supplementary-only; essential content must use Popover instead. Add JSDoc warning. |
| 13 | BottomNavbar "More" overlay: no keyboard | `shell/bottom-navbar.tsx` | Add `role="dialog"`, Escape to close, focus trap, focus management |
| 14 | Stepper: states invisible to screen readers | `ui/stepper.tsx` | Add `aria-current="step"` on active step, communicate completed/pending via aria-label |
| 15 | BlockTable: sortable headers not keyboard-accessible | `ai/blocks/block-table.tsx` | Add `tabIndex={0}` and `onKeyDown` (Enter/Space) to sortable `<th>` elements |
| 16 | CommandRegistry: missing "use client" | `shell/command-registry.tsx` | Remove `// @server-safe` annotation (it uses React context/hooks) |

---

## P1: Important (Fix in Current Cycle)

### Systemic Fixes (fix once, fix many)

| # | Issue | Scope | Fix |
|---|-------|-------|-----|
| 17 | 21 border contrast failures (WCAG 1.4.11) | `tokens/semantic.css` | Use step-7/8 for borders instead of step-5/6, or document as decorative |
| 18 | 5 missing pre-publish gates | `scripts/pre-publish-audit.mjs` | Add: stories check, export map validation, SURFACE1_ALLOWLIST, brand gate, bundle size |
| 19 | 10 components missing forwardRef/displayName | BulkActionBar, DeadlineIndicator, EmojiPicker, FilterBar, FormSection, InlineEdit, MarkdownViewer, AIConversation, BlockRenderer, IconGroup | Add forwardRef + displayName to each |
| 20 | 5 animations ignoring prefers-reduced-motion | StatusDot, Badge dot, ProgressRing, BottomNavbar, NotificationCenter | Add `motion-reduce:animate-none` or `useReducedMotion()` guard |
| 21 | MonthPicker/YearPicker: no grid keyboard nav | `composed/date-picker/month-picker.tsx`, `year-picker.tsx` | Add arrow key grid navigation matching CalendarGrid pattern |

### Test Coverage Fixes

| # | Issue | Fix |
|---|-------|-----|
| 22 | 6 components with zero tests | Add test files for: Breadcrumb, Link, IconContext, ButtonProcessing, CommandRegistry, DevadootIcon |
| 23 | 16 components missing axe tests | Add `toHaveNoViolations()` to: Button, Tabs, ButtonGroup, VisuallyHidden, Stepper, BulkActionBar, DeadlineIndicator, FilePreview, FormSection, InlineEdit, MarkdownViewer, CalendarGrid, CommandRegistry, DevadootIcon, DropdownMenu (expand), Sheet (expand) |
| 24 | 7 overlay/nav components missing keyboard tests | Add keyboard interaction tests for: Dialog, Sheet, DropdownMenu, Tabs, NavigationMenu, Select, Collapsible |
| 25 | Framer-motion comment outdated | `vite.config.ts:129` — update comment to reflect 84-file usage reality |

---

## P2: Medium (Improve in Next Minor)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 26 | Toast retry/cancel buttons 16x16px | `ui/toast.tsx` | Change to `min-h-6 min-w-6` (24px) |
| 27 | Toast timer doesn't pause on keyboard focus | `ui/toast.tsx` | Add `onFocusCapture`/`onBlurCapture` handlers |
| 28 | ColorInput tiny text and buttons | `ui/color-input.tsx` | Increase font size from 10px, ensure buttons meet 24px target |
| 29 | NumberInput inconsistent focus ring | `ui/number-input.tsx` | Change to `ring-2 ring-accent-9` (match system standard) |
| 30 | DataTable missing aria-sort | `ui/data-table.tsx` | Add `aria-sort="ascending|descending|none"` to sortable `<th>` |
| 31 | 6 charts hardcoded aria-labels | `ui/charts/*.tsx` | Add configurable `ariaLabel` prop, add accessible data table fallback |
| 32 | Dead fontVariantNumeric in preset | `tailwind/preset.ts` | Move to `addUtilities` plugin |
| 33 | Hardcoded kbd shadow (11x) | `ai/command-bar.tsx`, `composed/command-palette.tsx` | Extract to `--shadow-kbd` token |
| 34 | Hardcoded brand hex in AI | `ai/devadoot-icon.tsx`, `ai/command-bar.tsx` | Use token system or accept as brand-specific exception |
| 35 | Focus-ring plugin hardcodes values | `tailwind/preset.ts` | Use `--border-focus-width`/`--border-focus-offset` tokens |
| 36 | Add stories for 4 components | icon-group, badge-group, badge-indicator, button-processing | Create `.stories.tsx` files |
| 37 | Add renderToString SSR tests | 15 `@server-safe` components | New test file with React SSR verification |
| 38 | Autocomplete fragile blur timeout | `ui/autocomplete.tsx` | Replace 150ms timeout with proper focus management |

---

## P3: Low Priority (Nice to Have)

| # | Issue | Fix |
|---|-------|-----|
| 39 | InfoBlock uses role="alert" for info messages | Change to `role="status"` |
| 40 | 9 AI blocks missing displayName | Add displayName to each |
| 41 | MenubarContent no exit animation | Add exit animation |
| 42 | Pure-type files get "use client" | Exclude `.ts` (non-tsx) files from injection |
| 43 | Orphaned yellow primitive scale | Remove or document as reserved |
| 44 | JSDoc on 10 complex interfaces | Add prop descriptions for IDE tooltips |
| 45 | vite-plugin-dts minimatch vulnerability | Update when patched version available |
| 46 | `as any` in bulk-action-bar.tsx | Type the icon prop properly |

---

## Execution Order

1. **P0 tokens (#1-2)** — foundation fix, all components inherit
2. **P0 components (#3-16)** — keyboard accessibility and landmark fixes
3. **P1 systemic (#17-21)** — border contrast, pre-publish gates, reduced motion
4. **P1 tests (#22-25)** — coverage gaps
5. **P2 component fixes (#26-38)** — per-component improvements
6. **P3 polish (#39-46)** — nice-to-haves

**Estimated scope:** 46 discrete fixes. P0 (16) and P1 (9) are the priority — 25 fixes to reach international standards compliance.
