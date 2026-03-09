# Playground Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive design token playground at `/playground` where the design team can tweak tokens, preview components live, and share changes via URL or CSS export.

**Architecture:** Standalone Vite + React app in `apps/playground/` that imports shilp-sutra core components via source-level aliases (same as Storybook). Two modes: Token Studio (edit CSS custom properties, see component grid update) and Component Sandbox (pick a component, edit props/variants). State encoded in URL hash for sharing. Deployed alongside Storybook on GitHub Pages.

**Tech Stack:** React 18, TypeScript, Vite 5.4, Tailwind 3.4 with shilp-sutra preset, shilp-sutra core components (source imports).

---

### Task 1: Scaffold the Playground App

**Files:**
- Create: `apps/playground/package.json`
- Create: `apps/playground/tsconfig.json`
- Create: `apps/playground/vite.config.ts`
- Create: `apps/playground/index.html`
- Create: `apps/playground/src/main.tsx`
- Create: `apps/playground/src/App.tsx`
- Create: `apps/playground/src/styles/playground.css`
- Create: `apps/playground/postcss.config.js`
- Create: `apps/playground/tailwind.config.ts`
- Modify: `pnpm-workspace.yaml` — add `apps/*` to workspace packages

**Step 1: Create `pnpm-workspace.yaml` entry**

Check current file. Add `apps/*` alongside `packages/*`:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Step 2: Create `apps/playground/package.json`**

```json
{
  "name": "@devalok/shilp-sutra-playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.7.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**Step 3: Create `apps/playground/vite.config.ts`**

Replicate Storybook's alias pattern. Set `base: '/playground/'` for GitHub Pages.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/playground/',
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '..', '..', 'packages', 'core', 'src', 'primitives'),
      '@': resolve(__dirname, '..', '..', 'packages', 'core', 'src'),
    },
  },
})
```

**Step 4: Create `apps/playground/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["../../packages/core/src/*"],
      "@primitives/*": ["../../packages/core/src/primitives/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

**Step 5: Create `apps/playground/tailwind.config.ts`**

```typescript
import preset from '../../packages/core/src/tailwind/preset'
import type { Config } from 'tailwindcss'

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/core/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
} satisfies Config
```

**Step 6: Create `apps/playground/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 7: Create `apps/playground/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shilp Sutra Playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 8: Create `apps/playground/src/styles/playground.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '../../../../packages/core/src/tokens/index.css';
```

**Step 9: Create `apps/playground/src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/playground.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 10: Create `apps/playground/src/App.tsx`**

Minimal shell to verify the setup works:

```tsx
import { Button } from '@/ui/button'

export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Button>Playground Works</Button>
    </div>
  )
}
```

**Step 11: Install dependencies and verify dev server starts**

```bash
cd apps/playground && pnpm install
pnpm dev
```

Expected: Dev server on http://localhost:5173/playground/ showing a centered Button.

**Step 12: Commit**

```bash
git add apps/playground pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat(playground): scaffold Vite + React app with core aliases"
```

---

### Task 2: Build the Color Scale Generator

**Files:**
- Create: `apps/playground/src/lib/color-scale.ts`

**Step 1: Implement HSL-based scale generation**

This is the core algorithm: given a base hex color, generate an 11-shade spectrum (50→950).

```typescript
/** Convert hex to HSL */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return [0, 0, l]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return [h * 360, s * 100, l * 100]
}

/** Convert HSL to hex */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Shade stops and their target lightness offsets from base */
const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
type Shade = (typeof SHADE_STOPS)[number]

/**
 * Generate a full color scale from a single base color.
 * The base color is placed at the 500 stop.
 * Lighter shades increase lightness + slightly decrease saturation.
 * Darker shades decrease lightness + slightly increase saturation.
 */
export function generateColorScale(baseHex: string): Record<Shade, string> {
  const [h, s, l] = hexToHsl(baseHex)

  // Target lightness for each stop — calibrated to match shilp-sutra's hand-tuned scales
  const lightnessMap: Record<Shade, number> = {
    50: Math.min(97, l + (97 - l) * 0.95),
    100: Math.min(93, l + (93 - l) * 0.85),
    200: Math.min(87, l + (87 - l) * 0.75),
    300: Math.min(78, l + (78 - l) * 0.60),
    400: l + (78 - l) * 0.30,
    500: l,
    600: l * 0.78,
    700: l * 0.60,
    800: l * 0.42,
    900: l * 0.28,
    950: l * 0.17,
  }

  // Saturation adjustments — lighter shades are slightly less saturated
  const saturationMap: Record<Shade, number> = {
    50: s * 0.3,
    100: s * 0.45,
    200: s * 0.55,
    300: s * 0.65,
    400: s * 0.85,
    500: s,
    600: Math.min(100, s * 1.05),
    700: Math.min(100, s * 1.08),
    800: Math.min(100, s * 1.0),
    900: Math.min(100, s * 0.95),
    950: Math.min(100, s * 0.90),
  }

  const scale = {} as Record<Shade, string>
  for (const shade of SHADE_STOPS) {
    scale[shade] = hslToHex(h, saturationMap[shade], lightnessMap[shade])
  }
  return scale
}

export { SHADE_STOPS }
export type { Shade }
```

**Step 2: Verify by running the dev server and testing in browser console (or add a quick visual test later)**

**Step 3: Commit**

```bash
git add apps/playground/src/lib/color-scale.ts
git commit -m "feat(playground): add HSL color scale generator"
```

---

### Task 3: Build Token Defaults Parser & State Management

**Files:**
- Create: `apps/playground/src/lib/tokens.ts`
- Create: `apps/playground/src/lib/url-state.ts`
- Create: `apps/playground/src/lib/css-export.ts`
- Create: `apps/playground/src/lib/use-playground-state.ts`

**Step 1: Create token defaults map**

Parse the known token names and defaults into a structured object. We hardcode the defaults from `primitives.css` and `semantic.css` since they're stable and we need them at runtime without a CSS parser.

