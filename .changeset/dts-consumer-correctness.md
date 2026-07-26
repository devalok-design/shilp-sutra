---
"@devalok/shilp-sutra": minor
---

Fix three faults that made the published type declarations unusable for anyone type-checking them, and drop three dependencies that were never needed.

Reported by a consumer who installed 0.54.0 and hit "a ton of TS errors from your package's `.d.ts` file". Reproduced exactly: one `import { Button } from '@devalok/shilp-sutra/ui'` produced **78 errors**.

All three faults were invisible on the most common consumer config (`moduleResolution: "bundler"` + `skipLibCheck: true`), which is why they shipped. They appear the moment a consumer turns on declaration checking.

**`"use client"` no longer emitted into `.d.ts`** — 209 of 284 published declaration files began with a `"use client"` prologue. A `.d.ts` is an ambient context, so that is a statement, and every one was `error TS1036: Statements are not allowed in ambient contexts`. The directive is a bundler/RSC runtime concern, read off the `.js` module graph; declarations are erased before anything runs. `inject-use-client.mjs` now skips `.d.ts` and strips any stale directive.

**No more undeclared type imports** — `split-button.d.ts` referenced `@floating-ui/dom` and seven files referenced `@tiptap/core` / `@tiptap/react` / `@tiptap/suggestion`, none of them declared anywhere: `error TS2307: Cannot find module`. The cause was a rule that only held for runtime — a module is a consumer peer *iff* the build externalizes it. Rollup bundles TipTap's JavaScript, but TypeScript's declaration emitter does not bundle third-party types, so the bare specifier survived into our `.d.ts` with nothing declaring it.

- `@floating-ui/dom`'s `Placement` is now inlined as `SplitButtonPlacement` (same twelve members, also exported) — no install, no leak.
- `@tiptap/core`, `@tiptap/react` and `@tiptap/suggestion` are now **optional, types-only peers**. The runtime stays bundled; install them as devDependencies only if you import `RichTextEditor` / `RichChatInput` and want the editor object typed. `derive-peer-map.mjs` understands this category, so `preflight` and the recipe tables say "types only" rather than implying a runtime need.

**Relative imports in `.d.ts` now carry explicit `.js` extensions** — 234 extensionless specifiers broke `moduleResolution: "node16" | "nodenext"` (TS2834/TS2835). Directory specifiers resolve to `/index.js`. A new `fix-dts-extensions.mjs` post-build step handles this.

**Three dependencies removed — no consumer action required.** `diff`, `frimousse` and `@emoji-mart/data` were declared as runtime dependencies while already being fully bundled into `dist`, so every consumer installed packages they also received a copy of. Nothing resolves them at runtime and nothing references them in the types. Dependencies drop from seven to four; the remaining four are all genuinely required — `class-variance-authority` and `clsx` appear in our published types, `tw-animate-css` is resolved by your CSS build, and `use-sync-external-store` is an externalized TipTap transitive.

**Two more faults, found only under pnpm.** All of the above was verified with npm, which hoists dependencies flat and auto-installs peers — so an undeclared package still resolves and a forgotten peer still appears. Re-running the same verification under pnpm's isolated layout surfaced two further problems, both of which ship in 0.54.0 today:

- **`@tiptap/pm` was missing from the peer set.** TipTap's own declarations import `@tiptap/pm/state` and TipTap declares `@tiptap/pm` as *its* peer, so `pnpm add -D @tiptap/react` still left six `TS2307` errors from inside TipTap. This is not derivable from our imports — the requirement lives in the peer's types — so `derive-peer-map.mjs` gains an explicit companion map.
- **Two 0-byte emitted modules** (`dist/ui/toast-types.js`, `dist/ai/types.js`). A types-only entry has no runtime content, so the bundler emits an empty file while `exports` still advertises a runtime path. An empty file gives Node's module-type detection nothing to read, and under pnpm's symlinks that ambiguity throws `ERR_REQUIRE_CYCLE_MODULE` on import. A new `fix-empty-modules.mjs` gives them an `export {}` body.

**Five gates added, so this class cannot ship again.** The 45 existing gates all passed on the broken release because our own consumer smoke test set `skipLibCheck: true` — the exact setting that hides it — and installed npm-style.

- `scripts/audit-dts.mjs` — no directive prologue, no undeclared bare specifier, no extensionless relative specifier, no 0-byte emitted module.
- `scripts/consumer-strict-install.mjs` — pnpm with hoisting disabled and auto-install-peers off, importing all 150 subpath exports and checking both types and runtime. This is the gate that found the two faults above.
- `attw` (pinned, not `npx @latest`) in the pre-publish audit, ignoring only the two by-design rules — ESM-only, and node10's inability to read `exports`.
- The smoke consumer now runs with `skipLibCheck: false`.
- The smoke consumer type-checks across `bundler` × `nodenext` × `skipLibCheck` on/off.

Verified against a packed tarball: 150/150 subpaths type-check clean under pnpm at `skipLibCheck: false` and 150/150 import cleanly at runtime; all four tsconfig combinations report zero errors; `attw`'s `InternalResolutionError` count goes from 301 to 0. Also verified React 18, `require(esm)` on Node 22.12+, a real Tailwind 4 build emitting every DS utility, and an end-to-end Vite app that builds, server-renders, and passes 13 browser interaction checks with no console errors.

Two behaviours are documented rather than changed, in `docs/recipes/troubleshoot.md`: legacy `moduleResolution: "node"` cannot resolve our subpaths (it predates `exports`), and the package is ESM-only, so CommonJS callers need a dynamic import.
