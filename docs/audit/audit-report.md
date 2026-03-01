# Shilp-Sutra Design System Audit Report

**Date:** 2026-03-01
**Audited by:** 8 specialized parallel agents covering tokens, APIs, visual/UX, accessibility, code quality, architecture, completeness, and documentation.

---

## Executive Summary

Shilp-sutra is a **103-component React design system** built on Radix UI + Tailwind CSS + CSS custom properties with a three-tier token architecture, CVA for variants, and Storybook 8.6 for documentation. The foundation is strong -- the token architecture is well-designed, the ui/ module follows consistent patterns, and Radix primitives ensure baseline accessibility.

However, the audit uncovered **systemic issues that must be addressed before production release**:

1. **A massive incomplete token migration** -- 724 references to undefined V1 tokens across 57 files mean large portions of the system render with missing colors
2. **Broken build configuration** -- the karm/admin module cannot be built or imported, dependencies aren't externalized (massive bundle bloat), and no linting/formatting configs exist
3. **Significant accessibility gaps** -- icon-only buttons throughout lack accessible names, custom components (DatePicker, CommandPalette, RichTextEditor) miss critical ARIA patterns
4. **Inconsistent patterns** -- two styling paradigms (Tailwind vs CSS Modules), three token naming conventions, five different size scales, mixed export patterns

The good news: the core `src/ui/` primitives are well-built, the token architecture is elegant, and the Radix foundation provides strong accessibility defaults. The issues are concentrated in `shared/`, `karm/`, and build/config -- all fixable with systematic effort.

---

## Findings Summary

### By Severity (deduplicated across all 8 audit domains)

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 18 | Broken functionality, missing tokens, build failures, major a11y violations |
| **Major** | 42 | Significant inconsistencies, hardcoded values, missing patterns, DX issues |
| **Minor** | 30 | Style nitpicks, naming issues, edge cases |
| **Note** | 15 | Suggestions, positive findings, future improvements |
| **Completeness Gaps** | 38 | Missing components, variants, and patterns |
| **Total** | **143** | After deduplication across all 8 audit domains |

### By Domain

| Domain | Critical | Major | Minor | Note |
|--------|----------|-------|-------|------|
| Token & Theming | 4 | 8 | 6 | 3 |
| Component API & Patterns | 3 | 6 | 5 | 3 |
| Visual & UX | 2 | 5 | 4 | 2 |
| Accessibility | 7 | 7 | 5 | 2 |
| Code Quality & Performance | 2 | 6 | 4 | 2 |
| Architecture & Scalability | 2 | 5 | 3 | 1 |
| Documentation & DX | 3 | 5 | 3 | 2 |

---

## Cross-Domain Issue Map

These are the **root causes** that produce findings across multiple audit domains. Fixing these root causes resolves clusters of issues simultaneously.

### Root Cause 1: Incomplete V1-to-V2 Token Migration
**Impact: 7 of 8 audit domains | ~50 findings trace back to this**

- **724 references** to undefined `--Mapped-*` tokens across 57 files
- **49 references** to V1 tokens in 5 CSS Module files
- Affects `shared/` (all 13 components), `karm/` (all sub-modules), `ui/data-table.tsx`
- Causes: missing colors, broken dark mode, visual inconsistency, inaccessible contrast
- The `--Mapped-*` tokens are NOT defined in `primitives.css` or `semantic.css`

**Fix dependency:** This is the single highest-impact fix. A token mapping file + batch replacement resolves visual, theming, a11y contrast, and consistency issues simultaneously.

### Root Cause 2: Missing Token Definitions
**Impact: 4 domains | ~15 findings**

- `--color-danger` / `--color-danger-hover` -- Button danger/destructive variants render invisible
- `--color-tag-*-border` (7 tokens) -- Badge borders are invisible
- `--color-info-text` / `--color-success-text` / `--color-warning-text` / `--color-error-text` -- Alert and Banner text colors missing
- 31 semantic tokens have no dark mode overrides (status colors, tag colors, text variants)
- `--neutals-400` / `--neutals-500` -- typo (missing "r") causes broken references

### Root Cause 3: Build & Infrastructure Gaps
**Impact: 3 domains | ~10 findings**