```typescript
// apps/playground/src/lib/tokens.ts

export const COLOR_SCALES = [
  'pink', 'purple', 'neutral', 'green', 'red', 'yellow',
  'blue', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald',
] as const

export type ColorScaleName = (typeof COLOR_SCALES)[number]

export const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/** Default primitive colors — sourced from primitives.css */
export const PRIMITIVE_DEFAULTS: Record<string, string> = {
  '--pink-50': '#fcf7f7',
  '--pink-100': '#f7e9e9',
  '--pink-200': '#efd5d9',
  '--pink-300': '#e5b3bf',
  '--pink-400': '#d97195',
  '--pink-500': '#d33163',
  '--pink-600': '#b6204a',
  '--pink-700': '#932044',
  '--pink-800': '#6e1433',
  '--pink-900': '#4d0a1c',
  '--pink-950': '#2a0510',
  // ... all other scales — populated from primitives.css at build time
  // (full map to be built during implementation by reading the file)
}

/** Token groups for the editor UI */
export interface TokenGroup {
  label: string
  description: string
  tokens: TokenDef[]
}

export interface TokenDef {
  name: string          // CSS custom property name
  label: string         // Human-readable label
  defaultValue: string  // Default value from semantic.css
  type: 'color' | 'size' | 'select' | 'number'
  unit?: string         // px, rem, em, etc.
  min?: number
  max?: number
  step?: number
  options?: string[]    // For select type
}

export const SEMANTIC_GROUPS: TokenGroup[] = [
  {
    label: 'Background & Layers',
    description: 'Page background, card surfaces, and field colors',
    tokens: [
      { name: '--color-background', label: 'Background', defaultValue: 'var(--neutral-0)', type: 'color' },
      { name: '--color-layer-01', label: 'Layer 01', defaultValue: 'var(--neutral-0)', type: 'color' },
      { name: '--color-layer-02', label: 'Layer 02', defaultValue: 'var(--neutral-50)', type: 'color' },
      { name: '--color-layer-03', label: 'Layer 03', defaultValue: 'var(--neutral-100)', type: 'color' },
      { name: '--color-field', label: 'Field', defaultValue: 'var(--neutral-50)', type: 'color' },
      { name: '--color-field-hover', label: 'Field Hover', defaultValue: 'var(--neutral-100)', type: 'color' },
    ],
  },
  {
    label: 'Text Colors',
    description: 'Primary, secondary, and status text colors',
    tokens: [
      { name: '--color-text-primary', label: 'Primary', defaultValue: 'var(--neutral-900)', type: 'color' },
      { name: '--color-text-secondary', label: 'Secondary', defaultValue: 'var(--neutral-700)', type: 'color' },
      { name: '--color-text-tertiary', label: 'Tertiary', defaultValue: 'var(--neutral-600)', type: 'color' },
      { name: '--color-text-placeholder', label: 'Placeholder', defaultValue: 'var(--neutral-400)', type: 'color' },
      { name: '--color-text-disabled', label: 'Disabled', defaultValue: 'var(--neutral-400)', type: 'color' },
      { name: '--color-text-error', label: 'Error', defaultValue: 'var(--red-600)', type: 'color' },
      { name: '--color-text-success', label: 'Success', defaultValue: 'var(--green-600)', type: 'color' },
      { name: '--color-text-warning', label: 'Warning', defaultValue: 'var(--yellow-600)', type: 'color' },
      { name: '--color-text-link', label: 'Link', defaultValue: 'var(--blue-600)', type: 'color' },
    ],
  },
  {
    label: 'Border Colors',
    description: 'Borders for cards, inputs, and interactive elements',
    tokens: [
      { name: '--color-border-subtle', label: 'Subtle', defaultValue: 'var(--neutral-200)', type: 'color' },
      { name: '--color-border', label: 'Default', defaultValue: 'var(--neutral-300)', type: 'color' },
      { name: '--color-border-strong', label: 'Strong', defaultValue: 'var(--neutral-400)', type: 'color' },
      { name: '--color-border-interactive', label: 'Interactive', defaultValue: 'var(--pink-500)', type: 'color' },
      { name: '--color-border-error', label: 'Error', defaultValue: 'var(--red-500)', type: 'color' },
      { name: '--color-border-success', label: 'Success', defaultValue: 'var(--green-500)', type: 'color' },
    ],
  },
  {
    label: 'Spacing',
    description: 'Spacing scale used for padding, margins, and gaps',
    tokens: [
      { name: '--spacing-01', label: 'spacing-01', defaultValue: '2px', type: 'size', unit: 'px', min: 0, max: 16, step: 1 },
      { name: '--spacing-02', label: 'spacing-02', defaultValue: '4px', type: 'size', unit: 'px', min: 0, max: 24, step: 1 },
      { name: '--spacing-02b', label: 'spacing-02b', defaultValue: '6px', type: 'size', unit: 'px', min: 0, max: 24, step: 1 },
      { name: '--spacing-03', label: 'spacing-03', defaultValue: '8px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--spacing-04', label: 'spacing-04', defaultValue: '12px', type: 'size', unit: 'px', min: 0, max: 48, step: 1 },
      { name: '--spacing-05', label: 'spacing-05', defaultValue: '16px', type: 'size', unit: 'px', min: 0, max: 64, step: 1 },
      { name: '--spacing-05b', label: 'spacing-05b', defaultValue: '20px', type: 'size', unit: 'px', min: 0, max: 64, step: 1 },
      { name: '--spacing-06', label: 'spacing-06', defaultValue: '24px', type: 'size', unit: 'px', min: 0, max: 80, step: 1 },
      { name: '--spacing-07', label: 'spacing-07', defaultValue: '32px', type: 'size', unit: 'px', min: 0, max: 96, step: 1 },
      { name: '--spacing-08', label: 'spacing-08', defaultValue: '40px', type: 'size', unit: 'px', min: 0, max: 120, step: 1 },
      { name: '--spacing-09', label: 'spacing-09', defaultValue: '48px', type: 'size', unit: 'px', min: 0, max: 128, step: 1 },
      { name: '--spacing-10', label: 'spacing-10', defaultValue: '64px', type: 'size', unit: 'px', min: 0, max: 160, step: 1 },
      { name: '--spacing-16', label: 'spacing-16', defaultValue: '160px', type: 'size', unit: 'px', min: 0, max: 320, step: 4 },
    ],
  },
  {
    label: 'Border Radius',
    description: 'Corner rounding for cards, buttons, and inputs',
    tokens: [
      { name: '--radius-none', label: 'None', defaultValue: '0', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-sm', label: 'Small', defaultValue: '2px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-default', label: 'Default', defaultValue: '4px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-md', label: 'Medium', defaultValue: '6px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-lg', label: 'Large', defaultValue: '8px', type: 'size', unit: 'px', min: 0, max: 48, step: 1 },
      { name: '--radius-xl', label: 'Extra Large', defaultValue: '12px', type: 'size', unit: 'px', min: 0, max: 48, step: 1 },
      { name: '--radius-2xl', label: '2XL', defaultValue: '16px', type: 'size', unit: 'px', min: 0, max: 64, step: 1 },
      { name: '--radius-full', label: 'Full', defaultValue: '9999px', type: 'size', unit: 'px', min: 0, max: 9999, step: 1 },
    ],
  },
  {
    label: 'Typography',
    description: 'Font sizes, weights, and line heights',
    tokens: [
      { name: '--font-size-xs', label: 'XS', defaultValue: '0.625rem', type: 'size', unit: 'rem', min: 0.5, max: 1, step: 0.0625 },
      { name: '--font-size-sm', label: 'SM', defaultValue: '0.75rem', type: 'size', unit: 'rem', min: 0.5, max: 1.5, step: 0.0625 },
      { name: '--font-size-md', label: 'MD', defaultValue: '0.875rem', type: 'size', unit: 'rem', min: 0.5, max: 2, step: 0.0625 },
      { name: '--font-size-base', label: 'Base', defaultValue: '1rem', type: 'size', unit: 'rem', min: 0.75, max: 2, step: 0.0625 },
      { name: '--font-size-lg', label: 'LG', defaultValue: '1.125rem', type: 'size', unit: 'rem', min: 0.75, max: 3, step: 0.0625 },
      { name: '--font-size-xl', label: 'XL', defaultValue: '1.25rem', type: 'size', unit: 'rem', min: 1, max: 4, step: 0.125 },
      { name: '--font-size-2xl', label: '2XL', defaultValue: '1.5rem', type: 'size', unit: 'rem', min: 1, max: 5, step: 0.125 },
      { name: '--font-weight-light', label: 'Light', defaultValue: '300', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-regular', label: 'Regular', defaultValue: '400', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-medium', label: 'Medium', defaultValue: '500', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-semibold', label: 'Semibold', defaultValue: '600', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-bold', label: 'Bold', defaultValue: '700', type: 'number', min: 100, max: 900, step: 100 },
    ],
  },
]
```

