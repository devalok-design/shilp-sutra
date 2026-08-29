---
"@devalok/shilp-sutra": patch
---

Fix five rendering bugs in Table, DataTable and MasterDetail

All five were found by reading the source closely enough to rebuild it in
Figma, and all five had survived review. Three are specificity faults — a rule
that looked right in the source and lost in the cascade.

**Selection was invisible on half the rows of a striped table.** `Table` put
striping on the `<table>` and `TableRow` put selection on the `<tr>`:

```css
.[&_tbody_tr:nth-child(even)]:bg-surface-panel-hover tbody tr:nth-child(even)  /* (0,2,2) */
.data-[state=selected]:bg-accent-4[data-state="selected"]                      /* (0,2,0) */
```

The stripe won, so a selected even row rendered grey. It revealed itself only
on hover, where `(0,3,0)` took over. The stripe selector now excludes selected
rows, which makes the contest moot rather than escalating specificity — the
next stripe variant would only have had to escalate again.

**Every pinned column was pinned to the same edge.** `leftIndex` was computed
and then discarded, so two left-pinned columns both resolved to `left: 0` and
stacked. `getPinnedCellStyle` now takes the column and asks TanStack for the
cumulative offset (`getStart('left')` / `getAfter('right')`) rather than
summing widths itself. The argument is optional so the signature stays
compatible, but omitting it *is* the old behaviour — pass it.

**A pinned cell repainted the row.** It set `bg-surface-panel` unconditionally,
which is right for occluding scrolled content and wrong for everything else: a
selected row's pinned cell stayed panel-coloured and a striped row's showed a
white notch. The cell keeps an opaque base — `bg-inherit` does not work, since
`TableRow` has no background of its own and the cell would inherit
`transparent` — and layers the row's state on top through `group/row`, which
`TableRow` already declares. Striping reaches it through a new `data-pinned`
attribute, so only the pinned cell is repainted rather than every cell.

**A pinned column had no edge.** Unscrolled it was indistinguishable from a
normal column; scrolled, content slid under it with no seam. The last
left-pinned and first right-pinned column now carry a hairline on the boundary.

**`MasterDetail`'s active row went grey on hover.** `hover:bg-surface-panel-hover`
`(0,2,0)` beat `bg-accent-4` `(0,1,0)`, so pointing at the selected row
deselected it visually. The hover is now gated on `!isActive`, and the active
row gets `hover:bg-accent-5` so it still responds to the pointer. This is the
third instance of one fault — `TreeItem` and `TableRow` both already carry the
guard, each with a comment explaining it. A lint rule would be better than a
fourth hand-written guard.

The `data-table-pinning` tests assert the offsets diverge, the seam lands on
the boundary column only, and the state classes are present. The MasterDetail
test asserts on the class list rather than simulating hover, because jsdom does
not apply `:hover` — a behavioural test there would have passed while the bug
was live, which is how it survived in the first place.
