# Comprehensive Design System Audit — Findings & Improvement Plan

**Date:** 2026-04-05
**Benchmarked against:** Radix Themes, shadcn/ui, Mantine v7, Chakra v3, MUI v6/v7, Ark UI
**Current version:** @devalok/shilp-sutra@0.30.0

---

## Overall Grade: B+

Strong foundation with best-in-class elements (SSR safety, AI-readiness, token architecture) alongside specific gaps (variant consistency, visual regression, release automation).

---

## Area Grades

| Area | Grade | Summary |
|------|-------|---------|
| Component Architecture | B | Good patterns, fragmented variant axes |
| Token Architecture | A- | Three-tier OKLCH system, minor legacy debt |
| Build & Bundle | A | Per-component exports, SSR smoke test, selective use-client |
| Testing & Quality | B+ | 636+ tests, vitest-axe, no visual regression |
| Documentation & DX | B | Good Storybook, scattered docs, no getting-started tutorial |
| Release & Versioning | C+ | Manual process, past failure (v0.8.0 incident) |
| AI-Readiness | A+ | llms.txt, MCP, bidirectional feedback protocol |
| Accessibility | B+ | Radix primitives, 43 axe test files, no screen reader process |

---

## Findings by Area

### 1. Component Architecture

**Strengths:**
- Vendored Radix primitives (zero @radix-ui runtime deps)
- Three-tier hierarchy (ui → composed → shell) with ESLint module boundaries
- CVA for all styling, 100% named exports, forwardRef, displayName
- Controlled + uncontrolled on all stateful components

**Critical gaps:**

| Issue | Details |
|-------|---------|
| Variant/color/size axis fragmentation | Button: full (variant, color, size, weight, shape). Alert: no size. Card: no color/size. Input: `state` not `color`. Select: no color/variant. |
| Input uses `state` instead of `color` | Breaks the pattern every other component follows |
| Badge compound pattern deviation | Uses `Object.assign` while Dialog/Sheet/DropdownMenu use named exports |
| Missing subpath exports | icon, icon-context, icon-group, badge-group, badge-indicator, devalok-grain, ai/types — **FIXED in this session** |
| No TypeScript discriminated unions | Can pass `value` without `onValueChange` |

### 2. Token Architecture

**Strengths:**
- Three-tier: primitives.css (OKLCH 12-step) → semantic.css → Tailwind preset
- 14 color scales, all perceptually uniform OKLCH
- Zero primitive token leakage into components
- Surface system with proper dark mode float direction
- Motion tokens (Carbon-inspired durations + productive/expressive easing)
- Comprehensive shadow system (4 elevation + 8 effect shadows)

**Gaps:**

| Issue | Severity |
|-------|----------|
| Legacy typography classes (T1-Reg, B2-Reg) alongside new semantic tokens | Medium |
| Chart palette always step 9 — no light/muted variants | Low |
| Breakpoint duplication between semantic.css and preset.ts | Low |
| Tailwind v3.4 → v4 migration ahead | Medium |

### 3. Build & Bundle Strategy

**Strengths:**
- 76 per-component entry points — granular tree-shaking
- ESM-only with CJS only for Tailwind preset
- Strategic manual chunks (tiptap, framer, primitives isolated)
- SSR smoke test as hard publish gate
- Selective "use client" injection with server-safe allowlist

**Gaps:**

| Issue | Severity |
|-------|----------|
| Post-build script fragility (4 sequential scripts, no rollback) | Medium |
| Server-safe allowlist is hardcoded | Medium |
| No bundle size budget in CI | Low |

### 4. Testing & Quality

**Strengths:**
- 190 test files, 636+ tests (Vitest + RTL)
- 43 dedicated accessibility test files (vitest-axe)
- Storybook play functions for interaction testing
- Pre-publish audit: 7 hard gates
- ESLint module boundary enforcement

**Gaps:**

| Issue | Severity |
|-------|----------|
| No visual regression testing (Chromatic/Percy) | High |
| Test coverage gaps: date-picker (10 files, 0 tests), charts (9), AI (17), tree-view (4) | Medium |
| No coverage reporting in CI | Low |

### 5. Documentation & DX

**Strengths:**
- Storybook with dark mode, MCP server, a11y addon
- llms.txt + llms-full.txt in npm package
- CLAUDE.md, CONTRIBUTING.md, design philosophy doc
- Playground app with token editor

**Gaps:**

| Issue | Severity |
|-------|----------|
| No "getting started" tutorial | Medium |
| No dedicated migration guide page | Medium |
| Design philosophy undiscoverable (not linked from README) | Low |
| Duplicate README (root + packages/core) | Low |
| llms.txt manually maintained (risks drift) | Medium |

### 6. Release & Versioning

**Current:** Manual process with pre-publish-audit.mjs safety net.
**Past failure:** v0.8.0 published without docs → required 0.8.1 patch.
**Industry standard:** Changesets (semi-automatic, review-gated, monorepo-native).

### 7. AI-Readiness

Best-in-class. llms.txt, llms-full.txt, Storybook MCP server, bidirectional AI agent feedback protocol. Only Ant Design and Nord come close, and neither has the feedback loop.

