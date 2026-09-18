# Comprehensive DS Audit — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix every gap identified in the 2026-04-05 comprehensive audit, bringing the design system from B+ to A-tier across all dimensions.

**Architecture:** Work is grouped into 5 phases. Phases 1-2 are independent and can run in parallel. Phase 3 depends on Phase 1. Phases 4-5 are independent cleanup/docs tasks. Each phase targets a specific audit area.

**Tech Stack:** React 18, TypeScript 5.7, Vite 5.4, Tailwind 3.4, CVA, Vitest, Storybook, pnpm, Changesets (new), Chromatic (new)

**Already completed (this session):**
- Missing subpath exports (icon, icon-context, icon-group, badge-group, badge-indicator, devalok-grain, ai/types)
- Badge `truncate` prop for fixed-width pill badges
- DS notice to Karm (devalok-design/karm#451)
- Audit design doc written

---

## Phase 1: Release Infrastructure (independent)

### Task 1: Adopt Changesets

**Files:**
- Create: `.changeset/config.json`
- Create: `.github/workflows/release.yml`
- Modify: `package.json` (root — add changeset scripts)
- Modify: `scripts/pre-publish-audit.mjs` (integrate with changeset flow)

**Step 1: Install Changesets**

```bash
pnpm add -Dw @changesets/cli @changesets/changelog-github
```

**Step 2: Initialize Changesets**

```bash
pnpm changeset init
```

This creates `.changeset/config.json`. Edit it:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "devalok-design/shilp-sutra" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Step 3: Add scripts to root package.json**

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

**Step 4: Create GitHub Action for version PRs**

Create `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main]
concurrency: ${{ github.workflow }}-${{ github.ref }}
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm version-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Step 5: Commit**

```bash
git add .changeset/ .github/workflows/release.yml package.json
git commit -m "chore: adopt @changesets/cli for release management"
```

---

### Task 2: Consolidate post-build scripts

**Files:**
- Create: `packages/core/scripts/post-build.mjs`
- Modify: `packages/core/package.json` (update build script)
- Keep: Individual scripts as importable modules (don't delete)

**Step 1: Create unified post-build script**

Create `packages/core/scripts/post-build.mjs` that:
1. Imports each step as a function
2. Runs them sequentially
3. On failure: logs which step failed, exits non-zero
4. On success: reports total time

The individual scripts (`copy-tokens.mjs`, `fix-dts-primitives.mjs`, `inject-use-client.mjs`, `build-tailwind-cjs.mjs`) stay as-is but get wrapped.

**Step 2: Update package.json build script**

Change from chained `&&` commands to single `node scripts/post-build.mjs`.

**Step 3: Test build**

```bash
cd packages/core && pnpm build
```

Verify dist/ output is identical to before.

**Step 4: Commit**

```bash
git commit -m "refactor(build): consolidate post-build scripts into single process"
```

---

### Task 3: Add bundle size budget to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Add size check step after build**

```yaml
- name: Check bundle size
  run: |
    TOTAL=$(du -sb packages/core/dist | cut -f1)
    MAX=5242880  # 5MB budget
    echo "Bundle size: $((TOTAL / 1024))KB / $((MAX / 1024))KB"
    if [ "$TOTAL" -gt "$MAX" ]; then
      echo "::error::Bundle size $((TOTAL / 1024))KB exceeds budget of $((MAX / 1024))KB"
      exit 1
    fi
```

**Step 2: Commit**

```bash
git commit -m "ci: add bundle size budget check (5MB)"
```

---

## Phase 2: Testing Infrastructure (independent)

### Task 4: Add Chromatic visual regression testing

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json` (root — add chromatic script)

**Step 1: Install Chromatic**

```bash
pnpm add -Dw chromatic
```

**Step 2: Add Chromatic script**

```json
{
  "scripts": {
    "chromatic": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN"
  }
}
```

**Step 3: Add to CI workflow**

Add step after `pnpm build-storybook`:

```yaml
- name: Visual regression (Chromatic)
  if: github.event_name == 'pull_request'
  run: pnpm chromatic --exit-zero-on-changes --auto-accept-changes=main
  env:
    CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

**Step 4: Sign up at chromatic.com, get project token, add as repo secret**

Manual step — requires user action.

**Step 5: Commit**

```bash
git commit -m "ci: add Chromatic visual regression testing"
```

---

### Task 5: Add date-picker tests

**Files:**
- Create: `packages/core/src/composed/date-picker/__tests__/date-picker.test.tsx`
- Create: `packages/core/src/composed/date-picker/__tests__/date-range-picker.test.tsx`
- Create: `packages/core/src/composed/date-picker/__tests__/time-picker.test.tsx`

**Step 1: Write date-picker test**

Test file for the main DatePicker:
- Renders with default props
- Opens calendar on trigger click
- Selects a date and fires onValueChange
- Respects minDate/maxDate constraints
- Closes on date selection
- Accessibility: no axe violations

**Step 2: Write date-range-picker test**

- Renders start/end inputs
- Selecting start then end fires onValueChange with range
- Range visual indicators
- Accessibility: no axe violations

**Step 3: Write time-picker test**

- Renders hour/minute selectors
- Value changes fire callback
- 12h/24h format support
- Accessibility: no axe violations

**Step 4: Run tests**

```bash
cd packages/core && pnpm vitest run src/composed/date-picker/
```

**Step 5: Commit**

```bash
git commit -m "test(composed): add date-picker, date-range-picker, time-picker tests"
```

---

### Task 6: Add charts, tree-view, AI test coverage

**Files:**
- Create: `packages/core/src/ui/charts/__tests__/` (basic render + a11y tests)
- Create: `packages/core/src/ui/tree-view/__tests__/` (expand/collapse + a11y)
- Create: `packages/core/src/ai/__tests__/` (block rendering + command bar)

**Step 1-3: Write tests for each subsystem**

Each test file should cover:
- Basic rendering with minimal props
- Key interactions (expand/collapse for tree, data rendering for charts)
- Accessibility (axe)

**Step 4: Run all new tests**

```bash
cd packages/core && pnpm vitest run src/ui/charts/ src/ui/tree-view/ src/ai/
```

**Step 5: Commit**

```bash
git commit -m "test: add charts, tree-view, AI command system test coverage"
```

---

## Phase 3: API Consistency (depends on Phase 1 for changesets)

### Task 7: Alert — add size axis

**Files:**
- Modify: `packages/core/src/ui/alert.tsx`
- Modify: `packages/core/src/ui/alert.test.tsx`
- Modify: `packages/core/src/ui/alert.stories.tsx`

**Step 1: Write failing test**

```tsx
it('renders sm size', () => {
  const { container } = render(<Alert size="sm" color="info">Test</Alert>)
  // sm size should have smaller padding and text
  expect(container.firstChild?.className).toContain('text-ds-xs')
})
```

**Step 2: Add size variant to CVA**

Add `size` axis to alertVariants:
```tsx
size: {
  sm: 'px-ds-03 py-ds-02 text-ds-xs gap-ds-02 [&>svg]:h-4 [&>svg]:w-4',
  md: 'px-ds-04 py-ds-03 text-ds-sm gap-ds-03 [&>svg]:h-5 [&>svg]:w-5',
  lg: 'px-ds-05 py-ds-04 text-ds-md gap-ds-04 [&>svg]:h-5 [&>svg]:w-5',
}
```

Default: `md` (non-breaking).

**Step 3: Run tests, update stories, commit**

```bash
git commit -m "feat(alert): add size axis (sm, md, lg)"
```

---

### Task 8: Card — add color and size axes

**Files:**
- Modify: `packages/core/src/ui/card.tsx`
- Modify: `packages/core/src/ui/card.test.tsx`
- Modify: `packages/core/src/ui/card.stories.tsx`

**Step 1: Add color axis**

Add `color` to cardVariants CVA:
```tsx
color: {
  default: '',
  accent: '',
  error: '',
  success: '',
  warning: '',
  info: '',
  neutral: '',
}
```

With compound variants for each variant × color combination. Default: `default` (non-breaking).

**Step 2: Add size axis**

```tsx
size: {
  sm: 'p-ds-03',
  md: 'p-ds-05',
  lg: 'p-ds-07',
}
```

Default: `md` (non-breaking — current padding is ~p-ds-05).

**Step 3: Write tests, update stories, commit**

```bash
git commit -m "feat(card): add color and size axes"
```

---

### Task 9: Select — add variant and color axes

**Files:**
- Modify: `packages/core/src/ui/select.tsx` (SelectTrigger CVA)
- Modify: `packages/core/src/ui/select.test.tsx`
- Modify: `packages/core/src/ui/select.stories.tsx`

**Step 1: Add variant to SelectTrigger CVA**

```tsx
variant: {
  default: 'border border-surface-border bg-surface-raised',
  outline: 'border border-surface-border-strong bg-transparent',
  ghost: 'border-transparent bg-transparent hover:bg-surface-raised-hover',
}
```

**Step 2: Add color for validation states**

```tsx
color: {
  default: '',
  error: 'border-error-7 text-error-11',
  success: 'border-success-7',
  warning: 'border-warning-7',
}
```

Default: `default` for both (non-breaking).

**Step 3: Write tests, update stories, commit**

```bash
git commit -m "feat(select): add variant and color axes"
```

---

### Task 10: Tabs — add color and size axes

**Files:**
- Modify: `packages/core/src/ui/tabs.tsx`
- Modify: `packages/core/src/ui/tabs.test.tsx`
- Modify: `packages/core/src/ui/tabs.stories.tsx`

**Step 1: Add size to TabsList**

```tsx
size: {
  sm: 'h-8 text-ds-xs',
  md: 'h-10 text-ds-sm',
  lg: 'h-12 text-ds-md',
}
```

**Step 2: Add color to Tabs root (propagated via context)**

```tsx
color: {
  accent: '',    // active indicator uses accent-9
  neutral: '',   // active indicator uses neutral-9
}
```

Default: `accent`, `md` (non-breaking).

**Step 3: Write tests, update stories, commit**

```bash
git commit -m "feat(tabs): add color and size axes"
```

---

### Task 11: Create changeset for all API additions

**Step 1: Run changeset**

```bash
pnpm changeset
```

Select `@devalok/shilp-sutra` → minor bump → describe all new axes.

**Step 2: Commit changeset file**

```bash
git add .changeset/
git commit -m "chore: add changeset for variant audit API additions"
```

---

## Phase 4: Token & Build Cleanup (independent)

### Task 12: Clean up legacy typography classes

**Files:**
- Modify: `packages/core/src/tokens/typography.css`
- Search codebase for any usage of legacy classes (T1-Reg, B2-Reg, L1, P1, etc.)

**Step 1: Grep for legacy typography usage**

```bash
grep -rn 'T[1-7]-\|B[1-8]-\|L[1-6]\|P[1-7]-' packages/core/src/ --include='*.tsx'
```

**Step 2: If no usage found, add `/* @deprecated */` comments to legacy classes**

If usage found, migrate to semantic equivalents first.

**Step 3: Commit**

```bash
git commit -m "chore(tokens): mark legacy typography classes as deprecated"
```

---

### Task 13: Automate server-safe allowlist

**Files:**
- Modify: `packages/core/scripts/inject-use-client.mjs`

**Step 1: Add file-level annotation for server-safe components**

Instead of hardcoding the SERVER_SAFE set, detect components that DON'T import React hooks or browser APIs:

Option A (simpler): Read a `// @server-safe` comment at top of source files.
Option B (automatic): Parse imports — if file doesn't import `useState`, `useEffect`, `useRef`, `framer-motion`, etc., mark as server-safe.

Recommend Option A — explicit opt-in is safer.

**Step 2: Update existing server-safe files to include annotation**

**Step 3: Update inject-use-client.mjs to read annotations from source**

**Step 4: Verify build output unchanged**

```bash
pnpm build && diff <(cat dist/ui/text.js | head -1) <(echo '"use client"')
# Should NOT have "use client" — text is server-safe
```

**Step 5: Commit**

```bash
git commit -m "refactor(build): detect server-safe components via source annotation"
```

---

## Phase 5: Documentation (independent)

### Task 14: Create migration guide page

**Files:**
- Create: `docs/MIGRATION.md`

**Step 1: Write migration index**

Link to all version-specific breaking changes from CHANGELOG.md:
- v0.29.0: Warning color remapping, Button icon API, Badge rewrite
- v0.23.0: Surface/shadow token migration (existing doc)
- v0.9.0: Dep bundling, vendor chunk split

**Step 2: Commit**

```bash
git commit -m "docs: create migration guide index"
```

---

### Task 15: Link design philosophy from README

**Files:**
- Modify: `README.md`

**Step 1: Add link in README**

After the "Quick Start" section, add:

```markdown
## Design Philosophy

See [docs/design-philosophy.md](docs/design-philosophy.md) for the brand manifesto, color heritage, and architectural principles.
```

**Step 2: Commit**

```bash
git commit -m "docs: link design-philosophy.md from README"
```

---

### Task 16: WCAG 2.2 gap analysis

**Files:**
- Create: `docs/audit/2026-04-05-wcag-2.2-gap-analysis.md`

**Step 1: Audit new WCAG 2.2 criteria against components**

Key criteria to check:
- **2.4.11 Focus Appearance** — focus indicators must be at least 2px, contrast ratio 3:1
- **2.4.12 Focus Not Obscured** — focused element must be visible (not behind sticky header)
- **2.5.7 Dragging Movements** — any drag must have click alternative
- **2.5.8 Target Size** — interactive targets minimum 24x24px

Check Button, Input, Select, Checkbox, Switch, Slider, Tabs for each criterion.

**Step 2: Document findings and remediation plan**

**Step 3: Commit**

```bash
git commit -m "docs: WCAG 2.2 gap analysis"
```

---

### Task 17: De-duplicate README files

**Files:**
- Modify: `packages/core/README.md` — keep only package-specific content (install, peer deps, exports)
- Modify: `README.md` (root) — keep as comprehensive overview, link to packages

**Step 1: Diff the two files to find overlap**

**Step 2: Extract shared content to root only, package README links to root**

**Step 3: Commit**

```bash
git commit -m "docs: de-duplicate root and core README"
```

---

## Execution Dependencies

```
Phase 1 (Release Infra)     ──┐
Phase 2 (Testing Infra)     ──┤── can run in parallel
Phase 4 (Token Cleanup)     ──┤
Phase 5 (Documentation)     ──┘
                               │
Phase 3 (API Consistency)   ───┘── depends on Phase 1 (changesets)
```

## Deferred Items (not in this plan)

These are tracked in the audit design doc but not planned for immediate implementation:

| # | Item | Reason |
|---|------|--------|
| 15 | Tailwind v4 migration | Large, wait for TW4 ecosystem stability |
| 16 | TypeScript discriminated unions | Low impact, do opportunistically |
| 17 | Badge compound export pattern | Low impact, defer to next major |
| 20 | W3C DTCG token format | Evaluate when tooling matures |
| 12 | Auto-generate llms.txt | Medium effort, manual process works for now |

---

## Verification

After all phases complete:
1. `pnpm typecheck` — 0 errors
2. `pnpm lint` — 0 errors
3. `pnpm test` — all pass
4. `pnpm build` — succeeds
5. `node scripts/pre-publish-audit.mjs` — all gates pass
6. Storybook renders all new stories correctly
7. Every component with new axes has: CVA definition, test, story, changeset entry
