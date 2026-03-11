# Karm Enhancement Requests — Design Document

**Date:** 2026-03-12
**Source:** `karm-v2/docs/shilp-sutra-enhancement-request.md`
**Scope:** D1 (DataTable gaps), K9 (Scratchpad), F1–F6 (small enhancements)

---

## Implementation Priority

D1 is first — Karm team confirmed they will not migrate until server-side features land.
Migrating to client-only DataTable now means refactoring again when server props ship. Ship D1 first so Karm migrates once.

**Order:**
1. **D1** — DataTable gap fixes (unblocks Karm migration of 14+ tables)
2. **F1, F5, F6** — small prop additions, fast wins
3. **F3** — ActivityFeed composed component
4. **K9** — ScratchpadWidget + SidebarScratchpad
5. **F2** — AiBriefCard

---

## D1. DataTable Gap Fixes

DataTable already exists at `@devalok/shilp-sutra/ui/data-table` with TanStack Table, client-side sorting, pagination, selection, expansion, column visibility, inline editing, virtualization, and CSV export. Karm was unaware of it (barrel-isolated since v0.5.0). The following gaps need to be filled:

### Gaps to Address

| # | Feature | Current State | Change |
|---|---------|--------------|--------|
| 1 | Server-side sort | Client-only, no callback | Add `onSort?: (key: string, dir: 'asc' \| 'desc' \| false) => void`. When provided, pass `manualSorting: true` to TanStack. |
| 2 | Empty state slot | `noResultsText: string` only | Add `emptyState?: ReactNode`. When provided, render it instead of the plain text fallback. |
| 3 | Loading state | None | Add `loading?: boolean`. When true, render shimmer rows (Skeleton components matching column count and density). |
| 4 | Controlled selection | Internal-only rowSelection state | Add `selectedIds?: Set<string>` for controlled mode. Add `selectableFilter?: (row: TData) => boolean` wired to TanStack's per-row `enableRowSelection`. |
| 5 | Server-side pagination | Client-only auto-slicing | Add `pagination?: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }`. When provided, pass `manualPagination: true`, `pageCount` derived from total/pageSize. |
| 6 | Single-expand mode | Always multi-expand | Add `singleExpand?: boolean` (default false). When true, `onExpandedChange` collapses previously open row. |
| 7 | Bulk action bar | None | Add `bulkActions?: BulkAction[]` where `BulkAction = { label: string; onClick: (selectedRows: TData[]) => void; color?: 'default' \| 'error'; disabled?: boolean }`. Renders fixed bottom bar when rows selected. |
| 8 | Sticky header | None | Add `stickyHeader?: boolean`. Applies `sticky top-0 z-10 bg-ds-surface` to `<TableHeader>`. |
| 9 | Row click | None | Add `onRowClick?: (row: TData) => void`. Applied to `<TableRow>` with `cursor-pointer` class. Excludes clicks originating from interactive elements (checkboxes, buttons, links). |

### Non-changes

- `compact` density already exists — Karm can pass `defaultDensity="compact"` for h-9 rows.
- Custom cell renderers already work via TanStack's `cell` property.
- Column visibility toggle already works via `toolbar={true}`.
- F4 (StatCard interactions) already shipped — `onClick` and `href` props exist.

---

## K9. ScratchpadWidget + SidebarScratchpad

**Package:** `@devalok/shilp-sutra-karm/dashboard`

### ScratchpadWidget (dashboard card)

Full CRUD dashboard widget. Callback-driven, no internal fetch logic.

```tsx
interface ScratchpadItem {
  id: string
  text: string
  done: boolean
}

interface ScratchpadWidgetProps {
  items: ScratchpadItem[]
  maxItems?: number                          // default 5, shows "X/N" badge
  onToggle: (id: string, done: boolean) => void
  onAdd: (text: string) => void
  onDelete: (id: string) => void
  onReorder?: (items: ScratchpadItem[]) => void  // drag-to-reorder
  title?: string                             // default "My Scratchpad"
  resetLabel?: string                        // footer hint, e.g. "Resets Monday"
  emptyText?: string                         // empty state prompt
  emptyIcon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  className?: string
}
```

**Design details (inspired by Todoist, Linear, Things 3, Apple Reminders):**
- Card with `variant="outline"`, compact padding
- Header: title + circular progress ring badge (X/N, like Apple Activity rings)
- Items: Checkbox + text + delete icon (opacity-0 → opacity-100 on hover)
- Completed items: strikethrough animation (line draws across text, 200ms ease)
- Add flow: click "+ Add a task..." ghost row → inline Input + "Add" button, Enter to submit, Escape to cancel
- Drag-to-reorder: grip handle on left, reorder via pointer events (no library dep — simple swap logic)
- All-done state: subtle confetti burst (CSS keyframe, no JS library)
- Keyboard: Tab to add field, Enter to add, Escape to cancel

