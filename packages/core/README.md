# @devalok/shilp-sutra

Devalok Design System -- tokens, components, and patterns for React & Next.js.

[![npm](https://img.shields.io/npm/v/@devalok/shilp-sutra)](https://www.npmjs.com/package/@devalok/shilp-sutra)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://devalok-design.github.io/shilp-sutra/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

For full documentation, setup guides, and architecture details, see the [monorepo README](https://github.com/devalok-design/shilp-sutra#readme).

## Install

```bash
pnpm add @devalok/shilp-sutra
```

## Quick Start

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

```tsx
// app/layout.tsx
import '@devalok/shilp-sutra/tokens'
```

```tsx
// Any component
import { Button } from '@devalok/shilp-sutra/ui/button'
```

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
| Icons | `@tabler/icons-react` |
| Date components (`./composed/date-picker`) | `date-fns` |
| OTP Input (`./ui/input-otp`) | `input-otp` |
| Markdown rendering | `react-markdown` |

## Next.js

Add to `next.config.js`:

```js
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-brand"]
```

## Links

- [Storybook](https://devalok-design.github.io/shilp-sutra/) -- interactive component docs
- [Monorepo README](https://github.com/devalok-design/shilp-sutra#readme) -- full docs, architecture, component list
- [Changelog](https://github.com/devalok-design/shilp-sutra/blob/main/CHANGELOG.md)
- [Migration Guide](https://github.com/devalok-design/shilp-sutra/blob/main/docs/MIGRATION.md)

## License

MIT -- Copyright 2026 Devalok Design & Strategy Studios
