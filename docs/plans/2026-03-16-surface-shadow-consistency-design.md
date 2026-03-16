# Surface & Shadow Token Consistency — Design Document

**Date:** 2026-03-16
**Status:** Approved (reviewed by Token Systems Council)
**Scope:** `packages/core/src/tokens/semantic.css`, `packages/core/src/tailwind/preset.ts`, all component files

## Motivation

The current surface (surface-1 through surface-4) and shadow (shadow-01 through shadow-05) tokens are functional but have three problems:

1. **Numeric names don't communicate intent.** A developer seeing `shadow-03` doesn't know if it's the card shadow or the popover shadow without checking documentation.
2. **Shadows use pure black** (`oklch(0 0 0)`), creating washed-out gray zones instead of natural depth.
3. **No tokens for decorative effects** (glow, inset, ring), forcing hardcoded values in ~10 components.

This design introduces a **semantic layer** on top of the existing primitives, upgrades shadow quality using industry-standard techniques (tinted multi-layer shadows), and connects surface/shadow decisions to the existing z-index and motion systems.

## Architecture: Two-Layer Tokens

```
primitives.css (raw values)     →  semantic.css (role-based aliases)
  --neutral-1 through --neutral-12       --color-surface-base: var(--neutral-1)
  --shadow-xs through --shadow-lg        --shadow-raised: var(--shadow-xs)
  --color-surface-0 (NEW)               --color-surface-sunken: var(--color-surface-0)
  --shadow-color (NEW)                   --shadow-floating: var(--shadow-md)
```

Components use **only** semantic tokens. Primitives are internal, for theme tuning.

## Surface Tokens

### Semantic layer (public API — what components use)

| Token | Primitive | Light value | Dark value | Role |
|-------|-----------|-------------|------------|------|
| `surface-base` | `neutral-1` | `oklch(0.99 0.0003 350)` | `oklch(0.11 0.0002 350)` | Page background |
| `surface-sunken` | `surface-0` (new) | `oklch(0.945 0.008 360)` | `oklch(0.07 0.008 360)` | Shell chrome, board columns |
| `surface-raised` | `neutral-2` | `oklch(0.97 0.0008 350)` | `oklch(0.17 0.0007 350)` | Cards, widgets, panels |
| `surface-overlay` | `neutral-1` | `oklch(0.99 0.0003 350)` | `oklch(0.13 0.0002 350)` | Dialogs, popovers, sheets |
| `surface-raised-hover` | `neutral-3` | `oklch(0.93 0.0018 350)` | `oklch(0.23 0.0019 350)` | Hover on raised elements |
| `surface-raised-active` | `neutral-4` | `oklch(0.89 0.0029 350)` | `oklch(0.29 0.0029 350)` | Pressed/active states |
| `surface-inverted` | `neutral-12` | `oklch(0.32 0.0042 350)` | `oklch(0.88 0.0024 350)` | Tooltips, inverted badges |
| `surface-inverted-fg` | `neutral-1` | `oklch(0.99 0.0003 350)` | `oklch(0.11 0.0002 350)` | Text on inverted surfaces |
| `surface-disabled` | `neutral-2` | same as raised | same as raised | Disabled elements (+ reduced opacity) |

### Foreground tokens (unchanged)

| Token | Primitive | Role |
|-------|-----------|------|
| `surface-fg` | `neutral-12` | Primary text |
| `surface-fg-muted` | `neutral-11` | Secondary text |
| `surface-fg-subtle` | `neutral-8` | Tertiary text, placeholders |
| `surface-fg-disabled` | `neutral-12` at 35% opacity | Disabled text |

### New primitive: `surface-0`

Added to `primitives.css` as step 0 of the neutral scale. Uses brand hue (360) with elevated chroma (0.008) to create a warm, recessed feel distinct from the purely neutral raised surface.

```css
/* Light */
--color-surface-0: oklch(0.945 0.008 360);
/* Dark */
--color-surface-0: oklch(0.07 0.008 360);
```

### Dark mode: `surface-overlay` divergence

In dark mode, `surface-overlay` is slightly lighter than `surface-base` to differentiate floating elements from the page background. This matches Material Design 3's tonal elevation approach.

```css
/* Light: overlay = base (shadow does the work) */
--color-surface-overlay: var(--neutral-1);
/* Dark: overlay diverges slightly lighter */
--color-surface-overlay: oklch(0.13 0.0002 350); /* ~0.02 lighter than base */
```

## Border Tokens

### Three-tier hierarchy

