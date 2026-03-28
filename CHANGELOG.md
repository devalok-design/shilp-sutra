# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes (karm)

- **TaskPanel v3 is now the default export** — The v2 tab-based TaskPanel is available as `TaskPanelV2`. V3 uses a unified scrollable layout with composable wings.
- **`clientMode` type changed** — From `boolean` to `false | 'VIEW_ONLY' | 'COLLABORATOR'`. Passing `true` auto-normalizes to `'VIEW_ONLY'`.

### Added (karm — TaskPanel v3)

- **Files section** — Upload, download, delete files with GDrive link support. Collapsible section with drag-and-drop.
- **Start date + Phase picker** — Two new property cells in the properties wing.
- **Overdue styling** — Due dates show relative text ("3d overdue", "Due tomorrow") with red treatment.
- **Creator attribution** — Shows "Created by X" with AI/Client badges.
- **Task actions menu** — Copy link, copy reference, duplicate, delete via "..." dropdown.
- **Project breadcrumb** — Shows "ProjectName > KRM-847" in header.
- **Prev/next navigation** — Up/down buttons + J/K keyboard shortcuts.
- **Keyboard shortcuts** — S/A/P/D/E/C/Escape for property pickers and actions.
- **Bandwidth indicators** — Red/amber dots on overloaded/elevated assignees.
- **Leave indicators** — "On leave" label on leads/assignees.
- **TaskPanelSheetWrapper** — Convenience wrapper owning Sheet + loading state.
- **Client COLLABORATOR mode** — Clients with COLLABORATOR access can edit priority, due date, description, and post messages.

## [0.29.0] - 2026-03-26 (core)

### Breaking Changes

- **Warning color remapped from yellow to amber-bright** — `warning-*` tokens now use a warm amber (OKLCH hue 65-70, L=0.78 at step 9) instead of yellow (hue 85, L=0.55). The old yellow produced a muddy olive at mid-lightness with insufficient contrast for both light and dark text. `warning-fg` is now hardcoded dark in both themes. Existing `--amber-*` category colors are untouched — only the `warning-*` semantic tokens changed.
- **Button `startIcon`/`endIcon` now require `<Icon>` wrapper** — Pass `<Icon icon={IconPlus} />` instead of raw `<IconPlus />`. Mechanical find-and-replace migration.
- **Badge rewritten** — `variant="secondary"`, `variant="destructive"`, `color="brand"` removed. Use `variant="subtle"`, `variant="solid" color="error"`, `color="accent"`.
- **Chip deprecated** — Use `<Badge onClick={...}>` instead. Chip wrapper maps `label` prop to children for backward compat.

### Added

- **Badge `variant="soft"`** — Borderless tinted background for the lightest treatment.
- **Badge `color="custom"`** — Arbitrary colors via `--badge-color` CSS variable.
- **Badge interactive states** — `onClick`, `selected`, `disabled` props.
- **Badge `startIcon` / `endIcon`** — Leading/trailing content slots.
- **Badge `maxWidth`** — Truncation with ellipsis for long text.
- **Badge `circle`** — Equal width/height for single-character count badges.
- **Badge `asChild`** — Render as link, button, or any element.
- **Badge.Indicator** — Notification overlay with count, dot, animated transitions.
- **Badge.Group** — Overflow handling with "+N" indicator.
- **Button `variant="soft"`** — Tinted/muted background variant. The workhorse for secondary actions, status pills, and subtle controls. Available in all 5 colors.
- **Button `color` axis expanded** — `accent` (renamed from `default`), `error` (existing), `success` (new), `warning` (new), `neutral` (new). 25 variant×color combinations.
- **Button `shape="pill"`** — Applies `rounded-full` for chip/tag/pill-shaped buttons.
- **Button `size="compact-*"`** — `compact-xs`, `compact-sm`, `compact-md` — padding-only height for dense UI (menus, property editors).
- **Button `weight="normal"`** — Opt out of default `font-semibold` for menu items and subtle controls.
- **Status color steps 2, 4, 5, 10** — Added to error, success, warning, info scales for soft variant hover/active states.
- **Amber-bright primitive scale** — `--amber-bright-*` tokens in primitives.css for warning semantic use.
- **Shadow tokens** — `shadow-raised-inner`, `shadow-pressed`, `shadow-success`, `shadow-error`, `shadow-warning`.
- **Button active state polish** — `brightness(0.92) saturate(1.1)` on press, `disabled:saturate(0.3)`.
- **Button icon treatment** — `pointer-events-none` on icon wrappers, per-size gap scaling.
- **ButtonGroup** propagates `weight` and `shape` via context.
- **`<Icon>` component** — Context-aware wrapper for Tabler icons with standardized sizing (xs/sm/md/lg/xl/2xl), stroke weights (light/regular/bold), accessibility (aria-hidden by default, opt-in label), and animation presets (spin/pulse/bounce). Reads size from Button/IconGroup context automatically.
- **`<IconProvider>`** — Provides size and stroke defaults to a subtree of Icon components. Button and IconGroup auto-provide this context. (`IconContext` is the raw React context for advanced escape-hatch reads.)
- **`<IconGroup>`** — Flex row container for icon groups (toolbars, action rows) with gap presets (tight/default/loose) and optional `role="toolbar"`.
- **Icon animation: state machine** — `<Icon state="loading" />` shows Spinner, transitions to success/error with choreographed animation. Delegates to existing Spinner component.
- **Spinner bare-mode fix** — Spinner arc now uses `currentColor` in bare variant (was hardcoded accent-9). Loading spinners inside colored buttons now match the button's text color.
- **Input v2** — Container-level focus ring wraps the entire input + icons as one unit.
- **`startSection` / `endSection`** — Replace `startIcon`/`endIcon`. Accept any ReactNode (icons, buttons, text, spinners).
- **`startSectionClickable` / `endSectionClickable`** — Opt-in pointer-events for interactive sections (clear buttons, toggles).
- **`wrapperClassName`** — Style the wrapper div independently from the input element.
- **Per-size section scaling** — Section width = input height - 2px (square). Icons auto-size via IconProvider.
- **Chat primitives** — New `ui/chat` module with 7 components:
  - `MessageList` — Scroll container with auto-scroll, "N new messages" pill, load-more trigger, ARIA log role
  - `Message` — Compound component (Message.Avatar, Message.Content, Message.Author, Message.Body, Message.EditableBody, Message.Actions, Message.Action, Message.Reactions)
  - `SystemMessage` — Styled system/info messages
  - `MessageInput` — Auto-resizing textarea with send/stop buttons
  - `DateSeparator` — Date divider between message groups
  - `UnreadSeparator` — "New messages" line marker
  - `TypingIndicator` — Animated dots for typing state
