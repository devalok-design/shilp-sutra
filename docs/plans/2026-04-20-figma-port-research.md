# Figma Port — Research Notes

**Started**: 2026-04-20
**Status**: research-complete
**Purpose**: Capture learnings about how design-system Figma libraries are actually built, before rebuilding shilp-sutra's Figma library. Earlier attempts (4 Button rebuilds in one session) were reactive — this doc forces us to understand patterns before execution.

---

## Stream 1 — Figma Official Methodology

### Decision framework (the one we keep forgetting)

| If the change is… | Use |
|---|---|
| **Shape** (size, state, color variant) — a different designed component | **VARIANT property** |
| **A toggle/string/swap** on one shape (icon on/off, label text, swap avatar) | **Component Property** (BOOLEAN / TEXT / INSTANCE_SWAP) |
| **Context-driven theming** (light↔dark, desktop↔mobile) | **Variable mode** on a collection |
| **Consumer picks a replacement** from a curated list (icon in slot) | **INSTANCE_SWAP** with `preferredValues` |

**Quick test**: shape → variant. Toggle/string/swap on one shape → property. Theming → mode. Consumer-driven swap → instance swap.

### Component property types (5, not 4)

| Type | Use for | Notes |
|---|---|---|
| VARIANT | Axes that make variants unique (size, state, color) | Only on component sets |
| BOOLEAN | Layer-visibility toggle (icon on/off) | Binds only to `visible` |
| TEXT | Editable text string | No rich-text support |
| INSTANCE_SWAP | Swap nested-instance target | Supports `preferredValues` to curate pick-list |
| **SLOT (beta)** | Freeform area consumer can fill with any content | Newer — `setProperties` doesn't accept it |

**Composite "icon slot" pattern (canonical):**
- ONE `BOOLEAN` prop: "Start icon" — bound to the icon layer's `visible`
- ONE `INSTANCE_SWAP` prop: "Start icon icon" — bound to the nested instance's `mainComponent`
- Expose both via component properties on the parent, so they surface together in the right panel.

### Variable modes

- **Modes per collection**: Free/Starter = 1. Pro = **up to 4**. Org = up to 4. Enterprise = 40.
- **Our plan**: Pro (4 modes max) — fits light / dark / forced-colors + 1 spare.
- Per-instance mode overrides are supported on ANY node (frame, instance, page).
- Mode conflicts across chained libraries are a known pain — publish bottom-up.

### Publishing

- **No Plugin API or REST endpoint** to publish programmatically. Always a human click.
- Pull-based: consumers see a badge, opt into updates per file.
- You can uncheck assets at publish time. Use "Hide when publishing" on internal scaffolding.

### Dev Mode hierarchy

1. **Code Connect** (Org/Enterprise) — maps Figma node → GitHub path, shows real JSX
2. **Component description + documentationLinks** — the fallback that works on every plan
3. **Auto-generated code snippet** — generic React+Tailwind based on layer structure

We are on Pro → Code Connect unavailable → lean HARD on description + documentationLinks.

### Anti-patterns Figma explicitly warns against

1. **Variant explosion** — icon on/off as variants doubles the set for no reason. Use boolean prop.
2. **Variants for different icons** — icons are swap targets, not variants.
3. **Prototype connections with boolean-collapsed states** — prototyping noodles break.
4. **Large component sets** — importing one instance imports *every* variant; keep sets < 30 variants if possible, or split by category.
5. **Layer-name drift** — always edit variant props via the right panel, never by renaming the layer.
6. **Rich text in TEXT properties** — formatting strips.
7. **Mode conflicts across library chains** — publish DAG bottom-up.

---

## Stream 2 — Reference Library Study

### Library-by-library

| Library | Color intent | Icon slots | States | Sizes | Unique |
|---|---|---|---|---|---|
| **Polaris** | Variables with semantic chain `color-{element}-{role}-{prominence}-{state}` | Separate plugin (Iconduck) | Variant axis | Small-screen as **boolean** (clever) | "Specialty tokens" concept layer |
| **Vercel Geist** | No official Figma. Skip. | — | — | — | — |
| **Radix Themes** | `accentColor` + `grayColor` props (theme root), `highContrast` boolean | Children (code) | CSS pseudo-classes + 12-step scale | `size=1-4` + global `scaling=90-110%` | Theme-level `radius` + `scaling` knobs cascade |
| **Material 3** | Color **roles** via variable modes | **Instance-swap with preferredValues** (textbook) | **State-layer** overlay pattern | Variant axis | Dramatically reduced variant count (700→45 for lists) |
| **Figma UI3** | Variables with modes | Instance-swap | Variant | Variant | **Variable-mapped-to-variant** — mode change auto-swaps variant |
| **Atlassian** | `color.{property}.{intent}.{emphasis}.{state}` | Not documented | Encoded in **token names** (-hovered, -pressed) | Not documented | **3 themes** (light/dark/hc-light), token lifecycle formalized |

### ≥3-way consensus (best-practice defaults)

