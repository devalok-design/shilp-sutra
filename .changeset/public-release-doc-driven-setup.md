---
"@devalok/shilp-sutra": minor
"@devalok/shilp-sutra-brand": patch
---

**Doc-driven AI-agent setup for public release**

Ships a complete recipes catalog + governance baseline so any AI coding agent (Claude Code, Cursor, Copilot, Codex, Aider) can install and configure shilp-sutra in any consumer project just by reading the bundled docs.

**Added:**

- **`AGENTS.md`** at the repo root — Next.js convention. Tells agents to read `llms.txt` + `docs/recipes/` before writing code, with managed `<!-- BEGIN/END:shilp-sutra-agent-rules -->` markers so consumers can layer their own notes without conflict.
- **`packages/core/docs/recipes/`** ships in the npm package (added to `files`). Reachable from a consumer's `node_modules/@devalok/shilp-sutra/docs/recipes/` with no network round-trip:
  - `index.md` — recipe catalog with framework picker
  - `install-next-app-router.md` — full step-by-step for Next.js 13+ App Router
  - `install-next-pages.md` — Next.js Pages Router
  - `install-vite.md` — Vite + React (also covers React Router)
  - `install-astro.md` — Astro with React islands
  - `install-remix.md` — Remix v2 + Vite
  - `install-tanstack-start.md` — TanStack Start
  - `customize-brand.md` — token override cookbook (color, radius, font, spacing, dark-mode pairings, forced-colors, per-route theming)
  - `server-components.md` — full RSC-safety matrix per layer + import patterns
  - `troubleshoot.md` — decision tree for the 8 most common breakages
- **`SECURITY.md`** — vulnerability disclosure policy with severity-based timelines and provenance verification instructions. Reports route to `shilp-sutra@devalok.in`.
- **`CODE_OF_CONDUCT.md`** — Contributor Covenant 2.1 adoption.
- **`.github/CODEOWNERS`** — review routing to `@devalok-design/shilp-sutra` for high-blast-radius paths (release.yml, pre-publish-audit.mjs, tokens, AI docs).
- **`.github/ISSUE_TEMPLATE/`** — three GitHub form templates (bug-report, feature-request, ai-agent-feedback) plus a `config.yml` with contact links to SECURITY.md, troubleshoot.md, Storybook, and AGENTS.md.
- **`packages/core` package.json metadata** — `keywords` (24 SEO terms), `author`, `homepage`, `bugs`. Improves npm discovery.
- **`packages/brand` package.json metadata** — same hygiene fields.
- **README.md badges** — npm version, monthly downloads, minzip bundle size, license, sigstore provenance, Storybook, AGENTS.md.
- **CONTRIBUTING.md "Versioning & Breaking Changes" section** — codifies semver discipline (patch / minor / pre-1.0-major handling), the deprecation policy (one-minor-window before removal, runtime warning + JSDoc + CHANGELOG entry), the changeset requirement for any tarball-shipped surface change, and the explicit list of what counts as public API.

**Changed:**

- **`packages/core/llms.txt`** — adds a "QUICK SETUP (AI agents — start here)" block immediately after the intro, pointing agents to the framework-specific recipe in `docs/recipes/`. Existing setup playbook content unchanged below.
- **`README.md`** — adds a "Setup recipes (per framework)" section linking to all six install recipes plus customization and troubleshooting guides. Removes the stale `@devalok/shilp-sutra/tailwind` package-export row (the JS preset was removed in 0.38). Replaces the package description's "Tailwind preset" suffix with "Tailwind 4 CSS-first tokens".

**Why minor (not patch):**

The `files` array now ships `docs/recipes/` to consumers. Existing patch-level changesets only ship code or documentation already in `dist/`; this is the first time a top-level docs tree is part of the npm tarball, which is a meaningful surface change for tooling that scans installed packages.

**Out of scope:**

- The `shilp-sutra-cli` init/doctor/info package — deferred until doc-driven setup proves insufficient (see project plan: doc-driven first, CLI second).
- Marketing/docs site, starter-template repos, per-component bundle-size budgets, public a11y conformance page. Tracked separately for later phases.

**For consumers:**

No code changes required. Existing apps continue to work. To opt into the AI-agent contract, add a root `AGENTS.md` to your project — see `node_modules/@devalok/shilp-sutra/llms.txt` for the suggested content (or copy this repo's `AGENTS.md` and adapt).

**For maintainers:**

The `CODEOWNERS` file routes reviews to the `@devalok-design/shilp-sutra` GitHub team (<https://github.com/orgs/devalok-design/teams/shilp-sutra>). Vulnerability reports go to `shilp-sutra@devalok.in` (set up as an alias to the maintainer inbox).
