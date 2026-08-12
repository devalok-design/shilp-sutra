---
"@devalok/shilp-sutra": minor
---

**Test coverage:** closes the gaps tracked in #268 — added missing unit tests for `Diff`, `DataTableCards`, `DataTableBulkActions`, `DataTablePagination`, `DataTableHeader`, `DataTableBody`/inline cell editing, `BlockShell`, and expanded shallow coverage for `Sidebar` (collapsed state, `toggleSidebar`, keyboard shortcut, rail, mobile `Sheet`), `NotificationPreferences` (add/delete/mute callbacks, loading/empty states), `GlobalLoading` (loading-state transitions), `useViewportHeight` (SSR fallback, Visual Viewport resize, window-resize fallback, cleanup), and the `DatePicker`/`DateRangePicker`/`DateTimePicker` family (keyboard nav, `minDate`/`maxDate`, clearing).

**New features (all additive, non-breaking):**

- `BulkAction.icon?: IconInput` — renders an icon before the label in `DataTable`'s bulk-action buttons.
- `DataTable`'s bulk-actions bar now supports `bulkActionsPosition?: 'bottom' | 'top' | 'inline'` (default `'bottom'`, matching prior behavior) instead of hard-coded fixed positioning.
- `DateSeparator` gained `locale?: string` and `timeZone?: string` props — the default "Today"/"Yesterday"/date label now supports non-`en-US` locales and IANA time zones instead of always using the browser's local time zone and English month names.
- `Diff` gained a `language?: string` prop for line-level syntax highlighting (inline/split, `line` granularity), lazy-loading `react-syntax-highlighter` with the same one-dark theme as `MarkdownViewer`.
- `Diff` gained `beforeParseError?: (raw: string) => ReactNode` and `afterParseError?: (raw: string) => ReactNode` slot props, letting callers customize the fallback shown when `before`/`after` fails to parse as JSON in `fields` mode (previously a single fixed message covered both sides).
- New hook `useContainerSize()` — a `ResizeObserver`-based hook returning `{ ref, width, height }` for element-level responsive components.

**DataTable:** verified (via new tests) that `rowClassName` and `filterableColumns` — added in a prior changeset — actually work in `mobileView="card"`, and that `onExport` receives the currently visible (filtered) rows rather than the full data set.
