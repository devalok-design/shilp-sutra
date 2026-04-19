# Tailwind 4 Native Migration — 0.37.0

**Status:** Draft v3 (post-council-review), awaiting approval to execute
**Target release:** 0.37.0 (minor bump on 0.x = breaking allowed)
**Authored:** 2026-04-19, in response to Karm's TW4 compat blockers
**Revision history:**
- v1 (draft) — initial phased plan
- v2 (2026-04-19) — self-audit revisions: `@source` glob, primitives architecture, acceptance criteria, Storybook audit, RC path, engines
- v3 (2026-04-19) — **post agent-council review (5 experts, 2 rounds).** Council verdict was split between "ship with revisions" and "stop-and-rework." All blocking preconditions from the council are now incorporated. See §0 for the new pre-migration phase.

## 0. Why this is v3 — council findings that reshape the plan

Five expert reviewers (Tailwind architect, npm distribution, DX/migration, Next.js/Turbopack, supply-chain/release) reviewed v2 across two rounds. Summary of what changed in v3:

1. **NEW Phase −1 (release infrastructure prerequisites).** v2 assumed the release path was sound. It isn't: `release.yml` doesn't actually invoke `pre-publish-audit.mjs` or `consumer-smoke-test.mjs`, so every "HARD gate" in v2 was social, not mechanical. Token is exposed. Exports field has type-ordering bugs. All fixed before we touch any TW4 work.
2. **NEW Phase 0 (externalization spike).** Next.js expert identified a 30-min spike that could eliminate the entire CJS-bridge problem — externalize `use-sync-external-store` in Vite config. If it works, we drop the Node ≥22.12 requirement, the `engines` field, the postinstall assert, and the `process.getBuiltinModule` patch. Running this BEFORE the migration is far cheaper than shipping an engine floor we didn't need.
3. **framer-motion + sonner move from `dependencies` to `peerDependencies`.** Four of five experts independently flagged that module-scoped React contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`, `Toaster`) break if consumer and DS resolve to different copies. In Next.js App Router + pnpm strict hoisting, this is virtually guaranteed with mismatched versions.
4. **RC flow switches to Changesets pre-mode.** Hand-rolled `npm version 0.37.0-rc.0` + `npm publish --tag next` collides with Changesets' auto-action. Use `pnpm changeset pre enter next` instead.
5. **z-index namespace fixed:** `--z-*`, not `--z-index-*`. TW4 generates `z-popover` from `--z-popover`. v2 had this wrong; primitives.css already uses `--z-*` so this is just a documentation bug, not a source change.
6. **Rollback playbook becomes a script, not prose.** `npm deprecate` does NOT flip `latest` — it only adds an install-time warning. Real rollback requires `npm dist-tag add @devalok/shilp-sutra@0.36.1 latest`. `latest-0.36` dist-tag must be set explicitly BEFORE publishing 0.37.0, not aspirationally.
7. **Deprecated JS preset stub emits `console.warn` on import** + a Claude-readable named-export error message. Silent no-op is the worst UX.
8. **MIGRATION.md gets a worked collision example** (consumer `--spacing-4` collision is the real risk; `--font-sans` is rare), a mandatory dark-mode sanity check step, and a framer-motion single-copy verification callout.
9. **CI smoke matrix expands** to one Next 16 + Turbopack full job AND one Next 15 + Webpack minimal install-and-import job. Covers both current bundler realities.
10. **Package `exports` `types` ordering fixed** — v2 missed that our current package.json has 100+ subpath entries with `types` listed AFTER `import`/`default`. TS `moduleResolution: "bundler"/"node16"` silently falls back to `.js`. This is a pre-existing bug that the migration must fix.

## 1. Problem (unchanged from v2)

We shipped Tailwind 4 "support" in 0.34.0 via a codemod run over source plus a `peerDependencies` loosening to `^3.4.0 || ^4.0.0`. That was a **syntax migration, not an architecture migration**. Today we are:

- Still a TW3-style JS-preset package, consumed via the TW4 `@config` legacy-compat directive.
- Shipping tokens as `:root { --x: ... }` with a JS preset that re-maps them to Tailwind theme paths.
- Producing class-name artifacts that TW4 silently drops (invalid CSS) because bracket-form CSS vars `w-[--x]` are not a valid TW4 pattern.
- Relying on `theme(spacing.4)` inside arbitrary values — a helper removed in TW4.
- Emitting a Node-only `import from 'module'` into a "use client" chunk, failing Turbopack.
- Missing 4 runtime deps in our dependency declarations (`class-variance-authority`, `clsx`, `framer-motion`, `sonner`) — breaks consumer typecheck AND risks duplicate-copy hell for the context-bearing ones.

Karm is on the TW4 branch with all of the above blocking.

**0.37.0 is the correct version to do this properly** — we're pre-1.0, our version policy permits breaking changes at the minor level, and the setup-side break is isolated to consumer CSS + config.

## 2. Target end state

A consumer on Next.js 16 + Tailwind 4 + Turbopack installs `@devalok/shilp-sutra@^0.37.0` and writes:

```css
/* app/globals.css */
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

