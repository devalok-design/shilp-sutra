---
"@devalok/shilp-sutra": minor
---

fix(master-detail): a11y naming/live region + selection ownership (audit)

Additive (non-breaking — controlled `selected` + explicit `active` still work).

- **a11y (P0):** the `listbox` now has an accessible name via a `label` prop
  (`aria-label`) — it was a nameless listbox to screen readers. The detail pane is a
  `role="region"` `aria-live="polite"` region, so AT users are told the detail changed
  when the selection swaps (was a silent swap).
- **api (P1):** selection ownership — put `value` on each `MasterDetail.ListItem` and
  `onSelect` / `defaultSelected` on the root; `active` + `aria-selected` derive from
  context automatically. No more hand-wiring `active={id === sel}` **and** `onClick` on
  every row (the DS `value`/`onSelect` model). Controlled `selected` is unchanged.
- **motion (P2):** the mobile detail slide is gated behind `useReducedMotion`
  (opacity-only / instant under `prefers-reduced-motion`).
- **RTL (P2):** list divider `border-r` → `border-e`; the mobile back arrow mirrors
  under `dir="rtl"`.
- **cleanup:** removed the dead `itemCount` context; roving `activeIndex` derives from
  `value` or an explicit `active`.

Follow-ups noted (not in this change): `asChild`/`href` rows, typeahead, per-item disabled.
