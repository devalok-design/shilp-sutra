# Next.js Compatibility & API Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 4 issues reported by karm-v2 team: missing `"use client"`, leaked `@primitives/*` types, API inconsistencies, and per-component server-safe exports.

**Architecture:** Post-build scripts handle `"use client"` injection and `.d.ts` path rewriting. API fixes are direct source edits. Per-component exports in package.json enable granular imports.

**Tech Stack:** Vite 5.4, Rollup plugins, vite-plugin-dts, Node.js post-build scripts

---

### Task 1: Create post-build script for `"use client"` injection

**Files:**
- Create: `packages/core/scripts/inject-use-client.mjs`

**Step 1: Write the script**

```javascript
// packages/core/scripts/inject-use-client.mjs
//
// Prepends "use client";\n to all .js and .d.ts files in dist/
// EXCEPT server-safe components (purely presentational, no hooks/context/state).

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

// Server-safe files: no "use client" directive needed.
// These components use zero hooks, zero context, zero event handlers.
const SERVER_SAFE = new Set([
  // ui/
  'ui/text.js',
  'ui/text.d.ts',
  'ui/skeleton.js',
  'ui/skeleton.d.ts',
  'ui/spinner.js',
  'ui/spinner.d.ts',
  'ui/stack.js',
  'ui/stack.d.ts',
  'ui/container.js',
  'ui/container.d.ts',
  'ui/table.js',
  'ui/table.d.ts',
  'ui/visually-hidden.js',
  'ui/visually-hidden.d.ts',
  'ui/code.js',
  'ui/code.d.ts',
  // composed/
  'composed/content-card.js',
  'composed/content-card.d.ts',
  'composed/empty-state.js',
  'composed/empty-state.d.ts',
  'composed/page-header.js',
  'composed/page-header.d.ts',
  'composed/loading-skeleton.js',
  'composed/loading-skeleton.d.ts',
  'composed/page-skeletons.js',
  'composed/page-skeletons.d.ts',
  'composed/priority-indicator.js',
  'composed/priority-indicator.d.ts',
  'composed/status-badge.js',
  'composed/status-badge.d.ts',
  // Non-React (tailwind preset, utilities, tokens)
  'tailwind/index.js',
  'tailwind/index.d.ts',
  'tailwind/preset.js',
  'tailwind/preset.d.ts',
  // lib utilities (cn, motion) — not components
  'ui/lib/utils.js',
  'ui/lib/utils.d.ts',
  'ui/lib/motion.js',
  'ui/lib/motion.d.ts',
])

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

let count = 0
for await (const file of walk(DIST)) {
  if (!file.endsWith('.js') && !file.endsWith('.d.ts')) continue
  // Skip primitives directory — vendored Radix internals, not consumer-facing
  const rel = relative(DIST, file).replace(/\\/g, '/')
  if (rel.startsWith('primitives/')) continue
  if (rel.startsWith('tokens/')) continue
  if (SERVER_SAFE.has(rel)) continue

  const content = await readFile(file, 'utf8')
  if (content.startsWith('"use client"') || content.startsWith("'use client'")) continue
  await writeFile(file, `"use client";\n${content}`)
  count++
}

console.log(`✓ Injected "use client" into ${count} files`)
```

**Step 2: Wire into build script in package.json**

Change `packages/core/package.json` build script:
```json
"build": "vite build && pnpm build:tokens && node scripts/inject-use-client.mjs",
```

**Step 3: Run build and verify**

Run: `cd packages/core && pnpm build`
Expected: `✓ Injected "use client" into N files`

Verify: `head -1 dist/ui/button.js` → `"use client";`
Verify: `head -1 dist/ui/text.js` → should NOT start with `"use client"`
Verify: `head -1 dist/ui/index.js` → `"use client";`

**Step 4: Commit**

```bash
git add packages/core/scripts/inject-use-client.mjs packages/core/package.json
git commit -m "feat(core): add post-build use-client injection for Next.js App Router compat"
```

---

### Task 2: Create post-build script to fix `@primitives/*` in `.d.ts` files

