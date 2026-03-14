# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### BREAKING (core)
- **TopBar rewritten as composition API**. Old props-based API removed (`pageTitle`, `onSearchClick`, `onAiChatClick`, `notificationSlot`, `mobileLogo`). Use `TopBar.Left`, `TopBar.Right`, `TopBar.Section`, `TopBar.IconButton`, `TopBar.Title`, `TopBar.UserMenu` subcomponents instead.

### Changed (core)
- **Border tokens softened**: `surface-border` shifted from neutral-6→5 (light) / neutral-4→3 (dark). `surface-border-strong` shifted from neutral-7→6 (light) / neutral-5→4 (dark). Borders are now subtler and closer to the BoardColumn reference pattern.
- **Shell chrome elevated**: Sidebar, TopBar, and BottomNavbar backgrounds changed from `bg-surface-1` to `bg-surface-2`. Interactive states within shell components bumped one level (`surface-2` → `surface-3` hover, `surface-3` → `surface-4` active).

### Added (core)
- **TopBar.Left / TopBar.Center / TopBar.Right** — zone components for flexible layout
- **TopBar.Section** — groups items with `gap` prop (`tight` | `default` | `loose`)
- **TopBar.IconButton** — reusable circular icon button with tooltip
- **TopBar.Title** — responsive page title (hidden on mobile)
- **TopBar.UserMenu** — extracted user dropdown as standalone subcomponent
- Auto grid/flex layout: 3-column CSS grid when `TopBar.Center` is present, flex otherwise

---

## karm@0.18.1 - 2026-03-14

### Added (karm)
- **Ship per-component docs**: 35 individual `.md` files now included in npm package under `docs/components/` (board, tasks, chat, dashboard, client, admin, other). AI agents can read per-component API references directly from `node_modules/@devalok/shilp-sutra-karm/docs/components/{category}/{name}.md`.
- **New export**: `./docs/*` glob export for programmatic access to component docs.

---

## [0.18.2] - 2026-03-14

### Changed (core)
- **Ship per-component docs**: 91 individual `.md` files now included in npm package under `docs/components/`. AI agents can read per-component API references directly from `node_modules/@devalok/shilp-sutra/docs/components/{category}/{name}.md`.
- **New export**: `./docs/*` glob export maps to `docs/components/*` for programmatic access.
- **Publishing checklist**: Added lint gate, stale `.js` check, `build:docs:check` coverage verification, and multi-package version bump guidance.

---

## [0.18.1] - 2026-03-14

Comprehensive audit fix release. Security fixes, build pipeline hardening, component API improvements, and documentation corrections.

### Fixed (core)
- **Security**: Validate `externalUrl` protocol before rendering as `href` in FilesTab (XSS prevention)
- **Security**: Sanitize markdown hrefs in DailyBrief using shared `markdownComponents`
- **Build**: Fix root cause of stale `.js` files — playground `tsc` was emitting compiled output into core `src/` via path aliases (added `noEmit: true`)
- **Build**: Add missing package exports: `./ui/lib/motion`, `./ui/lib/date-utils`, `./shell/command-registry`, `./tailwind/preset`
- **Build**: Fix `"use client"` incorrectly injected into server-safe shared chunks (`_chunks/utils`, `_chunks/motion`, `composed/lib/string-utils`)
- **Build**: Rename `manualChunks` chunk `'motion'` → `'framer'` to avoid collision with `motion/` entry directory
- **Build**: Move `motion/` from `collectEntries` to `explicitEntries` to prevent orphaned dist files
- **Build**: Add null-check guard in `build-tailwind-cjs.mjs`; anchor `copy-tokens.mjs` paths to `import.meta.url`
- **A11y**: Badge dismiss `aria-label` is now contextual (`"Remove {text}"`)
- **A11y**: Combobox multi-select pill dismiss icon uses DS icon token (`h-ico-sm`)
- **Components**: `SegmentedControl` `layoutId` scoped via `useId()` for multi-instance safety
- **Components**: `useRipple` tracks all active timeouts — fixes memory leak under rapid clicks
- **Components**: `Step` no longer leaks internal `_index` prop in public `forwardRef` type
- **Exports**: `withReducedMotion` and `motionProps` re-exported from `@devalok/shilp-sutra/motion`
- **Docs**: Fix `llms.txt` — removed non-existent presets (`springs.rigid`, `tweens.standard`, `tweens.gentle`)
- **Docs**: Fix `llms.txt` — removed Spinner, EmptyState, StatusBadge from server-safe list

### Changed (karm@0.18.0)
- **Breaking**: `framer-motion` externalized — consumers must install `framer-motion@^12.0.0`. Vendor chunk reduced from 492KB to 309KB.
- **Breaking**: Peer dep on `@devalok/shilp-sutra` bumped from `>=0.7.0` to `>=0.18.0`
- Added `'motion'` to path rewrite categories for explicit mapping

---

## [0.18.0] - 2026-03-14

The **OKLCH + Framer Motion** release. Three major system-wide migrations in one release: color tokens rewritten to OKLCH perceptual color science, all animations migrated from CSS keyframes to Framer Motion physics-based springs, and toast notifications rewritten to an imperative API.

**New runtime dependency:** `framer-motion@^12.36.0` (bundled in core)
**New peer dependency for karm:** `framer-motion@^12.0.0`

### BREAKING — Color Token Architecture (OKLCH 12-step)

All color primitives migrated from hex shade numbers (50–950) to OKLCH functional steps (1–12). Dark mode is now algorithmically derived with perceptually uniform lightness/chroma curves.

**Primitive tokens:**
- `--pink-50` through `--pink-950` → `--pink-1` through `--pink-12` (OKLCH values)
- Same migration for all 8 scales: pink, red, orange, amber, green, blue, purple, neutral

**Semantic tokens:**
- `--color-interactive` → `--color-accent-9` (and `accent-{1-12}` full scale)
- `--color-interactive-hover` → `--color-accent-10`
- `--color-interactive-subtle` → `--color-accent-2`
- `--color-text-secondary` → `--color-surface-fg-muted`
- New: `--color-secondary-{1-12}`, `--color-surface-{1-4}`, `--color-surface-fg`, `--color-surface-fg-muted`, `--color-surface-fg-subtle`, `--color-surface-border`, `--color-surface-border-strong`
- Status tokens: `--color-error-{3,7,9,11,fg}`, `--color-success-{3,7,9,11,fg}`, `--color-warning-{3,7,9,11,fg}`, `--color-info-{3,7,9,11,fg}`

**Step purposes (the 12-step system):**
1=app-bg, 2=subtle-bg, 3=component-bg, 4=hover, 5=active, 6=border-subtle, 7=border, 8=border-strong, 9=solid/accent, 10=solid-hover, 11=low-contrast-text, 12=high-contrast-text, fg=foreground-on-solid

**Tailwind utilities:** 94 new color utilities — `accent-1..12`, `secondary-1..12`, `surface-1..4`, status/category step utilities

**Backward compatibility:** All old semantic token names preserved as aliases. `--color-interactive` still works → maps to `--color-accent-9`. Old Tailwind utilities still work.