| Token | Primitive | Light | Dark | Role |
|-------|-----------|-------|------|------|
| `surface-border-subtle` | `neutral-4` | `oklch(0.89 0.0029 350)` | `oklch(0.22 ...)` | Hairline dividers, table rows |
| `surface-border` | `neutral-5` | `oklch(0.84 0.0042 350)` | `oklch(0.30 ...)` | Structural borders (existing) |
| `surface-border-strong` | `neutral-6` | `oklch(0.78 0.0053 350)` | `oklch(0.38 ...)` | Emphasized separators (existing) |

`border-subtle` is the only new token. It maps to the existing `neutral-4` step.

### Backdrop

```css
--color-backdrop: oklch(0 0 0 / 0.4);  /* light */
--color-backdrop: oklch(0 0 0 / 0.6);  /* dark — heavier for contrast */
```

## Shadow Tokens

### New primitive: `--shadow-color`

Current shadows use pure black (`oklch(0 0 0)`). Research from Stripe, Josh Comeau, and Open Props shows tinted shadows create more natural depth. We introduce a tinted shadow color:

```css
--shadow-color: 0.15 0.015 260; /* dark desaturated blue (H:260, cool) */
```

**Design rationale — cool elevation, warm effects:** The shadow color is cool blue (260) while the surface system is warm (350/360). This is intentional: elevation shadows should recede behind content (cool blue is atmospheric and recessive), while effect shadows (brand, glow, ring) use the warm accent color to attract attention. This mirrors how Stripe handles shadow coloring. At tint strength 0.015 and layer opacities of 3-5%, the blue tint is subliminal — felt as natural depth, not seen as a color. The `--shadow-color` variable makes the hue trivially changeable if real-world testing reveals issues.

### Shadow technique

Each semantic shadow uses 4-6 layers following the **doubling progression** (Comeau technique):
- **Layer 1**: `0 0 0 1px` border-ring (crisp edge, like Radix)
- **Layers 2-N**: Offset and blur roughly double per layer, opacity decreases
- **Negative spread** on outer layers keeps shadows contained and directional

Dark mode uses a **strength multiplier** (2.5x) rather than redefining every shadow individually. This matches the existing system's ratio (current shadow-01 light peak alpha 0.10 → dark 0.25 = 2.5x) and the Open Props approach.

### Primitive layer (internal)

| Token | Layers | Role |
|-------|--------|------|
| `shadow-xs` | ring + 3 key | Subtle resting depth |
| `shadow-sm` | ring + 4 key | Interactive hover lift |
| `shadow-md` | ring + 4 key | Floating UI depth |
| `shadow-lg` | ring + 5 key | Heavy overlay depth |

`shadow-05` is removed (unused in any component).

### Semantic elevation tokens (public API)

| Token | Primitive | Role |
|-------|-----------|------|
| `shadow-raised` | `shadow-xs` | Resting cards, widgets, shell chrome |
| `shadow-raised-hover` | `shadow-sm` | Interactive card hover, button hover |
| `shadow-floating` | `shadow-md` | Popovers, menus, dropdowns, toasts |
| `shadow-overlay` | `shadow-lg` | Dialogs, modals, command palette |

### Effect tokens (non-elevation)

| Token | Role | Composition |
|-------|------|-------------|
| `shadow-brand` | Accent glow on brand interactions | Multi-layer accent-colored glow (existing, refined) |
| `shadow-glow` | Selection highlight, active indicator | 1.5px accent ring + 7px accent blur |
| `shadow-inset` | Deboss for toggle/segmented tracks | 2-layer inset shadow using shadow-color |
| `shadow-ring-sm` | Escape hatch — subtle 1px separator | `0 0 0 1px surface-border` |
| `shadow-ring` | Focus indication (`:focus-visible`) | `0 0 0 2px accent` |

### Shadow composability

CSS `box-shadow` replaces, it doesn't compose. For elements needing combined states:

- **Focused card**: `shadow-raised, shadow-ring` (comma-concatenation in component)
- **Selected + hovered**: `shadow-glow, var(--shadow-sm)` (compose via `var()`)
- No pre-made composites — components own their combinations. This avoids combinatorial explosion.

## Integration with Existing Systems

### z-index (already defined — no changes)

The existing z-index scale maps naturally to surface/shadow pairings:

| z-level | Surface | Shadow | Components |
|---------|---------|--------|------------|
| `z-base` (0) | `surface-base` | none | Page content, layout |
| `z-raised` (10) | `surface-raised` | `shadow-raised` | Cards, widgets |
| — (DOM order) | `surface-sunken` | `shadow-raised` | Sidebar, topbar (grid layout, no z-index needed) |
| `z-dropdown` (1000) | `surface-overlay` | `shadow-floating` | Select, combobox |
| `z-sticky` (1100) | `surface-sunken` | `shadow-raised` | Sticky headers |
| `z-overlay` (1200) | `surface-overlay` | `shadow-overlay` | Sheet, dialog backdrop |
| `z-modal` (1300) | `surface-overlay` | `shadow-overlay` | Dialog, alert-dialog |
| `z-popover` (1400) | `surface-overlay` | `shadow-floating` | Popover, dropdown-menu |
| `z-toast` (1500) | `surface-overlay` | `shadow-floating` | Toast notifications |
| `z-tooltip` (1600) | `surface-inverted` | `shadow-floating` | Tooltip |

