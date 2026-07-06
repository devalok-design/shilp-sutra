---
"@devalok/shilp-sutra": patch
---

Compose base primitives instead of hand-rolling them (W6 compose-don't-re-roll).

- **StatCard** loading state: three `bg-skeleton-base animate-pulse` divs → `<Skeleton>`.
- **Avatar** loading state: hand-rolled placeholder that also used the wrong token (`bg-surface-raised-hover`); now `<Skeleton>` with the correct `bg-skeleton-base`. (Both Skeleton composes are visually identical — Skeleton defaults to the same `pulse` — and now inherit `motion-reduce:animate-none`.)
- **DataTableToolbar** column/density/export controls: hand-rolled `<button>`s → `<Button variant="outline" color="neutral" size="sm">`. Standardizes on the real Button (correct hover token, focus ring, active state); horizontal padding steps from `px-ds-03` to Button's `px-ds-04`.

Non-breaking (no API change).
