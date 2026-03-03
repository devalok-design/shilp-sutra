# Brand Assets Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a tree-shakeable `brand/` module to shilp-sutra containing Devalok and Karm logo components, favicon helpers, and brand configuration.

**Architecture:** Single `<DevalokLogo />` component with `type` prop for 8 compositions, single `<KarmLogo />` for 3 types. SVGs inlined via manual React components (no SVGR build dependency). Favicons as static assets copied at build time. Sub-module exports: `./brand`, `./brand/devalok`, `./brand/karm`, `./brand/assets/*`.

**Tech Stack:** React 18, TypeScript, CVA (for size variants), Vitest + RTL + vitest-axe, Storybook MDX

**Design doc:** `docs/plans/2026-03-04-brand-assets-module-design.md`

---

## Task 1: Scaffold brand module structure and build config

**Files:**
- Create: `src/brand/index.ts`
- Create: `src/brand/devalok/index.ts`
- Create: `src/brand/karm/index.ts`
- Create: `src/brand/brand.config.ts`
- Modify: `vite.config.ts:23-34` (add brand entry points)
- Modify: `package.json:9-56` (add brand exports)
- Modify: `src/index.ts` (add brand re-exports)
- Modify: `scripts/copy-tokens.mjs` (add favicon copy step)

**Step 1: Create brand.config.ts**

```ts
// src/brand/brand.config.ts
export const BRAND_VERSION = '1.0.0'

export const brandConfig = {
  devalok: {
    colors: {
      brand: '#D33163',
      brandDark: '#B8284F',
    },
    minSize: { monogram: 24, wordmark: 48, full: 80 },
    clearSpace: '0.5em',
  },
  karm: {
    colors: {
      brand: '#D33163',
      brandDark: '#B8284F',
    },
    minSize: { icon: 16, wordmark: 48, wordmarkIcon: 64 },
    clearSpace: '0.5em',
  },
} as const

export type BrandName = keyof typeof brandConfig
```

**Step 2: Create placeholder barrel files**

```ts
// src/brand/devalok/index.ts
// Devalok brand components — populated in Task 3
export {}

// src/brand/karm/index.ts
// Karm brand components — populated in Task 5
export {}

// src/brand/index.ts
export { BRAND_VERSION, brandConfig, type BrandName } from './brand.config'
export * from './devalok'
export * from './karm'
```

**Step 3: Add brand entry points to vite.config.ts**

In `vite.config.ts`, add these entries to `build.lib.entry` object after the `'karm/admin/index'` line:

```ts
'brand/index': resolve(__dirname, 'src/brand/index.ts'),
'brand/devalok/index': resolve(__dirname, 'src/brand/devalok/index.ts'),
'brand/karm/index': resolve(__dirname, 'src/brand/karm/index.ts'),
```

**Step 4: Add brand exports to package.json**

Add after the `"./karm/admin"` entry:

```json
"./brand": {
  "import": "./dist/brand/index.js",
  "types": "./dist/brand/index.d.ts"
},
"./brand/devalok": {
  "import": "./dist/brand/devalok/index.js",
  "types": "./dist/brand/devalok/index.d.ts"
},
"./brand/karm": {
  "import": "./dist/brand/karm/index.js",
  "types": "./dist/brand/karm/index.d.ts"
},
"./brand/assets/*": "./dist/brand/assets/*"
```

**Step 5: Update copy-tokens.mjs to also copy brand assets**

```js
// scripts/copy-tokens.mjs
import { cpSync, mkdirSync, existsSync } from 'fs'

mkdirSync('dist/tokens', { recursive: true })
cpSync('src/tokens', 'dist/tokens', { recursive: true })
console.log('Tokens copied to dist/tokens/')

if (existsSync('src/brand/assets')) {
  mkdirSync('dist/brand/assets', { recursive: true })
  cpSync('src/brand/assets', 'dist/brand/assets', { recursive: true })
  console.log('Brand assets copied to dist/brand/assets/')
}
```

**Step 6: Add brand re-exports to src/index.ts**

Add at the end of `src/index.ts`:

```ts
// Brand assets
export {
  BRAND_VERSION,
  brandConfig,
  type BrandName,
} from './brand'
```

**Step 7: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes with new brand/ entry points in dist/

**Step 8: Commit**

```bash
git add src/brand/ vite.config.ts package.json scripts/copy-tokens.mjs src/index.ts
git commit -m "feat(brand): scaffold brand module structure and build config"
```

---

## Task 2: Download and organize SVG assets from brand-assets repo

**Files:**
- Create: `src/brand/devalok/svg/` (24 SVG files)
- Create: `src/brand/karm/svg/` (Karm favicon SVG)
- Create: `src/brand/assets/devalok/favicons/` (Devalok favicon PNGs)
- Create: `src/brand/assets/karm/favicons/` (Karm favicon files)
- Create: `src/brand/assets/manifests/karm.webmanifest`

**Step 1: Download Devalok SVGs from GitHub**

Use the GitHub MCP tool `get_file_contents` to download each SVG from `devalok-design/devalok-brand-assets` repo, path `Logo/SVG/COLOR/`, `Logo/SVG/BLACK/`, `Logo/SVG/WHITE/`.

