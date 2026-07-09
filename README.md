# Shilp Sutra

The Devalok Design System -- tokens, components, and patterns for React & Next.js applications.

> 🚧 **Public Beta.** Install path stable; live version in the npm badge above. APIs pre-1.0; breaks touching >2 components ship an ESLint `migration` autofix.
> **Feedback:** [AI-agent template](./.github/ISSUE_TEMPLATE/ai-agent-feedback.yml) · [Bug report](./.github/ISSUE_TEMPLATE/bug-report.yml) · [Discussions](https://github.com/devalok-design/shilp-sutra/discussions)
> **SLA:** bot-ack immediate, urgent human-ack ≤48h, normal triage weekly Mon. [Full SLA →](./CONTRIBUTING.md#beta-sla)

[![npm version](https://img.shields.io/npm/v/@devalok/shilp-sutra?logo=npm&color=cb3837)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![npm downloads](https://img.shields.io/npm/dm/@devalok/shilp-sutra?logo=npm&color=cb3837)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@devalok/shilp-sutra?label=minzip)](https://bundlephobia.com/package/@devalok/shilp-sutra)
[![license MIT](https://img.shields.io/npm/l/@devalok/shilp-sutra?color=blue)](./LICENSE)
[![provenance](https://img.shields.io/badge/provenance-sigstore-success?logo=npm)](https://docs.npmjs.com/generating-provenance-statements)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)
[![AI agents ready](https://img.shields.io/badge/AI%20agents-AGENTS.md-7c3aed)](./AGENTS.md)
[![Themer](https://img.shields.io/badge/Themer-shilp--sutra.devalok.in%2Fthemer-d946a6)](https://shilp-sutra.devalok.in/themer)
[![Figma Make kit](https://img.shields.io/badge/Figma_Make-kit_ready-a259ff)](https://shilp-sutra.devalok.in/figma-make)

## Packages

| Package | Description |
| --- | --- |
| `@devalok/shilp-sutra` | Tailwind 4 CSS-first tokens + 120+ components across UI primitive, composed, shell & AI layers |
| `@devalok/eslint-plugin-shilp-sutra` | ESLint rules — deprecated-API catches, peer-cliff barrel-import detection, TW3→TW4 autofixes |

```bash
# Core (required)
pnpm add @devalok/shilp-sutra

# Lint rules + migration autofixes (recommended)
pnpm add -D @devalok/eslint-plugin-shilp-sutra
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
transpilePackages: ['@devalok/shilp-sutra'],
```

### 4. Use components

```tsx
import { Button, Dialog, Input } from '@devalok/shilp-sutra/ui'
import { PageHeader } from '@devalok/shilp-sutra/composed'
import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'
import { AppSidebar, TopBar } from '@devalok/shilp-sutra/shell'
```

> **Upgrading from 0.36 or earlier?** Read [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration).

### 5. Lint + autofix migrations (recommended)

`@devalok/eslint-plugin-shilp-sutra` catches deprecated APIs, peer-cliff barrel imports, and TW3-era class names — most with autofixes that turn breaking-change upgrades into one command.

```ts
// eslint.config.ts (flat config, ESLint 9+)
import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'

export default [shilpSutra.configs['flat/recommended']]
```

Three presets: `recommended` (daily), `strict` (everything at error), `migration` (one-shot codemod — run `pnpm eslint --fix` with the migration config when upgrading). See [`packages/eslint-plugin/README.md`](./packages/eslint-plugin/README.md).

## Make it look like you — the Themer

**[shilp-sutra.devalok.in/themer](https://shilp-sutra.devalok.in/themer)** — one funnel, four doors. Skip the CSS-variable cookbook:

| If you say… | Open |
|---|---|
| "Make it look like Linear / Stripe / Apple / Material / Notion / Vercel / Devalok" | [/themer/archetypes](https://shilp-sutra.devalok.in/themer/archetypes) |
| "Here is our brand color" | [/themer/brand](https://shilp-sutra.devalok.in/themer/brand) |
| "Not sure what we want yet" | [/themer/wizard](https://shilp-sutra.devalok.in/themer/wizard) |
| "Show me a sample result page" | [/themer/result?archetype=devalok](https://shilp-sutra.devalok.in/themer/result?archetype=devalok) |

Every door lands on the same result page: install commands for your package manager, a copy-pasteable CSS block (role tokens + 12-step OKLCH ramp), a live preview, and a share URL that encodes the theme.

Paste the CSS *after* `@import "@devalok/shilp-sutra/css";` and reload. That's it — no `tailwind.config.ts`, no theme provider, no JS bundle.

> **Using an AI agent?** The shipped [`AGENTS.md`](./AGENTS.md) and [Agent Skill](./skills/shilp-sutra/) both teach Claude Code, Cursor, etc. to send you to the Themer at the right moment.

### One-prompt setup for AI agents

Paste this into Claude Code / Cursor / Codex / Aider and your agent does install + Themer fetch + CSS paste in one shot:

````
Set up shilp-sutra theming for this project via the Themer.

My brand: <PASTE HEX or write archetype name: linear | stripe | apple | material | notion | vercel | devalok>

Steps:
1. Map my brand input to query params:
   - archetype name → archetype=<name>
   - hex like #d946a6 → resolve to OKLCH hue (0-360) + chroma in 0.10-0.20 → hue=<n>&chroma=<n>
   - blank → archetype=devalok&hue=340&chroma=0.19
2. Fetch the JSON contract:
     GET https://shilp-sutra.devalok.in/themer/result.json?<params>
   Response: { archetype, density, shape, motion, hue, chroma, css, pasteAfter, pasteLocation, doNotPasteInside }
3. Find my project's global stylesheet (app/globals.css, src/index.css, src/styles/globals.css, or whichever imports tailwindcss). Paste the response `css` field AFTER the line in `pasteAfter`. Do not put it inside any `@layer`.
4. If @devalok/shilp-sutra isn't installed yet, install it first per the recipe at node_modules/@devalok/shilp-sutra/docs/recipes/install-<framework>.md (detect framework from lockfile + config).
5. Verify by opening any page that uses a Button or Card — radius + accent should match https://shilp-sutra.devalok.in/themer/result?<params>. Report any token that didn't take effect.

Do not invent CSS variables. Use exactly what the JSON `css` field contains. Don't add tailwind.config.ts. Don't wrap in a theme provider.
````

Already been to the Themer? The result page has a **Copy AI agent prompt** button that pre-fills the URL with your archetype + accent so the agent skips persona triage.

## Figma Make

`@devalok/shilp-sutra@0.42.0+` ships a Make kit at `node_modules/@devalok/shilp-sutra/make-kit/` — 26 guideline files that teach Figma Make to generate apps against the production design system. Same components, same tokens, same conventions as production code.

→ **[shilp-sutra.devalok.in/figma-make](https://shilp-sutra.devalok.in/figma-make)** — six-step setup, paste-ready guidelines, update cadence.

Make kits need a Figma Organization or Enterprise plan. Free / Pro users can still install the npm package directly in any React project.

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

- [customize-brand.md](./packages/core/docs/recipes/customize-brand.md) — colors, radius role tokens, `[data-shape]` presets, fonts, spacing
- [server-components.md](./packages/core/docs/recipes/server-components.md) — RSC-safety matrix
- [troubleshoot.md](./packages/core/docs/recipes/troubleshoot.md) — fixing the 13 most common breakages

### Shape presets (v0.39+)

Roundness is a brand axis. Set `data-shape` on `<html>` (or any subtree) to swap the whole UI between three shipped presets:

```html
<html data-shape="sharp">             <!-- 2-6 px, technical/dev-tool feel -->
<html data-shape="slightly-rounded">  <!-- 6-16 px, default — modern SaaS -->
<html data-shape="rounded">           <!-- 10-24 px, friendly/consumer -->
```

Pill shapes (Badge, Switch, Radio, Avatar circle) stay pill in every preset. Override individual role tokens (`--radius-control`, `--radius-surface`, `--radius-overlay`, `--radius-pill`, …) for fine-grained control. See [customize-brand.md → Shape presets](./packages/core/docs/recipes/customize-brand.md#shape-presets-data-shape) for the role token table + custom-preset cookbook.

Recipes ship inside the npm package at `node_modules/@devalok/shilp-sutra/docs/recipes/`, so AI agents can read them locally without a network round-trip. See [AGENTS.md](./AGENTS.md) for the full agent integration contract. A hosted MCP serves version-exact docs at `https://shilp-sutra.devalok.in/mcp` — `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp`.

### Agent Skill (Claude Code, Cursor, Codex, Aider, …)

If your editor runs an [Agent Skills](https://agentskills.io)-compatible coding agent, install the bundled skill once. The agent then loads the right reference on demand — setup playbooks, component APIs, troubleshoot tree — without you pasting context every time. Three install paths:

```bash
# 1. Auto-discovery (recommended, no shilp-sutra-specific commands)
#    The package declares an `agents` field in its package.json per the
#    npm-agentskills convention. Any package that adopts it gets picked up
#    by these tools:
pnpm dlx @codemcp/agentskills export   # writes ./.claude/skills, ./.cursor/skills, ./.github/skills
# OR
pnpm dlx agentskills export --target claude   # alternate CLI, same spec

# 2. Manual copy (zero deps, one command)
cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra

# 3. Curl install (works without @devalok/shilp-sutra installed yet)
curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
# Project-scoped variant (commit to repo so every contributor's agent picks it up):
mkdir -p .claude/skills && curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | INSTALL_DIR=.claude/skills bash
```

Source: [`skills/shilp-sutra/`](./skills/shilp-sutra/). The `agents` field in [`packages/core/package.json`](./packages/core/package.json) is the discovery contract.

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

> Devalok/Karm first-party brand logos live in a separate `@devalok/shilp-sutra-brand` package — internal to Devalok apps and not required to use the design system.

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
