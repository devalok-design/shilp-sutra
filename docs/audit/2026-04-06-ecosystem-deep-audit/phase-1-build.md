# Phase 1: Build Pipeline Audit

Audited: 2026-04-06
Auditor: Claude Opus 4.6 (1M context)
Package: `@devalok/shilp-sutra@0.31.0`

---

## "use client" Correctness

### How It Works

The system uses a two-layer approach:
1. **Source-level `'use client'`** — many components have this as line 1 in their `.tsx` source. Vite preserves it in the compiled output.
2. **`// @server-safe` annotation** — placed on line 1 of source files that should NOT get `"use client"`. The `inject-use-client.mjs` post-build script detects these and skips them.
3. **Build-artifact exemptions** — `tailwind/index`, `tailwind/preset`, and `_chunks/vendor-utils` are hardcoded as server-safe in the script (can't be source-annotated).
4. **Files with neither** — get `"use client"` injected by the post-build script. This catches barrel files (index.ts) which re-export client components.

### Server-Safe Annotations Found (15 files)

**TSX (11):**
- `ui/text.tsx` — pure markup, CVA variants only
- `ui/skeleton.tsx` — pure markup, CSS animation
- `ui/container.tsx` — pure markup wrapper
- `ui/stack.tsx` — pure layout wrapper
- `ui/code.tsx` — pure markup
- `ui/visually-hidden.tsx` — pure markup, a11y utility
- `ui/table.tsx` — pure markup, HTML table wrapper
- `composed/page-header.tsx` — pure markup
- `composed/content-card.tsx` — pure markup
- `composed/loading-skeleton.tsx` — pure markup
- `composed/page-skeletons.tsx` — pure markup

**TS (4):**
- `ui/lib/utils.ts` — clsx/tailwind-merge utility
- `ui/lib/motion.ts` — framer-motion config objects (type-only import)
- `ui/lib/date-utils.ts` — pure date formatting function
- `composed/lib/string-utils.ts` — pure string utility

### Verification: All Annotations Correct

Every `@server-safe` file was verified to contain:
- No React hooks (useState, useEffect, useRef, useCallback, useMemo, useContext, useReducer, useLayoutEffect)
- No browser API usage (window, document, navigator) at module scope
- No Radix primitive imports (which bundle client code)
- `ui/lib/motion.ts` uses `import type { Transition } from 'framer-motion'` — type-only, erased at build.

**Verdict: All 15 annotations are correct. No false positives.**

### Misannotated Files

**None found.** All server-safe files are genuinely server-safe.

### Files With Neither Annotation Nor Source `'use client'`

These files have no directive on line 1. The post-build script injects `"use client"` for all of them:

| File | Gets `"use client"` | Correct? |
|------|---------------------|----------|
| `ui/index.ts` | Yes (barrel) | Correct — re-exports client components |
| `ui/toast-types.ts` | Yes | **Unnecessary** — pure type file, compiles to empty JS |
| `composed/index.ts` | Yes (barrel) | Correct |
| `shell/index.ts` | Yes (barrel) | Correct |
| `shell/command-registry.tsx` | Yes | Correct — uses `React.createContext` |
| `shell/link-context.tsx` | Yes | Correct — re-exports from client module |
| `ai/types.ts` | Yes | **Unnecessary** — pure type file, compiles to empty JS |
| `hooks/index.ts` | Yes (barrel) | Correct |
| `motion/index.ts` | Yes (barrel) | Correct |
| `motion/primitives-index.ts` | Yes (barrel) | Correct |

### Recommendations

1. **Low priority:** Add `// @server-safe` to `ui/toast-types.ts` and `ai/types.ts`. These are pure type files that compile to empty JS. The `"use client"` directive is harmless but semantically wrong. Won't cause bugs, but makes the annotation system incomplete.

---

## SSR Smoke Test

### Coverage: 136/136 JS entry points (100%)

The smoke test iterates every key in `package.json` `exports`, skipping:
- `./tokens` — CSS file (correct)
- `./fonts/*` — font files (correct)
- `./docs/*` — documentation files (correct)

All 136 JavaScript entry points are tested.

### Uncovered Exports

None. Full coverage.

### Known Gaps

**Limitation: Import-time only.** The test only catches module-scope browser API usage — code that executes at `import` time in Node.js. Specifically:

1. **Render-body access is NOT caught.** If a component uses `window.innerWidth` or `document.querySelector()` directly in its JSX return body (without a `useEffect` guard), the SSR smoke test passes but `renderToString()` will crash.

2. **useState initializers are NOT caught.** `useState(document.hidden)` is patched post-build for Sonner, but any future component with similar patterns would slip through.

3. **External peer deps are gracefully skipped.** ERR_MODULE_NOT_FOUND for declared peerDependencies counts as a pass. This is correct for dev workspace but means the import chain WITHIN the external dep is not tested.

### Recommendation

A `renderToString`-based test layer would catch render-body issues. Implementation approach:

```js
import { renderToString } from 'react-dom/server'
// For each exported component, render with minimal required props
renderToString(<Button>test</Button>)
```

**Tradeoff:** This requires maintaining a prop fixture for every component. Could be automated with a convention (each component exports a `__SSR_FIXTURE__` or a `defaultProps` shape). The current import-only test is zero-maintenance. A render test needs ongoing prop maintenance.

**Recommendation:** Add renderToString testing for high-risk components (those that interact with browser APIs like `window.matchMedia`, `ResizeObserver`, `IntersectionObserver`) rather than all 136 exports. Start with shell components (sidebar, top-bar) and any component that uses `useMediaQuery` or `useIsMobile`.

---

## Export Map Completeness

### Missing Exports

**None.** Every source component file in `src/ui/`, `src/composed/`, `src/shell/`, `src/ai/` has a corresponding subpath export in `package.json`.

Internal-only files without subpath exports (by design):
- `ui/button-processing.tsx` — internal, imported only by `button.tsx`
- `ui/lib/link-context.tsx` — internal, re-exported via `shell/link-context`
- `ui/lib/keybinding.ts` — internal, used by command-palette and AI command-bar
- `ui/lib/slot.ts` — internal primitive
- `ui/lib/use-ripple.ts` — internal hook
- `motion/motion-provider.tsx` — exported via `motion/index.ts` barrel
- `motion/primitives.tsx` — exported via `motion/primitives-index.ts` barrel
- `ai/devadoot-icon.tsx` — exported via `ai/index.ts` barrel

All are accessible through their respective barrel exports. No consumer-facing components are missing.

### Broken Export Paths

**None found.** All 136 export paths point to source files that exist.

### Export Structure

All JS exports use the consistent `{ import, default, types }` triple. The only variations:
- `./tailwind` and `./tailwind/preset` additionally have `require` conditions pointing to CJS
- `./fonts/*` and `./docs/*` use string-only wildcard patterns

**One anomaly (harmless):** `./tailwind/preset` has `"require": "./dist/tailwind/index.cjs"` — the CJS path points to `index.cjs`, not `preset.cjs`. This is correct because `build-tailwind-cjs.mjs` compiles `preset.js` → `index.cjs` (the index just re-exports preset's default). But it's confusing that `./tailwind` and `./tailwind/preset` both point to the same CJS file.

---

## Chunk Boundaries

### Current Layout

| Chunk | Contents | Loaded By |
|-------|----------|-----------|
| `vendor-utils` | clsx, class-variance-authority, tailwind-merge | Nearly all components (pure, SSR-safe) |
| `vendor-client` | @floating-ui, aria-hidden, react-colorful, react-remove-scroll, react-style-singleton, use-callback-ref, use-sidecar, react-clientside-effect, get-nonce | Popover, Dialog, Sheet, Select, and anything using floating/portal |
| `sonner` | sonner | Toaster/Toast only |
| `framer` | framer-motion | See issue below |
| `primitives` | Vendored Radix primitives | Most UI components |
| `tiptap` | @tiptap/*, prosemirror-* | rich-text-editor only |

### Issues

#### 1. MISLEADING COMMENT: Framer Motion is NOT scoped to Spinner

The `vite.config.ts` comment says:
```js
// Framer Motion — only loaded by Spinner and future animation components
```

**This is severely outdated.** Framer-motion is imported by **84 source files** across all categories:
- UI: accordion, alert, badge, button, card, checkbox, dialog, dropdown-menu, etc.
- Composed: activity-feed, avatar-group, bulk-action-bar, command-palette, etc.
- Shell: notification-center, bottom-navbar
- AI: conversation, command-bar, block-renderer, etc.
- Motion: primitives, motion-provider

The `framer` chunk (~195KB) is effectively a universal dependency, loaded on first component render. The comment should be updated to reflect reality.

**Impact:** No functional issue — the chunk is correctly isolated and shared. But the misleading comment could cause someone to "optimize" by trying to remove the chunk or scope it, not realizing it's load-bearing for the entire system.

#### 2. Unknown deps get isolated auto-named chunks (good)

The `manualChunks` function has no catch-all `return 'vendor'` — unknown `node_modules` deps get their own Rollup-named chunks. This is a security-first approach: new deps don't accidentally land in `vendor-utils` (SSR-safe) or `vendor-client` (patched for SSR).

#### 3. Tiptap isolation is verified

Only `rich-text-editor.tsx` and its 3 extension files (`file-attachment.tsx`, `mention-suggestion.tsx`, `emoji-suggestion.tsx`) import from `@tiptap/` or `prosemirror-*`. The tiptap chunk (~546KB) is only loaded when the rich text editor is used.

#### 4. Primitives chunk catches ALL vendored Radix code

The `if (id.includes('primitives/')) return 'primitives'` line catches both `src/primitives/` and any `node_modules` path containing `primitives/`. This is intentional since Radix is vendored, but it's worth noting that any future non-Radix code in a `primitives/` path would also land here.

---

## sideEffects

### Current Configuration

```json
"sideEffects": [
  "**/*.css",
  "**/primitives/**"
]
```

### Assessment

**CSS:** Correct. CSS imports are side-effectful (they inject styles).

**Primitives:** Correct. Vendored Radix primitives have module-scope side effects (global event listeners, style injections). Marking them as side-effectful prevents tree-shaking from removing them when they're imported transitively.

### Missing Entries

The `sideEffects` field looks complete. The only concern:

- **`inject-use-client.mjs` patches** — The SSR safety patches on `vendor-client.js` and `sonner.js` modify code post-build but don't constitute side effects in the tree-shaking sense. These are fine.
- **Motion config** — `ui/lib/motion.ts` exports const objects but has no module-scope side effects. Correctly NOT in the list.

**Verdict: sideEffects field is correct and complete.**

---

## Pre-Publish Gates

### Current Gates (11)

**Hard gates (block publish):**
1. Working tree is clean (git status)
2. Core version matches CHANGELOG latest version
3. CHANGELOG has entry for current version
4. Core docs coverage check (build:docs:check)
5. Typecheck passes
6. Lint has 0 errors
7. Core tests pass (with 1 retry for axe-core flakes)
8. Build succeeds
9. SSR smoke test passes
10. No stale .js files in core/src/ui/
11. No deprecated surface tokens in components
12. No deprecated shadow tokens in components

**Advisory (warnings, don't block):**
- llms.txt updated since last tag

### Missing Gates

#### High Priority

1. **No `SURFACE1_ALLOWLIST` enforcement.** CLAUDE.md documents a `SURFACE1_ALLOWLIST` in `pre-publish-audit.mjs` for components that intentionally use `bg-surface-1`. This was never implemented. The current gate only checks for deprecated *numbered* tokens (bg-surface-1 through bg-surface-4), which are the OLD names. The semantic replacements (bg-surface-base, bg-surface-raised, etc.) are not validated for correct usage by surface level.

2. **No Storybook stories check.** CLAUDE.md and memory state "Stories are a publish gate" but pre-publish-audit doesn't verify that every component has a `.stories.tsx` file. This is purely a manual check.

3. **No brand package version/build check.** The audit only validates the core package. If publishing brand, there's no gate script at all.

4. **No export map validation.** The audit doesn't verify that every source component has a matching `package.json` export entry. A new component could be added without an export and the gate wouldn't catch it.

#### Medium Priority

5. **No renderToString SSR test.** As discussed above, the import-only smoke test misses render-body browser API usage.

6. **No bundle size check.** There's no gate preventing a chunk from unexpectedly doubling in size (e.g., a new dep accidentally landing in vendor-utils).

7. **No llms-full.txt check.** Only llms.txt is checked as advisory. llms-full.txt is also shipped and should be verified.

#### Low Priority

8. **Test retry masks real failures.** The core test gate retries once on failure. While this handles axe-core singleton flakes, it could also mask a legitimate test failure. Consider logging when a retry is needed.

9. **No changeset validation.** Changesets were adopted but pre-publish-audit doesn't verify a changeset exists for the upcoming version.

---

## Recommendations (Prioritized)

### P0 — Fix Now

1. **Update the framer-motion comment** in `vite.config.ts` line 129. Change from "only loaded by Spinner and future animation components" to "loaded by nearly all components — universal animation dependency (~195KB)."

### P1 — Fix Before Next Publish

2. **Add `// @server-safe` to `ui/toast-types.ts` and `ai/types.ts`.** These pure-type files currently get unnecessary `"use client"` injection.

3. **Add export map validation gate** to `pre-publish-audit.mjs`. Script should scan `src/ui/*.tsx`, `src/composed/*.tsx`, `src/shell/*.tsx` (excluding tests/stories/index) and verify each has a matching `package.json` export.

4. **Add stories existence gate** to `pre-publish-audit.mjs`. For each source component, verify a `.stories.tsx` exists.

### P2 — Plan For

5. **Implement renderToString SSR test** for high-risk components (shell, components using `useMediaQuery`/`useMobile`).

6. **Add bundle size tracking.** Even a simple "print chunk sizes" advisory in the audit would catch regressions.

7. **Remove or update SURFACE1_ALLOWLIST references** in CLAUDE.md. Either implement the allowlist mechanism or remove the documentation that refers to it.
