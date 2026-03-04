# Package Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split @devalok/shilp-sutra into 3 npm packages (core, brand, karm) with pnpm workspaces, fix all quality issues, and update Storybook.

**Architecture:** Convert flat repo to pnpm workspace monorepo with packages/core, packages/brand, packages/karm. Each package gets its own package.json, vite.config.ts, tsconfig.json. Storybook stays at root.

**Tech Stack:** pnpm workspaces, Vite 5.4 library mode, vite-plugin-dts, TypeScript 5.7

---

### Task 1: Create workspace infrastructure

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `packages/core/package.json`
- Create: `packages/brand/package.json`
- Create: `packages/karm/package.json`
- Modify: `package.json` (root — convert to workspace root)

**Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

**Step 2: Create packages/core/package.json**

Core package with all ui, composed, shell, tokens, tailwind exports. Dependencies: everything currently in root package.json dependencies EXCEPT @dnd-kit/*, react-markdown, date-fns (those move to karm).

**Step 3: Create packages/brand/package.json**

Brand package with devalok/karm logo exports. Minimal deps: just react peer dep + clsx + tailwind-merge (for cn utility).

**Step 4: Create packages/karm/package.json**

Karm package with all 6 sub-module exports. Dependencies: @dnd-kit/*, react-markdown, date-fns, @tabler/icons-react, class-variance-authority. Peer dep on @devalok/shilp-sutra.

**Step 5: Convert root package.json to workspace root**

Remove library-specific fields (exports, files, sideEffects), keep devDependencies and scripts. Add `"private": true`.

**Step 6: Commit**

```
feat: add pnpm workspace infrastructure for 3-package split
```

---

### Task 2: Move source files to package directories

**Step 1: Move core sources**

Move to `packages/core/src/`:
- `src/ui/` → `packages/core/src/ui/`
- `src/composed/` → `packages/core/src/composed/`
- `src/shell/` → `packages/core/src/shell/`
- `src/tokens/` → `packages/core/src/tokens/`
- `src/tailwind/` → `packages/core/src/tailwind/`
- `src/hooks/` → `packages/core/src/hooks/`
- `src/primitives/` → `packages/core/src/primitives/`
- `src/css-modules.d.ts` → `packages/core/src/css-modules.d.ts`
- `src/vitest-axe.d.ts` → `packages/core/src/vitest-axe.d.ts`
- `src/test-setup.ts` → `packages/core/src/test-setup.ts`

**Step 2: Move brand sources**

Move to `packages/brand/src/`:
- `src/brand/brand.config.ts` → `packages/brand/src/brand.config.ts`
- `src/brand/devalok/` → `packages/brand/src/devalok/`
- `src/brand/karm/` → `packages/brand/src/karm/`
- `src/brand/assets/` → `packages/brand/src/assets/` (SVGs only, exclude PNGs from build)

**Step 3: Move karm sources**

Move to `packages/karm/src/`:
- `src/karm/board/` → `packages/karm/src/board/`
- `src/karm/tasks/` → `packages/karm/src/tasks/`
- `src/karm/chat/` → `packages/karm/src/chat/`
- `src/karm/dashboard/` → `packages/karm/src/dashboard/`
- `src/karm/client/` → `packages/karm/src/client/`
- `src/karm/admin/` → `packages/karm/src/admin/`
- `src/karm/index.ts` → `packages/karm/src/index.ts`
- `src/karm/page-skeletons.tsx` → `packages/karm/src/page-skeletons.tsx`

**Step 4: Commit**

```
refactor: move source files to workspace package directories
```

---

### Task 3: Create build configs for each package

**Files:**
- Create: `packages/core/vite.config.ts`
- Create: `packages/core/tsconfig.json`
- Create: `packages/brand/vite.config.ts`
- Create: `packages/brand/tsconfig.json`
- Create: `packages/karm/vite.config.ts`
- Create: `packages/karm/tsconfig.json`

**Step 1: Core vite.config.ts**

Based on existing root vite.config.ts. Entry points: ui, composed, shell, tailwind. Externals: all current externals. Alias @primitives to src/primitives.

**Step 2: Brand vite.config.ts**

Entry points: index, devalok/index, karm/index. Externals: react, react-dom. Exclude PNGs from JS bundle — copy raw SVGs/PNGs to dist/assets via post-build script.

**Step 3: Karm vite.config.ts**

Entry points: index, board/index, tasks/index, chat/index, dashboard/index, client/index, admin/index. Externals: react, react-dom, all @devalok/shilp-sutra imports, @dnd-kit/*, @tabler/icons-react, react-markdown, date-fns, class-variance-authority, clsx, tailwind-merge.

**Step 4: tsconfig.json for each package**

Based on root tsconfig.json with appropriate rootDir/outDir paths.

**Step 5: Commit**

```
feat: add vite and tsconfig for core, brand, karm packages
```

---

### Task 4: Fix import paths after move

**Step 1: Fix karm imports**

Karm components import from `../../ui/*`, `../../composed/*`, `../../hooks/*`. After the move, these need to reference the core package: `@devalok/shilp-sutra/ui` or use workspace protocol imports.

Strategy: In karm's vite.config.ts, alias `@/ui` → core's src/ui, `@/composed` → core's src/composed, `@/hooks` → core's src/hooks for dev. In published build, externalize all `@devalok/shilp-sutra` imports.

**Step 2: Fix brand imports**

Brand imports `cn` from `../../ui/lib/utils`. Options:
- Copy cn utility into brand package (it's just clsx + twMerge, 3 lines)
- Or import from `@devalok/shilp-sutra/ui` as peer dep

Simplest: copy the cn utility into brand/src/lib/utils.ts (3 lines, no dependency).

**Step 3: Fix karm's SegmentedControl re-export**

Currently karm/index.ts re-exports from `../ui/segmented-control`. After split, this becomes `@devalok/shilp-sutra` import or we remove the re-export (consumers import directly from core).

**Step 4: Verify all imports resolve**

Run typecheck on each package.

**Step 5: Commit**

```
fix: update import paths for workspace package structure
```

---

### Task 5: Add 'use client' directives to interactive components

**Files to modify** (add `'use client'` as first line):

src/ui/ (30 files):
- `button.tsx`, `accordion.tsx`, `alert-dialog.tsx`, `dialog.tsx`, `sheet.tsx`
- `navigation-menu.tsx`, `tooltip.tsx`, `select.tsx`, `toast.tsx`, `radio.tsx`
- `switch.tsx`, `slider.tsx`, `toggle.tsx`, `toggle-group.tsx`, `menubar.tsx`
- `context-menu.tsx`, `popover.tsx`, `hover-card.tsx`, `collapsible.tsx`, `tabs.tsx`
- `checkbox.tsx`, `avatar.tsx`, `breadcrumb.tsx`, `dropdown-menu.tsx`, `pagination.tsx`
- `progress.tsx`, `label.tsx`, `separator.tsx`, `aspect-ratio.tsx`, `link.tsx`
- `transitions.tsx`, `stepper.tsx`, `form.tsx`, `autocomplete.tsx`, `button-group.tsx`
- `tree-view/tree-view.tsx`, `tree-view/tree-item.tsx`

**Step 1: Add directive to all files**

Prepend `'use client'` + newline to each file that doesn't have it.

**Step 2: Verify build still works**

Run: `pnpm build` in packages/core

**Step 3: Commit**

```
fix: add 'use client' directives to all interactive components
```

---

### Task 6: Create LICENSE file and update README

**Files:**
- Create: `LICENSE`
- Modify: `README.md`

**Step 1: Create MIT LICENSE**

Standard MIT license with "Devalok Design & Strategy Studios" as copyright holder.

**Step 2: Update README**

- Fix import paths: `/shared` → `/composed`, `/layout` → `/shell`
- Add 3-package installation section
- Add credits/acknowledgments section
- Update package exports table for all 3 packages

**Step 3: Update package.json license field**

Change from `"UNLICENSED"` to `"MIT"` in all 3 package.jsons.

**Step 4: Commit**

```
docs: add MIT license, fix README import paths, add credits
```

---

### Task 7: Clean up dist output

**Step 1: Exclude Storybook files from dist**

In each vite-plugin-dts config, exclude `**/*.stories.tsx`, `**/*.mdx`, `**/test-setup.ts`, `**/scripts/**`.

In vite build config, ensure `.mdx` files are not copied to dist/tokens/.

Update copy-tokens.mjs to exclude .mdx and showcase .tsx files.

**Step 2: Remove _registerSvg from public exports**

In `packages/brand/src/devalok/index.ts` and `packages/brand/src/karm/index.ts`, remove `_registerSvg` and `_registerKarmSvg` from exports.

**Step 3: Exclude PNG.js files from brand build**

Configure brand's vite.config.ts to not process PNG imports as JS modules. Instead, copy raw SVG/PNG assets to dist/assets/ via a build script.

**Step 4: Commit**

```
fix: clean dist output — exclude storybook files, internal helpers, PNG.js
```

---

### Task 8: Update Storybook configuration

**Files:**
- Modify: `.storybook/main.ts` — update story globs for packages/
- Modify: `.storybook/preview.ts` — fix nav sort order (Shared→Composed, Layout→Shell)
- Modify: `.storybook/vite.config.ts` — update aliases for new paths
- Modify: `src/composed/Introduction.mdx` → update if title changes
- Modify: `src/shell/Introduction.mdx` → update if title changes

**Step 1: Update story glob paths**

```ts
stories: ['../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)', '../packages/*/src/**/*.mdx']
```

**Step 2: Fix preview.ts imports**

Update import paths for tokens and components to reference packages/core/src/.

**Step 3: Fix vite.config.ts aliases**

Point @primitives, @ etc. to packages/core/src/.

**Step 4: Fix nav sort order**

Replace `Shared` → `Composed`, `Layout` → `Shell` in storySort.

**Step 5: Commit**

```
fix: update Storybook config for workspace package paths
```

---

### Task 9: Add Storybook About page

**Files:**
- Create: `packages/core/src/About.mdx`

**Step 1: Create About.mdx**

Based on docs/design-philosophy.md content. Include:
- Devalok Design & Strategy Studios introduction
- Shilp Sutra philosophy
- Credits section
- Architecture diagram

**Step 2: Add to storySort**

Add "About" section to preview.ts storySort, after "Getting Started".

**Step 3: Commit**

```
docs: add About page to Storybook with credits
```

---

### Task 10: Update root workspace scripts and verify

**Step 1: Update root package.json scripts**

```json
{
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "pnpm -r build",
    "build:core": "pnpm --filter @devalok/shilp-sutra build",
    "build:brand": "pnpm --filter @devalok/shilp-sutra-brand build",
    "build:karm": "pnpm --filter @devalok/shilp-sutra-karm build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "build-storybook": "storybook build"
  }
}
```

**Step 2: Run full verification**

- `pnpm install` (workspace linking)
- `pnpm typecheck` (all packages)
- `pnpm test` (all packages)
- `pnpm build` (all packages)
- `pnpm dev` (Storybook loads)

**Step 3: Final commit**

```
feat: complete workspace setup — all packages build, test, typecheck
```

---

### Task 11: Update CHANGELOG and memory

**Step 1: Add CHANGELOG entry**

Add to [Unreleased] section:
- Package split into @devalok/shilp-sutra, @devalok/shilp-sutra-brand, @devalok/shilp-sutra-karm
- Added MIT license
- Added 'use client' to all interactive components
- Fixed README documentation

**Step 2: Update project memory**

Update MEMORY.md with package split completion.

**Step 3: Commit**

```
docs: update CHANGELOG and project memory for package split
```
