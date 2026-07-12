---
"@devalok/shilp-sutra": patch
---

Token hygiene: replaced hand-typed pixel sizing with the equivalent `--spacing-ds-*`
tokens across `src/ui` + `src/composed` (76 occurrences — e.g. `h-[16px]` → `h-ds-05`,
`w-[64px]` → `w-ds-10`, `h-[1px]` → `h-px`). Rendered sizes are unchanged. Pixel
values with no token on the scale (component-specific dimensions, off-scale layout
sizes) are left as-is.

Added a gate — `check-arbitrary-sizing` (a new pre-publish-audit gate + `pnpm
check:sizing`, wired into `verify`) — that flags any future `[Npx]` height/width
whose value has a spacing token, so this doesn't drift back. Internal only; no
consumer-facing API change.
