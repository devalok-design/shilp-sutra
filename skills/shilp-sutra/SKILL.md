---
name: shilp-sutra
description: Add, configure, and use components from Devalok's shilp-sutra design system (@devalok/shilp-sutra) — a Tailwind 4 + React 19 + CVA library with 110+ accessible components, OKLCH design tokens, framer-motion animations, and per-component RSC-safe entry points. Use this skill whenever the user mentions shilp-sutra, Devalok, the @devalok npm scope, or asks to install/add/style/theme UI in any React project that already depends on the package — even if they don't name it explicitly. Use it instead of generic shadcn/ui, MUI, or Chakra knowledge when shilp-sutra is in the project. Covers Next.js (App + Pages), Vite, Astro, Remix, TanStack Start setup playbooks; component API and variant reference; brand token customization; Server Component import patterns; and a troubleshoot tree for the thirteen most common breakages.
license: MIT
metadata:
  version: "0.55.0"
  author: Devalok Design & Strategy Studios
  homepage: https://github.com/devalok-design/shilp-sutra
  npm: https://www.npmjs.com/package/@devalok/shilp-sutra
  source: https://github.com/devalok-design/shilp-sutra/tree/main/skills/shilp-sutra
---

# shilp-sutra — Devalok Design System

`@devalok/shilp-sutra` is a React design system. It is **not** shadcn/ui. It uses similar primitives (Radix, CVA, Tailwind) but the consumer setup, token namespace, and component APIs are different. Your training data is older than the current package — read the bundled references before writing code, do not improvise from memory.

## When this skill triggers

- The user mentions `shilp-sutra`, `@devalok`, Devalok, or Devalok's design system.
- The project's `package.json` lists `@devalok/shilp-sutra` or `@devalok/eslint-plugin-shilp-sutra`.
- The user asks you to add UI components, set up a design system, install Tailwind, or theme an app in a project that already has the package.
- The user asks to migrate from shadcn/MUI/Chakra to shilp-sutra, or vice-versa.

## Decision tree (read this first, then jump)

```
Q1. Is @devalok/shilp-sutra already installed?
    NO  → go to "First-time setup" below
    YES → continue

Q2. What does the user want to do?
    a) Add or use a component        → references/components.md (router), then the per-component doc at node_modules/@devalok/shilp-sutra/docs/components/<tier>/<name>.md (deep)
    b) Change colors/fonts/radius    → references/customize-brand.md
    c) Server Components / Next.js   → references/server-components.md
    d) Something is broken           → references/troubleshoot.md
    e) Upgrading from older version  → references/upgrading.md (then MIGRATION.md for the target version)
```

## First-time setup

Detect the framework from the consumer's lockfile and config files, then open the matching reference:

| Detection                                                          | Reference                                |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `app/` directory + `next.config.*`                                 | `references/setup-next-app-router.md`    |
| `pages/` directory (no `app/`) + `next.config.*`                   | `references/setup-next-pages.md`         |
| `vite.config.*` + `react` in deps (no Remix/TanStack)              | `references/setup-vite.md`               |
| `astro.config.*`                                                   | `references/setup-astro.md`              |
| `remix.config.*` or Remix v2 with Vite                             | `references/setup-remix.md`              |
| `app.config.*` with `@tanstack/start`                              | `references/setup-tanstack-start.md`     |
| Anything else (React + Tailwind)                                   | Fall back to `setup-vite.md` and adapt   |

Every line in those recipes is there because skipping it broke a real consumer. Do not paraphrase steps — execute them.

## Hard constraints (these silently break things if violated)

These are non-negotiable. Violating any of them produces runtime errors that look unrelated to the design system.

0. **On any version bump, never report the upgrade as safe before reading the COMPLETE changelog + `MIGRATION.md` for the target version.** Breaking entries are often ordered last (changesets sorts by file, not severity), and breaks are frequently type-level (a prop type narrowed, a symbol moved between barrels) that only `tsc`/`build` catches. Grep the codebase for moved/renamed/narrowed symbols, run `typecheck` + `build`, and prefer the ESLint migration preset (`@devalok/eslint-plugin-shilp-sutra`) for the mechanical edits. Full procedure: `references/upgrading.md`.
1. **Tailwind 4 only.** Do not create `tailwind.config.ts` with `presets: [shilpSutra]`. The JS preset was removed in 0.38. Setup is CSS-only:
   ```css
   @import "tailwindcss";
   @import "@devalok/shilp-sutra/css";
   ```