### Motion (already defined — use existing presets)

Shadow/surface transitions use the existing motion system:

| Transition type | CSS approach | Framer Motion approach |
|----------------|-------------|----------------------|
| Hover shadow lift | `transition: box-shadow var(--duration-fast-02) var(--ease-productive-standard)` | `colorShift` tween preset |
| Surface color change | `transition: background-color var(--duration-fast-01) var(--ease-productive-standard)` | `colorShift` tween preset |
| Card drag pick-up | — | `snappy` spring preset |
| Dialog enter/exit | — | `smooth` spring + `MotionScale` primitive |

**Reduced motion**: The existing `MotionProvider` respects `prefers-reduced-motion`. Shadow transitions should use CSS `transition` so they also respect `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0ms !important; } }`.

### Accessibility: forced-colors / high-contrast

In `@media (forced-colors: active)`, all shadows are removed by the browser. Components must ensure edge definition through borders in this mode:

```css
@media (forced-colors: active) {
  .card { border: 1px solid CanvasText; }
}
```

This is not a new token — it's a rule enforced during component implementation.

## Component Decision Matrix

### Surface assignment

| Building a... | Surface | Shadow | Border |
|---------------|---------|--------|--------|
| Page / layout | `surface-base` | none | none |
| Shell chrome (sidebar, topbar) | `surface-sunken` | `shadow-raised` | `border-subtle` (section dividers) |
| Card / widget / panel | `surface-raised` | `shadow-raised` | none (ring in shadow) |
| Card flat/outline variant | `surface-raised` | none | `border-default` or `border-strong` |
| Interactive card hover | `surface-raised` (unchanged) | `shadow-raised-hover` | none |
| Board column / well | `surface-sunken` | none | none |
| Popover / menu / dropdown | `surface-overlay` | `shadow-floating` | none (ring in shadow) |
| Dialog / modal / sheet | `surface-overlay` | `shadow-overlay` | none (ring in shadow) |
| Tooltip | `surface-inverted` | `shadow-floating` | none |
| Toast / notification | `surface-overlay` | `shadow-floating` | none |
| Input control (rest) | `surface-overlay` | none | `border-default` |
| Input control (hover) | `surface-overlay` | none | `border-strong` |
| Input control (focus) | `surface-overlay` | `shadow-ring` | `border-accent` |
| Input control (error) | `surface-overlay` | none | `border-destructive` |
| Button (solid) | accent colors | `shadow-raised` | none |
| Button (ghost/outline) | transparent | none | `border-default` |
| Button (disabled) | `surface-disabled` | none | `border-subtle` |
| Segmented track | `surface-sunken` | `shadow-inset` | none |
| Selected item | current surface | `shadow-glow` | none |
| Dragging item | `surface-raised` | `shadow-overlay` | none |

### Hard rule: never combine explicit border + shadow ring

Every shadow level starts with a `0 0 0 1px` ring layer. Adding a CSS `border` on the same element creates a 2px edge (1px ring + 1px border). **Choose one or the other, never both.**

- Has shadow → no border (ring provides the edge)
- No shadow → use border (flat/outline variants, inputs)

## What Changes

### New primitives (added to files)

| Token | File | Type |
|-------|------|------|
| `--color-surface-0` | `primitives.css` | Color step (light + dark) |
| `--shadow-color` | `semantic.css` | Shadow color (light + dark) |
| `--color-backdrop` | `semantic.css` | Backdrop overlay |
| `--color-surface-border-subtle` | `semantic.css` | Maps to `neutral-4` |

### Renamed tokens (semantic aliases)

| Old | New | Maps to |
|-----|-----|---------|
| `--color-surface-1` | `--color-surface-base` | `neutral-1` |
| `--color-surface-2` | `--color-surface-raised` | `neutral-2` |
| `--color-surface-3` | `--color-surface-raised-hover` | `neutral-3` |
| `--color-surface-4` | `--color-surface-raised-active` | `neutral-4` |
| `--shadow-01` | `--shadow-raised` → `--shadow-xs` | refined multi-layer value |
| `--shadow-02` | `--shadow-raised-hover` → `--shadow-sm` | refined multi-layer value |
| `--shadow-03` | `--shadow-floating` → `--shadow-md` | refined multi-layer value |
| `--shadow-04` | `--shadow-overlay` → `--shadow-lg` | refined multi-layer value |