- **Switch `size` prop** — `sm`, `md` (default), `lg` variants
- **Switch `color` prop** — `accent` (default), `success`, `warning` for checked state
- **Switch `thumbIcon` prop** — Render content inside the switch thumb
- **StatusBadge `in-progress` + `review` statuses** — New built-in status variants
- **StatusBadge clickable** — `onClick` prop renders as button with auto chevron-down icon
- **AvatarGroup `indicator`** — `lead` (warning dot) or `admin` (accent dot) overlay on individual avatars
- **Progress `autoColor`** — Automatically shifts color by value: default → warning (60%) → success (85%) → error (100%+)
- **ActivityFeed `renderItem`** — Custom render function for individual feed items; return `undefined` to fall back to default
- **Accordion `chevronPosition`** — `left` or `right` (default) placement of the expand/collapse chevron
- **DevalokGrain `tint` prop** — Control gradient tint color on the grain texture
- **DevalokGrain animations** — Entrance animations on the grain effect
- **Button `processing` state** — Marching ants SVG border while content stays visible. Speeds: `'ambient'` (3s), `'working'` (2s), `'urgent'` (1s). `processingColor` overrides animation color. `processingDisabled` (default: true) disables button during processing. Auto-activates during `onClickAsync` loading phase. Forces soft variant so ants pop against the background.
- **Icon `animate="draw"`** — SVG path-draw animation for check/X icons (progressive stroke via `pathLength`). Works with IconCheck, IconX, and CircleCheck; other icons fall back to static render. Respects `prefers-reduced-motion`.
- **Input `startSectionType` / `endSectionType`** — Explicit control over section display: `'icon'` (fixed-width centered cell) or `'label'` (tinted background with border separator). Auto-inferred from content type (strings default to `'label'`, React elements to `'icon'`). Flexbox-based section layout.

### Fixed

- **AvatarGroup** — Restored `rounded-full` on wrapper divs for circular rings
- **Progress autoColor** — Background-color transitions now animate smoothly
- **DevalokGrain** — No gradient without tint (was showing dark smudge on light surfaces)
- **DevalokGrain** — Subtle opacity bumped (solid: 0.15 to 0.20, soft: 0.12 to 0.15) for more visible texture. Gradient restored for untinted surfaces.
- **Chat primitives** — Spacing and typography token fixes across MessageList, Message, and MessageInput (no API changes)
- **DataTable controlled selection** — Fixed infinite re-render loop when using `selectedIds` with inline `getRowId` callback. The `onSelectionChange` effect now uses a ref for `getRowId` to avoid re-firing on every render.
- **Button rules-of-hooks** — Moved `useRef`/`useEffect` hooks before the `asChild` early return to comply with React's rules of hooks.

### Deprecated

- **Button `variant="default"`** — Use `variant="solid"` instead.
- **Button `variant="destructive"`** — Use `variant="solid" color="error"` instead.
- **Button `color="default"`** — Use `color="accent"` instead.
- **`startIcon` / `endIcon`** on Input — Use `startSection`/`endSection` instead. Old props still work as aliases.
- **`inputVariants`** — Use `inputWrapperVariants` (semantics changed: now targets wrapper, not input).

## [0.28.0] - 2026-03-21 (core) / [0.24.1] - 2026-03-21 (karm)

### Added (core) — ColorInput v2

- **ColorInput redesigned** with `react-colorful` interactive picker (2.8KB bundled). Popover trigger pattern replaces inline native picker.
- **Two trigger variants:** `default` (gradient swatch → hex text) and `inline` (entire trigger IS the color, contrast-aware text).
- **Multi-format inputs:** HEX / RGB / HSL format switcher with animated sliding pill indicator.
- **Preset swatches:** 10 named colors by default (color-blind accessible labels). Customizable via `presets` prop — accepts `{ hex, label }[]`, `string[]`, or `false`.
- **Reset / Undo:** Footer appears when color changes. Undo steps back through discrete changes; Reset reverts to color when popover opened.
- **Animations:** Smooth color transitions on triggers, staggered preset entrance, animated format swap, bouncy swatch interactions.
- **Accessibility:** `id`/`htmlFor` on all format inputs, ARIA labels on triggers and swatches, RGB clamped 0-255, HSL clamped 0-360/0-100.
- New props: `variant`, `showPicker`, `defaultFormat`, `align`.

### Fixed (core)

- **MultiSelectPopover** — Middle-click scrolling now works inside the dropdown list. Set `modal={false}` on the Popover root — Radix's `RemoveScroll` was blocking scroll events in modal mode.

### Changed (core) — Build

- **react-colorful** added to `vendor-client` manualChunks bucket (SSR-safe, predictable chunk name).

### Fixed (karm)

- **KanbanBoard DnD animation** — Removed `MotionStagger` from interactive column task lists. Cards no longer re-animate their entrance on every drag-and-drop state update. ReadOnly columns keep stagger (appropriate for static lists).

## [0.27.2] - 2026-03-21 (core)

### Fixed (core)

- **MultiSelectPopover** — `maxSelections: 1` now replaces the selection instead of blocking it. Previously, clicking a new item when at max did nothing; now it swaps the oldest selection for the new one. Fixes "can't reassign task lead" in Karm.
- **TopBar.UserMenu** — Long email addresses now truncate instead of overflowing the 200px dropdown.

### Added (core)

- **Test coverage** — 27 new test files, 174 new tests (152 → 179 files, 1300 → 1474 tests). Covers alert-dialog, aspect-ratio, collapsible, context-menu, data-table-toolbar, menubar, navigation-menu, sidebar, toaster, visually-hidden, activity-feed, avatar-group, bulk-action-bar, command-palette, confirm-dialog, content-card, emoji-picker, empty-state, file-preview, loading-skeleton, member-picker, page-header, page-skeletons, priority-indicator, rich-text-editor, schedule-view, use-toast.
- **ColorInput story** — Storybook coverage for color picker component.

## [0.24.0] - 2026-03-21 (karm)

### Added (karm)

