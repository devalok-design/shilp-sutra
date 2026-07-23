---
"@devalok/shilp-sutra": minor
---

Card `default` variant is now **tonal** — depth from a surface-tone shift plus a whisper `border-card` hairline, no drop shadow. Previously `default` led with `shadow-raised`. This aligns the base `Card` primitive with the tonal card-edge direction the rest of the DS adopted in 0.50.0 (Setu `tonal-elevation`: depth from tone, not a shadow).

**Visual change, not an API change.** No props, types, DOM structure, or ARIA changed — a `<Card>` with no `variant` now renders with a tonal hairline instead of a shadow. Cards that want the old floated look should pass `variant="elevated"` (shadow, no border). `outline` (strong border) and `flat` (no edge) are unchanged. `StatCard` inherits this via its delegated `variant`.
