# Karm V2 Feature Request — Design Document

**Date:** 2026-03-17
**Source:** `karm-v2/docs/shilp-sutra-feature-request-2026-03-17.md`
**Scope:** 22 items (17 code changes + 5 documentation updates)
**Current versions:** core@0.25.1, karm@0.22.0, brand@0.5.0

---

## Research Findings

Before designing, the entire codebase was audited. Key findings that change assumptions:

| Item | Finding |
|------|---------|
| P1-5 (StatCard onClick/href) | **Already implemented.** `onClick`, `href`, `accent` props exist with hover lift. Docs-only. |
| T2 (Category color tokens) | **Already implemented.** `bg-category-{color}-{3,7,9,11}` utilities exist in Tailwind preset. Docs-only. |
| P1-8c (DataTable density) | **Already implemented.** `density: 'compact' | 'standard' | 'comfortable'`. Docs-only. |
| P1-8d (DataTable selectableFilter) | **Already implemented.** `selectableFilter: (row) => boolean`. Docs-only. |
| T3 (Focus ring utilities) | **Already implemented.** `.focus-ring`, `.focus-ring-inset`, `.focus-ring-sm`. Docs-only. |
| P0-3 (MultiSelect) | **Partially exists.** `MemberPicker` in `composed/` — generalize, don't rebuild. |
| Size token `--size-xs` | Exists as 24px in CSS but not in Tailwind preset. Redefine as 28px. |

---

## Phase 1 — Quick Wins

### P0-1: `size="xs"` Dense Variant

**Token change:** Redefine `--size-xs: 28px` (from 24px — unused). Add `ds-xs` to Tailwind preset height/width/min-height/min-width mappings.

**Font token:** Add `--font-size-xs: 0.75rem` (12px) and `text-ds-xs` to Tailwind preset.

**CVA additions** (5 components):

| Component | xs variant classes |
|-----------|-------------------|
| Input | `h-ds-xs text-ds-xs px-ds-02` |
| SelectTrigger | `h-ds-xs text-ds-xs px-ds-02` |
| SearchInput | `h-ds-xs text-ds-xs pl-ds-07 pr-ds-06` |
| Button | `h-ds-xs rounded-ds-sm px-ds-03 text-ds-xs` |
| Textarea | `min-h-[48px] text-ds-xs px-ds-02 py-ds-02` |

**Button icon sizes:** Add `icon-xs: 'h-ds-xs w-ds-xs rounded-ds-sm'`.

**Icon scaling:** xs size uses `[&>svg]:h-3.5 [&>svg]:w-3.5` (14px icons, down from 16px in sm).

**Industry notes:**
- Linear filter controls: 28px height, 12px text — matches our xs exactly
- GitHub issue filters: 28px with 12px — same
- Notion inline database filters: 26–28px — in range

### T1: ColorSwatch Component

**File:** `packages/core/src/ui/color-swatch.tsx`

```tsx
interface ColorSwatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: string                           // hex, rgb, oklch — any CSS color
  size?: 'sm' | 'md' | 'lg'             // 12px | 16px | 24px
  shape?: 'circle' | 'square' | 'rounded' // circle default
  ring?: boolean                          // show 1px border for light colors
}
```

Renders `<span>` with inline `style={{ backgroundColor: color }}`. Uses `shadow-ring-sm` for the ring to avoid border layout shift. `rounded` shape uses `rounded-ds-sm`.

**Industry notes:**
- Stripe dashboard: small circles for brand colors with subtle ring
- Figma: rounded squares for color swatches in properties panel
- Linear: circles with ring for label colors

### P1-4: StatusDot Component

**File:** `packages/core/src/ui/status-dot.tsx`

```tsx
interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'healthy' | 'warning' | 'critical' | 'neutral' | 'inactive'
  size?: 'sm' | 'md' | 'lg'             // 6px | 8px | 10px
  pulse?: boolean                         // default: true for 'healthy'
  label?: string                          // renders inline text after dot
  labelClassName?: string
}
```