**Consumer migration for direct primitive usage:**
- `--pink-500` → `--pink-9`, `--neutral-100` → `--neutral-2`
- See `docs/plans/2026-03-13-dark-light-mode-token-redesign-design.md` for full mapping

### BREAKING — Transitions Component Removed

`Fade`, `Collapse`, `Grow`, `Slide` removed from `@devalok/shilp-sutra/ui`. The `./ui/transitions` export path no longer exists.

**Migration:** Use Framer Motion primitives from `@devalok/shilp-sutra/motion/primitives`:
```diff
- import { Fade, Collapse, Slide } from '@devalok/shilp-sutra/ui/transitions'
+ import { MotionFade, MotionCollapse, MotionSlide } from '@devalok/shilp-sutra/motion/primitives'
```

### BREAKING — CSS Keyframe Animations Removed

18 CSS keyframes removed from the Tailwind preset (replaced by Framer Motion):
- `fade-in`, `fade-out`, `slide-up`, `slide-right`, `scale-in`, `scale-out`, `glow-pulse`, `scale-bounce`, `lift`
- Corresponding `animate-*` utilities removed
- Stagger delay plugins (`.delay-stagger`, `.delay-stagger-50`) removed

**Migration:** Use `MotionStagger` / `MotionFade` / `MotionSlide` from `@devalok/shilp-sutra/motion/primitives`, or use `springs` / `tweens` presets from `@devalok/shilp-sutra/motion`.

### BREAKING — `useReducedMotion` Hook Removed

The old `useReducedMotion()` hook is removed. Use `MotionProvider` with `reducedMotion="user"` at your app root — Framer Motion natively respects `prefers-reduced-motion`.

### Added — Framer Motion Animation System

Complete migration of all interactive animations from CSS keyframes to Framer Motion physics-based springs. 37 components migrated.

**New exports from `@devalok/shilp-sutra/motion`:**
- `MotionProvider` — global animation context with reduced-motion control
- `springs` — physics presets: `bouncy`, `smooth`, `snappy`, `gentle`, `rigid`
- `tweens` — timing presets: `fade`, `standard`, `gentle`
- `stagger` — orchestration helper for cascading animations

**New exports from `@devalok/shilp-sutra/motion/primitives`:**
- `MotionFade` — opacity fade in/out
- `MotionScale` — scale entrance/exit
- `MotionPop` — scale with spring overshoot
- `MotionSlide` — directional slide
- `MotionCollapse` — height-based expand/collapse
- `MotionStagger` + `MotionStaggerItem` — cascading entrance container

**Components migrated to Framer Motion:**
- Overlays: Dialog, AlertDialog, Sheet, Popover, Tooltip, HoverCard, NavigationMenu
- Form: Checkbox (bouncy indicator), Switch (spring thumb), Toggle (press spring)
- Interactive: Button (whileTap scale), Card interactive (hover lift), Accordion (height + fade)
- Feedback: Alert (exit animation), Badge (pulse-ring), Spinner (arc rotation)
- Charts: All 8 chart types (entrance animations)
- Karm board: Task stagger, bulk action bar, filter chip cascade

### Added — Spinner v2

Complete rewrite with Framer Motion arc animation and state transitions.

- **New props:** `state?: 'spinning' | 'success' | 'error'`, `variant?: 'filled' | 'bare'`, `delay?: number`, `onComplete?: () => void`
- `bare` variant uses `currentColor` for embedding in buttons/toolbars
- State transitions: spinning → success (green check) or error (red X) with spring crossfade
- Respects `prefers-reduced-motion` (static icons with opacity crossfade)

### Added — Button `onClickAsync`

Promise-driven loading → success/error state machine.

- **New prop:** `onClickAsync?: (e: MouseEvent) => Promise<void>`
- Auto-managed states: idle → loading (spinner) → success (green check) / error (red X) → idle
- **New prop:** `asyncFeedbackDuration?: number` (default 1500ms)
- Overrides `onClick` and `loading` when active

### Added — OKLCH Scale Generator

- `generateScale()` utility in `@devalok/shilp-sutra/tokens` for creating 12-step OKLCH palettes from a seed color
- Used by the playground for interactive color exploration

### Added — Motion Token Library (`ui/lib/motion`)

- `springs` and `tweens` presets exported from `@devalok/shilp-sutra/ui` (also from `@devalok/shilp-sutra/motion`)
- `withReducedMotion()` utility for wrapping spring configs

### Added — New Export Paths

- `./motion` — MotionProvider, springs, tweens, stagger
- `./motion/primitives` — MotionFade, MotionScale, MotionPop, MotionSlide, MotionCollapse, MotionStagger

### Added — Type Exports

61 new Props type exports added to barrel files:
- `AlertDialogContentProps`, `AlertDialogActionProps`, `AlertDialogCancelProps`
- `BreadcrumbProps`, `BreadcrumbLinkProps`
- `ContextMenuContentProps`, `ContextMenuItemProps`
- `DialogContentProps`, `DialogTitleProps`
- `DropdownMenuContentProps`, `DropdownMenuItemProps`
- `MenubarContentProps`, `MenubarItemProps`
- `NavigationMenuProps`, `NavigationMenuContentProps`
- `PopoverContentProps`, `TooltipContentProps`
- `InputOTPProps`, `TableProps`, `TableRowProps`, `TableCellProps`
- `SheetContentProps`, `SidebarProps`, `ToasterProps`
- `LinkProviderProps` (from `./ui/lib`)
- `MotionPrimitiveProps`, `MotionStaggerProps`, `MotionProviderProps`
- `SpringPreset`, `TweenPreset`

### Fixed

- **Switch**: Added visible border on unchecked state (`border-surface-border-strong`) — was borderless, making unchecked state hard to see
- **Badge**: Fixed accent color variants — `text-accent-9` → `text-accent-11`, `border-accent-9` → `border-accent-7` (step 9 is solid fill, step 11 is accessible text)
- **Link**: Fixed color tokens — `text-info-9` → `text-accent-11` (links are interactive = accent scale)
- **Toast**: Fixed accent bar colors from step 7 → step 9 (decorative fills use solid step)
- **Button**: Fixed async feedback colors — `bg-success text-text-on-color` → `bg-success-9 text-accent-fg`
- **SegmentedControl**: Fixed `bg-interactive` → `bg-accent-9`, `bg-field` → `bg-surface-3`
- **Stepper**: Fixed `bg-interactive` → `bg-accent-9`
- **Sidebar**: Fixed `bg-interactive-subtle` → `bg-accent-2`
- **Spinner**: Fade out track circle in bare mode, use larger icons for bare variant
- **`onDrag` type conflict**: Resolved between React and Framer Motion HTML attributes
- 37+ token references fixed across stories and components (legacy names → OKLCH system)

### Changed

- **Dark mode**: Algorithmically derived OKLCH curves per step (not hex overrides). Surfaces lighten with elevation.
- All interactive animations now use physics-based springs (not timing-based CSS transitions)
- Focus ring colors: `ring-focus` → `ring-accent-9`
- Disabled opacity: `opacity-[0.38]` → `opacity-action-disabled`

