# Surface model rebuild — audit and plan

**Decided 2026-08-26.** Replaces the current eight-tier surface system with one
surface per theme, borders that mark objects, and a tint dial. Two shell
arrangements ship from the same tokens.

Prototypes live on the Figma `Updated Components` page:

| | node |
|---|---|
| Shell A · flat, merged top bar | `419:1367` |
| Shell B · inset canvas | `421:1367` |
| Tint presets | `416:1372` |
| Shell edge study | `417:1367` |
| Dark border study | `400:1367` |

---

## Why

Three defects, one cause.

**Three surface tokens resolved to the same colour.** `surface-raised`,
`surface-overlay` and `surface-chrome` were all `neutral-1` in light. Named tiers
that were not distinct values.

**Menu hover was invisible in light.** Items used `hover:bg-surface-raised` inside
containers using `bg-surface-overlay` — the same colour. Every dropdown, select
and context menu in the default theme. Filed as `MENU-ITEM-HOVER`.

**Dark could not express depth.** The stack started at `#040404`, effectively
black. Material floors dark at `#121212` and Carbon at `#161616` precisely
because below that there is no headroom, and shadows do not read on dark.

The common cause: we named tiers by role and valued them by aliasing, with
nothing enforcing distinctness, and we treated dark as light with the step
numbers swapped.

## What the industry does

- **Radix** — one job per step, and interaction states are *relative* to the
  component's own background, not absolute tokens.
- **Carbon** — four layers, each with its own hover/active, plus contextual
  tokens that resolve by nesting depth.
- **Material 3** — abandoned computed elevation overlays for explicitly distinct
  tonal containers.
- **shadcn** — the one that actually fit: **few surfaces, separated by a
  translucent white border in dark and an opaque border in light.** `--card`,
  `--popover` and `--sidebar` are deliberately the same colour.

Our card→hover gap (0.060 L) already matched shadcn's (0.064 L). The tonal steps
were never the problem. The border was.

## The model

**One surface per theme.** Light `#ffffff`, dark `#0a0a0a`.

**Borders mark objects, fills mark regions.** A card is a thing on a surface, so
it gets an edge. The shell is not a thing, so it does not.

**Borders tier by depth** — divider, card, overlay. This is what carries
hierarchy in place of shadow.

**Dark lifts cards, light does not.** Different physics, not inconsistency:
shadows work in light and are invisible in dark, so dark separates by lightness
plus a translucent white edge.

**Tint is one dial** — Neutral / Subtle / Warm / Strong, per theme because light
needs less chroma than dark to read the same. `Subtle` in light computes to
`#f8f4f5`, which is Setu's approved warm tint exactly.

### Two shells, same tokens

| | Shell A · flat | Shell B · inset |
|---|---|---|
| chrome | same as surface | its own plane |
| separator | one hairline on the sidebar | the chrome-to-canvas fill step |
| top bar | merged into content | part of the chrome |
| canvas | the page | rounded inset panel |
| everything inside | identical | identical |

## Token change

### Delete — declared, never used (9)

`surface-1` `surface-2` `surface-3` `surface-4` `surface-disabled`
`surface-fg-disabled` `surface-border-card` `surface-overlay-light`
`surface-overlay-dark`

### Unchanged — 548 uses, do not touch

`surface-fg` (213) · `surface-fg-subtle` (183) · `surface-fg-muted` (152)

These are foregrounds. The surface rebuild does not move them.

### Surfaces — 351 uses, mostly scriptable

| old | uses | new |
|---|---:|---|
| `surface-raised` | 127 | `surface` in light, `surface-raised` in dark |
| `surface-raised-hover` | 118 | `surface-muted` |
| `surface-overlay` | 62 | same as card |
| `surface-raised-active` | 18 | `surface-muted-active` |
| `surface-base` | 13 | `surface` |
| `surface-sunken` | 8 | `surface-muted` |
| `surface-chrome` | 5 | `surface` (A) / `surface-chrome` (B) |

### Borders — 178 uses, needs judgement per call site

| old | uses | new |
|---|---:|---|
| `surface-border-strong` | 98 | `border-card` or `border-strong` |
| `surface-border` | 51 | `border-divider` or `border-card` |
| `surface-border-subtle` | 29 | `border-divider` |

**This is the part a script cannot do.** Nothing in the class name says whether a
given border is a divider inside an object or the edge of one. Every one of the
178 has to be read.

## Sequence

1. **Clean the Figma canvas** — delete exploration scaffolding, keep the decided
   artifacts, lay the page out so the decision is legible.
2. **Update the Figma variables** to the new set. Safe to do before code: nothing
   reaches consumers until someone hits Publish.
3. **Define new tokens in CSS alongside the old.** Nothing breaks.
4. **Script the surface collapse** — the 351, verified by the audit gates.
5. **Hand-migrate the 178 borders**, component by component.
6. **Delete the old tokens** once nothing references them.
7. **Publish Figma and release code together.**

Do not publish Figma before step 7. That is the whole protection against drift.

## Consequences

**This is a major.** Every consumer sees a visual change, and anyone referencing
the old surface tokens directly has to migrate. Karm and the other consumers need
a DS Notice before it lands.

**It closes two register entries.** `SURFACE-BASE-GROUND` resolves — light becomes
`#ffffff`, Setu's approved canvas. `MENU-ITEM-HOVER` resolves — hover becomes
`surface-muted`, which is never the container's own colour.

**It supersedes the earlier proposals** in this thread: widening tonal gaps,
distinct-tier gates, and contextual layer modes were all solving the wrong
problem. Recorded here so nobody re-derives them.