### New tokens (no predecessor)

| Token | Role |
|-------|------|
| `--color-surface-sunken` | Shell chrome, board columns |
| `--color-surface-overlay` | Floating elements (diverges in dark mode) |
| `--color-surface-inverted` / `--color-surface-inverted-fg` | Tooltips, inverted badges |
| `--color-surface-disabled` / `--color-surface-fg-disabled` | Disabled elements |
| `--shadow-glow` | Selection/focus glow |
| `--shadow-inset` | Toggle/segmented deboss |
| `--shadow-ring` / `--shadow-ring-sm` | Focus ring / escape hatch |
| `--color-backdrop` | Dialog/sheet backdrop |

### Removed

| Token | Reason |
|-------|--------|
| `--shadow-05` | Unused in any component |
| Old numeric Tailwind utilities (`shadow-01` through `shadow-05`) | Replaced by semantic names |
| Old numeric Tailwind utilities (`bg-surface-1` through `bg-surface-4`) | Replaced by semantic names |

### Unchanged

All foreground tokens (`surface-fg`, `surface-fg-muted`, `surface-fg-subtle`), existing border tokens (`surface-border`, `surface-border-strong`), z-index scale, motion tokens, motion primitives, and framer-motion presets remain unchanged.

### Shadow transition token

A shared CSS custom property ensures all shadow transitions feel consistent:

```css
--shadow-transition: box-shadow var(--duration-fast-02) var(--ease-productive-standard);
```

Components apply this via `transition: var(--shadow-transition)`. This wires into the existing motion system without creating parallel tokens.

## Migration Strategy

**Single breaking release (core + karm together) with a comprehensive transition guide.** All changes ship at once — no deprecation bridge. The transition guide provides a clear find-replace mapping so consumers can migrate in minutes.

### Sequence

1. Add new primitives (`surface-0`, `shadow-color`) to `primitives.css`
2. Add semantic aliases + new tokens to `semantic.css`
3. Add `--shadow-transition` to `semantic.css`
4. Update `preset.ts` — new Tailwind utilities, remove old numeric ones
5. Migrate ALL core components (find-replace + manual review)
6. Migrate ALL karm components (find-replace + manual review)
7. Update `pre-publish-audit.mjs` (new rules for semantic tokens)
8. Write transition guide (`docs/migration/surface-shadow-v0.XX.md`)
9. Update `llms.txt` and `llms-full.txt`
10. Update CHANGELOG.md (breaking changes FIRST)
11. Version bump core + karm together
12. Publish

### Transition guide (ships with the release)

The transition guide must include:
- **Complete find-replace table** — every old class → new class mapping
- **Before/after code examples** for common patterns (card, dialog, popover, input)
- **Decision matrix** (copied from this doc) so consumers know which token to use
- **Tailwind config changes** if consumer apps extend the preset
- **Edge cases** — what to do with custom components, hardcoded shadow values

### Pre-publish audit changes

The audit currently checks for `bg-surface-1` on non-allowlisted files. After migration:
- Old check: "does this file use `bg-surface-1`?" → remove
- New check: "does this card/widget use `bg-surface-raised`?" → add
- Shell chrome rule: "sidebar/topbar must use `bg-surface-sunken`"
- Border/shadow rule: "no file uses both explicit border and shadow on the same element class"

## Council Review (2026-03-16)

Reviewed by a Token Systems Council (DS Architect, Visual Design Engineer, Devil's Advocate) over two rounds of debate.

### Consensus decisions
- Two-layer architecture is sound for current system size
- Semantic surface renames approved unanimously
- Multi-layer tinted shadow technique approved (ships with rename, not deferred)
- Border three-tier hierarchy correct (maps to existing neutral-4/5/6)
- Sunken chroma 0.008 is well-calibrated ("felt but not seen")
- Shadow-surface axes remain independent (shadow-floating + surface-overlay is intentional)
- Core + Karm ship together in a single breaking release with a comprehensive transition guide
- Transition guide with complete find-replace table protects AI agents + non-coding designers

### Resolved decisions
- **Shadow hue: cool blue 260** — elevation shadows recede (cool), effect shadows attract (warm accent). At 0.015 chroma / 3-5% opacity, the tint is subliminal. `--shadow-color` variable makes it trivially adjustable.
- **Dark mode multiplier: 2.5x** — matches existing system ratio. Visual testing in Storybook recommended before publish.
- **`shadow-ring-sm`: keep** as escape hatch, not in standard decision matrix
- **Effect tokens ship together** (brand, glow, inset are visually load-bearing in segmented-control, task-card, button)
- **Shadow transition token added** — `--shadow-transition` wires into existing motion system