- Missing `karm/admin` Vite build entry -- the module is unbuildable and unimportable
- No dependencies externalized -- Radix, TipTap (~300KB), dnd-kit, lucide-react all bundled INTO the library
- `preserveModules: false` defeats per-component tree-shaking
- Source maps enabled in production (2-3x package size)
- No ESLint config file (ESLint 9 installed but unconfigured)
- No Prettier config file

### Root Cause 4: Dual Styling Architecture
**Impact: 5 domains | ~12 findings**

- `karm/custom-buttons/` uses CSS Modules + `React.FC` + manual state management
- Everything else uses Tailwind + `cn()` + `cva()` + `forwardRef`
- CSS Module files reference V1 tokens with hardcoded hex fallbacks
- Components in this module cannot be customized via `className` override
- Creates two mental models for contributors

### Root Cause 5: Hardcoded Colors in Karm Module
**Impact: 4 domains | ~20 findings**

- `karm/board/` uses raw Tailwind defaults (`bg-white`, `text-muted-foreground`, `border-border`)
- `karm/board/` uses hardcoded brand colors (`bg-pink-500`, `hover:bg-pink-600`)
- `karm/admin/` uses `text-gray-500`, `bg-gray-900`, `hover:bg-gray-100`
- `karm/chat/` uses `bg-red-500 text-white`
- `karm/dashboard/` uses hex gradients and `bg-amber-50`
- None of these respond to dark mode or theme changes

---

## Critical Findings (18)

### CRIT-01: V1 Token Migration Incomplete (724 references across 57 files)
- **Domains:** Token, Visual, API, Architecture, Code Quality
- **Description:** Components in `shared/`, `karm/`, and `ui/data-table.tsx` reference `--Mapped-Text-Primary`, `--Mapped-Surface-Primary`, `--border-primary`, `--Elevation-*`, etc. -- tokens that do not exist in the design system's CSS files. These components render with transparent/missing colors.
- **Fix:** Create a V1-to-V2 mapping file and batch-replace across all 57 files. Example: `--Mapped-Text-Primary` -> `var(--color-text-primary)`, `--border-primary` -> `var(--color-border-default)`.

### CRIT-02: Missing `--color-danger` Token (Button danger variants invisible)
- **Domains:** Token, Visual
- **Location:** `src/ui/button.tsx:17-25`, `src/layout/top-bar.tsx:240`, `src/layout/notification-preferences.tsx:234`
- **Fix:** Add to `semantic.css`: `--color-danger: var(--red-600)` and `--color-danger-hover: var(--red-700)` (both light and dark).

### CRIT-03: Missing Badge Border Tokens (7 `--color-tag-*-border` tokens undefined)
- **Domains:** Token, Visual
- **Location:** `src/ui/badge.tsx:12-23`
- **Fix:** Add all 7 `--color-tag-*-border` tokens to `semantic.css` (light and dark).

### CRIT-04: Missing Alert/Banner Text Tokens (`--color-*-text` undefined)
- **Domains:** Token, Visual
- **Location:** `src/ui/alert.tsx:12-18`, `src/ui/banner.tsx:12-18`
- **Fix:** Add `--color-info-text`, `--color-success-text`, `--color-warning-text`, `--color-error-text` to `semantic.css`.

### CRIT-05: 31 Semantic Tokens Missing Dark Mode Overrides
- **Domains:** Token, Visual, A11y
- **Location:** `src/tokens/semantic.css`
- **Description:** Status colors, tag colors, text variants, disabled colors, and link colors have no `.dark` counterpart. In dark mode, these inherit light-mode values (light backgrounds on dark surfaces).
- **Fix:** Add dark overrides for all 31 missing tokens.

### CRIT-06: Toast z-index `z-[100]` (Should Be 1500)
- **Domains:** Visual, Architecture
- **Location:** `src/ui/toast.tsx:17`
- **Description:** Toasts appear behind modals (1300), overlays (1200), dropdowns (1000), and sticky elements (1100). Effectively invisible in any page with overlapping UI.
- **Fix:** Change `z-[100]` to `z-[var(--z-toast)]`.

### CRIT-07: Missing `karm/admin` Build Entry Point
- **Domains:** Architecture, Code Quality
- **Location:** `vite.config.ts` (missing entry), `package.json` (export declared)
- **Description:** `package.json` declares `./karm/admin` export, but Vite has no build entry. The module will not exist in `dist/`.
- **Fix:** Add `'karm/admin/index': resolve(__dirname, 'src/karm/admin/index.ts')` to Vite entry map.

