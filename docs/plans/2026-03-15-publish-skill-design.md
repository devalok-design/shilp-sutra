# Publishing Skill & Automation — Design

**Date:** 2026-03-15
**Context:** Too many publishing mistakes (missed files, wrong tokens, undocumented breaking changes, missing docs). Need a three-layer system: post-build hook, pre-publish script, and a rigid publishing skill.

---

## Three-Layer Architecture

### Layer 1: Post-Build Hook (`scripts/post-build-audit.mjs`)

Runs automatically after every `pnpm build`. Catches issues at build time.

**Checks:**
- No stale `.js` files in `packages/core/src/ui/`
- `inject-use-client.mjs` blast radius report — list new chunk files that got `"use client"`
- Token advisory: grep `dist/` for `bg-surface-1` in component output (warning, not hard fail)

**Wiring:** Appended to each package's build script chain.

### Layer 2: Pre-Publish Script (`scripts/pre-publish-audit.mjs`)

Called explicitly by the skill. Exits non-zero on any failure.

**Hard gates:**
1. `git status` is clean
2. Version in package.json matches CHANGELOG's latest `## [x.y.z]` header
3. Changed component files have corresponding `.stories.tsx`
4. Changed component files have corresponding docs with version entry
5. CHANGELOG has entry for current version
6. `llms.txt` mentions new/changed components
7. Public type signature changes → CHANGELOG must mention breaking/changed
8. `pnpm typecheck` passes
9. `pnpm lint` has 0 errors
10. All tests pass
11. `pnpm build` succeeds
12. No `bg-surface-1` on card/widget/panel source files (with allowlist)

**Advisory warnings:** Unused eslint-disables, test count delta, bundle size delta.

### Layer 3: Publishing Skill (`publish-release`)

Rigid skill with human gates and rationalization prevention.

**Flow:**
1. Determine scope (packages, semver, summary)
2. Documentation phase (CHANGELOG, llms.txt, component docs)
3. Version bump + peer dep check
4. Automated gates (pre-publish-audit.mjs — ALL must pass)
5. Storybook review gate — ASK user if they want to review in Storybook first. If yes, start server and list changed stories. If skip, proceed.
6. Final diff review (visual: tokens, animations, DOM changes)
7. Publish (npm publish, verify, git tag, push)
8. Post-publish (DS notice if breaking, upgrade command)