1. **Variables + modes for theming** (5 of 6). Light/dark as modes, not separate components. Add high-contrast as a third mode early.
2. **Semantic intent tokens** (4 of 6). `{role}.{intent}.{emphasis}.{state}` naming beats hue-based naming. Atlassian's taxonomy is most formal; Polaris is close.
3. **Interactive states as variants** (3 of 6). Hover/pressed/disabled/focus/loading → one `State` variant property. M3 refines with state-layer overlay.
4. **Icon slots via instance-swap + preferredValues** (universal Figma pattern, 2 explicit confirmations).
5. **Size as a variant axis** (4 of 6). Polaris's responsive-as-boolean is a clever twist.
6. **Global theme-level knobs** (Radix, M3, Atlassian) — radius / scaling / accent at theme root cascade to components.

### What to copy for shilp-sutra

- Variables-with-modes (light / dark / forced-colors)
- Intent-keyed semantic tokens matching our CVA `color` axis
- State as variant axis on interactive components
- Size as variant axis
- Instance-swap + preferredValues for icon slots
- **Skip**: Radix's 18 accent colors (too many), M3's state-layer overlay (over-engineered for our scale)

---

## Stream 3 — Token Tooling (Tokens Studio / DTCG / Style Dictionary)

### Verdict: **Keep custom scripts. Add DTCG-JSON side-channel emit. Do NOT adopt Tokens Studio.**

### Why not Tokens Studio

1. **OKLCH is load-bearing for our palette.** Tokens Studio free tier supports hex/RGB/RGBA/HSLA only; Pro adds LCH + P3 but **NOT OKLCH**. Round-tripping loses gamut.
2. **DTCG doesn't model modes.** Theming is explicitly "left to tooling." Our `.dark {}` + `@media (forced-colors)` has no canonical DTCG representation.
3. **Our custom scripts already work.** The CSS stays the runtime contract (Tailwind 4 `@theme`). Inverting the flow to JSON → CSS adds a lossy transformer for zero runtime benefit.

### What to do instead (2–4 hour win)

Extend `figma-sync-tokens.mjs` to also emit `dtcg.json` alongside `tokens.json`. Buys us: external tools (Style Dictionary for future iOS/Android, third-party Figma plugins) can consume without us adopting their workflow. CSS stays authoritative. One-way export, no lock-in.

### Cost of full Tokens Studio adoption (if ever)

~22-34 hours + ongoing maintenance of a second source of truth. Not worth it unless (a) designer asks for plugin-based edit flow, (b) OKLCH lands in Tokens Studio, or (c) we need multi-platform output.

---

## Stream 4 — Plugin API Deep-Dive

### Variable scoping (the thing we never set, which matters)

`VariableScope` controls where a variable appears in the picker. Per-type enums:

- **FLOAT**: `ALL_SCOPES | TEXT_CONTENT | CORNER_RADIUS | WIDTH_HEIGHT | GAP | OPACITY | STROKE_FLOAT | EFFECT_FLOAT | FONT_WEIGHT | FONT_SIZE | LINE_HEIGHT | LETTER_SPACING | PARAGRAPH_SPACING | PARAGRAPH_INDENT`
- **COLOR**: `ALL_SCOPES | ALL_FILLS | FRAME_FILL | SHAPE_FILL | TEXT_FILL | STROKE_COLOR | EFFECT_COLOR`
- **STRING**: `ALL_SCOPES | TEXT_CONTENT | FONT_FAMILY | FONT_STYLE`

**How to set**: `variable.scopes = ["CORNER_RADIUS"]`. We must do this on every variable — without it, designers see a cluttered picker with every float token offered for any float field.

### Alias chains

- Multi-hop supported, depth undocumented (works in practice).
- Dev Mode shows the semantic alias name (the one bound at the consuming component), not the terminal primitive. This is correct — it means designers see `accent/9` in Dev Mode, not `pink/9`.
- Deleting a mid-chain variable leaves dangling aliases; we're responsible for cleanup.

### Component property reference syntax `Name#NN:N`

- Suffix is **Figma-assigned and not predictable**.
- `editComponentProperty(id, { name: ... })` changes display name; suffix stays stable (overrides survive).
- Rule: **store the returned id the moment `addComponentProperty` returns.** Don't reconstruct.

### Instance swap + boolean composite

**No single property type exists.** Always TWO props:
1. `BOOLEAN` for visibility
2. `INSTANCE_SWAP` with `preferredValues` for target

