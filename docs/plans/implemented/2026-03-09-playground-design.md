# Shilp Sutra Playground — Design Document

**Date**: 2026-03-09
**Status**: Approved

## Overview

A standalone interactive playground at `shilp-sutra.devalok.in/playground` where the design team can tweak design tokens and component props live, see the results immediately, and share their changes via URL or CSS export.

## Goals

1. Let the design team experiment with token changes (colors, spacing, radii, typography) without touching code
2. Provide a component-level sandbox for exploring props and variants
3. Enable sharing via URL (anyone can see the same state) and CSS/JSON export (for implementation)
4. Deploy alongside Storybook on GitHub Pages with zero extra infrastructure

## Architecture

### App Location

```
apps/playground/          — Standalone Vite + React app
```

Imports shilp-sutra core components via source-level aliases (same pattern as Storybook). Not a published package — build-only, deployed to GitHub Pages at `/playground`.

### Directory Structure

```
apps/playground/
  index.html
  src/
    main.tsx
    App.tsx
    components/
      Layout.tsx                — Shell: top bar + sidebar + preview area
      TokenEditor/
        TokenEditor.tsx         — Grouped token controls (accordion)
        ColorScaleEditor.tsx    — Base color picker + auto-generated spectrum
        ColorControl.tsx        — Individual color picker + hex input
        SliderControl.tsx       — Spacing/radius/font-size slider
        SelectControl.tsx       — Font family/weight dropdowns
      ComponentSandbox/
        ComponentSandbox.tsx    — Pick a component, tweak props
        PropControl.tsx         — Auto-generated prop editors
        ComponentRegistry.ts    — Map of components + their prop schemas
      Preview/
        Preview.tsx             — Live preview panel (tokens applied via style)
        ComponentGrid.tsx       — Shows multiple components in token mode
      ShareBar/
        ShareBar.tsx            — Copy URL / Export CSS / Export JSON / dark mode toggle
    lib/
      tokens.ts                — Parse semantic.css defaults into editable groups
      color-scale.ts           — HSL interpolation: base color → 50-950 spectrum
      url-state.ts             — Encode/decode state to URL hash (base64 JSON)
      css-export.ts            — Generate CSS override snippet
    styles/
      playground.css           — Playground-specific styles
  vite.config.ts
  tsconfig.json
  package.json
```

### Layout

Two-column layout with top bar:

- **Top bar**: Shilp Sutra logo, mode switcher (Token Studio | Component Sandbox), dark mode toggle, Share button, Export CSS button, Export JSON button
- **Left sidebar** (~320px): Context-dependent controls for the active mode
- **Right main area**: Live preview that updates in real-time

## Token Studio Mode

### Token Groups (collapsible accordions)

| Group | Tokens | Control Type |
|-------|--------|-------------|
| **Color Scales** | All 10+ scales (pink, purple, neutral, green, red, yellow, blue, teal, amber, emerald, indigo, cyan) | Base color picker + auto-generated spectrum |
| **Background & Layers** | `--color-background`, `--color-layer-01/02/03`, `--color-field`, `--color-field-hover` | Color picker |
| **Text Colors** | `--color-text-primary/secondary/tertiary/placeholder/disabled/error/success/link` | Color picker |
| **Border Colors** | `--color-border-subtle/default/strong/interactive/error/success` | Color picker |
| **Status Colors** | Success, error, warning, info (surface + border + text for each) | Color picker |
| **Spacing** | 13 spacing tokens (`--spacing-1` through `--spacing-16`) | Slider (px) |
| **Border Radius** | 8 radius tokens (`--radius-none` through `--radius-full`) | Slider (px) |
| **Typography** | Font sizes, weights, line heights, letter spacing | Slider + dropdown |

### Color Scale Auto-Generation

When a designer picks/enters a base color for any scale:

1. The playground generates the full 11-shade spectrum (50, 100, 200, ..., 950) using HSL interpolation
2. Lighter shades (50-400): increase lightness, decrease saturation slightly
3. Darker shades (600-950): decrease lightness, increase saturation slightly
4. The generated spectrum shows as a preview strip for verification
5. Individual shades can be fine-tuned after generation
6. All semantic tokens referencing that scale update live

