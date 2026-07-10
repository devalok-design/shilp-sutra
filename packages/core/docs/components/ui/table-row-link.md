# TableRowLink

- Import: @devalok/shilp-sutra/ui/table-row-link
- Server-safe: No (uses LinkContext)
- Category: ui

## Props
    href: string (required) — navigation target; rendered through the LinkContext Link component (framework router aware)
    stretch: boolean (default true) — stretch the click target across the whole row via a pseudo-element; pass false for a title-only link that keeps row text selectable
    ...AnchorHTMLAttributes — target, rel, onClick, aria-label, etc.

## Example
```jsx
<TableRow>
  <TableCell className="relative">
    <TableRowLink href={`/projects/${id}`}>{name}</TableRowLink>
  </TableCell>
  <TableCell><Badge color="success">Active</Badge></TableCell>
  <TableCell>
    <TableRowActions>
      <IconButton className="relative z-[1]" size="sm" variant="ghost" aria-label={`Actions for ${name}`} icon={<IconDots />} />
    </TableRowActions>
  </TableCell>
</TableRow>
```

## Composability
- **A real anchor, not a click handler** — cmd/ctrl+click, middle-click, right-click "open in new tab", and screen-reader link announcement all work. Never put `onClick` on a `<tr>` and never add `role="grid"` just for clickable rows.
- **Placement contract:** lives inside the row's *primary* cell, which must be `className="relative"` — the stretch pseudo-element is anchored to the cell (Safari ignores `position: relative` on `<tr>`) and spans `100vw`; the Table root's `overflow-x-clip` contains it.
- **Focus:** keyboard focus draws a row-level ring via TableRow's `has-[[data-slot=row-link]:focus-visible]` rule; the anchor suppresses its own outline (stretch mode). `stretch={false}` uses a normal anchor focus ring.
- **Other interactive elements** in the row (menu buttons, checkboxes, TableRowActions children) must sit above the stretch: `className="relative z-[1]"`.
- Routes through `LinkContext` — Next.js/React Router consumers get client-side navigation automatically.

## Gotchas
- The stretched overlay blocks text selection inside the row — use `stretch={false}` (GitHub-style title link) when row text must stay selectable
- Don't combine with DataTable's `onRowClick` on the same row — one navigation owner per row
- If a secondary link/button in the row seems unclickable, it's missing `relative z-[1]`

## Changes
### v0.45.0
- **Added** Initial release
