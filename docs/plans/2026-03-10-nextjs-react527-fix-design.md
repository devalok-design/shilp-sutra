# Design: React #527 — Bundle deps to eliminate dual React in Next.js + pnpm

**Date**: 2026-03-10
**Status**: Approved
**Affects**: @devalok/shilp-sutra, @devalok/shilp-sutra-karm, @devalok/shilp-sutra-brand

## Problem

When any Next.js 15 app using pnpm consumes shilp-sutra, users get React error #527 (two React instances in the client bundle).

Next.js 15 vendors its own React (a canary build) at `next/dist/compiled/react/` and uses per-layer webpack module rules to redirect all `react` imports to this vendored copy. These rules only apply to files matching an include list — the consumer's project root + packages in `transpilePackages`.

With pnpm, all packages live in `.pnpm/` store paths that fall outside this include list. When webpack processes `shilp-sutra/dist/ui/button.js` and encounters `import * as React from "react"`, it resolves to `node_modules/react@19.2.4` instead of the vendored canary. Two Reacts end up in the client bundle.

The problem is amplified because shilp-sutra-karm ships `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `react-markdown`, and `@floating-ui/react-dom` as regular dependencies. Each is a separate package in `.pnpm/` that independently imports React — creating even more un-aliased React import paths.

## Fix: Bundle deps into compiled output (hybrid vendor chunk)

### Strategy

Bundle all `dependencies` into the compiled output. Only `react`, `react-dom`, and packages listed in `peerDependencies` stay as bare external imports. Inlined deps are deduplicated into a shared `_chunks/vendor.js` chunk.

This ensures that every `import from "react"` in the published package comes from a file inside shilp-sutra's own `dist/` directory. When the consumer uses `transpilePackages`, ALL files in the package get React aliases — including the vendor chunk.

### Build configuration (hybrid preserveModules + vendor chunk)

```js
// Rollup output options
{
  preserveModules: true,       // keep 1:1 mapping for our own source files
  preserveModulesRoot: 'src',
  manualChunks(id) {
    if (id.includes('node_modules')) {
      return '_chunks/vendor'  // deduplicate all inlined deps into one chunk
    }
  }
}

// External — only React + peer deps
{
  external: [
    /^react($|\/)/,            // catches react, react/jsx-runtime, react/jsx-dev-runtime
    /^react-dom($|\/)/,        // catches react-dom, react-dom/client, etc.
    // peer deps that consumers install themselves:
    /^next($|\/)/,
    /^@tanstack\//,
    /^@tiptap\//,
    /^@emoji-mart\//,
    /^@tabler\/icons-react/,
    /^d3-/,
    'date-fns',
    'input-otp',
    'server-only',
    // karm only:
    /^@devalok\/shilp-sutra/,
  ]
}
```

### Per-package changes

#### Core (@devalok/shilp-sutra)

**No longer external** (bundled into `_chunks/vendor.js`):
- `@floating-ui/react-dom`
- `aria-hidden`
- `react-remove-scroll`
- `clsx`
- `class-variance-authority`
- `tailwind-merge`

**package.json**: Move all 6 `dependencies` to `devDependencies`.

**Output shape**:
```
dist/
  _chunks/vendor.js            ← @floating-ui, aria-hidden, react-remove-scroll, clsx, cva, tw-merge
  ui/button.js                 ← imports from "../_chunks/vendor.js" + "react"
  ui/dialog.js                 ← imports from "../_chunks/vendor.js" + "react"
  composed/command-bar.js      ← same pattern
  ...
```

#### Karm (@devalok/shilp-sutra-karm)

**No longer external** (bundled into `_chunks/vendor.js`):
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `react-markdown`
- `date-fns`
- `clsx`, `class-variance-authority`, `tailwind-merge`

**package.json**: Move all 8 `dependencies` to `devDependencies`.

**Output shape**:
```
dist/
  _chunks/vendor.js            ← @dnd-kit, react-markdown, date-fns, clsx, cva, tw-merge
  board/kanban-board.js        ← imports from "../_chunks/vendor.js" + "react" + "@devalok/shilp-sutra/..."
  tasks/task-card.js           ← same pattern
  ...
```

#### Brand (@devalok/shilp-sutra-brand)

**No longer external** (bundled into `_chunks/vendor.js`):
- `clsx`, `tailwind-merge`

**package.json**: Move both `dependencies` to `devDependencies`.

### What we're NOT doing (yet)

- **No `"source"` export condition.** It's a nice-to-have that improves tree-shaking but doesn't solve the dual-React problem. The vendor chunk bundling is the fix. Source condition can be added in a follow-up.
- **No changes to the exports map.** `_chunks/` is internal — not exported.
- **No changes to the post-build pipeline** (inject-use-client, fix-dts-primitives, copy-tokens, build-tailwind-cjs).

## Consumer-side requirements

After this fix, Next.js + pnpm consumers need one line:
```js
// next.config.js
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-karm", "@devalok/shilp-sutra-brand"]
```

No webpack hacks, no `.npmrc` changes, no pnpm overrides.

## Verification plan

1. Build all three packages, inspect `dist/` for `_chunks/vendor.js`
2. Verify no bare `@dnd-kit`, `@floating-ui`, `react-remove-scroll` imports remain in dist output files
3. Verify `react` and `react-dom` remain as external bare imports
4. Verify existing tests pass (`pnpm test`)
5. Verify typecheck passes (`pnpm typecheck`)
6. Manual check: vendor chunk uses relative imports only (no bare specifiers for bundled deps)
7. End-to-end verification in Karm (actual consumer):
   - Install the new versions of all three packages
   - Build with `transpilePackages` in `next.config.js`
   - Confirm React error #527 is gone from both server logs and browser console
   - Confirm the board page loads with KanbanBoard, TaskDetailPanel, and RichTextEditor all rendering correctly

## Critical invariant

The vendor chunk must NOT re-export or inline React code. The external list uses regex patterns (`/^react($|\/)/`) to catch all React entry points. If Rollup inlines React code into the vendor chunk instead of keeping it external, the fix won't work.