### Removed

- `./ui/transitions` export path and `transitions.tsx` module
- `useReducedMotion()` hook (use `MotionProvider` instead)
- 18 CSS keyframe definitions from Tailwind preset
- 9 `animate-*` utility classes
- `.delay-stagger` and `.delay-stagger-50` plugins

### Code Review Fixes (9-agent comprehensive review)

**Server safety:**
- Removed `EmptyState` and `StatusBadge` from SERVER_SAFE in `inject-use-client.mjs` — they import Framer Motion and are no longer server-safe
- Removed `Spinner` from server-safe list in `ui/index.ts` JSDoc
- Removed unnecessary `'use client'` from `ui/lib/motion.ts` source

**Build / exports:**
- Added `./composed/activity-feed` to core `package.json` exports map
- Moved `framer-motion` from `dependencies` to `devDependencies` (bundled at build time)
- Moved `sonner` from `dependencies` to `devDependencies` (bundled at build time)
- Deleted stale `packages/core/src/ui/spinner.js` (shadowed `.tsx` source)
- Added `.d.ts` processing to karm `inject-use-client.mjs`

**Performance:**
- **BoardProvider**: Destructured callbacks individually, fixed useMemo dependency arrays
- Wrapped 7 context provider values in `useMemo` (AlertDialog, Dialog, Tooltip, ToggleGroup, Stepper, FormField, TabsList)
- **AdminDashboard**: Stabilized `useCalendarNavigation` return value
- **GlobalLoading**: Track `setTimeout` with ref, add cleanup on unmount
- **BoardToolbar**: Added debounce timeout cleanup on unmount
- **TaskDetailPanel**: Wrapped inline callbacks in `useCallback`

**State bug fixes:**
- **Button `onClickAsync`**: Added `isMountedRef` guard to prevent set-state-after-unmount
- **RichTextEditor**: Use ref to track internal changes, prevent update loop
- **useRipple**: Track timeout with ref, add cleanup effect
- **ConfirmDialog**: Converted to `forwardRef` pattern
- **Autocomplete**: Added `useEffect` to sync query when external value changes

**Accessibility (WCAG):**
- **TaskDetailPanel** title: Added `role="button"`, `tabIndex`, `onKeyDown` for keyboard access
- **MemberPicker** search: Added `aria-label`
- **AssociateDetail** drag: Added keyboard reorder (`Alt+Arrow`)
- **StreamingText**: Debounced `aria-live`, announce only on completion (added `isComplete` prop)
- **Combobox**: Added `accessibleLabel` prop, falls back to placeholder
- **BottomNavbar** overlay: Removed incorrect `role="button"` and `tabIndex`
- **DatePicker/DateRangePicker**: Added `aria-label` to trigger buttons
- **FilesTab** delete button: Changed `title` to `aria-label`

**Correctness:**
- **Alert** `onDismiss`: JSDoc documenting it fires after exit animation completes
- **NumberInput**: Replaced `parseInt` with `Number()`, handle empty input
- **Checkbox**: Icon sizing uses design tokens consistently
- **Slider**: Multi-thumb support added
- **motionProps**: Improved type safety (`Record<string, unknown>` instead of `any`)
- **ActivityFeed**: Fixed `bg-accent-9` → `bg-info-9` (info color, not accent)
- **Board filters**: Fixed this-week filter lower bound calculation
- **formatDueDate**: Fixed `Math.ceil` edge cases (calendar date comparison)
- **SimpleTooltip**: Fixed type definition

**Code quality:**
- Extracted duplicate `formatTimestamp` into shared `tasks/task-utils.ts`
- Added `ScratchpadWidget`/`SidebarScratchpad` to karm root barrel export
- Centralized jsdom mocks into `test-setup.ts`
- Removed `link-context` from `ui` barrel (kept only in `shell`)
- Created `.github/workflows/ci.yml` for PR validation

**Deferred (not blocking publish):**
- Wire up `RichTextEditor.onMentionSelect` or remove from props
- Extract duplicate `formatRelativeTime`/`timeAgo` into shared util
- Consolidate duplicate `empty-state.test.tsx`
- Document `collectEntries` one-level-deep limitation
- Extract Karm routes from core `AppCommandPalette` (architecture boundary)
- Replace regex in `build-tailwind-cjs.mjs` with esbuild

### Test Coverage

- 127 test files, 1019 tests (up from 636 at start of release cycle)
- New: motion primitives (7 primitives, 12 tests), MotionProvider (7 tests), generateScale (67 tests)
- New: motion token validation (12 tests)
- New: FormField a11y tests, TreeView a11y tests, ErrorBoundary tests (13), use-mobile tests (5)

### shilp-sutra-karm [0.17.0]

- **New peer dependency:** `framer-motion@^12.0.0` — consumers must install framer-motion
- All karm components migrated to OKLCH token system (board, admin, dashboard, client)
- Board animations migrated to Framer Motion (task stagger, bulk action bar, filter chips)
- Fixed 20+ legacy token references across admin, dashboard, and board modules
- **BoardProvider**: Performance fixes — destructured callbacks, fixed useMemo deps
- **BoardToolbar**: Debounce timeout cleanup on unmount
- **TaskDetailPanel**: `useCallback`-wrapped handlers, title keyboard accessibility
- **StreamingText**: `isComplete` prop for debounced aria-live announcements
- **AssociateDetail**: Keyboard reorder support (Alt+Arrow)
- Extracted shared `task-utils.ts` for duplicate timestamp formatting
- Added `ScratchpadWidget`/`SidebarScratchpad` to root barrel

### Playground

- Migrated to 12-step OKLCH color scales with interactive editor

## [0.17.2] - 2026-03-12

### Documentation
- **llms-full.txt**: Added inline type definitions for all 72 previously undocumented exports across shell, composed, and UI modules (NavItem, NavGroup, SidebarUser, TopBarUser, UserMenuItem, BottomNavItem, Notification, SearchResult, MemberPickerMember, CommandGroup, CommandItem, ScheduleEvent, ConfirmDialogProps, and 59 more)
- **llms.txt**: Added missing one-liner entries for ConfirmDialog, SimpleTooltip, ScheduleView, UploadProgress

## [0.17.0] - 2026-03-12

### Fixed
- **TableCell**: Added `px-ds-03` horizontal padding — was `px-0`, causing content to hug container edges with no left/right spacing. Now matches `TableHead` padding.
- **animate-shake**: Changed from `1s infinite` to `0.4s both` — was looping endlessly on upload failure states. Now plays once with a natural feel.

### Documentation — Previously Undocumented Components
The following components were exported but missing from AI-readable docs (llms.txt / llms-full.txt). All now documented:

**Core composed (7 added):**
- UploadProgress — file upload tracker with status indicators, retry/remove, compact variant
- TimePicker — standalone time selector (12h/24h, minute/second steps)
- CalendarGrid — low-level calendar widget with single/range selection, event dots
- YearPicker — decade year grid for year selection
- MonthPicker — month grid for month selection
- Presets — quick-select date range buttons
- useCalendar — hook for calendar month navigation state

