# Brand Assets Module Design

> Council-reviewed design for porting Devalok and Karm brand assets into shilp-sutra.

**Date:** 2026-03-04
**Status:** Approved
**Module path:** `@devalok/shilp-sutra/brand`

---

## Context

The `devalok-brand-assets` repo contains 131 files (8 logo types × 3 colors × 3 formats + favicons). The `devalok-design/karm` repo contains product-specific brand assets (favicons, logos, PWA icons, OG image). Both need to be ported into shilp-sutra as a tree-shakeable, optional `brand/` module — similar to how `karm/` is a domain-specific sub-category.

## Architecture

### Module Structure

```
src/brand/
├── index.ts                        # Re-exports both devalok + karm
├── brand.config.ts                 # Importable brand constants (min sizes, clear space, version)
├── Brand.mdx                       # Storybook introduction page
│
├── devalok/                        # Devalok parent brand
│   ├── index.ts
│   ├── devalok-logo.tsx            # <DevalokLogo /> component
│   ├── devalok-logo.stories.tsx
│   ├── devalok-logo.test.tsx
│   ├── devalok-favicon.ts          # getFaviconPath(), generateFavicon()
│   └── svg/                        # 24 SVGs (8 types × 3 colors)
│
├── karm/                           # Karm product brand
│   ├── index.ts
│   ├── karm-logo.tsx               # <KarmLogo /> component
│   ├── karm-logo.stories.tsx
│   ├── karm-logo.test.tsx
│   ├── karm-favicon.ts             # getKarmFaviconPath(), generateKarmFavicon()
│   └── svg/                        # Karm SVG sources
│
└── assets/                         # Static files (copied at build)
    ├── devalok/
    │   └── favicons/               # 27 files (3 colors × 9 formats)
    ├── karm/
    │   └── favicons/               # 27 files (matching matrix)
    └── manifests/
        ├── devalok.webmanifest
        └── karm.webmanifest
```

### Package Exports

```json
"./brand":              "./dist/brand/index.js",
"./brand/devalok":      "./dist/brand/devalok/index.js",
"./brand/karm":         "./dist/brand/karm/index.js",
"./brand/assets/*":     "./dist/brand/assets/*"
```

### Vite Config

One entry point: `'brand/index': 'src/brand/index.ts'`
Sub-module entries: `'brand/devalok/index'`, `'brand/karm/index'`
Favicon copy added to existing `copy-tokens.mjs` script.

## Component API

### `<DevalokLogo />`

Single component with `type` prop discriminating 8 logo compositions:

```tsx
<DevalokLogo
  type="monogram-wordmark"
  color="auto"
  size="md"
  aria-label="Devalok"
  className="my-4"
/>
```

**Props:**

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `"monogram" \| "monogram-wordmark" \| "monogram-shell" \| "monogram-shell-wordmark" \| "monogram-coin-wordmark" \| "wordmark" \| "dass" \| "shloka"` | `"monogram"` | Logo composition |
| `color` | `"brand" \| "black" \| "white" \| "auto"` | `"auto"` | `auto` = brand in light, white in dark |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Mapped to pixel values |
| `aria-label` | `string` | `"Devalok"` | Meaningful by default |
| `aria-hidden` | `boolean` | `false` | For decorative usage |
| `className` | `string` | — | Escape hatch |

**Compound sub-component:**

```tsx
<DevalokLogo.Link href="/" aria-label="Devalok home">
  <DevalokLogo type="monogram" size="sm" />
</DevalokLogo.Link>
```

### `<KarmLogo />`

Mirrors DevalokLogo with fewer types:

```tsx
<KarmLogo
  type="wordmark"
  color="auto"
  size="md"
  aria-label="Karm"
/>
```

| Prop | Type | Default |
|------|------|---------|
| `type` | `"icon" \| "wordmark" \| "wordmark-icon"` | `"icon"` |
| `color` | `"brand" \| "black" \| "white" \| "auto"` | `"auto"` |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` |

### Favicon Helpers

```ts
import { getFaviconPath, generateFavicon } from '@devalok/shilp-sutra/brand/devalok';

// Path string for static HTML
getFaviconPath({ color: 'brand', size: 32 });
// → '@devalok/shilp-sutra/brand/assets/devalok/favicons/favicon-brand-32.png'

