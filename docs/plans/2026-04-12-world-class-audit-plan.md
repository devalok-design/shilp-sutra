# World-Class Design System Audit — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Execute the comprehensive audit defined in `docs/plans/2026-04-12-world-class-audit-design.md`, producing a complete set of findings, ratings, and a prioritized roadmap.

**Architecture:** The audit produces a directory of reports at `docs/audits/2026-04-12-world-class/`. Each task reads the actual codebase, researches what industry leaders do for the same concern, rates each audit item, and documents findings. Phase 5 cross-references everything and produces the final prioritized roadmap.

**Tech Stack:** File reading, web research, grep/glob for codebase-wide patterns, markdown output.

---

## Output Structure

All reports go in `docs/audits/2026-04-12-world-class/`:

```
docs/audits/2026-04-12-world-class/
  README.md                  ← Index of all reports
  01a-color-system.md
  01b-typography-system.md
  01c-spacing-system.md
  01d-surface-shadow.md
  01e-motion-system.md
  01f-remaining-tokens.md
  02a-tailwind-preset.md
  02b-build-pipeline.md
  02c-storybook.md
  02d-testing.md
  02e-linting-types.md
  02f-ci-cd.md
  02g-token-interop.md
  02h-consumer-dx.md
  03a-actions.md
  03b-form-inputs.md
  03c-form-infrastructure.md
  03d-data-display.md
  03e-media-icons.md
  03f-feedback.md
  03g-overlays.md
  03h-navigation.md
  03i-layout.md
  03j-data-heavy.md
  03k-charts.md
  03l-content.md
  03m-shell.md
  03n-ai.md
  03o-utilities-composed.md
  03p-chat.md
  03q-date-picker.md
  04-cross-cutting.md
  05-validation.md
  06-roadmap.md
  00-executive-summary.md    ← Written last
```

## Report Template

Every report file follows this structure:

```markdown
# [Section Name] Audit

**Phase:** [1a/2b/3c/etc.]
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: [World-class / Strong / Adequate / Gap / Critical Gap]

## Findings

### [Audit Item Name]

**Rating:** [World-class / Strong / Adequate / Gap / Critical Gap]

**Current State:**
[Describe what shilp-sutra does today. Include file paths, line numbers, actual code/token values.]

**World-Class Standard:**
[Describe what industry leaders do. Name the specific system(s) and how they handle this. Link to docs/source where possible.]

**Gap Analysis:**
[Specific delta between current state and world-class. Be concrete — not "needs improvement" but "missing X, Y, Z".]

**Recommendation:**
[What to change. Include specific technical approach.]

**Effort:** [S (< 1 day) / M (1-3 days) / L (3-5 days) / XL (5+ days)]

**Priority:** [P0 / P1 / P2 / P3]

**Affected Components:** [List of components that inherit this issue, if foundation-level]

---
[Repeat for each audit item]

## Summary Table

| Audit Item | Rating | Priority | Effort |
|------------|--------|----------|--------|
| ... | ... | ... | ... |
```

---

## Phase 1: Foundations Audit

### Task 1: Color System Audit

**Output:** `docs/audits/2026-04-12-world-class/01a-color-system.md`

**Files to read:**
- `packages/core/src/tokens/primitives.css` — All 14 OKLCH color scales
- `packages/core/src/tokens/semantic.css` — Semantic color mappings
- `packages/core/src/tokens/generate-scale.ts` — Scale generation algorithm
- `packages/core/src/tailwind/preset.ts` — Color utility mappings

**Step 1: Read all color token files**
Read `primitives.css`, `semantic.css`, `generate-scale.ts`. Document:
- Every primitive scale (name, hue, peak chroma, step count)
- Every semantic mapping (role → primitive reference)
- Dark mode overrides (what changes, what stays)
- The lightness/chroma curves in `generate-scale.ts`

**Step 2: Research benchmark color systems**
Web search for:
- "Radix Colors OKLCH scale design" — understand their 12-step P3-ready approach
- "Material Design 3 HCT color system" — tonal palette algorithm
- "Carbon Design System color tokens" — 10-step scale structure
- "Linear app OKLCH color system" — their approach to perceptual uniformity
- "WCAG 2.2 contrast requirements" + "APCA contrast algorithm" — standards

**Step 3: Audit each item**
For each of the 11 audit items in the design doc (color space choice, scale structure, chroma distribution, semantic completeness, dark mode, status colors, category colors, chart palette, accent swappability, P3 gamut, contrast ratios):
- Rate against the rubric
- Document specific gaps with file paths and line numbers
- Note which components are affected

**Step 4: Verify contrast ratios**
For every semantic text/background pair, calculate the OKLCH contrast ratio:
- `surface-fg` on `surface-base` (light + dark)
- `surface-fg-muted` on `surface-base` (light + dark)
- `surface-fg-subtle` on `surface-base` (light + dark)
- `accent-fg` on `accent-9` (light + dark)
- All status text on status backgrounds
- Verify AA compliance (4.5:1 normal text, 3:1 large text)

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/01a-color-system.md
git commit -m "audit(foundations): color system audit against industry benchmarks"
```

---

### Task 2: Typography System Audit

**Output:** `docs/audits/2026-04-12-world-class/01b-typography-system.md`

**Files to read:**
- `packages/core/src/tokens/typography.css` — Font faces, primitive type tokens
- `packages/core/src/tokens/typography-semantic.css` — Semantic type variants
- `packages/core/src/tailwind/preset.ts` — Font size/weight/line-height mappings
- `packages/core/src/ui/text.tsx` — Text component implementation

**Step 1: Read all typography token files**
Document the complete type system:
- Font families (sans, display, body, accent, mono)
- The full size scale (xs through 6xl) with px values
- All semantic variants (headings, body, labels, caption, overline) with their size/weight/line-height/tracking combos
- Line height scale, letter spacing scale, font weight scale

**Step 2: Analyze the type scale mathematically**
Calculate the ratio between consecutive font sizes:
- 10 → 12 → 14 → 16 → 18 → 20 → 24 → 32 → 36 → 48 → 60
- Ratios: 1.2, 1.17, 1.14, 1.125, 1.11, 1.2, 1.33, 1.125, 1.33, 1.25
- Compare with major third (1.25), minor third (1.2), perfect fourth (1.33)

**Step 3: Research benchmark typography systems**
Web search for:
- "Material Design 3 typography type scale" — their 15-role system
- "Carbon Design System typography productive expressive" — dual-mode type
- "Geist font Vercel type system" — modern type scale
- "Utopia fluid type scale" — responsive type approach
- "NNG ALL CAPS readability research" — label uppercase evidence

**Step 4: Audit each item**
For each of the 10 audit items (scale ratio, completeness, semantic variants, font stack, line heights, letter spacing, responsive, font loading, weight distribution, label convention):
- Rate, document, identify gaps

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/01b-typography-system.md
git commit -m "audit(foundations): typography system audit against industry benchmarks"
```

---

### Task 3: Spacing System Audit

**Output:** `docs/audits/2026-04-12-world-class/01c-spacing-system.md`

