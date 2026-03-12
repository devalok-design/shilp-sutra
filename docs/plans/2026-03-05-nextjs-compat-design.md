# Next.js Compatibility & API Fixes Design

**Date:** 2026-03-05
**Triggered by:** Feedback from karm-v2 team during Next.js 15 App Router migration
**Target version:** 0.2.0 (minor bump, breaking API changes on 0.x)

---

## Issue 1 + 4: Selective `"use client"` + Per-Component Entry Points

### Problem
- Published `.js` files lack `"use client"` directive (stripped during Vite build)
- All components forced into client-only rendering in Next.js App Router
- Purely presentational components can't be used in Server Components

### Solution
Selective `"use client"` injection via Rollup plugin + per-component package.json exports.

**Server-safe components** (no hooks, no context, no client APIs):

| ui/ | composed/ |
|-----|-----------|
| text | content-card |
| skeleton | empty-state |
| spinner | page-header |
| stack | loading-skeleton |
| container | page-skeletons |
| table | priority-indicator |
| code | |
| visually-hidden | |

All other components are **client-only**.

### Build Changes
1. **vite.config.ts** — Rollup `renderChunk` plugin prepends `"use client";\n` to client-only `.js` files
2. **vite-plugin-dts** — `afterBuild` callback prepends `"use client"` to client-only `.d.ts` files
3. **package.json** — Per-component exports (e.g., `"./ui/text"`, `"./ui/dialog"`) for all components
4. Barrel exports (`./ui`, `./composed`, `./shell`) retain `"use client"` since they re-export client components

### Consumer Usage
```tsx
// Server Component — no "use client" needed
import { Text } from '@devalok/shilp-sutra/ui/text'
import { Stack } from '@devalok/shilp-sutra/ui/stack'

// Client Component — "use client" already in module
import { Dialog } from '@devalok/shilp-sutra/ui/dialog'

// Bulk import — always client (barrel has "use client")
import { Text, Dialog } from '@devalok/shilp-sutra/ui'
```

---

## Issue 2: `@primitives/*` Type Rewriting

### Problem
Published `.d.ts` files reference `@primitives/react-*` aliases that don't exist in consumer's `node_modules`. TypeScript compilation fails.

### Solution
Post-build script `scripts/fix-dts-paths.mjs`:
1. Scan all `.d.ts` files in `dist/`
2. Rewrite `@primitives/react-*` imports to relative paths (`../../primitives/react-*`)
3. Generate minimal `.d.ts` stub files for each vendored primitive in `dist/primitives/react-*/`

Stubs export `Root` and common sub-components typed as `React.ForwardRefExoticComponent<any>`.

---

## Issue 3: API Fixes (Breaking)

| Sub-issue | Fix |
|-----------|-----|
| 3a. Stack direction | Add `"row"` / `"column"` as CVA variant aliases alongside `"horizontal"` / `"vertical"` |
| 3b. Stack gap | Accept `number` (mapped to tokens: `4` → `"ds-04"`) in addition to token strings |
| 3c. Text `as` | Widen generic constraint to `React.ElementType` |
| 3d. StatCard icon | Accept `React.ComponentType` in addition to `ReactNode`, detect and render |
| 3e. Toast variant | No code change — document `"error"` vs `"destructive"` difference |
| 3f. SearchInput | Rename `inputSize` → `size` |
| 3g. Label children | Investigate and fix rendering |
| 3h. Import guide | Add JSDoc module comments to barrel exports |

---

## Issue 4: Version Bump

- All changed packages → **v0.2.0**
- Update `CHANGELOG.md`
- Karm peer dep `>=0.1.0` already covers 0.2.0
