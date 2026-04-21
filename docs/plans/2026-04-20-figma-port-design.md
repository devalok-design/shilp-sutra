# Figma Port — Design Doc

**Date**: 2026-04-20
**Status**: design-approved (pending user review)
**Supersedes**: chat-drift from the same day. Earlier Figma file state treated as v0 prototype.
**Prerequisites**: `2026-04-20-figma-port-research.md` + `2026-04-20-figma-skills-inventory.md`

## Goals

1. Port the shilp-sutra DS into a Figma library that mirrors the code's authority structure: tokens from CSS → components from CVA.
2. Enable designers (Goutham, Yogin, Amal) to mock screens and request "intuition pixel" changes in Figma, which flow back to code via a documented loop.
3. Keep code as source of truth. Figma consumes; it does not dictate.
4. Make the workflow reproducible without an AI agent in the loop — repo scripts, not one-shot chat edits.

## Non-goals

- Not rebuilding in Tokens Studio or adopting DTCG as primary source.
- Not building Code Connect (Enterprise-only; defer).
- Not publishing until full Phase 2 complete (no partial library consumption).
- Not porting all 100+ components in one session. Phased by value.

## Architecture

### Variable collections

| Collection | Modes | Contents | Scoping |
|---|---|---|---|
| **Primitives / Color** | `light`, `dark` | ~180 variables across 15 OKLCH scales × 12 steps + neutral-0, surface-0 | `ALL_FILLS` (most) |
| **Semantic / Color** | `light`, `dark`, `forced-colors` | ~115 aliases: accent/*, secondary/*, surface/*, status/*, category/*, link/*, skeleton/* | `ALL_FILLS` by default; bound text colors also get `TEXT_FILL`; stroke tokens get `STROKE_COLOR` |
| **Primitives / Spacing** | `default` (later: `compact`, `comfortable` as modes) | spacing/01..13, spacing/{page-x,page-y,...}, size/{xs-plus,sm,md,lg} | `GAP`, `WIDTH_HEIGHT`, padding fields |
| **Primitives / Radius** | `default` | radius/{none,sm,base,md,lg,xl,2xl,full} | `CORNER_RADIUS` |
| **Primitives / Typography** | `default` (later: `mobile`, `desktop` as modes) | font-size/{xs..6xl}, line-height, tracking, font-weight, font-family | `FONT_SIZE`, `LINE_HEIGHT`, `LETTER_SPACING`, `FONT_WEIGHT`, `FONT_FAMILY` |

**Scoping is new**: every variable MUST have `scopes` set. Without it, designers see a cluttered picker. Current Figma state has NO scopes — retrofit required.

### Text Styles (variable-bound, not frozen)

ONE TextStyle per semantic role. Each binds fontSize/lineHeight/tracking/weight to `Primitives / Typography` variables.

Roles (20 total):
- `heading/2xl`, `heading/xl`, `heading/lg`, `heading/md`, `heading/sm`, `heading/xs`
- `body/lg`, `body/md`, `body/sm`, `body/xs`
- `label/lg`, `label/md`, `label/sm`, `label/xs` (uppercase)
- `label-plain/lg`, `label-plain/md`, `label-plain/sm` (mixed-case)
- `caption`, `overline`, `code`

Typography scales in multiple modes become possible later (e.g., `mobile` vs `desktop` with smaller base size on mobile) without rebuilding styles.

### Effect Styles

8 styles matching DS semantic shadows:
- `shadow/raised`, `shadow/raised-hover`, `shadow/floating`, `shadow/overlay`
- `shadow/brand`, `shadow/error`, `shadow/success`, `shadow/warning`

Already created. Will retrofit: apply to Button's solid variant.

### Component architecture

Every component has:

**Variant axes (discrete designed alternatives):**
- `Variant` — visual style (solid/soft/outline/ghost/link for Button; default/destructive for Card; etc.)
- `Color` — semantic intent (accent/error/success/warning/neutral)
- `Size` — xs/sm/md/lg (4 values universal)
- `State` — default/hover/focus/pressed/disabled/loading (only on interactive components)

**Component Properties (toggles on one designed variant):**
- `Label` TEXT — for any visible string
- `Start icon`, `End icon` BOOLEAN — visibility toggle
- `Start icon icon`, `End icon icon` INSTANCE_SWAP — with `preferredValues` set to our Tabler components
- Booleans for flags: `Full width`, `Pill shape`, `Loading`, etc. per CVA

**Variable bindings on every variant:**
- Padding (left/right/top/bottom) → `Primitives / Spacing`
- Corner radius (all 4 corners) → `Primitives / Radius`
- Item spacing → `Primitives / Spacing`
- Height / width → `Primitives / Spacing` (size/*)
- Fill / stroke / text color → `Semantic / Color`
- Shadow → Effect Style

**Metadata on every component:**
- `description` — purpose + 3 example use cases + SOURCE path
- `documentationLinks = [{ uri: "https://github.com/devalok-design/shilp-sutra/blob/main/packages/core/src/ui/<name>.tsx" }, { uri: "Storybook URL when published" }]`

### State-axis philosophy

- **Interactive components (Button, IconButton, Input, Select, Checkbox, Radio, MenuItem, Tabs, Switch)** → ship with State axis: `default | hover | focus | pressed | disabled | loading` (subset as relevant; Button has all 6, Checkbox has {default, hover, focus, disabled} only).
- **Display components (Card, Alert, Badge, Avatar, Text, Spinner)** → no State axis.
- **Overlays (Dialog, Sheet, Popover, DropdownMenu, Tooltip)** → no State axis on the container; the *triggers* inside have states.

**No loading/processing "animation" in Figma** — Figma is static. Show the visual state (spinner placeholder + disabled style) but don't try to animate.

### Icon handling

- 19 Tabler components already imported, bound to `surface/fg-muted`.
- Every INSTANCE_SWAP property's `preferredValues` will be set to ALL 19 tabler components, keeping the picker curated.
- **Known limitation**: Figma has no `currentColor`. Icon stroke won't auto-adapt to button intent. Designer override per instance, or separate per-intent icon component sets (deferred — too much duplication). Documenting as a known issue in component descriptions.

## Rebuild sequence (phased)

### Phase 1 — Foundation retrofit (4-6 hours)

Preserves existing file; adds/corrects foundational architecture that components depend on.

1. **Add scopes to all 352 existing variables** — one pass, script-driven via `use_figma`. Every Primitive/Color gets `ALL_FILLS`; every Semantic color gets `ALL_FILLS + TEXT_FILL` or `STROKE_COLOR` as appropriate; every Spacing var gets `GAP + WIDTH_HEIGHT + padding scopes`; every Radius var gets `CORNER_RADIUS`; every Typography var gets the correct typography scope.
2. **Rebuild 20 Text Styles as variable-bound** — replace frozen fontSize/lineHeight with bindings to `Primitives / Typography`.
3. **Extend `figma-sync-tokens.mjs`** to also emit DTCG JSON alongside existing output.
4. **Add mode sanity check** — walk every Semantic variable, verify all 3 modes resolve without dangling aliases.

### Phase 2 — Button canonical rebuild (2-3 hours)

Archive current Button. Rebuild with:

- 5 Variant × 5 Color × 4 Size × 6 State = **600 variants**. Yes, this is a lot — State really is that many. We mitigate by:
  - Splitting Button into `Button` (text), `IconButton` (icon-only), `CompactButton` (tight layouts). Each has its own variant matrix.
  - For Button: 5×5×4×6 = 600. Accept.
  - For IconButton: 5×5×4×6 = 600. Accept (or cap at default+hover+pressed+disabled = 400).
  - For CompactButton: compact-{xs,sm,md} × 5×5×6 = 450.
- Every variant has:
  - Label TEXT prop
  - Start icon BOOLEAN + INSTANCE_SWAP prop with preferredValues
  - End icon BOOLEAN + INSTANCE_SWAP prop with preferredValues
  - Pill shape BOOLEAN
  - Full width BOOLEAN
  - All geometry bound to variables
  - Fill/stroke/text bound to Semantic/Color variables
  - Shadow (on solid variant) using Effect Style
  - description + documentationLinks

If 600 variants is too unwieldy to render/navigate: split by Variant into separate component sets per visual style (`Button / Solid`, `Button / Soft`, `Button / Outline`, `Button / Ghost`, `Button / Link`) → 5 sets × 120 variants = manageable. Decision to be made once we see the matrix.

### Phase 3 — Drift-detection loop (1-2 hours)

- Wire up `figma-drift-check.mjs` to actually pull live state via `get_design_context` or `get_variable_defs` and persist to `.figma/live/<component>.json`.
- Document the loop in `CONTRIBUTING.md` with a concrete example.
- Test: designer changes something small in Figma → user runs `pnpm figma:check button` → script reports drift → user confirms → Claude Code applies CVA change.

### Phase 4 — Badge, Alert, Card (3-4 hours)

Non-interactive components, no State axis. Should be fast given Button's architecture is reusable.

### Phase 5 — Interactive primitives (4-6 hours)

IconButton, CompactButton, Input, Checkbox, Radio, Switch, Tabs. State axis on all.

### Phase 6 — Overlays (4-6 hours)

Dialog, Sheet, Popover, Tooltip, DropdownMenu, HoverCard. These are compound components — Figma representation is "header + body + footer" slotted frames, not full interactive surfaces.

### Phase 7 — User clicks Publish

Run `design-systems:audit-system` + `design-systems:accessibility-audit` first. Fix any issues. Then user publishes. Other Figma files can now consume `@Shilp Sutra`.

### Phase 8 — Expand to remaining ~80 components

Incrementally, as designers request them. Not one batch.

## The sync loop (diagram)

```
┌──────────────────────────────────────────────────────────┐
│  packages/core/src/tokens/*.css   ← SOURCE OF TRUTH     │
│  packages/core/src/ui/*.tsx       ← CVA = SOURCE OF TRUTH│
└──────────────────────────────────────────────────────────┘
                │
                ▼  figma-sync-tokens.mjs  (pnpm figma:sync)
                │  figma-sync-components.mjs <name>
                │  → emits .figma/tokens.json + components/*.json
                │
                ▼  Claude Code agent with use_figma MCP
                │  reads JSON → creates/updates Variables + Components
                │  (script-driven, reproducible, same output every time)
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│  Figma file: Shilp Sutra — Design System                 │
│  (designers mock screens, tweak pixels, leave comments)  │
└──────────────────────────────────────────────────────────┘
                │
                ▼  designer makes change + comments on variant
                │
                ▼  user runs figma-drift-check.mjs <name>
                │  → diffs live Figma state vs CVA spec
                │  → reports what drifted
                │
                ▼  Claude Code applies CVA change, bumps patch,
                │  publishes npm package, re-runs sync to Figma
                │
                └──────── loop closes
```

## Success criteria (testable)

- [ ] Every variable in the file has non-empty `scopes` array
- [ ] Every Text Style has at least fontSize bound to a variable
- [ ] Toggling Semantic/Color from light→dark recolors every variant live (no broken aliases)
- [ ] Toggling Semantic/Color to forced-colors shows Canvas/CanvasText placeholder (not a broken state)
- [ ] Every shipped component has non-empty description + at least one documentationLink
- [ ] Every Button variant's fill, stroke, text color, and corners are variable-bound
- [ ] Designer can place a Button, swap the start icon, change to `Color=error, State=hover`, and see exactly what a coded `<Button color="error">` would render on :hover
- [ ] `node packages/core/scripts/figma-drift-check.mjs button` returns "no drift" when Figma matches the CVA

## Decisions (from research)

Copied from research doc for visibility:

- **D1** — Keep custom sync scripts. Extend with DTCG emit.
- **D2** — Variable scoping mandatory on every variable. Retrofit.
- **D3** — Text styles: variable-bound, not frozen.
- **D4** — State axis values: `default | hover | focus | pressed | disabled | loading`. Only on interactive components.
- **D5** — Icon slots: instance-swap + boolean pair, with `preferredValues` curating to 19 Tablers.
- **D6** — Intent axis stays: `accent | error | success | warning | neutral`.
- **D7** — Sizes stay variant axis: `xs | sm | md | lg`. Compact/Icon live in sibling component sets.
- **D8** — Code Connect blocked by plan. Use description + documentationLinks.
- **D9** — Publishing always human-triggered. Flag to user.
- **D10** (new) — If variant explosion > 500, split component set by Variant visual-style. `Button/Solid`, `Button/Soft`, etc. Evaluate when we get there.

## What we explicitly defer

- Hover/pressed/loading simulation as Figma interactions (prototyping). Design wants visual fidelity, not click-through.
- Icon auto-recoloring per Button intent (`currentColor` workaround). Too much duplication.
- Chromatic Figma plugin setup — blocked by `CHROMATIC_PROJECT_TOKEN` secret (not configured).
- Multi-theme support beyond light/dark/forced-colors. Current brand is single.
- Mobile/desktop spacing modes. Adopt when first consumer hits the responsive ceiling.

## Ownership

- **User** — Publishes library, approves drift changes, makes final pixel calls.
- **Claude Code (any session)** — Runs sync scripts, executes `use_figma` builds, reports drift.
- **Designers** — Consume library, mock screens, flag drift via Figma comments with `#ds-change` tag.

## Open questions that blocked earlier work

- ~~Should Color be a variant axis or mode?~~ **Variant axis** (decided).
- ~~Is `use_figma` transactional?~~ **No** (decided; wrap risky ops).
- ~~Can we bind cornerRadius as a single composite?~~ **Yes** if all 4 corners share a variable (decided).

## References

- `docs/plans/2026-04-20-figma-port-research.md`
- `docs/plans/2026-04-20-figma-skills-inventory.md`
- `CLAUDE.md` — "Figma Component Generation (MANDATORY checklist)" section
- `memory/feedback_figma_component_checklist.md` — prevention gotchas
- `packages/core/scripts/figma-sync-{tokens,components,drift-check}.mjs` — existing automation
- Figma file: https://www.figma.com/design/diyRzIcyZUXsmwrBlsyAJl/Shilp-Sutra