**Step 2: Create URL state encoder/decoder**

```typescript
// apps/playground/src/lib/url-state.ts

export interface PlaygroundState {
  primitives: Record<string, string>   // e.g. { '--pink-500': '#E04080' }
  semantic: Record<string, string>     // e.g. { '--spacing-04': '20px' }
  mode: 'tokens' | 'sandbox'
  darkMode: boolean
  component?: string                   // Component name for sandbox mode
  props?: Record<string, unknown>      // Component props for sandbox mode
}

const EMPTY_STATE: PlaygroundState = {
  primitives: {},
  semantic: {},
  mode: 'tokens',
  darkMode: false,
}

export function encodeState(state: PlaygroundState): string {
  const overrides: Partial<PlaygroundState> = {}
  if (Object.keys(state.primitives).length > 0) overrides.primitives = state.primitives
  if (Object.keys(state.semantic).length > 0) overrides.semantic = state.semantic
  if (state.mode !== 'tokens') overrides.mode = state.mode
  if (state.darkMode) overrides.darkMode = true
  if (state.component) overrides.component = state.component
  if (state.props && Object.keys(state.props).length > 0) overrides.props = state.props
  if (Object.keys(overrides).length === 0) return ''
  return btoa(JSON.stringify(overrides))
}

export function decodeState(hash: string): PlaygroundState {
  if (!hash) return { ...EMPTY_STATE }
  try {
    const decoded = JSON.parse(atob(hash))
    return { ...EMPTY_STATE, ...decoded }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export function getStateFromUrl(): PlaygroundState {
  const hash = window.location.hash.slice(1) // remove '#'
  return decodeState(hash)
}

export function setStateToUrl(state: PlaygroundState): void {
  const encoded = encodeState(state)
  window.history.replaceState(null, '', encoded ? `#${encoded}` : window.location.pathname)
}
```

**Step 3: Create CSS export utility**

```typescript
// apps/playground/src/lib/css-export.ts

import type { PlaygroundState } from './url-state'

export function generateCssExport(state: PlaygroundState): string {
  const lines: string[] = [
    '/* shilp-sutra token overrides — generated from playground */',
    ':root {',
  ]

  // Primitive overrides (color scales)
  for (const [prop, value] of Object.entries(state.primitives)) {
    lines.push(`  ${prop}: ${value};`)
  }

  // Semantic overrides
  for (const [prop, value] of Object.entries(state.semantic)) {
    lines.push(`  ${prop}: ${value};`)
  }

  lines.push('}')
  return lines.join('\n')
}

export function generateJsonExport(state: PlaygroundState): string {
  return JSON.stringify(
    { primitives: state.primitives, semantic: state.semantic },
    null,
    2,
  )
}
```

**Step 4: Create the main state hook**

```typescript
// apps/playground/src/lib/use-playground-state.ts

import { useState, useCallback, useEffect, useRef } from 'react'
import { type PlaygroundState, getStateFromUrl, setStateToUrl } from './url-state'

export function usePlaygroundState() {
  const [state, setState] = useState<PlaygroundState>(getStateFromUrl)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  // Sync state to URL hash
  useEffect(() => {
    setStateToUrl(state)
  }, [state])

  // Apply token overrides as a <style> block on <html>
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.id = 'playground-overrides'
      document.head.appendChild(styleRef.current)
    }

    const lines: string[] = [':root {']
    for (const [prop, value] of Object.entries(state.primitives)) {
      lines.push(`  ${prop}: ${value};`)
    }
    for (const [prop, value] of Object.entries(state.semantic)) {
      lines.push(`  ${prop}: ${value};`)
    }
    lines.push('}')
    styleRef.current.textContent = lines.join('\n')

    return () => {
      if (styleRef.current) {
        styleRef.current.textContent = ''
      }
    }
  }, [state.primitives, state.semantic])

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  const setPrimitive = useCallback((name: string, value: string) => {
    setState(prev => ({
      ...prev,
      primitives: { ...prev.primitives, [name]: value },
    }))
  }, [])

  const setSemantic = useCallback((name: string, value: string) => {
    setState(prev => ({
      ...prev,
      semantic: { ...prev.semantic, [name]: value },
    }))
  }, [])

  const setMode = useCallback((mode: 'tokens' | 'sandbox') => {
    setState(prev => ({ ...prev, mode }))
  }, [])

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }))
  }, [])

  const setComponent = useCallback((component: string) => {
    setState(prev => ({ ...prev, component }))
  }, [])

  const setProps = useCallback((props: Record<string, unknown>) => {
    setState(prev => ({ ...prev, props }))
  }, [])

  const resetAll = useCallback(() => {
    setState(prev => ({ ...prev, primitives: {}, semantic: {} }))
  }, [])

  const resetToken = useCallback((name: string) => {
    setState(prev => {
      const { primitives, semantic } = prev
      const newPrimitives = { ...primitives }
      const newSemantic = { ...semantic }
      delete newPrimitives[name]
      delete newSemantic[name]
      return { ...prev, primitives: newPrimitives, semantic: newSemantic }
    })
  }, [])

  return {
    state,
    setPrimitive,
    setSemantic,
    setMode,
    toggleDarkMode,
    setComponent,
    setProps,
    resetAll,
    resetToken,
  }
}
```

**Step 5: Commit**

```bash
git add apps/playground/src/lib/
git commit -m "feat(playground): add token state management, URL encoding, and CSS export"
```

---

### Task 4: Build the Layout Shell

**Files:**
- Create: `apps/playground/src/components/Layout.tsx`
- Create: `apps/playground/src/components/ShareBar.tsx`
- Modify: `apps/playground/src/App.tsx`

**Step 1: Create the Layout component**

Two-column layout with top bar. Uses shilp-sutra's own tokens for styling (dogfooding).

```tsx
// apps/playground/src/components/Layout.tsx