// Next.js generateMetadata compatible
generateFavicon({ color: 'brand' });
// → { icon: [...], apple: [...], manifest: '...' }
```

## Naming Conventions

### Component Names — English Structure

| Export | File |
|--------|------|
| `DevalokLogo` | `devalok-logo.tsx` |
| `DevalokLogoLink` | `devalok-logo.tsx` (compound) |
| `KarmLogo` | `karm-logo.tsx` |
| `KarmLogoLink` | `karm-logo.tsx` (compound) |

### Prop Values — English (Sanskrit in docs)

- `color="brand"` (not `padmavarna` — JSDoc documents the cultural name)
- `type="dass"` and `type="shloka"` — **kept as proper nouns** with aggressive documentation
- All other type values are descriptive English kebab-case

### SVG File Names — Clean Kebab-Case

Renamed from source repo's `"COLOR - Monogram + Wordmark-01-01.svg"`:

```
monogram-brand.svg      monogram-black.svg      monogram-white.svg
monogram-wordmark-brand.svg   ...
dass-brand.svg          dass-black.svg          dass-white.svg
```

## Standardized Favicon Sizes

Both Devalok and Karm ship identical size matrices:

| Size | Purpose | Formats |
|------|---------|---------|
| 16×16 | Browser tab | SVG, PNG, ICO |
| 32×32 | Browser tab (Retina) | SVG, PNG, ICO |
| 48×48 | Windows taskbar | PNG |
| 96×96 | Desktop shortcut | PNG |
| 180×180 | Apple Touch Icon | PNG |
| 192×192 | PWA manifest (Android) | PNG |
| 512×512 | PWA splash / large | PNG |

**Multi-res `.ico`:** Combines 16+32+48.

**3 color variants each:** brand (#D33163), black, white.
**Per brand:** 3 colors × (7 PNGs + 1 ICO + 1 SVG) = **27 files**.

## Dark Mode

Auto-switch via existing `.dark` class pattern:

```tsx
const isDark = typeof document !== 'undefined'
  && document.documentElement.classList.contains('dark');

// color="auto" resolves to:
// Light mode → "brand" (pink on light backgrounds)
// Dark mode  → "white" (white on dark backgrounds)
```

Explicit `color` prop always overrides. `black` variant never auto-switches (print contexts).

## Accessibility

- `role="img"` + `aria-labelledby` pointing to `<title>` in SVG
- `<desc>` for complex logo types (full lockup: "hand in Gyan mudra emerging from a lotus, with Sanskrit text")
- `focusable="false"` on SVG to prevent double-focus in links
- `forced-colors: active` media query — fallback to `currentColor` for Windows High Contrast
- `simplifyBelow` prop (default `32`) — auto-swaps to monogram below threshold
- Dev-mode `console.warn` if logo below minimum size without override
- `#D33163` passes WCAG 3:1 for graphical objects; for small text darken to `#B8284F` (~5.2:1)
- `prefers-reduced-motion` check for any animated variants

## Storybook Organization

```
Brand/
├── Introduction              # Brand.mdx — origin story, philosophy, do/don't
├── Devalok/
│   ├── Logo                  # All 8 types, interactive grid
│   ├── Favicons              # Visual grid + HTML snippets
│   └── Guidelines            # Clear space, forbidden combos
├── Karm/
│   ├── Logo                  # Icon, wordmark, wordmark-icon
│   ├── Favicons              # Same grid format
│   └── Guidelines            # Karm-specific rules
└── Configuration             # brand.config.ts, manifests, generateFavicon() examples
```

## Missing Assets

### Must Create / Generate

| Asset | Brand | Method | Priority |
|-------|-------|--------|----------|
| Karm SVG wordmark (vector) | Karm | Request from design team | High |
| Karm black/white icon variants | Karm | Derive from favicon.svg (change fill) | High |
| Karm horizontal lockup SVG | Karm | Request from design team | High |
| Devalok 48px, 192px favicons | Devalok | Generate from SVG source | Medium |
| Karm 16, 32, 48px PNGs | Karm | Generate from favicon.svg | Medium |
| Multi-res .ico files | Both | Generate: 16+32+48 combined | Medium |
| Animated monogram (CSS) | Devalok | CSS keyframes, no Lottie | Medium |
| OG image template (1200×630) | Devalok | Request or build as component | Low |
| Dark mode favicon | Karm | White variant of mandala icon | Low |
| `site.webmanifest` templates | Both | Adapt from Karm manifest | Low |

### Excluded from npm (CDN only)

- Devalok 1000pt favicons (too large)
- Karm metatag.png (804KB OG image)
- All JPG variants
- PNG/JPG email fallbacks (jsDelivr CDN)

## Build & Bundle

- **SVGR** compiles SVGs to React components (~1-3KB each gzipped)
- **Size budget:** 15KB gzipped for entire brand module, enforced via `size-limit` in CI
- **RSC-compatible:** Pure render functions, no hooks/state/effects, no `"use client"`
- **Tree-shaking:** `preserveModules: true` + named exports = unused types eliminated
- **`BRAND_VERSION` constant** exported for cache-busting on brand refreshes

## brand.config.ts

```ts
export const BRAND_VERSION = '1.0.0';

export const brandConfig = {
  devalok: {
    colors: {
      brand: '#D33163',        // Devalok Padmavarna
      brandDark: '#B8284F',    // WCAG-safe for small text
    },
    minSize: { monogram: 24, wordmark: 48, full: 80 },
    clearSpace: '0.5em',       // Minimum padding around logo
  },
  karm: {
    colors: {
      brand: '#D33163',
      brandDark: '#B8284F',
    },
    minSize: { icon: 16, wordmark: 48, wordmarkIcon: 64 },
    clearSpace: '0.5em',
  },
} as const;
```

## Council

This design was reviewed by a 5-member expert council:

1. **Design System Architect** — module structure, entry points, dark mode
2. **Component API Designer** — single-component API, prop naming, compound patterns
3. **Accessibility Expert** — ARIA patterns, contrast, simplifyBelow, forced-colors
4. **Brand Strategist** — naming philosophy, cultural identity, Storybook storytelling
5. **Frontend Engineer** — SVGR pipeline, tree-shaking, RSC compat, size budget

Two rounds of debate. Unanimous convergence on all major decisions.