**Files:**
- Create: `packages/core/scripts/fix-dts-primitives.mjs`

**Step 1: Write the script**

```javascript
// packages/core/scripts/fix-dts-primitives.mjs
//
// 1. Copies .d.ts files from src/primitives/ to dist/primitives/
// 2. Rewrites @primitives/react-* → relative paths in all dist .d.ts files

import { readdir, readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { join, relative, dirname } from 'node:path'
import { existsSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const SRC_PRIMS = join(ROOT, 'src', 'primitives')
const DIST = join(ROOT, 'dist')
const DIST_PRIMS = join(DIST, 'primitives')

// Step 1: Copy .d.ts files from src/primitives/ to dist/primitives/
const srcEntries = await readdir(SRC_PRIMS)
for (const entry of srcEntries) {
  if (!entry.endsWith('.d.ts')) continue
  await copyFile(join(SRC_PRIMS, entry), join(DIST_PRIMS, entry))
}

// Also copy _internal .d.ts files
const internalSrc = join(SRC_PRIMS, '_internal')
const internalDist = join(DIST_PRIMS, '_internal')
if (existsSync(internalSrc)) {
  if (!existsSync(internalDist)) await mkdir(internalDist, { recursive: true })
  const internalEntries = await readdir(internalSrc)
  for (const entry of internalEntries) {
    if (!entry.endsWith('.d.ts')) continue
    await copyFile(join(internalSrc, entry), join(internalDist, entry))
  }
}

// Step 2: Rewrite @primitives/ paths in all .d.ts files under dist/
async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) yield* walk(full)
    else yield full
  }
}

let count = 0
for await (const file of walk(DIST)) {
  if (!file.endsWith('.d.ts')) continue
  // Skip the primitives directory itself
  const rel = relative(DIST, file).replace(/\\/g, '/')
  if (rel.startsWith('primitives/')) continue

  const content = await readFile(file, 'utf8')
  if (!content.includes('@primitives/')) continue

  const fileDir = dirname(file)
  const relToPrims = relative(fileDir, DIST_PRIMS).replace(/\\/g, '/')

  const rewritten = content.replace(
    /(['"])@primitives\/(react-[a-z-]+)\1/g,
    (_, quote, name) => `${quote}${relToPrims}/${name}${quote}`
  )

  await writeFile(file, rewritten)
  count++
}

console.log(`✓ Copied primitive .d.ts files and rewrote ${count} files`)
```

**Step 2: Wire into build script**

Change `packages/core/package.json` build script:
```json
"build": "vite build && pnpm build:tokens && node scripts/fix-dts-primitives.mjs && node scripts/inject-use-client.mjs",
```

Note: `fix-dts-primitives.mjs` runs BEFORE `inject-use-client.mjs` so both scripts don't conflict.

**Step 3: Run build and verify**

Run: `cd packages/core && pnpm build`
Expected: `✓ Copied primitive .d.ts files and rewrote N files`

Verify: `head -3 dist/ui/label.d.ts` → should reference `../primitives/react-label` not `@primitives/react-label`
Verify: `ls dist/primitives/react-label.d.ts` → file exists
Verify: `ls dist/primitives/_internal/` → has .d.ts files

**Step 4: Commit**

```bash
git add packages/core/scripts/fix-dts-primitives.mjs packages/core/package.json
git commit -m "fix(core): rewrite @primitives paths in .d.ts output for consumer TS compat"
```

---

### Task 3: Add per-component exports to package.json (Issue 4)

**Files:**
- Modify: `packages/core/package.json`

**Step 1: Add per-component exports**

Add exports for every component in ui/, composed/, and shell/ to the `exports` field. Each follows this pattern:

```json
"./ui/text": {
  "import": "./dist/ui/text.js",
  "types": "./dist/ui/text.d.ts"
},
```

Complete list — all ui/ components, all composed/ components, all shell/ components. Also add `./hooks/*` individual hook exports.

