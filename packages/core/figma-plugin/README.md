# OKLCH Ramp Generator — Figma plugin

Generates perceptually-even 12-step colour ramps inside Figma from two numbers per ramp: a **hue** and a **peak chroma**.

## Why it exists

Figma stores numbers but cannot compute. A designer who edits a seed value sees nothing happen — the ramp only regenerates when the codebase runs `generate-scale.ts`. Tuning you can't see isn't tuning. This plugin closes that loop: change a seed, run it, watch all 12 steps rewrite.

It's the designer-facing half of the token workflow described in [`docs/plans/2026-08-18-figma-library-build-plan.md`](../../../docs/plans/2026-08-18-figma-library-build-plan.md) (D13, D22).

## How it works

Seeds are plain variables named `<ramp>/hue` and `<ramp>/chroma`:

```
seeds/accent/hue     = 360
seeds/accent/chroma  = 0.19
seeds/accent/neutral = false     (optional — neutrals skip the dark-mode chroma boost)
```

The plugin writes `<ramp>/1` … `<ramp>/12` into whichever collection you point it at, filling the light mode and, if you pick one, the dark mode too. Existing variables are updated in place; missing ones are created with `scopes: []` so raw ramp steps stay out of every picker.

Nothing is hardcoded to one file — pick any seed collection and any target.

## Running it

Not published yet. Until it is, install in development mode:

1. Figma → **Plugins → Development → Import plugin from manifest…**
2. Choose `packages/core/figma-plugin/manifest.json`
3. Run it from **Plugins → Development → OKLCH Ramp Generator**

Updating means pulling the repo — no reinstall needed.

## Keeping it honest

**The constants in `code.js` mirror `packages/core/src/tokens/generate-scale.ts`.** They define the shape of every ramp: lightness per step, chroma weight per step, and the dark-mode chroma boost. If that file changes and this one doesn't, Figma and the codebase will produce different ramps from identical seeds and nothing will warn you.

Change both in the same commit.

## Colour accuracy

OKLCH → sRGB conversion uses Ottosson's matrices with per-channel clipping — the same approach as `figma-sync-tokens.mjs`, so Figma matches the repo's DTCG export exactly. Highly saturated values outside the sRGB gamut shift slightly on conversion; that's inherent to sRGB, not a bug here.

## Before publishing publicly

Private plugin distribution needs a Figma Organization plan; Devalok is on Pro, so this goes to the Community publicly. Before that:

- Name, description and icon go through Setu — it's brand surface
- Confirm nothing file-specific is baked in (there shouldn't be: no file keys, no hardcoded variable names)
- Figma reviews public plugins, typically a few days; development mode keeps working meanwhile