### CRIT-08: No ESLint Configuration File
- **Domains:** Code Quality
- **Location:** Project root
- **Description:** ESLint 9 installed but no config file exists. `pnpm lint` is a no-op.
- **Fix:** Create `eslint.config.js` with TypeScript, React Hooks, and JSX-a11y rules.

### CRIT-09: No Prettier Configuration File
- **Domains:** Code Quality
- **Location:** Project root
- **Description:** Prettier installed but no config. Formatting is inconsistent (mixed quotes observed).
- **Fix:** Create `.prettierrc` and run `pnpm format` to normalize.

### CRIT-10: StatusBadge Typo `--neutals-*` (Missing "r")
- **Domains:** Token, Visual, API
- **Location:** `src/shared/status-badge.tsx:38-39`, `src/karm/tasks/task-properties.tsx:591`
- **Fix:** Change `--neutals-400` to `--neutral-400` and `--neutals-500` to `--neutral-500`.

### CRIT-11: NumberInput Completely Inaccessible
- **Domains:** A11y
- **Location:** `src/ui/number-input.tsx:42-65`
- **Description:** Increment/decrement buttons have no `aria-label`. Input has no associated label, no `id`, no `aria-label`. Screen readers cannot use this component.
- **Fix:** Add `aria-label="Decrease value"` / `aria-label="Increase value"` to buttons. Accept `id` and `aria-label` props on input.

### CRIT-12: DatePicker Calendar Missing Grid Semantics and Keyboard Navigation
- **Domains:** A11y
- **Location:** `src/shared/date-picker.tsx:82-147`
- **Description:** Calendar rendered as flat divs, missing `role="grid"`, `role="gridcell"`, Arrow key navigation, `aria-selected`, and full date context on day buttons.
- **Fix:** Implement WAI-ARIA Grid pattern.

### CRIT-13: RichTextEditor Toolbar Buttons Inaccessible
- **Domains:** A11y
- **Location:** `src/shared/rich-text-editor.tsx:36-53`
- **Description:** Toolbar buttons use `title` (unreliable for screen readers) with icon-only children and no `aria-label`. Editor content area lacks role and label.
- **Fix:** Add `aria-label={title}` and `aria-pressed={isActive}` to buttons. Add `role="toolbar"` to container.

### CRIT-14: CommandPalette Missing Combobox ARIA Pattern
- **Domains:** A11y
- **Location:** `src/shared/command-palette.tsx:161-319`
- **Description:** Custom combobox implementation missing `role="combobox"`, `aria-expanded`, `aria-controls`, `role="listbox"`, `role="option"`, and `aria-activedescendant`.
- **Fix:** Implement WAI-ARIA Combobox pattern.

### CRIT-15: ToastClose Missing Accessible Name
- **Domains:** A11y
- **Location:** `src/ui/toast.tsx:77-89`
- **Fix:** Add `aria-label="Close notification"`.

### CRIT-16: Zero Storybook Stories for Admin Module (23 files)
- **Domains:** Documentation
- **Location:** `src/karm/admin/` (entire module)
- **Description:** The newest module has no visual documentation at all.
- **Fix:** Create stories for all admin components.

### CRIT-17: Zero MDX Documentation in Storybook
- **Domains:** Documentation
- **Location:** Project-wide
- **Description:** No getting-started guide, token reference, component selection guide, or pattern recipes within Storybook.
- **Fix:** Create Introduction, Tokens, GettingStarted, and Patterns MDX files.

### CRIT-18: admin-dashboard.tsx is a 1,794-line Monolith
- **Domains:** Architecture, Code Quality
- **Location:** `src/karm/admin/dashboard/admin-dashboard.tsx`
- **Fix:** Extract into ~8-10 sub-components: AttendanceList, CorrectionPanel, TimeFrameSelector, etc.

---

## Major Findings (42)