Keep existing barrel exports (`./ui`, `./composed`, `./shell`, `./hooks`, `./tailwind`, `./tokens`, `./fonts/*`) unchanged.

**Step 2: Run build and verify**

Run: `cd packages/core && pnpm build`
Verify: No build errors. `node -e "import('@devalok/shilp-sutra/ui/text')"` resolves (from a test project).

**Step 3: Commit**

```bash
git add packages/core/package.json
git commit -m "feat(core): add per-component exports for server-safe granular imports"
```

---

### Task 4: Fix Stack direction + gap API (Issue 3a, 3b)

**Files:**
- Modify: `packages/core/src/ui/stack.tsx`
- Modify: `packages/core/src/ui/__tests__/stack.test.tsx` (if exists, else create)

**Step 1: Update Stack types and implementation**

In `packages/core/src/ui/stack.tsx`:

1. Add `'row' | 'column'` to the `direction` type:
```typescript
direction?: 'vertical' | 'horizontal' | 'row' | 'column'
```

2. Add `number` to the `gap` type:
```typescript
gap?: SpacingToken | number
```

3. Update direction resolution in the component:
```typescript
const isRow = direction === 'horizontal' || direction === 'row'
// then use: isRow ? 'flex-row' : 'flex-col'
```

4. Update gap resolution to handle numbers:
```typescript
const gapClass = typeof gap === 'number' ? gapMap[String(gap)] : (gap ? gapMap[gap] : undefined)
```

**Step 2: Write/update test**

