# Public Release Roadmap

**Date:** 2026-05-08
**Author:** Mudit Lal (with Claude Opus 4.7)
**Status:** Phase 0 + Phase 1 (recipes track) shipped in commit `ebf6f545` on `chore/v0.38-deprecation-sweep`. Remaining phases scheduled below. **Living document — update statuses inline as work lands.**

---

## 1. Goal

Prepare `@devalok/shilp-sutra` for wider public release. The bar:

> **Any AI coding agent can install and configure shilp-sutra in any consumer project just by being told the package name.** Any human can understand what it is, why it's different, and what it costs to adopt within 90 seconds of landing on the docs.

Multi-month effort. We are NOT freezing API for 1.0 yet — rapid iteration continues until the design system is "very strong for release" (criteria in § 7).

## 2. Strategy

### 2.1 Hypothesis

The friction is not `pnpm add` — that already works. The friction is post-install setup (Tailwind 4 CSS import order, framer-motion peer dedupe, `transpilePackages`, `<Toaster />` wiring, framework-specific quirks). AI agents have to read `llms.txt` and infer the rest. Brittle.

### 2.2 Strategic decisions made

| Decision | Date | Rationale |
|---|---|---|
| **Doc-driven setup before CLI** | 2026-05-08 | Lower cost, ~80% coverage, agents handle file edits well in 2026; will measure adoption + agent-success rate over 4-6 weeks before committing to CLI ($16-30k contractor cost / 4-5 weeks solo equivalent) |
| **npm-only distribution (NOT shadcn-style registry) for now** | 2026-05-08 | We already have a published-package model with a real consumer (Karm). Switching to registry-only breaks Karm. Adding registry alongside is 4-6 weeks of work. Revisit in Phase 2.5 once npm path is bulletproof |
| **Minor bump for recipe additions** | 2026-05-08 | Recipes ship in tarball — real public-surface change. "Patch" would understate it |
| **Rapid iteration until "very strong for release"** | 2026-05-08 | NOT freezing 1.0 API yet. Goal: 0.40+ stable across one full minor cycle without breaking |
| **Mail alias `shilp-sutra@devalok.in`** | 2026-05-08 | Project-aliased > personal email for portability |
| **GitHub team `@devalok-design/shilp-sutra` for CODEOWNERS** | 2026-05-08 | Triage access confirmed |
| **No codemods shipped for v0.38 deprecation sweep** | 2026-05-08 | Small enough scope (8 removals); manual migration is fine. ADD codemods for any future break that touches >2 components |

### 2.3 What the best players do (research, 2026-05)

**shadcn/ui (March 2026, CLI v4):**
- Distribution: registry-based (`registry:base` ships entire DS as one payload — components + deps + CSS vars + fonts + config). Namespaced registries support private + public registries side-by-side (`@company/internal-auth`).
- AI integration: `shadcn skills` package gives agents context on Radix/Base UI primitives, APIs, patterns, registry workflows + when/how to invoke the CLI.
- Distribution presets: `--preset [code]` lets users share design-token bundles (colors, themes, icons, fonts, radius) via shareable codes built at `shadcn/create`.
- Inspection: `--dry-run`, `--diff`, `--view` flags before any file write. `shadcn info` (state) and `shadcn docs <component>` (per-component reference) commands.
- Visual builder: shipped Feb 2026 (separate product).

**Mantine v7 (Sep 2023+):**
- Major releases every 6-12 months.
- v7 removed CSS-in-JS — massive break for every consumer.
- Shipped `mantine6to7` codemod. **Codemods for breaking changes are now table stakes for serious DSes.**

**Tailwind UI / Atlassian / IBM Carbon:**
- ESLint plugins to enforce DS conventions in consumer code (Atlassian has `eslint-plugin-design-system`).
- VS Code extensions for token completion (we get most of this free via Tailwind IntelliSense).

**Show HN launch playbook:**
- "Show HN:" prefix (less competitive tab, longer dwell).
- Title direct + specific. No superlatives.
- Repo IS the landing page — README must stand alone.
- Tuesday/Wednesday morning (US Pacific) for best traffic.
- Posts with images > posts without.
- Engage in comments — community is harsh but valuable.

### 2.4 What we should copy vs skip

