# Figma Foundations Spec — Phase 1

**Date**: 2026-08-18
**Status**: **BUILT.** Phase 1 and Phase 2 complete and validated in `bcBO7RgVYR4ulwPr3j2heY`.

## As built

Counts moved during the build, mostly because the token parser was fixed mid-flight and started returning tokens that had never been visible before.

| Collection | Modes | Planned | Built | Why it moved |
|---|---|---|---|---|
| Primitives/Color | Light, Dark | ~180 | **215** | 3 derived Waybill ramps, plus `neutral/0` and `surface/0` which the oklch-only parser had skipped |
| Seeds | Value | 44 | **51** | Waybill seeds |
| Brand | Devalok, Waybill | 72 | **66** | intents have real step lists, not a uniform 12 |
| Semantic/Color | Light, Dark | ~140 | **162** | 138 tokens + 24 role shortcuts |
| Spacing | Value | 32 | **34** | `max-width`, `max-width-body` recovered from the parser fix |
| Radius | Value | 16 | **16** | |
| Typography | Value | 34 | **34** | |
| **Border** | Value | *(not planned)* | **5** | `--border-width-*` and `--border-focus-*`, invisible to every previous export |
| Component/Style, /Intent, /Shape | 5, 5, 2 | *(Phase 3)* | **19** | kept from the spike so 4,962 icon bindings survive |

**602 variables · 20 text styles · 8 effect styles · 11 collections.**
Audit: zero `ALL_SCOPES`, zero `ALL_FILLS`, zero broken aliases, zero unset modes, zero missing code syntax, zero em dashes in copy.

Pages built: Cover, Getting Started, Foundations, Icons. Components and Utilities are empty placeholders.

**Original spec follows, unedited apart from this header.**
**Decisions**: [`2026-08-18-figma-library-build-plan.md`](./2026-08-18-figma-library-build-plan.md) D1–D23
**Mechanics**: [`2026-08-18-figma-build-playbook.md`](./2026-08-18-figma-build-playbook.md)

Every collection, mode, variable group, scope and alias chain that Phase 1 will create. Numbers are counted from `.figma/tokens.json`, not estimated.

---

## 1. Collections

| # | Collection | Modes | Variables | Purpose |
|---|---|---|---|---|
| 1 | `Primitives/Color` | Light, Dark | ~180 | 15 raw ramps × 12 steps. Hidden from pickers |
| 2 | `Seeds` | Value | 30 | hue + chroma per ramp — the tuning surface (D13) |
| 3 | `Brand` | Devalok, Waybill | 72 | 6 intents × 12 steps, aliasing Primitives. One mode switch rebrands |
| 4 | `Semantic/Color` | Light, Dark | ~140 | The public colour API. Aliases Brand or Primitives |
| 5 | `Spacing` | Value | 32 | |
| 6 | `Radius` | Value | 16 | |
| 7 | `Typography` | Value | 34 | size, leading, tracking, weight, family |

**~504 variables.** Seven collections; none exceeds the measured 10-mode ceiling. Per-component collections (`Component/Button` etc., D18) are created in Phase 3, not here.

Existing `SPIKE Style` and `SPIKE Intent` are **renamed into** `Component/Button` and reused — never deleted — so the 4,962 icon bindings survive (D22 dependency).

---

## 2. Naming

Lowercase, slash-separated, **no spaces around slashes** — Figma would create a group literally named `"color "` with a trailing space. Corrects the illustrative examples in D15.

```
color/accent/9          NOT  Color / Accent / 09
spacing/16              NOT  spacing/ds-05
radius/control
```

Two deliberate divergences from the CSS names, both to make the picker legible:

| Code | Figma | Why |
|---|---|---|
| `--spacing-ds-05` | `spacing/16` | `ds-05` says nothing; `16` is the actual pixel value |
| `--text-ds-md` | `typography/size/14` | same reasoning |

Every variable carries its **exact CSS name** in WEB code syntax, so Dev Mode shows `var(--spacing-ds-05)` regardless of the Figma label (D15).