This works for ALL color scales — pink, purple, neutral, green, red, yellow, blue, teal, amber, emerald, indigo, cyan.

### Token Change Indicators

- Changed tokens show a dot indicator next to the control
- Each changed token has a reset button to revert to default
- "Reset All" button at the top clears all overrides

### Preview Panel

Shows a grid of all starter components simultaneously so the designer sees the system-wide impact of token changes at a glance.

## Component Sandbox Mode

### Starter Components (~12)

| Component | Why Included |
|-----------|-------------|
| Button | Most variant-heavy (size, color, variant) |
| Input | Field colors, borders, focus states |
| Badge | Color axis, variant axis |
| Card | Layers, borders, radii, spacing |
| Avatar | Sizes, shapes, fallback |
| Tabs | Interactive colors, variants |
| Alert | Status colors (success/error/warning/info) |
| Dialog | Overlay, layers, radii, spacing |
| Checkbox + Switch | Interactive + field colors |
| Select | Field, popover, borders |
| Tooltip | Layers, text colors |
| Separator | Border colors |

More components can be added incrementally by extending `ComponentRegistry.ts`.

### Controls

For each selected component:
- **Variant selector** — dropdown/radio for each CVA variant axis
- **Props editor** — text inputs, booleans, selects for key props
- **Size selector** — when the component supports sizes
- **Live code preview** — shows the JSX for the current configuration (copyable)

### Shared Token State

Both modes share the same token overrides. Tweaking tokens in Token Studio persists when switching to Component Sandbox.

## URL State & Sharing

### URL Format

All state is encoded in the URL hash (no server needed):

```
shilp-sutra.devalok.in/playground#eyJwcmltaXRpdmVzIjp7...
```

### State Shape

```json
{
  "primitives": {
    "pink-500": "#E04080",
    "pink-auto": true
  },
  "semantic": {
    "--spacing-4": "20px",
    "--radius-default": "8px"
  },
  "mode": "tokens",
  "darkMode": false,
  "component": "button",
  "props": {
    "variant": "solid",
    "size": "md",
    "color": "primary"
  }
}
```

Only **overrides** are stored (not defaults), keeping URLs short.

### Share Actions

1. **Copy Link** — copies full URL to clipboard; anyone opening it sees the exact same state
2. **Export CSS** — generates a clean override snippet:
   ```css
   /* shilp-sutra token overrides — generated from playground */
   :root {
     --pink-500: #E04080;
     --pink-600: #C03060;
     --spacing-4: 20px;
     --radius-default: 8px;
   }
   ```
3. **Export JSON** — the raw override object for programmatic use

### Consuming Shared URLs

When a designer shares a playground URL, the encoded hash can be decoded to see every token that was changed and to what value, enabling direct application to the actual CSS token files.

## Deployment

### CI Integration

Update `.github/workflows/deploy-storybook.yml` to:

1. Build the playground app (`cd apps/playground && pnpm build`)
2. Copy build output into `storybook-static/playground/`
3. Upload the combined directory to GitHub Pages

Since `shilp-sutra.devalok.in` custom domain is already configured on GitHub Pages, `/playground` will be available at `shilp-sutra.devalok.in/playground` automatically.

### Build Config

- Vite `base: '/playground/'` for correct asset paths
- Source-level aliases to `packages/core/src/` (same as Storybook)
- No separate deployment — rides the existing GitHub Pages pipeline

## Tech Stack

- React 18 + TypeScript
- Vite 5.4 (same as monorepo)
- Tailwind 3.4 with shilp-sutra preset
- shilp-sutra core components (source imports via aliases)
- No additional runtime dependencies beyond what's already in the monorepo

## Future Extensions

- Add more components to the sandbox incrementally
- Theme presets (save/load named themes)
- Side-by-side light/dark mode preview
- Figma plugin integration (push token changes directly)
