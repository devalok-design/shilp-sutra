# Vite 7 + Storybook 10 Upgrade Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade from Vite 5 + Storybook 8 to Vite 7 + Storybook 10, fixing the broken test suite (vitest 4 requires Vite 7) and gaining Storybook's 2-3x lighter install, built-in Vitest integration, and ESM-only architecture.

**Architecture:** Phased upgrade — Vite ecosystem first (unblocks tests immediately), then Storybook (automated codemods for ~240 file import changes), then build pipeline verification. Each phase has a hard gate before proceeding.

**Tech Stack:** Vite 7.3.1, @vitejs/plugin-react 5.2.0, Vitest 4.0.18 (already installed), Storybook 10.3.3, storybook-dark-mode 5.0.0

---

## Context: Why This Upgrade

Vitest was upgraded to 4.0.18, which bundles Vite 6/7 as a direct dependency. The rest of the project (build, Storybook, plugins) is still on Vite 5. When vitest's bundled Vite 7 runs tests through `@vitejs/plugin-react@4` (which was built for Vite 5), `react/jsx-dev-runtime` resolution fails — **every test in the repo is broken**. Rather than downgrading vitest, we upgrade the full stack since all major deps now support Vite 7.

## Why Vite 7, not Vite 8

Vite 8 (released March 2026) replaces Rollup with Rolldown — a Rust-based bundler. While all our deps support Vite 8, the Rolldown switch changes build output in ways that could break our `manualChunks` strategy, `inject-use-client.mjs`, and SSR chunk layout. Vite 7 still uses Rollup 4.x (same major as Vite 5), making it a much safer upgrade path. We can evaluate Vite 8 separately once this upgrade stabilizes.

## Vite 6 Breaking Changes (reviewed, not applicable)

We skip from Vite 5 to 7, so Vite 6 breaking changes apply:
- **CSS library mode naming**: Changed default output filename, but we use `cssCodeSplit: true` — not affected.
- **postcss-load-config v6**: We don't have a custom PostCSS config — not affected.
- **`tinyglobby` replacing `fast-glob`**: Our scripts use `node:fs` glob directly — not affected.
- **CJS `strictRequires: true`**: Our CJS output uses esbuild, not Rollup's CJS plugin — not affected.

## Dependency Version Map

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `vite` | 5.4.21 | ^7.3.1 | Core build tool |
| `@vitejs/plugin-react` | ^4.3.4 | ^5.2.0 | Supports Vite 4–8 |
| `vite-plugin-dts` | ^4.5.0 | ^4.5.0 | No change (peer: `*`) |
| `vitest` | ^4.0.18 | ^4.0.18 | No change (already requires Vite 7) |
| `storybook` | ^8.6.0 | ^10.3.3 | Core Storybook |
| `@storybook/react-vite` | ^8.6.0 | ^10.3.3 | Framework package |
| `@storybook/addon-a11y` | ^8.6.0 | ^10.3.3 | Accessibility addon |
| `@storybook/addon-docs` | ^8.6.14 | ^10.3.3 | Docs addon |
| `storybook-dark-mode` | ^4.0.2 | ^5.0.0 | Dark mode (peer: storybook ^10) |
| `@storybook/addon-essentials` | ^8.6.0 | **REMOVE** | Merged into storybook core in SB9 |
| `@storybook/react` | ^8.6.0 | **REMOVE** | Types now from `@storybook/react-vite` |
| `@storybook/test` | ^8.6.0 | **REMOVE** | Now `storybook/test` (subpath of `storybook`) |

## Import Path Migration Map

| Old Import | New Import | File Count |
|------------|------------|------------|
| `from '@storybook/react'` | `from '@storybook/react-vite'` | ~182 story files + preview.ts |
| `from '@storybook/test'` | `from 'storybook/test'` | ~44 story files |
| `from '@storybook/blocks'` | `from '@storybook/addon-docs/blocks'` | ~13 MDX files |
| `from '@storybook/manager-api'` | `from 'storybook/manager-api'` | manager.ts |
| `from '@storybook/theming/create'` | `from 'storybook/theming/create'` | theme.ts |
| `from '@storybook/theming'` | `from 'storybook/theming'` | storybook.css import (if any) |

