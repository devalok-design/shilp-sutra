# SSR Safety Architecture — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate all SSR crashes from the design system and make it structurally impossible to ship SSR-unsafe code.

**Architecture:** Externalize browser-only deps that are currently bundled into the toxic `vendor-utils` catch-all chunk. Invert the `manualChunks` logic so unknown deps get isolated chunks instead of silently joining vendor-utils. Add an SSR smoke test as a hard publish gate.

**Tech Stack:** Vite 5.4 (Rollup), Node.js ESM import testing, pre-publish-audit.mjs

**Issue:** https://github.com/devalok-design/shilp-sutra/issues/21#issuecomment-4077325687

---

## Root Cause

`vendor-utils.js` is a 3.1MB catch-all chunk containing both safe utilities (clsx, cva, tw-merge) and unsafe browser code (react-pdf/pdfjs-dist with module-scope `new DOMMatrix()`). The tailwind preset imports `tailwindcss/plugin` which Vite bundles into this same chunk. When PostCSS loads the preset in Node.js, it evaluates the entire chunk and hits DOMMatrix — crash.

## Task 1: Externalize browser-only and consumer-provided deps

**Files:**
- Modify: `packages/core/vite.config.ts:101-114` (external array)

Add to the `external` array in `rollupOptions`:

```ts
/^tailwindcss($|\/)/,
/^react-pdf($|\/)/,
/^react-zoom-pan-pinch($|\/)/,
/^react-syntax-highlighter($|\/)/,
```

**Why each:**
- `tailwindcss` — consumers already have it (it's in peerDeps). The preset should use their copy, not bundle ours.
- `react-pdf` — lazy-loaded by file-preview via React.lazy. 3MB with DOMMatrix. Consumers who use PDF preview install it themselves.
- `react-zoom-pan-pinch` — used by file-preview zoom. Browser-only transform APIs.
- `react-syntax-highlighter` — used by markdown-viewer code blocks. Safe but large, consumers should provide it.

**Step 1:** Edit vite.config.ts externals
**Step 2:** Add these as optional peerDependencies in package.json (Task 2)
**Step 3:** Build and verify vendor-utils.js shrinks dramatically

---

## Task 2: Update package.json peer deps

**Files:**
- Modify: `packages/core/package.json`

Add to `peerDependencies`:
```json
"react-pdf": "^10.0.0",
"react-zoom-pan-pinch": "^3.0.0",
"react-syntax-highlighter": "^15.0.0 || ^16.0.0"
```

Add to `peerDependenciesMeta`:
```json
"react-pdf": { "optional": true },
"react-zoom-pan-pinch": { "optional": true },
"react-syntax-highlighter": { "optional": true }
```

Remove from `devDependencies`:
- `@react-pdf/renderer` — **not imported by any source file** (dead dep)

---

## Task 3: Invert manualChunks to allowlist

**Files:**
- Modify: `packages/core/vite.config.ts:118-142`

Replace the catch-all `return 'vendor-utils'` with an explicit allowlist. Unknown deps get their own isolated chunk (safe by default).

```ts
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('@tiptap/') || id.includes('prosemirror'))
      return 'tiptap'
    if (id.includes('framer-motion'))
      return 'framer'
    // Client-only deps that use React hooks/DOM
    if (
      id.includes('@floating-ui/') ||
      id.includes('aria-hidden') ||
      id.includes('react-remove-scroll') ||
      id.includes('react-style-singleton') ||
      id.includes('use-callback-ref') ||
      id.includes('use-sidecar') ||
      id.includes('react-clientside-effect') ||
      id.includes('get-nonce') ||
      id.includes('sonner')
    )
      return 'vendor-client'
    // Pure utilities — ALLOWLIST, not catch-all
    if (
      id.includes('/clsx/') ||
      id.includes('/class-variance-authority/') ||
      id.includes('/tailwind-merge/')
    )
      return 'vendor-utils'
    // Everything else: Rollup auto-names the chunk.
    // New deps get isolated rather than joining a toxic mega-chunk.
    // The SSR smoke test catches any module-scope browser API usage.
  }
  if (id.includes('primitives/')) return 'primitives'
},
```

---

## Task 4: Create SSR smoke test script

**Files:**
- Create: `packages/core/scripts/ssr-smoke-test.mjs`

This script imports every entry point from the built dist in Node.js and verifies none of them crash. It tests what actually happens when Next.js server-renders a page that imports our components.

The script:
1. Reads all export entries from package.json `exports` field
2. Filters to .js entries (skips CSS tokens, fonts)
3. Dynamically imports each in Node.js
4. Reports pass/fail per entry point
5. Exits non-zero if any fail

Security: No user input — all paths come from the package's own package.json. Uses hardcoded commands only (same pattern as existing pre-publish-audit.mjs).

---

## Task 5: Add SSR gate to pre-publish-audit.mjs

**Files:**
- Modify: `scripts/pre-publish-audit.mjs`

Add a new hard gate after the "Build succeeds" gate (~line 216). This runs the SSR smoke test script from Task 4 as a blocking publish gate. Uses the same `execSync` pattern with hardcoded command strings already used throughout the file.

---

## Task 6: Build, verify, and test

**Step 1:** Rebuild: `cd packages/core && pnpm build`
**Step 2:** Verify vendor-utils.js size dropped (should be ~35KB, not 3.1MB)
**Step 3:** Run SSR smoke test: `node scripts/ssr-smoke-test.mjs` — all should pass
**Step 4:** Run existing tests: `pnpm test` — should still pass
**Step 5:** Run typecheck: `pnpm typecheck`
**Step 6:** Verify tailwind preset has no vendor-utils import: check `dist/tailwind/preset.js` line 1

---

## Task 7: Commit

Message: `fix(ssr): externalize browser-only deps, invert chunk allowlist, add SSR smoke test gate`

---

## Expected Outcomes

| Before | After |
|--------|-------|
| vendor-utils.js: 3.1MB, 88K lines | vendor-utils.js: ~35KB (clsx+cva+tw-merge) |
| Tailwind preset imports vendor-utils | Tailwind preset imports tailwindcss/plugin directly (external) |
| `new DOMMatrix()` crashes Node.js | react-pdf code not bundled at all |
| No SSR safety checks in CI | SSR smoke test blocks publish |
| New deps silently join mega-chunk | New deps get isolated chunks |
| Karm needs 14 workaround dynamic imports | Karm can remove workarounds after upgrade |
