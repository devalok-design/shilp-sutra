---
"@devalok/shilp-sutra": minor
---

Card spacing becomes one CSS variable; CardBleed + horizontal cards; StatCard size axis; padding-fight cleanups

**Card (`ui/card`):**

- The `size` axis now assigns `--card-spacing` / `--card-gap` CSS variables; the container, all slots, `CardAction` corner insets, and the new `CardBleed` negations read the same pair. Rendered spacing is unchanged (sm 16/8, md 20/12, lg 24/16). `CardSizeContext` and the per-size class lookup maps are gone — slots work by CSS inheritance. Retune any card with a single override: `className="[--card-spacing:var(--spacing-ds-07)]"`.
- **Added `<CardBleed side>`** (`x` | `top` | `bottom` | `y` | `all`) — full-bleed escape hatch that negates `--card-spacing`, the shilp-sutra equivalent of Radix Themes' `Inset` / Polaris `Bleed`. `top`/`bottom` inherit the card radius for cover media; `x` escapes a slot's inset for edge-to-edge bands. Direct children of Card are already full-width — don't use `x`/`all` there.
- **Added `orientation="horizontal"` + `<CardSection>`** — sanctioned horizontal media card: the root becomes a padding-less row, the media pane owns the left edge, and `CardSection` re-establishes the py/gap rhythm from the same variables.
- **Added** dev-only warning when Card receives bare text or textual elements (`<p>`, `<span>`, headings…) as direct children — the #1 "card padding looks broken" footgun (direct children get no horizontal inset by design).

Compat: rendered pixels are identical; consumer `className` overrides on slots keep winning via tw-merge. Only CSS targeting the old literal classes (`px-ds-05b` on slots, `top-ds-05b` on CardAction) needs to move to the variables.

**StatCard (`ui/stat-card`):**

- **Added `size` prop** (`sm | md | lg`, delegated to Card). `sm` tightens padding to 16px and steps the value down to `text-ds-2xl` — for dense KPI rows and narrow stat grids.
- Internal rhythm is now flex gap instead of stacked margins; `footer` renders behind a full-width rule instead of an inset `border-t`; loading skeleton gets `aria-busy`.

**Padding-fight cleanups:** `NotificationPreferences` header no longer double-gaps (stale `pb-ds-04` removed); `DataTableCards` mobile rows compose `<Card size="sm">` instead of a hand-rolled 12px bordered box; Card stories/JSDoc and the make-kit spacing/surfaces guides no longer model `p-*` overrides on Card.