**Karm dashboard (2 added):**
- ScratchpadWidget — dashboard todo widget with progress ring
- SidebarScratchpad — compact collapsible sidebar scratchpad

**Karm board (1 added):**
- BoardProvider `members` prop documentation in llms.txt

## shilp-sutra-karm [0.16.0] - 2026-03-12

### Fixed
- **KanbanBoard**: All board sub-components (toolbar, column header, context menu, bulk action bar) now read members from context instead of re-deriving from `rawColumns` on every render

### Documentation
- Added ScratchpadWidget, SidebarScratchpad, DailyBrief enhanced props to llms.txt

## shilp-sutra-karm [0.15.0] - 2026-03-12

### Added
- **KanbanBoard**: `members?: BoardMember[]` prop on `BoardProvider` — explicit member list for assignment dropdowns, lead selector, and bulk assign. Falls back to deriving members from task assignees when not provided. Fixes empty member lists on new/empty projects.

## [0.16.1] - 2026-03-12

### Fixed
- **DataTable**: `serverPagination` object reference in `useCallback` dependency caused stale closure — now uses stable ref for `onPageChange`
- **DataTable**: `onSelectionChange` effect fired every render due to `table` in dependency array — now derives selected rows from `rowSelection` + `data` directly
- **DataTable**: `selectedRows` useMemo for bulk actions had same `table` dependency issue — fixed to use stable derivation
- **ScratchpadWidget**: Removed unused `onReorder` prop from interface

## [0.16.0] - 2026-03-12

### Added
- **DataTable**: `onSort` callback for server-side sorting (pass `manualSorting` mode)
- **DataTable**: `emptyState?: ReactNode` slot — custom empty state replaces plain text
- **DataTable**: `loading?: boolean` — shimmer skeleton rows with varied column widths
- **DataTable**: `selectedIds?: Set<string>` + `selectableFilter?: (row) => boolean` — controlled selection with per-row disable
- **DataTable**: `pagination?: { page, pageSize, total, onPageChange }` — server-side pagination
- **DataTable**: `singleExpand?: boolean` — collapses previous row on new expand
- **DataTable**: `stickyHeader?: boolean` — sticky table header on scroll
- **DataTable**: `onRowClick?: (row) => void` — row click handler (excludes interactive elements)
- **DataTable**: `bulkActions?: BulkAction[]` — floating action bar on row selection
- **ActivityFeed**: New composed component — vertical timeline with colored dots, actor avatars, expandable detail, compact mode, load more, maxInitialItems truncation
- **EmptyState**: `iconSize?: 'sm' | 'md' | 'lg'` — control icon dimensions (sm=16px, md=32px, lg=48px)
- **BottomNavbar**: `badge?: number` on `BottomNavItem` — notification count badge (red dot, 99+ cap)
- **AppSidebar**: `preFooterClassName?: string` — custom className on preFooterSlot wrapper (enables scroll overflow)

### shilp-sutra-karm [0.14.0]

### Added
- **ScratchpadWidget**: Dashboard todo widget — CRUD, progress ring, keyboard-first add flow, hover/focus-visible delete
- **SidebarScratchpad**: Compact collapsible sidebar scratchpad — toggle-only, badge count, grid-based collapse animation
- **DailyBrief**: `onRefresh` callback with spin animation, `unavailable` state, `defaultCollapsed`, custom `title`, relative timestamp footer, grid-based collapse animation

## [0.15.0] - 2026-03-11

### Added
- **CommandPalette**: Staggered slide-up entrance animations for items (30ms delay cascade), fade-in for groups/empty state/footer, scale-in for search icon, active item icon/shortcut color transitions to interactive

