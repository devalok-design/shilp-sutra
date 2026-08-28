---
"@devalok/shilp-sutra": minor
---

Fix ~20 more invisible states, and five decisions from a full-library visual review

A complete audit of the library against 0.58.0 turned up sites the surface sweep
never reached, plus a handful of judgement calls that were reviewed against real
components and settled.

**Four more selections that lost to their own neighbour.** Same inversion 0.58.0
removed, in files that sweep never opened. The chat reaction chip was the worst:
a chip you *had* reacted to was the dimmest thing in the row, because `accent-3`
sits below `surface-panel-hover` in dark and that is what an *un*reacted chip is.
Also the command-palette shortcut cap (active darker than inactive), the
file-upload button (moved 2→3 in 0.58.0 and one step short, so hover still made
it darker), and the colour-format pill at 1.042:1.

**Fourteen more things painted in their own background colour**, so they rendered
nothing: the notification-preferences channel tile (1.000:1 in both themes, no
border, no shadow, no ring), the chat composer, `Code`'s block variant — which
contradicted its own inline variant thirteen lines below — four date-picker
triggers, three native selects, and the rich-text-editor link input.

**The radar chart drew a dark halo instead of a knockout.** Its vertex ring must
match the ground it sits on and used `surface-base` while charts sit on cards. An
SVG attribute, so no class scan or lint rule could see it.

**`--shadow-kbd` was 1.022:1 in dark** — hardcoded black with no `.dark` entry, so
a key cap's only 3D cue was invisible. It now flips to a top highlight.

### Decisions

- **Keyboard caps sit in a well.** Their fill matched the menu behind them.
- **The slider thumb keeps a step-7 edge** while every container is at step 4.
  Adds a new `--color-palette-border-strong` role across all 15 palettes, derived
  from each ramp so a consumer-registered palette gets it free. Recorded as
  `SLIDER-THUMB-EDGE-STEP-7`: `PALETTE-EDGE-WHISPER` was reasoned about *card*
  edges, and a handle is the thing you aim at.
- **Outlined controls move to the control edge tier.** A Cancel and a Save in one
  dialog footer were rendering 1.38:1 and 2.00:1 — two different greys. Affects
  AlertDialog Cancel, the DataTable pager, the top-bar icon button and the
  command bar. Dividers and chrome stay decorative.
- **`Combobox` gains `pillTone`** (`'neutral'` default, `'accent'`). The previous
  fixed `accent-2` is not offered: in light it was the same lightness as the
  trigger behind it, 1.006:1, so the pill was invisible.
- **`Switch` is deliberately unchanged.** Its hover lightens in light and darkens
  in dark, inconsistent with every other control. Reviewed and kept; recorded as
  `SWITCH-HOVER-DIRECTION`.

Also fixes a deviation ID in `semantic.css` that no gate could ever have matched,
and two register sections that were missing their table rows.
