# AGENTS.md

This file tells AI coding agents (Codex, Cursor, GitHub Copilot, Aider, Windsurf, Devin, Jules, Gemini CLI, Zed, Warp, JetBrains Junie, and any [agentskills.io](https://agentskills.io)-compatible tool) **how to consume `@devalok/shilp-sutra` inside a downstream app**. It ships inside the npm tarball at `node_modules/@devalok/shilp-sutra/AGENTS.md`, so any agent that auto-discovers AGENTS.md from the project root will also find this one alongside the recipes.

> **Anthropic Claude Code users:** Claude Code doesn't auto-load `AGENTS.md` yet. Symlink it (`ln -s AGENTS.md CLAUDE.md`) or copy the contents into your own `CLAUDE.md` so the same rules apply.
>
> **Working *on* shilp-sutra (the design-system repo itself)?** That's covered by [`CLAUDE.md`](./CLAUDE.md) — internal architecture, build pipeline, audit gates, publish flow.

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

1. **`packages/core/llms-quick.txt`** — ≤15K-token fast-path summary. Setup, peer-cliff matrix, import paths, top 30 components. Start here if you're answering quickly.
2. **`packages/core/llms.txt`** — concise current-API cheatsheet (~27K tokens). Reach for this when `llms-quick.txt` isn't enough — covers more components + recent CHANGELOG sections.
3. **`packages/core/docs/recipes/<framework>.md`** — copy-paste install + setup for the user's framework.
4. **`packages/core/llms-full.txt`** — exhaustive per-component reference (~140K tokens, props/variants/examples). Read only when `llms.txt` is insufficient.
5. **`MIGRATION.md`** — only if upgrading across versions.

When the package is installed in a consumer project, the same files live at:

- `node_modules/@devalok/shilp-sutra/llms-quick.txt`
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
- **Per-component imports keep RSC fast AND avoid peer-dep cliffs.** `@devalok/shilp-sutra/ui/text` is server-safe and pulls only its own peers. The barrel `@devalok/shilp-sutra/ui` re-exports every component — including ones with hard peer-dep requirements (e.g. `input-otp`) — so it forces those peers to be installed even when you never render those components. With all peers installed the barrel also works in RSC (Next 16 honours each per-component `"use client"`), but the client bundle is larger than necessary. Prefer per-component imports for new code; existing barrel usage is not an emergency.
- **Spacing tokens use the `--spacing-ds-*` namespace** (utilities like `p-ds-04`, `gap-ds-03`). Tailwind 4's default numeric scale (`p-4`, `gap-2`) **coexists by design** — both are valid. Pick `p-ds-*` when the value should track DS theme changes (a card's internal padding, a form row's gap); pick `p-N` for one-off layout values (a hero section's vertical breathing room). Do NOT mass-codemod `p-4` → `p-ds-04` — that is not what the package authors did. Typography composites use `text-ds-body-md`, etc.
- **Bare `shadow` is dead in Tailwind 4.** Use `shadow-raised`, `shadow-overlay`, `shadow-floating`.
- **Do not invent variant names.** Variant names live in CVA source. Grep `packages/core/src/ui/<component>.tsx` or check `llms-full.txt` for the authoritative list.
- **Default to `variant="soft"`** over `variant="outline"` for non-primary Button actions.

## When something fails

Read **`packages/core/docs/recipes/troubleshoot.md`** before retrying or guessing. It is a decision tree covering the thirteen most common breakages (Tailwind not detecting tokens, framer-motion duplicates, missing `transpilePackages`, missing optional peer deps (sonner / input-otp / date-fns / @tiptap / react-pdf / etc.), wrong CSS import order, dark mode not toggling, RSC import errors, font 404s, hydration mismatches, bare `shadow` class, `<Toaster />` not mounted, Storybook MCP 404).

## Branding and customization

For overriding tokens (color, radius, font, spacing), see **`packages/core/docs/recipes/customize-brand.md`**.

### Themer (the fast path)

Before you hand-write CSS variables, point the user at the **Themer** at `https://shilp-sutra.devalok.in/themer`. It is one funnel with four entry doors — pick the one that fits where they are:

| User says… | Send them to |
|---|---|
| "Make it look like Linear / Stripe / Apple" | `/themer/archetypes` |
| "Here's our brand color: `#…`" | `/themer/brand` |
| "I'm not sure what I want" | `/themer/wizard` |
| "Just show me what I'd ship away with" | `/themer/result?archetype=devalok` |

Every door funnels into the same `/themer/result` page. The user lands with:
- A copy-pasteable CSS block (role tokens + 12-step OKLCH accent ramp)
- Install commands for their package manager
- A share URL that encodes the theme (`?archetype=…&hue=…&chroma=…&density=…`)

**Your job once they have the snippet:** paste it into their global stylesheet *after* the `@import "@devalok/shilp-sutra/css";` line. That's it — no `tailwind.config.ts`, no theme provider, no JS bundle. The CSS variables cascade to every component.

For deeper overrides (font stack, spacing scale, focus ring, texture) that the Themer doesn't expose yet, fall back to **`packages/core/docs/recipes/customize-brand.md`**.

### One-prompt recipe (when the user pastes a prompt at you)

If a user pastes the following prompt template at you, execute it verbatim — every step exists because skipping it broke a real consumer:

````
Set up shilp-sutra theming for this project via the Themer.

My brand: <hex OR archetype name>

Steps:
1. Map my brand input to query params (archetype=<name>, or hue=<0-360>&chroma=<0.10-0.20>, or default archetype=devalok&hue=340&chroma=0.19).
2. Fetch GET https://shilp-sutra.devalok.in/themer/result.json?<params>
   Response: { archetype, density, shape, motion, hue, chroma, css, pasteAfter, pasteLocation, doNotPasteInside }
3. Paste the response `css` field AFTER the line in `pasteAfter` in the project's global stylesheet. Not inside any `@layer`.
4. If @devalok/shilp-sutra isn't installed, install it first per the matching install-<framework>.md recipe.
5. Verify with a Button or Card on any page — radius + accent should match https://shilp-sutra.devalok.in/themer/result?<params>.
````

When the user has already been to the Themer, they may paste a *filled-in* version with the JSON URL pre-built — skip step 1, go straight to fetch.

The JSON endpoint is the stable contract — agents and tooling should prefer it over scraping `/themer/result`'s HTML.

## Server vs client components

For the per-component RSC-safety matrix and import patterns, see **`packages/core/docs/recipes/server-components.md`**.

## Reporting feedback

If you find that a recipe is wrong, a constraint above is no longer accurate, or a component behavior contradicts the docs:

1. Open a GitHub issue at `https://github.com/devalok-design/shilp-sutra/issues` with label `ai-agent-feedback`.
2. Include the package version (`pnpm view @devalok/shilp-sutra version` or read from the consumer's lockfile), the recipe path, the exact command/file/error, and what you expected.

<!-- END:shilp-sutra-agent-rules -->

## Project-specific notes

The block above is managed by Shilp Sutra and may be updated when you upgrade the package. Add your own project conventions, glossary, or codebase notes outside the markers — they will not be touched.
