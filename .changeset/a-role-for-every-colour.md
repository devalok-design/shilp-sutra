---
"@devalok/shilp-sutra": minor
---

colour becomes a role, not a hardcoded hue — and any palette now works

A component used to support a colour by having a hand-written line for it. That
made the number of colours you could use a function of how much code we were
willing to write, which is the wrong thing for it to depend on. Button carried
**30 hand-written `compoundVariants`** for 5 variants × 6 colours; SplitButton
carried 27 more. Adding a seventh colour meant five new lines per component, and
`<Button color="teal">` was simply impossible.

Now a component styles itself once, in roles:

```
bg-palette-solid  text-palette-fg  hover:bg-palette-solid-hover
```

and the colour comes from `data-palette` on the element or any ancestor.

## New: `palette-*` utilities

Eleven roles — `subtle`, `soft`, `soft-hover`, `soft-active`, `border-subtle`,
`border`, `solid`, `solid-hover`, `solid-active`, `text`, `fg` — available as
`bg-`, `text-`, `border-` and `ring-` utilities.

**Fourteen palettes ship**: accent, secondary, error, success, warning, info,
neutral, plus teal, amber, slate, indigo, cyan, orange and emerald. The first
seven resolve from the semantic layer, so overriding `--color-accent-*` to
rebrand still flows through.

**Register your own** with a CSS block:

```css
[data-palette='brand-purple'] {
  --color-palette-solid:       #6d28d9;
  --color-palette-solid-hover: #5b21b6;
  --color-palette-fg:          #ffffff;   /* supply this */
  /* …the remaining roles… */
}
```

Omit `--color-palette-fg` and it is derived black-or-white from the solid's
lightness — readable, but blunt, and outside the contrast we measure for the
built-ins.

## Not breaking

`color` keeps working on every component that had it. Its type widens from a
closed union to `union | (string & {})` — a widening, so existing values all
still type-check. `<Button color="error">` is unchanged; `<Button color="teal">`
now works.

One behaviour note: **a component with no `color` prop no longer stamps a
palette**, so it inherits from an ancestor and falls back to accent when there
is none. That is the point of the layer — a `data-palette` on a section themes
everything inside it — but it means a plain Button inside a palette-scoped
region will now pick that palette up.

## Visual change: coloured edges are lighter

The system disagreed with itself about a coloured container's edge — Badge used
ramp step 4 while Card, Alert, Banner and Slider used step 7. Unifying it was
unavoidable once the edge became one role, and it was resolved toward the
lighter end.

Every coloured edge is now **step 4**. Measured against white that is 1.37–1.49:1
where step 7 was 2.31–2.86:1, and the plain uncoloured edge we already ship is
1.23:1 — so a coloured edge now carries noticeably less information than it did.
This was chosen deliberately with those numbers in hand and is recorded as
`PALETTE-EDGE-WHISPER` in `docs/deviations.md`, alongside
`PALETTE-CONTROL-EDGE-BELOW-AA`, which notes that outlined controls sit under
the WCAG 1.4.11 3:1 boundary requirement — before this change as well as after.

If you relied on a coloured container's edge to signal intent, add a second cue.

## Converted

Twelve components: **Button, SplitButton, Badge, Alert, Card, Banner, Slider,
Toggle, Dot, BadgeIndicator, Progress and ButtonGroup**.

Button and SplitButton were verified against their previous output rather than
by eye — every one of the 30 Button pairs and 42 SplitButton pairs resolves to
identical classes.

Five are deliberately left alone: `StatFlash`, `Avatar`, `Toast`,
`ActivityFeed` and `ScheduleView` map an internal state to a colour rather than
offering a choice, so the colour *is* the meaning and indirection would only add
a layer.

`Badge` is the clearest illustration of the payoff: an 84-value map becomes four
lines, and `color="teal"` on a Button — impossible before — now works.
