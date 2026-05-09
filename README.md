# Shilp Sutra

The Devalok Design System -- tokens, components, and patterns for React & Next.js applications.

[![npm version](https://img.shields.io/npm/v/@devalok/shilp-sutra?logo=npm&color=cb3837)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![npm downloads](https://img.shields.io/npm/dm/@devalok/shilp-sutra?logo=npm&color=cb3837)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@devalok/shilp-sutra?label=minzip)](https://bundlephobia.com/package/@devalok/shilp-sutra)
[![license MIT](https://img.shields.io/npm/l/@devalok/shilp-sutra?color=blue)](./LICENSE)
[![provenance](https://img.shields.io/badge/provenance-sigstore-success?logo=npm)](https://docs.npmjs.com/generating-provenance-statements)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)
[![AI agents ready](https://img.shields.io/badge/AI%20agents-AGENTS.md-7c3aed)](./AGENTS.md)

## Packages

| Package | Description |
| --- | --- |
| `@devalok/shilp-sutra` | Tailwind 4 CSS-first tokens, 78 UI primitives, 29 composed components, 8 shell components, 5 AI components |
| `@devalok/shilp-sutra-brand` | Brand logos and SVG/PNG/WebP assets (Devalok, Karm) |

> **Note:** Domain-specific components (board, tasks, chat, dashboard, client, admin) previously published as `@devalok/shilp-sutra-karm` have been moved to their respective consumer app repositories.

```bash
# Core (required)
pnpm add @devalok/shilp-sutra

# Brand assets (optional)
pnpm add @devalok/shilp-sutra-brand
```

## Quick Setup

### 1. Install with required peers

```bash
pnpm add @devalok/shilp-sutra framer-motion
# Only if you render a <Toaster />:
pnpm add sonner
# Only if you use rich text / icons already peer-declared in your app:
pnpm add tailwindcss@^4
```

### 2. Wire Tailwind 4 in your CSS entry

Shilp Sutra is a **Tailwind 4 CSS-first** design system. No `tailwind.config.ts` is needed for us. Add this to `app/globals.css`:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

That's it — tokens, utilities, the dark variant, and compiled class scanning all come from the `/css` entry. Your own `@plugin "..."` / `@source "..."` / `@theme { }` extensions go in the same file.

### 3. Transpile our packages in `next.config.ts`

```ts
transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
```

### 4. Use components

```tsx
import { Button, Dialog, Input } from '@devalok/shilp-sutra/ui'
import { PageHeader, DatePicker } from '@devalok/shilp-sutra/composed'
import { AppSidebar, TopBar } from '@devalok/shilp-sutra/shell'
import { DevalokLogo } from '@devalok/shilp-sutra-brand/devalok'
```

> **Upgrading from 0.36 or earlier?** Read [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration).

## Setup recipes (per framework)

Step-by-step copy-paste install guides for each major React framework. Designed for both humans and AI coding agents (Claude Code, Cursor, Copilot, Codex).

| Framework | Recipe |
|---|---|
| Next.js (App Router) | [install-next-app-router.md](./packages/core/docs/recipes/install-next-app-router.md) |
| Next.js (Pages Router) | [install-next-pages.md](./packages/core/docs/recipes/install-next-pages.md) |
| Vite + React | [install-vite.md](./packages/core/docs/recipes/install-vite.md) |
| Astro | [install-astro.md](./packages/core/docs/recipes/install-astro.md) |
| Remix | [install-remix.md](./packages/core/docs/recipes/install-remix.md) |
| TanStack Start | [install-tanstack-start.md](./packages/core/docs/recipes/install-tanstack-start.md) |

Customization & diagnostics:

- [customize-brand.md](./packages/core/docs/recipes/customize-brand.md) — change colors, radius, fonts, spacing
- [server-components.md](./packages/core/docs/recipes/server-components.md) — RSC-safety matrix
- [troubleshoot.md](./packages/core/docs/recipes/troubleshoot.md) — fixing the 8 most common breakages

Recipes ship inside the npm package at `node_modules/@devalok/shilp-sutra/docs/recipes/`, so AI agents can read them locally without a network round-trip. See [AGENTS.md](./AGENTS.md) for the full agent integration contract.

## Mental Model

The design system is organized into three tiers:

| Layer | Import | What it contains |
|-------|--------|------------------|
| **ui** | `@devalok/shilp-sutra/ui` | 78 atomic primitives -- buttons, inputs, dialogs, cards, tables, badges, charts, navigation, transitions |
| **composed** | `@devalok/shilp-sutra/composed` | 29 multi-component patterns -- date picker, rich text editor, command palette, page header, loading skeletons |
| **shell** | `@devalok/shilp-sutra/shell` | 8 app-level layout components -- sidebar, top bar, bottom navbar, notification center, command palette |
| **ai** | `@devalok/shilp-sutra/ai` | 5 AI chat/assistant primitives -- conversation, command bar, block renderer |

**ui** components are atomic primitives. They have minimal opinions and are designed to be combined.
**composed** components combine multiple ui primitives into reusable patterns (e.g. DatePicker combines a calendar grid, popover, time picker, and presets).
**shell** components form the application frame -- navigation, top chrome, and mobile layout.

## Import Patterns

### Per-component import (recommended)

Best for tree-shaking and required for Server Components:

```tsx
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Dialog } from '@devalok/shilp-sutra/ui/dialog'
import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'
import { TopBar } from '@devalok/shilp-sutra/shell/top-bar'
```

### Barrel import

Convenient for client components that use many primitives:

```tsx
import { Button, Dialog, Input, Badge, Tabs } from '@devalok/shilp-sutra/ui'
import { PageHeader, DatePicker } from '@devalok/shilp-sutra/composed'
```

### Root import

Shorthand that re-exports `./ui`:

```tsx
import { Button, Input } from '@devalok/shilp-sutra'
```

## Dark Mode

The design system uses CSS custom properties with a `.dark` class toggle. All semantic tokens have dark mode overrides built in.

```html
<!-- Toggle dark mode by adding .dark to any ancestor -->
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

## Server-Safe Components

These components do **not** include `"use client"` directives and work in React Server Components when imported via their per-component path:

| Layer | Components |
|-------|------------|
| **ui** | Text, Skeleton, Spinner, Stack, Container, Table, Code, VisuallyHidden |
| **composed** | ContentCard, EmptyState, PageHeader, LoadingSkeleton, PageSkeletons, PriorityIndicator, StatusBadge |

```tsx
// Server Component -- safe:
import { Text } from '@devalok/shilp-sutra/ui/text'
import { Stack } from '@devalok/shilp-sutra/ui/stack'
import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'
```

All other components require client-side React and include `"use client"`.

## Optional Peer Dependencies

Only install the packages you actually use:

| Feature | Packages to install |
|---------|---------------------|
| **Charts** (`./ui/charts`) | `d3-array` `d3-axis` `d3-format` `d3-interpolate` `d3-scale` `d3-selection` `d3-shape` `d3-time-format` `d3-transition` |
| **Rich Text Editor** (`./composed/rich-text-editor`) | `@tiptap/react` `@tiptap/starter-kit` `@tiptap/extension-placeholder` |
| **DataTable** (`./ui/data-table`) | `@tanstack/react-table` `@tanstack/react-virtual` |
| **Icons** (various components) | `@tabler/icons-react` |
| **Date components** (`./composed/date-picker`) | `date-fns` |
| **OTP Input** (`./ui/input-otp`) | `input-otp` |
| **Markdown rendering** | `react-markdown` |

`react` and `react-dom` (`^18 || ^19`) are the only required peer dependencies.

## Package Exports

### @devalok/shilp-sutra (core)

| Import path | Contents |
| --- | --- |
| `@devalok/shilp-sutra` | Root export -- re-exports all of `./ui` |
| `@devalok/shilp-sutra/css` | **Primary consumer entry** — Tailwind 4 `@theme` tokens, dark variant, base layer, custom utilities |
| `@devalok/shilp-sutra/tokens` | CSS custom properties only (primitives, semantic, typography) — for advanced setups |
| `@devalok/shilp-sutra/ui` | 78 Radix-based UI primitives |
| `@devalok/shilp-sutra/ui/<name>` | Per-component exports (e.g. `./ui/button`, `./ui/dialog`) |
| `@devalok/shilp-sutra/composed` | 29 higher-level composed components |
| `@devalok/shilp-sutra/composed/<name>` | Per-component exports (e.g. `./composed/date-picker`) |
| `@devalok/shilp-sutra/shell` | 8 app shell components |
| `@devalok/shilp-sutra/shell/<name>` | Per-component exports (e.g. `./shell/top-bar`) |
| `@devalok/shilp-sutra/hooks` | `useToast`, `useColorMode`, `useIsMobile` |
| `@devalok/shilp-sutra/fonts/*` | Inter and Ranade variable font files (WOFF2) |

### @devalok/shilp-sutra-brand

| Import path | Contents |
| --- | --- |
| `@devalok/shilp-sutra-brand` | All brand logos |
| `@devalok/shilp-sutra-brand/devalok` | Devalok logos (full, mark, wordmark) |
| `@devalok/shilp-sutra-brand/karm` | Karm logos (full, mark, wordmark) |
| `@devalok/shilp-sutra-brand/assets/*` | Raw SVG/PNG/WebP assets |

## UI Components

### Core
Button, IconButton, ButtonGroup, Input, Label, Separator, VisuallyHidden

### Form Controls
Checkbox, Radio, Switch, Select, Textarea, NumberInput, SearchInput, InputOTP, FormField, Slider, Toggle, ToggleGroup, Autocomplete, Combobox, FileUpload

### Feedback & Overlays
AlertDialog, Dialog, Sheet, Toast, Tooltip, Popover, HoverCard, Collapsible, Alert, Banner, Spinner

### Data Display
Card, Badge, Avatar, Table, DataTable, DataTableToolbar, Progress, Skeleton, StatCard, Code, AspectRatio, Chip

### Navigation
Accordion, Tabs, Breadcrumb, DropdownMenu, ContextMenu, Menubar, Pagination, NavigationMenu, Sidebar, Link, SegmentedControl

### Charts
ChartContainer, BarChart, LineChart, AreaChart, PieChart, Sparkline, GaugeChart, RadarChart, Legend

### Layout & Utilities
Text, Stack, Container, Stepper, TreeView, Transitions (Fade, Collapse, Grow, Slide)

## Token Architecture

Three-tier CSS custom property system:

1. **Primitives** (`primitives.css`) -- Raw palette values (pink, purple, neutral, green, red, yellow, blue). Full 50-950 scales. Never used directly in components.
2. **Semantic** (`semantic.css`) -- Intent-based tokens mapping primitives to meaning (`--color-interactive`, `--color-text-primary`, etc.). Includes complete dark mode via `.dark` class.
3. **Typography** (`typography.css` + `typography-semantic.css`) -- Font-face declarations and semantic type presets (heading-2xl..xs, body-lg..xs, label-lg..xs, caption, overline).

## Component Design

- **Props-based API** -- No internal stores or data fetching. Components receive data via props and emit events via callbacks.
- **`'use client'` directives** -- All interactive components include the directive. Server-compatible components omit it.
- **Semantic tokens only** -- All components use CSS custom properties from the semantic layer. No hardcoded colors.
- **Dark mode** -- Toggle via `.dark` class on a parent element. All tokens have dark mode overrides.
- **next/font compatible** -- Font families use CSS variables (`--font-sans`, `--font-body`, `--font-mono`) overridable via `next/font`.
- **Tree-shakeable** -- Each sub-module is independently importable. `preserveModules: true` in build config.

## Design Philosophy

See [docs/design-philosophy.md](docs/design-philosophy.md) for the brand manifesto, color heritage (OKLCH-based scales), and architectural principles behind the system.

## Development

```bash
pnpm install            # Install dependencies
pnpm dev                # Start Storybook at localhost:6006
pnpm build              # Build all packages
pnpm build:core         # Build core only
pnpm build:brand        # Build brand only
pnpm typecheck          # TypeScript check (all packages)
pnpm lint               # ESLint (all packages)
pnpm test               # Run tests (all packages)
pnpm format             # Prettier
```

## Tech Stack

- React 19 + TypeScript 6.0 (strict mode)
- Tailwind CSS 4 + CSS custom properties
- Radix UI primitives (vendored)
- class-variance-authority (CVA)
- Vite 8 (Rolldown bundler, library mode)
- Storybook 10 (development + documentation)
- Inter + Ranade variable fonts (WOFF2)

## Credits

- [Radix UI](https://radix-ui.com) -- Accessible primitive components (vendored)
- [Carbon Design System](https://carbondesignsystem.com) -- Motion system inspiration
- [Tailwind CSS](https://tailwindcss.com) -- Utility-first CSS framework
- [class-variance-authority](https://cva.style) -- Variant management
- [Inter](https://rsms.me/inter/) -- Typography (SIL Open Font License)
- [Ranade by Indian Type Foundry](https://www.fontshare.com/fonts/ranade) -- Display typography
- [Storybook](https://storybook.js.org) -- Component documentation
- Sapta Varna -- Cultural color system heritage

## License

MIT -- see [LICENSE](./LICENSE) for details.