| Pattern | Verdict | Reason |
|---|---|---|
| shadcn registry distribution | **Skip for now, revisit Phase 2.5** | npm path is committed; switching breaks Karm |
| shadcn `--preset` token bundles | **Adopt, Phase 2.5** | Lets us ship "Devalok skin" + "Karm skin" + community presets cleanly |
| shadcn skills (agent context bundle) | **Already doing equivalent via AGENTS.md + llms.txt + recipes** | Different mechanism, same outcome |
| Mantine codemods for breaks | **Adopt as policy, Phase 1.5** | New rule: any break touching >2 components must ship a codemod |
| Atlassian ESLint plugin | **Adopt, Phase 1.5** | High-value, low-cost (~3-5 days) |
| VS Code extension | **Skip** | Tailwind IntelliSense covers ~80% of value for free |
| HN "Show HN:" tactics | **Adopt, Phase 4** | Standard playbook |
| Mantine 6-12 month major cadence | **Adopt loosely** | Pre-1.0 we move faster; post-1.0 align with this |
| MUI X Pro (paid components) | **Skip** | Not building a business around this; OSS-only |

---

## 3. Phases & status

Tags: **P0** = ship-blocker, **P1** = must before public push, **P2** = polish, **P3** = nice-to-have. Effort: **S** = hours, **M** = days, **L** = week+.

