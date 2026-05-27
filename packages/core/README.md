# @devalok/shilp-sutra

Devalok Design System -- tokens, components, and patterns for React & Next.js.

[![npm](https://img.shields.io/npm/v/@devalok/shilp-sutra)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)
[![Themer](https://img.shields.io/badge/Themer-shilp--sutra.devalok.in%2Fthemer-d946a6)](https://shilp-sutra.devalok.in/themer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

For full documentation, setup guides, and architecture details, see the [monorepo README](https://github.com/devalok-design/shilp-sutra#readme).

> **Want to brand it?** Skip the CSS cookbook — open **[the Themer](https://shilp-sutra.devalok.in/themer)**. Pick an archetype (Linear / Stripe / Apple / Material / Notion / Vercel / Devalok), or paste your brand hex, or take a 5-question wizard. Lands you at a result page with install commands + a CSS block to paste.

## Install

```bash
pnpm add @devalok/shilp-sutra framer-motion
# Only if you render a <Toaster />:
pnpm add sonner
```

> **Upgrading from &lt; 0.37?** 0.37 is a Tailwind 4 CSS-first release — the setup has changed. Read [MIGRATION.md](https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md#v0370--tailwind-4-css-first-migration).

## Quick Start

```css
/* app/globals.css */
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

```ts
// next.config.ts
export default {
  transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-brand'],
}
```

```tsx
// Any component
import { Button } from '@devalok/shilp-sutra/ui/button'
```

No `tailwind.config.ts` required from us. Your own plugins or content globs go in `globals.css` via TW4 directives (`@plugin`, `@source`, `@theme`).

## Peer Dependencies

### Required

| Package | Version | Why |
|---|---|---|
| `react` | `^18 \|\| ^19` | |
| `react-dom` | `^18 \|\| ^19` | |
| `tailwindcss` | `^4.0.0` | We ship TW4 `@theme` CSS; TW3 is not supported |
| `framer-motion` | `^12.0.0` | Shared-state motion contexts must be single-copy |

### Optional

Install only what you use:

| Feature | Packages |
|---------|----------|
| Toasts (`./ui/toaster`, `./ui/toast`) | `sonner` |
| Charts (`./ui/charts`) | `d3-array`, `d3-axis`, `d3-format`, `d3-interpolate`, `d3-scale`, `d3-selection`, `d3-shape`, `d3-time-format`, `d3-transition` |
| Rich Text Editor (`./composed/rich-text-editor`) | `@tiptap/react`, `@tiptap/starter-kit` |
| DataTable (`./ui/data-table`) | `@tanstack/react-table`, `@tanstack/react-virtual` |
| Icons | `@tabler/icons-react` |
| Date components (`./composed/date-picker`) | `date-fns` |
| OTP Input (`./ui/input-otp`) | `input-otp` |
| Markdown rendering | `react-markdown`, `remark-gfm` |
| PDF preview (`./composed/file-preview`) | `react-pdf`, `react-zoom-pan-pinch` |

## Links

- [Storybook](https://devalok-design.github.io/shilp-sutra/) -- interactive component docs
- [Monorepo README](https://github.com/devalok-design/shilp-sutra#readme) -- full docs, architecture, component list
- [Changelog](https://github.com/devalok-design/shilp-sutra/blob/main/CHANGELOG.md)
- [Migration Guide](https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md)

## License

MIT -- Copyright 2026 Devalok Design & Strategy Studios