Variant property values use **Title Case** (`Default`, `Hover`, `Solid`) mapping to lowercase in code — Figma convention.

---

## 3. The alias chain

```
Seeds            accent/hue = 360    accent/chroma = 0.19
                        │  (regenerator plugin reads these, rewrites the ramp)
                        ▼
Primitives       pink/1 … pink/12        raw OKLCH→sRGB, scopes []
                        │
                        ▼
Brand            brand/accent/9  →  Devalok: pink/9   Waybill: blue-derived/9
                        │
                        ▼
Semantic         accent/9        →  brand/accent/9
                 surface/raised  →  neutral/1        (neutrals skip Brand)
                        │
                        ▼
Component        button/bg       →  accent/9         (Phase 3)
```

Intents route through Brand; neutrals and surfaces alias Primitives directly, since they don't rebrand.

**Designers tune at two points only** (D13): the `Seeds` values, and which step a `Semantic` variable points at. Nothing else is editable by design.

---

## 4. Variables per collection

### 4.1 Primitives/Color — 15 ramps × 12, modes Light + Dark

```
pink purple red green yellow blue teal amber amber-bright
slate indigo cyan orange emerald neutral
```
`amber-bright` has 9 steps, not 12. Scopes `[]` — invisible in every picker; the semantic layer is the public API.

### 4.2 Seeds — 43 FLOAT + 1 BOOLEAN

Per ramp: `seeds/<ramp>/hue` (0–360) and `seeds/<ramp>/chroma`. Scopes `[]`. Consumed by nothing — read by the regenerator plugin, written back by `figma-pull-tokens.mjs`.

Five ramps also carry **contrast corrections** on the solid steps, because the generic lightness curve does not clear WCAG for every hue:

```
                light9    dark9    dark10
pink                 —    -0.09    -0.09
red                  —    -0.09    -0.09
green            -0.03    -0.09    -0.09
blue                 —    -0.09    -0.09
neutral          -0.01        —         —
```

Omitting these was a real bug in `generate-scale.ts` — it could not reproduce `primitives.css`, so regenerating any intent ramp silently reverted the contrast fix. Now modelled and verified at 336/336 by `figma-plugin/verify-parity.mjs`.

`seeds/neutral/neutral = true` (BOOLEAN) marks the ramp that skips the dark-mode chroma boost.

### 4.3 Brand — 6 intents × 12, modes Devalok + Waybill

`brand/{accent,error,success,warning,info,neutral}/1…12`, aliasing Primitives. Scopes `[]`.

Waybill mode is `Waybill (derived, unapproved)`; **its error AND info steps render a visible placeholder** (9 steps each, verified by resolving every Brand variable under the Waybill mode). Waybill's palette contains no red, and its only blue is already spent on accent, so an info blue would be indistinguishable from accent. Inventing either would misrepresent a client's brand (Setu gap filed).

### 4.4 Semantic/Color — ~140, modes Light + Dark

| Group | Count | Aliases |
|---|---|---|
| accent | 13 | Brand |
| secondary | 13 | Primitives (purple) |
| error / success / warning / info | 10 each | Brand |
| neutral | 12 | Primitives |
| surface | 22 | Primitives |
| category | 28 | Primitives |
| link, skeleton, segment, backdrop, overlay, disabled | 10 | mixed |

Scopes by role, from the step purposes in `generate-scale.ts`:

```
1–5   FRAME_FILL, SHAPE_FILL      backgrounds
6–8   STROKE_COLOR                borders
9–10  FRAME_FILL, SHAPE_FILL      solid
11–12 TEXT_FILL                   text
*-fg*        TEXT_FILL
*-border*    STROKE_COLOR
shadow/*     EFFECT_COLOR
```

`ALL_FILLS` is never used — it is exclusive and throws when combined with any other fill scope (playbook §2).

### 4.5 Role shortcuts (D16)

Per intent, aliasing the numbered steps:

```
accent/background → 3     accent/border → 7
accent/solid      → 9     accent/text   → 11
```