> **Note:** `@storybook/react` still exists in SB10 as a dependency of `@storybook/react-vite`. It will appear in the lockfile — that's expected. We remove it from `devDependencies` because we no longer import from it directly.

## Risk Registry

| Risk | Severity | Mitigation |
|------|----------|------------|
| Rollup output changes (manualChunks, paths) | HIGH | Diff dist/ before/after, verify chunk names and sizes |
| Post-build scripts assume old chunk names | HIGH | Run full build pipeline, check inject-use-client.mjs output |
| SSR smoke test failures | MEDIUM | Run ssr-smoke-test.mjs explicitly |
| storybook-dark-mode hooks error (#282) | LOW | Test dark mode toggle in Storybook after upgrade |
| MDX docs rendering regression (#33829) | LOW | Spot-check MDX pages in Storybook |
| Storybook automigrate misses edge cases | LOW | Manual review of .storybook/ config after codemod |
| `storybook.css` selectors change in SB10 | MEDIUM | Spot-check dark mode CSS overrides (`.sbdocs`, `.docblock-argstable-*`, `.sb-show-main`) |
| Vite 6 breaking changes (skipped major) | LOW | Reviewed — CSS naming, postcss v6, tinyglobby, CJS strictRequires all inapplicable (see above) |

---

## Phase 1: Vite Ecosystem Upgrade

### Task 1: Snapshot current build output

Before touching anything, capture the current build state for diffing later.

> **Note:** `pnpm build` uses `vite build` (not vitest), so it works even with the current vitest/vite mismatch. Only tests are broken, not builds.

**Files:** None modified

**Step 1: Build and snapshot dist directories**

```bash
pnpm build
```

**Step 2: Record chunk file listing**

```bash
ls -la packages/core/dist/_chunks/ > /tmp/core-chunks-before.txt
ls -la packages/karm/dist/_chunks/ > /tmp/karm-chunks-before.txt
```

**Step 3: Record SSR smoke test baseline**

```bash
node packages/core/scripts/ssr-smoke-test.mjs
```

Expected: PASS (or document current failures)

---

### Task 2: Upgrade Vite and plugin-react

**Files:**
- Modify: `package.json` (root)

**Step 1: Update versions in package.json**

Change these devDependencies:
```json
"vite": "^7.3.1",
"@vitejs/plugin-react": "^5.2.0",
```

(Keep `vite-plugin-dts` at `^4.5.0` — its peer dep is `*`.)

Also bump `engines.node` in root `package.json` and `packages/core/package.json`:
```json
"engines": { "node": ">=20.19.0" }
```
Vite 7 requires Node 20.19+. CI uses Node 22 so no CI changes needed.

**Step 2: Install**

```bash
pnpm install
```

**Step 3: Verify tests now pass**

Run a single fast test first:

```bash
pnpm vitest run packages/core/src/ui/button.test.tsx
```

Expected: PASS (this was broken before due to `react/jsx-dev-runtime` resolution)

**Step 4: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass. If any fail, diagnose before proceeding — don't carry forward test failures.

**Step 5: Verify build**

```bash
pnpm build
```

Expected: Build succeeds. Compare chunk output:
```bash
ls -la packages/core/dist/_chunks/
ls -la packages/karm/dist/_chunks/
```

If chunk names or sizes changed significantly, investigate `manualChunks` behavior under the new Rollup version before proceeding.

**Step 6: Run SSR smoke test**

```bash
node packages/core/scripts/ssr-smoke-test.mjs
```

Expected: PASS

**Step 7: Run post-build audit**

```bash
node scripts/post-build-audit.mjs
```

Expected: No new warnings vs baseline.

**Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: upgrade vite 5→7 and @vitejs/plugin-react 4→5

Vitest 4 requires Vite 7. This aligns the build tooling.
vite: ^5.4.21 → ^7.3.1
@vitejs/plugin-react: ^4.3.4 → ^5.2.0"
```

### GATE: Do not proceed to Phase 2 unless tests pass, build succeeds, and SSR smoke test passes.

---

## Phase 2: Storybook 8 → 10 Upgrade

### Task 3: Upgrade Storybook packages

**Files:**
- Modify: `package.json` (root)

**Step 1: Update Storybook versions in package.json**

```json
"storybook": "^10.3.3",
"@storybook/react-vite": "^10.3.3",
"@storybook/addon-a11y": "^10.3.3",
"@storybook/addon-docs": "^10.3.3",
"storybook-dark-mode": "^5.0.0",
```

Remove these packages:
```
"@storybook/addon-essentials"  (merged into core)
"@storybook/react"             (types now in @storybook/react-vite)
"@storybook/test"              (now storybook/test subpath)
```

**Step 2: Install**

```bash
pnpm install
```

Expect peer dep warnings — that's fine at this stage. The import paths haven't been updated yet.

**Step 3: Commit the version bump**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: upgrade storybook 8→10, remove consolidated packages

storybook: ^8.6.0 → ^10.3.3
@storybook/react-vite: ^8.6.0 → ^10.3.3
@storybook/addon-a11y: ^8.6.0 → ^10.3.3
@storybook/addon-docs: ^8.6.14 → ^10.3.3
storybook-dark-mode: ^4.0.2 → ^5.0.0

Removed (consolidated into storybook core):
- @storybook/addon-essentials
- @storybook/react
- @storybook/test"
```

---

### Task 4: Run Storybook automigrate codemods

The `storybook automigrate` tool handles the bulk import path changes across ~240 files. Run it interactively and review each migration.

**Files:** ~240 story/config files (automated)

**Step 1: Run automigrate**

```bash
npx storybook automigrate
```

This will prompt for each migration. Accept these:
- `consolidated-imports` — bulk import rewrites (the big one)
- `remove-essential-addons` — removes essentials from main.ts
- `renderer-to-framework` — `@storybook/react` → `@storybook/react-vite`
- `initial-globals` — should be a no-op (already done)
- `addon-a11y-parameters` — a11y parameter renames
- `upgrade-storybook-related-dependencies` — should be a no-op (already done)

Skip or review carefully:
- `csf-factories` — new story format, opt-in, not required
- `addon-a11y-addon-test` — merges a11y into test addon, review if wanted
- `eslintPlugin` — adds Storybook ESLint plugin, optional

**Step 2: Review the changes**

```bash
git diff --stat
```

Verify:
- Story files: `@storybook/react` → `@storybook/react-vite`
- Story files: `@storybook/test` → `storybook/test`
- MDX files: `@storybook/blocks` → `@storybook/addon-docs/blocks`
- `.storybook/main.ts`: `@storybook/addon-essentials` removed from addons array

**Step 3: Commit the codemod output**

```bash
git add -A
git commit -m "refactor: apply storybook 10 automigrate codemods

- @storybook/react → @storybook/react-vite (~182 story files)
- @storybook/test → storybook/test (~44 story files)
- @storybook/blocks → @storybook/addon-docs/blocks (~13 MDX files)
- Removed addon-essentials from .storybook/main.ts"
```

---

### Task 5: Manual config fixes (anything automigrate missed)

The automigrate handles most things, but these files need manual review.

**Files:**
- Review: `.storybook/main.ts`
- Modify: `.storybook/manager.ts`
- Modify: `.storybook/theme.ts`
- Review: `.storybook/preview.ts`
- Review: `.storybook/vite.config.ts` (uses `defineConfig` and `__dirname` — Vite 7 still shims these in config files, no changes needed)
- Review: `storybook.css` (uses internal Storybook selectors like `.sbdocs`, `.docblock-argstable-*` — may need updates if SB10 changed class names)

**Step 1: Fix manager.ts imports**

```typescript
// OLD:
import { addons } from '@storybook/manager-api'
// NEW:
import { addons } from 'storybook/manager-api'
```

**Step 2: Fix theme.ts imports**

```typescript
// OLD:
import { create } from '@storybook/theming/create'
// NEW:
import { create } from 'storybook/theming/create'
```

**Step 3: Review preview.ts**

Check that:
- `import type { Preview } from '@storybook/react'` → `'@storybook/react-vite'`
- `import type { Decorator } from '@storybook/react'` → `'@storybook/react-vite'`
- `initialGlobals` is used (not `globals`) — already correct
- `globalTypes` toolbar definition still valid

**Step 4: Review main.ts**

Verify the addons array no longer contains `@storybook/addon-essentials`. Should be:
```typescript
addons: [
  {
    name: '@storybook/addon-docs',
    options: { /* mdx config */ },
  },
  '@storybook/addon-a11y',
  'storybook-dark-mode',
],
```

**Step 5: Check for any remaining old imports**

```bash
grep -r "@storybook/react'" --include="*.tsx" --include="*.ts" packages/ .storybook/ | grep -v node_modules | grep -v "react-vite"
grep -r "@storybook/test'" --include="*.tsx" --include="*.ts" packages/ | grep -v node_modules
grep -r "@storybook/blocks'" --include="*.mdx" packages/ | grep -v node_modules
grep -r "@storybook/manager-api'" --include="*.ts" .storybook/ | grep -v node_modules
grep -r "@storybook/theming" --include="*.ts" .storybook/ | grep -v node_modules | grep -v "storybook/theming"
```

Expected: No results. If any remain, fix them manually.

> **Note:** Exclude `.claude/worktrees/` from all grep searches — those are isolated copies that will be cleaned up separately.

**Step 6: Commit**

```bash
git add .storybook/
git commit -m "fix: manual storybook 10 config migration

- manager.ts: @storybook/manager-api → storybook/manager-api
- theme.ts: @storybook/theming/create → storybook/theming/create
- Verified preview.ts and main.ts are correct"
```

---

### Task 6: Verify Storybook builds and runs

**Step 1: Build Storybook**

```bash
pnpm build-storybook
```

Expected: Builds without errors.

**Step 2: Start Storybook dev server**

```bash
pnpm dev
```

Expected: Storybook opens at localhost:6006.

Spot-check:
- [ ] Sidebar navigation renders with correct hierarchy
- [ ] A story from each package loads (core Button, karm TaskPanel, brand Logo)
- [ ] Dark mode toggle works (storybook-dark-mode addon)
- [ ] Docs tab renders for a component with MDX
- [ ] Controls panel works (change a prop, see it update)
- [ ] A11y addon panel shows results
- [ ] Play function interactions run (pick a story with `play:` defined)
- [ ] Dark mode CSS overrides in `storybook.css` still apply (check docs tables, argstable styling, `.sbdocs` selectors)

**Step 3: Fix any issues found**

Common post-upgrade issues:
- Dark mode addon hooks error → check `storybook-dark-mode` v5 changelog
- MDX rendering blank → verify `@storybook/addon-docs` is in addons array
- Controls not working → essentials removal may need explicit controls config

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve storybook 10 post-upgrade issues"
```

---

## Phase 3: Build Pipeline Verification

### Task 7: Full build pipeline audit

**Files:** None modified (verification only)

**Step 1: Clean build**

```bash
rm -rf packages/core/dist packages/karm/dist packages/brand/dist
pnpm build
```

**Step 2: Compare chunk output**

```bash
ls -la packages/core/dist/_chunks/
ls -la packages/karm/dist/_chunks/
```

Compare against `/tmp/core-chunks-before.txt` and `/tmp/karm-chunks-before.txt`. Verify:
- Same chunk names (vendor-utils, vendor-client, sonner, framer, tiptap, primitives)
- Sizes within ~20% of original (Rollup version changes can shift sizes)
- No unexpected new chunks

**Step 3: Verify "use client" injection**

```bash
head -1 packages/core/dist/ui/button.js
head -1 packages/core/dist/_chunks/vendor-utils.js
head -1 packages/core/dist/_chunks/vendor-client.js
```

Expected:
- `button.js` → starts with `"use client";`
- `vendor-utils.js` → does NOT start with `"use client";`
- `vendor-client.js` → starts with `"use client";`

**Step 4: SSR smoke test**

```bash
node packages/core/scripts/ssr-smoke-test.mjs
```

Expected: PASS

**Step 5: Typecheck**

```bash
pnpm typecheck
```

Expected: PASS. The import path changes might surface type errors if any `@storybook/react` types aren't available from `@storybook/react-vite`.

**Step 6: Lint**

```bash
pnpm lint
```

Expected: PASS

**Step 7: Full test suite**

```bash
pnpm test
```

Expected: All tests pass.

**Step 8: Post-build audit**

```bash
node scripts/post-build-audit.mjs
```

Expected: No new warnings.

---

### Task 8: Fix the karm v3 test motion mock (original issue)

Now that tests are running, apply the motion.button fix that was the original task.

**Files:**
- Modify: `packages/karm/src/tasks/v3/__tests__/task-panel-integration.test.tsx`

**Step 1: The fix is already in the working tree**

The current uncommitted change uses a Proxy-based mock that renders `motion.<tag>` as `<tag>`:

```typescript
return ({ children, ...props }: any) => {
  const filtered = Object.fromEntries(
    Object.entries(props).filter(
      ([k]) =>
        !['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'layout', 'layoutId'].includes(k),
    ),
  )
  const El = tag as any
  return <El {...filtered}>{children}</El>
}
```

**Step 2: Run the specific test**

```bash
pnpm vitest run packages/karm/src/tasks/v3/__tests__/task-panel-integration.test.tsx
```

Expected: PASS

**Step 3: Commit**

```bash
git add packages/karm/src/tasks/v3/__tests__/task-panel-integration.test.tsx
git commit -m "fix(karm): motion mock renders correct HTML element per tag

motion.button now renders <button>, motion.span renders <span>, etc.
Previously hardcoded span/div, breaking getByRole queries."
```

---

## Phase 4: Cleanup

### Task 9: Final verification and cleanup

**Step 1: Check for stale worktree files**

```bash
git status
```

Should be clean.

**Step 2: Check for leftover @storybook/ old imports anywhere**

```bash
grep -r "@storybook/addon-essentials" --include="*.ts" --include="*.tsx" --include="*.json" . | grep -v node_modules | grep -v "\.claude"
grep -r "@storybook/react'" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v "\.claude" | grep -v "react-vite"
```

Expected: No results (except possibly CHANGELOG.md or docs referencing old versions, which is fine).

**Step 3: Verify clean install from scratch**

```bash
rm -rf node_modules packages/*/node_modules
pnpm install
pnpm build
pnpm test
```

Expected: Everything works from a clean state.

---

## Rollback Plan

If the upgrade fails at any phase and can't be resolved:

1. `git log --oneline` to find the last good commit before the upgrade
2. `git branch backup-vite-sb-upgrade` to save the upgrade work for reference
3. `git reset --hard <last-good-commit>` to restore all files and index
4. `pnpm install` to re-resolve old versions from the restored lockfile

The Phase 1 commit (Vite upgrade) is independently valuable — even if Storybook upgrade fails, the Vite upgrade fixes tests. Consider keeping Phase 1 and reverting only Phase 2 if needed:
```bash
git revert --no-commit <phase-2-commits>
git commit -m "revert: storybook 10 upgrade (keeping vite 7)"
```