This confirms our current pattern is correct (we just didn't know it was the canonical answer).

### setBoundVariable entry points

| Method | Scope |
|---|---|
| `node.setBoundVariable(field, v)` | Scalar fields on the node |
| `node.setBoundVariableForPaint(paint, field, v)` | Inside readonly Paint arrays |
| `textNode.setRangeBoundVariable(start, end, field, v)` | Typography ranges |

Bindable fields we've been using:
- **Layout**: width, height, opacity, paddingLeft/Right/Top/Bottom, itemSpacing, strokeWeight ✓
- **Corners**: topLeftRadius/topRightRadius/bottomLeftRadius/bottomRightRadius individually ✓
- **Composite**: `cornerRadius` bindable when all 4 share one var (convenience)
- **Typography** (HUGE win we missed): fontFamily, fontStyle, fontWeight, fontSize, lineHeight, letterSpacing are all bindable on TextNode AND TextStyle.

### Typography variables (2024 feature, we missed this)

**Text Styles can bind variables for every typography axis.** Means:
- ONE TextStyle per semantic role (heading-lg, body-md, label)
- Bind fontSize/lineHeight/fontWeight/letterSpacing to variables from `Primitives / Typography`
- Adding a new mode to the typography collection auto-updates every text using that style

This eliminates the "20 text styles frozen in time" problem we were worried about.

### Publishing

Confirmed: **no API**, always human-triggered UI action. `VariableCollection.getPublishStatusAsync()` returns status only. `LIBRARY_PUBLISH` webhook is read-only.

### Component metadata

- `component.description` — plain text, shows in Assets panel and Dev Mode.
- `component.documentationLinks = [{ uri }]` — array, links to Storybook/GitHub/llms.txt.
- `setRelaunchDataAsync({ command: description })` — attaches buttons that re-invoke the plugin (e.g., "Regenerate from source"). Useful for future sync workflows.

### Undo / rollback

- **Not automatic.** If a plugin call throws mid-run, already-applied mutations PERSIST. Figma does not transactionally roll back.
- Our earlier assumption ("throw rolls back changes") was wrong in the general case. The rollback we saw was because we threw *before* the mutations could commit — Figma's MCP `use_figma` call might wrap in its own transaction boundary, but we shouldn't rely on it.
- `figma.commitUndo()` creates undo checkpoints, it doesn't create transactions.

### Batch limits

No documented hard cap. Practical: 10k+ node mutations fine, 50k+ gets janky. Our 200-variant wiring timing out was a per-call MCP timeout, not a Figma API limit.

---

## Open questions — now answered

| Question | Answer |
|---|---|
| Is Tokens Studio a better pipeline than our custom script? | **No.** OKLCH blocker. Keep custom. Add DTCG emit. |
| Should we use DTCG as portable intermediate format? | **Yes, as side-channel.** Not as primary. |
| Is "State" a Figma variant axis? | **Yes.** Universal pattern across M3, UI3, Polaris. |
| How to handle `currentColor` icons? | No clean Figma equivalent. Options: (a) bind stroke per-intent via instance swap (nested color variants), (b) require designer to override per instance, (c) accept that icon color doesn't auto-adapt to button variant. **Verdict: (b) with docs**, since (a) explodes variant count and (c) is UX-bad. |
| Responsive single instance? | **No.** Always variants, but Polaris's "small-screen boolean" toggle is clever for simple cases. |

## Decisions log

- **D1** — Keep custom sync scripts. Extend with DTCG emit.
- **D2** — Variable scoping must be set on EVERY variable we create going forward. Retrofit existing ones.
- **D3** — Typography: one TextStyle per semantic role, with variables bound to size/leading/tracking/weight. Replace our 20 frozen-value text styles with 20 variable-bound styles.
- **D4** — States: one `State` variant axis with values: `default | hover | focus | pressed | disabled | loading`. Apply only to interactive components (Button, Input, IconButton, MenuItem, etc.).
- **D5** — Icons: keep instance-swap + boolean pattern. Set `preferredValues` on the swap prop to our 19 Tabler components.
- **D6** — Intent tokens: keep current `accent/error/success/warning/neutral` axis. Don't over-engineer to Atlassian's 7-intent taxonomy until we have a real need.
- **D7** — Sizes: variant axis. 4 values (xs/sm/md/lg) for now. Compact and Icon sizes deferred to separate component sets (IconButton, CompactButton) rather than variant-exploding Button.
- **D8** — Code Connect: skip until Enterprise upgrade. Use `description` + `documentationLinks` instead.
- **D9** — Publish gate: human-only. Always flag to user when library needs Publish click.

---

## Rebuild plan summary

See `docs/plans/2026-04-20-figma-port-design.md` (next doc) for the full step-by-step.

Headline:
1. Add variable **scopes** to all existing variables.
2. Convert frozen text styles to variable-bound text styles.
3. Rebuild Button with State axis (default/hover/focus/pressed/disabled/loading).
4. Set `preferredValues` on icon-swap properties to the 19 Tabler components.
5. Add component `description` + `documentationLinks` to every component (GitHub source path, Storybook URL).
6. Extend `figma-sync-tokens.mjs` to emit DTCG JSON alongside Figma JSON.
7. Archive current file state as `v0` snapshot before structural changes (via publish history).

---

## Sources

Full URL list in the original agent reports (consolidated in git history of this file). Key canonical references:

- developers.figma.com/docs/plugins/ (canonical, `figma.com/plugin-docs/` now redirects here)
- help.figma.com — component, variable, mode, publish articles
- polaris-react.shopify.com/design — Polaris tokens + components
- radix-ui.com/themes/docs — Radix theme architecture
- m3.material.io — Material 3 kit docs
- tokens.studio/docs + designtokens.org — Tokens Studio + DTCG spec
- styledictionary.com — Style Dictionary
- atlassian.design — Atlassian tokens taxonomy
