---
"@devalok/shilp-sutra": minor
---

fix(avatar-group): a11y + motion polish (finish-bar-v2 audit)

Public API unchanged (one additive prop: `label`). Fixes the two P0s that pinned
the audit score plus P1/P2 cleanups.

- **a11y (P0):** each avatar is now a focusable `<button>` with the `focus-ring`
  util + `aria-label`, so member names are reachable by keyboard/AT (they were on
  non-focusable `<div>`s → hover-only). Empty `users` renders nothing instead of a
  focusable "0 team members" group.
- **motion (P0):** the hover/focus spread + peer-dim are driven by framer
  (`animate={{ x }}`) so `MotionConfig` / `prefers-reduced-motion` governs them —
  no positional animation under reduced-motion.
- **motion (P1):** avatars and the `+N` badge animate the spread **together** on DS
  spring/duration tokens (avatars used to snap while `+N` glided; off-token
  `duration-300 ease-out` removed).
- **compose (P1):** the `+N` badge is an `<Avatar>` + `<AvatarFallback>` now,
  deleting the duplicate `avatarSizeVariants` CVA + text-size map.
- **fix (P1):** the dead indicator ternary is resolved — `admin` dot is
  `bg-warning-9` (matches the docs), `lead` stays accent.
- **P2:** `max` clamped ≥ 1; ring-offset follows `borderColor` (no seam on a
  `surface-base` blend); `Record` maps tightened to the `AvatarSize`/`AvatarRing` unions.
