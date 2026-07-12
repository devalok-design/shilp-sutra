---
"@devalok/shilp-sutra": patch
---

Added a dedicated `surface-chrome` surface tier for app chrome. `TopBar`,
`Sidebar` (+ its variants), and `BottomNavbar` now paint `bg-surface-chrome`
instead of `bg-surface-raised`, so chrome's surface is an explicit, independently
tunable decision (the Carbon/Atlassian/Ant model) rather than coupled to the card
surface. It's valued equal to `raised` (light `neutral-1` / dark `neutral-2`) —
**zero visual change** — but can now diverge without affecting cards. Resolves the
CLAUDE.md-vs-code surface-tier mismatch (audit finding #7); the surface rule is
updated accordingly.