**Files to read:**
- `packages/core/src/tokens/semantic.css` — Spacing token definitions (grep for `--spacing-`)
- `packages/core/src/tailwind/preset.ts` — Spacing utility mappings

**Step 1: Read and document the spacing scale**
Extract every `--spacing-*` token with its value. Map the full scale and note the multiplier pattern.

**Step 2: Audit component spacing token usage**
Run grep across all component files to check:
```
grep -r "p-\[" packages/core/src/ui/    # hardcoded padding
grep -r "m-\[" packages/core/src/ui/    # hardcoded margin
grep -r "gap-\[" packages/core/src/ui/  # hardcoded gap
grep -r "px\]" packages/core/src/ui/    # any hardcoded px values
```
vs token usage:
```
grep -r "ds-spacing" packages/core/src/  # proper token references
grep -r "p-ds-" packages/core/src/       # proper TW token classes
```

**Step 3: Research benchmark spacing systems**
Web search for:
- "Carbon Design System spacing scale 2rem" — their structured system
- "Material Design 3 spacing system" — 4dp increments
- "Tailwind CSS spacing scale" — complete reference
- "Primer spacing scale GitHub" — their approach

**Step 4: Audit each item**
6 audit items: base unit, scale gaps, naming convention, coverage, component consistency, layout spacing.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/01c-spacing-system.md
git commit -m "audit(foundations): spacing system audit against industry benchmarks"
```

---

### Task 4: Surface & Shadow System Audit

**Output:** `docs/audits/2026-04-12-world-class/01d-surface-shadow.md`

**Files to read:**
- `packages/core/src/tokens/semantic.css` — Surface + shadow token definitions
- `packages/core/src/tailwind/preset.ts` — Shadow utility mappings
- `packages/core/src/tokens/grain.md` — Emerging grain/texture spec

**Step 1: Read and document the full surface + shadow system**
Extract all `--color-surface-*` and `--shadow-*` tokens. Map the elevation hierarchy, document each shadow layer composition.

**Step 2: Audit shadow rendering**
For each shadow level (xs/sm/md/lg), analyze:
- Number of shadow layers
- Blur radii and spread values
- Color and opacity
- Direction/offset (consistent light source?)
- Dark mode multiplier effect

**Step 3: Research benchmark systems**
Web search for:
- "Material Design 3 tonal elevation surface" — their shadow replacement
- "Linear app shadow design multi-layer" — their approach
- "Stripe shadow design system" — refined shadow patterns
- "Shadow design best practices layered shadows" — Josh Comeau, etc.

**Step 4: Audit each item**
6 audit items: surface hierarchy, shadow realism, dark mode shadows, elevation-z mapping, effect shadows, disabled surfaces.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/01d-surface-shadow.md
git commit -m "audit(foundations): surface and shadow system audit"
```

---

### Task 5: Motion System Audit

**Output:** `docs/audits/2026-04-12-world-class/01e-motion-system.md`

**Files to read:**
- `packages/core/src/tokens/semantic.css` — Duration + easing tokens, keyframe definitions
- `packages/core/src/tailwind/preset.ts` — Animation/transition mappings
- Grep for `prefers-reduced-motion` across entire `packages/core/src/`
- Grep for `framer-motion` or `motion` imports to understand Framer usage patterns

**Step 1: Document the complete motion system**
- All duration tokens with values
- All easing functions with cubic-bezier values
- All keyframe animations
- Framer Motion presets (search for `springs`, `tweens`, motion config files)

**Step 2: Audit reduced-motion compliance**
```
grep -r "prefers-reduced-motion" packages/core/src/
grep -r "useReducedMotion" packages/core/src/
```
Every animation must have a reduced-motion fallback. List any that don't.

**Step 3: Research benchmark motion systems**
Web search for:
- "Carbon Design System motion guidelines productive expressive" — the original
- "Material Design 3 motion tokens duration easing" — their system
- "Linear app animations framer motion" — craft reference
- "prefers-reduced-motion best practices" — WAI/a11y guidelines

**Step 4: Audit each item**
7 audit items: duration scale, easing philosophy, reduced-motion, Framer integration, entrance/exit, scroll motion, performance.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/01e-motion-system.md
git commit -m "audit(foundations): motion system audit against industry benchmarks"
```

---

### Task 6: Remaining Tokens Audit

**Output:** `docs/audits/2026-04-12-world-class/01f-remaining-tokens.md`

**Files to read:**
- `packages/core/src/tokens/semantic.css` — Radius, z-index, sizing, border, breakpoint, opacity tokens
- `packages/core/src/tailwind/preset.ts` — All remaining mappings

**Step 1: Document all remaining token categories**
Extract and document:
- `--radius-*` tokens (7 levels)
- `--z-*` tokens (9 levels)
- `--size-*` and `--icon-*` tokens
- `--border-width-*` and `--border-focus-*` tokens
- `--breakpoint-*` tokens
- `--action-*-opacity` tokens

**Step 2: Audit cross-component consistency**
For size tokens specifically, grep every component that accepts a `size` prop and verify they map to the same `--size-*` tokens:
```
grep -r "size.*xs\|size.*sm\|size.*md\|size.*lg" packages/core/src/ui/ --include="*.tsx"
```

**Step 3: Research benchmarks**
Web search for:
- "Material Design 3 shape tokens border radius" — their 4-level system
- "Carbon Design System z-index layers" — their 5-layer model
- "Design system component sizing consistency" — best practices

**Step 4: Audit each item**
6 audit items: radius scale, z-index scale, component sizing, border width, breakpoints, opacity tokens.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/01f-remaining-tokens.md
git commit -m "audit(foundations): remaining tokens audit (radius, z-index, sizing, borders)"
```

---

## Phase 2: Infrastructure Audit

### Task 7: Tailwind Preset Audit

**Output:** `docs/audits/2026-04-12-world-class/02a-tailwind-preset.md`

**Files to read:**
- `packages/core/src/tailwind/preset.ts` — Full preset (read entire file)
- `packages/core/src/tailwind/index.ts` — Export
- `packages/core/src/tokens/semantic.css` — Cross-reference for orphaned tokens

**Step 1: Read the entire preset and document its structure**
Catalog every section: colors, spacing, typography, shadows, animations, custom utilities, plugins.

**Step 2: Cross-reference tokens ↔ preset**
Check for:
- CSS vars in semantic.css with no corresponding Tailwind utility
- Tailwind utilities that reference non-existent CSS vars
- Naming inconsistencies between CSS var names and TW class names

**Step 3: Research benchmark approaches**
Web search for:
- "shadcn ui tailwind config design system" — their approach to overriding defaults
- "Tailwind CSS preset best practices" — official guidance
- "Design system Tailwind plugin architecture" — composability patterns

