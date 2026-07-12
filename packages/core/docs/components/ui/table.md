# Table

- Import: @devalok/shilp-sutra/ui/table
- Server-safe: Yes
- Category: ui

## Props
    density: "compact" | "standard" (default) | "comfortable" — sets --table-py (4 / 8 / 12px vertical cell padding → rows ≈ 29 / 37 / 45px); header height tracks it
    striped: boolean (opt-in zebra — even body rows get the faintest surface step; hairline separators remain the default row cue)

### TableCell / TableHead
    numeric: boolean (right-align + tabular figures; header follows the column. Identifier-numbers — dates, phones, IDs — stay left)

### TableRowActions
    persist: boolean (always show instead of hover/focus reveal)
    Reveal is opacity-based: buttons stay in the tab order permanently, appear on row hover AND :focus-within, and are always visible on touch (pointer-coarse). Give the column a visually-hidden header.

### TableRowLink (separate import: ui/table-row-link — client component)
    href: string (required)
    stretch: boolean (default: true)
    A real anchor placed in the row's primary cell (`<TableCell className="relative">`), stretched across the row via a pseudo-element — cmd/ctrl+click, middle-click, and context menu work, unlike onClick-on-row. Keyboard focus draws a row-level ring. Other interactive elements in the row need `className="relative z-[1]"`. `stretch={false}` = title-only link (keeps row text selectable).

## Compound Components
    Table (root <table>)
      TableHeader (<thead>)
        TableRow (<tr>)
          TableHead (<th>)
      TableBody (<tbody>)
        TableRow (<tr>)
          TableCell (<td>)
      TableFooter (<tfoot>)
      TableCaption (<caption>)

## Example
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Project Alpha</TableCell>
      <TableCell><Badge color="success">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Composability
- **Server-safe pure HTML wrappers** — Table and sub-components are thin semantic wrappers around `<table>`, `<thead>`, `<tbody>`, etc. No state, no context. Safe in RSC trees.
- **Table vs DataTable:** Table is presentational — you control every row, cell, header. DataTable (from `ui/data-table`) is feature-rich — sorting, filtering, pagination, selection, virtualization built in. Pick by whether you need that machinery.
- **Use cases for bare Table:** Static data displays, marketing comparison tables, documentation tables, small lists where DataTable would be overkill.
- **Composes with UI primitives inside cells:** Badge for status pills, Avatar for user cells, IconButton for row actions, StatusDot for state indicators. All server-safe if the table is server-rendered.
- **TableCaption** renders as HTML `<caption>` — useful for a summary description that screen readers announce before the table content.

## Cell recipes

**Density → content mapping.** Rows grow silently when cell content is taller than the text line; pick content size by density:

| Density | Row target | Avatar | Badge | Notes |
|---|---|---|---|---|
| compact | ~29px | none — text only | `xs` | identity = text, no chrome |
| standard | ~37px | `xs` (24px) | `xs` | **single-line** identity only; an `sm` avatar grows rows to ~49px — don't |
| comfortable | ~45px | `xs` or `sm` | `xs`/`sm` | the only density for **two-line** identity (name + email) — industry rule (Carbon): two-line content belongs in the tallest rows only |

Rule of thumb (matches Carbon/Setproduct): avatar ≈ row height − 16px of breathing room.

**User cell** (avatar + two-line identity, both lines truncate — use `density="comfortable"`):
```jsx
<TableCell>
  <div className="flex items-center gap-ds-03 min-w-0">
    <Avatar size="xs"><AvatarFallback>GK</AvatarFallback></Avatar>
    <div className="min-w-0 leading-ds-tight">
      <TruncatedText as="p" className="font-medium">Goutham Krishnan</TruncatedText>
      <TruncatedText as="p" mode="middle" className="text-ds-sm text-surface-fg-muted">goutham@devalok.in</TruncatedText>
    </div>
  </div>
</TableCell>
```

**Tag group with overflow** — cap visible badges, spill to a muted `+N`; never let badges wrap:
```jsx
<div className="flex items-center gap-ds-02">
  {tags.slice(0, 2).map((t) => <Badge key={t} color="neutral" size="xs">{t}</Badge>)}
  {tags.length > 2 && <span className="text-ds-sm text-surface-fg-subtle">+{tags.length - 2}</span>}
</div>
```

**Money cell** — `text-right tabular-nums` (DataTable: column meta `align: 'right'`). Keep a consistent number of decimal places per column — that's what actually aligns decimals. Negatives: never color alone — pair red with a minus sign or accounting parentheses `(1,500)`.
**Qualitative numbers stay left** — dates, phone numbers, zip codes, IDs are identifiers, not quantities; only true quantities right-align.
**Empty value** — muted em-dash, with an accessible label: `<span className="text-surface-fg-subtle" aria-label="No value">—</span>`. Don't leave cells blank.

See the `RichCells` story for all of these live.

## Gotchas
- Table headers automatically have scope="col" for screen reader navigation
- For anything beyond trivial display, prefer DataTable — don't rebuild sorting/pagination/selection on top of bare Table
- Inside a Card, first/last cells inherit `--card-spacing` so edge columns align with the card's slots; standalone tables fall back to 12px edges
- Numeric columns: add `text-right tabular-nums` (DataTable does this via column meta `align: 'right'`)

## Changes
### v0.45.0
- **Added** `TableRowLink` (ui/table-row-link) — real-anchor whole-row navigation with pseudo-element stretch (Safari-safe: anchored to the cell, clipped by the table's `overflow-x-clip`), row-level focus ring, `stretch={false}` title-only mode.
- **Added** `TableRowActions` — hover/focus-revealed action cluster (opacity reveal, permanently tabbable, `:focus-within` + touch fallbacks, `persist` mode).
- **Added** `numeric` prop on TableCell/TableHead — right-align + tabular figures.
- **Fixed** TableFooter background was `color-mix(surface-raised 50%)` — invisible on cards (same mis-mapped shadcn `muted/50` family as the row hover). Now a `surface-base` band with a top hairline.
- **Fixed** Selected+hover tie: selected rows get an explicit `hover:bg-accent-4` step (hover and selected previously tied on specificity).
- **Added** Cell recipes section (user cell, tag overflow, money, empty-dash) + density→avatar mapping; `RichCells` / `SelectedRows` stories.
- **Added** `density` prop (`compact | standard | comfortable`) via `--table-py`; header height tracks density instead of a fixed 40px
- **Added** `striped` prop — opt-in zebra
- **Changed** Rows regain their hairline separator (`border-b border-surface-border-subtle` — lost in the original port) and hover becomes visible on cards (`hover:bg-surface-raised-hover`, was the invisible `surface-raised`)
- **Changed** Cells: `px-ds-04` interior, first/last cells read `--table-edge` (= `--card-spacing` inside a Card); header drops to `text-ds-sm` muted
- **Changed** Default vertical rhythm tightens: standard rows ~53px → ~37px

### v0.18.0
- **Added** `TableProps`, `TableRowProps`, `TableCellProps` type exports

### v0.17.0
- **Fixed** TableCell: Added `px-ds-03` horizontal padding — was `px-0`, causing content to hug container edges

### v0.1.0
- **Added** Initial release