### Phase 0 — Foundation hygiene

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 0.1 | `keywords`, `author`, `homepage`, `bugs` in `packages/core/package.json` | P0 | S | ✅ |
| 0.2 | Same fields in `packages/brand/package.json` | P0 | S | ✅ |
| 0.3 | `AGENTS.md` at repo root with managed BEGIN/END markers | P0 | S | ✅ |
| 0.4 | `SECURITY.md` (vuln reporting + provenance verification) | P0 | S | ✅ |
| 0.5 | `CODEOWNERS` routing reviews to `@devalok-design/shilp-sutra` | P1 | S | ✅ |
| 0.6 | README badges (npm, downloads, bundle, license, provenance, Storybook, AGENTS) | P1 | S | ✅ |
| 0.7 | `funding` field — GitHub Sponsors or Open Collective | P2 | S | ⏳ deferred (no sponsor link set up) |
| 0.8 | Versioning + breaking-change + deprecation policy in `CONTRIBUTING.md` | P0 | S | ✅ |
| 0.9 | `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1) | P1 | S | ✅ |
| 0.10 | `.github/ISSUE_TEMPLATE/` — bug, feature, ai-agent-feedback + config.yml | P1 | S | ✅ |
| 0.11 | `CLAUDE.md` cross-reference to `AGENTS.md` | P2 | S | ✅ |
| 0.12 | Pull request template (`.github/pull_request_template.md`) | P2 | S | ❌ |

### Phase 1 — AI-agent install loop

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 1.1 | `shilp-sutra-cli` package with `bin: "shilp-sutra"` | P0 | L | ⏸️ DEFERRED — see § 5 |
| 1.2 | `shilp-sutra init` (framework detection + CSS patch + transpilePackages + peers + Providers scaffold) | P0 | L | ⏸️ deferred |
| 1.3 | `--dry-run`, `--diff`, `--yes`, `--framework`, `--preset` flags | P0 | M | ⏸️ deferred |
| 1.4 | `shilp-sutra info` — print framework + version + peer dep status | P1 | M | ⏸️ deferred |
| 1.5 | `shilp-sutra doctor` — diagnose common breakage | P0 | M | ⏸️ deferred |
| 1.6 | `shilp-sutra docs <component>` — emit llms-style component spec | P1 | M | ⏸️ deferred |
| 1.7 | `shilp-sutra add <component>` — print snippet + import line | P2 | S | ⏸️ deferred |
| 1.8 | Bundle docs in npm package (`dist/docs/` mirror) | P1 | M | ⚠️ partial — `docs/components/` + `docs/recipes/` ship, no dist mirror yet |
| 1.9 | `AGENTS.md` points to `node_modules/@devalok/shilp-sutra/docs/recipes/` | P0 | S | ✅ |
| 1.10 | Front-loaded setup playbook in `llms.txt` | P0 | S | ✅ |
| 1.11 | Storybook MCP server documented in `llms.txt` (currently CLAUDE.md only) | P1 | S | ❌ |
| 1.12 | Recipes per framework — `docs/recipes/install-{next-app-router,next-pages,vite,astro,remix,tanstack-start}.md` | P0 | M | ✅ |
| 1.13 | `troubleshoot.md` decision tree | P0 | M | ✅ |
| 1.14 | `customize-brand.md` token cookbook | P0 | M | ✅ |
| 1.15 | `server-components.md` RSC matrix | P1 | M | ✅ |

### Phase 1.5 — Developer tooling ecosystem (NEW track)

Tools that wrap shilp-sutra and make consumer DX better. Each is a separate, optional package.

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 1.5.1 | `@devalok/eslint-plugin-shilp-sutra` — **DONE 2026-05-27 (`@0.2.0`)**: 12 rules incl. `no-bare-shadow`, deprecated-API catches, TW3→TW4 class autofixes, `prefer-per-component-import`. (Dropped the `no-p-N` rule — `p-N` and `p-ds-N` coexist by design; see CONTRIBUTING cadence guidance instead.) | P1 | M | ✅ |
| 1.5.2 | Codemod policy in `CONTRIBUTING.md`. **DONE 2026-05-27** — shipped, but the vehicle is the `@devalok/eslint-plugin-shilp-sutra` `migration` preset, NOT a standalone jscodeshift repo (superseded; see 1.5.3). | P0 | S | ✅ |
| 1.5.3 | ~~`@devalok/shilp-sutra-codemods` jscodeshift package~~ **SUPERSEDED 2026-05-27** — replaced by `@devalok/eslint-plugin-shilp-sutra@0.2.0`. Autofix ESLint rules are the migration mechanism (consumers already run ESLint); no separate codemod repo. The standalone repo was never built. | P1 | — | ✅ |
| 1.5.4 | Storybook MCP server productization — currently dev-only at `localhost:6006/mcp`. Decide: leave as dev-only OR publish standalone | P3 | M | ❌ — strategic Q below |
| 1.5.5 | VS Code snippets package (`shilp-sutra-snippets`) — `bn` → `<Button variant="…">…</Button>` etc. Skip full extension; snippets give 80% value | P2 | S | ❌ |

### Phase 2 — Starter templates + docs site

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 2.1 | `create-shilp-sutra-app` (or `shilp-sutra init --new`) | P1 | L | ❌ |
| 2.2 | Starter repos per framework — `shilp-sutra-starter-{next,vite,remix,astro,tanstack-start}`. Each: working homepage + auth shell + dashboard demo | P1 | L | ❌ |
| 2.3 | Marketing/docs site — separate from Storybook. Astro Starlight or Nextra. Hosts: live demos, theming playground, AI-agent integration page, migration guides, recipes | P1 | L | ❌ |
| 2.4 | "Used by" section in README — only after 3+ public adopters | P2 | S | ❌ |
| 2.5 | Stackblitz/CodeSandbox "open in" buttons per Storybook story | P2 | M | ❌ |
| 2.6 | Examples gallery — pre-built page templates (dashboard, auth, settings, marketing landing). Lives in marketing site OR separate `examples/` dir. Tailwind UI / Mantine UI gallery model | P1 | L | ❌ |

### Phase 2.5 — Distribution & presets exploration (NEW track)

Strategic question: do we offer alternative distribution paths alongside npm?

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 2.5.1 | Decision: ship registry distribution alongside npm? OR npm-only forever? | P1 | S (decision-only) | ❌ — open question, see § 7 |
| 2.5.2 | If yes: prototype `@shilp-sutra/registry` adapter that emits component source + types + tokens for shadcn-CLI ingestion | P2 | L (2-3 weeks) | ⏸️ pending decision |
| 2.5.3 | Design System Presets — bundleable "Devalok skin" / "Karm skin" / "Minimal skin". Consumers pick one with `pnpm shilp-sutra preset use karm` (CLI) or `@import "@devalok/shilp-sutra/presets/karm"` (CSS-only) | P2 | M | ❌ |
| 2.5.4 | Community preset submission flow — how do third parties contribute presets? | P3 | S | ❌ |

### Phase 3 — Quality + discovery hardening

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 3.1 | Per-entry-point bundle-size budgets via `size-limit`. Fail CI on regression. Targets: <5KB tree-shaken Button, <20KB typical 5-component app | P0 | M | ⚠️ repo-wide gate exists, not per-component |
| 3.2 | Per-component bundle-size badge in `llms-full.txt` | P2 | S | ❌ |
| 3.3 | Public Chromatic project link in README | P1 | S | ❌ |
| 3.4 | Dedicated a11y page — WCAG 2.2 AA conformance per component, automated axe coverage report, keyboard nav matrix | P1 | M | ❌ |
| 3.5 | Theme/branding cookbook | P0 | M | ✅ (`customize-brand.md`) |
| 3.6 | RSC/Next.js dedicated guide | P1 | M | ✅ (`server-components.md`) |
| 3.7 | Playwright visual smoke per starter template | P2 | M | ❌ — depends on 2.2 |
| 3.8 | Performance benchmark — cold-render 100 buttons + 10 dialogs vs MUI / Mantine / Chakra | P2 | M | ❌ |
| 3.9 | Public roadmap on GitHub Projects (mirror this doc) | P1 | S | ❌ |
| 3.10 | Quarterly roadmap review — calendar event every 3 months to revisit phases, prune stale items, add learnings | P1 | continuous | ❌ |

### Phase 4 — Pre-public-promo polish

Only after 0.40+ stable.

| # | Item | Tag | Effort | Status |
|---|---|---|---|---|
| 4.1 | Name lock — `@devalok/shilp-sutra` (cultural identity) vs unscoped `shilp-sutra` (reach). Decide BEFORE promo | P0 | S | ❌ open |
| 4.2 | Public-launch blog post — design philosophy + token architecture + AI-agent story | P1 | M | ❌ |
| 4.3 | Demo video (90s) — install → working dashboard | P1 | M | ❌ |
| 4.4 | Submissions: awesome-react, awesome-design-systems, daily.dev, Product Hunt | P2 | S | ❌ |
| 4.5 | "Show HN:" launch — Tuesday/Wednesday morning US Pacific. Title direct + specific. Engage in comments | P2 | S | ❌ |
| 4.6 | "Compare to shadcn / Radix / Mantine" page — honest positioning, decision matrix | P2 | M | ❌ |
| 4.7 | Twitter/Bluesky/Mastodon launch thread | P2 | S | ❌ |
| 4.8 | Reddit r/reactjs, r/webdev cross-posts (NOT spammy — answer real questions) | P2 | S | ❌ |
| 4.9 | "Customer story" page once we have 3+ public adopters with logos | P3 | M | ❌ |
| 4.10 | Discord OR GitHub Discussions — community channel. Pick one. Don't over-build before signal | P2 | S | ❌ |
| 4.11 | Newsletter / changelog email — opt-in. Ship a release-notes summary monthly | P3 | M | ❌ |

### Cross-cutting (continuous)

| # | Item | Tag | Status |
|---|---|---|---|
| C.1 | Every PR with new component: llms.txt updated, bundle size unchanged, Storybook story, a11y test, Chromatic baseline | P0 | ✅ enforced via `pre-publish-audit.mjs` (45 gates) + PR template |
| C.2 | Quarterly dep-audit (Tailwind, framer, sonner, vendored Radix) | P1 | ⏳ ongoing |
| C.3 | Issue templates — bug, feature, AI-agent-feedback | P1 | ✅ |
| C.4 | Telemetry decision — only if we ship CLI. Privacy review BEFORE shipping | P1 | ⏸️ pending CLI decision |
| C.5 | Translations of recipes — i18n. Skip until multi-region adoption signal | P3 | ❌ |

---

## 4. Distribution model decision (deep dive)

**Today (npm-only):**

```bash
pnpm add @devalok/shilp-sutra
# add 2 lines to globals.css, transpilePackages, done
```

Components live in `node_modules`. Consumer imports from `@devalok/shilp-sutra/ui/button`. Updates via `pnpm update`.

**shadcn-style alternative (registry):**

```bash
npx shadcn add button --registry @devalok/shilp-sutra
# component source copied into consumer's repo at components/ui/button.tsx
```

Components live in consumer's own source tree. Updates require re-running `add`. Component code is fully owned + editable.

**Comparison:**

| Dimension | npm (current) | Registry (shadcn-style) |
|---|---|---|
| Update flow | `pnpm update` — one-command | Re-run `add` per component, manual diff merge |
| Customization depth | CSS variables + `className` overrides | Edit source directly |
| Tree-shaking | Per-component imports + bundler | Consumer keeps only what they `add` |
| Consistency across consumers | High (all on same version) | Drifts (each repo has its own copy) |
| Best for | Apps that want a consistent DS upgraded by maintainers | Apps that need full ownership / heavy customization |

**Verdict: stay npm-only through 1.0. Revisit registry in Phase 2.5 once the npm path is bulletproof and we have data on customer demand.** Adding registry alongside is 4-6 weeks of work — significant. Evidence we need to gather first:

- Are external consumers asking for registry mode? (Track issues labeled `distribution`)
- Are they customizing components heavily enough that npm-with-className-override breaks down?
- Is shadcn's CLI ergonomically winning consumers we'd otherwise get?

If yes → 2.5.2. If no → skip indefinitely.

---

## 5. CLI cost estimate (when we revisit)

Unchanged from initial estimate. Reproduced for reference:

| Module | Effort (solo + Claude Code) | Risk |
|---|---|---|
| Package scaffolding | 0.5 day | low |
| Core arch (commander, logger, fs helpers, prompts) | 1-2 days | low |
| `init` Next.js (App + Pages, .js/.ts/.mjs config variants) | 2-3 days | medium |
| `init` Vite | 1 day | low |
| `init` Remix + Astro + TanStack + React Router | 3-4 days | medium |
| `info` command | 0.5-1 day | low |
| `doctor` command | 1-2 days | medium |
| `--dry-run` / `--diff` / `--yes` / `--framework` flags | 1 day | low |
| Tests (snapshot per framework + 1 e2e) | 1-2 days | medium |
| Release.yml + changeset wiring | 0.5 day | low |
| **MVP (Next + Vite, init + doctor + info, dry-run)** | **8-10 days = ~2 weeks** | |
| **v1 (all 6 frameworks, all flags)** | **18-22 days = ~4-5 weeks** | |

**Hidden costs:** Windows path handling, pnpm/yarn-berry/bun install command divergence, monorepo detection (Karm-style Turborepo nested apps), ESM/CJS interop, color output across PowerShell/cmd/bash/WSL, telemetry decision, CLI versioning policy, update-notifier prompts.

**Risk-adjusted budget:** 2-3 weeks MVP, 6-8 weeks v1.

**Trigger to build:** if measurement window (§ 6.5) shows >50% of new external installs require manual triage OR agent-success rate is <80% on supported frameworks.

---

## 6. Recommended sprints (rapid-iteration mode)

- **Sprint complete (this commit `ebf6f545`):** Phase 0 + Phase 1 (recipes track). Foundation hygiene + recipe catalog + AGENTS.md.
- **Sprint 2 (1-2 weeks, P0):** Phase 3.1 (per-component size budgets), 3.4 (a11y conformance page), 1.5.2 (codemod policy in CONTRIBUTING). Trust signals + future-proofing.
- **Sprint 3 (1 week, P1):** Phase 1.5.1 (`@devalok/eslint-plugin-shilp-sutra`), 1.11 (Storybook MCP doc in llms.txt), 3.3 (Chromatic public link). Tooling.
- **Sprint 4 (2-3 weeks, P1):** Phase 2.2 (3 starter repos: Next, Vite, Astro). Highest-value humans-and-agents asset after recipes. Skip Remix/TanStack starters until demand emerges.
- **Sprint 5 (1-2 weeks, P1):** Phase 2.3 (marketing/docs site, Astro Starlight). Conversion funnel for public push.
- **Sprint 6 — measurement window (4-6 weeks):** Watch for AI-agent feedback issues. Measure: install-success rate (track via labeled issues), recipe step that trips agents most, common questions in Discussions/issues. Decide CLI go/no-go.
- **Sprint 7 (conditional, 4-5 weeks):** If measurement says CLI needed → build per § 5. If not → skip to Phase 4.
- **Sprint 8 (3-4 weeks, Phase 4 prep):** 4.1 name lock, 4.2 launch blog, 4.3 demo video, 4.6 comparison page, 4.10 Discord setup.
- **Launch (Phase 4 execute, 1-2 weeks):** 4.4 awesome-list submissions, 4.5 Show HN, 4.7-4.8 social.

**Sprint cadence:** ~2 weeks each. ~6 months total to launch (depends heavily on CLI go/no-go in Sprint 6).

---

## 7. Open questions

These need answers BEFORE Phase 4 (public launch):

1. **Name lock.** Keep `@devalok/shilp-sutra` (cultural identity, brand-scoped) vs unscoped `shilp-sutra` (broader reach). Strong opinion either way is fine; just decide before promotion. **Don't rename after launch.**
2. **1.0 commitment criteria.** Suggested:
   - 0.40+ minor without breaking changes
   - 3+ external consumers with non-trivial usage
   - All P0 issues closed
   - At least one full successful breaking-release cycle WITH codemod
   - Bundle size targets met (Phase 3.1)
   - Public roadmap exists (Phase 3.9)
   Refine before committing.
3. **Marketing site stack.** Astro Starlight vs Nextra vs custom Next.js? Affects Phase 2.3 effort + maintenance burden.
4. **CLI go/no-go date.** Suggested: 6 weeks after this commit lands (~mid-June 2026). Trigger conditions in § 5.
5. **Telemetry.** Once CLI exists, do we want anonymous usage stats? Privacy review needed BEFORE first telemetry ship.
6. **Funding.** GitHub Sponsors? Open Collective? Skip entirely? No commitment yet.
7. **Registry distribution (Phase 2.5).** Ship alongside npm? Skip indefinitely? Decision criteria above in § 4.
8. **Storybook MCP productization (1.5.4).** Currently dev-only at `localhost:6006/mcp`. Worth publishing as standalone npm package consumers can run? Or keep as a maintainer-only dev tool? Bias: keep dev-only until 3+ external requests.
9. **Discord vs GitHub Discussions (4.10).** Lower friction = Discussions (in repo, no extra account). Higher engagement = Discord (real-time, but requires moderation). Pick one, don't run both. Bias: Discussions until issue volume is unmanageable.
10. **Comparison page tone.** Honest positioning vs marketing-spin. Bias: be brutally honest — "shadcn is better if X; we're better if Y." Builds trust faster than puffery.

---

## 8. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Public release attracts users who hit edge-case bugs we never saw | High | Medium | AI-agent-feedback issue template + Karm production usage = real-world coverage. Phase 1.5.3 codemods reduce migration pain. |
| Doc-driven setup turns out insufficient — too many failed agent installs | Medium | High | Measurement window (Sprint 6) catches this. Triggers CLI build. ~5 week recovery time. |
| Tailwind 5 lands and forces another migration | Low | High | We're on TW4 since 0.37. TW5 is unannounced. Monitor; budget breaking-release cycle when announced. |
| Framer Motion has another major rewrite | Low | Medium | We pin to `^12`. If FM 13 breaks, evaluate switch to Motion One or React Spring. |
| Karm requirements diverge from public DS direction | Medium | Medium | Karm-specific components ALREADY split out (2026-04-05). DS stays generic. Karm maintains its own domain layer. |
| Maintainer burnout from 1-person team | High | Critical | Keep contribution barriers low (good `CONTRIBUTING.md`, working `AGENTS.md`, tests cheap to run). Don't over-promise SLA pre-1.0. Post-1.0: explicit "best-effort, no commitments" in README. |
| Naming ambiguity (`shilp-sutra` is unfamiliar to non-Indian devs) | Medium | Low | Add tagline + clear positioning. Don't rename after launch. |
| Radix vendoring becomes maintenance burden | Medium | Medium | Audit vendored primitives quarterly. Switch to direct `@radix-ui` deps if upstream stabilizes (Radix 2.0 trajectory). |

---

## 9. Decisions logged

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-08 | Doc-driven setup before CLI | Lower cost, ~80% coverage, agents handle file edits well in 2026 |
| 2026-05-08 | Minor bump for recipe additions | New `docs/recipes/` ships in tarball — real public-surface change |
| 2026-05-08 | Rapid iteration until "very strong for release" | NOT freezing 1.0 API yet |
| 2026-05-08 | Mail alias `shilp-sutra@devalok.in` | Project-aliased > personal email |
| 2026-05-08 | GitHub team `@devalok-design/shilp-sutra` | Triage access confirmed |
| 2026-05-08 | npm-only distribution through 1.0 | Adding shadcn-style registry alongside is 4-6 weeks; revisit when consumer demand is proven (Phase 2.5) |
| 2026-05-08 | Codemod policy: any break touching >2 components ships a codemod | Adopted from Mantine v7 lessons |
| 2026-05-08 | Skip VS Code extension; ship snippets package only | Tailwind IntelliSense covers ~80% of value for free |
| 2026-05-08 | Skip MUI X-style commercial Pro tier | OSS-only product. Not building a business around this |
| 2026-05-08 | Discussions before Discord | Lower friction; only escalate if volume demands it |

---

## 10. How to use this doc

- **When picking next work:** scan phase tables, find P0/P1 with `❌` or `⏳` status, weigh against current sprint priorities.
- **When merging anything that touches public surface:** update the matching row's status. Don't let the doc drift behind the code.
- **When making a strategic decision:** add a row to "Decisions logged" with date, decision, rationale.
- **When unblocking a deferred item:** check open questions for prerequisites.
- **Quarterly review (cross-cutting C.2):** prune stale items, add learnings, refresh "Best practices" section if industry moved.

This doc is living. Edit freely. Don't let it rot.
