---
"@devalok/shilp-sutra": minor
---

Fix six surface-model faults, most of which were invisible in exactly one theme

An audit of all 205 component files found roughly 60 failing sites that turned
out to be four repeated mistakes plus two flat bugs. Everything here is a visual
fix — no API changes — but the changes are visible, hence a minor rather than a
patch.

**Selected no longer loses to hovered.** In dark, `accent-1` and `accent-2` sit
below `surface-panel` in lightness while `surface-panel-hover` sits above it, so
selections receded exactly as hover advanced. On the sidebar the selected item
measured 1.03:1 and a merely hovered one 1.30:1 — the wrong item was louder, in
the opposite direction. Selections move to `accent-4` (light 1.42:1,
dark-on-panel 1.23:1, dark-on-base 1.36:1). Affects Sidebar, MasterDetail,
MultiSelectPopover, NotificationCenter, Combobox, Autocomplete, Table,
BottomNavbar, ScheduleView, TreeView and Toggle.

**Two shipped features rendered nothing in light mode.** `base`, `panel` and
`overlay` are all `#ffffff` in light by design, so anything using one to stand
out against another painted nothing: `Table striped` never striped, and
`Progress` had no groove behind its bar. Around twenty such sites now take
whatever their already-correct sibling uses.

**Raised surfaces regained their edge in dark.** `--shadow-edge-ring` is
swapped to a light ring in dark, but only the `md`/`lg` internals consumed it.
`shadow-raised` and `shadow-raised-hover` kept a near-black ring measuring
1.01:1 on a dark panel, so `Sidebar variant="floating"`, `Card
variant="elevated"`, `Menubar` and the keyboard caps had no boundary at all.
Now 1.21:1, still quieter than a floating overlay's 1.42:1.

**The selected segment was darker than its own groove.** `SegmentedControl`'s
thumb resolved to `neutral-3` against a track that composited to a lighter
value, so the selection read as a dent (1.028:1, inverted). The thumb moves to
`neutral-5`: 1.46:1 over a panel, 1.69:1 over the page. `--shadow-segment`, its
documented ring-less fallback, was near-black and so failed in the same theme;
it takes a light ring in dark now. `Tabs`' contained pill had the identical bug
via different tokens and now shares the corrected ones.

**`Sidebar` drew a full-contrast line down the app.** Its divider had no
border-color utility, and Tailwind 4 leaves those at `currentColor` rather than
a grey default, so it inherited the text colour: 12.69:1 in light and 15.44:1 in
dark, where 1.23:1 / 1.47:1 was intended.

**`border-card-strong` was not stronger than `border-card`.** Both resolved to
`--color-surface-border`, so the ~13 call sites asking for a heavier edge got
the faint one. It now resolves to `--color-surface-border-strong`. The comment
above them also described the border model backwards — it told authors to use
the decorative tier for interactive controls, when that tier is precisely the
one that does not carry WCAG 1.4.11.

Full measurements: `docs/audits/2026-08-28-surface-model-audit.md`.