- **KanbanBoard `readOnly` mode** — New `readOnly` prop disables DnD, column management, task selection, add buttons, and toolbar. Ideal for status overviews and dashboard views. Task card click (`onClickTask`) still works.
- **ReadOnlyBoardColumn** — Lightweight column component without DnD hooks. Exported for custom layouts.
- **TaskCardStatic / TaskCardCompactStatic** — Card components without sortable hooks for use outside DnD contexts.
- **`onAddTask` context prop** — New `onAddTask?: (columnId: string) => void` callback on BoardProvider. The "Add a task" button in empty columns now works when this is provided.

### Fixed (karm)

- **ColumnEmpty "Add a task" button** — Was inert because `onAddTask` was never passed from BoardColumn. Now wired through context. Button is conditionally hidden when no handler is provided.
- **KanbanBoard DnD snap-back** — Dragged cards now stay in the dropped column immediately (optimistic local state update) instead of snapping back and waiting for consumer to update `initialData`.

## [0.6.0] - 2026-03-18 (brand)

### Breaking Changes (brand) — Favicon API Simplified

- **`getDevalokFaviconPath`** and **`getKarmFaviconPath`** no longer accept `color` or `size` params. New signature: `{ format?, name? }`.
- **`generateDevalokFavicon`** and **`generateKarmFavicon`** no longer accept options. They return a fixed modern minimal favicon set.

**Migration:**
```ts
// Before
getDevalokFaviconPath({ color: 'brand', size: 32, format: 'png' })
generateDevalokFavicon({ color: 'brand' })

// After
getDevalokFaviconPath({ format: 'png', name: 'icon-512' })
generateDevalokFavicon()
```

### Changed (brand)

- **Logo assets resized** from 10K+ originals to 512/1024 grid (longest edge, aspect ratio preserved). PNG + WebP for all raster-complex types.
- **SVGs removed** for raster-complex Devalok logo types (monogram, monogram-shell, monogram-shell-wordmark, monogram-coin-wordmark, shloka) — these were 3-20 MB vector files with embedded bitmaps.
- **Modern minimal favicon set** adopted: 5 files per brand (Devalok: favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png; Karm: 4 files, no SVG).
- **Package size reduced** from ~39 MB to ~7 MB.

### Added (brand)

- **Asset validation pre-publish gate** (`validate-assets.mjs`) — verifies all expected logo and favicon files exist with correct naming and reasonable file sizes before publish.
- **Asset audit Storybook stories** — visual grid of all logo variants and favicon files for manual review.

## [0.27.1] - 2026-03-18 (core)

### Fixed (core)