That is the DS portion of their setup. Their own theme extensions, plugins, and content globs go in the same `globals.css` via TW4-native directives. **No `tailwind.config.ts` required from us.** They may keep one for their own plugins, but nothing in our flow reads it.

Their `package.json` peers (after following MIGRATION.md) include:
```json
{
  "peerDependencies": {
    "framer-motion": "^12.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```
(framer-motion is shared-state; consumer must control the version.)

Inside our package:

- `packages/core/src/tokens/` contains CSS files using `@theme`, `@utility`, `@custom-variant`, `@source` — TW4-native.
- The legacy JS preset at `./tailwind` is a deprecated stub that `console.warn`s on import and throws a Claude-readable named error if called.
- Dist JS uses Rolldown-externalized `use-sync-external-store` (if spike succeeds) OR the `process.getBuiltinModule` bridge (if spike fails).

## 3. Scope — what changes, what doesn't

### Changes

| Area | Change |
|---|---|
| `packages/core/package.json` `exports` | **Fix `types` ordering** across all 100+ subpath entries. `types` must come FIRST in each conditional block. Pre-existing bug; the migration must fix it. |
| `packages/core/package.json` `peerDependencies` | Add `framer-motion ^12.38.0` (required — shared-state motion contexts). Add `sonner ^2.0.7` (optional — consumer without toasts doesn't need it). Change `tailwindcss` from `^3.4.0 \|\| ^4.0.0` to `^4.0.0`. |
| `packages/core/package.json` `peerDependenciesMeta` | `sonner: { optional: true }`. `framer-motion` required (no meta). |
| `packages/core/package.json` `dependencies` | Add `class-variance-authority ^0.7.1` and `clsx ^2.1.1` only (stateless, duplicate-copy safe). |
| `packages/core/package.json` `engines` | **Conditional on Phase 0 outcome.** If externalization spike succeeds: omit `engines`. If it fails: add `"engines": { "node": ">=22.12.0" }` + runtime check. |
| `packages/core/package.json` `publishConfig` | Add `{ "provenance": true }` for SLSA attestation. |
| `packages/core/src/tokens/primitives.css` | **Stays in `:root { }`** (plain CSS vars, NOT `@theme`). Keep `.dark { }` overrides. |
| `packages/core/src/tokens/semantic.css` | `:root { }` → `@theme { }` for surface/color/status/link/ease/duration/radius/shadow/z/breakpoint tokens. Meta-tokens (`--action-*-opacity`, `--shadow-color`, `--shadow-strength`) **stay in `:root`**. `.dark { }` + `@media (forced-colors)` blocks kept. |
| `packages/core/src/tokens/typography.css` | `@font-face` declarations stay as plain CSS. |
| `packages/core/src/tokens/typography-semantic.css` | Typography tokens → `@theme` with renames: `--font-size-*` → `--text-ds-*`, `--line-height-*` → `--leading-ds-*`. `--tracking-*`, `--font-weight-*`, `--font-*` (families) already match TW4. |
| New: `packages/core/src/tokens/utilities.css` | All `addUtilities` content from `preset.ts` rewritten as `@utility` blocks. |
| New: `packages/core/src/tokens/variants.css` | `@custom-variant dark (&:where(.dark *));` |
| New: `packages/core/src/tokens/base.css` | `@property --border-angle` + iOS font-size `@media` fix, wrapped in `@layer base { }`. |
| New: `packages/core/src/tokens/animations.css` | `@keyframes` for processing-ants, skeleton-shimmer, etc. + `@theme { --animate-* }` entries. |
| New: `packages/core/src/tokens/shilp-sutra.css` | Consumer entry point. `@import`s everything + declares `@source "@devalok/shilp-sutra"` (package-form, primary). |
| `packages/core/src/tailwind/preset.ts` | 514 → ~20 lines. Empty `Partial<Config>` + `console.warn` at import + `@deprecated` JSDoc + named-export error for downstream calls. |
| `scripts/inject-use-client.mjs` | **Conditional on Phase 0.** If spike succeeds: no change needed (rolldown-runtime patch becomes unnecessary). If it fails: `process.getBuiltinModule` + strip `"use client"` + `@layer base` guards as before. |
| Source files (sidebar.tsx, etc.) | TW3 class leftovers fixed: `w-[--x]` → `w-(--x)`, `theme(spacing.4)` → `1rem`, `bg-gradient-*` → `bg-linear-*`, bare `shadow`/`rounded` → explicit. |
| `tests/smoke-consumer/` | TW4-native setup, no `tailwind.config.ts`. |
| New: `tests/smoke-consumer-next15/` | Next 15 + Webpack minimal install-and-import variant. |
| `scripts/consumer-smoke-test.mjs` | Runs both smoke consumers. Grep-verifies generated CSS contains expected utility rules. |
| `scripts/pre-publish-audit.mjs` | Extended with TW4 migration hygiene gates. |
| `.github/workflows/release.yml` | **Wired to invoke `pre-publish-audit.mjs` AND `consumer-smoke-test.mjs` as required steps.** Publish step depends on both passing. Disabled on `next`/RC tags to prevent auto-publish during prerelease mode. |
| `.github/workflows/release.yml` auth | Switch to OIDC trusted publishing (requires `id-token: write` permission). Removes long-lived NPM_TOKEN dependency. |
| `packages/core/.storybook/` | Storybook's TW setup migrated (see Phase 0.5). |
| `README.md` | Setup section rewritten. |
| `packages/core/llms.txt` + `llms-full.txt` | Setup section rewritten. BREAKING + NEW blocks added. |
| New: `MIGRATION.md` (repo root) | Full consumer migration guide with collision examples, dark-mode verification, framer-motion single-copy check, Node requirement (if any). |
| New: `docs/rollback.md` | Rollback playbook as executable commands, not prose. |

### Non-changes

- **Component source APIs**: props, variants, imports — unchanged.
- **2393 vitest unit tests**: no expected changes.
- **Dist JS bundle structure**: entries, chunks, types — unchanged shape.
- **Chromatic baseline**: target zero visual diffs; explicit review on any diff.
- **Radix primitives, form wiring, a11y features**: untouched.
- **Dark mode toggle mechanism**: `.dark` class on parent. Unchanged.
- **Brand package**: `@devalok/shilp-sutra-brand` unaffected.

## 4. Locked-in design decisions

### 4.1 Keep the `ds-` namespace on both typography AND spacing
Our spacing tokens (`--spacing-01` through `--spacing-13`) would, if exposed to TW4's default `--spacing-*` namespace, auto-generate `p-01`, `p-02`, ..., `p-13` utilities that collide with consumer's own numeric spacing. v2 caught this for typography; v3 applies it to spacing too.

**Concrete:** our spacing tokens stay on a `ds-` prefix — `--spacing-ds-01` etc. — OR stay entirely in `:root` (not `@theme`), with a separate manually-authored `@utility p-ds-* { padding: --value(--spacing-ds-*); }` functional utility. Decision: **rename to `--spacing-ds-*` in `@theme`** for automatic utility generation. Existing source classes `p-ds-03`, `gap-ds-04`, etc. match exactly.

### 4.2 Primitives stay in `:root { }` — only semantic tokens in `@theme { }`
Unchanged from v2. Four of five experts confirmed. Private palette, not utility-generating.

### 4.3 Dark mode: `.dark`-class-based, descendant-only variant
`@custom-variant dark (&:where(.dark *));` — matches TW3's `darkMode: 'class'` semantics exactly. Acknowledged quirk: `.dark` element itself does not activate `dark:` utilities on itself, only on descendants. Consumers put `.dark` on `<html>` or `<body>`, so always-descendant is fine.

**NEW (v3):** MIGRATION.md includes a mandatory dark-mode sanity check step — render a representative matrix with `.dark` toggled, verify surface cards, solid buttons, borders, and input text all re-theme correctly. Partial dark mode is worse than broken dark mode.

### 4.4 Breakpoints via `@theme` only
Unchanged. Drop JS preset `screens`.

### 4.5 JS preset as deprecated shim with active warning
```ts
// packages/core/src/tailwind/preset.ts (post-migration)
import type { Config } from 'tailwindcss'

/**
 * @deprecated Since 0.37.0. Tailwind 4 uses CSS-first configuration via @theme.
 * Replace `presets: [shilpSutra]` with a CSS `@import "@devalok/shilp-sutra/css"`
 * in your globals.css and delete your tailwind.config.ts. See MIGRATION.md.
 *
 * Scheduled for removal in 0.38.0.
 */
const preset: Partial<Config> = {}

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[@devalok/shilp-sutra] The JS preset at ./tailwind is deprecated in 0.37.0 ' +
    'and will be removed in 0.38.0. See https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md',
  )
}

export default preset
```

### 4.6 `@source` — relative-to-dist (primary), package-form (secondary)
```css
/* shilp-sutra.css, when shipped at dist/tokens/shilp-sutra.css */
@source "../../dist";              /* resolves to the real (non-symlinked) dist path */
@source "@devalok/shilp-sutra";    /* fallback; some bundlers prefer package-form */
```

**Revision from v2:** under pnpm strict-hoist, the CSS file ships inside `.pnpm/@devalok+shilp-sutra@X/node_modules/@devalok/shilp-sutra/dist/tokens/shilp-sutra.css`. The relative path `../../dist` lands on the *actual* dist files every time. Package-form `@devalok/shilp-sutra` works too but depends on the bundler's module-resolution semantics for non-JS specifiers. Declare both; the relative form is the belt, the package-form is the suspenders.

### 4.7 CSS file layout
```
packages/core/src/tokens/
  shilp-sutra.css         ← consumer entry
  primitives.css          ← :root + .dark (NOT @theme)
  semantic.css            ← @theme + .dark + forced-colors
  typography.css          ← @font-face
  typography-semantic.css ← @theme (text/leading/tracking/font-weight)
  base.css                ← @layer base { @property + iOS @media }
  animations.css          ← @keyframes + @theme (--animate-*)
  utilities.css           ← @utility blocks
  variants.css            ← @custom-variant dark
```

### 4.8 RC via Changesets pre-mode, not hand-rolled
```sh
pnpm changeset pre enter next
pnpm changeset                  # create the 0.37 changeset
pnpm changeset version          # produces 0.37.0-next.0
git commit -am 'chore: enter prerelease mode for 0.37'
git push                        # action publishes to @next automatically
# ... iterate with changeset + version commits ...
pnpm changeset pre exit          # when Karm confirms
git commit -am 'chore: exit prerelease mode'
git push                        # action publishes 0.37.0 to @latest
```

Guard: release.yml fails if `.changeset/pre.json` exists on a non-`next`-tagged release.

### 4.9 Drop TW3 peer support
Unchanged. `tailwindcss: "^4.0.0"` only.

### 4.10 Node requirement — deferred to Phase 0 outcome
If the `use-sync-external-store` externalization spike succeeds, no Node floor. If it fails, `engines.node: ">=22.12.0"` PLUS a runtime check in our entry barrel that throws a Claude-readable named error on old Node.

### 4.11 Framer-motion + sonner as peer dependencies
Module-scoped contexts break with duplicate copies. Consumer pins version, not us.

## 5. Execution phases

### Phase −1 — Release infrastructure prerequisites (NEW, 2-3 hours, blocking)

Do this on `main` as a separate work item, shipped as 0.36.2 patch OR merged into the 0.37 branch — your call. Regardless: every item here must be done before RC publish.

#### −1a. Rotate NPM_TOKEN
- Generate fresh npm Automation token (classic).
- `gh secret set NPM_TOKEN --repo devalok-design/shilp-sutra` with new value.
- Revoke old token immediately.
- Also enable npm OIDC trusted publishing (see −1d).

#### −1b. Fix `exports` types ordering
Every subpath in `packages/core/package.json`'s `exports` currently has:
```json
"./ui/button": {
  "import": "./dist/ui/button.js",
  "default": "./dist/ui/button.js",
  "types": "./dist/ui/button.d.ts"
}
```
`types` must come FIRST. Fix all 100+ entries. Script this — do not hand-edit.

#### −1c. Wire pre-publish-audit + consumer-smoke-test into release.yml
Current `release.yml` runs typecheck/test/build/ssr-smoke then `changesets/action publish: pnpm release`. The consumer smoke test is never invoked.

Fix:
```yaml
- name: Pre-publish audit
  run: node scripts/pre-publish-audit.mjs
- name: Consumer smoke (Next 16 + Turbopack)
  run: node scripts/consumer-smoke-test.mjs
- name: Consumer smoke (Next 15 + Webpack)
  run: node scripts/consumer-smoke-test.mjs --variant next15-webpack
- name: Create Release Pull Request or Publish
  # ...now gated on the two steps above
```

Also: add a guard that fails if `.changeset/pre.json` exists on a stable release attempt.

#### −1d. Switch to npm OIDC trusted publishing
- Configure trusted publisher on npmjs.com for `@devalok/shilp-sutra` → github.com/devalok-design/shilp-sutra → workflow `.github/workflows/release.yml`
- Add `permissions: { id-token: write, contents: write }` to release.yml job.
- Add `--provenance` to publish command.
- Keep NPM_TOKEN secret as fallback during cutover; remove after one successful OIDC publish.

#### −1e. Set `latest-0.36` dist-tag on current stable
```sh
npm dist-tag add @devalok/shilp-sutra@0.36.1 latest-0.36
```
This makes it an actual published dist-tag, not aspirational. Consumers can pin via `pnpm add @devalok/shilp-sutra@latest-0.36` if they need the pre-migration version.

#### −1f. Write `docs/rollback.md` as executable script
Not prose. Each scenario gets a copy-pasteable command:
```markdown
## Scenario: 0.37.0 just published and it's catastrophic
### Step 1: demote 0.37 from latest
```sh
npm dist-tag add @devalok/shilp-sutra@0.36.1 latest
```
### Step 2: deprecate 0.37.0
```sh
npm deprecate @devalok/shilp-sutra@0.37.0 "Critical issue, use 0.36.1 or await 0.37.1"
```
### Step 3: (optional, within 72h) unpublish
```sh
npm unpublish @devalok/shilp-sutra@0.37.0
```
```

**Acceptance for Phase −1:**
- NPM_TOKEN rotation verified by a test OIDC publish of a dev tag.
- `exports` types ordering: grep confirms every subpath has `types` as first key.
- release.yml: triggering on a test branch runs pre-publish-audit AND consumer-smoke-test AND fails if either fails.
- `latest-0.36` dist-tag visible in `npm view @devalok/shilp-sutra`.
- rollback.md exists with runnable commands.

---

### Phase 0 — Externalization spike (NEW, 30 min - 4 hours, blocking, time-capped)

Goal: determine whether we can eliminate the rolldown-runtime CJS bridge entirely by externalizing the CJS-requiring deps.

Candidates for externalization (identified by current rolldown-runtime usage):
- `use-sync-external-store` and variants
- Possibly sub-modules of tiptap

Method:
1. Add to `packages/core/vite.config.ts`:
   ```ts
   build: {
     rollupOptions: {
       external: [/^use-sync-external-store/],
     },
   },
   ```
2. Add `use-sync-external-store` to `peerDependencies` with appropriate version.
3. Rebuild. Grep `dist/_chunks/rolldown-runtime.js` for CJS-require markers.
4. Run smoke test.

**Time cap: 4 hours.** If not converged by then, abandon the spike and proceed with the `process.getBuiltinModule` bridge + Node 22.12 floor.

**Decision point at end of Phase 0:**
- **Spike succeeds** → skip rolldown-runtime patch, no `engines`, no postinstall, no Node floor. Update MIGRATION.md accordingly.
- **Spike fails** → keep current `process.getBuiltinModule` approach; add runtime Node-version check in barrel; add `engines` field; document in MIGRATION.md.

**Acceptance:**
- Decision documented in an addendum to this plan.
- Smoke consumer passes under chosen approach.

---

### Phase 0.5 — Storybook setup audit (unchanged from v2, 30 min)

Before touching tokens, audit how Storybook currently loads our CSS. Deliverable: paragraph writeup of Storybook's CSS flow, checked in as addendum.

---

### Phase 1 — Tokens → `@theme` (~2 hours)

Same as v2, with v3 corrections:

**Fixed in v3:**
- Z-index namespace is `--z-*` (not `--z-index-*`). primitives.css already has this — just use the existing names in `@theme`.
- Spacing renamed to `--spacing-ds-*` in `@theme` (not bare `--spacing-*`) to avoid consumer collision.
- Meta-tokens explicitly allowlisted to stay in `:root {}`: `--action-hover-opacity`, `--action-selected-opacity`, `--action-disabled-opacity`, `--action-focus-opacity`, `--action-active-opacity`, `--shadow-color`, `--shadow-strength`, `--color-surface-0` (private), `--border-focus-width`, `--border-focus-offset`.
- Explicit allowlist of namespaces that go in `@theme`: `--color-*`, `--spacing-ds-*`, `--text-ds-*`, `--leading-ds-*`, `--tracking-*`, `--font-weight-*`, `--font-*` (families), `--radius-*`, `--shadow-*`, `--blur-*`, `--ease-*`, `--breakpoint-*`, `--animate-*`.
- **Non-auto-generating namespaces** — live in `:root` AND get custom `@utility` blocks in `utilities.css`: `--z-*` (TW4 has no `--z-*` namespace), `--duration-*` (TW4 has no `--duration-*` namespace). Both sets use semantic names (`z-popover`, `duration-fast-01`) declared via `@utility`.
- `--radius-default` becomes `--radius` (no suffix) so bare `rounded` maps correctly.
- `backgroundImage` gradient tokens go in `--background-image-*` namespace if we want them utility-generating; otherwise stay `:root`.

**Acceptance upgraded from v2:**
- Grep verifications as in v2.
- Smoke test generates expected utilities — grep `.next/static/css/*.css` for:
  ```
  .bg-surface-raised { background-color: var(--color-surface-raised); }
  .text-accent-11    { color: var(--color-accent-11); }
  .text-ds-md        { font-size: var(--text-ds-md); }
  .p-ds-03           { padding: var(--spacing-ds-03); }
  .z-popover         { z-index: var(--z-popover); }
  .animate-skeleton-shimmer { ... }
  ```
- **Dark mode empirical verification** (addresses Tailwind expert's concern): render Alert, Card, Button, Input, Badge, Toast — inspect each class's computed style at both `:root` and `.dark` scopes. Generated CSS must include both scope rules, not just `:root`.

---

### Phase 2 — Custom utilities → `@utility` (~1 hour)
Unchanged from v2. Acceptance verified by greping `.next/static/css/*.css`.

---

### Phase 3 — Variants (~15 min)
Unchanged from v2. Comprehensive dark variant tests in acceptance.

---

### Phase 4 — Package structure (~1 hour)
v2 content + v3 additions:

1. `shilp-sutra.css` with `@source "@devalok/shilp-sutra"`.
2. `package.json` updates:
   - Fix `exports` types ordering (confirmed done in Phase −1b).
   - Add `dependencies`: cva, clsx only.
   - Add `peerDependencies`: framer-motion (required), sonner (optional). Update `tailwindcss` to `^4.0.0`.
   - `publishConfig.provenance: true`.
   - `engines` conditional on Phase 0 outcome.
3. Preset.ts → stub with `console.warn` + `@deprecated`.
4. Storybook migration.

**Acceptance:** unchanged from v2.

---

### Phase 5 — Source class fixes (~45 min)
Unchanged from v2.

---

### Phase 6 — Runtime fixes (~30 min, conditional)

- If Phase 0 spike succeeded: no rolldown-runtime patch needed. Remove or simplify `inject-use-client.mjs` rolldown section.
- If Phase 0 spike failed: keep `process.getBuiltinModule` patch from the earlier session + add runtime Node version check at the entry barrel.

Deps: verify cva/clsx in `dependencies`, framer-motion/sonner in `peerDependencies`.

**Acceptance:** smoke consumer passes. Grep `dist/**/*.js` for `import [^;]* from 'module'` → 0 matches (regardless of which branch we took).

---

### Phase 7 — Docs (~2 hours)

v2 content + v3 additions:

1. **MIGRATION.md** (NEW, repo root) — substantially expanded from v2:
   - Before/after globals.css diff.
   - Before/after tailwind.config.ts deletion.
   - **Worked collision example**: "If you define `--spacing-4` in your own `@theme`, it collides with our spacing tokens. Here's the cascade and how to override."
   - **Dark mode sanity check** — step-by-step visual verification consumers must run.
   - **framer-motion single-copy verification** — `pnpm why framer-motion` output interpretation. What to do if you see two versions.
   - **Plugin migration** — `@plugin "@tailwindcss/typography"` syntax.
   - **Content globs** — `@source "./app/**/*.tsx"` if consumer has non-default paths.
   - **Node requirement** — top of document, first line if applicable.
   - **Troubleshooting** — top 5 misconfigurations + exact error message + fix.

2. **CHANGELOG.md** (both root and `packages/core/`) — BREAKING + NEW sections, with the Node requirement (if any) on its own line, with a direct link to MIGRATION.md#node.

3. **CLAUDE.md** — Tailwind 4 Architecture section.

4. **`docs/rollback.md`** — done in Phase −1 as executable commands.

**Acceptance — fresh-reader protocol:**
- **Assignee:** Goutham or Yogin (non-TW4-onboarded designers per memory).
- **Setup:** fresh Next 16 app, clone in, follow MIGRATION.md from scratch.
- **Metric:** time-to-green. If >15 min or any unassisted stall, MIGRATION.md gets rewritten before RC publish.
- **Evidence:** screen recording (or dated text log).

---

### Phase 8 — Audit gates (~1 hour)
v2 content + v3 additions:

**NEW gates:**
- `.changeset/pre.json` MUST exist on RC-tagged publishes, MUST NOT exist on stable-tagged publishes.
- `packages/core/package.json` `exports` types-first ordering verified via script.
- `npm pack --dry-run` output inspected: `shilp-sutra.css` MUST be in tarball file list.
- framer-motion + sonner MUST be in `peerDependencies`, NOT `dependencies`.
- **Stored reference CSS snapshot**: after a successful build, save a snapshot of generated utility rules. Subsequent builds must match (or the diff is explicitly reviewed). Catches silent utility-generation regressions.

**Acceptance:** all gates green AND invoked by release.yml (verified by `gh workflow view`).

---

### Phase 9 — Release

Revised from v2 to use Changesets pre-mode:

1. **Enter prerelease mode** on the migration branch:
   ```sh
   pnpm changeset pre enter next
   ```
2. Write the changeset (minor bump, detailed breaking notes).
3. Commit the migration + changeset + `pre.json` state file.
4. Open PR to main.
5. PR merges → release.yml runs (with wired gates) → Changesets publishes `0.37.0-next.0` to `@next` dist-tag automatically.
6. Karm runs `pnpm add @devalok/shilp-sutra@next` following MIGRATION.md.
7. Iterate: any fixes → new commits → new `0.37.0-next.N` publish.
8. **When Karm confirms green:**
   ```sh
   pnpm changeset pre exit
   git commit -am 'chore: exit prerelease mode'
   git push
   ```
9. Release.yml publishes `0.37.0` to `@latest`.

**Karm agent prompt (explicit copy for their Claude):**
```
Migrate Karm to @devalok/shilp-sutra@next following MIGRATION.md.

Steps:
1. pnpm add @devalok/shilp-sutra@next
2. Read MIGRATION.md at https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md
3. Update app/globals.css per the "Before/After" section
4. Delete tailwind.config.ts unless you have your own plugins/theme (in that case simplify per the "Consumer Plugins" section)
5. Run `pnpm why framer-motion` and verify only ONE version shows
6. Run `pnpm build` — should succeed with zero warnings referencing shilp-sutra
7. Run dark mode sanity check from MIGRATION.md#dark-mode
8. Report: paste the output of `pnpm why framer-motion` + any warnings from build
```

**Acceptance:**
- `npm view @devalok/shilp-sutra@0.37.0` fresh.
- Karm confirms green with paste of `pnpm why framer-motion` showing single version.
- Issue #30 closed with link to 0.37.0.

### 9a. Post-publish — file DS Notice on Karm

**Required for every breaking release.** Within 1 business day of stable publish, invoke `/send-karm-notice` to file an issue on `devalok-design/karm` with label `shilp-sutra-ai-agent-feedback`:

```markdown
Title: [DS Notice] @devalok/shilp-sutra@0.37.0 — Tailwind 4 CSS-first migration

## Type
migration-required

## Affects
- Component(s): all (setup-only; component APIs unchanged)
- Current version: @devalok/shilp-sutra@0.36.1
- Target version: @devalok/shilp-sutra@0.37.0

## Description
0.37 completes the TW3→TW4 migration. JS preset removed; `@theme` CSS-first.
framer-motion is now a required peer dep (was bundled). sonner is optional peer.

## Action Required
See MIGRATION.md#v0370--tailwind-4-css-first-migration for before/after
globals.css diff, peer-install steps, dark-mode sanity check, and framer-motion
single-copy verification.

## Timeline
immediate (current TW4 blockers resolved by this release)
```

Do NOT skip this step for "pre-coordinated" consumers — the DS Notice creates the durable record other future consumers search against.

## 6. Risks + mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Externalization spike fails | Medium | Keep Node 22.12 floor + `getBuiltinModule` bridge | Time-capped spike; fallback path ready |
| framer-motion duplicate copies at consumer | High if not peer | Silent animation breakage, hydration mismatches | Declared peer. MIGRATION.md has single-copy check. Runtime warn if two `MotionConfig` contexts registered. |
| `@source "@devalok/shilp-sutra"` package-form breaks on some bundler | Low | Classes not picked up | Empirical verification in Phase 4 smoke. Fallback to explicit glob. |
| Changesets pre-mode footguns | Medium | Stable release with prerelease state | Workflow guards on `pre.json` presence vs tag. |
| Karm Node version < 22.12 (if spike fails) | Medium | Runtime failure | Runtime assert throws named error on import. Docs clear. Pin option (`@latest-0.36`) real. |
| TW4 spec ambiguity (e.g., `.dark` overrides of `@theme`) | Low | Dark mode broken | Empirical verification in Phase 1 + Phase 3 acceptance. |
| NPM_TOKEN still tainted by accident | Low after rotation | Compromised publish | Rotation in Phase −1a. OIDC removes token entirely. |
| CI gates bypass / flaky | Medium | Bug ships despite "gate" | Phase −1c wires them as required steps. Every gate has an explicit `gh workflow run`-verified test. |
| Rollback misunderstood | Medium | Bad version stays as `@latest` | rollback.md has runnable commands, not prose. |
| Consumer smoke passes on Windows but fails on Linux CI | Medium | CI realities differ from dev | Phase −1c runs smoke in CI matrix. |
| Next 15 Webpack consumers break unseen | Medium | Broader blast radius | Phase 8 adds Next 15 + Webpack smoke variant. |
| Edge runtime (if spike fails) | Low (Karm unlikely uses edge for DS pages) | Route-handler cold-start throw | Document limitation. Consumers opt out of edge for pages using tiptap. |

## 7. Rollback plan

Moved to executable `docs/rollback.md` per Phase −1f. Summary: `npm dist-tag add ... latest` for real rollback, `npm deprecate` as additional warning, `npm unpublish` within 72h only.

## 8. Success criteria

- **Technical:** smoke consumers (both Next 16 + Turbopack AND Next 15 + Webpack) pass end-to-end; generated CSS contains all expected utility rules; pre-publish audit all green; 2393 vitest tests pass; Chromatic zero-diff or explicitly re-baselined.
- **Consumer:** Karm migrates with documented steps + `pnpm why framer-motion` shows single version. Dark mode sanity check passes.
- **Process:** release.yml invokes all gates; OIDC publishing; rollback playbook runnable; next migration benefits from infra improvements.

## 9. Resolved open questions

- **Storybook setup** — Phase 0.5.
- **Codemod vs doc** — MIGRATION.md only (Karm is sole real consumer).
- **Granular subpath exports** — deferred.
- **RC distribution** — Changesets pre-mode + `@next` tag.
- **TW3 peer support** — dropped.
- **Node engines** — conditional on Phase 0 spike.
- **framer-motion, sonner** — peerDependencies.
- **cva, clsx** — dependencies (stateless).
- **NPM_TOKEN rotation** — Phase −1a before anything else.
- **Provenance/OIDC** — Phase −1d.
- **Rollback playbook** — Phase −1f as `docs/rollback.md`.
- **Fresh-reader test** — Goutham or Yogin, screen-recorded, 15-min cap.
- **`@source` form** — package-form primary.
- **z-index namespace** — `--z-*`.
- **spacing namespace** — `--spacing-ds-*`.

## 10. Out of scope

- Variant vocabulary unification
- RTL support
- Forced-colors 2nd pass
- Component API changes
- Dropping React 18 peer
- dts bundling

## 11. Time estimate

- Phase −1: 2-3 hours (can be parallelized)
- Phase 0: 0.5-4 hours (time-capped)
- Phase 0.5: 30 min
- Phase 1-8: 7-8 hours
- Phase 9: 45 min + Karm dry-run wait (variable, ideally <1 day)

**Total focused work: 12-17 hours across 1-3 days.** Plus dry-run window.

## 12. Done when

- [ ] Phase −1 complete: token rotated, gates wired, exports fixed, rollback doc exists, latest-0.36 set.
- [ ] Phase 0 decision documented (spike result).
- [ ] Branch merged to main via Version Packages PR.
- [ ] `npm view @devalok/shilp-sutra@0.37.0 version` returns 0.37.0.
- [ ] Karm confirms green with `pnpm why framer-motion` single version.
- [ ] Issue #30 + related closed.
- [ ] CLAUDE.md updated.
- [ ] MIGRATION.md read + time-to-green verified by Goutham/Yogin.
- [ ] OIDC publish used (not NPM_TOKEN).
- [ ] All 12+ audit gates invoked by release.yml.

---

*v1 drafted 2026-04-19. v2 self-audited same day. v3 post-agent-council review (5 experts, 2 debate rounds) same day. Estimated 12-17 hours total, sequenced across Phase −1 through Phase 9.*
