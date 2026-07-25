---
"@devalok/shilp-sutra": patch
---

fix: P2 audit sweep — notification-preferences a11y names + split-button doc accuracy

- **notification-preferences (P1 a11y):** the per-row mute `Switch` and min-tier
  `Select` now have accessible names (`aria-label`) — every row's inline controls
  announced their value with no "what" (WCAG 4.1.2). Names include the channel +
  project (e.g. "Mute In-App for Karm V2").
- **split-button (docs):** corrected the Composability section — it falsely claimed
  SplitButton *inherits* Button's variant/color/size vocabulary and `ButtonGroup`
  context (it re-implements styling locally and ignores group context). Dropped the
  stale "arrow-key nav planned for 0.45.0" changelog line.

Deferred (bigger/riskier, noted for a future pass): derive split-button's half styling
from `buttonVariants` (layout-sensitive), and de-duplicate the context-menu/menubar
Radix-twin plumbing.