**Color mapping:**
| Status | Dot color | Text color |
|--------|-----------|------------|
| healthy | `bg-success-9` | `text-success-11` |
| warning | `bg-warning-9` | `text-warning-11` |
| critical | `bg-error-9` | `text-error-11` |
| neutral | `bg-neutral-8` | `text-surface-fg-muted` |
| inactive | `bg-neutral-6` | `text-surface-fg-subtle` |

**Pulse:** CSS `@keyframes pulse` with `box-shadow` glow matching dot color. Only `healthy` pulses by default; others pulse when `pulse` explicitly set.

**Industry notes:**
- Railway: pulsing green dot for healthy services — we match this
- Vercel: static dots for deployment status, no pulse on non-healthy — same approach
- GitHub: colored dots on repo language, no pulse — our neutral/inactive match this

### K12: KanbanBoard Completed Column Toggle

**Props added to `BoardProviderProps`:**
```tsx
completedColumnId?: string
showCompleted?: boolean
onToggleCompleted?: (show: boolean) => void
```

**Behavior:**
- When `completedColumnId` is set, that column gets a toggle button in its header
- Toggle button uses `IconEye` / `IconEyeOff` icon
- When `showCompleted=false`, completed column renders collapsed: just header + task count badge
- Animation: MotionResize on column width, MotionPresence on task cards

---

## Phase 2 — Core Composed Components

### P0-2: Card Accent Border

**Approach:** CSS `::before` pseudo-element positioned absolute. This avoids conflicting with the shadow ring layer (which is a `box-shadow`, not a `border`).

**Props added to Card:**
```tsx
accent?: 'left' | 'top' | 'right' | 'bottom'
accentColor?: 'default' | 'secondary' | 'error' | 'success' | 'warning' | 'info'
```

**Implementation:** Accent is a `data-accent` attribute. CSS in Card's CVA base:
```css
[data-accent="left"]::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  background: var(--card-accent-color);
}
```

Color mapping via inline CSS custom property `--card-accent-color`:
| accentColor | Light | Dark |
|-------------|-------|------|
| default | `accent-9` | `accent-9` |
| secondary | `secondary-9` | `secondary-9` |
| error | `error-9` | `error-9` |
| success | `success-9` | `success-9` |
| warning | `warning-9` | `warning-9` |
| info | `info-9` | `info-9` |

Card gets `position: relative; overflow: hidden` added to base CVA when accent is present.

**Industry notes:**
- Material Design 3 "side indicator": 3px absolute-positioned strip — matches our approach
- Notion database colored borders: 3px with rounded corners — same
- Linear priority accent: 2–3px left strip — same

### P0-3: MultiSelectPopover (generalize MemberPicker)

**File:** `packages/core/src/composed/multi-select-popover.tsx`

**Generic item interface:**
```tsx
interface MultiSelectItem {
  id: string
  label: string
  image?: string
  description?: string
  disabled?: boolean
}

interface MultiSelectGroup {
  label: string
  items: MultiSelectItem[]
}
```

**Props:**
```tsx
interface MultiSelectPopoverProps {
  // Data
  items?: MultiSelectItem[]
  groups?: MultiSelectGroup[]
  // State
  value: string[]
  onValueChange: (ids: string[]) => void
  // Search
  searchPlaceholder?: string
  onSearch?: (query: string) => Promise<MultiSelectItem[]>
  searchDebounce?: number                 // default 300ms
  // Rendering
  renderItem?: (item: MultiSelectItem, selected: boolean) => ReactNode
  emptyMessage?: string
  maxSelections?: number
  // Popover
  align?: 'start' | 'center' | 'end'
  width?: string | number
  children: ReactNode                      // trigger element
}
```

**Behavior:**
- Opens Popover with SearchInput at top
- Scrollable list with checkmark indicators (like current MemberPicker)
- Groups rendered with sticky section headers
- Async search: shows Spinner during fetch, debounced
- Selection chips: optional chip row above list showing selected items with dismiss

**MemberPicker backward compat:** Re-export `MemberPicker` wrapping `MultiSelectPopover` with `renderItem` that shows Avatar.

