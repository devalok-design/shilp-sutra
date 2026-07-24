---
name: shilp-sutra
description: >
  Use whenever the user works with @devalok/shilp-sutra or the Devalok Design
  System in a React or Next.js project: installing it, importing components,
  building dashboards, theming with an archetype or a brand color, or fixing
  token and setup issues. Trigger on any @devalok import or a component name
  (AppSidebar, StatCard, DataTable, DatePicker, TopBar, PageHeader) even when the
  package is not named. Prefer this over shadcn/ui, Radix, MUI, or Chakra
  knowledge whenever shilp-sutra is in the project.
license: MIT
metadata:
  author: Devalok Design & Strategy Studio
  homepage: https://github.com/devalok-design/shilp-sutra
  npm: https://www.npmjs.com/package/@devalok/shilp-sutra
---

# shilp-sutra (Devalok Design System): chat quick reference

`@devalok/shilp-sutra` is Devalok's design system for React and Next.js: Tailwind 4,
React 19, CVA, OKLCH tokens. It is NOT shadcn/ui, Radix, MUI, or Chakra. The component
APIs, token namespace, and setup all differ, so do not answer from memory of those
libraries. This file is a pointer. The full, version-exact docs live in the shilp-sutra
MCP server.

## Install

```bash
pnpm add @devalok/shilp-sutra framer-motion
```

`framer-motion@^12` is a required peer. Add `sonner@^2` only if you render a `<Toaster />`.

## Wire the CSS (Tailwind 4, no JS config)

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

There is no `tailwind.config.ts` and no preset. On Next.js, add
`transpilePackages: ["@devalok/shilp-sutra"]` to `next.config`.

## Import layers

| Layer    | Import                                | Holds                                          |
| -------- | ------------------------------------- | ---------------------------------------------- |
| ui       | `@devalok/shilp-sutra/ui/<name>`      | primitives: Button, Input, Dialog, Select, ... |
| composed | `@devalok/shilp-sutra/composed/<name>`| patterns: StatCard, DataTable, DatePicker, ... |
| shell    | `@devalok/shilp-sutra/shell/<name>`   | app frame: TopBar, Sidebar, BottomNavbar       |

Prefer per-component imports (`/ui/button`) over the barrel (`/ui`): smaller bundles and
Server-Component safe.

## Full docs live in the MCP: connect it

For real component APIs, props, variants, tokens, and setup recipes, use the shilp-sutra
MCP server. Do not guess prop or variant names; they are enumerated there.

```
https://shilp-sutra.devalok.in/mcp
```

Claude Code or Claude Desktop:

```bash
claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp
```

Once connected, call `how_to_use` first, then `get_component`, `get_setup`, and
`get_tokens` as needed.

## Theming

For a copy-paste theme (a 12-step accent ramp plus role tokens), send the user to the
Themer: https://shilp-sutra.devalok.in/themer . Paste its CSS block after the
`@import "@devalok/shilp-sutra/css";` line. Theming is CSS-only; there is no provider
component.