### SidebarScratchpad (compact)

Toggle-only, collapsible, for sidebar `preFooterSlot`.

```tsx
interface SidebarScratchpadProps {
  items: ScratchpadItem[]
  onToggle: (id: string, done: boolean) => void
  defaultOpen?: boolean                      // default true
  badgeCount?: number                        // unfinished count
  className?: string
}
```

**Design details:**
- Collapsible header with chevron rotation (180deg)
- Smaller checkboxes (h-3.5 w-3.5), text-xs
- No add/delete — toggle only
- Smooth height animation on collapse/expand
- Badge: muted pill next to title when collapsed, shows unfinished count

---

## F1. AppSidebar `preFooterClassName`

**Package:** `@devalok/shilp-sutra` (core/shell)

Add `preFooterClassName?: string` to `AppSidebarProps`. Applied to the `<div>` wrapping `preFooterSlot`. Consumers can pass `"overflow-y-auto max-h-[200px]"` or any other class.

More flexible than a boolean — lets consumers control exact scroll behavior, max height, padding, etc.

---

## F2. AiBriefCard (karm/dashboard)

**Package:** `@devalok/shilp-sutra-karm/dashboard`

```tsx
interface AiBriefCardProps {
  brief: string[] | null
  generatedAt?: Date | string
  onRefresh?: () => void
  loading?: boolean
  unavailable?: boolean
  collapsible?: boolean                      // default true
  defaultCollapsed?: boolean                 // default false
  title?: string                             // default "Daily Brief"
  className?: string
}
```

**Design details:**
- Card with sparkle icon in header
- Brief items rendered as markdown (bold/italic only, sanitized)
- Relative timestamp in footer ("Generated 23 min ago") via `Intl.RelativeTimeFormat`
- Refresh button: rotate animation on icon while loading
- Collapsible with smooth height transition
- Unavailable state: muted text "AI brief unavailable"
- Loading state: 3 skeleton lines with staggered pulse

---

## F3. ActivityFeed (core/composed)

**Package:** `@devalok/shilp-sutra` (core/composed)

```tsx
interface ActivityItem {
  id: string
  actor?: { name: string; image?: string }
  action: string | ReactNode
  timestamp: Date | string
  icon?: ReactNode
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
  detail?: ReactNode
}

interface ActivityFeedProps {
  items: ActivityItem[]
  onLoadMore?: () => void
  loading?: boolean
  hasMore?: boolean
  emptyState?: ReactNode
  compact?: boolean
  maxInitialItems?: number
  className?: string
}
```

**Design details:**
- Vertical timeline: 1px line (`border-ds-default`) with colored dots (8px circles)
- Each entry: optional avatar (16px) + action text + relative timestamp (right-aligned, muted)
- Dot colors map to `color` prop via semantic tokens
- Expandable detail: click entry to expand, smooth height transition
- Compact mode: smaller gaps (gap-1 vs gap-3), no avatars, smaller text
- Load more: ghost button at bottom of timeline, centered
- Loading: 3 skeleton entries with pulsing dots and lines
- Empty state: renders `emptyState` prop or default "No activity yet"

---

## F5. BottomNavbar Badge

**Package:** `@devalok/shilp-sutra` (core/shell)

Add `badge?: number` to `BottomNavItem` interface.

**Rendering:**
- `undefined` or `0`: no badge
- `1–99`: red circle with white count, positioned top-right of icon
- `>99`: shows "99+"
- Size: `h-4 min-w-4 text-[10px]`
- Color: `bg-ds-error text-ds-on-error`
- Animation: scale-in on mount

---

## F6. EmptyState `iconSize`

**Package:** `@devalok/shilp-sutra` (core/composed)

Add `iconSize?: 'sm' | 'md' | 'lg'` to `EmptyStateProps`. Default `'md'`.

| Size | Pixels |
|------|--------|
| sm | 24px |
| md | 40px (current default) |
| lg | 56px |

Applied as `width`/`height` style when `icon` is `ComponentType`. When `icon` is `ReactNode`, wraps in a sized container.

---

## Out of Scope

- **F4 (StatCard interactions)**: Already shipped — `onClick` and `href` props exist.
- **D1 column definition shape**: Maps directly to TanStack's `ColumnDef<T>`. No wrapper type needed.