### Tokens & Theming (8)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-01 | Hardcoded Tailwind colors in task-card.tsx (bg-blue-400, bg-white, text-muted-foreground) | `src/karm/board/task-card.tsx` |
| MAJ-02 | Hardcoded colors in board-column.tsx (bg-white/80, bg-pink-500) | `src/karm/board/board-column.tsx` |
| MAJ-03 | Hardcoded colors in chat-input.tsx (bg-red-500 text-white) | `src/karm/chat/chat-input.tsx` |
| MAJ-04 | Hardcoded CSS gradient with hex values in attendance-cta.tsx | `src/karm/dashboard/attendance-cta.tsx` |
| MAJ-05 | Hardcoded Tailwind colors in admin module (text-gray-500, bg-gray-900) | `src/karm/admin/**/*.tsx` |
| MAJ-06 | Tailwind preset missing spacing/size/icon-size/border-width token mappings | `src/tailwind/preset.ts` |
| MAJ-07 | Hardcoded z-index values (z-50, z-40, z-30) instead of tokens | Multiple files |
| MAJ-08 | Spacing tokens defined but unused -- components use raw Tailwind spacing | `src/tokens/semantic.css` |

### Component API & Patterns (6)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-09 | Inconsistent variant prop naming: `variant` vs `type` vs `color` vs `status` vs `display` | Cross-module |
| MAJ-10 | 5 different size scale conventions: sm/md/lg, small/medium/big, small/big, small/medium/large, sm/default/lg | Cross-module |
| MAJ-11 | 40+ components missing forwardRef (all of shared/, most of karm/) | `src/shared/`, `src/karm/` |
| MAJ-12 | 11 components use `export default` while 90+ use named exports | `src/layout/`, `src/karm/dashboard/`, `src/ui/number-input.tsx` |
| MAJ-13 | 11+ prop interfaces not exported (CustomButtonProps, FABProps, CodeProps, etc.) | Cross-module |
| MAJ-14 | Button retains legacy variants as defaults (`default` instead of `primary`) | `src/ui/button.tsx` |