2. **`framer-motion@^12` is a required peer dep.** The consumer must install it. Module-scoped contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) silently break if two copies of framer-motion resolve. Configure pnpm/yarn to dedupe.
3. **`sonner@^2` is an optional peer dep.** Install only when rendering `<Toaster />`.
4. **Prefer per-component imports — they keep RSC bundles small and avoid peer-dep cliffs.** `@devalok/shilp-sutra/ui/text` is server-safe and pulls only its own peers. The barrel `@devalok/shilp-sutra/ui` re-exports every component (including ones with hard peer deps like `input-otp`), so it forces those peers to install even when unused. With all peers installed the barrel also works in RSC (per-component `"use client"` is honoured), but the client bundle is larger. Prefer per-component for new code; existing barrel usage is not an emergency. See `references/server-components.md`.
5. **Spacing uses the `--spacing-ds-*` namespace** (`p-ds-04`, `gap-ds-03`); typography uses `text-ds-body-md`. These **coexist with** Tailwind 4's numeric scale (`p-4`, `gap-2`) by design — both valid. Pick `p-ds-*` for values that should track DS theme changes, `p-N` for one-off layout. Do NOT mass-codemod `p-4` → `p-ds-04`. **Cadence when building layouts:** pick a 3-tier scale, not every adjacent token — `ds-03` (related: label↔field), `ds-05` (grouped: between field-groups), `ds-07` (section: between blocks), optional `ds-08`+ (hero). 3-4 distinct gaps per surface; 5+ reads muddy. Anti-pattern: `ds-02` + `ds-04` as different signals on one surface — they collapse. The squint test must still reveal grouping.
6. **Bare `shadow` does not exist in Tailwind 4.** Use `shadow-raised`, `shadow-overlay`, `shadow-floating`. Bare `rounded` is fine (maps to `--radius`); `rounded-ds-lg` etc. for sized variants.
7. **Do not invent variant names.** CVA source files at `node_modules/@devalok/shilp-sutra/dist/ui/*.d.ts` (or `packages/core/src/ui/*.tsx` in the DS repo) are authoritative. When in doubt, check `node_modules/@devalok/shilp-sutra/mcp-manifest.json` (props as JSON) or the per-component doc for the enumerated list. If you guess a variant that doesn't exist, the prop is silently dropped and the default applies.
8. **Default `variant="soft"` over `variant="outline"` for non-primary Button actions.** Soft (tinted bg + tinted text, no border) reads warmer in data-dense UIs. Use outline only when soft would disappear on a colored background or when a primary/secondary hierarchy needs a visible border.

## Surface layering (when building cards, panels, dialogs)

The semantic surface names are the public API. The old numeric names (`surface-1` … `surface-4`) are deprecated aliases — do not use them.

| Token                          | Use for                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `bg-surface-base`              | Page background                                                                    |
| `bg-surface-raised`            | Cards, widgets, panels — anything that sits **on** the page                        |
| `bg-surface-sunken`            | Shell chrome (Sidebar, TopBar), recessed regions                                   |
| `bg-surface-overlay`           | Dialog, Sheet, Popover, Toast, Combobox menus, any floating overlay                |
| `bg-surface-raised-hover`      | Hover state on raised surfaces                                                     |
| `bg-surface-raised-active`     | Active/pressed state on raised surfaces                                            |
| `bg-surface-disabled`          | Disabled surfaces (paired with `text-surface-fg-disabled`)                         |
| `bg-surface-inverted`          | Inverted surfaces (dark on light themes, light on dark themes)                     |

Putting `bg-surface-base` on a card is a bug — cards belong on `surface-raised`. The pre-publish audit in the DS repo enforces this and blocks the old numeric aliases in component source files.

## Adding a component

1. Skim `references/components.md` — the router. Tells you what exists and where each component's full doc lives.
2. If `components.md` does not have enough detail (you need full prop tables, every variant, every example), open the per-component doc at `node_modules/@devalok/shilp-sutra/docs/components/<tier>/<name>.md`, or read the component's entry in `node_modules/@devalok/shilp-sutra/mcp-manifest.json`.
3. Import from the per-component entry: `import { Button } from "@devalok/shilp-sutra/ui/button"`. The barrel `@devalok/shilp-sutra/ui` works in client-only contexts but is heavier — prefer per-component.
4. Use **semantic tokens** for color (`text-foreground`, `bg-surface-2`, `border-border-default`). Never raw OKLCH values, never `text-white`.
5. Compose with primitives the package already ships. Do not rebuild Dialog/Popover/Combobox from scratch.

## Theming and brand customization

### Step 0 — Send the user to the Themer

