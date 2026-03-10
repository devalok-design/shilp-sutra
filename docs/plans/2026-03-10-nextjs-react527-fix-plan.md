# React #527 — Bundle deps to eliminate dual React Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bundle all runtime dependencies into the compiled output so that every `import from "react"` in the published packages comes from files inside the package's own `dist/` directory, eliminating the dual-React problem in Next.js + pnpm.

**Architecture:** Drop `preserveModules` in favor of explicit entry points per exported component. Use `manualChunks` to deduplicate all node_modules deps into a shared `_chunks/vendor.js` chunk, and vendored primitives into `_chunks/primitives.js`. Only React, react-dom, and peer dependencies remain external.

**Tech Stack:** Vite 5.4 (library mode), Rollup 4, pnpm workspaces

**Design doc:** `docs/plans/2026-03-10-nextjs-react527-fix-design.md`

---

### Task 1: Update core vite.config.ts — entry points and chunking

**Files:**
- Modify: `packages/core/vite.config.ts`

**Step 1: Read the current config to confirm state**

Run: `cat packages/core/vite.config.ts`
Confirm it matches the version in the design doc (preserveModules: true, 18+ externals).

**Step 2: Replace the entire vite.config.ts with the new build configuration**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readdirSync } from 'fs'

// ---------------------------------------------------------------------------
// Entry-point generator — replaces preserveModules with explicit entries
// ---------------------------------------------------------------------------
function collectEntries(): Record<string, string> {
  const entries: Record<string, string> = {}

  const scanDir = (srcDir: string, outPrefix: string) => {
    const fullDir = resolve(__dirname, 'src', srcDir)
    for (const item of readdirSync(fullDir, { withFileTypes: true })) {
      if (!item.isFile()) continue
      const { name } = item
      if (name.includes('.test.') || name.includes('.stories.') || name.endsWith('.mdx')) continue
      if (!name.endsWith('.ts') && !name.endsWith('.tsx')) continue
      const base = name.replace(/\.tsx?$/, '')
      entries[`${outPrefix}/${base}`] = resolve(fullDir, name)
    }
  }

  // Top-level category directories
  scanDir('ui', 'ui')
  scanDir('composed', 'composed')
  scanDir('shell', 'shell')
  scanDir('hooks', 'hooks')
  scanDir('tailwind', 'tailwind')

  // Subdirectory barrels and utilities
  entries['ui/charts/index'] = resolve(__dirname, 'src/ui/charts/index.ts')
  entries['ui/tree-view/index'] = resolve(__dirname, 'src/ui/tree-view/index.ts')
  entries['ui/lib/utils'] = resolve(__dirname, 'src/ui/lib/utils.ts')
  entries['composed/date-picker/index'] = resolve(__dirname, 'src/composed/date-picker/index.ts')
  entries['composed/lib/string-utils'] = resolve(__dirname, 'src/composed/lib/string-utils.ts')

  return entries
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.mdx', 'src/test-setup.ts', 'src/tokens/**/*.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, 'src/primitives'),
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: collectEntries(),
      formats: ['es'],
    },
    rollupOptions: {
      // Only React + peer dependencies stay external.
      // Everything in "dependencies" (clsx, cva, tailwind-merge, @floating-ui,
      // aria-hidden, react-remove-scroll) is bundled into the vendor chunk.
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^next($|\/)/,
        /^@tanstack\//,
        /^@tiptap\//,
        /^@emoji-mart\//,
        /^d3-/,
        /^@tabler\/icons-react($|\/)/,
        /^date-fns($|\/)/,
        /^react-markdown($|\/)/,
        /^input-otp($|\/)/,
        /^server-only$/,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('primitives/')) return 'primitives'
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
```

Key changes from old config:
- `preserveModules: true` → REMOVED
- `preserveModulesRoot: 'src'` → REMOVED
- `external` list: removed `@floating-ui/*`, `aria-hidden`, `react-remove-scroll`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@dnd-kit/*` (not a core dep anyway)
- `external` list: added regex patterns with `($|\/)` to catch subpath imports (e.g. `react/jsx-runtime`)
- Added `entryFileNames`, `chunkFileNames`, `manualChunks`
- Added `collectEntries()` helper to generate per-component entry points
- Added `manualChunks` rule for `primitives/` to group vendored Radix code

**Step 3: Verify the entry point count matches expectations**

Run (in packages/core): `node -e "const c = require('./vite.config.ts'); ..."` — not possible with TS.
Instead, temporarily add `console.log(Object.keys(collectEntries()).length)` and run the build.
Expected: ~70+ entry points (44 ui + 16 composed + 7 shell + 3 hooks + 1 tailwind + sub-entries).

**Step 4: Commit**

```bash
git add packages/core/vite.config.ts
git commit -m "build(core): replace preserveModules with explicit entries + vendor chunk

Bundle @floating-ui, aria-hidden, react-remove-scroll, clsx, cva,
tailwind-merge into _chunks/vendor.js. Group vendored Radix primitives
into _chunks/primitives.js. Only React and peer deps stay external.

Fixes React #527 (dual React instances) in Next.js + pnpm consumers."
```

---

### Task 2: Update core package.json — move dependencies to devDependencies

**Files:**
- Modify: `packages/core/package.json`

**Step 1: Move all 6 `dependencies` to `devDependencies`**

Remove the entire `"dependencies"` block:
```json
"dependencies": {
  "@floating-ui/react-dom": "^2.1.7",
  "aria-hidden": "^1.2.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "react-remove-scroll": "^2.6.3",
  "tailwind-merge": "^3.0.1"
}
```

Add these 6 entries to `devDependencies` (alphabetical order, merge with existing entries):
```json
"@floating-ui/react-dom": "^2.1.7",
"aria-hidden": "^1.2.4",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"react-remove-scroll": "^2.6.3",
"tailwind-merge": "^3.0.1",
```

**Step 2: Verify no `"dependencies"` key remains**

Run: `node -e "const p = require('./packages/core/package.json'); console.log(p.dependencies)"`
Expected: `undefined`

**Step 3: Run pnpm install to update lockfile**

Run: `pnpm install`
Expected: lockfile updates, no errors.

**Step 4: Commit**

```bash
git add packages/core/package.json pnpm-lock.yaml
git commit -m "build(core): move bundled deps to devDependencies

@floating-ui/react-dom, aria-hidden, react-remove-scroll, clsx, cva,
and tailwind-merge are now inlined into the build output. Consumers no
longer need them as transitive dependencies."
```

---

### Task 3: Build and verify core output

**Files:**
- None (verification only)

**Step 1: Build core**

Run: `cd packages/core && pnpm build`
Expected: build succeeds without errors.

**Step 2: Verify `_chunks/vendor.js` exists**

Run: `ls -la packages/core/dist/_chunks/`
Expected: `vendor.js` and `primitives.js` (and possibly their CSS sidecars).

**Step 3: Verify entry point files exist at expected paths**

Run: `ls packages/core/dist/ui/button.js packages/core/dist/ui/dialog.js packages/core/dist/composed/index.js packages/core/dist/shell/index.js packages/core/dist/hooks/index.js packages/core/dist/tailwind/index.js`
Expected: all files exist.

**Step 4: Verify NO bare dependency imports remain in dist output**

Run: `grep -r "from ['\"]@floating-ui" packages/core/dist/ --include="*.js" | head -5`
Expected: no matches.

Run: `grep -r "from ['\"]aria-hidden" packages/core/dist/ --include="*.js" | head -5`
Expected: no matches.

Run: `grep -r "from ['\"]react-remove-scroll" packages/core/dist/ --include="*.js" | head -5`
Expected: no matches.

Run: `grep -r "from ['\"]clsx" packages/core/dist/ --include="*.js" | head -5`
Expected: no matches.

Run: `grep -r "from ['\"]class-variance-authority" packages/core/dist/ --include="*.js" | head -5`
Expected: no matches.

Run: `grep -r "from ['\"]tailwind-merge" packages/core/dist/ --include="*.js" | head -5`
Expected: no matches.

**Step 5: Verify React remains external**

Run: `grep -r "from ['\"]react['\"]" packages/core/dist/ui/button.js`
Expected: at least one match (React is external, imported as a bare specifier).

**Step 6: Verify vendor chunk uses relative imports (no bare specifiers for bundled code)**

Run: `head -50 packages/core/dist/_chunks/vendor.js`
Expected: the vendor chunk should NOT have `import ... from "@floating-ui/react-dom"` etc. It should contain inlined code. It MAY have `import ... from "react"` (external, expected).

**Step 7: Check for any build regressions**

Run: `ls -la packages/core/dist/tokens/index.css`
Expected: tokens CSS file exists (copied by build:tokens script).

Run: `ls packages/core/dist/tailwind/index.cjs`
Expected: CJS tailwind config exists (built by build-tailwind-cjs.mjs).

---

### Task 4: Update karm vite.config.ts — entry points and chunking

**Files:**
- Modify: `packages/karm/vite.config.ts`

**Step 1: Replace the entire vite.config.ts with the new build configuration**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../core/src'),
      '@primitives': resolve(__dirname, '../core/src/primitives'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'board/index': resolve(__dirname, 'src/board/index.ts'),
        'tasks/index': resolve(__dirname, 'src/tasks/index.ts'),
        'chat/index': resolve(__dirname, 'src/chat/index.ts'),
        'dashboard/index': resolve(__dirname, 'src/dashboard/index.ts'),
        'client/index': resolve(__dirname, 'src/client/index.ts'),
        'admin/index': resolve(__dirname, 'src/admin/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => {
        // Externalize anything resolved from core package (workspace dep)
        if (id.includes('packages/core/src/')) return true
        if (id.includes('packages\\core\\src\\')) return true

        // React — external (must match ALL React entry points)
        if (/^react($|\/)/.test(id)) return true
        if (/^react-dom($|\/)/.test(id)) return true

        // Peer dependencies — external
        if (/^@devalok\/shilp-sutra($|\/)/.test(id)) return true
        if (/^@tabler\/icons-react($|\/)/.test(id)) return true
        if (/^next($|\/)/.test(id)) return true

        // Everything else (including @dnd-kit, react-markdown, date-fns,
        // clsx, cva, tailwind-merge) gets bundled into the vendor chunk
        return false
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
        paths: (id) => {
          // Rewrite resolved absolute core paths to @devalok/shilp-sutra imports
          const coreMatch = id.replace(/\\/g, '/').match(/packages\/core\/src\/(.+?)(?:\.\w+)?$/)
          if (coreMatch) {
            const subpath = coreMatch[1]
            const categories = ['ui', 'composed', 'shell', 'hooks', 'tailwind']
            for (const cat of categories) {
              if (subpath.startsWith(`${cat}/`)) {
                if (subpath === `${cat}/index`) return `@devalok/shilp-sutra/${cat}`
                const cleaned = subpath.replace(/\/index$/, '')
                return `@devalok/shilp-sutra/${cleaned}`
              }
              if (subpath === cat) return `@devalok/shilp-sutra/${cat}`
            }
            if (subpath.startsWith('primitives/') || subpath.startsWith('tokens/')) {
              return `@devalok/shilp-sutra`
            }
            return `@devalok/shilp-sutra/${subpath}`
          }
          return id
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
```

Key changes from old config:
- `preserveModules: true` → REMOVED
- `preserveModulesRoot: 'src'` → REMOVED
- External function: removed `clsx`, `tailwind-merge`, `class-variance-authority`, `@dnd-kit/*`, `react-markdown`, `date-fns` from externals
- Added `entryFileNames`, `chunkFileNames`, `manualChunks`
- Kept `output.paths` for core import rewriting (unchanged)

**Step 2: Commit**

```bash
git add packages/karm/vite.config.ts
git commit -m "build(karm): replace preserveModules with explicit entries + vendor chunk

Bundle @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities,
react-markdown, date-fns, clsx, cva, tailwind-merge into
_chunks/vendor.js. Only React, core, and peer deps stay external."
```

---

### Task 5: Update karm package.json — move dependencies to devDependencies

**Files:**
- Modify: `packages/karm/package.json`

**Step 1: Move all 8 `dependencies` to `devDependencies`**

Remove the entire `"dependencies"` block:
```json
"dependencies": {
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "react-markdown": "^10.1.0",
  "tailwind-merge": "^3.0.1"
}
```

Add these 8 entries to `devDependencies` (merge with existing `@devalok/shilp-sutra: workspace:*`):
```json
"devDependencies": {
  "@devalok/shilp-sutra": "workspace:*",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "react-markdown": "^10.1.0",
  "tailwind-merge": "^3.0.1"
}
```

**Step 2: Run pnpm install**

Run: `pnpm install`
Expected: lockfile updates, no errors.

**Step 3: Commit**

```bash
git add packages/karm/package.json pnpm-lock.yaml
git commit -m "build(karm): move bundled deps to devDependencies

@dnd-kit/*, react-markdown, date-fns, clsx, cva, tailwind-merge are
now inlined into the build output. Consumers only need React + core."
```

---

### Task 6: Build and verify karm output

**Files:**
- None (verification only)

**Step 1: Build karm**

Run: `cd packages/karm && pnpm build`
Expected: build succeeds.

**Step 2: Verify `_chunks/vendor.js` exists**

Run: `ls -la packages/karm/dist/_chunks/`
Expected: `vendor.js` exists.

**Step 3: Verify NO bare @dnd-kit imports remain**

Run: `grep -r "from ['\"]@dnd-kit" packages/karm/dist/ --include="*.js" | head -5`
Expected: no matches.

Run: `grep -r "from ['\"]react-markdown" packages/karm/dist/ --include="*.js" | head -5`
Expected: no matches.

**Step 4: Verify React and core remain external**

Run: `grep -r "from ['\"]react['\"]" packages/karm/dist/board/index.js`
Expected: matches (React is external).

Run: `grep -r "from ['\"]@devalok/shilp-sutra" packages/karm/dist/board/index.js`
Expected: matches (core is external peer dep).

---

### Task 7: Update brand vite.config.ts + package.json

**Files:**
- Modify: `packages/brand/vite.config.ts`
- Modify: `packages/brand/package.json`

**Step 1: Update brand vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'devalok/index': resolve(__dirname, 'src/devalok/index.ts'),
        'karm/index': resolve(__dirname, 'src/karm/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => {
        // Externalize PNG imports — handled as static assets
        if (id.endsWith('.png')) return true
        // React — external
        if (/^react($|\/)/.test(id)) return true
        if (/^react-dom($|\/)/.test(id)) return true
        // Everything else (clsx, tailwind-merge) gets bundled
        return false
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
    cssCodeSplit: true,
    outDir: 'dist',
    sourcemap: false,
  },
})
```

**Step 2: Update brand package.json — move dependencies to devDependencies**

Remove `"dependencies"` block. Add to `"devDependencies"`:
```json
"devDependencies": {
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.1"
}
```

**Step 3: Run pnpm install**

Run: `pnpm install`

**Step 4: Build brand and verify**

Run: `cd packages/brand && pnpm build`
Expected: build succeeds.

Run: `grep -r "from ['\"]clsx" packages/brand/dist/ --include="*.js" | head -5`
Expected: no matches (clsx is bundled).

**Step 5: Commit**

```bash
git add packages/brand/vite.config.ts packages/brand/package.json pnpm-lock.yaml
git commit -m "build(brand): bundle clsx + tailwind-merge into vendor chunk

Consistent with core and karm — all deps inlined, only React external."
```

---

### Task 8: Run full test suite and typecheck

**Files:**
- None (verification only)

**Step 1: Typecheck all packages**

Run: `pnpm typecheck`
Expected: passes with no errors.

**Step 2: Run all tests**

Run: `pnpm test`
Expected: all 636+ tests pass.

**Step 3: Build all packages end-to-end**

Run: `pnpm build`
Expected: all three packages build successfully.

---

### Task 9: Final verification — scan all dist outputs

**Files:**
- None (verification only)

**Step 1: Verify no bundled dep bare imports leak through in any package**

Run:
```bash
echo "=== Checking core ===" && \
grep -rE "from ['\"](@floating-ui|aria-hidden|react-remove-scroll|clsx|class-variance-authority|tailwind-merge)['\"/]" packages/core/dist/ --include="*.js" | head -10 && \
echo "=== Checking karm ===" && \
grep -rE "from ['\"](@dnd-kit|react-markdown|date-fns|clsx|class-variance-authority|tailwind-merge)['\"/]" packages/karm/dist/ --include="*.js" | head -10 && \
echo "=== Checking brand ===" && \
grep -rE "from ['\"](clsx|tailwind-merge)['\"/]" packages/brand/dist/ --include="*.js" | head -10
```
Expected: no matches from any package.

**Step 2: Verify React is the ONLY framework external in vendor chunks**

Run:
```bash
grep -E "from ['\"]" packages/core/dist/_chunks/vendor.js | grep -v "react" | head -10
grep -E "from ['\"]" packages/karm/dist/_chunks/vendor.js | grep -v "react" | head -10
```
Expected: no output (only `react` imports, or relative imports to other chunks).

**Step 3: Verify vendor chunks don't accidentally inline React code**

Run: `grep "useState\|useEffect\|createElement" packages/core/dist/_chunks/vendor.js | head -5`
Expected: these should be CALLS to imported React functions, not re-implementations. The vendor chunk should have `import { useState } from "react"` or similar, not its own useState implementation.

---

### Task 10: Commit final state

**Files:**
- All changed files

**Step 1: Final commit (if any remaining changes)**

```bash
git add -A
git commit -m "fix: bundle all deps into dist to eliminate React #527

Next.js 15 + pnpm consumers get dual React instances because deps in
.pnpm/ fall outside Next.js's per-layer React alias include list.

Changes:
- core: bundle @floating-ui, aria-hidden, react-remove-scroll, clsx,
  cva, tailwind-merge into _chunks/vendor.js
- karm: bundle @dnd-kit/*, react-markdown, date-fns, clsx, cva,
  tailwind-merge into _chunks/vendor.js
- brand: bundle clsx, tailwind-merge into _chunks/vendor.js
- All three packages: drop preserveModules, use explicit entry points
  with manualChunks for deduplication

Consumers need one line in next.config.js:
  transpilePackages: ['@devalok/shilp-sutra', '@devalok/shilp-sutra-karm', '@devalok/shilp-sutra-brand']

BREAKING: Dependencies moved to devDependencies. Consumers who were
importing these packages directly (not through shilp-sutra) need to
install them separately."
```

---

### Task 11: Update documentation

**Files:**
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`
- Modify: `CHANGELOG.md`

**Step 1: Add Next.js setup instructions to llms.txt**

Add a "Next.js Setup" section:
```
## Next.js Setup (Required for Next.js + pnpm)

Add to next.config.js:
  transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-karm", "@devalok/shilp-sutra-brand"]
```

**Step 2: Update CHANGELOG.md**

Add entry for the new version with:
- Breaking change: dependencies moved to devDependencies
- Fix: React #527 dual instance issue in Next.js + pnpm
- Consumer action: add `transpilePackages` to next.config.js

**Step 3: Commit docs**

```bash
git add CHANGELOG.md packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs: add Next.js transpilePackages requirement + changelog"
```