### 8. Accessibility

Vendored Radix (full ARIA + keyboard), 43 vitest-axe test files, jsx-a11y at ERROR level, WCAG 2.2 AA target. Gaps: no screen reader testing process, no automated dark mode contrast verification, WCAG 2.2 new criteria (focus appearance, target size) not explicitly audited.

---

## Priority Matrix — All Improvements

### Tier 1: Immediate (done or in-progress)

| # | Item | Status |
|---|------|--------|
| 1 | Fix missing subpath exports (icon, devalok-grain, ai/types + 4 more) | DONE |
| 2 | Add Badge `truncate` prop for fixed-width pill badges | DONE |
| 3 | Send DS notice to Karm re: StreamingText test fix | DONE |

### Tier 2: High Priority (next release cycle)

| # | Item | Area | Effort |
|---|------|------|--------|
| 4 | Complete variant audit — standardize variant/color/size on all components | API | Large |
| 5 | Adopt Changesets for release management | Release | Medium |
| 6 | Add Chromatic for visual regression testing | Testing | Medium |
| 7 | Add date-picker tests (10 source files, 0 tests) | Testing | Medium |
| 8 | Consolidate post-build scripts into single process with rollback | Build | Medium |

### Tier 3: Medium Priority

| # | Item | Area | Effort |
|---|------|------|--------|
| 9 | Clean up legacy typography (T1-Reg, B2-Reg classes) | Tokens | Medium |
| 10 | Create migration guide page (link all version migrations) | Docs | Low |
| 11 | WCAG 2.2 gap analysis (focus appearance, target size) | A11y | Medium |
| 12 | Auto-generate llms.txt from component source | Docs | Medium |
| 13 | Add bundle size budget check in CI | Build | Low |
| 14 | Automate server-safe allowlist (detect from source instead of hardcoding) | Build | Medium |

### Tier 4: Low Priority / Future

| # | Item | Area | Effort |
|---|------|------|--------|
| 15 | Evaluate Tailwind v4 migration (@theme directive) | Tokens | Large |
| 16 | Add TypeScript discriminated unions for controlled components | API | Low |
| 17 | Standardize Badge compound export pattern (named exports vs Object.assign) | API | Low |
| 18 | Add charts + tree-view + AI test coverage | Testing | Medium |
| 19 | Add "getting started" tutorial | Docs | Low |
| 20 | W3C DTCG token format evaluation | Tokens | Medium |
| 21 | Link design-philosophy.md from README | Docs | Trivial |
| 22 | De-duplicate root vs packages/core README | Docs | Low |

---

## Variant Audit Detail (Item #4)

The single highest-impact API improvement. Industry norm (Mantine v7): every interactive component has `variant`, `color`, `size` axes.

**Current state:**

| Component | variant | color | size | Notes |
|-----------|---------|-------|------|-------|
| Button | solid, soft, outline, ghost, link | accent, error, success, warning, neutral | xs, sm, md, lg + compact + icon | Complete |
| Badge | subtle, solid, outline, soft | 15 colors + custom | xs, sm, md, lg | Complete |
| Alert | subtle, filled, outline | info, success, warning, error, neutral | NONE | Needs size |
| Input | NONE | NONE (`state` prop) | xs, sm, md, lg | Needs variant, rename state→validation |
| Card | default, elevated, outline, flat | NONE | NONE | Needs color, size |
| Tabs | line, contained (on TabsList) | NONE | NONE | Needs color, size |
| Select | NONE | NONE | xs, sm, md, lg (trigger only) | Needs variant, color |

**Target:** Every component above should support at minimum `variant` + `color` + `size`. Breaking change — do this before 1.0.

---

## Changesets Adoption Detail (Item #5)

**Why:** Manual publishing already caused v0.8.0 incident. Changesets adds:
- Per-PR change documentation (`.changeset/*.md`)
- Coordinated multi-package version bumps
- Auto-generated CHANGELOG
- GitHub Action opens "Version Packages" PR for review
- Your pre-publish-audit.mjs remains as additional gate

**Integration path:**
1. `pnpm add -Dw @changesets/cli @changesets/changelog-github`
2. `pnpm changeset init`
3. Add GitHub Action for versioning PR
4. Keep pre-publish-audit.mjs as post-version hook

---

## Chromatic Detail (Item #6)

**Why:** Catches visual regressions that unit tests miss. Their 2025 a11y regression feature flags only *new* violations (relevant for EAA compliance).

**Integration path:**
1. `pnpm add -Dw chromatic`
2. Add `chromatic` step to CI workflow after Storybook build
3. Configure project token
4. ~5 min added to CI pipeline

---

## Post-Build Consolidation Detail (Item #8)

**Current:** 4 sequential shell commands with no error propagation:
```
vite build → copy-tokens → fix-dts-primitives → inject-use-client → build-tailwind-cjs
```

**Risk:** If `fix-dts-primitives` fails, subsequent steps run on incomplete dist/.

**Target:** Single `scripts/post-build.mjs` that:
1. Runs each step as an imported function
2. Rolls back (rm dist/) on any failure
3. Reports which step failed
4. Exits non-zero to block publish
