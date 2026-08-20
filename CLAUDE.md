# shilp-sutra Design System

> **Other AI agents (Cursor, Copilot, Codex, Aider):** read [`AGENTS.md`](./AGENTS.md) — generic agent contract.
> **Consumer-facing setup recipes:** [`packages/core/docs/recipes/`](./packages/core/docs/recipes/) — ship inside the npm tarball, available at `node_modules/@devalok/shilp-sutra/docs/recipes/` once installed.
>
> This file (`CLAUDE.md`) is the maintainer-facing repo guide loaded by Claude Code when working IN this repository. It is not shipped to consumers.

## Quick Reference

- **Monorepo**: pnpm workspaces — `packages/core`, `packages/brand`
- **Stack**: React 19, TypeScript 6, Vite 8 (Rolldown), Tailwind 4 (CSS-first via `@theme`), CVA
- **Test**: `pnpm test` (Vitest + RTL + vitest-axe)
- **Build**: `pnpm build` (per-package)
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm typecheck`

## Tailwind 4 Architecture (0.37.0+)

**CSS-first, no JS preset.** Consumers do:
```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

**Token source-of-truth layout** (at `packages/core/src/tokens/`):
- `primitives.css` — private palette in `:root { }` + `.dark { }` (NOT `@theme`)
- `semantic.css` — public utility-generating tokens in `@theme { }` + `.dark { }` overrides + `@media (forced-colors)`
- `typography.css` — `@font-face` declarations
- `typography-semantic.css` — `--text-ds-*`, `--leading-ds-*` in `@theme`
- `base.css` — `@layer base { @property + iOS @media fix }`
- `animations.css` — `@keyframes` + `@theme { --animate-* }`
- `utilities.css` — `@utility` blocks (typography composites, focus-ring, touch-target, safe-area, z-layer, duration names)
- `variants.css` — `@custom-variant dark (&:where(.dark *));`
- `shilp-sutra.css` — consumer entry: imports all above + `@source "../../dist"` + `@source "@devalok/shilp-sutra"`

**Namespace rules:**
- Spacing is `--spacing-ds-*` (generates `p-ds-03`, not `p-3`) — avoids collision with consumer numeric spacing
- Typography is `--text-ds-*` / `--leading-ds-*` — avoids collision with consumer text sizes
- `--radius` (unsuffixed) generates bare `rounded`; `--radius-ds-*` generates `rounded-ds-lg` etc.
- `--z-*` and `--duration-*` do NOT auto-generate utilities (TW4 has no such namespaces); they live in `:root` and get explicit `@utility z-popover`, `@utility duration-fast-01` blocks
- Bare `shadow` class is dead in TW4 — always use `shadow-raised`, `shadow-overlay`, etc.
- `w-[--var]` is dead — use `w-(--var)` (TW4 shorthand)
- `bg-gradient-to-*` is dead — use `bg-linear-to-*`
- `theme(spacing.N)` inside arbitrary values is dead — use the literal value

**Peer dependencies:**
- `framer-motion ^12` — REQUIRED peer. Module-scoped React contexts (MotionConfig, AnimatePresence, LayoutGroup) must be single-copy; peer-declaration forces consumer dedupe.
- `sonner ^2` — optional peer (only needed if consumer renders a `<Toaster />`).
- `tailwindcss ^4.0.0` — tightened from `^3.4.0 || ^4.0.0` in 0.37.
- `@tiptap/*` ×12 — optional peers, REQUIRED as of 0.56.0 for RichTextEditor / RichChatInput (see externalization rule below). `prosemirror-*` is never imported directly — route through `@tiptap/pm/state` so it rides the existing `@tiptap/pm` peer.

**Runtime `dependencies` (0.56.0):** `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`. That's the whole list — keep it that way. `use-sync-external-store` was removed in 0.56.0: React 18+ has the hook built in (`primitives/_internal/react-use-is-hydrated.ts` calls it directly) and the dep existed only to feed the bundled tiptap chunk.

