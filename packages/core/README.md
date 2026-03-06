# @devalok/shilp-sutra

Devalok Design System -- tokens, components, and patterns for React & Next.js.

[![npm](https://img.shields.io/npm/v/@devalok/shilp-sutra)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Quick Setup

### 1. Install

```bash
pnpm add @devalok/shilp-sutra
```

### 2. Add Tailwind Preset

```ts
// tailwind.config.ts
import shilpSutra from '@devalok/shilp-sutra/tailwind'

export default {
  presets: [shilpSutra],
  content: [
    './app/**/*.{ts,tsx}',
    './node_modules/@devalok/shilp-sutra/dist/**/*.js',
  ],
}
```

### 3. Import Tokens

```tsx
// app/layout.tsx (Next.js) or main entry point
import '@devalok/shilp-sutra/tokens'
import './globals.css'
```

Done. Start using components.

---

## Import Patterns

### Per-component import (recommended)

Best for tree-shaking, Server Components, and fast builds:

```tsx
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Dialog } from '@devalok/shilp-sutra/ui/dialog'
import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'
import { TopBar } from '@devalok/shilp-sutra/shell/top-bar'
```

### Barrel import

Convenient for client components that use many primitives:

```tsx
import { Button, Dialog, Input, Badge } from '@devalok/shilp-sutra/ui'
import { PageHeader, DatePicker } from '@devalok/shilp-sutra/composed'
import { AppSidebar, TopBar } from '@devalok/shilp-sutra/shell'
```

### Root import

Shorthand for UI components only:

```tsx
import { Button, Input } from '@devalok/shilp-sutra'
```

---

## Mental Model

The design system is organized into three tiers:

| Layer | Import | What it contains |
|-------|--------|------------------|
| **ui** | `@devalok/shilp-sutra/ui` | 60+ atomic primitives -- buttons, inputs, dialogs, cards, tables, badges, charts, navigation menus |
| **composed** | `@devalok/shilp-sutra/composed` | 14 multi-component patterns -- date picker, rich text editor, command palette, page header, skeletons |
| **shell** | `@devalok/shilp-sutra/shell` | 7 app-level layout components -- sidebar, top bar, bottom navbar, notification center, command palette |

Additional exports:

| Import | Contents |
|--------|----------|
| `@devalok/shilp-sutra/tokens` | CSS custom properties (primitives, semantic, typography) |
| `@devalok/shilp-sutra/tailwind` | Tailwind CSS preset with all design tokens |
| `@devalok/shilp-sutra/hooks` | `useToast`, `useColorMode`, `useIsMobile` |
| `@devalok/shilp-sutra/fonts/*` | Inter and Ranade variable fonts (WOFF2) |

---

## Peer Dependencies

### Required

| Package | Version |
|---------|---------|
| `react` | `^18 \|\| ^19` |
| `react-dom` | `^18 \|\| ^19` |

### Optional

Install only what you use:

| Feature | Packages |
|---------|----------|
| Charts (`./ui/charts`) | `d3-array`, `d3-axis`, `d3-format`, `d3-interpolate`, `d3-scale`, `d3-selection`, `d3-shape`, `d3-time-format`, `d3-transition` |
| Rich Text Editor (`./composed/rich-text-editor`) | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder` |
| DataTable (`./ui/data-table`) | `@tanstack/react-table`, `@tanstack/react-virtual` |
| Icons (various components) | `@tabler/icons-react` |
| Date components (`./composed/date-picker`) | `date-fns` |
| OTP Input (`./ui/input-otp`) | `input-otp` |
| Markdown rendering | `react-markdown` |

Example -- install only charts deps:

```bash
pnpm add d3-array d3-axis d3-format d3-interpolate d3-scale d3-selection d3-shape d3-time-format d3-transition
```

---

## Server-Safe Components

These components work in React Server Components when imported via their per-component path. They do **not** include `"use client"` directives:

### ui

| Component | Import |
|-----------|--------|
| Text | `@devalok/shilp-sutra/ui/text` |
| Skeleton | `@devalok/shilp-sutra/ui/skeleton` |
| Spinner | `@devalok/shilp-sutra/ui/spinner` |
| Stack | `@devalok/shilp-sutra/ui/stack` |
| Container | `@devalok/shilp-sutra/ui/container` |
| Table | `@devalok/shilp-sutra/ui/table` |
| Code | `@devalok/shilp-sutra/ui/code` |
| VisuallyHidden | `@devalok/shilp-sutra/ui/visually-hidden` |

### composed

| Component | Import |
|-----------|--------|
| ContentCard | `@devalok/shilp-sutra/composed/content-card` |
| EmptyState | `@devalok/shilp-sutra/composed/empty-state` |
| PageHeader | `@devalok/shilp-sutra/composed/page-header` |
| LoadingSkeleton | `@devalok/shilp-sutra/composed/loading-skeleton` |
| PageSkeletons | `@devalok/shilp-sutra/composed/page-skeletons` |
| PriorityIndicator | `@devalok/shilp-sutra/composed/priority-indicator` |
| StatusBadge | `@devalok/shilp-sutra/composed/status-badge` |

All other components require client-side React and include `"use client"`.

---

## Dark Mode

The design system uses CSS custom properties with a `.dark` class toggle. All semantic tokens have dark mode overrides built in.

### Setup

Add the `.dark` class to your `<html>` or a parent element:

```html
<html class="dark">
```

### Next.js with next-themes

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Programmatic toggle

```tsx
import { useColorMode } from '@devalok/shilp-sutra/hooks'

function ThemeToggle() {
  const { mode, toggle } = useColorMode()
  return <button onClick={toggle}>{mode === 'dark' ? 'Light' : 'Dark'}</button>
}
```

---

## TypeScript

Full TypeScript support works out of the box. No special `tsconfig.json` settings required.

All component props are exported as named types:

```tsx
import { type ButtonProps } from '@devalok/shilp-sutra/ui/button'
import { type DatePickerProps } from '@devalok/shilp-sutra/composed/date-picker'
```

---

## Token Architecture

Three-tier CSS custom property system:

1. **Primitives** (`primitives.css`) -- Raw palette values (50-950 scales). Never used directly in components.
2. **Semantic** (`semantic.css`) -- Intent-based tokens (`--color-interactive`, `--color-text-primary`). Includes dark mode via `.dark` class.
3. **Typography** (`typography.css`) -- Font-face declarations, type scale (T1-T7, B1-B8, L1-L6, P1-P7).

---

## Links

- [Storybook](https://devalok-design.github.io/shilp-sutra/) -- interactive component docs
- [GitHub](https://github.com/devalok-design/shilp-sutra)
- [Changelog](https://github.com/devalok-design/shilp-sutra/blob/main/CHANGELOG.md)

## License

MIT -- Copyright 2026 Devalok Design & Strategy Studios
