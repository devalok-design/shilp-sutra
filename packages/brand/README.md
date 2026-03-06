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
import { getDevalokFaviconPath } from '@devalok/shilp-sutra-brand/devalok'
import { getKarmFaviconPath } from '@devalok/shilp-sutra-brand/karm'

// Returns path to favicon asset
const favicon = getDevalokFaviconPath()
```

### Raw Assets

```tsx
// Direct asset imports (SVG, PNG, WebP, ICO, webmanifest)
import devalokSvg from '@devalok/shilp-sutra-brand/assets/devalok-full.svg'
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
