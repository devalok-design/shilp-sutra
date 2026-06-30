---
"@devalok/shilp-sutra": minor
---

Card system overhaul: gap-model padding, composable corner slots, a truncation primitive, and an anti-convergence sweep.

**Breaking**

- `Card`: removed `accent` / `accentColor` (the decorative colored edge-bar). Use `<CardAction>` for corner content or `color` for a tinted border. A colored rail on a bordered, shadowed card is an AI tell (make-kit rule #6).
- `StatCard`: renamed `surface` → `variant`, widened to a 4-way scale (`default` | `elevated` | `outline` | `flat`). StatCard now composes `<Card>`, so surface/padding/elevation live in one place. `surface="raised"` → `variant="default"`, `surface="flat"` → `variant="outline"`.
- `ContentCard` deprecated (`@deprecated` JSDoc) — compose `Card` + `CardHeader`/`CardContent`/`CardAction` directly. Still ships; removal in a later minor.

**Added**

- `<CardAction>` — composable corner slot (4 placements, size-aware inset, optional `tuck` to align an icon button's glyph to the content edge). `Card` is now `relative` to anchor it.
- `StatCard` `deltaPlacement="block" | "inline"` — inline rides the value's baseline for compact dashboards.
- `<TruncatedText>` — text primitive with `end` / `clamp` / `middle` truncation and overflow-aware tooltip recovery (tooltip only when actually clipped; full string is always the accessible name). Applied across ~25 file/email/user-text/nav sites.
- `--text-ds-2xs` (9px) micro-type token.

**Changed (no migration)**

- `Card` uses a gap-model layout — the container owns vertical padding + inter-slot gap; slots own only horizontal padding, so adding/removing a slot can't unbalance the bottom edge.
- Replaced colored left-rails with tinted rows in `master-detail`, chat mention highlights, and sidebar active state (anti-convergence).
- 12 hand-rolled button sites now compose `<Button>`; chat inline-edit composes `<Textarea>`.
- Long filenames/emails/user names/nav labels truncate with recovery instead of wrapping or silently clipping. Re-baseline Chromatic if you snapshot the DS.
