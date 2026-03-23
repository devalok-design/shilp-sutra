# Devalok Grain — Design Token Spec

**Decision:** Grain level `subtle` is the default for all shilp-sutra components.

## Where it applies
- **Solid** variant: grain 20% opacity + gradient (deepens top-left, lightens bottom-right)
- **Soft** variant: grain 14% opacity + gradient (same direction, lower intensity)
- **Outline, Ghost, Link**: No grain (transparent surfaces have nothing to texture)

## Implementation
- `::after` pseudo-element with SVG feTurbulence noise (`baseFrequency: 0.45`, 3 octaves)
- `::before` pseudo-element with directional gradient (`135deg`)
- `mix-blend-mode: hard-light` on grain, `filter: contrast(250%) brightness(130%)`
- Light mode gradient: `oklch(0 0 0 / 0.12)` → `oklch(1 0 0 / 0.15)` (deep-to-light)
- Dark mode gradient: `transparent` → `oklch(0 0 0 / 0.15)` (subtle depth)
- Text content sits above both layers via `z-index: 2`

## Token mapping
This will become a `--grain-*` token set in `semantic.css`:
- `--grain-noise-opacity-solid: 0.20`
- `--grain-noise-opacity-soft: 0.14`
- `--grain-gradient-light: linear-gradient(135deg, oklch(0 0 0 / 0.12), oklch(1 0 0 / 0.15))`
- `--grain-gradient-dark: linear-gradient(135deg, transparent, oklch(0 0 0 / 0.15))`
