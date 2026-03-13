# Dark/Light Mode & Token Architecture Redesign

**Date:** 2026-03-13
**Status:** Approved
**Preview:** `docs/previews/token-preview.html`

## Problem

The current dark/light mode implementation has three core issues:

1. **Accent colors look harsh or washed out** against dark backgrounds — pink (#d33163) was tuned for light mode and simply reused in dark mode
2. **Dark mode feels like an afterthought** — hand-mapped hex overrides with no systematic relationship to light values
3. **No brand swappability** — Devalok pink/purple are hardwired throughout semantic.css; consumers can't rebrand without rewriting everything

Root causes:
- All colors stored as hex — no ability to programmatically derive dark palettes
- 50-950 shade numbers have no defined purpose — developers guess which shade to use
- No bg/fg pairing convention — contrast bugs are common
- 598 arbitrary Tailwind values (`bg-[var(--color-*)]`) bypass the preset

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color space | OKLCH native | Perceptual uniformity, algorithmic dark mode derivation, Tailwind v4 alignment. ~97% browser support, our consumers target modern stacks. |
| Scale structure | 12 functional steps (Radix-inspired) | Each step has a defined purpose (bg, border, solid, text). Eliminates shade guessing. |
| Dark mode strategy | Separate lightness/chroma curves per step, same hue | NOT inversion. Dark mode holds hue, shifts L up, adjusts C per step. Surfaces get lighter with elevation. |
| Accent swappability | CSS variable override + seed-color generator utility | Runtime theming via CSS vars. Playground generator (OKLCH) produces 12-step scales from a seed color. |
| Brand color handling | Sacred in light mode, derived variant in dark mode | Blooming Lotus pink is the seed. Dark mode adapts L/C for comfort. Hue stays constant. |
| Backward compatibility | Old token names become aliases | `--color-interactive` → `--color-accent-9`, etc. Components migrate incrementally. |

## Architecture

### Three-tier token flow (unchanged structure, new internals)

```
Tier 1: Primitives (OKLCH 12-step palettes per color)
  ↓
Tier 2: Semantic (functional aliases with bg/fg pairing)
  ↓
Tier 3: Tailwind Preset (utility classes from semantic tokens)
  ↓
Components (CVA variants + cn())
```

### Tier 1 — Primitives: OKLCH 12-Step Functional Palettes

Each color has 12 steps with defined purposes:

| Step | Purpose | Light L | Dark L | Chroma behavior |
|------|---------|---------|--------|-----------------|
| 1 | App background | 0.99 | 0.14 | Minimal |
| 2 | Subtle background | 0.97 | 0.17 | Minimal |
| 3 | Component bg | 0.93 | 0.21 | Low |
| 4 | Component bg hover | 0.89 | 0.25 | Low-mid |
| 5 | Component bg active | 0.84 | 0.30 | Mid |
| 6 | Border subtle | 0.78 | 0.36 | Mid |
| 7 | Border default | 0.70 | 0.44 | Mid-high |
| 8 | Border strong | 0.62 | 0.53 | High |
| 9 | Solid / accent | 0.55 | 0.63 | Peak |
| 10 | Solid hover | 0.50 | 0.58 | Peak |
| 11 | Low-contrast text | 0.43 | 0.76 | Mid |
| 12 | High-contrast text | 0.32 | 0.88 | Low |

Key principles:
- **Hue constant** across all 12 steps
- **Chroma peaks at step 9** (the solid/accent), reduces at extremes
- **Dark mode step 9 keeps high chroma** (0.21 for pink) — not washed out
- **Neutrals carry warm hue bias** (H=350) matching brand warmth
- **Surfaces lighten with elevation in dark mode** (steps 1→4)

Tuned dark mode accent values (from preview iteration):
- Pink step 9: `oklch(0.63 0.21 360)` — punchy, not vibrating
- Pink step 11: `oklch(0.76 0.13 360)` — readable accent text
- Purple step 9: `oklch(0.62 0.16 300)` — strong secondary

### Tier 2 — Semantic: Functional Aliases with bg/fg Pairing

**Accent (swappable by consumers):**
```css
--color-accent-1 through --color-accent-12  /* maps to pink-1..12 */
--color-accent-fg                            /* guaranteed contrast on accent-9 */
```

**Secondary accent:**
```css
--color-secondary-1 through --color-secondary-12  /* maps to purple-1..12 */
--color-secondary-fg
```

**Surfaces:**
```css
--color-surface-1      /* app bg */
--color-surface-2      /* card, sidebar */
--color-surface-3      /* input, raised */
--color-surface-4      /* hover */
--color-surface-fg     /* primary text */
--color-surface-fg-muted   /* secondary text */
--color-surface-fg-subtle  /* tertiary/muted text */
--color-surface-border     /* default border */
```

**Status colors follow the same 12-step pattern:**
```css
--color-error-3, --color-error-7, --color-error-9, --color-error-11
--color-success-3, --color-success-7, --color-success-9, --color-success-11
--color-warning-3, --color-warning-7, --color-warning-9, --color-warning-11
--color-info-3, --color-info-7, --color-info-9, --color-info-11
```

### Migration mapping (old → new)

| Old token | New token |
|-----------|-----------|
| `--color-interactive` | `--color-accent-9` |
| `--color-interactive-hover` | `--color-accent-10` |
| `--color-interactive-selected` | `--color-accent-3` |
| `--color-interactive-subtle` | `--color-accent-2` |
| `--color-text-interactive` | `--color-accent-11` |
| `--color-text-brand` | `--color-accent-11` |
| `--color-text-on-color` | `--color-accent-fg` |
| `--color-border-interactive` | `--color-accent-7` |
| `--color-focus` | `--color-accent-9` |
| `--color-background` | `--color-surface-1` |
| `--color-layer-01` | `--color-surface-1` |
| `--color-layer-02` | `--color-surface-2` |
| `--color-layer-03` | `--color-surface-3` |
| `--color-text-primary` | `--color-surface-fg` |
| `--color-text-secondary` | `--color-surface-fg-muted` |
| `--color-text-tertiary` | `--color-surface-fg-subtle` |
| `--color-border-subtle` | `--neutral-6` (via surface-border) |
| `--color-border-default` | `--neutral-7` |
| `--color-border-strong` | `--neutral-8` |

### Consumer rebranding

Consumers override the accent scale to rebrand:

```css
/* Option A: Override individual steps */
:root {
  --color-accent-9: oklch(0.55 0.15 250);  /* blue accent */
  /* ... other steps */
}

/* Option B: Use the generator */
/* Import generateScale('oklch(0.55 0.15 250)') output as CSS */
```

The playground's OKLCH generator becomes an official theming utility that produces full 12-step light+dark palettes from a single seed color.

### Palettes to generate

| Palette | Seed (light step 9) | Hue | Role |
|---------|---------------------|-----|------|
| Pink | oklch(0.55 0.19 360) | 360 | Primary accent (Devalok brand) |
| Purple | oklch(0.50 0.12 300) | 300 | Secondary accent |
| Neutral | oklch(0.45 0.01 350) | 350 | Surfaces, text, borders |
| Red | ~ H:25 | 25 | Error / danger |
| Green | ~ H:145 | 145 | Success |
| Yellow | ~ H:85 | 85 | Warning |
| Blue | ~ H:240 | 240 | Info / links |
| Teal | ~ H:175 | 175 | Category (Mayur) |
| Amber | ~ H:70 | 70 | Category (Kesar) |
| Slate | ~ H:260 | 260 | Category (Megha) |
| Indigo | ~ H:275 | 275 | Category (Neel) |
| Cyan | ~ H:210 | 210 | Category (Samudra) |
| Orange | ~ H:50 | 50 | Category (Agni) |
| Emerald | ~ H:160 | 160 | Category (Panna) |

## What does NOT change

- Typography tokens (font families, sizes, weights, line heights, letter spacing)
- Spacing tokens (--spacing-01 through --spacing-13)
- Border radius tokens
- Motion tokens (durations, easing curves)
- Z-index stack
- Component size tokens (--size-xs through --size-xl, --icon-sm through --icon-xl)
- Border width tokens
- Layout/breakpoint tokens
- Reduced motion media query

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| OKLCH browser support (~97%) | Our consumers target modern React/Next.js — acceptable. If needed, PostCSS plugin can emit hex fallbacks. |
| Breaking change for consumers | Old token names kept as aliases. Deprecation warnings in llms.txt. Major version bump when aliases removed. |
| 598 arbitrary Tailwind values to update | Codemod script to convert `bg-[var(--color-*)]` to preset utilities. |
| Chroma gamut clipping | Binary search gamut clipping already exists in playground generator. Apply same algorithm. |
| Dark mode tuning is subjective | Preview file allows rapid iteration. Lock values after visual QA across all components in Storybook. |