### Changed
- **Input, Select, SearchInput, Textarea**: `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency
- **Input, Textarea, NumberInput, ColorInput**: `md` size font standardized to `text-ds-md` (14px) from mixed values

### shilp-sutra-karm [0.13.0]

### Changed
- **KanbanBoard**: Drag-and-drop now defers task move until drop — task stays in source column during drag, ghost silhouette appears at target position
- **BoardColumn**: Added `TaskGhost` placeholder component with dashed border for drag preview, `dragPreview` and `draggedTask` props

## [0.14.0] - 2026-03-11

### Added
- **AppSidebar**: `footer.version` now accepts `string | { label: string; href: string }` — version can link to changelog (S9)

### Changed
- **TabsTrigger**: Added `gap-ds-02` (4px) between icon and label for better spacing
- **Select, Combobox, Autocomplete, DropdownMenu, ContextMenu, Menubar, HoverCard**: Promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown content rendering behind Sheet/Dialog overlays (U1/K1)

### shilp-sutra-karm [0.12.0]

### Added
- **TaskDetailPanel**: `headerSlot` prop — inject custom content (GDrive links, quick actions) between title and properties (K4)
- **TaskDetailPanel**: `extraTabs` prop with `ExtraTab` type — inject custom tab panels before/after built-in tabs (K5)
- **TaskDetailPanel**: `onUploadDeliverable` callback — separate deliverable version uploads from generic file attachments (K8)
- **FullTask**: `metadata?: Record<string, unknown>` — extensible bag for consumer-defined data (K7)
- **TaskFile**: `externalUrl` and `externalLabel` — external link icon rendered alongside download button (K6)

## [0.13.0] - 2026-03-11

### Added
- **Tailwind preset**: 4 new keyframes — `accordion-down`, `accordion-up`, `collapsible-down`, `collapsible-up` using Radix CSS custom properties for smooth height-based animations
- **Tailwind preset**: 4 new animation utilities — `animate-accordion-down`, `animate-accordion-up`, `animate-collapsible-down`, `animate-collapsible-up` with design-token durations and easings
- **NotificationCenter**: `NotificationAction` type and `actions` prop on `Notification` — inline action buttons (e.g. Approve/Deny) per notification row
- **AppSidebar**: `SidebarPromo` type and `footer.promo` prop — dismissable promo/upsell banner with icon, text, and action button
- **AppSidebar**: Footer links and version now render on a single line separated by `·` dividers

### Changed
- **EmptyState**: `icon` prop now accepts `React.ComponentType<{ className?: string }>` in addition to `ReactNode` — component references (e.g. Tabler icons) are auto-instantiated with correct sizing
- **NotificationCenter**: Tier dot now doubles as read/unread marker (opacity-based) — removed separate unread indicator dot that clashed with dismiss button
- **Collapsible**: Default animation changed from fade-only to height-based expand/collapse using `animate-collapsible-down`/`animate-collapsible-up`
- **AppSidebar**: Collapsible chevron wrapped in fixed-height container to prevent drift when children expand; chevron now animates rotation with design-token easing

### Fixed
- **AppSidebar**: Collapsible chevron no longer drifts into child elements when sub-list expands (positioning anchor bug)
- **BottomNavbar stories**: Navbar now visible in Storybook at desktop viewport width via style override in decorator

### shilp-sutra-karm [0.11.0]

### Changed
- **ConversationTab**: `richText` prop now defaults to `true` — RichTextEditor/Viewer used by default instead of plain textarea
- **ConversationTab stories**: Widened decorator from 400px to 520px; added `PlainTextFallback` story

## [0.12.0] - 2026-03-11

### Added
- **Tailwind preset**: 9 animation keyframes (`fade-in`, `fade-out`, `slide-up`, `slide-right`, `scale-in`, `scale-out`, `glow-pulse`, `scale-bounce`, `lift`) with design-token-based durations and easings
- **Tailwind preset**: 9 animation utilities — `animate-fade-in`, `animate-fade-out`, `animate-slide-up`, `animate-slide-right`, `animate-scale-in`, `animate-scale-out`, `animate-glow-pulse`, `animate-scale-bounce`, `animate-lift`
- **Tailwind preset**: Stagger delay plugins — `.delay-stagger` (30ms × `--stagger-index`) and `.delay-stagger-50` (50ms × `--stagger-index`) for cascading entrance animations

### Changed
- **Input**: Softer resting border (`border-border-subtle` instead of `border-border`), subtler focus ring (`ring-1 ring-focus/50` instead of `ring-2 ring-focus`)
- **Input**: Reverted split `pl-*/pr-*` size variants back to `px-*`; icon padding uses `pl-ds-07`/`pr-ds-07` (was `pl-ds-06b`/`pr-ds-06b`)

### shilp-sutra-karm [0.10.0]

### Added
- **Board rework**: Complete board system rewrite with `BoardProvider` context, `KanbanBoard` orchestrator, `BoardToolbar` with search/filters/view modes, `BulkActionBar` for multi-select actions, `TaskContextMenu` with right-click quick actions
- **BoardColumn**: Glass-effect column with WIP limit indicators, droppable zones, stagger-animated card entry
- **TaskCard**: Enriched card with priority indicators, assignee avatars, label badges, subtask progress, due date chips, selection checkboxes, hover lift, drag overlay effects
- **TaskCardCompact**: Dense single-line view mode for compact boards
- **ColumnHeader**: Accent-dot column headers with WIP limits, task counts, avatar stack, inline add/rename
- **ColumnEmpty**: Line-art illustrated empty states per column type
- **Keyboard navigation**: Arrow keys move focus across cards/columns, Enter opens, Space toggles selection, Escape clears
- **Animation system**: Staggered card/column entrance, hover lift, selection glow pulse, checkbox bounce, context menu scale-in, filter chip cascade, bulk action bar slide
- **Drag & drop**: @dnd-kit integration with cross-column moves, custom drop animation (expressive easing), drag overlay with rotation + shadow

## [0.11.0] - 2026-03-10

### Added
- **Tokens**: `--pink-1000` (#150208) near-black primitive for deep dark mode surfaces

### Changed (BREAKING — dark mode)
- **Dark mode interactive colors**: `--color-interactive` pink-400→pink-500, `--color-interactive-hover` pink-300→pink-600, `--color-interactive-active` pink-200→pink-700, `--color-interactive-subtle` pink-950→pink-1000
- **Dark mode text status colors**: `--color-text-error` red-200→red-300, `--color-text-success` green-200→green-300, `--color-text-warning` yellow-200→yellow-300, `--color-text-link` blue-200→blue-300, `--color-text-brand` pink-300→pink-400

### Fixed
- **Foundations Showcase**: Pink palette now displays 1000 swatch

## [0.10.0] - 2026-03-10

### Added
- **AppSidebar**: Collapsible nav items with `children` array and `NavSubItem` type (S9)
- **AppSidebar**: Nav item `badge` prop for counts/labels, caps at 99+ (S10)
- **AppSidebar**: Nav group `action` prop for buttons next to group labels (S11)
- **AppSidebar**: Structured `footer` prop with `SidebarFooterConfig` — links, version, slot (S12)
- **AppSidebar**: `headerSlot` and `preFooterSlot` content slots (S13)
- **AppSidebar**: `renderItem` escape hatch for custom item rendering (S14)

### Deprecated
- **AppSidebar**: `footerLinks` prop — use `footer.links` instead

## [0.9.2] — 2026-03-10

### Fixed
- **Server components broken (cont.)**: `_chunks/utils.js` (the `cn()` helper — clsx + tailwind-merge) also had `"use client"` injected, breaking server-safe components that import it (PageHeader, StatusBadge, EmptyState, Skeleton, etc.). Added to inject-use-client skip list.

## [0.9.1] — 2026-03-10

### Fixed
- **Server components broken**: `_chunks/vendor.js` had `"use client"` injected, breaking server-safe components (Skeleton, StatusBadge, etc.) that import cva/clsx. Split vendor chunk into `vendor-utils.js` (pure functions, no directive) and `vendor-client.js` (`"use client"`, @floating-ui + react-remove-scroll + transitive deps).

## [0.9.0] — 2026-03-10

### Changed (BREAKING)
- **Build**: All runtime dependencies (`@floating-ui/react-dom`, `aria-hidden`, `react-remove-scroll`, `clsx`, `class-variance-authority`, `tailwind-merge`) are now bundled into the compiled output instead of listed as `dependencies`. Consumers who were importing these packages directly (not through shilp-sutra) must install them separately.
- **Tiptap**: All `@tiptap/*` packages moved from `peerDependencies` to bundled build-time dependencies. Consumers no longer need to install tiptap separately — the RichTextEditor ships as a self-contained bundle. Tiptap code is in a dedicated `_chunks/tiptap.js` chunk (only loaded when importing `composed/rich-text-editor`).

### Fixed
- **React #527**: Eliminated dual React instances in Next.js 15 + pnpm consumers by bundling all runtime deps into `_chunks/vendor.js` and tiptap into `_chunks/tiptap.js`. Only `react`, `react-dom`, and remaining peer dependencies stay external.

### shilp-sutra-karm
- **Build**: All runtime dependencies (`@dnd-kit/*`, `react-markdown`, `date-fns`, `clsx`, `cva`, `tailwind-merge`) bundled into compiled output.

### shilp-sutra-brand
- **Build**: `clsx` and `tailwind-merge` bundled into compiled output.

### Migration
Add to `next.config.js` (required for Next.js + pnpm consumers):
```js
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-karm", "@devalok/shilp-sutra-brand"]
```

## [0.8.4] — 2026-03-10

### Fixed
- **Missing export**: Added `./composed/lib/string-utils` to exports map — fixes `Module not found` when shilp-sutra-karm imports `getInitials`

## [0.8.3] — 2026-03-10

### Fixed
- **Exports map**: Added `"default"` condition fallback to all package exports — fixes Next.js 15 webpack resolution without needing `conditionNames` workarounds
- **Missing export**: Added `./ui/lib/utils` to exports map — fixes `Module not found` when shilp-sutra-karm imports this internal path

### shilp-sutra-karm 0.8.2
- **Exports map**: Added `"default"` condition fallback to all package exports

## [0.8.2] — 2026-03-10

### Fixed
- **Tiptap peer deps**: Tightened from `^2.0.0` to `>=2.27.2 <3.0.0` to prevent consumers from accidentally installing tiptap v3, which has breaking API changes incompatible with the RichTextEditor

## [0.8.0] — 2026-03-09

The **Mega-Audit** release. Comprehensive design system audit fixing 48 issues across accessibility, type safety, security, token consistency, and build correctness.

### Changed (BREAKING)
- **Combobox**: Props now use discriminated union — `multiple: true` requires `value: string[]` and `onValueChange: (value: string[]) => void`; `multiple?: false` requires `value: string` and `onValueChange: (value: string) => void`
- **StatusBadge**: Props now use discriminated union — pass either `status` or `color`, not both

### Added
- **ConversationTab** (karm): `richText` prop for built-in RichTextEditor/Viewer support
- **Semantic token**: `layer-active` for pressed/active states
- **Semantic token**: `text-info` for informational text color
- **Tailwind peer dep**: `tailwindcss ^3.4.0` declared as optional peer dependency
- **useComposedRef** (karm): Utility hook for merging multiple refs

### Fixed
- **RichTextEditor**: Emoji picker now renders above the editor (not clipped by overflow)
- **RichTextEditor**: Link/image URL injection prevented via protocol validation (`http`, `https`, `mailto` only)
- **RichTextEditor**: Escape key in emoji picker no longer closes parent dialogs
- **Input/Textarea**: Now consume FormField context automatically (`aria-describedby`, `aria-invalid`, `aria-required`)
- **NumberInput**: FormField context consumption, `aria-label` fallback, `parseInt` radix parameter
- **ColorInput**: Added `aria-label` to hex color input
- **CommandPalette**: Full ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`)
- **TaskCard** (karm): Keyboard accessible (`role="button"`, `tabIndex`, Enter/Space handling)
- **BoardColumn** (karm): Icon-only buttons now have `aria-label`, keyboard-focusable
- **StreamingText** (karm): Added `aria-live="polite"` for screen readers
- **ChatInput** (karm): Added `aria-label` on textarea
- **FilesTab** (karm): URL protocol validation on download links
- **Markdown renderer** (karm): URL protocol validation on rendered links
- **Stale .js artifacts**: Removed 15 compiled `.js` files shadowing `.tsx` sources in module resolution
- **Typecheck**: All tiptap extensions added as devDependencies for complete type resolution
- **Token consistency**: `text-placeholder` contrast improved (`neutral-400` → `neutral-500`)
- **Badge**: `text-[10px]` → `text-ds-xs` for token consistency
- **Icon sizing**: 7 components migrated from `min-h-6 min-w-6` → `min-h-ds-xs min-w-ds-xs`

### Removed
- **SegmentedControl** re-export from karm (was stale — use core's directly)

---

## [0.7.0] — 2026-03-09

### Added
- **RichTextEditor/Viewer**: Full-featured tiptap-based rich text editing with toolbar, mentions, emoji, image, alignment
- **TopBar**: `userMenuItems` prop for custom dropdown items

### Fixed
- **Audit findings**: Various component fixes from design system audit round 1

---

## [0.6.0] — 2026-03-06

The **Karm Feedback** release. Improves developer experience with Storybook documentation, import guides, and migration helpers.

### Added
- **Storybook package labels**: All 41 karm story files and 2 barrel-isolated core stories now display package name and import path in the docs tab via `parameters.docs.description.component`
- **Import Guide**: New Storybook MDX page ("Guides/Import Paths") documenting barrel imports, barrel-isolated components, per-component RSC imports, and karm sub-path exports
- **shadcn/ui Migration Guide**: New Storybook MDX page ("Guides/Coming from shadcn") mapping shadcn variant names to shilp-sutra's two-axis variant+color system
- **Karm README**: Updated with component inventory, module descriptions, and import paths

### Changed
- **Karm README**: Expanded with full component inventory by module, when-to-use guidance, and Tailwind content configuration

---

## [0.5.0] — 2026-03-06

The **Next.js Compatibility** release. Fixes build failures when integrating with Next.js 15 App Router and pnpm strict mode.

### Changed (BREAKING)
- **EmptyState**: `icon` prop changed from `TablerIcon` (component ref) to `React.ReactNode` — use `icon={<MyIcon />}` instead of `icon={MyIcon}`
- **EmptyState**: Default icon is now the Devalok swadhisthana chakra (inline SVG) instead of Tabler's `IconInbox` — zero external dependencies
- **ui barrel**: `DataTable`, `DataTableToolbar`, and all chart components removed from `@devalok/shilp-sutra/ui` barrel export

### Fixed
- **Next.js build failures**: Importing lightweight components (e.g. `Button`) from the `ui` barrel no longer triggers `Module not found` errors for optional peer deps (`d3-*`, `@tanstack/*`, `@tabler/icons-react`)
- **pnpm strict hoisting**: Consumers no longer need `.npmrc` `public-hoist-pattern` overrides for optional peer deps
- **EmptyState RSC**: Component is now fully React Server Component compatible — no `@tabler/icons-react` dependency, `icon` prop accepts `ReactNode` (serializable across server/client boundary)

### Migration Guide

**EmptyState icon prop:**
```diff
- <EmptyState icon={IconError404} title="Not found" />
+ <EmptyState icon={<IconError404 />} title="Not found" />
```

**DataTable / Charts imports:**
```diff
- import { DataTable } from '@devalok/shilp-sutra/ui'
+ import { DataTable } from '@devalok/shilp-sutra/ui/data-table'

- import { BarChart } from '@devalok/shilp-sutra/ui'
+ import { BarChart } from '@devalok/shilp-sutra/ui/charts'
```

## [0.4.2] — 2026-03-06

The **Consistency Audit** release. Aligns variant naming, event handlers, and export completeness across the entire component library.

### Changed (BREAKING)
- **Chip**: `variant="filled"` → `"subtle"`, `variant="outlined"` → `"outline"`, `onDelete` → `onDismiss`
- **SegmentedControl**: `color` prop renamed to `variant` (values `filled`/`tonal` unchanged)
- **Toast**: `color="default"` → `color="neutral"`
- **Card**: `variant="outlined"` → `variant="outline"`

### Fixed
- **Button/Badge/ButtonGroup**: `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop — CI typecheck was failing
- **Button**: `className` was passed inside `buttonVariants()` (silently dropped by CVA) — now separate `cn()` argument
- **Toggle**: Same `className` fix as Button
- **ProjectCard**: Was passing color values (`success`/`info`/`warning`) to Badge `variant` prop instead of `color`
- **AlertDialogHeader/Footer**: Now wrapped in `React.forwardRef` (matches Dialog/Sheet pattern)
- **TaskDetailPanel**: Ref parameter was discarded as `_ref` — now forwarded to `SheetContent`
- **Switch**: `React.ComponentRef` → `React.ElementRef` for consistency
- **DateRangePicker**: Default `formatStr` changed from `'MMM d'` to `'MMM d, yyyy'` to match DatePicker

### Added
- 11 new Props type exports: `AccordionItemProps`, `AccordionTriggerProps`, `AccordionContentProps`, `RadioGroupProps`, `RadioGroupItemProps`, `ToggleProps`, `ToggleGroupProps`, `ToggleGroupItemProps`, `CollapsibleProps`, `SeparatorProps`, `HoverCardContentProps`
- 4 variant/type exports: `inputVariants`, `cardVariants`, `textareaVariants`, `SpacingToken`
- TreeItem now accepts `className` prop
- Karm barrel: admin types (`UserRole`, `AttendanceStatus`, `DayInfo`, etc.) and 14 utility functions re-exported from package root

---

## [0.3.1] — 2026-03-06

### Fixed
- AlertProps / BannerProps: `Omit<HTMLAttributes, 'color'>` to resolve TypeScript conflict with CVA `color` variant
- Badge dismiss button: added 24px touch target (missed in 0.3.0)

### Added
- Storybook Changelog page with formatted release notes and migration guides

---

## [0.3.0] — 2026-03-06

### Added
- Root `"."` export — `import { Button } from '@devalok/shilp-sutra'` now works
- `main` and `module` fields for legacy bundler compatibility
- Per-component exports: `./ui/charts`, `./ui/tree-view`, `./composed/date-picker`
- `useFormField()` hook for automatic aria-describedby wiring
- `SwitchProps`, `SliderProps` type exports
- Switch `error` prop (matches Checkbox API)
- "use client" directives in karm package
- Inter font (WOFF2) replacing Google Sans
- WebP brand assets alongside PNGs

### Changed (BREAKING)
- **Dependencies**: D3, TipTap, TanStack, @tabler/icons-react, date-fns, input-otp, react-markdown are now optional peer dependencies — install only what you use
- **Fonts**: Google Sans replaced with Inter (licensing). All fonts converted from TTF to WOFF2
- **Button**: `variant="primary"` → `variant="solid"`, `variant="secondary"` → `variant="outline"`, `variant="error"` → `color="error"`
- **Badge**: Single `variant` axis split into `variant` (subtle/solid/outline) + `color` (default/info/success/error/...)
- **Alert/Banner/Toast**: `variant` prop renamed to `color` for semantic intent
- **NumberInput/Combobox/Autocomplete**: `onChange` renamed to `onValueChange`
- **NumberInput/Combobox**: Now extend HTMLAttributes — accept all standard HTML props
- **FormField**: Auto-wires `aria-describedby` via context. `getFormFieldA11y()` removed
- **Karm**: Peer dep tightened to `@devalok/shilp-sutra >=0.3.0`

### Fixed
- Karm hooks path rewrite bug (hooks/ was mapped to /ui instead of /hooks)
- Badge solid variant phantom token `text-on-interactive` → `text-on-color`
- Tailwind preset `screens` moved to `theme.extend` (no longer replaces deployer breakpoints)
- All dismiss/close buttons now meet WCAG 2.5.8 minimum 24px touch target
- Spinner/loader animations respect `prefers-reduced-motion`
- Toast close button now always visible (was hidden until hover)
- DialogHeader/Footer, SheetHeader/Footer now support ref forwarding

---

## [0.2.1] - 2026-03-05

### Fixed
- **Tailwind preset** `require` condition added to `./tailwind` export — Tailwind's CJS config loader can now `require('@devalok/shilp-sutra/tailwind')` without an absolute path workaround

---

## [0.2.0] - 2026-03-05

### Added — Next.js App Router Compatibility
- **`"use client"` directive** injected into all client-only components via post-build script — Server Components can now import shilp-sutra without `TypeError: e.createContext is not a function`
- **Per-component exports** for granular imports: `@devalok/shilp-sutra/ui/text`, `./ui/dialog`, `./composed/page-header`, etc. — enables importing server-safe components without pulling in client code
- **Server-safe components** identified and excluded from `"use client"`: Text, Skeleton, Spinner, Stack, Container, Table, Code, VisuallyHidden (ui); ContentCard, EmptyState, PageHeader, LoadingSkeleton, PageSkeletons, PriorityIndicator, StatusBadge (composed)

### Fixed — Type Resolution
- **`@primitives/*` type references** in published `.d.ts` files rewritten to relative paths — consumers no longer need ambient type stubs for 26 vendored Radix packages

### Added — API Improvements
- **Stack** `direction` prop now accepts `"row"` / `"column"` as aliases for `"horizontal"` / `"vertical"`
- **Stack** `gap` prop now accepts numeric values (e.g., `gap={4}` → `gap-ds-04`) in addition to token strings
- **StatCard** `icon` prop now accepts `React.ComponentType` (e.g., `icon={IconBolt}`) in addition to `ReactNode`

### Fixed — API Consistency
- **Text** `as` prop widened to accept any `React.ElementType` — `<Text as="h1">` no longer causes TypeScript errors
- **SearchInput** `inputSize` prop renamed to `size` to match Input API (HTML `size` attribute is `Omit`-ted)
- **Label** children rendering verified and covered by tests — issue was caused by the `@primitives` type leak, not a runtime bug

### Added — Documentation
- JSDoc module comments on `ui/index.ts`, `composed/index.ts`, `shell/index.ts` listing server-safe components and import patterns

---

## [0.1.1] - 2026-03-05

### Fixed — Critical Runtime Issues
- **BreakAdmin** `useMemo` called after conditional return — Rules of Hooks violation causing runtime crashes when loading state toggles
- **InputOTP** `animate-caret-blink` keyframe added to Tailwind preset — caret animation was silently broken
- **RadarChart** `--color-text-muted` replaced with `fill-text-tertiary` — chart axis labels were invisible
- **CorrectionList** invalid `border-1` class replaced with `border` — mobile borders were silently absent
- **AssociateDetail** `h-[auto]` replaced with `h-full` — vertical divider collapsed to 0px
- **LeaveRequest** fragile synthetic `MouseEvent` construction refactored to optional event parameter

### Fixed — Architecture & Compatibility
- **Shell components** decoupled from Next.js — replaced hard `next/link` import with polymorphic `LinkProvider`/`useLink` context; non-Next consumers get plain `<a>` tags by default
- **Brand logos** `resolveColor('auto')` made reactive to dark mode via `MutationObserver` — logo color now updates when `.dark` class toggles
- **Brand** `cn()` extended to cover all 11 `text-ds-*` sizes (was only 3, causing silent merge failures for larger sizes)
- **AppCommandPalette**, **useCalendar** — added missing `'use client'` directives
- **use-color-mode** — added SSR guard to `resolveMode` preventing server-side crashes
- **RichTextEditor** — added content sync effect so editor updates when `content` prop changes externally
- **useToast** — fixed `@/ui/toast` alias to relative import for consistency

### Fixed — Accessibility
- **Autocomplete** `focus:ring` → `focus-visible:ring` — focus ring no longer shows on mouse click
- **SegmentedControl** `tabIndex={0}` → `tabIndex={-1}` on tablist wrapper — fixes double-focus keyboard navigation bug
- **SegmentedControl** removed `!important` override — resolved specificity by restructuring base CVA classes
- **TopBar** search/AI buttons, **NotificationCenter** bell button, **BreakRequest** close button — added `aria-label` for screen readers
- **TopBar** search/AI/avatar buttons, **BottomNavbar** More button — added `type="button"` to prevent form submission
- **Textarea** — added `aria-invalid` for error state (matching Input pattern)

### Fixed — Token Compliance (60+ instances)
- Replaced raw `h-N`/`w-N` with explicit arbitrary values across Badge, Avatar, Skeleton, PageSkeleton, GlobalLoading, Dividers, SegmentedControl, CommandPalette
- Replaced `h-3 w-3` icon sizes with `h-ico-sm w-ico-sm` on NavigationMenu, CommandPalette, Badge icons
- Replaced `leading-none tracking-tight` → `leading-ds-none tracking-ds-tight` in Card
- Replaced `leading-[150%]` → `leading-ds-relaxed` in Code
- Replaced `opacity-[var(--action-disabled-opacity,0.38)]` → `opacity-action-disabled` in Chip
- Replaced `pl-10 pr-9` and icon offsets with explicit arbitrary values in SearchInput
- Replaced `py-12`/`py-16` with `py-ds-09`/`py-ds-10` in NotificationCenter and EmptyState
- Replaced `text-warning` → `text-text-warning` in TaskCard (dark mode contrast fix)
- Replaced `rounded-3xl` → `rounded-ds-3xl` in AssociateDetail
- Replaced ~300 raw Tailwind classes with design system tokens in story files (99% reduction in violations)

### Fixed — Code Quality
- **Chip** converted from `React.createElement` to JSX syntax
- **Karm chat** deduplicated `markdownComponents` into shared `markdown-components.tsx` module
- **Karm** replaced 5 inline SVGs with Tabler icon components (Chip, AttendanceCTA, EditBreak calendar nav)
- **Karm** wrapped 5 dialog components in `forwardRef` for consistency (DeleteBreak, EditBreak, EditBreakBalance, LeaveRequest, TaskDetailPanel)
- **Karm** `renderAdjustmentType` converted from default to named export
- **BreakAdmin** toast `border: 'None'` → `'none'` (valid CSS), `marginBottom` → token spacing
- **CorrectionList** removed hardcoded `Goutham.png` dev placeholder from published package
- **Data-table** fixed `useEffect` exhaustive-deps with proper dependency array
- **Stack** replaced dynamic `gap-${N}` with static lookup map (Tailwind JIT safety)
- **Module boundary** ESLint rules escalated from `warn` to `error`

### Added
- `LinkProvider` and `useLink` exports from `@devalok/shilp-sutra/shell` for framework-agnostic link injection
- `caret-blink` animation keyframe in Tailwind preset
- `./hooks` public export path for `useToast`, `useColorMode`, `useIsMobile`
- 19 missing semantic tokens exposed in Tailwind preset (letter-spacing, line-height, opacity, focus width)
- Lint scripts added to brand and karm packages

---

### Previous Releases

### Added
- **PaginationNav** compound wrapper with `generatePagination` helper for controlled pagination
- **Skeleton** `shape` variants (text, circular, rectangular) and shimmer animation
- **Progress** `size`, `color`, `indeterminate` variants and optional label slot
- **Avatar** CVA size variants (`xs`–`2xl`) and status indicator badge
- 10 new Storybook stories (Autocomplete, Chip, Container, Stack, Transitions, Stepper, Toaster, DataTableToolbar, MemberPicker, SegmentedControl)
- Storybook play() interaction tests on 10 stories (Combobox, Autocomplete, Accordion, Dialog, Tabs, Select, Chip, Toast, Alert, Stepper)
- Variant exhaustiveness matrices on 7 components (Button, Badge, Alert, Avatar, Progress, Banner, Toggle)
- 20 UI accessibility test suites (Button, Badge, Banner, Breadcrumb, Chip, Code, Link, Toggle, ToggleGroup, Spinner, Combobox, NumberInput, SearchInput, Slider, InputOTP, Pagination, StatCard, Text, Popover, HoverCard)
- 6 Karm unit test suites (LeaveRequest, EditBreak, AttendanceOverview, CorrectionList, DashboardHeader, BreakBalance)
- 10 form component test suites (Select, Textarea, Radio, Switch, SearchInput, NumberInput, Slider, Toggle, Label, Pagination)
- 4 integration test suites (BreakAdmin compound, AdminDashboard composition, ChatPanel sheet, DataTable+Toolbar)
- **Total test coverage**: 114 files, 729 tests

### Fixed
- **Slider** `aria-label` now forwarded to thumb element (was only on root container)
- Disabled state opacity standardised to `opacity-[0.38]` across all components (WCAG AA)
- `displayName` added to 22 components that were missing it
- Phantom CSS variable references replaced with valid semantic tokens
- Hardcoded arbitrary spacing values replaced with `ds-*` tokens
- Pagination link padding uses `ds-*` tokens instead of Tailwind arbitrary values
- Typography semibold weight bug, B1 legacy size, and font scaling consistency

### Changed
- **BreakAdmin** converted to compound component pattern (`BreakAdmin.Root` + sub-components)
- **SegmentedControl** standardised sizes, added icon support, cleaned tokens
- CVA size scales standardised across all variant-bearing components
- 86 hardcoded arbitrary values replaced with semantic design tokens
- Sapta Varna categorical color system added (7 cultural color primitives)
- Badge migrated to semantic + category variants (removed `tag-*` dependency)

### Previous (Phase 0–3)

#### Fixed
- Toast now announces to screen readers (`role="status"`, `aria-live`)
- Input sets `aria-invalid` on error state
- Calendar date cells have aria-labels and keyboard support (Enter + Space)
- Table headers have `scope="col"` for screen reader navigation
- Animations respect `prefers-reduced-motion`
- Z-index violations fixed in leave-request tooltips
- ESLint jsx-a11y rules elevated to error level
- `--color-danger` deprecated in favor of `--color-error`

#### Added
- `prefers-reduced-motion` global CSS rule
- `--color-text-interactive` token for WCAG AA text contrast
- Spacing tokens exposed to Tailwind (`p-ds-05`, `gap-ds-03`, etc.)
- Sizing tokens exposed to Tailwind (`h-ds-md`, `w-ico-lg`, etc.)
- Branded gradient tokens (`bg-gradient-brand`)
- Vitest + React Testing Library test infrastructure
- CI quality gates (typecheck, lint, test, build)
- Custom branded Storybook theme
- CHANGELOG.md
- CONTRIBUTING.md
- Design philosophy manifesto

#### Changed
- CustomButton `type` prop renamed to `variant` (`type` deprecated)
- `DashboardSkeleton` in karm/admin renamed to `AdminDashboardSkeleton`

## [0.1.0] - 2026-02-28

### Added
- Initial release: 114 components across ui/, shared/, layout/, karm/ modules
- 3-tier design token system (primitives, semantic, Tailwind)
- Vendored Radix UI primitives (zero @radix-ui runtime deps)
- Dark mode support via `.dark` class toggle
- Storybook 8.6 with 95 stories
- AdminDashboard compound component pattern
- Import boundary enforcement for module architecture