Rename files as they are saved:

| Source file | Target |
|------------|--------|
| `COLOR - Monogram-01.svg` | `src/brand/devalok/svg/monogram-brand.svg` |
| `COLOR - Monogram + Wordmark-01-01.svg` | `src/brand/devalok/svg/monogram-wordmark-brand.svg` |
| `COLOR - Monogram + Shell-01-01.svg` | `src/brand/devalok/svg/monogram-shell-brand.svg` |
| `COLOR - Monogram + Shell + Wordmark-01-01.svg` | `src/brand/devalok/svg/monogram-shell-wordmark-brand.svg` |
| `COLOR - Monogram + Coin + Wordmark-01-01.svg` | `src/brand/devalok/svg/monogram-coin-wordmark-brand.svg` |
| `COLOR - Wordmark-01.svg` | `src/brand/devalok/svg/wordmark-brand.svg` |
| `COLOR - Wordmark DASS-01.svg` | `src/brand/devalok/svg/dass-brand.svg` |
| `COLOR - Wordmark SHLOKA-01.svg` | `src/brand/devalok/svg/shloka-brand.svg` |

Repeat for BLACK and WHITE directories (replace `brand` with `black`/`white` in target name).

**Step 2: Download Karm SVG favicon**

From `devalok-design/karm` repo, download `public/favicon.svg` to `src/brand/karm/svg/icon-brand.svg`.

Create black/white variants by modifying the fill attribute:
- `src/brand/karm/svg/icon-black.svg` — fill="#000000"
- `src/brand/karm/svg/icon-white.svg` — fill="#FFFFFF"

**Step 3: Download Karm static assets**

From `devalok-design/karm` repo `public/` directory:
- `favicon.ico` → `src/brand/assets/karm/favicons/favicon-brand.ico`
- `favicon-96x96.png` → `src/brand/assets/karm/favicons/favicon-brand-96.png`
- `apple-touch-icon.png` → `src/brand/assets/karm/favicons/favicon-brand-180.png`
- `web-app-manifest-192x192.png` → `src/brand/assets/karm/favicons/favicon-brand-192.png`
- `web-app-manifest-512x512.png` → `src/brand/assets/karm/favicons/favicon-brand-512.png`
- `logo-light.png` → `src/brand/assets/karm/logo-light.png`
- `logo-dark.png` → `src/brand/assets/karm/logo-dark.png`

**Step 4: Create Karm webmanifest template**

```json
// src/brand/assets/manifests/karm.webmanifest
{
  "name": "कर्म (Karm)",
  "short_name": "Karm",
  "description": "Karm - Studio Operating System by Devalok",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#D33163",
  "background_color": "#ffffff",
  "categories": ["productivity", "business"],
  "icons": [
    {
      "src": "/favicon-brand-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/favicon-brand-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**Step 5: Download Devalok favicon PNGs**

From `devalok-design/devalok-brand-assets` repo `Favicon/` directories, download COLOR/PNG files:
- `Favicon_COLOR (16 pt).png` → `src/brand/assets/devalok/favicons/favicon-brand-16.png`
- `Favicon_COLOR (32 pt).png` → `src/brand/assets/devalok/favicons/favicon-brand-32.png`
- `Favicon_COLOR (96 pt).png` → `src/brand/assets/devalok/favicons/favicon-brand-96.png`
- `Favicon_COLOR (180 pt).png` → `src/brand/assets/devalok/favicons/favicon-brand-180.png`
- `Favicon_COLOR (512 pt).png` → `src/brand/assets/devalok/favicons/favicon-brand-512.png`

Repeat for BLACK and WHITE directories.

Also download the Devalok favicon SVGs from `Favicon/COLOR/SVG/`:
- `Favicon_COLOR (16 pt).svg` → `src/brand/assets/devalok/favicons/favicon-brand.svg`

**Step 6: Verify files are in place**

Run: `find src/brand -type f | sort | head -40`
Expected: SVGs in svg/ dirs, PNGs in assets/ dirs, webmanifest in manifests/

**Step 7: Commit**

```bash
git add src/brand/devalok/svg/ src/brand/karm/svg/ src/brand/assets/
git commit -m "feat(brand): add Devalok and Karm SVG assets and favicons"
```

---

## Task 3: Implement `<DevalokLogo />` component

**Files:**
- Create: `src/brand/devalok/devalok-logo.tsx`
- Modify: `src/brand/devalok/index.ts`

**Step 1: Write the failing test** (see Task 4 — TDD)

**Step 2: Create the DevalokLogo component**

```tsx
// src/brand/devalok/devalok-logo.tsx
import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { brandConfig } from '../brand.config'

// --- Types ---

const logoTypes = [
  'monogram',
  'monogram-wordmark',
  'monogram-shell',
  'monogram-shell-wordmark',
  'monogram-coin-wordmark',
  'wordmark',
  'dass',
  'shloka',
] as const

export type DevalokLogoType = (typeof logoTypes)[number]
export type DevalokLogoColor = 'brand' | 'black' | 'white' | 'auto'
export type DevalokLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DevalokLogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Logo composition type */
  type?: DevalokLogoType
  /** Color variant. "auto" switches between brand (light) and white (dark). */
  color?: DevalokLogoColor
  /** Predefined size */
  size?: DevalokLogoSize
  /** Below this pixel width, complex types auto-simplify to monogram. Set 0 to disable. */
  simplifyBelow?: number
}

