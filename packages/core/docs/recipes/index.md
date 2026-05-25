# Recipes

Copy-paste-ready setup guides for installing and customizing **`@devalok/shilp-sutra`** in any React project.

These files are designed to be read by AI coding agents (Claude Code, Cursor, Copilot, Codex) and humans alike. Every step is concrete: file paths, exact strings, expected outcomes.

When the package is installed, recipes ship at:

```
node_modules/@devalok/shilp-sutra/docs/recipes/
```

## Install recipes

Pick the recipe that matches your framework. Detection criteria are listed at the top of each file.

| Framework | Recipe | When to pick it |
|---|---|---|
| Next.js (App Router) | [install-next-app-router.md](./install-next-app-router.md) | `app/` directory exists; using React Server Components |
| Next.js (Pages Router) | [install-next-pages.md](./install-next-pages.md) | `pages/` directory is the primary router; legacy or pre-13 codebases |
| Vite + React | [install-vite.md](./install-vite.md) | `vite.config.*` exists; SPA or MPA |
| Astro | [install-astro.md](./install-astro.md) | `astro.config.*` exists |
| Remix | [install-remix.md](./install-remix.md) | `remix.config.*` or Remix v2 with Vite |
| TanStack Start | [install-tanstack-start.md](./install-tanstack-start.md) | `app.config.*` with `@tanstack/start` |

If the framework is not listed, start with [install-vite.md](./install-vite.md) and adapt — most React+Tailwind setups follow the same shape.

## Customization recipes

| Recipe | What it covers |
|---|---|
| [customize-brand.md](./customize-brand.md) | Token override cookbook — colors, radius role tokens, `[data-shape]` presets, fonts, spacing scale, dark-mode mapping |
| [server-components.md](./server-components.md) | Per-component RSC-safety matrix; correct import patterns for Server Components |

## Diagnostics

| Recipe | What it covers |
|---|---|
| [troubleshoot.md](./troubleshoot.md) | Decision tree for the eight most common breakages: Tailwind not detecting tokens, framer-motion duplicates, missing `transpilePackages`, wrong CSS import order, dark mode not toggling, RSC import errors, font 404s, hydration mismatches |

## What every recipe assumes

- React `^18 || ^19`
- Node `>= 18.18` (no `engines.node` declared by us, but Tailwind 4 + Vite 5+ require it)
- A bundler that supports CSS imports from `node_modules` (every modern React framework does)

## What every recipe excludes

- Database/auth/state-management setup — out of scope. Shilp Sutra is presentation-only.
- IDE configuration — your call.
- Testing setup — see [packages/core/CONTRIBUTING.md](../../CONTRIBUTING.md) if contributing to the design system itself.