**Step 4: Audit each item**
8 audit items: namespace strategy, token coverage, naming consistency, composability, dark mode, custom utilities, responsive behavior, plugin architecture.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02a-tailwind-preset.md
git commit -m "audit(infra): tailwind preset audit"
```

---

### Task 8: Build Pipeline Audit

**Output:** `docs/audits/2026-04-12-world-class/02b-build-pipeline.md`

**Files to read:**
- `packages/core/vite.config.ts` — Vite library build config
- `packages/core/package.json` — exports, files, dependencies, peerDependencies
- `packages/core/tsconfig.json` — TypeScript config
- `packages/core/scripts/post-build.mjs` — Post-build pipeline orchestrator
- `packages/core/scripts/inject-use-client.mjs` — "use client" injection
- `packages/core/scripts/build-tailwind-cjs.mjs` — CJS conversion
- `packages/core/scripts/copy-tokens.mjs` — Token copy step
- `packages/core/scripts/fix-dts-primitives.mjs` — DTS path rewrite
- `packages/core/scripts/ssr-smoke-test.mjs` — SSR verification

**Step 1: Read all build config and scripts**
Understand the complete build pipeline: Vite config → post-build steps → output structure.

**Step 2: Analyze bundle output**
```bash
du -sh packages/core/dist/                    # Total bundle size
find packages/core/dist/ -name "*.js" | head  # JS output files
find packages/core/dist/_chunks/ -name "*.js" # Chunk files
```
Measure total size and identify largest chunks.

**Step 3: Verify tree-shaking**
Check: if a consumer imports only `Button`, what else gets pulled in? Examine the chunk graph.

**Step 4: Research benchmark build approaches**
Web search for:
- "Mantine v7 build pipeline tsup" — their approach
- "Radix Themes build configuration" — their approach
- "Library tree shaking best practices vite" — optimization patterns
- "React Server Components library use client" — directive best practices

**Step 5: Audit each item**
11 audit items: entry points, chunks, bundle size, tree-shaking, use-client, SSR, CJS/ESM, sourcemaps, CSS delivery, externalization, post-build pipeline.

**Step 6: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02b-build-pipeline.md
git commit -m "audit(infra): build pipeline audit"
```

---

### Task 9: Storybook Setup Audit

**Output:** `docs/audits/2026-04-12-world-class/02c-storybook.md`

**Files to read:**
- `.storybook/main.ts` — Storybook config (addons, stories glob, framework)
- `.storybook/preview.ts` — Decorators, global types, parameters
- `.storybook/manager.ts` — Manager/sidebar config
- `.storybook/theme.ts` — Custom theme
- `.storybook/vite.config.ts` — Vite config for Storybook
- Sample 3-4 story files to evaluate patterns (e.g., `button.stories.tsx`, `dialog.stories.tsx`, `data-table.stories.tsx`, `sidebar.stories.tsx`)

**Step 1: Read Storybook config files and sample stories**
Document: addons installed, organization structure, decorator chain, arg types patterns, autodocs config.

**Step 2: Audit story coverage**
```bash
# Count components vs stories
find packages/core/src -name "*.stories.tsx" | wc -l
find packages/core/src -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx" | wc -l
```
Identify components without stories.

**Step 3: Check for play functions**
```
grep -r "play:" packages/core/src/ --include="*.stories.tsx" -l
```
Count stories with interaction tests.

**Step 4: Research benchmark Storybook setups**
Web search for:
- "Carbon Design System Storybook organization" — their structure
- "Mantine Storybook setup" — their approach
- "Storybook best practices 2026 addons" — current recommendations
- "Chromatic visual testing design system" — visual regression

**Step 5: Audit each item**
12 audit items: organization, autodocs, coverage, controls, a11y addon, visual testing, play functions, story patterns, dark mode, viewports, MCP server, performance stories.

**Step 6: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02c-storybook.md
git commit -m "audit(infra): storybook setup audit"
```

---

### Task 10: Testing Infrastructure Audit

**Output:** `docs/audits/2026-04-12-world-class/02d-testing.md`

**Files to read:**
- `packages/core/vitest.config.ts` (or equivalent — find it)
- `packages/core/src/ui/__tests__/setup.ts` (or test setup file — find it)
- Sample 3-4 test files (e.g., `button.test.tsx`, `dialog.test.tsx`, `select.test.tsx`, `command-palette.test.tsx`)
- `.github/workflows/ci.yml` — Test step in CI

**Step 1: Read test config and sample tests**
Document: Vitest config, setup files (jsdom mocks, polyfills), test patterns used, assertion styles.

**Step 2: Audit test coverage metrics**
```bash
cd packages/core && pnpm vitest --coverage --run 2>/dev/null | tail -20
```
Or check if coverage config exists in vitest.config.

**Step 3: Audit test quality patterns**
Grep for:
```
grep -r "userEvent" packages/core/src/ --include="*.test.tsx" -l     # User event testing
grep -r "axe" packages/core/src/ --include="*.test.tsx" -l           # Accessibility testing
grep -r "keyboard\|tab\|Tab\|ArrowDown" packages/core/src/ --include="*.test.tsx" -l  # Keyboard tests
grep -r "toMatchSnapshot" packages/core/src/ --include="*.test.tsx" -l  # Snapshot tests
```

**Step 4: Research benchmark testing approaches**
Web search for:
- "Mantine testing strategy Playwright" — their dual approach
- "React Testing Library best practices 2026" — current guidance
- "Design system accessibility testing automation" — a11y patterns
- "Visual regression testing Chromatic design system" — industry standard

**Step 5: Audit each item**
9 audit items: coverage, patterns, a11y testing, keyboard testing, snapshots, mocks, E2E, visual regression, performance.

**Step 6: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02d-testing.md
git commit -m "audit(infra): testing infrastructure audit"
```

---

### Task 11: Linting & Type Safety Audit

**Output:** `docs/audits/2026-04-12-world-class/02e-linting-types.md`

**Files to read:**
- `eslint.config.*` or `.eslintrc.*` — ESLint configuration (find it)
- `packages/core/tsconfig.json` — TypeScript config
- `tsconfig.json` (root) — Base TypeScript config

**Step 1: Read linting and TypeScript configs**

**Step 2: Count type safety escape hatches**
```bash
grep -r "@ts-ignore\|@ts-expect-error\|@ts-nocheck" packages/core/src/ --include="*.ts" --include="*.tsx" | grep -v primitives | wc -l
grep -r "as any" packages/core/src/ --include="*.ts" --include="*.tsx" | grep -v primitives | wc -l
```

**Step 3: Audit exported types**
```bash
# Check how many components export their props type
grep -r "export.*Props" packages/core/src/ui/ --include="*.tsx" -l | wc -l
# vs total component files
find packages/core/src/ui/ -maxdepth 1 -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx" | wc -l
```

**Step 4: Research and audit each item**
5 audit items: TS strictness, exported types, ESLint config, module boundaries, generics.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02e-linting-types.md
git commit -m "audit(infra): linting and type safety audit"
```

---

### Task 12: CI/CD Pipeline Audit

**Output:** `docs/audits/2026-04-12-world-class/02f-ci-cd.md`

**Files to read:**
- `.github/workflows/ci.yml` — Main CI pipeline
- `.github/workflows/deploy-storybook.yml` — Storybook deployment
- `.github/workflows/release.yml` — Release automation (Changesets)
- `.github/workflows/visual-review.yml` — Chromatic visual review
- `.changeset/config.json` (if exists) — Changesets config

**Step 1: Read all workflow files**
Document every job, step, trigger, and gate.

**Step 2: Identify missing gates**
Compare against: typecheck, lint, test, build, SSR smoke, bundle size check, visual regression, Storybook deploy, publish.

**Step 3: Research benchmark CI/CD**
Web search for:
- "Carbon Design System CI CD pipeline GitHub Actions" — enterprise reference
- "Mantine CI GitHub Actions" — their pipeline
- "Changesets GitHub Action automated releases" — release automation

**Step 4: Audit each item**
7 audit items: completeness, PR checks, Changesets, bundle size tracking, visual regression, publish automation, branch protection.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02f-ci-cd.md
git commit -m "audit(infra): CI/CD pipeline audit"
```

