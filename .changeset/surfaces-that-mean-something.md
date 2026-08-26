---
"@devalok/shilp-sutra": major
"@devalok/eslint-plugin-shilp-sutra": minor
---

rebuild the surface model: one surface per theme, edges that mark objects, and a tint that follows the brand

Three defects with one cause. `surface-raised`, `surface-overlay` and
`surface-chrome` all resolved to the same colour in light, so named tiers were
not distinct values. Menu hover was invisible because items used
`hover:bg-surface-raised` inside containers using `bg-surface-overlay` — the
same colour. And dark could not express depth because the ramp bottomed at
`#040404`, below where Material and Carbon deliberately stop.

The common cause: tiers named by role and valued by aliasing, with nothing
enforcing distinctness, and dark treated as light with the step numbers swapped.

**The model.** One surface per theme. Borders mark objects, fills mark regions.
In light the page, a panel and an overlay are all `#ffffff` — an edge is what
makes a card a card. Dark has room above the page, so panels genuinely lift.
Full reasoning in `docs/plans/2026-08-26-surface-model-rebuild.md`.

## Breaking

**`surface-raised` is now `surface-panel`** (`-hover` and `-active` follow). In
light it is not raised — it is the same white as the page, so the name was a
lie. The old names still resolve as deprecated aliases and are removed next
major, so nothing breaks the moment you upgrade.

**`surface-chrome` is removed.** Chrome is an arrangement decision, not a theme
value — a shell's chrome is decided by which shell you picked. Use
`surface-base`.

**Run the codemod, do not find-and-replace.** A new eslint rule,
`shilp-sutra/no-renamed-surface-token`, ships an autofix:

```
pnpm eslint . --fix
```

It is not a rename. **37 references are a retarget, not a rename** — a hover
painted with a container value is invisible now that base, panel and overlay
share a colour in light. The rule tells `hover:bg-surface-raised` (retarget to
`-panel-hover`) from `bg-surface-raised` (rename to `-panel`), and knows that
`dark:` and `md:` are not interaction states. A blind rename ships 37 invisible
hover states.

It reports template literals without fixing them — a `TemplateElement`'s range
covers its delimiters, so rewriting one destroys the literal. Those need a human.

**The neutral ramp is de-warmed and the dark end lifted.** Every step is now pure
grey (chroma 0), and dark lightness rises by 0.037 so surfaces have somewhere to
stack. This changes the actual colour of all text and every border, not only
surfaces. Dark page is now `#0a0a0a` and a dark panel `#171717`.

**Object borders are translucent.** `surface-border-subtle` / `-border` /
`-border-strong` are now black at 5/9/14% in light and white at 6/10/16% in dark,
so an edge darkens whatever it lands on and can never coincide with it. On white
the default edge computes to `#e8e8e8`.

**Control borders are a separate family.** `surface-border-interactive` and
`-interactive-strong` are solid and carry the WCAG 1.4.11 contrast that inputs,
checkboxes and switches need. Decorative edges are no longer constrained by it —
which is why our card edges were darker than every peer system's.

## Other changes

**Shadows are scoped to floating things.** Cards, panels and the inset canvas
lose theirs; menus, dialogs, popovers, tooltips and control thumbs keep them.
Interactive cards now change surface on hover instead of lifting.
`--shadow-strength` remains as the consumer dial.

**A new tint dial** — `Neutral` / `Subtle` / `Medium` / `Strong` — washes the
page, canvas and chrome toward the brand's own accent hue while cards, overlays
and hover states hold neutral. Content sits on a true surface, and above
`Neutral` a light card stops matching the page, so cards lift for free.

**`AvatarGroup`'s `borderColor`** accepts `'surface-panel'`. `'surface-raised'`
still works — a widening, so this is not a break.

**Wells take `fg-muted`, not `fg-subtle`.** Our faintest text on our quietest
ground measured 4.38:1, under AA. A pairing mistake rather than a token defect.

**The lint gate now reaches stories.** `*.stories.tsx` was in a global ignore,
and a global ignore cannot be re-included by a later `files` block — which is
how 24 deprecated `surface-1` / `surface-2` references survived in the files
people copy from. Fixed, and the token rules now run there.