const sizeMap: Record<DevalokLogoSize, string> = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-20 w-auto',
}

// --- SVG Imports (lazy map) ---
// Each SVG is a React component returning inline <svg>.
// They are code-split per file via preserveModules.

// NOTE: The actual SVG component files will be created in Task 2
// by converting the downloaded SVGs into React components.
// For now, we use a dynamic import pattern.

type SvgComponent = React.FC<React.SVGAttributes<SVGSVGElement>>
type SvgMap = Record<string, React.LazyExoticComponent<SvgComponent> | SvgComponent>

// This will be populated with actual inline SVG components.
// Placeholder structure — each key is `${type}-${resolvedColor}`.
const svgComponents: Record<string, SvgComponent> = {}

/** Register an SVG component for a given type-color combination */
export function _registerSvg(key: string, component: SvgComponent) {
  svgComponents[key] = component
}

// --- Utility ---

function resolveColor(color: DevalokLogoColor): 'brand' | 'black' | 'white' {
  if (color !== 'auto') return color
  if (typeof document === 'undefined') return 'brand'
  return document.documentElement.classList.contains('dark') ? 'white' : 'brand'
}

function shouldSimplify(
  type: DevalokLogoType,
  size: DevalokLogoSize,
  simplifyBelow: number,
): boolean {
  if (simplifyBelow <= 0) return false
  if (type === 'monogram') return false
  // Map sizes to approximate pixel heights
  const pxMap: Record<DevalokLogoSize, number> = {
    xs: 24, sm: 32, md: 40, lg: 56, xl: 80,
  }
  return pxMap[size] < simplifyBelow
}

// --- Component ---

