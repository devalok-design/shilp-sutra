---
"@devalok/shilp-sutra": minor
---

Table structural features: TableRowLink, TableRowActions, numeric cells, animated + accessible row expansion

- **`TableRowLink`** (`ui/table-row-link`) — whole-row navigation as a **real anchor**: cmd/ctrl+click, middle-click, and "open in new tab" work, and screen readers announce a link — none of which `onClick`-on-row gives. Stretch pseudo-element is anchored to the cell (Safari ignores `position:relative` on `<tr>`) and clipped by the table root's new `overflow-x-clip`. Keyboard focus draws a row-level ring (`has-[[data-slot=row-link]:focus-visible]` on TableRow). `stretch={false}` = title-only link that keeps row text selectable.
- **`TableRowActions`** — action cluster revealed on row hover with the full a11y contract: opacity reveal (never `display:none`) so buttons stay permanently tabbable, `:focus-within` reveals on keyboard entry, always visible on touch (`pointer-coarse`), and a `persist` prop for always-visible mode. Reveal animates with `duration-fast-01 ease-productive-standard`.
- **`numeric`** boolean on `TableCell`/`TableHead` — right-align + tabular figures in one prop.
- **Row expansion (DataTable)** — `aria-expanded` now on the toggle button (was missing), visually-hidden header for the expand column, chevron rotation on motion tokens, and the expanded row animates open/closed (height + opacity, `springs.smooth`) with a `useReducedMotion` self-guard; virtualized tables keep the instant reveal.
