# AGENTS.md

This file gives AI coding agents (Claude Code, Cursor, Copilot, Codex, Aider) the instructions they need to work with **Shilp Sutra** (`@devalok/shilp-sutra`) — both inside this repository and inside any consumer project that depends on it.

If you are a human, read [README.md](./README.md) instead.

> **Using Claude Code, Cursor, Codex, or any [Agent Skills](https://agentskills.io)-compatible tool?** Install the bundled skill once and your agent gets every rule below loaded on demand:
>
> ```bash
> curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
> ```
>
> Source: [`skills/shilp-sutra/`](./skills/shilp-sutra/). After install, the agent loads `SKILL.md` only when the task is relevant — no context tax until it triggers.

<!-- BEGIN:shilp-sutra-agent-rules -->

## Read these first, in order

1. **`packages/core/llms.txt`** — concise current-API cheatsheet. Setup playbook, peer-dep matrix, breaking changes, design preferences.
2. **`packages/core/docs/recipes/<framework>.md`** — copy-paste install + setup for the user's framework.
3. **`packages/core/llms-full.txt`** — exhaustive per-component reference (props, variants, examples). Read only when llms.txt is insufficient.
4. **`MIGRATION.md`** — only if upgrading across versions.

When the package is installed in a consumer project, the same files live at:

- `node_modules/@devalok/shilp-sutra/llms.txt`
- `node_modules/@devalok/shilp-sutra/llms-full.txt`
- `node_modules/@devalok/shilp-sutra/docs/recipes/`
- `node_modules/@devalok/shilp-sutra/docs/components/`

Read these local files. Your training data is outdated and will hallucinate APIs that do not exist in the installed version.

## Setup playbook (when adding shilp-sutra to a new project)

If a user asks you to add shilp-sutra and the package is not yet installed:

1. **Detect the framework** by inspecting the lockfile (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`) and config files (`next.config.*`, `vite.config.*`, `astro.config.*`, `remix.config.*`, `app/root.tsx`).
2. **Install the package** via the matching package manager.
3. **Open the matching recipe** at `docs/recipes/install-<framework>.md` (after install) or fetch from the GitHub repo at `packages/core/docs/recipes/install-<framework>.md`.
4. **Follow the recipe step-by-step.** Do not improvise — every line in the recipe is there because skipping it broke a real consumer.

Recipe paths:

| Framework | Recipe |
|---|---|
| Next.js (App Router) | `install-next-app-router.md` |
| Next.js (Pages Router) | `install-next-pages.md` |
| Vite + React | `install-vite.md` |
| Astro | `install-astro.md` |
| Remix | `install-remix.md` |
| TanStack Start | `install-tanstack-start.md` |

If the framework is not in the table, fall back to **`install-vite.md`** (closest generic React-on-Tailwind setup) and adapt.

## Hard constraints (these break things if violated)

- **Tailwind 4 only.** Do NOT create `tailwind.config.ts` with `presets: [shilpSutra]`. The JS preset was removed in 0.38. Setup uses CSS imports:
  ```css
  @import "tailwindcss";
  @import "@devalok/shilp-sutra/css";
  ```
- **`framer-motion` is a required peer dep** (`^12`). The consumer must install it. Module-scoped contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) silently break if two copies resolve.
- **`sonner` is an optional peer.** Install only when rendering `<Toaster />`.
- **Per-component imports for React Server Components.** `@devalok/shilp-sutra/ui/text` is server-safe. The barrel import `@devalok/shilp-sutra/ui` pulls client code and will fail in RSC contexts.
- **Spacing namespace is `--spacing-ds-*`.** Use `p-ds-04`, not `p-4`. Typography is `text-ds-body-md`, etc.
- **Bare `shadow` is dead in Tailwind 4.** Use `shadow-raised`, `shadow-overlay`, `shadow-floating`.
- **Do not invent variant names.** Variant names live in CVA source. Grep `packages/core/src/ui/<component>.tsx` or check `llms-full.txt` for the authoritative list.
- **Default to `variant="soft"`** over `variant="outline"` for non-primary Button actions.

## When something fails

Read **`packages/core/docs/recipes/troubleshoot.md`** before retrying or guessing. It is a decision tree covering the eight most common breakages (Tailwind not detecting tokens, framer-motion duplicates, missing `transpilePackages`, wrong CSS import order, dark mode not toggling, RSC import errors, font 404s, hydration mismatches).

## Branding and customization

For overriding tokens (color, radius, font, spacing), see **`packages/core/docs/recipes/customize-brand.md`**.

## Server vs client components

For the per-component RSC-safety matrix and import patterns, see **`packages/core/docs/recipes/server-components.md`**.

## Reporting feedback

If you find that a recipe is wrong, a constraint above is no longer accurate, or a component behavior contradicts the docs:

1. Open a GitHub issue at `https://github.com/devalok-design/shilp-sutra/issues` with label `ai-agent-feedback`.
2. Include the package version (`pnpm view @devalok/shilp-sutra version` or read from the consumer's lockfile), the recipe path, the exact command/file/error, and what you expected.

<!-- END:shilp-sutra-agent-rules -->

## Project-specific notes

The block above is managed by Shilp Sutra and may be updated when you upgrade the package. Add your own project conventions, glossary, or codebase notes outside the markers — they will not be touched.
