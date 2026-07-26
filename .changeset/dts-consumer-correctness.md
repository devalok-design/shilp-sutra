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

**Four gates added, so this class cannot ship again.** The 45 existing gates all passed on the broken release because our own consumer smoke test set `skipLibCheck: true` — the exact setting that hides it.

- `scripts/audit-dts.mjs` — asserts no directive prologue, no undeclared bare specifier, no extensionless relative specifier.
- `attw` in the pre-publish audit, ignoring only the two by-design rules (ESM-only, and node10's inability to read `exports`).
- The smoke consumer now runs with `skipLibCheck: false`.
- The smoke consumer type-checks across `bundler` × `nodenext` × `skipLibCheck` on/off.

Verified against a packed tarball in a clean consumer: all four configurations report zero errors, and `attw`'s `InternalResolutionError` count goes from 301 to 0.

Two behaviours are documented rather than changed, in `docs/recipes/troubleshoot.md`: legacy `moduleResolution: "node"` cannot resolve our subpaths (it predates `exports`), and the package is ESM-only, so CommonJS callers need a dynamic import.