Test that `direction="row"` produces `flex-row`, `direction="column"` produces `flex-col`, `gap={4}` produces `gap-ds-04`.

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- --reporter=verbose src/ui/__tests__/stack.test.tsx`

**Step 4: Commit**

```bash
git add packages/core/src/ui/stack.tsx packages/core/src/ui/__tests__/stack.test.tsx
git commit -m "feat(core): Stack accepts row/column direction aliases and numeric gap values"
```

---

### Task 5: Widen Text `as` generic (Issue 3c)

**Files:**
- Modify: `packages/core/src/ui/text.tsx`

**Step 1: Widen the generic constraint**

Change:
```typescript
type TextProps<T extends React.ElementType = 'p'> = {
```

To:
```typescript
type TextProps<T extends React.ElementType = 'p'> = {
  variant?: TextVariant
  as?: T & React.ElementType
```

The key fix: the `forwardRef` call uses `TextProps` without a generic parameter, so it defaults to `T = 'p'`. The `as` prop type becomes `'p'` which rejects `'h1'`. Fix by making the `as` prop accept any `React.ElementType`:

```typescript
type TextProps<T extends React.ElementType = 'p'> = {
  variant?: TextVariant
  as?: React.ElementType
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'variant' | 'className' | 'children'>
```

**Step 2: Verify existing tests pass**

Run: `cd packages/core && pnpm test -- --reporter=verbose src/ui/__tests__/text.test.tsx`

**Step 3: Commit**

```bash
git add packages/core/src/ui/text.tsx
git commit -m "fix(core): widen Text 'as' prop to accept any React.ElementType"
```

---

### Task 6: StatCard icon accepts ComponentType (Issue 3d)

**Files:**
- Modify: `packages/core/src/ui/stat-card.tsx`

**Step 1: Update icon prop type and rendering**

Change interface:
```typescript
icon?: React.ReactNode | React.ComponentType<{ className?: string }>
```

Update rendering:
```typescript
{icon && (
  <span className="text-text-secondary" aria-hidden="true">
    {typeof icon === 'function' ? React.createElement(icon, { className: 'h-ico-lg w-ico-lg' }) : icon}
  </span>
)}
```

**Step 2: Run tests**

Run: `cd packages/core && pnpm test -- --reporter=verbose src/ui/__tests__/stat-card.test.tsx`

**Step 3: Commit**

```bash
git add packages/core/src/ui/stat-card.tsx
git commit -m "feat(core): StatCard icon accepts ComponentType in addition to ReactNode"
```

---

### Task 7: Rename SearchInput `inputSize` → `size` (Issue 3f)

**Files:**
- Modify: `packages/core/src/ui/search-input.tsx`

**Step 1: Rename the prop**

In `SearchInputProps` interface:
```typescript
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void
  loading?: boolean
  /** @default 'md' */
  size?: SearchInputSize
}
```

Note: Must `Omit<..., 'size'>` to avoid conflict with the HTML `size` attribute (which is a number).

Update the forwardRef destructuring:
```typescript
({ className, value, onClear, loading, size = 'md', ...props }, ref) => {
```

Update usage: `sizeClasses[size]` instead of `sizeClasses[inputSize]`.

**Step 2: Update tests if they reference `inputSize`**

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- --reporter=verbose src/ui/__tests__/search-input.test.tsx`

**Step 4: Commit**

```bash
git add packages/core/src/ui/search-input.tsx
git commit -m "fix(core): rename SearchInput inputSize → size to match Input API"
```

---

### Task 8: Investigate and fix Label children (Issue 3g)

**Files:**
- Modify: `packages/core/src/ui/label.tsx` (if needed)

**Step 1: Investigate**

The Label component renders `<LabelPrimitive.Root>` and passes `{children}` explicitly. The component source looks correct. The issue reported may be caused by Issue 2 (`@primitives/*` not resolving) causing TypeScript confusion at the consumer level, not a runtime bug.

Verify by:
1. Reading the current `label.tsx` source (already done — children are passed correctly)
2. Checking if the Radix Label primitive renders children (it does — it's a `<label>` element)
3. The fix from Task 2 (fixing `.d.ts` paths) likely resolves this

If Label truly has a runtime issue, the fix would be to ensure the vendored `react-label.js` primitive correctly passes children through.

**Step 2: Write a defensive test**

```typescript
it('renders children text', () => {
  render(<Label>Email Address</Label>)
  expect(screen.getByText('Email Address')).toBeInTheDocument()
})
```

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- --reporter=verbose src/ui/__tests__/label.test.tsx`

**Step 4: Commit (if changes needed)**

```bash
git add packages/core/src/ui/label.tsx packages/core/src/ui/__tests__/label.test.tsx
git commit -m "fix(core): verify Label renders children correctly"
```

---

### Task 9: Add JSDoc module comments to barrel exports (Issue 3h)

**Files:**
- Modify: `packages/core/src/ui/index.ts`
- Modify: `packages/core/src/composed/index.ts`
- Modify: `packages/core/src/shell/index.ts`

**Step 1: Add module-level JSDoc**

At the top of `ui/index.ts`:
```typescript
/**
 * @module @devalok/shilp-sutra/ui
 *
 * Core UI primitives — buttons, inputs, dialogs, cards, tables, badges, etc.
 * Most components require client-side React (`"use client"`).
 *
 * **Server-safe components** (can be imported individually without `"use client"`):
 * `Text`, `Skeleton`, `Spinner`, `Stack`, `Container`, `Table`, `Code`, `VisuallyHidden`
 *
 * Import individually for server components:
 * ```tsx
 * import { Text } from '@devalok/shilp-sutra/ui/text'
 * ```
 */
```

Similar for `composed/index.ts` and `shell/index.ts`.

**Step 2: Commit**

```bash
git add packages/core/src/ui/index.ts packages/core/src/composed/index.ts packages/core/src/shell/index.ts
git commit -m "docs(core): add JSDoc module comments with import guidance to barrel exports"
```

---

### Task 10: Remove `'use client'` from server-safe source files

**Files:**
- Modify: 15 source files (7 ui + 7 composed + `ui/lib/utils.ts`)

**Step 1: Remove `'use client'` directive from server-safe components**

Remove the `'use client'` line from:
- `packages/core/src/ui/text.tsx`
- `packages/core/src/ui/skeleton.tsx`
- `packages/core/src/ui/spinner.tsx`
- `packages/core/src/ui/stack.tsx`
- `packages/core/src/ui/container.tsx`
- `packages/core/src/ui/table.tsx`
- `packages/core/src/ui/visually-hidden.tsx`
- `packages/core/src/ui/code.tsx`
- `packages/core/src/composed/content-card.tsx`
- `packages/core/src/composed/empty-state.tsx`
- `packages/core/src/composed/page-header.tsx`
- `packages/core/src/composed/loading-skeleton.tsx`
- `packages/core/src/composed/page-skeletons.tsx`
- `packages/core/src/composed/priority-indicator.tsx`
- `packages/core/src/composed/status-badge.tsx`

This ensures the post-build script doesn't accidentally add `"use client"` back (since it checks for existing directives).

**Step 2: Run full test suite**

Run: `cd packages/core && pnpm test`
Expected: All 547 tests pass (removing `'use client'` has no test impact — it's a bundler directive).

**Step 3: Commit**

```bash
git add packages/core/src/ui/text.tsx packages/core/src/ui/skeleton.tsx packages/core/src/ui/spinner.tsx packages/core/src/ui/stack.tsx packages/core/src/ui/container.tsx packages/core/src/ui/table.tsx packages/core/src/ui/visually-hidden.tsx packages/core/src/ui/code.tsx packages/core/src/composed/content-card.tsx packages/core/src/composed/empty-state.tsx packages/core/src/composed/page-header.tsx packages/core/src/composed/loading-skeleton.tsx packages/core/src/composed/page-skeletons.tsx packages/core/src/composed/priority-indicator.tsx packages/core/src/composed/status-badge.tsx
git commit -m "refactor(core): remove 'use client' from server-safe presentational components"
```

---

### Task 11: Version bump to 0.2.0 + CHANGELOG

**Files:**
- Modify: `packages/core/package.json` (version)
- Modify: `packages/brand/package.json` (version)
- Modify: `packages/karm/package.json` (version)
- Modify: `CHANGELOG.md`

**Step 1: Bump versions**

All three packages → `"version": "0.2.0"`

**Step 2: Update CHANGELOG.md**

Add a new `## [0.2.0] - 2026-03-05` section with:
- **Added:** `"use client"` directive to all client-only components for Next.js App Router
- **Added:** Per-component exports (`./ui/text`, `./ui/dialog`, etc.) for granular server-safe imports
- **Added:** Stack accepts `"row"`/`"column"` direction aliases and numeric gap values
- **Added:** StatCard `icon` prop accepts `React.ComponentType` in addition to `ReactNode`
- **Fixed:** `@primitives/*` type references in `.d.ts` files now resolve correctly for consumers
- **Fixed:** Text `as` prop accepts any `React.ElementType` (was restricted to default element)
- **Fixed:** SearchInput renamed `inputSize` → `size` to align with Input API
- **Fixed:** Label children rendering verified and covered by tests

**Step 3: Full build + test**

Run: `cd packages/core && pnpm build && pnpm test`
Run: `cd packages/brand && pnpm build`
Run: `cd packages/karm && pnpm build`

**Step 4: Commit**

```bash
git add packages/core/package.json packages/brand/package.json packages/karm/package.json CHANGELOG.md
git commit -m "chore: bump all packages to v0.2.0"
```

---

## Execution Order & Dependencies

```
Task 1 (inject-use-client script)     ─┐
Task 2 (fix-dts-primitives script)     ─┤── Build infrastructure (sequential)
Task 3 (per-component exports)         ─┘
                                        │
Task 4 (Stack direction+gap)           ─┐
Task 5 (Text as generic)              ─┤
Task 6 (StatCard icon)                ─┤── API fixes (parallel-safe)
Task 7 (SearchInput size rename)       ─┤
Task 8 (Label children)               ─┤
Task 9 (JSDoc barrel comments)        ─┘
                                        │
Task 10 (remove use-client from safe)  ─── Depends on Task 1 (script must exist first)
                                        │
Task 11 (version bump + changelog)     ─── Final (depends on all above)
```

Tasks 4-9 can be executed in parallel. Tasks 1-3 should be sequential. Task 10 after Task 1. Task 11 last.
