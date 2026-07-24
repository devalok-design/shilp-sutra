---
"@devalok/shilp-sutra": minor
---

**PriorityIndicator rebuild (finish-bar).** Recomposed on the `Badge` primitive instead of a bespoke re-rolled chip, fixing two P0s (unguarded infinite motion + no compact accessible name) and the radius/motion drift from `Badge`.

- **Severity by weight, not motion.** URGENT is now a solid `Badge` (static, high-contrast) so the top tier reads at a glance. The perpetual scale-pulse is **removed** (it was unguarded infinite motion — WCAG 2.2.2 Pause/Stop/Hide). No animation at all now.
- **Real compact a11y.** Icon-only chips carry `role="img"` + `aria-label` (was a mouse-only `title` on a `<div>`).
- **New `iconOnly`** replaces the dead `display` CVA axis (both its branches emitted empty strings). `display` is kept as a **deprecated alias** (`'compact'` → icon-only).
- **New `children`** overrides the label for i18n / custom copy.
- Unknown `priority` values now fall back to MEDIUM instead of throwing.
- Doc corrected (LOW = slate, not success; not server-safe).

Note: because it now composes `Badge`, the rendered element (and forwarded `ref`) is a `span` rather than a `div`, and the chip uses `Badge`'s pill radius. Behavioral API (`priority`) is unchanged.