**Industry notes:**
- Linear assignee picker: Popover + search + checkmarks + avatars — our base pattern
- GitHub label picker: search + colored dots + checkmarks — supported via renderItem
- Notion relation picker: search + create-new option — we skip create-new for now (YAGNI)

### P0-4: FilterBar Compound Component

**File:** `packages/core/src/composed/filter-bar.tsx`

**Compound components:**
```tsx
// Container
interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onClearAll?: () => void
  size?: 'xs' | 'sm' | 'md'             // propagated via context
  className?: string
  children: ReactNode
}

// Single-select filter
interface FilterSelectProps {
  label: string                           // shown as placeholder when no selection
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  allLabel?: string                       // label for "all" option, default "All"
}

// Multi-select filter
interface FilterMultiSelectProps {
  label: string
  value: string[]
  onValueChange: (values: string[]) => void
  options: { value: string; label: string }[]
}
```

**Renders:**
```
[🔍 Search...] [Entity Type ▾] [Priority (2) ▾] [× Clear all]
```

Active filter count shown as Badge on each FilterMultiSelect trigger. Clear all button appears only when any filter is active. Size context propagates to SearchInput, Select, and Button children.

**Industry notes:**
- GitHub Issues filter bar: search + quick-filter dropdowns + clear — matches our pattern
- Linear: filter bar with add-filter button — we skip add-filter (our filters are declarative)
- Airtable: filter pills — we support this via FilterMultiSelect count badges

### P1-3: MarkdownViewer

**File:** `packages/core/src/composed/markdown-viewer.tsx`

**Props:**
```tsx
interface MarkdownViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string
  compact?: boolean                       // tighter spacing
  allowHtml?: boolean                     // default false (XSS-safe)
  linkTarget?: string                     // default '_blank'
}
```

**Dependencies:** `react-markdown`, `remark-gfm` (bundled). `react-syntax-highlighter` lazy-loaded for code blocks.

**Token mapping:**
| Element | Token |
|---------|-------|
| Body text | `text-surface-fg` `text-ds-md` |
| Headings | `text-surface-fg` `font-semibold` |
| Code inline | `bg-surface-sunken` `rounded-ds-sm` `text-ds-sm` `font-mono` |
| Code block | `bg-surface-sunken` `rounded-ds-md` `p-ds-04` |
| Blockquote | `border-l-2 border-surface-border-subtle` `pl-ds-04` `text-surface-fg-muted` |
| Links | `text-accent-11` `hover:underline` |
| Table | `border-surface-border-subtle` with zebra `even:bg-surface-sunken` |
| HR | `border-surface-border-subtle` |

`compact` reduces heading sizes by one step, tightens margins from `mb-ds-04` to `mb-ds-02`.

### P1-8a: DataTable Column Alignment

Read `column.columnDef.meta?.align` in header and cell render functions. Apply:
- `'right'`: `text-right tabular-nums`
- `'center'`: `text-center`
- `'left'`: default (no class)

### P1-8b: DataTable `hideBelow` Responsive Columns

Read `column.columnDef.meta?.hideBelow` and apply responsive display class:
- `'sm'`: `hidden sm:table-cell`
- `'md'`: `hidden md:table-cell`
- `'lg'`: `hidden lg:table-cell`

Applied to both `<th>` and `<td>` elements.

---

## Phase 3 — Larger Components

### P1-1: InlineEdit

**File:** `packages/core/src/composed/inline-edit.tsx`

```tsx
interface InlineEditProps {
  value: string
  onSave: (newValue: string) => void | Promise<void>
  placeholder?: string
  variant?: TextVariant                   // Text variant for read mode
  inputSize?: 'xs' | 'sm' | 'md'        // Input size for edit mode
  multiline?: boolean
  readOnly?: boolean
  maxLength?: number
  saving?: boolean                        // shows Spinner
  className?: string
}
```

**State machine:** `idle` → `editing` → `saving` → `idle`
- Idle: renders `<Text>` with `cursor-pointer` hover underline (dashed, subtle)
- Click/Enter: transitions to `<Input>` (or `<Textarea>` if `multiline`), auto-focused, text selected
- Enter (single-line) or Cmd+Enter (multiline): commit → calls `onSave`
- Escape: revert to original value → idle
- Blur: commit (same as Enter)
- If `onSave` returns Promise: show Spinner, disable input until resolved