import React from 'react'

interface LayoutProps {
  mode: 'tokens' | 'sandbox'
  onModeChange: (mode: 'tokens' | 'sandbox') => void
  darkMode: boolean
  onToggleDarkMode: () => void
  sidebar: React.ReactNode
  preview: React.ReactNode
  topBarActions: React.ReactNode
}

export function Layout({
  mode,
  onModeChange,
  darkMode,
  onToggleDarkMode,
  sidebar,
  preview,
  topBarActions,
}: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-background text-text-primary">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-lg font-semibold tracking-tight">
            शिल्प सूत्र <span className="text-text-secondary font-normal">Playground</span>
          </h1>
          {/* Mode switcher */}
          <div className="flex rounded-md border border-border-subtle">
            <button
              onClick={() => onModeChange('tokens')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'tokens'
                  ? 'bg-interactive text-text-on-color'
                  : 'text-text-secondary hover:text-text-primary'
              } rounded-l-md`}
            >
              Token Studio
            </button>
            <button
              onClick={() => onModeChange('sandbox')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'sandbox'
                  ? 'bg-interactive text-text-on-color'
                  : 'text-text-secondary hover:text-text-primary'
              } rounded-r-md`}
            >
              Component Sandbox
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="rounded-md p-2 text-text-secondary hover:bg-layer-02 hover:text-text-primary"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {topBarActions}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-border-subtle p-4">
          {sidebar}
        </aside>
        {/* Preview */}
        <main className="flex-1 overflow-y-auto p-6">
          {preview}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create the ShareBar component**

```tsx
// apps/playground/src/components/ShareBar.tsx

import { type PlaygroundState } from '../lib/url-state'
import { generateCssExport, generateJsonExport } from '../lib/css-export'

interface ShareBarProps {
  state: PlaygroundState
  onResetAll: () => void
}

export function ShareBar({ state, onResetAll }: ShareBarProps) {
  const hasOverrides =
    Object.keys(state.primitives).length > 0 ||
    Object.keys(state.semantic).length > 0

  const copyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href)
    // TODO: show toast
  }

  const copyCss = async () => {
    await navigator.clipboard.writeText(generateCssExport(state))
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(generateJsonExport(state))
  }

  return (
    <div className="flex items-center gap-2">
      {hasOverrides && (
        <button
          onClick={onResetAll}
          className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-layer-02 hover:text-text-primary"
        >
          Reset All
        </button>
      )}
      <button
        onClick={copyUrl}
        className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border hover:text-text-primary"
      >
        Copy Link
      </button>
      <button
        onClick={copyCss}
        className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border hover:text-text-primary"
      >
        Export CSS
      </button>
      <button
        onClick={copyJson}
        className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border hover:text-text-primary"
      >
        Export JSON
      </button>
    </div>
  )
}
```

**Step 3: Wire up App.tsx with the Layout**

```tsx
// apps/playground/src/App.tsx

import { Layout } from './components/Layout'
import { ShareBar } from './components/ShareBar'
import { usePlaygroundState } from './lib/use-playground-state'

export function App() {
  const pg = usePlaygroundState()

  return (
    <Layout
      mode={pg.state.mode}
      onModeChange={pg.setMode}
      darkMode={pg.state.darkMode}
      onToggleDarkMode={pg.toggleDarkMode}
      topBarActions={<ShareBar state={pg.state} onResetAll={pg.resetAll} />}
      sidebar={
        pg.state.mode === 'tokens'
          ? <div className="text-text-secondary text-sm">Token editor coming next...</div>
          : <div className="text-text-secondary text-sm">Component sandbox coming next...</div>
      }
      preview={
        <div className="text-text-secondary text-sm">Preview panel coming next...</div>
      }
    />
  )
}
```

**Step 4: Verify dev server shows the layout shell**

```bash
cd apps/playground && pnpm dev
```

**Step 5: Commit**

```bash
git add apps/playground/src/components/ apps/playground/src/App.tsx
git commit -m "feat(playground): add Layout shell with mode switcher and share bar"
```

---

### Task 5: Build the Token Editor — Color Scales

**Files:**
- Create: `apps/playground/src/components/TokenEditor/TokenEditor.tsx`
- Create: `apps/playground/src/components/TokenEditor/ColorScaleEditor.tsx`
- Create: `apps/playground/src/components/TokenEditor/Accordion.tsx`

**Step 1: Create a simple Accordion for grouping**