---

### Task 13: Design Token Interoperability Audit

**Output:** `docs/audits/2026-04-12-world-class/02g-token-interop.md`

**Files to read:**
- `packages/core/src/tokens/` — All token source files
- Any `tokens.json`, `.tokens`, or Style Dictionary config (search for them)
- `docs/design-philosophy.md` — Design intent

**Step 1: Check for existing interop tooling**
```bash
find . -name "tokens.json" -o -name ".tokens" -o -name "style-dictionary*" -o -name "figma*tokens*" 2>/dev/null
grep -r "style-dictionary\|tokens-studio\|figma" package.json packages/*/package.json
```

**Step 2: Research benchmark interop approaches**
Web search for:
- "W3C Design Token Community Group format spec 2026" — standard
- "Style Dictionary design system tokens" — Amazon's tool
- "Tokens Studio Figma design tokens" — Figma sync
- "Carbon Design System Figma token sync" — enterprise approach

**Step 3: Audit each item**
4 audit items: W3C format, Figma sync, Style Dictionary, designer handoff.

**Step 4: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02g-token-interop.md
git commit -m "audit(infra): design token interoperability audit"
```

---

### Task 14: Consumer DX Audit

**Output:** `docs/audits/2026-04-12-world-class/02h-consumer-dx.md`

**Files to read:**
- `packages/core/package.json` — Install surface (dependencies, peerDependencies, exports)
- `packages/core/llms.txt` — AI-facing quick-start docs
- `packages/core/llms-full.txt` — Full reference
- `packages/core/README.md` (if exists)
- `CONTRIBUTING.md` — Does it cover consumer setup?

**Step 1: Simulate first-use experience**
Walk through the steps a new consumer would take:
1. `pnpm add @devalok/shilp-sutra`
2. Import tokens CSS — how? Where documented?
3. Configure Tailwind preset — how? Where documented?
4. Add `transpilePackages` — how? Where documented?
5. Render first component — what's the minimal code?
Count the steps and friction points.

**Step 2: Audit TypeScript DX**
Check autocomplete quality: are prop types well-documented with JSDoc? Are variant literal unions clear in IDE tooltips?

**Step 3: Research benchmark DX**
Web search for:
- "shadcn ui CLI init setup" — best-in-class first-use
- "Mantine getting started guide" — docs quality
- "Chakra UI provider setup" — their approach

**Step 4: Audit each item**
5 audit items: first-use, error messages, upgrade experience, TS DX, bundle debugging.

**Step 5: Write report and commit**

```bash
git add docs/audits/2026-04-12-world-class/02h-consumer-dx.md
git commit -m "audit(infra): consumer developer experience audit"
```

---

## Phase 3: Component-by-Component Audit

**Parallelization note:** All component group tasks (15-31) are independent and can run in parallel as subagents.

**For every task in this phase, the agent must:**
1. Read every component source file in the group
2. Read every test file in the group
3. Read every story file in the group
4. Research what benchmarks do for each component
5. Rate each component on all 10 axes (API, variants, visual, dark mode, a11y, responsive, motion, bundle, tests, stories)
6. Run the group-specific cross-checks
7. Write findings to the report file

---

### Task 15: Group A — Actions Audit

**Output:** `docs/audits/2026-04-12-world-class/03a-actions.md`

**Component files to read:**
- `packages/core/src/ui/button.tsx`
- `packages/core/src/ui/button-group.tsx`
- `packages/core/src/ui/button-processing.tsx`
- `packages/core/src/ui/split-button.tsx`
- `packages/core/src/ui/toggle.tsx`
- `packages/core/src/ui/toggle-group.tsx`
- `packages/core/src/ui/segmented-control.tsx`

**Test files:** `button.test.tsx`, `button-group.test.tsx`, `toggle.test.tsx`, `toggle-group.test.tsx`

**Story files:** `button.stories.tsx`, `button-group.stories.tsx`, `button-processing.stories.tsx`, `split-button.stories.tsx`, `toggle.stories.tsx`, `toggle-group.stories.tsx`, `segmented-control.stories.tsx`

**Note:** Link component lives elsewhere — search for it. IconButton may be part of button.tsx or separate.

**Benchmark research:**
- "shadcn ui Button component API props" — API reference
- "Mantine Button variants sizes" — variant matrix
- "Linear app button design states" — polish reference
- "WAI-ARIA APG button pattern" — a11y standard

**Cross-checks:**
- Do all 8 components share identical `variant` and `color` value sets?
- Same `size` scale?
- Same focus ring style (`.focus-ring` utility)?
- Same disabled treatment (opacity, cursor)?
- Same loading state pattern?

**Commit:** `audit(components): Group A — actions audit`

---

### Task 16: Group B — Form Inputs Audit

**Output:** `docs/audits/2026-04-12-world-class/03b-form-inputs.md`

**Component files to read:**
- `packages/core/src/ui/input.tsx` (and `input-otp.tsx`)
- `packages/core/src/ui/textarea.tsx`
- `packages/core/src/ui/search-input.tsx`
- `packages/core/src/ui/number-input.tsx` (search for it)
- `packages/core/src/ui/color-input.tsx`
- `packages/core/src/ui/select.tsx`
- `packages/core/src/ui/combobox.tsx`
- `packages/core/src/ui/autocomplete.tsx`
- `packages/core/src/ui/checkbox.tsx`
- `packages/core/src/ui/radio.tsx`
- `packages/core/src/ui/switch.tsx`
- `packages/core/src/ui/slider.tsx`

**Test + story files:** All corresponding `.test.tsx` and `.stories.tsx`

**Benchmark research:**
- "Mantine form components Input Select Checkbox" — most complete suite
- "Chakra UI form integration react hook form" — form patterns
- "Carbon Design System form patterns" — enterprise forms
- "WAI-ARIA APG combobox pattern" + "WAI-ARIA APG checkbox pattern" — a11y

**Cross-checks:**
- At the same `size` value, do Input, Select, Combobox, Autocomplete all render at the same height?
- Same border color, width, radius, focus ring across all inputs?
- Same error state visual (border-error-7? shadow-error? aria-invalid)?
- Same disabled state (opacity, cursor, background)?
- Do all text-entry inputs support `placeholder` consistently?
- Do all inputs forward `ref` correctly?

**Commit:** `audit(components): Group B — form inputs audit`

---

### Task 17: Group C — Form Infrastructure Audit

**Output:** `docs/audits/2026-04-12-world-class/03c-form-infrastructure.md`

**Component files to read:**
- `packages/core/src/ui/form.tsx` (search for useFormField, FormItem, FormLabel, etc.)
- `packages/core/src/ui/label.tsx`
- `packages/core/src/composed/form-section.tsx`

**Test + story files:** All corresponding

**Benchmark research:**
- "react-hook-form integration design system" — integration patterns
- "Mantine useForm" — form library approach
- "WAI-ARIA forms best practices" — a11y

**Cross-checks:**
- Does `useFormField()` correctly wire `aria-invalid`, `aria-describedby`, `id` on every input?
- Is error message display consistent (position, styling, animation)?

**Commit:** `audit(components): Group C — form infrastructure audit`

---

### Task 18: Group D — Data Display Audit

**Output:** `docs/audits/2026-04-12-world-class/03d-data-display.md`

**Component files to read:**
- `packages/core/src/ui/text.tsx`
- `packages/core/src/ui/code.tsx`
- `packages/core/src/ui/card.tsx`
- `packages/core/src/ui/stat-card.tsx`
- `packages/core/src/ui/badge.tsx`, `badge-group.tsx`, `badge-indicator.tsx`
- `packages/core/src/ui/status-dot.tsx`
- `packages/core/src/composed/deadline-indicator.tsx`
- `packages/core/src/composed/priority-indicator.tsx`

**Test + story files:** All corresponding

**Benchmark research:**
- "Radix Themes Text component API" — API reference
- "Linear card design" — polish reference
- "Carbon Tag component" — tag/badge patterns
- "Stripe stat card design" — statistics display

**Cross-checks:**
- Do Card, Badge, Alert, StatusDot all accept the same `color` values?
- Do Text, Badge, Card all use consistent `size` values?

**Commit:** `audit(components): Group D — data display audit`

---

### Task 19: Group E — Media & Icons Audit

**Output:** `docs/audits/2026-04-12-world-class/03e-media-icons.md`

**Component files to read:**
- `packages/core/src/ui/icon.tsx` (search also for icon-button, icon-group, icon-context)
- `packages/core/src/ui/avatar.tsx`
- `packages/core/src/composed/avatar-group.tsx`

**Benchmark research:**
- "Primer Octicons icon system" — GitHub's approach
- "Carbon icon system sizing" — enterprise icons
- "Linear avatar component design" — polish
- "WAI-ARIA img role icon" — a11y

**Commit:** `audit(components): Group E — media and icons audit`

---

### Task 20: Group F — Feedback Audit

**Output:** `docs/audits/2026-04-12-world-class/03f-feedback.md`

**Component files to read:**
- `packages/core/src/ui/alert.tsx`
- `packages/core/src/ui/banner.tsx`
- `packages/core/src/ui/toast.tsx`, `toaster.tsx`, `toast-types.ts`
- `packages/core/src/ui/spinner.tsx`
- `packages/core/src/ui/progress.tsx`, `progress-ring.tsx`
- `packages/core/src/ui/skeleton.tsx`
- `packages/core/src/composed/loading-skeleton.tsx`

**Benchmark research:**
- "Mantine Notifications component" — notification patterns
- "Carbon InlineNotification vs ToastNotification" — dual pattern
- "WAI-ARIA alert role live region" — a11y
- "Stripe loading states design" — polish

**Cross-checks:**
- Alert, Banner, Toast all accept same `color` axis? Same icon auto-selection logic?
- Consistent dismiss pattern (X button, swipe, auto-dismiss)?
- Toast ARIA: `role="status"` or `role="alert"`? `aria-live`?

**Commit:** `audit(components): Group F — feedback audit`

---

### Task 21: Group G — Overlays Audit

**Output:** `docs/audits/2026-04-12-world-class/03g-overlays.md`

**Component files to read:**
- `packages/core/src/ui/dialog.tsx`
- `packages/core/src/ui/alert-dialog.tsx`
- `packages/core/src/composed/confirm-dialog.tsx`
- `packages/core/src/ui/sheet.tsx`
- `packages/core/src/ui/popover.tsx`
- `packages/core/src/ui/hover-card.tsx`
- `packages/core/src/ui/tooltip.tsx`
- `packages/core/src/composed/simple-tooltip.tsx`
- `packages/core/src/ui/dropdown-menu.tsx` (search for it)
- `packages/core/src/ui/context-menu.tsx`

**Benchmark research:**
- "Radix Dialog accessibility focus trap" — primitive reference
- "shadcn ui Dialog Sheet API" — API patterns
- "Material Design 3 dialog bottom sheet" — patterns
- "Linear dialog animation" — polish
- "WAI-ARIA APG dialog modal pattern" — a11y standard

**Cross-checks:**
- Same enter/exit animation across all overlays?
- Same backdrop (color, blur, opacity)?
- Same Escape dismissal behavior?
- Focus trap in all modals? Focus restoration on close?
- Z-index layering correct? (tooltip > popover > modal > overlay > dropdown)

**Commit:** `audit(components): Group G — overlays audit`

---

### Task 22: Group H — Navigation Audit

**Output:** `docs/audits/2026-04-12-world-class/03h-navigation.md`

**Component files to read:**
- `packages/core/src/ui/tabs.tsx`
- `packages/core/src/ui/breadcrumb.tsx`
- `packages/core/src/ui/pagination.tsx`
- `packages/core/src/ui/navigation-menu.tsx`
- `packages/core/src/ui/menubar.tsx`
- `packages/core/src/ui/stepper.tsx`

**Benchmark research:**
- "Carbon Tabs component" — enterprise tabs
- "Primer navigation components" — GitHub's approach
- "Material tabs navigation pattern" — patterns
- "Mantine Stepper component" — stepper reference
- "WAI-ARIA APG tabs pattern" — a11y

**Cross-checks:**
- Active/selected state uses same styling approach?
- Keyboard nav: Arrow keys between items, Tab to exit group?

**Commit:** `audit(components): Group H — navigation audit`

---

### Task 23: Group I — Layout Audit

**Output:** `docs/audits/2026-04-12-world-class/03i-layout.md`

**Component files to read:**
- `packages/core/src/ui/stack.tsx`
- `packages/core/src/ui/container.tsx`
- `packages/core/src/ui/separator.tsx`
- `packages/core/src/ui/aspect-ratio.tsx`
- `packages/core/src/ui/accordion.tsx`
- `packages/core/src/ui/collapsible.tsx`
- `packages/core/src/composed/master-detail.tsx`

**Benchmark research:**
- "Chakra Stack component API" — layout primitive reference
- "Carbon grid container" — enterprise layout
- "WAI-ARIA APG accordion pattern" — a11y

**Commit:** `audit(components): Group I — layout audit`

---

### Task 24: Group J — Data-Heavy Audit

**Output:** `docs/audits/2026-04-12-world-class/03j-data-heavy.md`

**Component files to read:**
- `packages/core/src/ui/data-table.tsx`
- `packages/core/src/ui/data-table-body.tsx`
- `packages/core/src/ui/data-table-header.tsx`
- `packages/core/src/ui/data-table-pagination.tsx`
- `packages/core/src/ui/data-table-toolbar.tsx`
- `packages/core/src/ui/data-table-bulk-actions.tsx`
- `packages/core/src/ui/data-table-card.tsx`
- `packages/core/src/ui/data-table-context.tsx`
- `packages/core/src/ui/table.tsx`
- `packages/core/src/composed/filter-bar.tsx`
- `packages/core/src/ui/tree-view/tree-view.tsx`
- `packages/core/src/ui/tree-view/tree-item.tsx`
- `packages/core/src/ui/tree-view/use-tree.ts`

**Benchmark research:**
- "Carbon DataTable component" — gold standard enterprise table
- "TanStack Table v8 design system integration" — headless table
- "Mantine DataTable" — TanStack + Mantine
- "AG Grid features" — feature comparison
- "WAI-ARIA APG treegrid pattern" + "WAI-ARIA APG tree view pattern"

**Cross-checks:**
- Selection pattern (single, multi, range)?
- Sort indicator consistency?
- Pagination component reuse?

**Commit:** `audit(components): Group J — data-heavy audit`

---

### Task 25: Group K — Charts Audit

**Output:** `docs/audits/2026-04-12-world-class/03k-charts.md`

**Component files to read:**
- `packages/core/src/ui/charts/area-chart.tsx`
- `packages/core/src/ui/charts/bar-chart.tsx`
- `packages/core/src/ui/charts/line-chart.tsx`
- `packages/core/src/ui/charts/pie-chart.tsx`
- `packages/core/src/ui/charts/radar-chart.tsx`
- `packages/core/src/ui/charts/gauge-chart.tsx`
- `packages/core/src/ui/charts/sparkline.tsx`
- `packages/core/src/ui/charts/chart-container.tsx`
- `packages/core/src/ui/charts/_internal/` (all files)
- `packages/core/src/ui/charts/index.ts`

**Benchmark research:**
- "Carbon Charts accessibility" — gold standard a11y data viz
- "Tremor charts design system" — DS-integrated charts
- "Recharts API patterns" — underlying library
- "WCAG data visualization accessibility" — a11y standards

**Cross-checks:**
- All charts use token colors (chart-1 through chart-8)?
- Responsive (resize on container change)?
- Accessible (patterns, labels, not just color)?

**Commit:** `audit(components): Group K — charts audit`

---

### Task 26: Group L — Content Audit

**Output:** `docs/audits/2026-04-12-world-class/03l-content.md`

**Component files to read:**
- `packages/core/src/composed/markdown-viewer.tsx`
- `packages/core/src/composed/rich-text-editor.tsx`
- `packages/core/src/composed/rich-chat-input/` (all files in directory)
- `packages/core/src/composed/rich-chat-input.tsx`
- `packages/core/src/ui/file-upload.tsx` (search for it)
- `packages/core/src/composed/file-preview/` (all files)
- `packages/core/src/composed/file-preview.tsx`
- `packages/core/src/composed/emoji-picker.tsx`
- `packages/core/src/composed/extensions/` (all files)
- `packages/core/src/composed/inline-edit.tsx`

**Benchmark research:**
- "TipTap editor React integration" — editor foundation
- "Linear rich text editor" — polish reference
- "Notion editor composition" — composition patterns
- "Mantine Dropzone file upload" — upload patterns

**Commit:** `audit(components): Group L — content audit`

---

### Task 27: Group M — Shell Audit

**Output:** `docs/audits/2026-04-12-world-class/03m-shell.md`

**Component files to read:**
- `packages/core/src/shell/sidebar.tsx`
- `packages/core/src/shell/top-bar.tsx`
- `packages/core/src/shell/bottom-navbar.tsx`
- `packages/core/src/shell/app-command-palette.tsx`
- `packages/core/src/shell/command-registry.tsx`
- `packages/core/src/shell/link-context.tsx`
- `packages/core/src/shell/notification-center.tsx`
- `packages/core/src/shell/notification-preferences.tsx`
- `packages/core/src/composed/command-palette.tsx`

**Benchmark research:**
- "Linear app shell sidebar" — polish reference
- "Stripe Dashboard shell layout" — enterprise shell
- "Vercel dashboard sidebar design" — modern shell
- "Carbon UI Shell component" — enterprise standard
- "WAI-ARIA APG navigation landmark" — a11y

**Cross-checks:**
- Shell components compose into a coherent app layout?
- Responsive behavior: sidebar collapses? Bottom nav on mobile?
- Command palette keyboard shortcut (Cmd+K)?

**Commit:** `audit(components): Group M — shell audit`

---

### Task 28: Group N — AI Components Audit

**Output:** `docs/audits/2026-04-12-world-class/03n-ai.md`

**Component files to read:**
- `packages/core/src/ai/conversation.tsx`
- `packages/core/src/ai/command-bar.tsx`
- `packages/core/src/ai/ai-command-provider.tsx`
- `packages/core/src/ai/block-renderer.tsx`
- `packages/core/src/ai/devadoot-icon.tsx`
- `packages/core/src/ai/types.ts`
- `packages/core/src/ai/blocks/` (all files: block-table, confirm, divider, error, info, loading, stat-row, success, text)

**Benchmark research:**
- "Vercel AI SDK React components" — AI UI components
- "ChatGPT UI design patterns" — chat interface
- "Claude UI streaming response" — streaming patterns
- "GitHub Copilot chat UI" — AI assistant UI

**Cross-checks:**
- Block system extensible for custom block types?
- Streaming state handling (loading → streaming → complete → error)?
- Message rendering (markdown, code blocks, tables)?

**Commit:** `audit(components): Group N — AI components audit`

---

### Task 29: Group O — Utilities & Remaining Composed Audit

**Output:** `docs/audits/2026-04-12-world-class/03o-utilities-composed.md`

**Component files to read:**
- `packages/core/src/hooks/use-color-mode.ts`
- `packages/core/src/hooks/use-mobile.ts`
- `packages/core/src/hooks/use-toast.ts`
- `packages/core/src/hooks/use-touch-device.ts`
- `packages/core/src/hooks/use-viewport-height.ts`
- `packages/core/src/ui/visually-hidden.tsx`
- `packages/core/src/ui/devalok-grain.tsx`
- `packages/core/src/composed/responsive-overlay.tsx`
- `packages/core/src/composed/global-loading.tsx`
- `packages/core/src/composed/empty-state.tsx`
- `packages/core/src/composed/error-boundary.tsx`
- `packages/core/src/composed/page-header.tsx`
- `packages/core/src/composed/page-skeletons.tsx`
- `packages/core/src/composed/bulk-action-bar.tsx`
- `packages/core/src/composed/member-picker.tsx`
- `packages/core/src/composed/multi-select-popover.tsx`
- `packages/core/src/composed/content-card.tsx`
- `packages/core/src/composed/schedule-view.tsx`
- `packages/core/src/composed/status-badge.tsx`
- `packages/core/src/composed/activity-feed.tsx`

**Benchmark research:**
- "Mantine hooks use-media-query use-color-scheme" — hook patterns
- "Chakra useColorMode useDisclosure" — hook API design
- "Carbon empty state pattern" — empty state

**Cross-checks:**
- Hook return value consistency (object vs tuple vs primitive)?
- Hook naming convention (`use-` prefix, kebab-case files)?

**Commit:** `audit(components): Group O — utilities and composed audit`

---

### Task 30: Group P — Chat Components Audit

**Output:** `docs/audits/2026-04-12-world-class/03p-chat.md`

**Component files to read:**
- `packages/core/src/ui/chat/message.tsx`
- `packages/core/src/ui/chat/message-input.tsx`
- `packages/core/src/ui/chat/message-list.tsx`
- `packages/core/src/ui/chat/system-message.tsx`
- `packages/core/src/ui/chat/typing-indicator.tsx`
- `packages/core/src/ui/chat/date-separator.tsx`
- `packages/core/src/ui/chat/unread-separator.tsx`
- `packages/core/src/ui/chat/index.ts`

**Test files:** `message.test.tsx`, `message-input.test.tsx`, `message-list.test.tsx`, `system-message.test.tsx`, `typing-indicator.test.tsx`, `separators.test.tsx`

**Benchmark research:**
- "Slack message UI patterns" — chat UI reference
- "Discord message components" — gaming chat reference
- "Linear chat interface" — productivity chat
- "WAI-ARIA chat log feed pattern" — a11y

**Cross-checks:**
- Message grouping by sender?
- Virtualized list for performance?
- Keyboard navigation between messages?

**Commit:** `audit(components): Group P — chat components audit`

---

### Task 31: Group Q — Date Picker Audit

**Output:** `docs/audits/2026-04-12-world-class/03q-date-picker.md`

**Component files to read:**
- `packages/core/src/composed/date-picker/date-picker.tsx`
- `packages/core/src/composed/date-picker/date-range-picker.tsx`
- `packages/core/src/composed/date-picker/date-time-picker.tsx`
- `packages/core/src/composed/date-picker/month-picker.tsx`
- `packages/core/src/composed/date-picker/year-picker.tsx`
- `packages/core/src/composed/date-picker/time-picker.tsx`
- `packages/core/src/composed/date-picker/calendar-grid.tsx`
- `packages/core/src/composed/date-picker/presets.tsx`
- `packages/core/src/composed/date-picker/use-calendar.ts`

**Benchmark research:**
- "React Aria DatePicker" — Adobe's a11y-first date picker (gold standard)
- "Mantine DatePicker" — feature-rich date picker
- "Carbon DatePicker" — enterprise date picker
- "WAI-ARIA APG date picker pattern" — a11y standard

**Cross-checks:**
- Keyboard navigation (arrow keys between days, Page Up/Down for months)?
- Screen reader announcements for date changes?
- Timezone handling?
- Min/max date constraints?

**Commit:** `audit(components): Group Q — date picker audit`

---

## Phase 4: Cross-Cutting Audit

### Task 32: Naming Consistency + Composition Patterns Audit

**Output:** `docs/audits/2026-04-12-world-class/04-cross-cutting.md` (section 4a + 4b)

**Step 1: Extract all CVA variant definitions**
```bash
grep -r "cva(" packages/core/src/ --include="*.tsx" -l
```
For each CVA component, extract the variant axis names and value sets.

**Step 2: Extract all component prop interfaces**
```bash
grep -r "interface.*Props" packages/core/src/ --include="*.tsx"
```
Check for naming consistency: `disabled` vs `isDisabled`, `open` vs `isOpen`, etc.

**Step 3: Extract all event handler props**
```bash
grep -r "on[A-Z].*:" packages/core/src/ui/ --include="*.tsx" | grep -v test | grep -v stories
```
Check: `onChange` vs `onValueChange` vs `onCheckedChange` patterns.

**Step 4: Check compound component patterns**
```bash
grep -r "displayName" packages/core/src/ --include="*.tsx" | grep -v test | grep -v stories
```
Verify every component has `displayName`. Check compound component slot naming.

**Step 5: Check asChild support**
```bash
grep -r "asChild" packages/core/src/ --include="*.tsx" | grep -v test | grep -v stories
```

**Step 6: Document all findings**
Write sections 4a (naming) and 4b (composition) of the cross-cutting report.

**Commit:** `audit(cross-cutting): naming consistency and composition patterns`

---

### Task 33: Form Integration + Error + Loading Patterns Audit

**Output:** `docs/audits/2026-04-12-world-class/04-cross-cutting.md` (sections 4c + 4d + 4e — append)

**Step 1: Trace useFormField integration**
```bash
grep -r "useFormField\|FormField\|FormItem\|FormControl\|FormMessage" packages/core/src/ --include="*.tsx"
```
For every form input, verify ARIA wiring.

**Step 2: Check disabled state consistency**
```bash
grep -r "disabled\|isDisabled" packages/core/src/ui/ --include="*.tsx" | grep -v test | grep -v stories
```
Verify same opacity, cursor, and bg treatment.

**Step 3: Check loading patterns**
```bash
grep -r "loading\|isLoading\|skeleton\|Skeleton\|Spinner" packages/core/src/ --include="*.tsx" | grep -v test | grep -v stories
```

**Step 4: Document findings for 4c, 4d, 4e**

**Commit:** `audit(cross-cutting): form, error, and loading patterns`

---

### Task 34: Token Discipline Audit

**Output:** `docs/audits/2026-04-12-world-class/04-cross-cutting.md` (section 4f — append)

**Step 1: Scan for hardcoded values in component source**

```bash
# Hardcoded colors
grep -rn "#[0-9a-fA-F]\{3,8\}" packages/core/src/ui/ packages/core/src/composed/ packages/core/src/shell/ packages/core/src/ai/ --include="*.tsx" | grep -v stories | grep -v test | grep -v primitives

