# AGENTS.md

This file gives AI coding agents (Claude Code, Cursor, Copilot, Codex, Aider) the instructions they need to work with **Shilp Sutra** (`@devalok/shilp-sutra`) — both inside this repository and inside any consumer project that depends on it.

If you are a human, read [README.md](./README.md) instead.

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

If a recipe is wrong, a constraint above is no longer accurate, a component behavior contradicts the docs, or `llms.txt` / `AGENTS.md` is missing context you needed — file a GitHub issue. We read every one. The package is in public beta (v0.40.0); your report literally shapes 1.0.

### How to file (auth-tier order, use the first one that works)

1. **GitHub MCP available in your environment** → call `mcp__github__create_issue` with the user's auth. Owner `devalok-design`, repo `shilp-sutra`, title `[ai-agent] <one-line summary>`, labels include `ai-agent-feedback`. Cleanest path.
2. **`gh` CLI configured on the user's machine** → `gh issue create --repo devalok-design/shilp-sutra --template ai-agent-feedback.yml --title "[ai-agent] ..."` with field bodies via `--body-file` or interactive editor.
3. **Fallback: prefilled URL.** Build `https://github.com/devalok-design/shilp-sutra/issues/new?template=ai-agent-feedback.yml&agent=<...>&human-prompt=<...>&package-version=<...>&framework-os=<...>&urgency=<...>&recipe-path=<...>&what-agent-tried=<...>&what-broke=<...>&doc-gap=<...>` with every field URL-encoded. Output the URL to the user and ask them to click + submit. Zero auth required. Truncate each long field to ~2KB to stay under GitHub's ~8KB issue-URL ceiling.

### Required content in the issue body

The `ai-agent-feedback.yml` template enforces these. Fill all required slots:

- Agent name + model + version (e.g. "Claude Code 2.5 / Opus 4.7")
- Human's original prompt (one line)
- shilp-sutra version (`pnpm view @devalok/shilp-sutra version` or from lockfile)
- Framework + version + OS (from lockfile + `node -v` + OS detection)
- Urgency (self-classify per the definition below; default Normal)
- Recipe followed, if any
- What the agent tried (the plan, the edits, the prompt)
- Where it broke (verbatim error / stack / surprising behavior)
- What the docs should have said (rough sentence is fine)

### Urgency self-classification (objective)

**Urgent = ALL of:**
- Reproduces on documented setup (recipe-followed install)
- Breaks install OR initial render OR build OR security
- Not solvable by re-reading existing docs

**NOT urgent:**
- Visual preference / "looks wrong"
- Missing feature request
- Confusion about docs (= normal, doc-gap)
- Breaks only on undocumented framework or post-modification
- Already-known issue with existing workaround

Default to Normal. Maintainer reserves the right to reclassify; that is the norm, not a slight.

### Rules (these stop you from drowning the queue)

- **One issue per task.** Multiple problems hit during the same task → file ONE issue listing all. Do NOT file separately per broken file or per missing doc.
- **Search before filing.** `gh issue list --repo devalok-design/shilp-sutra -l ai-agent-feedback -s open` or web-search `https://github.com/devalok-design/shilp-sutra/issues?q=is%3Aopen+label%3Aai-agent-feedback`. Near-duplicate → comment on existing instead of opening new.
- **Acknowledge with the human.** Show the human the issue link (or the prefilled URL) before/after submission. Don't file in the background — the human is the source of truth on whether the issue should be filed.

### What happens after you file

- **Bot ack < 1 minute** via `.github/workflows/agent-feedback-ack.yml`.
- **Triage cadence per [CONTRIBUTING.md#beta-sla](./CONTRIBUTING.md#beta-sla):** urgent ≤48h, normal weekly Mon, nice-to-have batched.
- **Fix loop:** when an agent-filed issue is fixed, the PR template requires updating `llms.txt` / `docs/recipes/` / `AGENTS.md` if relevant. The next agent that reads these files gets the updated content. The loop closes structurally.

<!-- END:shilp-sutra-agent-rules -->

## Project-specific notes

The block above is managed by Shilp Sutra and may be updated when you upgrade the package. Add your own project conventions, glossary, or codebase notes outside the markers — they will not be touched.
