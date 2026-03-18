# @devalok/shilp-sutra-brand

Devalok & Karm brand assets -- logos, favicons, SVG/PNG/WebP for the Devalok Design System.

[![npm](https://img.shields.io/npm/v/@devalok/shilp-sutra-brand)](https://www.npmjs.com/package/@devalok/shilp-sutra-brand)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Install

```bash
pnpm add @devalok/shilp-sutra-brand
```

## Peer Dependencies

| Package | Version |
|---------|---------|
| `react` | `^18 \|\| ^19` |
| `react-dom` | `^18 \|\| ^19` |

## Usage

### SVG Logo Components

```tsx
import { DevalokLogo } from '@devalok/shilp-sutra-brand/devalok'
import { KarmLogo } from '@devalok/shilp-sutra-brand/karm'

// Full logo (default)
<DevalokLogo />

// Logo variants: "full" | "mark" | "wordmark"
<DevalokLogo type="mark" size="lg" />
<KarmLogo type="wordmark" color="auto" />
```

The `color="auto"` option reacts to dark mode (`.dark` class) automatically.

### Favicons

```tsx
import { getDevalokFaviconPath, generateDevalokFavicon } from '@devalok/shilp-sutra-brand/devalok'
import { getKarmFaviconPath, generateKarmFavicon } from '@devalok/shilp-sutra-brand/karm'

// Single file path
getDevalokFaviconPath({ format: 'svg' })                        // default
getDevalokFaviconPath({ format: 'ico' })
getDevalokFaviconPath({ format: 'png', name: 'apple-touch-icon' })

getKarmFaviconPath({ format: 'ico' })                            // default (no SVG)
getKarmFaviconPath({ format: 'png', name: 'icon-192' })

// Next.js metadata-compatible icon set (no args)
generateDevalokFavicon()   // { icon: [...], apple: [...] }
generateKarmFavicon()      // { icon: [...], apple: [...], manifest: '...' }
```

Each brand ships a modern minimal favicon set:

| Brand | Files |
|-------|-------|
| Devalok | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` |
| Karm | `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` |

### Raw Assets

```tsx
// Direct asset imports (PNG, WebP, ICO, SVG, webmanifest)
import monogram from '@devalok/shilp-sutra-brand/assets/devalok/logos/monogram-brand-512.png'
```

## Exports

| Import path | Contents |
|-------------|----------|
| `@devalok/shilp-sutra-brand` | All brand logos and utilities |
| `@devalok/shilp-sutra-brand/devalok` | Devalok logo component + favicon helper |
| `@devalok/shilp-sutra-brand/karm` | Karm logo component + favicon helper |
| `@devalok/shilp-sutra-brand/assets/*` | Raw SVG, PNG, WebP, ICO, and webmanifest files |

## License

MIT -- Copyright 2026 Devalok Design & Strategy Studios