**Build externalization** (vite.config.ts `rollupOptions.external`):
- `framer-motion`, `sonner` — bundling splits consumer React contexts.
- `@tiptap/*`, `prosemirror-*` (0.56.0) — were declared as optional peers AND bundled (641 KB chunk). A consumer following our own peer instructions ran two ProseMirror copies; plugin keys are module-scoped, so the copies couldn't see each other's plugins.
- `clsx`, `class-variance-authority`, `tailwind-merge` (0.56.0) — they leak into our published `.d.ts` (25 files reference `VariantProps`; cva's inferred return type embeds `class-variance-authority/types#ClassProp`; `utils.d.ts` imports `ClassValue`), so consumers must resolve them for `tsc` regardless. Bundling on top of declaring shipped the code twice and blocked dedupe.

### HARD RULE: never declare a package as a peer AND bundle it

Pick one. Declared-and-bundled is the bug that shipped twice (framer-motion/sonner in 0.37, tiptap through 0.55): the component works for consumers who ignore the peer instruction, and *breaks subtly* for the ones who follow it, because two copies of a module-scoped context / plugin registry can't see each other. If it leaks into our `.d.ts`, it must be **declared and external**. If it's an internal implementation detail, it must be **bundled and undeclared**. `derive-peer-map.mjs --check` (a release gate) enforces the recipe tables against the externalization set — but it can't catch "bundled AND declared", so that one is on you.

**No install scripts (0.56.0).** `packages/core/package.json` has no `postinstall` and must not regain one. The old one printed a banner and wrote a project-scoped `.mcp.json` into the consumer's repo. Writing files outside our own directory on install — especially to point someone's agent at our server — is what npm's install-script blocking exists to stop, and it cost us trust publicly. MCP setup is an opt-in README command.

**Never** re-introduce:
- JS preset (`packages/core/src/tailwind/preset.ts` is a deprecated no-op stub, scheduled for removal in 0.38)
- `@config` directive in consumer CSS
- `tailwind.config.ts` at repo root (deleted in 0.37)
- `process.getBuiltinModule` / `createRequire` patches in `inject-use-client.mjs` (Phase 0 spike made the bridge unnecessary)

## Design Preferences (default to these)

**Prefer `variant="soft"` over `variant="outline"` for non-primary Button actions.** Soft (tinted step-3 bg, step-11 text, no visible border) feels warmer, brand-consistent, and reads better in data-dense UIs than outline's bordered-transparent look. When generating examples, docs, stories, or writing new screens, default to soft for secondary actions and use outline only when:
- The button sits on a colored or surface-raised background where soft's tint would disappear
- A toolbar/icon-dense context where soft would feel visually heavy
- Paired adjacent to a primary action where you want a clear hierarchy that outline provides

This applies to: Button, SplitButton, and anywhere else `variant="outline" | "soft"` is a choice. It does NOT override explicit design decisions already in existing components.

## Figma Library (2026-08-18 rebuild)

**Read these before touching the Figma file — they supersede the checklist below:**
- [`docs/plans/2026-08-18-figma-library-build-plan.md`](./docs/plans/2026-08-18-figma-library-build-plan.md) — architecture and decisions (D1–D23)
- [`docs/plans/2026-08-18-figma-build-playbook.md`](./docs/plans/2026-08-18-figma-build-playbook.md) — API traps, layout tricks, per-component audit, verification protocol
- [`docs/plans/2026-08-18-figma-foundations-spec.md`](./docs/plans/2026-08-18-figma-foundations-spec.md) — every collection, mode and variable as built
- [`docs/plans/2026-08-18-figma-port-retrospective.md`](./docs/plans/2026-08-18-figma-port-retrospective.md) — how the work went, the full bug ledger, and what caught what
- [`docs/plans/2026-08-19-figma-components-build.md`](./docs/plans/2026-08-19-figma-components-build.md) — **Phase 3 as built**: 11 sets, 535 variants, the mode-chain architecture, and 10 findings in the DS itself

Live file: `bcBO7RgVYR4ulwPr3j2heY`. Icon library: `Vst4WnV0LYfRZdC1dc7qv6` (owned, editable, 4,962 icons bound to `component/fg`). The April 2026 plan and its Figma file are superseded.

**Built and PUBLISHED (2026-08-19): 25 sets, 741 variants.** Button 330, Input 64, Textarea 64, Badge 56, Select 48, Checkbox 27, Radio 18, Switch 18, Alert 15, Combobox 12, Slider 12, Progress 12, Avatar 10, Segment item 9, Tab item 9, Card 6, Toast 6, Sheet 4, Label 4, Tooltip 4, Segmented control 3, Tabs 3, Skeleton 3, Dialog 2, Separator 2. 29 collections, ~740 variables, 20 text styles, 13 effect styles. **Publishing is a human step — republish after any change.**

**`Accessibility review` page** carries three measured contrast failures that are CODE bugs this library reproduces faithfully, with proposed fixes and live-bound specimens: Alert dismiss on solid (**1.01:1**), Badge category solid in dark (3.28–3.70:1), Input/Textarea placeholder in light (4.14:1). Decide these before the next release.

Headline architecture: **style is a variable mode, colour is a variant, interactive state is a variant, icons come from our own published Tabler copy with colour bound in each icon's main component.** Code Connect is **blocked** — the Devalok plan is Pro, and Code Connect needs Organization/Enterprise. Use `description` + `documentationLinks`.

Five rules that cost the most time when broken:
1. **The collection a variable lives in is the OUTERMOST selector of its resolution chain.** A value that varies by state *and* style must live in the state collection and alias into the style one. Get it backwards and the value is unreachable. This is what lets one `component/fg` serve 4,962 icons across every state.
2. **Regenerate the component spec before every build** (`figma-sync-components.mjs <name>`) and read the component *body* for prop interactions — the CVA describes appearance, not which prop overrides which. It reports **0 compound rules for Badge and Card**, whose colours live in a plain object, not the CVA.
3. **Test with real scenarios and varied copy, not a variant grid.** A grid hides layout bugs because every label is the same length.
4. **Measure, don't eyeball** — but also read the numbers you get back. Four of ten bugs in the Button spike were silent, and a later one sat unnoticed inside a verification output I had already looked at. A returned `0` is a finding.
5. **Never write `.visible` on a variable-bound node** — it silently clears the binding. An audit that reveals hidden nodes to inspect them will destroy what it inspects (it cost 264 spinner bindings).
> **Before building any Figma component, load the `figma-component-authoring` skill** (user-level, alongside `figma-use`). It carries the mechanism decision table (variant vs boolean vs instance-swap vs slot vs variable mode), the verified build order, and every silent failure this project paid for. It exists because we shipped a whole library before discovering native slots.

6. **Assume a Figma limitation is your ignorance until three distinct mechanisms have failed.** This has now been wrong four times. The latest: "instances can't hold content" after trying exactly one approach — Figma has **native slots** (`component.createSlot()`). Card, Dialog, Sheet, Tabs and Segmented control now use them (7 slot properties). **Slots must be created BEFORE `combineAsVariants` or they don't merge** — one property per variant, and dropped content dies on every variant switch.

### Legacy checklist (2026-04-20)

Still broadly valid for component completeness; ignore its Code Connect item. Original note: the Button went through four rebuilds on 2026-04-20 because we skipped these:

**Component properties (right-panel UX):**
- TEXT property for any visible string (label/heading/body) — never hardcode "Button"
- BOOLEAN property for each icon slot the CVA supports (startIcon, endIcon)
- BOOLEAN property for every CVA boolean prop (disabled, fullWidth, shape=pill, loading)
- VARIANT axis for every CVA axis, including State (default/hover/pressed/disabled/loading) where meaningful

**Variable bindings (never raw numbers):**
- Padding, cornerRadius (all 4 corners), itemSpacing, height, width → bound to Primitives/Spacing, /Radius, /Size
- Fill, stroke, text color → bound to Semantic/Color
- Font size → bound OR uses a DS text style (one of the two — no raw px values)

**Effects as Figma Effect Styles:**
- Every shadow the CVA references (`shadow-raised`, `shadow-brand`, etc.) must exist as a named Effect Style
- Apply the style to the variant CVA specifies

**Documentation:**
- ComponentSet `.description` — purpose + 2-3 example use cases + SOURCE path
- Code Connect mapping: Figma node → GitHub source URL at `packages/core/src/ui/*.tsx`

**Workflow scripts (in repo, re-runnable without an agent session):**
- `packages/core/scripts/figma-sync-tokens.mjs` — parses `tokens/*.css` → Figma-ready JSON
- `packages/core/scripts/figma-sync-components.mjs` — parses CVA → Figma component spec
- `packages/core/scripts/figma-drift-check.mjs` — diffs Figma live state vs CVA

**Publishing:** Only the user can click "Publish library" in Figma — flag it explicitly, don't assume done without it.

Skipping any of the above is NOT a time-saver. The cost of rebuild is 3-5× the cost of doing it right first time.

## Surface Layering (MANDATORY)

Every component MUST use the correct surface level. This is a hard rule, enforced by `pre-publish-audit.mjs`.

**Use the SEMANTIC NAMED tokens — never the numbered classes.** `bg-surface-1..4` (and `text-`/`border-`/`ring-surface-1..4`) are DEPRECATED and hard-flagged by the audit's *Source Hygiene* gate (`No deprecated surface tokens in components`) — no per-file allowlist, no exceptions. They map to raw neutral steps and do NOT invert for dark mode; the named tokens are theme-aware (base/raised swap neutral steps between light and dark so elevation reads correctly in both). This gate is **release-only, not in PR CI** — a numbered class sails through the PR and only fails post-merge in `integration.yml`. Cost a release cycle on 0.53.0 (schedule-view rebuild used `bg-surface-2`).

```
bg-surface-base    → Page background (the canvas everything sits on)
bg-surface-overlay → Overlays: Dialog, Sheet, Popover, DropdownMenu, Select,
                     Combobox, Toast, HoverCard, sticky headers, input controls,
                     floating toolbars
bg-surface-chrome  → shell chrome: TopBar, Sidebar, BottomNavbar. Its OWN tier so
                     chrome's surface is an explicit, independently tunable decision
                     (Carbon/Atlassian/Ant model), not coupled to the card surface.
                     Currently equals `raised` — chrome reads slightly elevated in
                     dark — but can diverge without touching cards.
bg-surface-raised        → Cards, widgets, panels, editor containers — anything ON the page
bg-surface-raised-hover  → Hover on raised elements, skeleton shimmers, track fills
bg-surface-raised-active → Active/pressed states, hover on raised-hover elements
bg-surface-sunken        → Wells/insets that recede below the page
```

**The rule:** If a component renders as a card/widget/panel on the page, its background is `bg-surface-raised`, NOT `bg-surface-base`. `bg-surface-base` is the page canvas + overlay backdrops only. When unsure which tier, grep a sibling component for its `bg-surface-*` usage and match — never reach for a numbered class.

## Publishing

**Day-to-day (release split 2026-07-22):** Publishing is decoupled from merging so releases can be *paced*, not churned. Three workflows:
- **`version.yml`** (push→main): `changesets/action` opens/updates the Version Packages PR. Never publishes.
- **`integration.yml`** (push→main): runs the release-UNIQUE gates PR CI can't (pre-publish-audit, consumer-smoke, compiled-CSS coverage, skill-drift, Chromatic) as a post-merge net. Never publishes.
- **`release.yml`** (`workflow_dispatch` ONLY): full gauntlet **+ publish** via OIDC Trusted Publisher (sigstore provenance).

**Flow:** land changesets → they accumulate in the Version PR → merge the Version PR when ready to ship (bumps versions, deletes changesets; **no longer auto-publishes**) → a maintainer dispatches `release.yml` (Actions UI "Run workflow" or `gh workflow run release.yml`). A stable dispatch is **refused if unreleased changesets are still pending** (you forgot to merge the Version PR). **Do not run `npm publish` manually.**

> Gate steps in `integration.yml` are a subset of `release.yml`'s — when you add/change a release gate, keep both in sync or the post-merge net has a hole.

**Authority on gates:** `scripts/pre-publish-audit.mjs` is the single source of truth — 45 hard gates (git clean, version ↔ CHANGELOG match, per-component docs coverage, CVA/doc prop accuracy, typecheck, lint, tests, build, SSR smoke, surface/shadow token hygiene, TW4 migration hygiene, published-exports ordering, bundle size). It runs in `integration.yml` (every main push) AND `release.yml`'s Audit step before publish, AND can be invoked locally (`node scripts/pre-publish-audit.mjs`) for pre-flight checks.

**Human judgment lives on the Version Packages PR.** See `/publish-release` for the reviewer checklist (changeset body quality, bump magnitude, Chromatic review, Storybook spot-check). CI can't evaluate these — they gate on merge.

**When CI is broken:** Use `/publish-release`'s emergency manual runbook. Not optional gates — every one still runs locally before publish. The Iron Law ("NO PUBLISHING WITHOUT EVERY GATE PASSING") applies regardless of who's pressing the button.

**Auth state (2026-04-21+):** OIDC Trusted Publisher is active. `NPM_TOKEN` is no longer set; release.yml requires `id-token: write` permission and npm 11.5.1+ (the workflow bootstraps npm 11 before the publish step). See commits `79d60a8c`, `1f23742c`, `2c1f6ee0` for the saga that got us here.

**If docs slip past a publish** (happened with 0.36.0's llms.txt gap): publish a patch immediately. Don't wait.

### HARD RULE: read the `pnpm-lock.yaml` diff before committing it (learned 2026-07-26, 0.56.0)

`pnpm-lock.yaml` is generated, so it gets `git add`-ed on autopilot — and a lockfile is the one generated file where a single stray line breaks every consumer of the repo. 0.56.0's first CI run died on `ERR_PNPM_OUTDATED_LOCKFILE` because the `packages/core` importer had picked up

```
'==rich-chat-input?RCI:RTE':
  specifier: link:==rich-chat-input?RCI:RTE
```

— a fragment of `c==='rich-chat-input'?RCI:RTE`, from a mangled inline `node -e` whose shell quoting broke and word-split into something that reached pnpm. Always `git diff pnpm-lock.yaml` before staging; for a dependency change the diff should be small and every line should be one you can explain.

**Why nothing local caught it:** `pnpm install --frozen-lockfile` **short-circuits on an up-to-date `node_modules`** — it printed `Already up to date` and exited 0 against the poisoned lockfile. `--force` didn't defeat it. Deleting `node_modules/.modules.yaml` didn't defeat it. Only CI caught it, because CI starts from a fresh checkout with no `node_modules`.

`pnpm check:lockfile` (`scripts/check-lockfile.mjs`) closes that gap and runs first in `pnpm verify`: it copies the workspace manifests + lockfile into a temp dir with **no `node_modules`** and runs `pnpm install --frozen-lockfile --lockfile-only` there, which is the only condition under which pnpm actually re-validates. Verified both ways — passes clean, exits 1 on the real bogus entry. Don't "simplify" it into an in-repo `pnpm install --frozen-lockfile`; that is precisely the check that lies. (Also: it invokes `cmd.exe` explicitly on Windows — a bare `spawnSync('pnpm.cmd')` fails `EINVAL`, and `shell:true` works but emits DEP0190 on every run.)

### HARD RULE: a type NARROWING is breaking — never label it "non-breaking" (learned 2026-05-27, 0.40.0)

Before writing "non-breaking" / "type widening only" on any prop-type change, classify the direction **per prop**, against the prop's PREVIOUS type:

- **Widening** (old type ⊂ new type) → accepts more → non-breaking. Safe to label.
- **Narrowing** (new type ⊂ old type) → accepts less → **BREAKING**. A consumer whose value was valid under the old type now fails `tsc`.
- **Mixed** → it's breaking. Label it breaking and name which props narrowed.

`React.ReactNode` is the widest icon type (`ReactElement | string | number | boolean | null | undefined | Iterable`). Anything tighter than it — e.g. `IconInput` (`ReactElement | ComponentType | null | undefined`) — is a **narrowing** for every prop that was `ReactNode`. 0.40.0's F-10 unification was labeled "type widening only"; it widened the `ComponentType`-only props but **narrowed the 14 `ReactNode` props**, breaking 3 karm-v2 call sites (devalok-design/shilp-sutra#61). The `/publish-release` checklist's "if types changed, it IS breaking" box was read and still passed — don't repeat that.

When unsure whether old ⊂ new or new ⊂ old, write a `@ts-expect-error`/`expectTypeOf` probe with a value valid under the old type (a `Record<string, ReactNode>` entry, a `string`) and check it still compiles against the new type. If it doesn't, it's a narrowing → breaking.

## Figma Make Kit

`packages/core/make-kit/` ships in the npm tarball. 26 files: `Guidelines.md` + `setup.md` + 7 `foundations/*.md` + `components/overview.md` + 15 per-component guides. Authored to be pasted into Figma Make when registering shilp-sutra as a Make kit (https://developers.figma.com/docs/code/bring-your-design-system-package/).

Subpath exports: `@devalok/shilp-sutra/make-kit` → `Guidelines.md`, `@devalok/shilp-sutra/make-kit/*` → individual files.

**Authoring rules.** Voice is direct + prescriptive, no marketing copy. Sections per component: import → When to use → Variants/Colors/Sizes tables → Props table → Examples (4–6) → Rules. Props/defaults MUST come from `mcp-manifest.json` or actual CVA source — when those disagree, the source code wins (caught one stale llms-full.txt Form section during initial authoring, before llms-full was removed in 0.45). When updating components in `src/ui/`, also update the matching `make-kit/components/*.md` if the prop surface changed.

Smoke-tested 2026-06-01 in fresh Vite 8 + React 19 + TW4 + framer-motion 12 app. Build/dev/utility emission all green. Make eligibility confirmed pending only the human registration step in Figma UI.

## Storybook MCP Server

When the Storybook dev server is running (`pnpm dev`), an MCP server at `localhost:6006/mcp` provides AI agents with:
- Live component metadata (props, stories, docs)
- Component and accessibility testing
- Live preview embedding

This complements the static `llms.txt` router + `mcp-manifest.json` with interactive capabilities.

## Hosted Docs MCP (`packages/mcp-server`, live at `https://shilp-sutra.devalok.in/mcp`)

Serves version-exact docs from published npm tarballs. **13 tools** (spec: `docs/specs/mcp-manifest-standard.md`):
- Reference: `how_to_use` (self-teaching bootstrap — tool map + sequences), `find_component`, `get_component`, `get_tokens`, `get_setup`, `upgrade`, `search_docs`
- Setup journey (0.47+): `detect_framework`, `preflight`, `validate_snippet`, `verify_setup` — close the peer-dep-cliff, TW4-dead-class, wrong-recipe, mis-wired-config traps. `preflight`/`verify_setup` read the manifest's per-component `peers` field.
- Quality (0.50+): `check_slop` — deterministic pre-emit design-quality gate. **Two passes:** regex corpus (`slop-corpus.json`) + a `@babel/parser` **AST pass** (nested-cards, filled+outline button duo, identical card grids, skipped heading levels). Returns findings + strengths + DO-guidance (`slop-guidance.json`, incl. a versioned Setu-principle snapshot + one-line Setu pointer) + a `self_critique` block (a taste-prompt the CALLING agent runs on itself — **no LLM on our end**). Escape `// slop-allow: <id> <reason>`. Version-independent (no tarball). Complements `validate_snippet` (correctness). Still-deferred (fuzzy/agent-judged): hero-metric, decorative-numbering, safe-face.
- Write: `report_issue` (files a public agent-feedback issue).

Tool list is GENERATED into README/AGENTS via `scripts/generate-tool-list.mjs` (`<!-- BEGIN:mcp-tools -->` markers; drift gate) — add new tools to its `CATEGORY` map. Manifest emitter (`build-mcp-manifest.mjs`) attaches structured `peers[]` per component. Smoke: `packages/mcp-server/scripts/smoke.mjs` covers all 13 (runs in CI on any MCP-relevant change).

## CI: Turborepo remote cache (0.47+)

`build`/`typecheck`/`lint`/`test` route through `turbo run`. PR CI reads+writes a self-hosted `turborepo-remote-cache` on Railway (`turbo-ss.devalok.dev`, `TURBO_TOKEN` repo secret). **Safety: the release path never uses the cache** — `release.yml` sets `TURBO_FORCE=true` with no cache creds, and `pnpm release` uses `build:fresh` (`turbo run build --force`), so a published artifact is always freshly built. `turbo.json` `outputs` list ONLY gitignored generated artifacts (dist, skill, mcp-manifest.json, AGENTS.md, MIGRATION.md, .next) — NEVER committed files the build also touches (`llms.txt`, `docs/components`, `README.md`), or a cache restore would misrepresent source.

The pre-publish-audit skips its build/typecheck/test/ssr gates when `SS_AUDIT_SKIP_REDUNDANT=1` (release.yml sets it — those ran as prior steps). `version-packages` auto-stubs a MIGRATION.md section for the target version (`scripts/stub-migration-section.mjs`) so the MIGRATION-section gate can't block a release.

## Consumer AI Agent Feedback Protocol

This repo receives feedback from AI agents working on consumer apps (e.g., Karm).
Feedback arrives as GitHub Issues on `devalok-design/shilp-sutra` labeled `karm-ai-agent-feedback` (Karm's flow) or `mcp-submitted` (filed via the MCP `report_issue` tool by any consumer agent).

**You do NOT check or act on these automatically.** Only act when triggered:

### /check-karm-feedback

Read all open issues labeled `karm-ai-agent-feedback` OR `mcp-submitted` on `devalok-design/shilp-sutra`.
For each issue:
1. Investigate the reported problem against the actual codebase
2. Summarize findings (confirmed bug, already works, docs gap, etc.)
3. Present to the user
4. **Do NOT fix, comment on, or close issues until the user approves**

### /send-karm-notice

File an issue on `devalok-design/karm` with label `shilp-sutra-ai-agent-feedback`.
Use the DS Notice format:

```markdown
Title: [DS Notice] <short summary>

## Type
<!-- one of: deprecation | migration-required | new-feature | usage-guidance -->

## Affects
- Component(s): <names>
- Current version: @devalok/shilp-sutra@X.Y.Z
- Target version: <if applicable>

## Description
<what's changing or what we noticed>

## Action Required
<!-- before -> after migration code, or recommended usage -->

## Timeline
<!-- immediate | next-minor | next-major -->
```

See `docs/plans/2026-03-07-ai-agent-feedback-protocol-design.md` for full protocol details.