const DevalokLogo = React.forwardRef<SVGSVGElement, DevalokLogoProps>(
  (
    {
      type = 'monogram',
      color = 'auto',
      size = 'md',
      simplifyBelow = 32,
      className,
      role = 'img',
      'aria-label': ariaLabel = 'Devalok',
      ...props
    },
    ref,
  ) => {
    const resolvedColor = resolveColor(color)
    const resolvedType = shouldSimplify(type, size, simplifyBelow) ? 'monogram' : type
    const key = `${resolvedType}-${resolvedColor}`
    const SvgComponent = svgComponents[key]

    if (!SvgComponent) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[DevalokLogo] No SVG registered for "${key}". Available: ${Object.keys(svgComponents).join(', ')}`)
      }
      return null
    }

    return (
      <SvgComponent
        ref={ref}
        role={role}
        aria-label={role === 'presentation' ? undefined : ariaLabel}
        aria-hidden={role === 'presentation' ? true : undefined}
        focusable="false"
        className={cn(sizeMap[size], className)}
        {...props}
      />
    )
  },
)
DevalokLogo.displayName = 'DevalokLogo'

// --- Compound: DevalokLogo.Link ---

export interface DevalokLogoLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

const DevalokLogoLink = React.forwardRef<HTMLAnchorElement, DevalokLogoLinkProps>(
  ({ children, 'aria-label': ariaLabel = 'Devalok home', className, ...props }, ref) => (
    <a
      ref={ref}
      aria-label={ariaLabel}
      className={cn('inline-flex items-center', className)}
      {...props}
    >
      {children}
    </a>
  ),
)
DevalokLogoLink.displayName = 'DevalokLogoLink'

// Attach compound
const DevalokLogoCompound = DevalokLogo as typeof DevalokLogo & {
  Link: typeof DevalokLogoLink
}
DevalokLogoCompound.Link = DevalokLogoLink

export { DevalokLogoCompound as DevalokLogo, DevalokLogoLink }
```

**Step 3: Update barrel export**

```ts
// src/brand/devalok/index.ts
export {
  DevalokLogo,
  DevalokLogoLink,
  type DevalokLogoProps,
  type DevalokLogoLinkProps,
  type DevalokLogoType,
  type DevalokLogoColor,
  type DevalokLogoSize,
} from './devalok-logo'
```

**Step 4: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: No new errors

**Step 5: Commit**

```bash
git add src/brand/devalok/
git commit -m "feat(brand): implement DevalokLogo component with type/color/size props"
```

---

## Task 4: Write tests for `<DevalokLogo />`

**Files:**
- Create: `src/brand/devalok/devalok-logo.test.tsx`

**Step 1: Write the test file**

```tsx
// src/brand/devalok/devalok-logo.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DevalokLogo, DevalokLogoLink, _registerSvg } from './devalok-logo'
import * as React from 'react'

// Register a mock SVG component for testing
const MockSvg = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  (props, ref) => (
    <svg ref={ref} data-testid="mock-svg" {...props}>
      <title>Devalok</title>
    </svg>
  ),
)
MockSvg.displayName = 'MockSvg'

beforeEach(() => {
  _registerSvg('monogram-brand', MockSvg)
  _registerSvg('monogram-white', MockSvg)
  _registerSvg('monogram-black', MockSvg)
  _registerSvg('monogram-wordmark-brand', MockSvg)
  _registerSvg('wordmark-brand', MockSvg)
  // Reset dark mode
  document.documentElement.classList.remove('dark')
})

describe('DevalokLogo', () => {
  it('renders with role="img" by default', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders with default aria-label "Devalok"', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Devalok')
  })

  it('supports custom aria-label', () => {
    render(<DevalokLogo type="monogram" color="brand" aria-label="Company logo" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Company logo')
  })

  it('supports decorative mode with role="presentation"', () => {
    render(<DevalokLogo type="monogram" color="brand" role="presentation" />)
    const svg = screen.getByTestId('mock-svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('aria-label')
  })

  it('sets focusable="false" on SVG', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    expect(screen.getByRole('img')).toHaveAttribute('focusable', 'false')
  })

  it('applies size class for md (default)', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    expect(screen.getByRole('img')).toHaveClass('h-10', 'w-auto')
  })

  it('applies size class for xs', () => {
    render(<DevalokLogo type="monogram" color="brand" size="xs" />)
    expect(screen.getByRole('img')).toHaveClass('h-6', 'w-auto')
  })

  it('applies size class for xl', () => {
    render(<DevalokLogo type="monogram" color="brand" size="xl" />)
    expect(screen.getByRole('img')).toHaveClass('h-20', 'w-auto')
  })

  it('applies custom className', () => {
    render(<DevalokLogo type="monogram" color="brand" className="my-custom" />)
    expect(screen.getByRole('img')).toHaveClass('my-custom')
  })

  it('resolves color="auto" to brand in light mode', () => {
    document.documentElement.classList.remove('dark')
    render(<DevalokLogo type="monogram" color="auto" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('resolves color="auto" to white in dark mode', () => {
    document.documentElement.classList.add('dark')
    render(<DevalokLogo type="monogram" color="auto" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('simplifies complex type to monogram at xs size', () => {
    // xs = 24px, simplifyBelow default = 32, so monogram-wordmark → monogram
    render(<DevalokLogo type="monogram-wordmark" color="brand" size="xs" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('does not simplify monogram-wordmark at lg size', () => {
    render(<DevalokLogo type="monogram-wordmark" color="brand" size="lg" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('returns null for unregistered SVG key in production', () => {
    const { container } = render(<DevalokLogo type="dass" color="brand" />)
    expect(container.firstChild).toBeNull()
  })
})

describe('DevalokLogo.Link', () => {
  it('renders an anchor element', () => {
    render(
      <DevalokLogo.Link href="/">
        <DevalokLogo type="monogram" color="brand" />
      </DevalokLogo.Link>,
    )
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('has default aria-label "Devalok home"', () => {
    render(
      <DevalokLogo.Link href="/">
        <DevalokLogo type="monogram" color="brand" />
      </DevalokLogo.Link>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Devalok home')
  })

  it('supports custom aria-label', () => {
    render(
      <DevalokLogo.Link href="/" aria-label="Go home">
        <DevalokLogo type="monogram" color="brand" />
      </DevalokLogo.Link>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go home')
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `pnpm vitest run src/brand/devalok/devalok-logo.test.tsx`
Expected: All tests pass (using mock SVG components)

**Step 3: Commit**

```bash
git add src/brand/devalok/devalok-logo.test.tsx
git commit -m "test(brand): add DevalokLogo component tests"
```

---

## Task 5: Implement `<KarmLogo />` component

**Files:**
- Create: `src/brand/karm/karm-logo.tsx`
- Create: `src/brand/karm/karm-logo.test.tsx`
- Modify: `src/brand/karm/index.ts`

**Step 1: Create KarmLogo component**

Follow the same pattern as `devalok-logo.tsx` but with 3 types:

```tsx
// src/brand/karm/karm-logo.tsx
import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { brandConfig } from '../brand.config'

export type KarmLogoType = 'icon' | 'wordmark' | 'wordmark-icon'
export type KarmLogoColor = 'brand' | 'black' | 'white' | 'auto'
export type KarmLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface KarmLogoProps extends React.SVGAttributes<SVGSVGElement> {
  type?: KarmLogoType
  color?: KarmLogoColor
  size?: KarmLogoSize
  simplifyBelow?: number
}

const sizeMap: Record<KarmLogoSize, string> = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-20 w-auto',
}

type SvgComponent = React.FC<React.SVGAttributes<SVGSVGElement>>

const svgComponents: Record<string, SvgComponent> = {}

export function _registerKarmSvg(key: string, component: SvgComponent) {
  svgComponents[key] = component
}

function resolveColor(color: KarmLogoColor): 'brand' | 'black' | 'white' {
  if (color !== 'auto') return color
  if (typeof document === 'undefined') return 'brand'
  return document.documentElement.classList.contains('dark') ? 'white' : 'brand'
}

function shouldSimplify(
  type: KarmLogoType,
  size: KarmLogoSize,
  simplifyBelow: number,
): boolean {
  if (simplifyBelow <= 0) return false
  if (type === 'icon') return false
  const pxMap: Record<KarmLogoSize, number> = {
    xs: 24, sm: 32, md: 40, lg: 56, xl: 80,
  }
  return pxMap[size] < simplifyBelow
}

const KarmLogo = React.forwardRef<SVGSVGElement, KarmLogoProps>(
  (
    {
      type = 'icon',
      color = 'auto',
      size = 'md',
      simplifyBelow = 32,
      className,
      role = 'img',
      'aria-label': ariaLabel = 'Karm',
      ...props
    },
    ref,
  ) => {
    const resolvedColor = resolveColor(color)
    const resolvedType = shouldSimplify(type, size, simplifyBelow) ? 'icon' : type
    const key = `${resolvedType}-${resolvedColor}`
    const SvgComponent = svgComponents[key]

    if (!SvgComponent) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[KarmLogo] No SVG registered for "${key}".`)
      }
      return null
    }

    return (
      <SvgComponent
        ref={ref}
        role={role}
        aria-label={role === 'presentation' ? undefined : ariaLabel}
        aria-hidden={role === 'presentation' ? true : undefined}
        focusable="false"
        className={cn(sizeMap[size], className)}
        {...props}
      />
    )
  },
)
KarmLogo.displayName = 'KarmLogo'

export interface KarmLogoLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

const KarmLogoLink = React.forwardRef<HTMLAnchorElement, KarmLogoLinkProps>(
  ({ children, 'aria-label': ariaLabel = 'Karm home', className, ...props }, ref) => (
    <a
      ref={ref}
      aria-label={ariaLabel}
      className={cn('inline-flex items-center', className)}
      {...props}
    >
      {children}
    </a>
  ),
)
KarmLogoLink.displayName = 'KarmLogoLink'

const KarmLogoCompound = KarmLogo as typeof KarmLogo & {
  Link: typeof KarmLogoLink
}
KarmLogoCompound.Link = KarmLogoLink

export { KarmLogoCompound as KarmLogo, KarmLogoLink }
```

**Step 2: Write tests**

```tsx
// src/brand/karm/karm-logo.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { KarmLogo, _registerKarmSvg } from './karm-logo'
import * as React from 'react'

const MockSvg = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  (props, ref) => (
    <svg ref={ref} data-testid="mock-svg" {...props}>
      <title>Karm</title>
    </svg>
  ),
)
MockSvg.displayName = 'MockSvg'

beforeEach(() => {
  _registerKarmSvg('icon-brand', MockSvg)
  _registerKarmSvg('icon-white', MockSvg)
  _registerKarmSvg('icon-black', MockSvg)
  _registerKarmSvg('wordmark-brand', MockSvg)
  document.documentElement.classList.remove('dark')
})

describe('KarmLogo', () => {
  it('renders with role="img" and aria-label "Karm"', () => {
    render(<KarmLogo type="icon" color="brand" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', 'Karm')
  })

  it('sets focusable="false"', () => {
    render(<KarmLogo type="icon" color="brand" />)
    expect(screen.getByRole('img')).toHaveAttribute('focusable', 'false')
  })

  it('applies size classes', () => {
    render(<KarmLogo type="icon" color="brand" size="lg" />)
    expect(screen.getByRole('img')).toHaveClass('h-14', 'w-auto')
  })

  it('auto-switches to white in dark mode', () => {
    document.documentElement.classList.add('dark')
    render(<KarmLogo type="icon" color="auto" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('simplifies wordmark to icon at xs size', () => {
    render(<KarmLogo type="wordmark" color="brand" size="xs" />)
    // Should render (falls back to icon-brand since wordmark-brand is at xs)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('KarmLogo.Link', () => {
  it('renders anchor with default aria-label "Karm home"', () => {
    render(
      <KarmLogo.Link href="/">
        <KarmLogo type="icon" color="brand" />
      </KarmLogo.Link>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Karm home')
  })
})
```

**Step 3: Update barrel**

```ts
// src/brand/karm/index.ts
export {
  KarmLogo,
  KarmLogoLink,
  type KarmLogoProps,
  type KarmLogoLinkProps,
  type KarmLogoType,
  type KarmLogoColor,
  type KarmLogoSize,
} from './karm-logo'
```

**Step 4: Run tests**

Run: `pnpm vitest run src/brand/karm/karm-logo.test.tsx`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/brand/karm/
git commit -m "feat(brand): implement KarmLogo component with icon/wordmark types"
```

---

## Task 6: Convert SVGs to inline React components and register them

**Files:**
- Create: `src/brand/devalok/svg-components.tsx` (all Devalok SVG components)
- Create: `src/brand/karm/svg-components.tsx` (all Karm SVG components)
- Modify: `src/brand/devalok/index.ts` (import svg-components for side-effect registration)
- Modify: `src/brand/karm/index.ts` (same)

**Step 1: Convert each downloaded SVG to a React component**

For each SVG file in `src/brand/devalok/svg/`, manually convert to a forwardRef React component. Example pattern:

```tsx
// src/brand/devalok/svg-components.tsx
import * as React from 'react'
import { _registerSvg } from './devalok-logo'

// Example for monogram-brand (actual SVG paths come from downloaded files)
const MonogramBrand = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  (props, ref) => (
    <svg ref={ref} viewBox="0 0 ..." xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Devalok</title>
      {/* Actual SVG path data from monogram-brand.svg */}
    </svg>
  ),
)
MonogramBrand.displayName = 'MonogramBrand'

// Repeat for all 24 variants (8 types × 3 colors)
// ...

// Register all components
_registerSvg('monogram-brand', MonogramBrand)
_registerSvg('monogram-black', MonogramBlack)
_registerSvg('monogram-white', MonogramWhite)
// ... all 24 registrations
```

**Step 2: Import svg-components in barrel for side-effect registration**

```ts
// src/brand/devalok/index.ts (add at top)
import './svg-components'
// ... existing exports
```

Do the same for Karm:

```tsx
// src/brand/karm/svg-components.tsx
import * as React from 'react'
import { _registerKarmSvg } from './karm-logo'

const IconBrand = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  (props, ref) => (
    <svg ref={ref} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Karm</title>
      {/* SVG path data from Karm favicon.svg */}
    </svg>
  ),
)
IconBrand.displayName = 'IconBrand'

// Register: icon-brand, icon-black, icon-white
_registerKarmSvg('icon-brand', IconBrand)
// ...
```

**Step 3: Run all brand tests**

Run: `pnpm vitest run src/brand/`
Expected: All tests pass

**Step 4: Verify build**

Run: `pnpm build`
Expected: No errors, brand/ output in dist/

**Step 5: Commit**

```bash
git add src/brand/devalok/svg-components.tsx src/brand/karm/svg-components.tsx
git commit -m "feat(brand): convert SVGs to inline React components and register"
```

---

## Task 7: Implement favicon helper functions

**Files:**
- Create: `src/brand/devalok/devalok-favicon.ts`
- Create: `src/brand/karm/karm-favicon.ts`
- Modify: `src/brand/devalok/index.ts`
- Modify: `src/brand/karm/index.ts`

**Step 1: Create Devalok favicon helper**

```ts
// src/brand/devalok/devalok-favicon.ts
type FaviconColor = 'brand' | 'black' | 'white'
type FaviconSize = 16 | 32 | 48 | 96 | 180 | 192 | 512

export function getDevalokFaviconPath(options: {
  color?: FaviconColor
  size?: FaviconSize
  format?: 'png' | 'svg' | 'ico'
}): string {
  const { color = 'brand', size = 32, format = 'png' } = options
  if (format === 'ico') {
    return `@devalok/shilp-sutra/brand/assets/devalok/favicons/favicon-${color}.ico`
  }
  if (format === 'svg') {
    return `@devalok/shilp-sutra/brand/assets/devalok/favicons/favicon-${color}.svg`
  }
  return `@devalok/shilp-sutra/brand/assets/devalok/favicons/favicon-${color}-${size}.png`
}

/** Returns a metadata object compatible with Next.js generateMetadata icons field */
export function generateDevalokFavicon(options?: {
  color?: FaviconColor
}) {
  const color = options?.color ?? 'brand'
  return {
    icon: [
      { url: getDevalokFaviconPath({ color, size: 32, format: 'png' }), sizes: '32x32', type: 'image/png' },
      { url: getDevalokFaviconPath({ color, size: 96, format: 'png' }), sizes: '96x96', type: 'image/png' },
      { url: getDevalokFaviconPath({ color, format: 'svg' }), type: 'image/svg+xml' },
    ],
    apple: [
      { url: getDevalokFaviconPath({ color, size: 180, format: 'png' }), sizes: '180x180' },
    ],
  }
}
```

**Step 2: Create Karm favicon helper**

```ts
// src/brand/karm/karm-favicon.ts
type FaviconColor = 'brand' | 'black' | 'white'
type FaviconSize = 16 | 32 | 48 | 96 | 180 | 192 | 512

export function getKarmFaviconPath(options: {
  color?: FaviconColor
  size?: FaviconSize
  format?: 'png' | 'svg' | 'ico'
}): string {
  const { color = 'brand', size = 32, format = 'png' } = options
  if (format === 'ico') {
    return `@devalok/shilp-sutra/brand/assets/karm/favicons/favicon-${color}.ico`
  }
  if (format === 'svg') {
    return `@devalok/shilp-sutra/brand/assets/karm/favicons/favicon-${color}.svg`
  }
  return `@devalok/shilp-sutra/brand/assets/karm/favicons/favicon-${color}-${size}.png`
}

export function generateKarmFavicon(options?: { color?: FaviconColor }) {
  const color = options?.color ?? 'brand'
  return {
    icon: [
      { url: getKarmFaviconPath({ color, size: 32, format: 'png' }), sizes: '32x32', type: 'image/png' },
      { url: getKarmFaviconPath({ color, size: 96, format: 'png' }), sizes: '96x96', type: 'image/png' },
      { url: getKarmFaviconPath({ color, format: 'svg' }), type: 'image/svg+xml' },
    ],
    apple: [
      { url: getKarmFaviconPath({ color, size: 180, format: 'png' }), sizes: '180x180' },
    ],
    manifest: '@devalok/shilp-sutra/brand/assets/manifests/karm.webmanifest',
  }
}
```

**Step 3: Update barrel exports**

Add to `src/brand/devalok/index.ts`:
```ts
export { getDevalokFaviconPath, generateDevalokFavicon } from './devalok-favicon'
```

Add to `src/brand/karm/index.ts`:
```ts
export { getKarmFaviconPath, generateKarmFavicon } from './karm-favicon'
```

**Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add src/brand/devalok/devalok-favicon.ts src/brand/karm/karm-favicon.ts src/brand/devalok/index.ts src/brand/karm/index.ts
git commit -m "feat(brand): add favicon helper functions for Devalok and Karm"
```

---

## Task 8: Create Storybook introduction and stories

**Files:**
- Create: `src/brand/Brand.mdx`
- Create: `src/brand/devalok/devalok-logo.stories.tsx`
- Create: `src/brand/karm/karm-logo.stories.tsx`
- Modify: `.storybook/preview.ts` (add Brand to sort order)

**Step 1: Create Brand introduction MDX**

```mdx
// src/brand/Brand.mdx
import { Meta } from '@storybook/blocks'

<Meta title="Brand/Introduction" />

# Brand Assets

The brand module provides React components and static assets for **Devalok** and **Karm** brand identities. These are opt-in — consumers who don't need brand assets pay zero bundle cost.

---

## Devalok (8 logo types)

The Devalok logo tells the story of creation through sacred Indian imagery: a hand in Gyan mudra (gesture of knowledge), the Lotus of Time, 14 Leaves representing the Vedic Loks, and the Trimurti dots.

| Type | Description |
|------|-------------|
| **monogram** | Hand + lotus icon only |
| **monogram-wordmark** | Icon + "DEVALOK" text |
| **monogram-shell** | Icon + decorative circular shell |
| **monogram-shell-wordmark** | Full lockup with all elements |
| **monogram-coin-wordmark** | Icon + coin element + text |
| **wordmark** | "DEVALOK" text only |
| **dass** | "DASS" (Design and Strategy Studio) wordmark |
| **shloka** | Sanskrit verse wordmark |

---

## Karm (3 logo types)

Karm (कर्म) — the Studio Operating System — uses a geometric 8-pointed mandala icon inspired by sacred geometry.

| Type | Description |
|------|-------------|
| **icon** | Geometric mandala icon |
| **wordmark** | "Karm" text only |
| **wordmark-icon** | Icon + "Karm" text |

---

## Usage

```tsx
import { DevalokLogo } from '@devalok/shilp-sutra/brand/devalok'
import { KarmLogo } from '@devalok/shilp-sutra/brand/karm'

// Auto-switches color for dark mode
<DevalokLogo type="monogram-wordmark" />
<KarmLogo type="icon" />

// Explicit color
<DevalokLogo type="monogram" color="brand" size="lg" />

// Nav link with proper a11y
<DevalokLogo.Link href="/">
  <DevalokLogo type="monogram" size="sm" />
</DevalokLogo.Link>
```

---

## Guidelines

### Do

- Use the monogram at small sizes (below 32px)
- Maintain minimum clear space (0.5em around all sides)
- Use `color="auto"` to respect user's dark mode preference

### Don't

- Don't render the full lockup below 80px height
- Don't use the black variant on dark backgrounds
- Don't modify logo colors — use the provided color variants
- Don't stretch or distort the logo (all components preserve aspect ratio)
```

**Step 2: Create DevalokLogo stories**

```tsx
// src/brand/devalok/devalok-logo.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { DevalokLogo } from './devalok-logo'

const meta: Meta<typeof DevalokLogo> = {
  title: 'Brand/Devalok/Logo',
  component: DevalokLogo,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'monogram', 'monogram-wordmark', 'monogram-shell',
        'monogram-shell-wordmark', 'monogram-coin-wordmark',
        'wordmark', 'dass', 'shloka',
      ],
    },
    color: {
      control: 'select',
      options: ['brand', 'black', 'white', 'auto'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}
export default meta
type Story = StoryObj<typeof DevalokLogo>

export const Default: Story = {
  args: { type: 'monogram', color: 'brand', size: 'md' },
}

export const MonogramWordmark: Story = {
  args: { type: 'monogram-wordmark', color: 'brand', size: 'lg' },
}

export const AllTypes: Story = {
  name: 'All Logo Types',
  render: () => (
    <div className="flex flex-col gap-6">
      {(
        ['monogram', 'monogram-wordmark', 'monogram-shell',
         'monogram-shell-wordmark', 'monogram-coin-wordmark',
         'wordmark', 'dass', 'shloka'] as const
      ).map((type) => (
        <div key={type} className="flex items-center gap-4">
          <span className="w-48 text-sm font-mono text-text-secondary">{type}</span>
          <DevalokLogo type={type} color="brand" size="lg" />
        </div>
      ))}
    </div>
  ),
}

export const ColorVariants: Story = {
  name: 'Color Variants',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <DevalokLogo type="monogram-wordmark" color="brand" size="lg" />
        <span className="text-sm text-text-secondary">Brand (Padmavarna #D33163)</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <DevalokLogo type="monogram-wordmark" color="black" size="lg" />
        <span className="text-sm text-text-secondary">Black (print)</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-inverse">
        <DevalokLogo type="monogram-wordmark" color="white" size="lg" />
        <span className="text-sm text-white/60">White (dark backgrounds)</span>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <DevalokLogo type="monogram" color="brand" size={size} />
          <span className="text-xs text-text-secondary">{size}</span>
        </div>
      ))}
    </div>
  ),
}

export const NavLink: Story = {
  name: 'Logo as Nav Link',
  render: () => (
    <DevalokLogo.Link href="/">
      <DevalokLogo type="monogram" color="brand" size="sm" />
    </DevalokLogo.Link>
  ),
}
```

**Step 3: Create KarmLogo stories**

```tsx
// src/brand/karm/karm-logo.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { KarmLogo } from './karm-logo'

const meta: Meta<typeof KarmLogo> = {
  title: 'Brand/Karm/Logo',
  component: KarmLogo,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['icon', 'wordmark', 'wordmark-icon'],
    },
    color: {
      control: 'select',
      options: ['brand', 'black', 'white', 'auto'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}
export default meta
type Story = StoryObj<typeof KarmLogo>

export const Default: Story = {
  args: { type: 'icon', color: 'brand', size: 'md' },
}

export const AllTypes: Story = {
  name: 'All Logo Types',
  render: () => (
    <div className="flex flex-col gap-6">
      {(['icon', 'wordmark', 'wordmark-icon'] as const).map((type) => (
        <div key={type} className="flex items-center gap-4">
          <span className="w-32 text-sm font-mono text-text-secondary">{type}</span>
          <KarmLogo type={type} color="brand" size="lg" />
        </div>
      ))}
    </div>
  ),
}

export const ColorVariants: Story = {
  name: 'Color Variants',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <KarmLogo type="icon" color="brand" size="lg" />
        <span className="text-sm text-text-secondary">Brand (#D33163)</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <KarmLogo type="icon" color="black" size="lg" />
        <span className="text-sm text-text-secondary">Black</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-inverse">
        <KarmLogo type="icon" color="white" size="lg" />
        <span className="text-sm text-white/60">White</span>
      </div>
    </div>
  ),
}

export const NavLink: Story = {
  name: 'Logo as Nav Link',
  render: () => (
    <KarmLogo.Link href="/">
      <KarmLogo type="icon" color="brand" size="sm" />
    </KarmLogo.Link>
  ),
}
```

**Step 4: Add Brand to Storybook sort order**

In `.storybook/preview.ts`, add `'Brand'` to the sort order array after `'Karm'`:

```ts
'Brand', [
  'Introduction',
  'Devalok', ['Logo', 'Favicons', 'Guidelines'],
  'Karm', ['Logo', 'Favicons', 'Guidelines'],
  'Configuration',
],
```

**Step 5: Verify Storybook**

Run: `pnpm dev`
Expected: Brand section appears in sidebar with Introduction, Devalok/Logo, Karm/Logo

**Step 6: Commit**

```bash
git add src/brand/Brand.mdx src/brand/devalok/devalok-logo.stories.tsx src/brand/karm/karm-logo.stories.tsx .storybook/preview.ts
git commit -m "feat(brand): add Storybook introduction and logo stories"
```

---

## Task 9: Update root barrel export and verify full build

**Files:**
- Modify: `src/index.ts` (ensure brand exports are complete)

**Step 1: Update src/index.ts brand section**

Ensure the brand section at the end of `src/index.ts` includes all exports:

```ts
// Brand assets
export {
  BRAND_VERSION,
  brandConfig,
  type BrandName,
  DevalokLogo,
  DevalokLogoLink,
  type DevalokLogoProps,
  type DevalokLogoLinkProps,
  type DevalokLogoType,
  type DevalokLogoColor,
  type DevalokLogoSize,
  KarmLogo,
  KarmLogoLink,
  type KarmLogoProps,
  type KarmLogoLinkProps,
  type KarmLogoType,
  type KarmLogoColor,
  type KarmLogoSize,
  getDevalokFaviconPath,
  generateDevalokFavicon,
  getKarmFaviconPath,
  generateKarmFavicon,
} from './brand'
```

**Step 2: Run full test suite**

Run: `pnpm test`
Expected: All existing tests pass + new brand tests pass

**Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: No errors

**Step 4: Run full build**

Run: `pnpm build`
Expected: dist/brand/ directory created with all expected files

**Step 5: Verify dist output**

Run: `ls dist/brand/`
Expected: index.js, index.d.ts, devalok/, karm/, assets/

**Step 6: Commit**

```bash
git add src/index.ts
git commit -m "feat(brand): complete brand module with full barrel exports"
```

---

## Task Summary

| # | Task | Estimated Steps | Dependencies |
|---|------|----------------|--------------|
| 1 | Scaffold module + build config | 8 | None |
| 2 | Download and organize SVG assets | 7 | Task 1 |
| 3 | Implement `<DevalokLogo />` | 5 | Task 1 |
| 4 | Write DevalokLogo tests | 3 | Task 3 |
| 5 | Implement `<KarmLogo />` + tests | 5 | Task 1 |
| 6 | Convert SVGs → React + register | 5 | Tasks 2, 3, 5 |
| 7 | Favicon helper functions | 5 | Task 1 |
| 8 | Storybook intro + stories | 6 | Tasks 3, 5, 6 |
| 9 | Root barrel + full verification | 6 | All above |

**Parallelizable:** Tasks 3+5 (both components), Tasks 4+7 (tests + helpers) can run in parallel.

**Total commits:** 9 (one per task)