### Visual & UX (5)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-15 | Disabled opacity inconsistent: opacity-40 vs opacity-50 vs opacity-60 | Cross-module |
| MAJ-16 | Hardcoded transition durations instead of duration tokens | ~15 files |
| MAJ-17 | GlobalLoading hardcodes brand color `#D33163` | `src/shared/global-loading.tsx:37` |
| MAJ-18 | ErrorBoundary uses hardcoded rgba() colors | `src/shared/error-boundary.tsx` |
| MAJ-19 | Switch thumb uses `bg-white` (won't adapt in dark mode) | `src/ui/switch.tsx:20` |

### Accessibility (7)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-20 | NotificationCenter bell button -- no accessible name | `src/layout/notification-center.tsx:303` |
| MAJ-21 | TopBar search/AI/user buttons -- no accessible names (3 buttons) | `src/layout/top-bar.tsx` |
| MAJ-22 | IconButton has no aria-label requirement | `src/karm/custom-buttons/icon-button.tsx` |
| MAJ-23 | FormHelperText has no aria-describedby association with fields | `src/ui/form.tsx:30-38` |
| MAJ-24 | BoardColumn add/menu buttons lack accessible names | `src/karm/board/board-column.tsx:168-189` |
| MAJ-25 | TaskCard priority dot -- color-only information | `src/karm/board/task-card.tsx:137-143` |
| MAJ-26 | IconButton removes visible focus indicators with `outline-none` | `src/karm/custom-buttons/icon-button.tsx:96` |

### Code Quality & Performance (6)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-27 | No dependencies externalized in Rollup -- all bundled into library output | `vite.config.ts:37-47` |
| MAJ-28 | Source maps enabled in production build (2-3x package size) | `vite.config.ts:58` |
| MAJ-29 | `preserveModules: false` defeats tree-shaking | `vite.config.ts:49` |
| MAJ-30 | Template literal class concatenation instead of cn() in 40+ places | `src/karm/admin/`, `src/karm/chat/` |
| MAJ-31 | Explicit `any` types in admin-dashboard | `src/karm/admin/dashboard/admin-dashboard.tsx:1400` |
| MAJ-32 | Duplicated markdown components config in chat module | `src/karm/chat/message-list.tsx` + `streaming-text.tsx` |

### Architecture & Scalability (5)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-33 | Duplicate EmptyState components with conflicting APIs | `src/ui/` + `src/shared/` |
| MAJ-34 | DashboardSkeleton name collision between shared and karm/admin | `src/shared/` + `src/karm/admin/` |
| MAJ-35 | render-adjustment-type (domain logic) in ui/ module | `src/ui/render-adjustment-type.tsx` |
| MAJ-36 | hooks/ has no package export, yet ui/ depends on it | `src/hooks/`, `src/ui/sidebar.tsx`, `src/ui/toaster.tsx` |
| MAJ-37 | Admin module publicly exports 14 internal utility functions | `src/karm/admin/index.ts:65-79` |

### Documentation & DX (5)
| ID | Finding | Location |
|----|---------|----------|
| MAJ-38 | Zero JSDoc comments on any prop interface in src/ui/ | All 41 ui components |
| MAJ-39 | Stories use raw `<button>` with hardcoded `#D33163` instead of design system components | `src/shared/page-header.stories.tsx`, `src/shared/empty-state.stories.tsx` |
| MAJ-40 | README missing: dark mode setup, PostCSS config, peer deps list, Storybook link | `README.md` |
| MAJ-41 | No CLAUDE.md for AI-assisted development | Project root |
| MAJ-42 | Heavy dependencies (dnd-kit, tiptap, react-markdown) bundled as direct deps, not peer deps | `package.json` |

---

## Component Completeness: Top 14 Gaps (High Priority)

| # | Missing Component | Justification | Effort |
|---|-------------------|---------------|--------|
| 1 | AlertDialog | Needed for destructive confirmations; Radix provides it | Low |
| 2 | Pagination | DataTable and any paged list needs it | Medium |
| 3 | DataTable Enhancement | Current shell has no sorting/filtering/pagination | Medium |
| 4 | Spinner | No inline loading indicator; SearchInput manually uses Loader2 | Low |
| 5 | Button loading state | Every form submission needs this | Low |
| 6 | ScrollArea | Cross-browser styled scrollbars; Radix provides it | Low |
| 7 | Combobox/Autocomplete | Searchable select for large option lists | Medium |
| 8 | NavigationMenu | Horizontal nav; Radix provides it | Low |
| 9 | Collapsible | Single open/close toggle distinct from Accordion | Low |
| 10 | Toggle/ToggleGroup (Radix) | Generic version to replace karm-specific Toggle | Low |
| 11 | Form validation pattern | FormField has no validation integration | Medium |
| 12 | Timeline | ActivityTab has one but it's domain-specific | Medium |
| 13 | IconButton promotion | Generic component trapped in karm/ | Low |
| 14 | FAB/ExtendedFAB promotion | Generic component trapped in karm/ | Low |

---

## Recommended Fix Priority

### Phase 1: Foundation (Unblocks Everything Else)
**Estimated scope: Build/config fixes + token definitions**

1. **Create ESLint config** (CRIT-08)
2. **Create Prettier config** (CRIT-09)
3. **Add missing karm/admin Vite entry** (CRIT-07)
4. **Externalize all dependencies in Rollup** (MAJ-27)
5. **Set `preserveModules: true`, `sourcemap: false`** (MAJ-28, MAJ-29)
6. **Add missing token definitions** (CRIT-02, CRIT-03, CRIT-04)
7. **Add 31 missing dark mode overrides** (CRIT-05)
8. **Fix toast z-index** (CRIT-06)
9. **Fix --neutals typo** (CRIT-10)

### Phase 2: Token Migration (Highest Impact)
**Estimated scope: 57 files need token replacement**

1. **Create V1-to-V2 token mapping file**
2. **Batch-replace across shared/ module** (13 files)
3. **Batch-replace across karm/tasks/** (6 files)
4. **Batch-replace across karm/chat/** (5 files)
5. **Batch-replace across karm/dashboard/** (2 files)
6. **Batch-replace across karm/admin/** (~20 files)
7. **Batch-replace across karm/board/** (4 files -- also replace raw Tailwind colors)
8. **Fix ui/data-table.tsx** (1 file)
9. **Migrate CSS Module files** (5 files)

### Phase 3: Accessibility (Critical for Users)
**Estimated scope: ~25 component fixes**

1. **Add aria-labels to all icon-only buttons** (~12 buttons across layout/ and karm/)
2. **Fix NumberInput accessibility** (CRIT-11)
3. **Fix DatePicker calendar grid semantics** (CRIT-12)
4. **Fix RichTextEditor toolbar a11y** (CRIT-13)
5. **Fix CommandPalette combobox ARIA** (CRIT-14)
6. **Fix ToastClose accessible name** (CRIT-15)
7. **Add FormHelperText aria-describedby linkage** (MAJ-23)
8. **Add eslint-plugin-jsx-a11y to prevent regressions**

### Phase 4: API Consistency
**Estimated scope: Cross-module standardization**

1. **Standardize variant prop naming to `variant`** (MAJ-09)
2. **Standardize size scales to `sm/md/lg`** (MAJ-10)
3. **Add forwardRef to ~40 components** (MAJ-11)
4. **Convert 11 default exports to named exports** (MAJ-12)
5. **Export all prop interfaces** (MAJ-13)
6. **Set Button default to `primary`/`md`** (MAJ-14)
7. **Resolve EmptyState duplication** (MAJ-33)
8. **Resolve DashboardSkeleton collision** (MAJ-34)
9. **Move render-adjustment-type to karm/admin** (MAJ-35)

### Phase 5: Architecture & Code Quality

1. **Decompose admin-dashboard.tsx** (CRIT-18) into ~8-10 files
2. **Migrate custom-buttons from CSS Modules to Tailwind + CVA**
3. **Replace template literal class concatenation with cn()** (MAJ-30)
4. **Resolve hooks/ module placement** (MAJ-36)
5. **Remove internal utility exports from admin barrel** (MAJ-37)
6. **Standardize disabled opacity** (MAJ-15)
7. **Replace hardcoded transition durations with tokens** (MAJ-16)

### Phase 6: Documentation & DX

1. **Create Storybook MDX pages** (Introduction, Tokens, Getting Started, Patterns)
2. **Add JSDoc to all ui/ prop interfaces**
3. **Create admin module stories**
4. **Update README** (dark mode setup, peer deps, PostCSS, Storybook link)
5. **Create CLAUDE.md**
6. **Fix stories using raw buttons/hardcoded colors**
7. **Standardize Storybook sidebar organization**

### Phase 7: Component Completeness

1. Add AlertDialog, ScrollArea, Collapsible, Spinner (Low effort, Radix wraps)
2. Add Pagination + wire up DataTable
3. Add Button loading state
4. Add Combobox/Autocomplete
5. Promote IconButton, FAB, Toggle to ui/ (rewrite in Tailwind)
6. Add Form validation pattern

---

## Positive Findings

These aspects of the system are well-executed and should be preserved:

1. **Three-tier token architecture** (primitives -> semantic -> tailwind preset) is well-designed
2. **Clean module dependency direction** -- ui -> shared -> layout -> karm is well-maintained
3. **Radix UI primitives used correctly** -- Dialog, Sheet, Select, Popover, Tooltip all inherit proper a11y
4. **Dialog and Sheet close buttons** include `sr-only` text
5. **KanbanBoard drag-and-drop** includes accessibility announcements
6. **Breadcrumb component** follows a11y best practices perfectly
7. **Toggle component** correctly implements WAI-ARIA tablist pattern
8. **AccentProvider** is an elegant per-client theming mechanism
9. **Karm board/tasks/chat stories** are exemplary (edge cases, JSDoc, state coverage)
10. **Storybook infrastructure** is well-configured (a11y addon, theme switching, autodocs)

---

## Metrics

| Metric | Value |
|--------|-------|
| Total components | 103 |
| Components with forwardRef | ~60 |
| Components with displayName | ~50 |
| Semantic tokens defined (light) | 77 |
| Semantic tokens with dark override | 46 |
| Semantic tokens MISSING dark override | **31** |
| Undefined tokens referenced by components | **11 distinct** |
| V1/legacy token references (.tsx) | **724 across 57 files** |
| V1/legacy token references (.css) | **49 across 5 files** |
| Hardcoded color files (Tailwind defaults) | **~20 files** |
| Files using template literals instead of cn() | **~40 instances** |
| Components with zero stories | **23 (entire admin module)** |
| MDX documentation files | **0** |
| JSDoc comments on prop interfaces | **0 in ui/** |
| ESLint config files | **0** |
| Prettier config files | **0** |
| Automated test files | **0** |