**Industry notes:**
- Notion: click-anywhere inline edit, no visible edit affordance until hover — we match with dashed underline
- Linear: click-to-edit titles with auto-select — same
- Figma: double-click to edit layer names — we use single-click (more discoverable)

### P1-2: MasterDetail Layout

**File:** `packages/core/src/composed/master-detail.tsx`

```tsx
interface MasterDetailProps {
  selected?: string | null
  onBack?: () => void
  masterWidth?: string                    // default '280px'
  breakpoint?: 'sm' | 'md' | 'lg'       // default 'md'
  className?: string
  children: ReactNode
}
```

**Compound components:** `MasterDetail.List`, `MasterDetail.Detail`, `MasterDetail.ListItem`

**Desktop:** CSS grid `grid-cols-[var(--master-w)_1fr]` with `border-r` separator.
**Mobile:** `MotionPresence` animated swap. List shown when `selected` is null, detail shown when selected. Back button auto-injected in detail header with `onBack` callback.

### P1-6: EmojiPicker

**File:** `packages/core/src/composed/emoji-picker.tsx`

```tsx
interface EmojiPickerProps {
  onSelect: (emoji: { native: string; id: string }) => void
  theme?: 'auto' | 'light' | 'dark'     // default 'auto'
  previewPosition?: 'top' | 'bottom' | 'none'
  skinTonePosition?: 'search' | 'preview' | 'none'
}

interface EmojiPickerPopoverProps extends EmojiPickerProps {
  children: ReactNode                      // trigger element
}
```

**Implementation:** Dynamic import `@emoji-mart/react` + `@emoji-mart/data` on mount. SSR guard: `typeof window !== 'undefined'`. Loading state: `<Skeleton width={352} height={435} />`. Theme: `'auto'` reads `.dark` class from `<html>`.

### P2-3: FormSection

**File:** `packages/core/src/composed/form-section.tsx`

```tsx
interface FormSectionProps {
  title: string
  description?: string
  collapsible?: boolean
  defaultOpen?: boolean                   // default true
  children: ReactNode
  className?: string
}
```

Renders: `<Text variant="heading-sm">` + `<Text variant="body-sm" className="text-surface-fg-muted">` + `<Separator>` + children. When `collapsible`, wraps in `Collapsible` with `CollapsibleTrigger` on the title row.

### P2-4: BulkActionBar (Standalone)

**File:** `packages/core/src/composed/bulk-action-bar.tsx`

```tsx
interface BulkActionBarAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  color?: 'default' | 'error'
  disabled?: boolean
}

interface BulkActionBarProps {
  show: boolean
  count: number
  onClearSelection: () => void
  actions: BulkActionBarAction[]
  className?: string
}
```

Fixed bottom bar, portal-rendered. `MotionPresence` + `MotionSlide direction="up"` for enter/exit. Count badge, action buttons with icons, dismiss button. Karm's board `BulkActionBar` becomes a thin wrapper passing board context into standalone props.

---

## Phase 4 — Complex / Future

### P1-7: FilePreview

**File:** `packages/core/src/composed/file-preview.tsx`

```tsx
interface FilePreviewProps {
  url: string
  type?: 'image' | 'pdf' | 'video' | 'embed' | 'audio'
  mimeType?: string                       // auto-detect type from MIME
  alt?: string
  initialPage?: number                    // PDF starting page
  className?: string
}
```

**Sub-renderers** (each lazy-loaded):
- Image: `react-zoom-pan-pinch` — zoom, pan, reset button, download
- PDF: `react-pdf` — page navigation, zoom, page count
- Video: native `<video>` with controls (drop react-player dep — native is sufficient)
- Audio: native `<audio>` with controls
- Embed: responsive `<iframe>` with loading skeleton, supports Figma/Loom/YouTube URL patterns

### K11: KanbanBoard Mobile View

**Props added:**
```tsx
mobileView?: 'scroll' | 'list'          // default 'scroll'
mobileBreakpoint?: 'sm' | 'md'          // default 'md'
```