A lightweight accordion (don't import the full shilp-sutra Accordion to keep the playground self-contained for its own UI chrome):

```tsx
// apps/playground/src/components/TokenEditor/Accordion.tsx

import { useState } from 'react'

interface AccordionProps {
  label: string
  description?: string
  defaultOpen?: boolean
  hasChanges?: boolean
  children: React.ReactNode
}

export function Accordion({ label, description, defaultOpen = false, hasChanges, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <div>
          <span className="text-sm font-medium text-text-primary">{label}</span>
          {hasChanges && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-interactive" />}
          {description && <p className="text-xs text-text-tertiary">{description}</p>}
        </div>
        <span className="text-text-tertiary text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}
```

**Step 2: Create ColorScaleEditor**

Shows a base color picker for the 500 shade. On change, auto-generates the full spectrum. Displays all 11 shades as a strip with individual override capability.

```tsx
// apps/playground/src/components/TokenEditor/ColorScaleEditor.tsx

import { generateColorScale, SHADE_STOPS } from '../../lib/color-scale'

interface ColorScaleEditorProps {
  scaleName: string             // e.g. 'pink'
  currentValues: Record<string, string>  // current primitive overrides
  defaults: Record<string, string>       // default hex values for this scale
  onChangeShade: (prop: string, value: string) => void
  onResetShade: (prop: string) => void
}

export function ColorScaleEditor({
  scaleName,
  currentValues,
  defaults,
  onChangeShade,
  onResetShade,
}: ColorScaleEditorProps) {
  const base500Key = `--${scaleName}-500`
  const currentBase = currentValues[base500Key] || defaults[base500Key] || '#888888'

  const handleBaseChange = (newBase: string) => {
    const scale = generateColorScale(newBase)
    for (const shade of SHADE_STOPS) {
      const prop = `--${scaleName}-${shade}`
      onChangeShade(prop, scale[shade])
    }
  }

  return (
    <div className="space-y-2">
      {/* Base color picker */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-text-secondary capitalize w-16">{scaleName}</label>
        <input
          type="color"
          value={currentBase}
          onChange={(e) => handleBaseChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-border-subtle"
        />
        <input
          type="text"
          value={currentBase}
          onChange={(e) => {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              handleBaseChange(e.target.value)
            }
          }}
          className="w-20 rounded border border-border-subtle bg-field px-2 py-1 text-xs font-mono"
          placeholder="#D33163"
        />
      </div>

      {/* Shade strip */}
      <div className="flex gap-0.5 rounded overflow-hidden">
        {SHADE_STOPS.map((shade) => {
          const prop = `--${scaleName}-${shade}`
          const value = currentValues[prop] || defaults[prop] || '#888888'
          const isOverridden = prop in currentValues
          return (
            <div key={shade} className="group relative flex-1">
              <button
                className="w-full h-8 border-0 cursor-pointer"
                style={{ backgroundColor: value }}
                title={`${prop}: ${value}`}
                onClick={() => {
                  // Click to copy the value
                  navigator.clipboard.writeText(value)
                }}
              />
              <span className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 text-[9px] text-text-tertiary whitespace-nowrap">
                {shade}
              </span>
              {isOverridden && (
                <button
                  onClick={() => onResetShade(prop)}
                  className="absolute -top-1 -right-1 hidden group-hover:flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] text-text-on-color"
                  title="Reset to default"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 3: Create the main TokenEditor that uses ColorScaleEditor + semantic groups**

```tsx
// apps/playground/src/components/TokenEditor/TokenEditor.tsx

import { Accordion } from './Accordion'
import { ColorScaleEditor } from './ColorScaleEditor'
import { COLOR_SCALES, PRIMITIVE_DEFAULTS, SEMANTIC_GROUPS } from '../../lib/tokens'

interface TokenEditorProps {
  primitives: Record<string, string>
  semantic: Record<string, string>
  onChangePrimitive: (name: string, value: string) => void
  onChangeSemantic: (name: string, value: string) => void
  onResetToken: (name: string) => void
}

export function TokenEditor({
  primitives,
  semantic,
  onChangePrimitive,
  onChangeSemantic,
  onResetToken,
}: TokenEditorProps) {
  return (
    <div className="space-y-1">
      {/* Color Scales */}
      <Accordion
        label="Color Scales"
        description="Pick a base color to auto-generate each scale"
        defaultOpen
        hasChanges={Object.keys(primitives).length > 0}
      >
        <div className="space-y-6 pt-2">
          {COLOR_SCALES.map((scale) => {
            const scaleDefaults: Record<string, string> = {}
            for (const [key, val] of Object.entries(PRIMITIVE_DEFAULTS)) {
              if (key.startsWith(`--${scale}-`)) scaleDefaults[key] = val
            }
            return (
              <ColorScaleEditor
                key={scale}
                scaleName={scale}
                currentValues={primitives}
                defaults={scaleDefaults}
                onChangeShade={onChangePrimitive}
                onResetShade={onResetToken}
              />
            )
          })}
        </div>
      </Accordion>

      {/* Semantic token groups */}
      {SEMANTIC_GROUPS.map((group) => {
        const groupHasChanges = group.tokens.some((t) => t.name in semantic)
        return (
          <Accordion
            key={group.label}
            label={group.label}
            description={group.description}
            hasChanges={groupHasChanges}
          >
            <div className="space-y-3 pt-2">
              {group.tokens.map((token) => {
                const isOverridden = token.name in semantic
                const currentValue = semantic[token.name] || token.defaultValue

                if (token.type === 'color') {
                  return (
                    <div key={token.name} className="flex items-center gap-2">
                      <label className="w-24 text-xs text-text-secondary">{token.label}</label>
                      <input
                        type="color"
                        value={currentValue.startsWith('#') ? currentValue : '#888888'}
                        onChange={(e) => onChangeSemantic(token.name, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border border-border-subtle"
                      />
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => onChangeSemantic(token.name, e.target.value)}
                        className="flex-1 rounded border border-border-subtle bg-field px-2 py-1 text-xs font-mono"
                      />
                      {isOverridden && (
                        <button
                          onClick={() => onResetToken(token.name)}
                          className="text-xs text-text-tertiary hover:text-error"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  )
                }

                // Size / number controls (slider + input)
                return (
                  <div key={token.name} className="flex items-center gap-2">
                    <label className="w-24 text-xs text-text-secondary">{token.label}</label>
                    <input
                      type="range"
                      min={token.min ?? 0}
                      max={token.max ?? 100}
                      step={token.step ?? 1}
                      value={parseFloat(currentValue) || 0}
                      onChange={(e) => {
                        const val = token.unit ? `${e.target.value}${token.unit}` : e.target.value
                        onChangeSemantic(token.name, val)
                      }}
                      className="flex-1"
                    />
                    <span className="w-16 text-right text-xs font-mono text-text-secondary">
                      {currentValue}
                    </span>
                    {isOverridden && (
                      <button
                        onClick={() => onResetToken(token.name)}
                        className="text-xs text-text-tertiary hover:text-error"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </Accordion>
        )
      })}
    </div>
  )
}
```

**Step 4: Wire TokenEditor into App.tsx sidebar for tokens mode**

**Step 5: Verify in browser — color scale editors render, changing a base color generates the strip**

**Step 6: Commit**

```bash
git add apps/playground/src/components/TokenEditor/
git commit -m "feat(playground): add Token Editor with color scale auto-generation"
```

---

### Task 6: Build the Preview Panel — Component Grid

**Files:**
- Create: `apps/playground/src/components/Preview/ComponentGrid.tsx`
- Create: `apps/playground/src/components/Preview/Preview.tsx`

**Step 1: Create ComponentGrid**

Renders a curated set of components in a grid so designers see the system-wide impact of token changes. Import actual shilp-sutra components.

```tsx
// apps/playground/src/components/Preview/ComponentGrid.tsx

import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Input } from '@/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Switch } from '@/ui/switch'
import { Label } from '@/ui/label'
import { Separator } from '@/ui/separator'
import { Alert } from '@/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/ui/tooltip'

export function ComponentGrid() {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Buttons */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Button</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="solid" size="sm">Solid SM</Button>
            <Button variant="solid" size="md">Solid MD</Button>
            <Button variant="solid" size="lg">Solid LG</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="solid" color="error">Error</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Badge</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="subtle">Default</Badge>
            <Badge variant="subtle" color="success">Success</Badge>
            <Badge variant="subtle" color="error">Error</Badge>
            <Badge variant="subtle" color="warning">Warning</Badge>
            <Badge variant="subtle" color="info">Info</Badge>
            <Badge variant="solid">Solid</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <Separator />

        {/* Input */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Input</h3>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input placeholder="Default input" />
            <Input placeholder="Error state" state="error" />
            <Input placeholder="Disabled" disabled />
          </div>
        </section>

        <Separator />

        {/* Card */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Card</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>With subtle border and shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Card content goes here.</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Stronger shadow for emphasis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Card content goes here.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form Controls */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Form Controls</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="check-demo" />
              <Label htmlFor="check-demo">Checkbox</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-demo" />
              <Label htmlFor="switch-demo">Switch</Label>
            </div>
          </div>
        </section>

        <Separator />

        {/* Alerts */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Alert</h3>
          <div className="space-y-3">
            <Alert variant="info">This is an informational alert.</Alert>
            <Alert variant="success">Operation completed successfully.</Alert>
            <Alert variant="warning">Please review before proceeding.</Alert>
            <Alert variant="error">Something went wrong.</Alert>
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Tabs</h3>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Details</TabsTrigger>
              <TabsTrigger value="tab3">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p className="text-sm text-text-secondary p-3">Overview content</p>
            </TabsContent>
            <TabsContent value="tab2">
              <p className="text-sm text-text-secondary p-3">Details content</p>
            </TabsContent>
            <TabsContent value="tab3">
              <p className="text-sm text-text-secondary p-3">Settings content</p>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Avatar */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Avatar</h3>
          <div className="flex gap-3">
            <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>EF</AvatarFallback></Avatar>
          </div>
        </section>

        <Separator />

        {/* Tooltip */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Tooltip</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </section>
      </div>
    </TooltipProvider>
  )
}
```

**Step 2: Create Preview wrapper**

```tsx
// apps/playground/src/components/Preview/Preview.tsx

import { ComponentGrid } from './ComponentGrid'

interface PreviewProps {
  mode: 'tokens' | 'sandbox'
  sandboxContent?: React.ReactNode
}

export function Preview({ mode, sandboxContent }: PreviewProps) {
  if (mode === 'sandbox' && sandboxContent) {
    return <div className="max-w-4xl mx-auto">{sandboxContent}</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ComponentGrid />
    </div>
  )
}
```

**Step 3: Wire Preview into App.tsx**

**Step 4: Verify — all components render in the grid and respond to token changes**

**Step 5: Commit**

```bash
git add apps/playground/src/components/Preview/
git commit -m "feat(playground): add component preview grid with 12 starter components"
```

---

### Task 7: Build the Component Sandbox

**Files:**
- Create: `apps/playground/src/components/ComponentSandbox/ComponentRegistry.ts`
- Create: `apps/playground/src/components/ComponentSandbox/PropControl.tsx`
- Create: `apps/playground/src/components/ComponentSandbox/ComponentSandbox.tsx`

**Step 1: Create ComponentRegistry**

Maps component names to their React component + prop schema. The prop schema describes each CVA variant axis and key props.

```typescript
// apps/playground/src/components/ComponentSandbox/ComponentRegistry.ts

import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Input } from '@/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card'
import { Alert } from '@/ui/alert'
import { Checkbox } from '@/ui/checkbox'
import { Switch } from '@/ui/switch'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { Separator } from '@/ui/separator'
import type { ComponentType } from 'react'

export interface PropSchema {
  name: string
  type: 'select' | 'text' | 'boolean' | 'number'
  label: string
  options?: string[]
  defaultValue: string | boolean | number
}

export interface ComponentEntry {
  name: string
  component: ComponentType<any>
  /** Wrapper to render the component with children/sub-components */
  render: (props: Record<string, any>) => React.ReactNode
  props: PropSchema[]
}

export const COMPONENT_REGISTRY: ComponentEntry[] = [
  {
    name: 'Button',
    component: Button,
    render: (props) => <Button {...props}>{props.children || 'Button'}</Button>,
    props: [
      { name: 'variant', type: 'select', label: 'Variant', options: ['solid', 'outline', 'ghost', 'link'], defaultValue: 'solid' },
      { name: 'color', type: 'select', label: 'Color', options: ['default', 'error'], defaultValue: 'default' },
      { name: 'size', type: 'select', label: 'Size', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      { name: 'children', type: 'text', label: 'Label', defaultValue: 'Button' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', defaultValue: false },
      { name: 'loading', type: 'boolean', label: 'Loading', defaultValue: false },
      { name: 'fullWidth', type: 'boolean', label: 'Full Width', defaultValue: false },
    ],
  },
  {
    name: 'Badge',
    component: Badge,
    render: (props) => <Badge {...props}>{props.children || 'Badge'}</Badge>,
    props: [
      { name: 'variant', type: 'select', label: 'Variant', options: ['subtle', 'solid', 'outline'], defaultValue: 'subtle' },
      { name: 'color', type: 'select', label: 'Color', options: ['default', 'info', 'success', 'error', 'warning', 'brand', 'accent', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'], defaultValue: 'default' },
      { name: 'size', type: 'select', label: 'Size', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      { name: 'children', type: 'text', label: 'Label', defaultValue: 'Badge' },
      { name: 'dot', type: 'boolean', label: 'Dot', defaultValue: false },
    ],
  },
  {
    name: 'Input',
    component: Input,
    render: (props) => <Input {...props} />,
    props: [
      { name: 'size', type: 'select', label: 'Size', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      { name: 'state', type: 'select', label: 'State', options: ['default', 'error', 'warning', 'success'], defaultValue: 'default' },
      { name: 'placeholder', type: 'text', label: 'Placeholder', defaultValue: 'Type something...' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', defaultValue: false },
      { name: 'readOnly', type: 'boolean', label: 'Read Only', defaultValue: false },
    ],
  },
  {
    name: 'Card',
    component: Card,
    render: (props) => (
      <Card variant={props.variant} interactive={props.interactive}>
        <CardHeader>
          <CardTitle>{props.title || 'Card Title'}</CardTitle>
          <CardDescription>{props.description || 'Card description text'}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">{props.content || 'Card content goes here.'}</p>
        </CardContent>
      </Card>
    ),
    props: [
      { name: 'variant', type: 'select', label: 'Variant', options: ['default', 'elevated', 'outline', 'flat'], defaultValue: 'default' },
      { name: 'interactive', type: 'boolean', label: 'Interactive', defaultValue: false },
      { name: 'title', type: 'text', label: 'Title', defaultValue: 'Card Title' },
      { name: 'description', type: 'text', label: 'Description', defaultValue: 'Card description text' },
      { name: 'content', type: 'text', label: 'Content', defaultValue: 'Card content goes here.' },
    ],
  },
  {
    name: 'Alert',
    component: Alert,
    render: (props) => <Alert {...props}>{props.children || 'Alert message'}</Alert>,
    props: [
      { name: 'variant', type: 'select', label: 'Variant', options: ['info', 'success', 'warning', 'error'], defaultValue: 'info' },
      { name: 'children', type: 'text', label: 'Message', defaultValue: 'This is an alert message.' },
    ],
  },
  {
    name: 'Checkbox',
    component: Checkbox,
    render: (props) => <Checkbox {...props} />,
    props: [
      { name: 'disabled', type: 'boolean', label: 'Disabled', defaultValue: false },
      { name: 'defaultChecked', type: 'boolean', label: 'Default Checked', defaultValue: false },
    ],
  },
  {
    name: 'Switch',
    component: Switch,
    render: (props) => <Switch {...props} />,
    props: [
      { name: 'disabled', type: 'boolean', label: 'Disabled', defaultValue: false },
      { name: 'defaultChecked', type: 'boolean', label: 'Default Checked', defaultValue: false },
    ],
  },
  {
    name: 'Avatar',
    component: Avatar,
    render: (props) => (
      <Avatar>
        <AvatarFallback>{props.initials || 'AB'}</AvatarFallback>
      </Avatar>
    ),
    props: [
      { name: 'initials', type: 'text', label: 'Initials', defaultValue: 'AB' },
    ],
  },
  {
    name: 'Separator',
    component: Separator,
    render: (props) => <Separator {...props} />,
    props: [
      { name: 'orientation', type: 'select', label: 'Orientation', options: ['horizontal', 'vertical'], defaultValue: 'horizontal' },
    ],
  },
]
```

**Step 2: Create PropControl — renders the right control for each prop type**

```tsx
// apps/playground/src/components/ComponentSandbox/PropControl.tsx

import type { PropSchema } from './ComponentRegistry'

interface PropControlProps {
  schema: PropSchema
  value: any
  onChange: (value: any) => void
}

export function PropControl({ schema, value, onChange }: PropControlProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-28 text-xs text-text-secondary shrink-0">{schema.label}</label>
      {schema.type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-border-subtle bg-field px-2 py-1.5 text-xs"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {schema.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-border-subtle bg-field px-2 py-1.5 text-xs"
        />
      )}
      {schema.type === 'boolean' && (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded"
        />
      )}
      {schema.type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 rounded border border-border-subtle bg-field px-2 py-1.5 text-xs"
        />
      )}
    </div>
  )
}
```

**Step 3: Create ComponentSandbox — component picker + prop controls + preview + code output**

```tsx
// apps/playground/src/components/ComponentSandbox/ComponentSandbox.tsx

import { useState, useMemo } from 'react'
import { COMPONENT_REGISTRY } from './ComponentRegistry'
import { PropControl } from './PropControl'

interface ComponentSandboxProps {
  selectedComponent?: string
  componentProps: Record<string, any>
  onSelectComponent: (name: string) => void
  onChangeProps: (props: Record<string, any>) => void
}

export function ComponentSandbox({
  selectedComponent,
  componentProps,
  onSelectComponent,
  onChangeProps,
}: ComponentSandboxProps) {
  const entry = COMPONENT_REGISTRY.find((c) => c.name === selectedComponent)

  // Initialize props from defaults when component changes
  const currentProps = useMemo(() => {
    if (!entry) return {}
    const defaults: Record<string, any> = {}
    for (const p of entry.props) {
      defaults[p.name] = p.defaultValue
    }
    return { ...defaults, ...componentProps }
  }, [entry, componentProps])

  const handlePropChange = (name: string, value: any) => {
    onChangeProps({ ...currentProps, [name]: value })
  }

  // Generate JSX code string for copy
  const codeString = useMemo(() => {
    if (!entry) return ''
    const propsStr = entry.props
      .filter((p) => currentProps[p.name] !== p.defaultValue && p.name !== 'children')
      .map((p) => {
        const v = currentProps[p.name]
        if (typeof v === 'boolean') return v ? p.name : null
        if (typeof v === 'number') return `${p.name}={${v}}`
        return `${p.name}="${v}"`
      })
      .filter(Boolean)
      .join(' ')

    const children = currentProps.children || ''
    const hasChildren = entry.props.some((p) => p.name === 'children')
    const tag = entry.name
    const space = propsStr ? ' ' : ''

    if (hasChildren && children) {
      return `<${tag}${space}${propsStr}>${children}</${tag}>`
    }
    return `<${tag}${space}${propsStr} />`
  }, [entry, currentProps])

  return (
    <div className="space-y-4">
      {/* Component picker */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Component</label>
        <select
          value={selectedComponent || ''}
          onChange={(e) => onSelectComponent(e.target.value)}
          className="w-full rounded border border-border-subtle bg-field px-3 py-2 text-sm"
        >
          <option value="" disabled>Select a component...</option>
          {COMPONENT_REGISTRY.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Prop controls */}
      {entry && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Props</h4>
          {entry.props.map((schema) => (
            <PropControl
              key={schema.name}
              schema={schema}
              value={currentProps[schema.name]}
              onChange={(v) => handlePropChange(schema.name, v)}
            />
          ))}
        </div>
      )}

      {/* Code preview */}
      {entry && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Code</h4>
            <button
              onClick={() => navigator.clipboard.writeText(codeString)}
              className="text-xs text-text-link hover:text-text-link-hover"
            >
              Copy
            </button>
          </div>
          <pre className="rounded-md bg-layer-02 p-3 text-xs font-mono text-text-primary overflow-x-auto">
            {codeString}
          </pre>
        </div>
      )}
    </div>
  )
}
```

**Step 4: Create sandbox preview renderer**

```tsx
// apps/playground/src/components/ComponentSandbox/SandboxPreview.tsx

import { useMemo } from 'react'
import { COMPONENT_REGISTRY } from './ComponentRegistry'

interface SandboxPreviewProps {
  selectedComponent?: string
  componentProps: Record<string, any>
}

export function SandboxPreview({ selectedComponent, componentProps }: SandboxPreviewProps) {
  const entry = COMPONENT_REGISTRY.find((c) => c.name === selectedComponent)

  const currentProps = useMemo(() => {
    if (!entry) return {}
    const defaults: Record<string, any> = {}
    for (const p of entry.props) {
      defaults[p.name] = p.defaultValue
    }
    return { ...defaults, ...componentProps }
  }, [entry, componentProps])

  if (!entry) {
    return (
      <div className="flex h-64 items-center justify-center text-text-tertiary text-sm">
        Select a component from the sidebar
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border-subtle bg-layer-01 p-8">
      {entry.render(currentProps)}
    </div>
  )
}
```

**Step 5: Wire ComponentSandbox + SandboxPreview into App.tsx**

**Step 6: Verify — component picker works, prop changes update preview and code output**

**Step 7: Commit**

```bash
git add apps/playground/src/components/ComponentSandbox/
git commit -m "feat(playground): add Component Sandbox with prop editor and code preview"
```

---

### Task 8: Wire Everything Together in App.tsx

**Files:**
- Modify: `apps/playground/src/App.tsx`

**Step 1: Import and connect all components**

```tsx
// apps/playground/src/App.tsx

import { Layout } from './components/Layout'
import { ShareBar } from './components/ShareBar'
import { TokenEditor } from './components/TokenEditor/TokenEditor'
import { ComponentSandbox } from './components/ComponentSandbox/ComponentSandbox'
import { SandboxPreview } from './components/ComponentSandbox/SandboxPreview'
import { Preview } from './components/Preview/Preview'
import { usePlaygroundState } from './lib/use-playground-state'

export function App() {
  const pg = usePlaygroundState()

  return (
    <Layout
      mode={pg.state.mode}
      onModeChange={pg.setMode}
      darkMode={pg.state.darkMode}
      onToggleDarkMode={pg.toggleDarkMode}
      topBarActions={<ShareBar state={pg.state} onResetAll={pg.resetAll} />}
      sidebar={
        pg.state.mode === 'tokens' ? (
          <TokenEditor
            primitives={pg.state.primitives}
            semantic={pg.state.semantic}
            onChangePrimitive={pg.setPrimitive}
            onChangeSemantic={pg.setSemantic}
            onResetToken={pg.resetToken}
          />
        ) : (
          <ComponentSandbox
            selectedComponent={pg.state.component}
            componentProps={pg.state.props || {}}
            onSelectComponent={pg.setComponent}
            onChangeProps={pg.setProps}
          />
        )
      }
      preview={
        <Preview
          mode={pg.state.mode}
          sandboxContent={
            <SandboxPreview
              selectedComponent={pg.state.component}
              componentProps={pg.state.props || {}}
            />
          }
        />
      }
    />
  )
}
```

**Step 2: Verify full flow — token studio mode shows editor + grid, sandbox mode shows component picker + preview**

**Step 3: Commit**

```bash
git add apps/playground/src/App.tsx
git commit -m "feat(playground): wire Token Studio and Component Sandbox together"
```

---

### Task 9: Populate Full Primitive Defaults

**Files:**
- Modify: `apps/playground/src/lib/tokens.ts`

**Step 1: Read all hex values from `packages/core/src/tokens/primitives.css`**

Populate the `PRIMITIVE_DEFAULTS` map with every `--<scale>-<shade>` value from the file. There are 14 scales × 11 shades (neutral has 12 with neutral-0) = ~155 entries.

This is a mechanical copy task. Read `primitives.css` and transcribe each `--<name>: <hex>;` into the defaults map.

**Step 2: Verify — all color scale editors show correct default colors**

**Step 3: Commit**

```bash
git add apps/playground/src/lib/tokens.ts
git commit -m "feat(playground): populate all primitive color defaults from primitives.css"
```

---

### Task 10: Update CI Workflow for Deployment

**Files:**
- Modify: `.github/workflows/deploy-storybook.yml`
- Modify: root `package.json` — add `build:playground` script

**Step 1: Add build script to root package.json**

```json
"build:playground": "cd apps/playground && pnpm build"
```

**Step 2: Update the workflow to build playground and merge into storybook-static**

Add these steps after "Build Storybook" and before "Setup Pages":

```yaml
      - name: Build Playground
        run: pnpm build:playground

      - name: Merge Playground into Storybook output
        run: |
          mkdir -p storybook-static/playground
          cp -r apps/playground/dist/* storybook-static/playground/
```

**Step 3: Add CNAME file creation (if custom domain needs it in the deploy dir)**

Check if the GitHub Pages custom domain is configured in repo settings. If it needs a CNAME file:

```yaml
      - name: Add CNAME for custom domain
        run: echo "shilp-sutra.devalok.in" > storybook-static/CNAME
```

**Step 4: Commit**

```bash
git add .github/workflows/deploy-storybook.yml package.json
git commit -m "ci: build playground and deploy alongside Storybook"
```

---

### Task 11: Polish and Integration Testing

**Files:**
- Various touchups across `apps/playground/src/`

**Step 1: Test the full flow manually**

1. `pnpm dev` from root (Storybook) — verify still works
2. `cd apps/playground && pnpm dev` — verify playground loads
3. Token Studio: change pink-500 base color → verify spectrum generates → verify components in grid update
4. Token Studio: change spacing/radii sliders → verify components update
5. Dark mode toggle → verify all tokens switch
6. Component Sandbox: select Button → change variant/size/color → verify preview and code
7. Copy Link → open in new tab → verify state restores
8. Export CSS → verify clean output with only overrides
9. Export JSON → verify valid JSON
10. Reset All → verify everything returns to defaults

**Step 2: Fix any issues found during manual testing**

**Step 3: Run build to ensure production build works**

```bash
cd apps/playground && pnpm build
```

**Step 4: Verify production build output**

```bash
ls apps/playground/dist/
```

Should contain `index.html`, `assets/` directory with JS/CSS bundles.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(playground): polish and integration fixes"
```

---

## Execution Notes

- **Tasks 1–3** are foundational — must be done sequentially
- **Tasks 4–7** can be partially parallelized (Layout, TokenEditor, Preview, Sandbox are independent)
- **Task 8** depends on Tasks 4–7 (wiring everything together)
- **Task 9** is a mechanical data-entry task, can be done anytime after Task 5
- **Task 10** is independent of app code (CI only)
- **Task 11** is the final integration pass

## Dependencies Between Tasks

```
Task 1 (scaffold) → Task 2 (color-scale) → Task 5 (token editor)
Task 1 → Task 3 (state mgmt) → Task 4 (layout) → Task 8 (wire up)
Task 1 → Task 6 (preview grid) → Task 8
Task 1 → Task 7 (component sandbox) → Task 8
Task 5 → Task 9 (populate defaults)
Task 8 → Task 11 (polish)
Task 10 (CI) — independent
```