- **Sonner SSR crash** (issue #21): `useState(document.hidden)` in Sonner's `useIsDocumentHidden` hook crashes during Next.js SSR. Post-build script now patches to `useState(typeof document !== "undefined" ? document.hidden : false)`. Karm can remove the `ssr: false` workaround on Toaster import.

## [0.27.0] - 2026-03-18 (core)

### Breaking Changes (core) — Externalized Dependencies

The following dependencies are no longer bundled. Consumers using FilePreview or MarkdownViewer must install them:

- `react-pdf` — Required for FilePreview PDF rendering. Add as direct dependency.
- `react-zoom-pan-pinch` — Required for FilePreview image zoom. Add as direct dependency.
- `react-syntax-highlighter` — Required for MarkdownViewer code blocks. Add as direct dependency.

These are declared as optional `peerDependencies`. Consumers who don't use FilePreview or MarkdownViewer are unaffected.

**Migration:** `pnpm add react-pdf react-zoom-pan-pinch react-syntax-highlighter`

### Fixed (core) — SSR Safety

- **DOMMatrix crash** (issue #21): Tailwind preset imported from `vendor-utils.js`, a 3.1MB catch-all chunk containing react-pdf/pdfjs-dist code with module-scope `new DOMMatrix()`. This crashed every Next.js production build. Fixed by externalizing browser-only deps and replacing the manualChunks catch-all with an explicit allowlist. vendor-utils.js: 3.1MB → 80KB.
- **Tailwind preset isolation**: Preset now imports `tailwindcss/plugin` directly (external) instead of from vendor-utils. No more transitive DOMMatrix dependency.
- **Sonner chunk isolation**: Sonner (toast library, 42KB) split into its own chunk. Consumers using Dialog/Popover no longer pay for toast infrastructure they don't use.
- **SSR smoke test**: New hard publish gate — imports all 128 entry points in Node.js and verifies no module-scope browser API crashes. Integrated into pre-publish-audit.mjs.

### Changed (core) — Build Pipeline

- **manualChunks allowlist**: Replaced catch-all `return 'vendor-utils'` with explicit allowlist for clsx/cva/tailwind-merge. Unknown deps get isolated auto-named chunks instead of joining a toxic mega-chunk.
- **esbuild CJS conversion**: Replaced hand-rolled regex ESM→CJS transpiler with esbuild for the Tailwind preset. Handles all import/export patterns robustly.
- **SERVER_SAFE validation**: inject-use-client.mjs now warns if a SERVER_SAFE chunk entry doesn't exist in dist (catches stale entries after Rollup changes).

### Removed (core)

- `@react-pdf/renderer` removed from devDependencies (was never imported by any source file).

## [0.26.0] - 2026-03-17 (core) / [0.23.0] - 2026-03-17 (karm)

### Added (core) — 15 New Components

**3 UI primitives:**
- **ColorSwatch** — Dynamic runtime color display. Props: `color` (any CSS string), `size`, `shape`, `ring`, `copyable` (click-to-copy with tooltip), `checkerboard` (transparency pattern). Import: `ui/color-swatch`.
- **StatusDot** — Semantic health/presence indicator. Props: `status` (healthy|warning|critical|neutral|inactive), `size`, `pulse`, `label`, `variant` (filled|ring). Auto `aria-label`, `role="status"`. Import: `ui/status-dot`.
- **ProgressRing** / **MultiProgressRing** — Circular SVG progress with animated number counter (synced spring). Props: `value`, `max`, `size`, `color`, `showValue`. Multi-ring for Activity Ring style. Import: `ui/progress-ring`.

**11 composed components:**
- **MultiSelectPopover** — Generic multi-select with search, checkmarks, groups, async search, keyboard navigation (↑↓ + Enter), `aria-activedescendant`. Generalizes MemberPicker (backward-compat wrapper retained). Import: `composed/multi-select-popover`.
- **FilterBar** — Compound component: `FilterBar` + `FilterSelect` + `FilterMultiSelect`. Size context propagation (xs|sm|md), active filter count badges with bounce animation. Import: `composed/filter-bar`.
- **InlineEdit** — contentEditable click-to-edit (Notion-style, no input swap). Auto-select on focus, Enter saves, Escape reverts, plain-text paste, pencil icon hover affordance, async save with spinner. Import: `composed/inline-edit`.
- **FormSection** — Titled form sections with optional collapsible (spring-animated chevron). Import: `composed/form-section`.
- **BulkActionBar** — Portal-rendered floating bottom bar for multi-select. Inline confirmation for destructive actions, "Select all N" link, AnimatePresence enter/exit. Import: `composed/bulk-action-bar`.
- **DeadlineIndicator** — SLA countdown with color transitions (green→yellow→red→overdue pulse). Tooltip with absolute datetime on hover. Auto-refresh interval (default 60s). Import: `composed/deadline-indicator`.
- **MasterDetail** — Responsive list+detail layout. Desktop: CSS grid with configurable width. Mobile: stacked with animated swap + back button. ARIA listbox/option, arrow key navigation, `emptyState` prop. Import: `composed/master-detail`.
- **ResponsiveOverlay** — Dialog on desktop, bottom Sheet on mobile. Shared title/description/children. Import: `composed/responsive-overlay`.
- **MarkdownViewer** — react-markdown + remark-gfm with DS tokens. Lazy-loaded syntax highlighting (one-dark), copy button on code blocks, anchor links on headings. Import: `composed/markdown-viewer`.
- **EmojiPicker** / **EmojiPickerPopover** — Lazy-loaded emoji-mart with auto dark mode detection, AnimatePresence crossfade. Import: `composed/emoji-picker`.
- **FilePreview** — Professional multi-format previewer:
  - Image: react-zoom-pan-pinch (0.1x–8x), double-click toggle, live zoom %, fullscreen (F key), floating glass toolbar
  - PDF: react-pdf with page nav (buttons + direct input + ← → keyboard), page crossfade
  - Video: custom branded player — center play overlay, auto-hiding controls, progress bar with scrub handle, playback speed (0.5x–2x), keyboard (Space/K/J/L/M/F/</>)
  - Audio: Spotify-style mini-player — full-width progress bar with hover time tooltip, scrub handle, custom volume slider (pointer-capture, expand-on-hover)
  - Embed: 16:9, YouTube/Vimeo/Figma/Loom auto-conversion, 15s timeout
  - All types: error fallback with download link, file info bar (name + size badge), `onError` callback
  - Custom `VolumeControl` component: pointer-capture drag, dark/light variants, expand-on-hover
  - Import: `composed/file-preview`

### Added (core) — Component Enhancements

- **Input, SelectTrigger, SearchInput, Button, Textarea**: New `size="xs"` dense variant — 28px height (h-ds-xs-plus), 12px text (text-ds-sm). For compact filter bars and dense UI. Button also gets `icon-xs` (28×28).
- **Card**: New `accent` prop (left|top|right|bottom) with `accentColor` (6 semantic colors + any CSS color string) and `accentWidth` (2|3|4|6px). Implemented as absolute-positioned span, no border/shadow conflict.
- **DataTable**: Column `meta: { align: 'right' }` auto-applies `text-right tabular-nums`. Column `meta: { hideBelow: 'md' }` for responsive column hiding. TypeScript module augmentation for ColumnMeta.
- **Button**: Error/destructive variants now properly darken on hover/active (error-9 → error-10). Previously no visual hover feedback.

### Added (karm) — Board & Chat Enhancements

- **KanbanBoard**: `completedColumnId` + `showCompleted` + `onToggleCompleted` for completed column toggle with eye/eye-off icon. `mobileView` ('scroll'|'list') + `mobileBreakpoint` for mobile-optimized grouped list rendering.
- **ChatPanel**: Agent interface extended with optional `icon`, `capabilities[]`, `status` fields. Agent selector shows richer cards with avatar, capability chips, status dot. Fully backward-compatible.

### Fixed (core)

- **SSR crash** (issue #21): `vendor-client.js` had unguarded `if (!document)` from bundled react-remove-scroll, crashing every Next.js page that imports Toaster. Post-build script now patches to `typeof document === "undefined"`. Karm workaround (`next/dynamic` with `ssr: false`) no longer needed.
- **Button error hover**: Solid error/destructive buttons had identical rest and hover states (both bg-error-9). Now properly transition to bg-error-10 on hover/active.
- **Tailwind JIT**: Card accent width classes used dynamic template literals that Tailwind couldn't detect. Replaced with static lookup maps.

### Added (core) — New Dependencies (bundled)

- `react-pdf` — PDF rendering in FilePreview
- `react-zoom-pan-pinch` — Image pan/zoom in FilePreview
- `react-syntax-highlighter` — Code block highlighting in MarkdownViewer

## [0.25.1] - 2026-03-17 (core)

### Fixed (core)

- **Sidebar SSR crash**: Guard `document.cookie` access with `typeof document !== 'undefined'` check. Fixes `ReferenceError: document is not defined` during Next.js SSR on pages that import the sidebar.

## [0.25.0] - 2026-03-17 (core) / [0.22.0] - 2026-03-17 (karm)

### Added (core) — AI Command System

New `@devalok/shilp-sutra/ai` entry point with a composable AI command system:

- **CommandBar** — Unified command interface with three variants:
  - `hero`: Full-featured inline bar with greeting, rotating placeholders, clickable hint chips, animated gradient border during processing
  - `inline`: Compact bar for embedding in panels/cards
  - `floating`: Modal overlay (Dialog-based) with global keybinding support
  - Supports both command-palette filtering (`groups` prop) AND AI natural-language submission (`onSubmit`) — enter selects command match, falls back to AI; Cmd+Enter always submits to AI
- **BlockRenderer** — JSON-to-component mapper for structured AI responses. 9 built-in block types, custom block registry (via props or `AICommandProvider` context), stagger entry animations, graceful fallback for unknown types.
- **AIConversation** — Multi-turn conversation thread with user commands and assistant block responses. Breathing dots + Perplexity-style step visualization for processing states. Intelligent auto-scroll via IntersectionObserver with "New response" pill.
- **AICommandProvider** — Optional React context for shared block registry, onAction handler, and agent info. Components work standalone via props or auto-wire via context.
- **DevadootIcon** — Animated Devalok chakra icon with gradient-driven state animations: idle (pink↔rose color breathing), processing (pink→purple→magenta gradient sweep + glow), responded (bright flash + pop), error (red + shake).
- **Built-in block types:** `text` (react-markdown + remark-gfm), `table` (lightweight sortable BlockTable with badge/number column variants), `confirm` (button pair + expandable rationale), `success` (Alert + undo countdown ring), `error` (Alert + suggestion), `info` (Alert), `loading` (skeleton bars or step visualization), `divider` (animated Separator), `stat_row` (horizontal StatCards with stagger).
- **Confidence indicators** — Blocks with `confidence: 'low'` render with a warning left border.
- **New motion presets:** `springs.responsive` (AI blocks), `tweens.elegant` (greeting/hints).
- **Shared keybinding utility** — `ui/lib/keybinding.ts` with `matchesKeybinding()`, `getIsMac()`, `getModifierDisplay()`. CommandPalette refactored to use shared utility (no public API change).
- **New dependency:** `remark-gfm` (optional peer dep, for GFM markdown in text blocks).

### Added (karm) — AI Domain Blocks

New `@devalok/shilp-sutra-karm/ai-blocks` entry point:

- **MemberDiffBlock** — Shows members being added/removed from projects with action badges
- **MemberListBlock** — Compact member list with avatars, roles, and status
- **ProjectListBlock** — Project list with status badges and member counts
- **AnnouncementPreviewBlock** — Styled announcement card preview
- **karmBlockRegistry** — Pre-configured registry mapping for use with `BlockRenderer`

## [0.24.0] - 2026-03-17 (core)

### Added (core)

- **CommandPalette — controlled/uncontrolled open state**: New `open`, `defaultOpen`, `onOpenChange` props following the standard Radix pattern used by Dialog, Sheet, and Popover.
- **CommandPalette — customizable keybinding**: New `keybinding` prop accepts `string | string[] | false`. `'mod'` maps to Meta on macOS, Ctrl elsewhere. Pass `false` to disable the global shortcut entirely.
- **CommandPalette — ReactNode labels and descriptions**: `CommandItem.label` and `CommandItem.description` now accept `string | ReactNode`. When using ReactNode labels, provide `filterValue` for search filtering. New `renderLabel?: (query: string) => ReactNode` enables match highlighting.
- **CommandPalette — configurable max-height**: New `maxHeight` prop (CSS value or number, default `'320px'`).
- **CommandPalette — custom empty state**: New `emptyState?: ReactNode` overrides `emptyMessage` with a full custom empty view.
- **CommandPalette — custom footer hints**: New `footerHints?: FooterHint[] | false` replaces the hardcoded footer. Pass `false` to hide entirely.
- **CommandPalette — reduced-motion support**: Animations now respect `MotionProvider`'s reduced-motion setting (duration: 0 when active).
- **CommandPalette — platform-aware modifier keys**: Shortcut badges display "⌘" on macOS and "Ctrl" on Windows/Linux. Shortcut strings are parsed into individual keycap badges.
- **CommandPalette — `FooterHint` type export**: `{ keys: string, label: string }`.
- **AppCommandPalette — consumer-owned routing**: When `onSearchResultSelect` is provided, the component no longer calls `onNavigate` with a hardcoded internal route. The consumer owns routing entirely. Legacy fallback behavior preserved when `onSearchResultSelect` is absent.
- **AppCommandPalette — grouped search results**: New `searchResultGroups?: SearchResultGroup[]` prop renders results in multiple labeled sections (e.g., Tasks, Projects, People). Takes precedence over flat `searchResults`.
- **AppCommandPalette — extended SearchResult type**: New optional fields `icon?: ReactNode` (overrides entity-type icon), `rank?: number` (results sorted by descending rank), `shortcut?: string` (keyboard hint badge).
- **AppCommandPalette — configurable search label**: New `searchResultsLabel?: string | ((count: number) => string)` overrides "Search Results" / "Searching..." group label.
- **AppCommandPalette — pass-through props**: `open`, `defaultOpen`, `onOpenChange`, `keybinding`, `maxHeight`, `emptyState`, `footerHints` all pass through to the underlying CommandPalette.
- **New type exports**: `SearchResultGroup` from shell barrel, `FooterHint` from composed barrel.

## [0.23.0] - 2026-03-16 (core) / [0.21.0] - 2026-03-16 (karm)

### Breaking (core + karm) — Surface & Shadow Token Overhaul

**Migration guide:** `docs/migration/surface-shadow-migration.md`

- **All surface tokens renamed to semantic names:**
  - `bg-surface-1` → `bg-surface-base` (page bg) or `bg-surface-overlay` (floating) or `bg-surface-sunken` (shell chrome)
  - `bg-surface-2` → `bg-surface-raised` (cards, widgets, panels)
  - `bg-surface-3` → `bg-surface-raised-hover` (hover states)
  - `bg-surface-4` → `bg-surface-raised-active` (pressed states)
  - Deprecated Tailwind aliases (`bg-surface-1` through `bg-surface-4`) still work but will be removed in a future major
- **All shadow tokens renamed to semantic names:**
  - `shadow-01` → `shadow-raised`, `shadow-02` → `shadow-raised-hover`, `shadow-03` → `shadow-floating`, `shadow-04` → `shadow-overlay`
  - `shadow-05` removed (unused)
  - Deprecated aliases (`shadow-01` through `shadow-04`) still work
- **Shadow values changed:** Multi-layer tinted shadows (4-6 layers with border-ring, cool blue tint at oklch 0.15 0.015 260). Shadows look softer and more natural. Dark mode uses 2.5x strength multiplier.
- **Light-mode surface swap (Stripe/Linear pattern):** Page background is now slightly grey (`neutral-2`, 0.97L), cards/panels are white (`neutral-1`, 0.99L). Dark mode unchanged.
- **Shell chrome uses `surface-sunken`:** Sidebar and topbar backgrounds are now brand-tinted recessed surfaces with `shadow-raised` for elevation.

### Added (core)

- **New surface tokens:** `surface-base`, `surface-sunken`, `surface-raised`, `surface-overlay`, `surface-raised-hover`, `surface-raised-active`, `surface-inverted`, `surface-inverted-fg`, `surface-disabled`, `surface-fg-disabled`
- **New shadow tokens:** `shadow-raised`, `shadow-raised-hover`, `shadow-floating`, `shadow-overlay`, `shadow-glow` (selection), `shadow-inset` (deboss), `shadow-ring` (focus), `shadow-ring-sm` (separator)
- **New border token:** `border-surface-border-subtle` (hairline dividers, neutral-4)
- **New backdrop token:** `--color-backdrop` with light/dark variants
- **New shadow infrastructure:** `--shadow-color` (tinted blue), `--shadow-strength` (dark mode multiplier), `--shadow-transition` (consistent animation)
- **New surface primitive:** `--color-surface-0` in primitives.css (brand-tinted sunken, oklch 0.945 0.008 360)
- **Shadow transition utility:** Components with hover shadows now use `transition-shadow duration-fast-02 ease-productive-standard`

### Fixed (karm)

- **SSR vendor bundle crash:** Split karm's single `vendor.js` into `vendor-markdown`, `vendor-dnd`, and `vendor-utils`. `decode-named-character-reference` (via react-markdown) was calling `document.createElement` at module scope, crashing Next.js SSR error boundaries. 192 occurrences, 14 affected users.
- **Task card surfaces:** Cards on kanban boards now use `surface-raised` (white) on `surface-sunken` columns (grey) for clear visual hierarchy in both light and dark modes.
- **Board column WIP border clipping:** Replaced `ring-1 ring-error-7` with `border-error-7` to prevent content clipping at rounded corners when WIP limit is exceeded.

### Changed (core)

- **Pre-publish audit rewritten:** Now checks for deprecated surface/shadow class names instead of the old SURFACE1_ALLOWLIST approach. Catches regressions where old numeric tokens are used.
- **FoundationsShowcase updated:** Shadow and surface token demos show new semantic names.

## [0.22.3] - 2026-03-16 (core)

### Fixed (core)
- **AvatarFallback text scales with avatar size**: Fallback initials now auto-scale via `AvatarSizeContext` — `xs` gets `text-[9px]`, `sm` gets `text-ds-xs`, up to `xl` at `text-ds-lg`. Previously, all sizes used the inherited (too-large) font size.
- **AvatarGroup `renderAvatar` wrapper no longer clips content**: The wrapper div was applying `overflow-hidden`, border, and explicit size classes that clipped the consumer's Avatar (badge, status dot, ring would get cut off). Wrapper is now positioning-only (overlap, z-index, spotlight). Consumers should pass `size` directly to their Avatar instead of using `className="h-full w-full"`.
- **AvatarGroup removed redundant text-size classes**: Text sizing in `avatarSizeVariants` removed — Avatar handles font scaling internally via size context.

## [0.22.0] - 2026-03-15 (core) / [0.20.3] - 2026-03-15 (karm)

### Added (core)
- **Multi-layered shadows**: All 5 shadow tokens (`shadow-01` through `shadow-05`) now use 3-layer stacks (contact + main + ambient) for realistic depth. Dark mode uses heavier opacities. Drop-in replacement — same token names, richer output.
- **Heading letter-spacing tightened**: `heading-2xl` and `heading-xl` tracking changed from `-0.02em` to `-0.025em`, `heading-sm` from `-0.02em` to `-0.015em` for editorial quality at large sizes.
- **Focus-ring Tailwind utilities**: `.focus-ring`, `.focus-ring-inset`, `.focus-ring-sm` — consistent keyboard focus styling via Tailwind plugin. Replaces 30+ hardcoded ring class patterns.
- **Tabular-nums utility**: `tabular-nums` font-variant-numeric class for aligned numbers in tables, pagination, metrics.
- **Separator `variant` prop**: New variants `"gradient"` (fades both edges), `"gradient-left"` (fades left), `"gradient-right"` (fades right). Default unchanged.
- **Checkbox path-draw animation**: Checkmark now draws its stroke progressively (like Spinner success) instead of scale-bounce. Indeterminate dash also draws in.
- **Tooltip auto-provider**: `<Tooltip>` now auto-wraps with `<TooltipProvider>` when no ancestor provider exists. No more "tooltip doesn't appear" issues.
- **Foundations Storybook page**: New `Foundations/Tokens` stories showcasing shadow scale, typography scale, focus ring utilities, and separator variants.

### Changed (core — visual, non-breaking)
- **Motion tween alignment**: `tweens.fade` duration `0.15s` → `0.11s` (matches `duration-fast-02`), `tweens.colorShift` `0.1s` → `0.07s` (matches `duration-fast-01`).
- **All CSS transitions now use `ease-productive-standard`**: Standardized easing across ~50 components. No more Tailwind default easing.
- **No more `transition-all`**: Replaced with specific property lists everywhere for GPU performance.
- **Button active scale**: `0.97` → `0.95` (snappier press feedback).
- **Card interactive hover**: `y: -2` → `y: -3` (more noticeable lift).
- **Card outline variant**: `border-2` → `border` (lighter visual weight).
- **CardTitle tracking**: `tracking-ds-tight` → `tracking-normal`.
- **Accordion trigger hover**: `hover:underline` → `hover:bg-surface-2` (surface highlight instead of underline), plus `data-[state=open]:bg-surface-2`.
- **Alert body text**: `opacity-[0.9]` → `text-surface-fg-muted` (semantic token instead of arbitrary opacity).
- **Link underline**: Static underline → `decoration-transparent hover:decoration-current` (animates in on hover).
- **Badge/Chip dismiss buttons**: Removed aggressive `rotate-90`/`scale-110`. Now uses `text-current/60 hover:text-current hover:bg-current/10` (color-aware, respects parent background).
- **Banner hover**: `bg-black/10`/`dark:bg-white/10` → `bg-current/10` (respects banner color in both modes).
- **Sidebar spatial transitions**: `ease-linear` → `ease-productive-exit` (natural motion for width/position changes).

### Added (core — component polish)
- **Hover states added**: Checkbox (unchecked), Radio, Switch (unchecked track), Select items, Dropdown Menu items (was completely missing), Combobox trigger open state.
- **Active/pressed feedback**: Dialog close, Sheet close, Alert dismiss, Pagination links, NumberInput steppers, Toast action button.
- **Transitions added**: Toggle state, Badge base, Label opacity, Breadcrumb links, all form inputs, all composed/shell components.
- **Animations**: SearchInput clear button (AnimatePresence fade+scale), FormHelperText (motion.p fade+slide), Tabs content (fade on switch), Radio indicator (springs.bouncy scale-in), Switch thumb (whileTap compress), ActivityFeed items (stagger), NotificationCenter items (stagger), EmptyState text (delayed entrance), StatusBadge morph (scale), PriorityIndicator URGENT (pulse), ScheduleView now-indicator (pulse), BottomNavbar more menu (slide-up), AvatarGroup hover (scale+shadow), CommandPalette kbd (embossed inset shadow), LoadingSkeleton rows (staggered delay).
- **Slider**: `hover:shadow-02` on thumb, `active:scale-[1.15]` (was 1.25).
- **Skeleton shimmer sync**: `background-attachment: fixed` so all skeletons shimmer together.
- **Code**: Block border strengthened, inline gets subtle border.
- **Chip**: Focus-visible ring on clickable chips. Softer tap scale (0.97).
- **Breadcrumb**: Current page `font-medium`, gap widened to `gap-ds-03`.
- **Pagination/Progress**: `tabular-nums` on numeric displays.

### Fixed (core)
- **Avatar fallback ignores `shape` prop**: Fallback always rendered `rounded-ds-full` regardless of `shape="square"` or `shape="rounded"`. Now uses `AvatarShapeContext` to inherit the correct shape.
- **Checkbox uncontrolled state broken**: Clicking an uncontrolled checkbox never showed the checkmark. `checked` from props was `undefined`, so `isActive` was always `false`. Now tracks internal state.
- **Tooltip content empty**: `motion.div` was self-closing (`/>`), so children never rendered. Fixed by destructuring and passing `{children}` explicitly.
- **Tooltip invisible in dark mode**: `text-accent-fg` resolves to same light value as `bg-surface-fg` in dark mode. Changed to `text-surface-1` (always opposite of surface-fg).
- **Button ghost/outline hover not fading**: `transition-transform` in base overrode `transition-colors` from variant. Combined into single `transition-[color,background-color,border-color,box-shadow,transform]`.
- **`disabled:cursor-not-allowed`** added to Button base (was missing).

### Changed (karm — visual, non-breaking)
- **Board**: TaskCard drag handle/checkbox opacity transitions smoothed. WIP-exceeded columns get `ring-1 ring-error-7`. ColumnHeader button transitions standardized.
- **Admin tables**: All rows get `transition-colors duration-fast-01 hover:bg-surface-3` consistently.
- **Chat**: ConversationList action button opacity transitions smoothed.
- **Dashboard**: WeekHeatmap day cells get `hover:ring-1 hover:ring-accent-7`. DailyBrief chevron eased.
- **Client**: ProjectCard gets `hover:scale-[1.01]` alongside shadow lift.
- **Tasks**: TaskDetailPanel tab content gets fade animation via AnimatePresence.
- **All karm transitions**: Standardized to `ease-productive-standard`, no `transition-all`.

## [0.21.0] - 2026-03-15 (core) / [0.20.2] - 2026-03-15 (karm)

### Changed (core — soft breaking)
- **AvatarFallback colors now deterministic**: Fallback backgrounds are computed from a name hash into 8 categorical colors (accent, success, warning, error, info, purple, pink, teal) instead of always `bg-accent-2`. Consumers relying on the exact `bg-accent-2 text-accent-11` classes on fallbacks will see different colors. Use `className` to override if needed.
- **AvatarGroup border default**: `border-surface-1` → `border-surface-2`. Use `borderColor="surface-1"` to restore old behavior.
- **Avatar/AvatarGroup status dot ring**: `ring-surface-1` → `ring-surface-2` (surface layering consistency).

### Added (core)
- **Avatar `ring` prop** — Role ring: `lead` (accent), `admin` (warning), `client` (info). Ring adapts to avatar shape. Uses `ring-offset-2 ring-offset-surface-2`.
- **Avatar `badge` prop** — Badge overlay: `number` (count, truncates to 99+), `"dot"` (red indicator), or custom `ReactNode`. Animated entrance with `MotionPop`. Has `role="status"` + `aria-label` for accessibility.
- **Avatar `loading` prop** — Skeleton shimmer (`animate-pulse bg-surface-3`) at correct size/shape. Forwards ref.
- **AvatarFallback `colorSeed` prop** — Override the hash seed for stable colors across name changes (e.g., pass user ID).
- **Avatar animated online presence** — `status="online"` dot pulses subtly (opacity 1→0.75→1, 2.5s cycle).
- **Avatar image crossfade** — `scale: 0.96→1` + `springs.smooth` for polished image load.
- **AvatarFallback letter-spacing** — Single-char gets `tracking-wide`, two-char gets `tracking-normal`.
- **AvatarGroup hover expand** — GPU-composited `translateX` animation (zero layout thrashing). Hovered avatar lifts (`scale-105`), others dim (`opacity-85`).
- **AvatarGroup `expandDirection`** — `'right'` (default) or `'left'` for right-aligned groups (e.g., task cards).
- **AvatarGroup `expandAmount`** — `'compact'` (subtle peek, 50%), `'default'` (full spread), `'wide'` (extra room, 150%).
- **AvatarGroup `xs` and `xl` sizes** — Full parity with Avatar's 5 sizes.
- **AvatarGroup `onOverflowClick`** — Makes "+N" badge a clickable button.
- **AvatarGroup `renderAvatar` prop** — Custom render function per avatar for full control (badges, status, rings).
- **AvatarGroup `borderColor` prop** — Explicit `"surface-1" | "surface-2"` control.
- **AvatarUser `ring` field** — Role rings visible in group stacks.
- **AvatarGroup deterministic fallback colors** — Default fallbacks now use `colorSeed={user.name}`.

### Fixed (core)
- **Tooltip content was empty** — `motion.div` was self-closing, children never rendered. Every tooltip in the DS showed an empty white pill. Fixed by passing children through to the motion wrapper.
- **Tooltip requires manual TooltipProvider** — Consumers who didn't wrap their app in `<TooltipProvider>` got no tooltips. Tooltip now auto-provides one when no ancestor provider is detected.
- **AvatarImage competing for layout** — The image wrapper span was in flow layout beside the Fallback, pushing it off-center. Fixed with `absolute inset-0`.

### Fixed (karm)
- **Surface cascade fixes**: `hover:bg-surface-2` → `hover:bg-surface-3` on conversation-list, subtask-item, file-item, calendar (all sit inside surface-2 containers).
- **WeekHeatmap root**: Added `bg-surface-2` card shell.

---

## [0.20.1] - 2026-03-15

### Fixed (core + karm)
- **Surface token layering**: `bg-surface-1` was used on cards, widgets, and panels that sit on the page. These now correctly use `bg-surface-2`. Affected: Card (default + elevated variants), StatCard, ContentCard, loading skeletons, page skeletons, ErrorBoundary, ScheduleView, RichTextEditor container, AttendanceCTA, DailyBrief, TaskDetailPanel, SubtaskAddForm, ReviewCard, AdminDashboard, BreakRequest, AssociateDetail, ChatPanel, ChatInput, ProjectCard, PageSkeletons. Hover/active states cascaded accordingly (surface-3/surface-4). Overlays, dialogs, popovers, shell chrome, and sticky headers remain on `surface-1` (correct).

---

## [0.20.0] - 2026-03-15

### Added (core)
- **ActivityFeed `groupBy="time"`** — Auto-buckets items into Today, Yesterday, Earlier This Week, Older with customizable labels via `groupLabels` prop. Centered divider headers with scoped timeline lines per group. Exported `groupItemsByTime` utility.
- **Banner `actions` prop** — New plural slot for multiple action elements with mobile-friendly `flex-wrap`. Contextual hover colors (`bg-black/10`) replace generic grey. `action` (singular) deprecated but still works.

### Added (karm)
- **Scratchpad composable system** — 9 reusable primitives (`Scratchpad.Root`, `.Header`, `.List`, `.Item`, `.AddInput`, `.EmptyState`, `.ProgressRing`, `.FilterToggle`, `.Collapse`) via React context. New features: inline editing (double-click), promote-to-task, filter completed toggle, drag-to-reorder (@dnd-kit). `ScratchpadWidget` and `SidebarScratchpad` refactored as backward-compatible prebuilt arrangements.
- **SidebarScratchpad upgraded** — Now feature-rich with add, delete, edit, promote, reorder, ProgressRing (no count label), and FilterToggle. Text bumped to `text-ds-sm` for readability.
- **WeekHeatmap** — 7-day completion strip with composable API (Root, DayStrip, Summary, ProgressBar, Streak). Day status colors (success/warning/error/info/surface), WAI-ARIA grid keyboard navigation (arrow keys, Home/End), tooltips, streak indicator.
- **TaskActionRow** — Composable task row (Root, Checkbox, Priority, Title, Labels, ProjectBadge, DueDate, StatusBadge, Navigate) + props shorthand. Hover-reveal actions with accent/error color tints, keyboard activation, separator control.
- **ProjectHealthCard** — Props-driven card with monotone cubic sparkline (catmull-rom, gradient fill, end dot), status badge severity (urgent > overdue > on track), loading skeleton.

### Fixed (karm)
- **7 pre-existing test failures** resolved: AnimatePresence assertions, DailyBrief timestamp casing, TaskDetailPanel a11y (replaced `<h2 role="button">` with nested `<button>`), AssociateDetail a11y (fixed role nesting).

---

## [0.19.1] - 2026-03-14

### Fixed (core)
- **Dialog / AlertDialog not centered**: Framer Motion sets `transform: none` inline after animation completes, overriding Tailwind `translate-x-[-50%] translate-y-[-50%]` centering. Centering now uses Framer Motion's `x`/`y` properties so it's preserved. Affects Dialog, AlertDialog, ConfirmDialog since v0.18.0.
- **Chip tap feedback broken**: `active:scale-95` CSS class was overridden by Framer Motion's layout transform management. Replaced with `whileTap={{ scale: 0.95 }}`.

---

## [0.19.0] - 2026-03-14

### BREAKING (core)
- **TopBar rewritten as composition API**. Old props-based API removed (`pageTitle`, `onSearchClick`, `onAiChatClick`, `notificationSlot`, `mobileLogo`). Use `TopBar.Left`, `TopBar.Right`, `TopBar.Section`, `TopBar.IconButton`, `TopBar.Title`, `TopBar.UserMenu` subcomponents instead.
- **Border tokens softened**: `surface-border` shifted from neutral-6→5 (light) / neutral-4→3 (dark). `surface-border-strong` shifted from neutral-7→6 (light) / neutral-5→4 (dark).

### Changed (core)
- **Shell chrome elevated**: Sidebar, TopBar, and BottomNavbar backgrounds changed from `bg-surface-1` to `bg-surface-2`. Interactive states bumped one level.

### Added (core)
- **TopBar.Left / TopBar.Center / TopBar.Right** — zone components for flexible layout
- **TopBar.Section** — groups items with `gap` prop (`tight` | `default` | `loose`)
- **TopBar.IconButton** — reusable circular icon button with tooltip
- **TopBar.Title** — responsive page title (hidden on mobile)
- **TopBar.UserMenu** — extracted user dropdown as standalone subcomponent
- Auto grid/flex layout: 3-column CSS grid when `TopBar.Center` is present, flex otherwise

---

## karm@0.19.0 - 2026-03-14

### BREAKING (karm)
- **TaskDetailPanel rewritten as composition API (`TaskPanel`)**. Old monolith with ~20 props removed. Use `TaskPanel.Header`, `TaskPanel.Title`, `TaskPanel.Properties`, `TaskPanel.Property`, `TaskPanel.Tabs`, `TaskPanel.Tab`, `TaskPanel.Loading` subcomponents.
- **Container-agnostic**: TaskPanel no longer wraps itself in a Sheet. Consumer wraps in Sheet, Dialog, page div, etc.
- **Priority picker**: Colored dots replaced with per-level icons (IconAlertTriangle, IconArrowUp, IconMinus, IconArrowDown)
- **Date picker**: Native `<input type="date">` replaced with Popover + presets (Today, Tomorrow, Next Monday, +7d, +14d, Clear)
- **Visibility control**: Toggle button replaced with dropdown picker (IconLock Internal / IconWorld Everyone)
- **Label editor**: Now supports `availableLabels` for autocomplete + optional color per label
- All monolith callback props removed — data flows to individual picker/tab subcomponents

### Added (karm)
- **7 standalone property pickers**: `TaskColumnPicker`, `TaskPriorityPicker`, `TaskMemberPicker`, `TaskAssigneePicker`, `TaskDatePicker`, `TaskLabelEditor`, `TaskVisibilityPicker`
- **16 composable tab pieces**: `SubtaskProgress`, `SubtaskList`, `SubtaskItem`, `SubtaskAddForm`, `MessageList`, `MessageBubble`, `MessageInput`, `VisibilityWarning`, `FileDropZone`, `FileList`, `FileItem`, `ReviewCard`, `ReviewResponseForm`, `ReviewRequestButton`, `ActivityTimeline`, `ActivityEntry`
- **Centralized types**: `task-types.ts` with `Member`, `Column`, `Priority`, `Visibility`, `Subtask`, `ReviewRequest`, `Comment`, `TaskFile`, `AuditLogEntry`, `LabelOption`
- Pre-assembled tab defaults (SubtasksTab, ConversationTab, etc.) still work as one-liners
- `ReviewTab` gains `readOnly` prop
- 8 integration stories demonstrating composition patterns

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
