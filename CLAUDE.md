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

**Peer dependencies (0.37.0):**
- `framer-motion ^12` — REQUIRED peer. Module-scoped React contexts (MotionConfig, AnimatePresence, LayoutGroup) must be single-copy; peer-declaration forces consumer dedupe.
- `sonner ^2` — optional peer (only needed if consumer renders a `<Toaster />`).
- `tailwindcss ^4.0.0` — tightened from `^3.4.0 || ^4.0.0`.
- `use-sync-external-store` — moved to our `dependencies` (from optional peer). Auto-installed transitively.

**Build externalization** (vite.config.ts `rollupOptions.external`):
- `use-sync-external-store`, `framer-motion`, `sonner` are externalized. Bundling them would split consumer contexts and bloat our dist.

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

## Figma Component Generation (MANDATORY checklist)

Before claiming any Figma component generated from a CVA source is "done", verify every item. The Button went through four rebuilds on 2026-04-20 because we skipped these:

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

```
surface-1 → Page background, overlays (Dialog, Sheet, Popover, DropdownMenu,
            Select, Combobox, Toast, HoverCard, etc.), shell chrome (Sidebar,
            TopBar), sticky headers, input controls, floating toolbars
surface-2 → Cards, widgets, panels, editor containers — anything that sits ON the page
surface-3 → Hover states on surface-2 elements, skeleton shimmers, track fills
surface-4 → Active/pressed states, hover on surface-3 elements
```

**The rule:** If a component renders as a card/widget/panel on the page, its background is `bg-surface-2`, NOT `bg-surface-1`. If you add `bg-surface-1` to a non-overlay component, the pre-publish audit will flag it.

To add a legitimate exception, add the filename to `SURFACE1_ALLOWLIST` in `scripts/pre-publish-audit.mjs` with a comment explaining why.

## Publishing

**Day-to-day:** Add a `.changeset/*.md` file → push/merge to `main` → `changesets/action` opens a Version Packages PR → review + merge → `.github/workflows/release.yml` publishes via OIDC Trusted Publisher (sigstore provenance). **Do not run `npm publish` manually.**

**Authority on gates:** `scripts/pre-publish-audit.mjs` is the single source of truth — 45 hard gates (git clean, version ↔ CHANGELOG match, per-component docs coverage, CVA/doc prop accuracy, typecheck, lint, tests, build, SSR smoke, surface/shadow token hygiene, TW4 migration hygiene, published-exports ordering, bundle size). It runs in release.yml's Audit step before publish AND can be invoked locally (`node scripts/pre-publish-audit.mjs`) for pre-flight checks.

**Human judgment lives on the Version Packages PR.** See `/publish-release` for the reviewer checklist (changeset body quality, bump magnitude, Chromatic review, Storybook spot-check). CI can't evaluate these — they gate on merge.

**When CI is broken:** Use `/publish-release`'s emergency manual runbook. Not optional gates — every one still runs locally before publish. The Iron Law ("NO PUBLISHING WITHOUT EVERY GATE PASSING") applies regardless of who's pressing the button.

**Auth state (2026-04-21+):** OIDC Trusted Publisher is active. `NPM_TOKEN` is no longer set; release.yml requires `id-token: write` permission and npm 11.5.1+ (the workflow bootstraps npm 11 before the publish step). See commits `79d60a8c`, `1f23742c`, `2c1f6ee0` for the saga that got us here.

**If docs slip past a publish** (happened with 0.36.0's llms.txt gap): publish a patch immediately. Don't wait.

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
