# Shilp Sutra

The Devalok Design System -- tokens, components, and patterns for React & Next.js applications.

[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)

## Packages

| Package | Description |
| --- | --- |
| `@devalok/shilp-sutra` | Core tokens, 60+ UI primitives, 14 composed components, 7 shell components, and Tailwind preset |
| `@devalok/shilp-sutra-brand` | Brand logos and SVG/PNG/WebP assets (Devalok, Karm) |
| `@devalok/shilp-sutra-karm` | Domain components -- board, tasks, chat, dashboard, client, admin |

```bash
# Core (required)
pnpm add @devalok/shilp-sutra

# Brand assets (optional)
pnpm add @devalok/shilp-sutra-brand

# Karm domain components (optional -- requires core >=0.3.0 as peer)
pnpm add @devalok/shilp-sutra-karm
```

## Quick Setup

### 1. Tailwind CSS preset

Add the preset to your `tailwind.config.ts`:

```ts
import shilpSutra from '@devalok/shilp-sutra/tailwind'

export default {
  presets: [shilpSutra],
  content: [
    './app/**/*.{ts,tsx}',
    './node_modules/@devalok/shilp-sutra/dist/**/*.js',
    './node_modules/@devalok/shilp-sutra-karm/dist/**/*.js',
  ],
}
```

### 2. Import tokens

In your root layout (`app/layout.tsx`):

```tsx
import '@devalok/shilp-sutra/tokens'
import './globals.css'
```

### 3. Use components

```tsx
import { Button, Dialog, Input } from '@devalok/shilp-sutra/ui'
import { PageHeader, DatePicker } from '@devalok/shilp-sutra/composed'
import { AppSidebar, TopBar } from '@devalok/shilp-sutra/shell'
import { DevalokLogo } from '@devalok/shilp-sutra-brand/devalok'
import { KanbanBoard } from '@devalok/shilp-sutra-karm/board'
import { ChatPanel } from '@devalok/shilp-sutra-karm/chat'
```

## Mental Model

The design system is organized into three tiers:

| Layer | Import | What it contains |
|-------|--------|------------------|
| **ui** | `@devalok/shilp-sutra/ui` | 60+ atomic primitives -- buttons, inputs, dialogs, cards, tables, badges, charts, navigation, transitions |
| **composed** | `@devalok/shilp-sutra/composed` | 14 multi-component patterns -- date picker, rich text editor, command palette, page header, loading skeletons |
| **shell** | `@devalok/shilp-sutra/shell` | 7 app-level layout components -- sidebar, top bar, bottom navbar, notification center, command palette |

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
| `@devalok/shilp-sutra/tokens` | CSS custom properties (primitives, semantic, typography) |
| `@devalok/shilp-sutra/tailwind` | Tailwind CSS preset with token mappings |
| `@devalok/shilp-sutra/ui` | 60+ Radix-based UI primitives |
| `@devalok/shilp-sutra/ui/<name>` | Per-component exports (e.g. `./ui/button`, `./ui/dialog`) |
| `@devalok/shilp-sutra/composed` | 14 higher-level composed components |
| `@devalok/shilp-sutra/composed/<name>` | Per-component exports (e.g. `./composed/date-picker`) |
| `@devalok/shilp-sutra/shell` | 7 app shell components |
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

### @devalok/shilp-sutra-karm

| Import path | Contents |
| --- | --- |
| `@devalok/shilp-sutra-karm` | All Karm domain components |
| `@devalok/shilp-sutra-karm/board` | Kanban board (drag-drop) |
| `@devalok/shilp-sutra-karm/tasks` | Task detail panel, properties, tabs |
| `@devalok/shilp-sutra-karm/chat` | AI chat panel, message list, streaming |
| `@devalok/shilp-sutra-karm/dashboard` | Attendance CTA, daily brief |
| `@devalok/shilp-sutra-karm/client` | Client portal (accent provider, header, project card) |
| `@devalok/shilp-sutra-karm/admin` | Admin dashboard, break management, adjustments |

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
3. **Typography** (`typography.css`) -- Font-face declarations, type scale utilities (T1-T7, B1-B8, L1-L6, P1-P7), prose styles.

## Component Design

- **Props-based API** -- No internal stores or data fetching. Components receive data via props and emit events via callbacks.
- **`'use client'` directives** -- All interactive components include the directive. Server-compatible components omit it.
- **Semantic tokens only** -- All components use CSS custom properties from the semantic layer. No hardcoded colors.
- **Dark mode** -- Toggle via `.dark` class on a parent element. All tokens have dark mode overrides.
- **next/font compatible** -- Font families use CSS variables (`--font-sans`, `--font-body`, `--font-mono`) overridable via `next/font`.
- **Tree-shakeable** -- Each sub-module is independently importable. `preserveModules: true` in build config.

## Development

```bash
pnpm install            # Install dependencies
pnpm dev                # Start Storybook at localhost:6006
pnpm build              # Build all packages
pnpm build:core         # Build core only
pnpm build:brand        # Build brand only
pnpm build:karm         # Build karm only
pnpm typecheck          # TypeScript check (all packages)
pnpm lint               # ESLint (all packages)
pnpm test               # Run tests (all packages)
pnpm format             # Prettier
```

## Tech Stack

- React 18 + TypeScript 5.7 (strict mode)
- Tailwind CSS 3 + CSS custom properties
- Radix UI primitives (vendored)
- class-variance-authority (CVA)
- Vite 5.4 (library mode build)
- Storybook 8 (development + documentation)
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