6 intents × 4 = 24 extra variables. Designers pick by number or by meaning.

### 4.6 Spacing — 32 · Radius — 16 · Typography — 34

Spacing named by pixel value (`spacing/16`), scopes `GAP` + `WIDTH_HEIGHT`. Radius keeps its **role** names (`radius/control`, `radius/surface`, `radius/pill`), scope `CORNER_RADIUS` — the DS is role-based here and the Button build already binds `radius/control`.

Typography splits by scope: `FONT_SIZE`, `LINE_HEIGHT`, `LETTER_SPACING`, `FONT_WEIGHT`, `FONT_FAMILY`.

---

## 5. Text styles — 20

One per semantic role, **every axis bound to a variable** rather than frozen:

```
heading/2xl xl lg md sm xs      body/lg md sm xs
label/lg md sm xs               label-plain/lg md sm
caption   overline   code
```

Bind `fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`, `fontFamily` via `setBoundVariable`. `lineHeight` and `letterSpacing` must be `{value, unit}` objects — bare numbers throw.

Fonts: **Inter** and **Manrope**, both confirmed present. Note the mismatched style naming — Inter uses `"Semi Bold"` (space), Manrope uses `"SemiBold"` (none). Ranade is absent and unused; its token is recorded for Dev Mode fidelity but bound to nothing.

## 6. Effect styles — 8

`shadow/{raised, raised-hover, floating, overlay, brand, error, success, warning}`

Effect colour, radius, spread and offsets are variable-bindable; `setBoundVariableForEffect` returns a **new** effect object that must be captured and reassigned.

---

## 7. Pages

Plain-name convention (Simple DS / Material 3 / Polaris). Cover first, foundations before components, utilities last.

```
Cover
Getting Started
Foundations
Icons
———
Components          (Phase 3)
———
Utilities
```

Foundations page: 1440px root frame, 80px section gaps, sections for colour ramps, semantic roles, type specimen, spacing, radius, shadows, icons, and a page explaining modes and the brand switch.

**Every swatch, bar and card is bound to its variable, never hardcoded.** This is what makes the page a live tuning surface — re-point a token or regenerate a ramp and the documentation updates itself.

---

## 8. Build sequence

Each step validated before the next; `use_figma` is atomic, so a failure rolls back cleanly.

1. Rename `SPIKE Style` → `Component/Button`, `SPIKE Intent` → retire after Brand exists. **Never delete** — icon bindings live on `component/fg`
2. `Primitives/Color` + both modes + 180 variables, scopes `[]`
3. `Seeds` — 30 floats
4. `Brand` + both modes + 72 aliases
5. `Semantic/Color` + both modes + ~140 aliases + 24 role shortcuts
6. `Spacing`, `Radius`, `Typography`
7. Code syntax on every variable
8. 20 variable-bound text styles
9. 8 effect styles
10. Validation pass

## 9. Exit criteria

- [ ] Every collection exists with the right mode count
- [ ] Primitives and Seeds and Brand: `scopes = []`
- [ ] Semantic: role-targeted scopes, **zero** `ALL_SCOPES`, **zero** `ALL_FILLS`
- [ ] Every variable has WEB code syntax carrying its real CSS name
- [ ] Zero broken aliases — every alias resolves in every mode
- [ ] Light ↔ Dark recolours everything; Devalok ↔ Waybill switches intents only
- [ ] 20 text styles exist, each with at least `fontSize` bound
- [ ] 8 effect styles exist
- [ ] `component/fg` still bound by all 4,962 icons

## 10. Open

- **Waybill error and info have no anchor.** Both render placeholders. Setu gap filed; needs Waybill to supply a red, and a second blue distinct from accent.
- **Canvas is off-brand** (`#f5f5f5` vs Setu's `#ffffff`/`#f8f4f5`). Built faithfully and flagged for the tuning pass (D21).
- **Spacing rename** (`ds-05` → `16`) is a Figma-side label change only; code is untouched and code syntax preserves the real name.
