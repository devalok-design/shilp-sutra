# Shilp Sutra

The Devalok Design System — tokens, components, and patterns for Next.js applications.

[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)

## Packages

| Package | Description |
| --- | --- |
| `@devalok/shilp-sutra` | Core tokens, 52 UI primitives, composed components, and app shell |
| `@devalok/shilp-sutra-brand` | Brand logos and SVG assets (Devalok, Karm) |
| `@devalok/shilp-sutra-karm` | Domain components — board, tasks, chat, dashboard, client, admin |

```bash
# Core (required)
pnpm add @devalok/shilp-sutra

# Brand assets (optional)
pnpm add @devalok/shilp-sutra-brand

# Karm domain components (optional — requires core as peer)
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
import { Sidebar, TopBar } from '@devalok/shilp-sutra/shell'
import { DevalokLogo } from '@devalok/shilp-sutra-brand/devalok'
import { KanbanBoard } from '@devalok/shilp-sutra-karm/board'
import { ChatPanel } from '@devalok/shilp-sutra-karm/chat'
```

## Package Exports

### @devalok/shilp-sutra (core)

| Import path | Contents |
| --- | --- |
| `@devalok/shilp-sutra/tokens` | CSS custom properties (primitives, semantic, typography) |
| `@devalok/shilp-sutra/tailwind` | Tailwind CSS preset with token mappings |
| `@devalok/shilp-sutra/ui` | 52 Radix-based UI primitives |
| `@devalok/shilp-sutra/composed` | 13 higher-level reusable components |
| `@devalok/shilp-sutra/shell` | 6 app shell components (sidebar, top-bar, navbar, notifications) |
| `@devalok/shilp-sutra/fonts/*` | Google Sans and Ranade variable font files |

### @devalok/shilp-sutra-brand

| Import path | Contents |
| --- | --- |
| `@devalok/shilp-sutra-brand` | All brand logos |
| `@devalok/shilp-sutra-brand/devalok` | Devalok logos (full, mark, wordmark) |
| `@devalok/shilp-sutra-brand/karm` | Karm logos (full, mark, wordmark) |
| `@devalok/shilp-sutra-brand/assets/*` | Raw SVG assets |

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
Button, Input, Label, Separator, VisuallyHidden

### Form Controls
Checkbox, Radio, Switch, Select, Textarea, NumberInput, SearchInput, InputOTP, FormField, Slider, Toggle, ToggleGroup

### Feedback & Overlays
AlertDialog, Dialog, Sheet, Toast, Tooltip, Popover, HoverCard, Collapsible, Alert, Banner, Spinner

### Data Display
Card, Badge, Avatar, AvatarStack, Table, DataTable, Progress, Skeleton, StatCard, Code, AspectRatio

### Navigation
Accordion, Tabs, Breadcrumb, DropdownMenu, ContextMenu, Menubar, Pagination, NavigationMenu, Sidebar, Link

## Token Architecture

Three-tier CSS custom property system:

1. **Primitives** (`primitives.css`) — Raw palette values (pink, purple, neutral, green, red, yellow, blue). Full 50-950 scales. Never used directly in components.
2. **Semantic** (`semantic.css`) — Intent-based tokens mapping primitives to meaning (`--color-interactive`, `--color-text-primary`, etc.). Includes complete dark mode via `.dark` class.
3. **Typography** (`typography.css`) — Font-face declarations, type scale utilities (T1-T7, B1-B8, L1-L6, P1-P7), prose styles.

## Component Design

- **Props-based API** — No internal stores or data fetching. Components receive data via props and emit events via callbacks.
- **`'use client'` directives** — All interactive components include the directive. Server-compatible components (like AccentProvider) omit it.
- **Semantic tokens only** — All components use CSS custom properties from the semantic layer. No hardcoded colors.
- **Dark mode** — Toggle via `.dark` class on a parent element. All tokens have dark mode overrides.
- **next/font compatible** — Font families use CSS variables (`--font-sans`, `--font-body`, `--font-mono`) overridable via `next/font`.
- **Tree-shakeable** — Each sub-module is independently importable. `preserveModules: true` in build config.

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
- Google Sans + Ranade variable fonts

## Credits

- [Radix UI](https://radix-ui.com) — Accessible primitive components (vendored)
- [Carbon Design System](https://carbondesignsystem.com) — Motion system inspiration
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [class-variance-authority](https://cva.style) — Variant management
- [Google Sans](https://fonts.google.com) — Typography (SIL Open Font License)
- [Ranade by Indian Type Foundry](https://www.fontshare.com/fonts/ranade) — Display typography
- [Storybook](https://storybook.js.org) — Component documentation
- Sapta Varna — Cultural color system heritage

## License

MIT — see [LICENSE](./LICENSE) for details.