# Hardcoded rgb/oklch
grep -rn "rgb(\|rgba(\|oklch(" packages/core/src/ui/ packages/core/src/composed/ --include="*.tsx" | grep -v stories | grep -v test

# Tailwind defaults instead of DS tokens (spacing)
grep -rn " p-[0-9]\| m-[0-9]\| gap-[0-9]" packages/core/src/ --include="*.tsx" | grep -v stories | grep -v test | grep -v "p-ds\|m-ds\|gap-ds"

# Tailwind default shadows
grep -rn "shadow-sm\|shadow-md\|shadow-lg\|shadow-xl" packages/core/src/ --include="*.tsx" | grep -v stories | grep -v test | grep -v "shadow-raised\|shadow-floating\|shadow-overlay\|shadow-brand\|shadow-ring\|shadow-glow\|shadow-inset\|shadow-kbd\|shadow-pressed\|shadow-success\|shadow-error\|shadow-warning"

# Tailwind default radius
grep -rn "rounded-sm\b\|rounded-md\b\|rounded-lg\b\|rounded-xl\b" packages/core/src/ --include="*.tsx" | grep -v stories | grep -v test | grep -v "rounded-ds-"

# Hardcoded z-index
grep -rn "z-[0-9]" packages/core/src/ --include="*.tsx" | grep -v stories | grep -v test | grep -v "z-base\|z-raised\|z-dropdown\|z-sticky\|z-overlay\|z-modal\|z-popover\|z-toast\|z-tooltip"
```

**Step 2: Document every violation**
For each hardcoded value found, document: file, line, what it should be replaced with.

**Commit:** `audit(cross-cutting): token discipline audit`

---

### Task 35: Density Modes + Focus Management Audit

**Output:** `docs/audits/2026-04-12-world-class/04-cross-cutting.md` (sections 4g + 4h — append)

**Step 1: Check for density implementation**
```bash
grep -ri "density\|compact\|comfortable\|condensed" packages/core/src/ --include="*.tsx" --include="*.ts" --include="*.css"
```
Document whether density modes exist or are just claimed.

**Step 2: Research density benchmarks**
Web search for:
- "Material Design 3 density component sizing" — their 3-level system
- "Carbon condensed data table" — their approach

**Step 3: Test focus management**
Read overlay components (Dialog, Sheet, Popover, DropdownMenu) and trace:
- How focus trapping is implemented (Radix primitive?)
- How focus restoration works on close
- Whether nested overlays (Dialog → DropdownMenu) restore correctly

**Step 4: Document findings for 4g and 4h**

**Commit:** `audit(cross-cutting): density modes and focus management`

---

## Phase 5: Plan Validation

### Task 36: Cross-Reference Pass

**Output:** `docs/audits/2026-04-12-world-class/05-validation.md`

**Step 1: Read ALL previous audit reports**
Read every file in `docs/audits/2026-04-12-world-class/` written so far (01a through 04).

**Step 2: Forward-trace foundation findings**
For every Phase 1 finding (color, typography, spacing, etc.), list EVERY component that is affected. If a spacing token is wrong, which components use that token? Be exhaustive.

**Step 3: Backward-trace component findings**
For every Phase 3 component finding, determine:
- Is this a root cause (component-specific issue)?
- Or a symptom of a foundation/infrastructure problem?
If it's a symptom, link it to the foundation finding and mark it as "auto-fixed by [foundation finding]."

**Step 4: Deduplicate**
Group identical findings across components. "20 components hardcode `rounded-lg` instead of `rounded-ds-lg`" = 1 finding with 20 instances.

**Step 5: Verify zero-finding audit items**
For every audit item that produced zero findings, ask: is this genuinely world-class, or did we not look hard enough? Re-examine with fresh eyes.

**Commit:** `audit(validation): cross-reference pass`

---

### Task 37: Gap Analysis — Missing Components

**Output:** `docs/audits/2026-04-12-world-class/05-validation.md` (append)

**Step 1: Research what leaders offer that shilp-sutra doesn't**
Web search for component lists of:
- "Mantine all components list" — 120+ components
- "Carbon Design System component gallery" — enterprise set
- "Material Design 3 components list" — Google's set
- "Radix Themes all components" — their set
- "Chakra UI all components" — their set

**Step 2: Create a missing components analysis**
For each component in benchmark systems that shilp-sutra lacks, classify:
- **Should add** — Common need, no workaround
- **Consciously excluded** — Not needed for this system's use case
- **Partially covered** — Similar functionality exists under different name
- **Not applicable** — Platform-specific or irrelevant

Common candidates: Drawer (vs Sheet?), NumberInput (exists?), ColorPicker (vs ColorInput?), RangeSlider, TransferList, Timeline (vs ActivityFeed?), Rating, Spotlight, Kbd, Indicator, Timeline, RingProgress, Affix, CloseButton, CopyButton, FileButton, JsonInput, NativeSelect, PasswordInput, PinInput (vs InputOTP?), TagInput.

**Commit:** `audit(validation): gap analysis — missing components`

---

### Task 38: Prioritized Roadmap

**Output:** `docs/audits/2026-04-12-world-class/06-roadmap.md`

**Step 1: Read all findings from all reports**
Collect every finding with its priority (P0/P1/P2/P3) and effort (S/M/L/XL).

**Step 2: Organize by priority**

```markdown
## P0 — Blocking World-Class (must fix)
### Foundation fixes
### Component fixes
### Cross-cutting fixes