`'list'` mode: below breakpoint, renders `MotionStagger` flat list grouped by column. Column headers as sticky section dividers with task count. Each task renders as `TaskCardCompact`.

### K13: ChatPanel Agent Selector Enhancement

**Extended Agent interface:**
```tsx
interface Agent {
  id: string
  name: string
  desc: string
  icon?: ReactNode
  capabilities?: string[]
  status?: 'online' | 'offline' | 'busy'
}
```

Agent selector: upgrade from DropdownMenu to Popover with richer layout. Each agent row shows: icon (or first-letter avatar), name + desc, capability `Chip` tags, `StatusDot`. No search needed (7 agents max).

### P2-1: ResponsiveOverlay

**File:** `packages/core/src/composed/responsive-overlay.tsx`

```tsx
interface ResponsiveOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  breakpoint?: 'sm' | 'md'              // default 'md'
  children: ReactNode
}
```

Uses `useIsMobile()`. Desktop: renders `Dialog`. Mobile: renders `Sheet` (bottom). Shared title/description/children.

### P2-2: ProgressRing

**File:** `packages/core/src/ui/progress-ring.tsx`

```tsx
interface ProgressRingProps {
  value: number
  max?: number                            // default 100
  size?: 'sm' | 'md' | 'lg'             // 32px | 48px | 64px
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
  label?: string
  showValue?: boolean                     // show percentage in center
  strokeWidth?: number                    // default 3
}

interface MultiProgressRingProps {
  rings: { value: number; max?: number; color: string; label?: string }[]
  size?: 'sm' | 'md' | 'lg'
}
```

SVG `<circle>` with `stroke-dasharray` / `stroke-dashoffset` animation via Framer Motion. Track uses `bg-surface-sunken` color. Multi-ring: concentric circles with decreasing radii.

### P2-5: DeadlineIndicator

**File:** `packages/core/src/composed/deadline-indicator.tsx`

```tsx
interface DeadlineIndicatorProps {
  deadline: Date | string
  warningThreshold?: number              // minutes, default 1440 (24h)
  criticalThreshold?: number             // minutes, default 240 (4h)
  format?: 'relative' | 'absolute' | 'countdown'
  showIcon?: boolean
  className?: string
}
```

Computes time remaining, maps to color:
- `> warningThreshold`: `success-11` (green text)
- `warningThreshold...criticalThreshold`: `warning-11` (yellow text)
- `< criticalThreshold`: `error-11` (red text, bold)
- `< 0` (overdue): `error-11` (red, bold, "Overdue by X")

Uses `date-fns/formatDistanceToNow` for relative format. Optional `IconClock` prefix.

---

## Documentation Updates (5 items, no code)

All updates go to `packages/core/llms.txt` and `packages/core/llms-full.txt`:

1. **StatCard onClick/href** — document existing props with examples
2. **DataTable density** — document `density?: 'compact' | 'standard' | 'comfortable'` with height specs
3. **DataTable selectableFilter** — document with example (e.g., only PENDING rows selectable)
4. **Category color tokens** — document `bg-category-{teal|amber|slate|indigo|cyan|orange|emerald}-{3|7|9|11}` etc.
5. **Focus ring utilities** — document `.focus-ring`, `.focus-ring-inset`, `.focus-ring-sm` with usage guidance

---

## Implementation Order

1. Token + preset changes (xs size, font-size-xs)
2. Tiny UI components (ColorSwatch, StatusDot, ProgressRing)
3. Component modifications (Input/Select/Button/Textarea xs, Card accent, DataTable align/hideBelow, StatCard docs)
4. Small composed (FormSection, InlineEdit, BulkActionBar, DeadlineIndicator)
5. Medium composed (MultiSelectPopover, FilterBar, MarkdownViewer, ResponsiveOverlay, MasterDetail)
6. Large composed (EmojiPicker, FilePreview)
7. Karm modifications (KanbanBoard mobile/completed, ChatPanel agent selector)
8. Documentation updates (llms.txt, llms-full.txt)
9. Stories for all new/changed components
10. Version bump + publish
