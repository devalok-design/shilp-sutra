---
"@devalok/shilp-sutra": minor
---

**Added `Dot` — a composable status/indicator dot primitive** (`@devalok/shilp-sutra/ui/dot`), and consolidated the existing dots onto it.

`Dot` is the shared low-level indicator: intent-coloured (`accent`/`success`/`warning`/`error`/`info`/`neutral`, plus `current` to inherit text colour), `size` (`xs`–`lg`), `variant` (`filled`/`ring`/`off` — `off` = faint fill + light border for inactive), a `withBorder` contrast ring (for busy/coloured backgrounds), `pulse` with `pulseSpeed` (slow/normal/fast), and an optional `label` with `labelPosition` (start/end) that makes it an announced `role="status"` (bare dots are decorative/`aria-hidden`). API informed by Chakra `Status.Indicator`, Ant `Badge status`, Mantine `Indicator`.

Now used everywhere a dot appears, so there's one dot to style/animate:
- **StatusBadge** now composes `<Badge variant="soft">` + `<Dot>` instead of re-styling its own pill (the leading dot is a static `<Dot>`, not a pulsing one — correct for settled statuses).
- **StatusDot** is now a thin health-vocabulary wrapper over `<Dot>`.
- **Badge**'s `dot` prop renders `<Dot color="current" pulse>` inside its entrance animation.
- **Avatar**'s presence status dot renders `<Dot withBorder>` (colour from status; the wrapper keeps the online breathe + positioning + a11y). Internal only — Avatar's `status` API is unchanged; `offline` is now `neutral`-toned.

**BREAKING (breaking-minor):**
- `statusBadgeVariants` CVA export removed from `composed/status-badge` (StatusBadge composes Badge + Dot; no standalone CVA). Style via `<Badge>`/`<Dot>` props or `className`.
- **`StatusDot` removed — merged into `Dot`.** Its states are now Dot prop-combos (the new `off` variant covers `inactive`): `healthy`→`<Dot color="success" pulse>`, `warning`→`<Dot color="warning">`, `critical`→`<Dot color="error">`, `neutral`→`<Dot color="neutral">`, `inactive`→`<Dot color="neutral" variant="off">`.