## P1 — Significant Gaps
### Foundation fixes
### Component fixes
### Cross-cutting fixes

## P2 — Polish
...

## P3 — Aspirational / Differentiators
...
```

**Step 3: Sequence into implementation phases**

```markdown
## Implementation Sequence

### Wave 1: Foundation Fixes (do first — cascading impact)
- [list with effort estimates]

### Wave 2: Infrastructure Fixes
- [list]

### Wave 3: Component Fixes (grouped by dependency)
- [list]

### Wave 4: Cross-Cutting Fixes
- [list]

### Wave 5: Polish
- [list]
```

**Step 4: Estimate total effort**
Sum all S/M/L/XL estimates to give an overall picture.

**Commit:** `audit(validation): prioritized roadmap`

---

### Task 39: Second-Pass Audit of the Plan

**Output:** `docs/audits/2026-04-12-world-class/05-validation.md` (append)

**Step 1: Re-read the ENTIRE roadmap from scratch**
As if you've never seen it. Ask for each entry:
- Is this finding real? (Check the actual code one more time)
- Is the priority correct?
- Is the effort estimate reasonable?
- Are dependencies accounted for?

**Step 2: Check for missed components**
Compare the component list in the audit against the actual file system:
```bash
find packages/core/src/ui/ -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx" | sort
find packages/core/src/composed/ -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx" | sort
find packages/core/src/shell/ -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx" | sort
find packages/core/src/ai/ -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx" | sort
```
Every file must appear in at least one audit report.

**Step 3: Check for missed axes**
Re-read the 10-axis rubric. For every component, verify all 10 axes were actually evaluated (not just 6 out of 10 because the auditor got tired).

**Step 4: Final validation sign-off**
Write a summary: "All N components audited across M audit items. X findings total: Y P0, Z P1, W P2, V P3. Estimated total effort: ..."

**Commit:** `audit(validation): second-pass audit complete`

---

### Task 40: Executive Summary

**Output:** `docs/audits/2026-04-12-world-class/00-executive-summary.md`

**Step 1: Read the roadmap and validation**
Synthesize into a 1-page executive summary:
- Overall system health rating
- Top 5 P0 findings (the biggest blockers)
- Top 5 strengths (what's already world-class)
- Recommended first actions
- Total scope and effort estimate

**Step 2: Write the README index**
Update `docs/audits/2026-04-12-world-class/README.md` with links to all reports and a table of contents.

**Step 3: Final commit**

```bash
git add docs/audits/2026-04-12-world-class/
git commit -m "audit: world-class design system audit — complete"
```

---

## Parallelization Map

```
Phase 1 (Tasks 1-6):     All 6 run in parallel
Phase 2 (Tasks 7-14):    All 8 run in parallel
Phase 3 (Tasks 15-31):   All 17 run in parallel
Phase 4 (Tasks 32-35):   Tasks 32, 33, 34 in parallel; Task 35 in parallel
Phase 5 (Tasks 36-40):   Sequential (each depends on previous)
```

**Maximum parallelism:** Phase 3 with 17 concurrent agents.

**Total tasks:** 40
**Estimated agent-hours:** ~20-25 hours of agent work (heavily parallelized to ~3-4 wall-clock sessions)