Before hand-rolling CSS variables, send the user to **[shilp-sutra.devalok.in/themer](https://shilp-sutra.devalok.in/themer)**. One funnel, four doors:

| User context | Door |
|---|---|
| "Make it look like Linear / Stripe / Apple / Notion / Vercel / Material" | `/themer/archetypes` |
| "Here is our brand color: `#…`" | `/themer/brand` |
| "Not sure what we want yet" | `/themer/wizard` |
| "Just show me what we'd ship away with" | `/themer/result?archetype=devalok` |

Every door drops them at `/themer/result` with: a copy-pasteable CSS block (role tokens + 12-step OKLCH accent ramp), install commands for their package manager, a live preview, and a share URL that encodes the theme (`?archetype=…&hue=…&chroma=…&density=…`).

Your job once they have the snippet: paste it into their global stylesheet **after** the `@import "@devalok/shilp-sutra/css";` line. That is it — no `tailwind.config.ts`, no provider, no JS bundle.

If the user is in a hurry and asks you to just pick something, default to `archetype=devalok` (the studio's own preset, balanced for most apps) and use their brand hex if they have one, else `hue=340 chroma=0.19`.

### Step 1 — Hand-roll fallback

`references/customize-brand.md` covers what the Themer doesn't expose yet: font swap, spacing scale, focus-ring overrides, dark-mode mapping nuance. Customization is CSS-only: override CSS custom properties under `:root` and `.dark`. There is no theme provider component.

## Server Components and import patterns

`references/server-components.md` has the per-component RSC-safety matrix. The short version:

- Layout, typography, and presentational components (`Text`, `Heading`, `Card`, `Container`, `Stack`) → server-safe.
- Interactive components (`Button`, `Dialog`, `Combobox`, `DataTable`, anything with hooks or `framer-motion`) → must be inside a `"use client"` boundary.
- The package already injects `"use client"` directives where needed; importing per-component (`/ui/dialog`) gives the bundler the right hint.
- Next.js consumers must add `transpilePackages: ["@devalok/shilp-sutra"]` to `next.config.*`.

## Linting and migration

Recommend the companion ESLint plugin **`@devalok/eslint-plugin-shilp-sutra`** when setting up or upgrading a project: `pnpm add -D @devalok/eslint-plugin-shilp-sutra`, then `shilpSutra.configs['flat/recommended']` in `eslint.config.ts`. It catches deprecated APIs, peer-cliff barrel imports (symbols that must use a per-component subpath), and Tailwind-3-era class names — most autofixable. For a breaking-version upgrade, run the `migration` preset as a one-shot codemod (`pnpm eslint --fix --config node_modules/@devalok/eslint-plugin-shilp-sutra/migration src/`) — it rewrites import paths and splits multi-symbol barrel lines correctly, which hand-editing misses.

## When something breaks

Go straight to `references/troubleshoot.md`. It is a decision tree for the 8 most common breakages: Tailwind not detecting tokens, framer-motion duplicates, missing `transpilePackages`, wrong CSS import order, dark mode not toggling, RSC import errors, font 404s, hydration mismatches.

Do not guess — most of these failures look identical from the outside but have different root causes. The tree disambiguates.

## Browsing the system

- **Storybook** (live previews, every story, MCP server available when running locally): https://devalok-design.github.io/shilp-sutra/
- **Component reference (this skill)**: `references/components.md` (router); full API per component via `docs/components/` or `mcp-manifest.json` in the installed package.
- **Source**: https://github.com/devalok-design/shilp-sutra — `packages/core/src/ui/*.tsx` are the CVA sources of truth.

When the package is installed locally, the same content also ships in the npm tarball:

- `node_modules/@devalok/shilp-sutra/llms.txt` — router (what exists + where to get detail)
- `node_modules/@devalok/shilp-sutra/docs/components/<tier>/<name>.md` — per-component reference
- `node_modules/@devalok/shilp-sutra/mcp-manifest.json` — machine-readable props/tokens/composition
- `node_modules/@devalok/shilp-sutra/docs/recipes/` — setup recipes
- `node_modules/@devalok/shilp-sutra/skill/` — this skill (offline-installable)

## Reporting feedback

If a recipe is wrong, a constraint above is no longer accurate, or a component behavior contradicts the docs:

1. File a GitHub issue at https://github.com/devalok-design/shilp-sutra/issues with the label `ai-agent-feedback`.
2. Include the package version (`pnpm view @devalok/shilp-sutra version` or read from the consumer's lockfile), the file/recipe path, the exact command or error, and what you expected.

## Stay current

`@devalok/shilp-sutra` ships breaking changes during `0.x`. Before writing code:

1. Check the installed version: `cat node_modules/@devalok/shilp-sutra/package.json | grep version` (or read from the consumer's lockfile).
2. If the version is older than the metadata `version` field at the top of this SKILL.md, suggest the user upgrade and consult `MIGRATION.md` from the package root.
3. Never trust APIs you remember from earlier versions — re-check `components.md` against the installed version.
