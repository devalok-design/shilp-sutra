---
"@devalok/shilp-sutra": minor
---

fix(skeletons): unify shimmer (S6) + a11y status region (audit)

`loading-skeleton` (Card/Table/Board/List) + `page-skeletons` (Dashboard/ProjectList/
TaskDetail). Non-breaking (additive `label` prop).

- **shimmer unify (S6, P0):** dropped every `bg-surface-raised-hover` fill override —
  all bars now inherit the base `Skeleton`'s `skeleton-base`, so the system shimmers
  from ONE source and bars no longer disappear in forced-colors (Windows HCM).
- **a11y (P0):** each root is a `role="status"` + `aria-busy` region with an sr-only
  label (loading was silent to AT — every child `Skeleton` is `aria-hidden`). New
  optional `label` prop.
- **state (P1):** count props (`rows`/`columns`/`cardsPerColumn`) clamped with
  `Math.max(0, floor(...))` — `rows={-1}` / `NaN` can't throw a `RangeError`.
- **motion (P1):** removed the inert `animationDelay` (it sat on non-animated wrapper
  divs and never fired).
- **cohesion (P1):** shells use `border-card` + `rounded-surface` (Card's vocabulary)
  rather than `border-card-strong` / `rounded-overlay-lg` (Dialog radius);
  page-skeletons' misleading `shimmer` fill constant removed.
- **docs:** page-skeletons no longer falsely claims it's "Built on LoadingSkeleton".
