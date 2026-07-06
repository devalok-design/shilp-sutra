---
"@devalok/shilp-sutra": patch
---

Compose the `Skeleton` primitive in StatCard and Avatar loading states instead of hand-rolling the shimmer (W6 compose-don't-re-roll).

- **StatCard** loading state: three `bg-skeleton-base animate-pulse` divs → `<Skeleton>`.
- **Avatar** loading state: the placeholder was hand-rolled AND used the wrong token (`bg-surface-raised-hover`); now `<Skeleton>` with the correct `bg-skeleton-base`.

Both are visually identical (Skeleton defaults to the same `pulse`) and now inherit `motion-reduce:animate-none` for free. Non-breaking.
