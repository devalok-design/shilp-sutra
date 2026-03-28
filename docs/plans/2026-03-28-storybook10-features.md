# Storybook 10 Feature Adoption

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adopt Storybook 9+10 features — browser testing for 103 play functions, story audit + tags, dark mode globals, and CSF Factories enablement.

**Architecture:** Five phases — Vitest addon setup (highest value, enables CI testing of 103 play functions in real Chromium), story audit + cleanup (fix 4 missing autodocs, verify 181 stories), tags infrastructure (status tags + sidebar filtering), story globals documentation, and CSF Factories config. Each phase has a hard gate before proceeding.

**Tech Stack:** @storybook/addon-vitest, @vitest/browser, Playwright (Chromium), Vitest 4 workspace projects

---

## Phase 1: Vitest Addon + Browser Testing

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Add Vitest browser testing packages**

```bash
pnpm add -D @storybook/addon-vitest @vitest/browser playwright
```

**Step 2: Install Playwright Chromium browser**

```bash
npx playwright install chromium
```

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add @storybook/addon-vitest + playwright for browser testing"
```

---

### Task 2: Register addon in Storybook config

**Files:**
- Modify: `.storybook/main.ts`

**Step 1: Add addon-vitest to the addons array**

In `.storybook/main.ts`, add `@storybook/addon-vitest` to the beginning of the addons list:

```ts
addons: [
  '@storybook/addon-vitest',
  {
    name: '@storybook/addon-docs',
    options: {
      mdxPluginOptions: {
        mdxCompileOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
    },
  },
  '@storybook/addon-a11y',
  'storybook-dark-mode',
],
```

**Step 2: Commit**

```bash
git add .storybook/main.ts
git commit -m "feat: register @storybook/addon-vitest addon"
```

---

### Task 3: Create Vitest workspace with storybook project

**Files:**
- Create: `vitest.workspace.ts`

**Step 1: Create the workspace file at the repo root**

This defines three test projects: `core` (jsdom), `karm` (jsdom), and `storybook` (Chromium browser). The existing `vitest.config.ts` at root becomes unused — the workspace replaces it.

```ts
import { defineWorkspace } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineWorkspace([
  // Existing unit test projects — unchanged
  'packages/core/vitest.config.ts',
  'packages/karm/vitest.config.ts',
  // Storybook browser test project — NEW
  {
    extends: '.storybook/vite.config.ts',
    plugins: [
      storybookTest({
        configDir: path.join(dirname, '.storybook'),
      }),
    ],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }],
      },
      // Don't pick up unit test files
      include: [],
      // Story test timeout — some components need time to render in real browser
      testTimeout: 30_000,
    },
  },
])
```

**Step 2: Verify the workspace resolves correctly**

```bash
pnpm vitest list --project storybook 2>&1 | head -20
```

Expected: A list of story test entries (one per story file).

**Step 3: Commit**

```bash
git add vitest.workspace.ts
git commit -m "feat: add vitest workspace with storybook browser test project"
```

---

### Task 4: Add test scripts and verify play functions run

**Files:**
- Modify: `package.json`

**Step 1: Add storybook test scripts**

Add to root `package.json` scripts:

```json
"test:storybook": "vitest --project storybook",
"test:storybook:ci": "vitest run --project storybook"
```

**Step 2: Start Storybook in one terminal**

```bash
pnpm dev &
```

Wait for "Storybook ready" message.

**Step 3: Run a single story test to verify**

```bash
pnpm vitest run --project storybook -- packages/core/src/ui/button.stories.tsx
```

Expected: Tests pass — each story in button.stories.tsx gets a smoke test, and any with `play:` functions get those executed.

**Step 4: If tests pass, run the full storybook test suite**

```bash
pnpm test:storybook:ci
```

Expected: Most pass. Some may fail due to browser-vs-jsdom differences. Document failures.

**Step 5: Commit**

```bash
git add package.json
git commit -m "feat: add test:storybook scripts for browser-based story testing"
```

---

### Task 5: Add Storybook tests to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Add Playwright install and storybook test steps**

After the existing `Test` step, add:

```yaml
- name: Install Playwright
  run: npx playwright install chromium

- name: Build Storybook
  run: pnpm build-storybook

- name: Test Stories (browser)
  run: pnpm test:storybook:ci
```

> **Note:** The Storybook test project may need a built Storybook or a running dev server. Check if `storybookTest()` plugin handles this automatically, or if we need `storybookScript` or `storybookUrl` config. Adjust based on what works in Task 4.

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add storybook browser tests to CI pipeline"
```

### GATE: Do not proceed to Phase 2 unless storybook tests run successfully (locally and/or in CI). Some individual story failures are OK — the infrastructure must work.

---

## Phase 2: Story Audit + Tags Infrastructure

### Task 6: Add tag configuration to main.ts

**Files:**
- Modify: `.storybook/main.ts`

**Step 1: Add tags config**

Add a `tags` property to the Storybook config:

```ts
const config: StorybookConfig = {
  // ... existing config
  tags: {
    deprecated: { sidebar: false },
    internal: { sidebar: false },
  },
}
```

This hides `deprecated` and `internal` tagged stories from the sidebar by default (users can toggle in filter dropdown).

**Step 2: Commit**

```bash
git add .storybook/main.ts
git commit -m "feat: configure tag-based sidebar filtering for deprecated/internal stories"
```

---

### Task 7: Audit and tag all stories

**Files:**
- Modify: All 181 story files across `packages/core/src/`, `packages/karm/src/`, `packages/brand/src/`

This is the big pass. For each story file:

1. Verify the component still exists and is exported
2. Verify the title follows the convention:
   - Core: `UI/<category>/<Component>`, `Composed/<Component>`, `Shell/<Component>`
   - Karm: `Karm/<domain>/<Component>`
   - Brand: `Brand/<org>/<Component>`
3. Ensure `tags` array includes `'autodocs'` (unless intentionally excluded)
4. Add a status tag: `'stable'`, `'experimental'`, or `'deprecated'`
5. Remove broken or dead stories

**Known issues to fix:**
- 4 stories missing `autodocs`:
  - `packages/core/src/ui/chat/chat.stories.tsx`
  - `packages/core/src/ui/motion.stories.tsx` (has `tags: []`)
  - `packages/karm/src/tasks/task-action-row/task-action-row.stories.tsx`
  - `packages/karm/src/tasks/v3/task-panel.stories.tsx`

**Tag pattern:**

```ts
const meta: Meta<typeof Component> = {
  title: 'UI/Core/Button',
  component: Button,
  tags: ['autodocs', 'stable'],
}
```

> **Note:** This task is best done with a subagent that can read and modify files in parallel. Break into sub-batches by package: core first (120 stories), then karm (59), then brand (2).

**Step 1: Audit and tag core stories (120 files)**

Run through all stories in `packages/core/src/`. For each, add the appropriate status tag. Most will be `'stable'`.

**Step 2: Audit and tag karm stories (59 files)**

Run through all stories in `packages/karm/src/`.

**Step 3: Audit and tag brand stories (2 files)**

Run through both stories in `packages/brand/src/`.

**Step 4: Verify no stories are missing tags**

```bash
grep -rL "'stable'\|'experimental'\|'deprecated'" packages/*/src/**/*.stories.tsx
```

Expected: No results (all stories tagged).

**Step 5: Commit**

```bash
git add packages/
git commit -m "refactor: audit and tag all 181 stories with status tags

- Added stable/experimental/deprecated status tags
- Fixed 4 stories missing autodocs
- Verified all titles follow naming convention"
```

---

## Phase 3: Story Globals for Dark Mode

### Task 8: Document dark mode globals pattern

**Files:**
- Modify: `packages/core/src/Introduction.mdx` (or create a dedicated Dark Mode guide)

**Step 1: Add documentation section**

Add a section to the Introduction MDX explaining how to create dark mode story variants:

```mdx
## Dark Mode Variants

Individual stories can declare their theme context using story globals:

\`\`\`tsx
export const DarkMode: Story = {
  globals: { theme: 'dark' },
}
\`\`\`

The existing ThemeWrapper decorator reads `globals.theme` and toggles the `.dark` class on `<html>`. Use this pattern to create permanent dark-mode variants of any story.

You can also toggle dark mode from the Storybook toolbar (sun/moon icon).
\`\`\`

**Step 2: Commit**

```bash
git add packages/core/src/Introduction.mdx
git commit -m "docs: document story globals pattern for dark mode variants"
```

---

## Phase 4: CSF Factories Enablement

### Task 9: Add preview config alias for CSF Factories

**Files:**
- Modify: `.storybook/vite.config.ts`
- Modify: `.storybook/preview.ts`

**Step 1: Add the `#.storybook` alias to vite config**

In `.storybook/vite.config.ts`, add the alias:

```ts
resolve: {
  alias: {
    '@primitives': resolve(__dirname, '..', 'packages', 'core', 'src', 'primitives'),
    '@': resolve(__dirname, '..', 'packages', 'core', 'src'),
    '#.storybook': resolve(__dirname),
    'next/link': resolve(__dirname, 'mocks', 'next-link.tsx'),
    'next/navigation': resolve(__dirname, 'mocks', 'next-navigation.ts'),
  },
},
```

**Step 2: Add named `config` export to preview.ts**

At the bottom of `.storybook/preview.ts`, after the existing `export default preview`, add:

```ts
export const config = preview
```

> **Note:** CSF Factories uses `import { config } from '#.storybook/preview'`. The named export must exist. The existing default export remains for backwards compatibility.

**Step 3: Verify the alias resolves**

Start Storybook and check there are no resolution errors:

```bash
pnpm dev
```

**Step 4: Commit**

```bash
git add .storybook/vite.config.ts .storybook/preview.ts
git commit -m "feat: enable CSF Factories with #.storybook alias and named config export"
```

---

### Task 10: Create a CSF Factories example story

**Files:**
- Create: `packages/core/src/ui/badge.stories.tsx` (overwrite with CSF Factories format as reference)

> **Actually — don't overwrite an existing story.** Instead, pick one simple story and convert it as a reference example. Or create a new story variant. The goal is to have one working CSF Factories story that proves the setup works and serves as a template.

**Step 1: Create a reference CSF Factories story**

Pick the simplest existing story (e.g. `separator.stories.tsx` or `label.stories.tsx`) and create a CSF Factories version alongside it, or convert it in place.

CSF Factories pattern:

```tsx
import { config } from '#.storybook/preview'
import { Separator } from './separator'

const meta = config.meta({
  title: 'UI/Layout/Separator',
  component: Separator,
  tags: ['autodocs', 'stable'],
})
export default meta

export const Horizontal = meta.story({
  args: { orientation: 'horizontal' },
})

export const Vertical = meta.story({
  args: { orientation: 'vertical' },
  decorators: [(Story) => <div style={{ height: 100 }}><Story /></div>],
})
```

**Step 2: Verify it renders in Storybook**

Open `http://localhost:6006` and navigate to the converted story. Verify:
- Story renders correctly
- Autodocs page generates
- Controls work
- No type errors in IDE

**Step 3: Commit**

```bash
git add packages/core/src/ui/separator.stories.tsx
git commit -m "feat: convert separator story to CSF Factories format as reference

New stories should follow this pattern. Existing CSF3 stories remain
valid and will be migrated gradually."
```

---

## Phase 5: Final Verification

### Task 11: End-to-end verification

**Step 1: Run full unit test suite (core only — karm is slow)**

```bash
cd packages/core && pnpm vitest run
```

Expected: All 188 files, 1650 tests pass.

**Step 2: Run Storybook browser tests**

```bash
pnpm test:storybook:ci
```

Expected: Most stories pass. Document any failures.

**Step 3: Build Storybook**

```bash
pnpm build-storybook
```

Expected: Builds without errors.

**Step 4: Verify sidebar filtering**

Start Storybook, check that:
- Stories tagged `deprecated` are hidden by default
- The sidebar filter dropdown shows tag options
- Toggling a tag filter shows/hides stories

**Step 5: Verify CSF Factories story works**

Navigate to the converted story, verify rendering + autodocs.

**Step 6: Typecheck and lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: Clean.

**Step 7: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve issues from storybook 10 feature adoption verification"
```

---

## Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|-----------------|
| 1 | Tasks 1-5 | 103 play functions running as CI browser tests |
| 2 | Tasks 6-7 | 181 stories audited, tagged, cleaned up |
| 3 | Task 8 | Dark mode globals documented |
| 4 | Tasks 9-10 | CSF Factories enabled with reference story |
| 5 | Task 11 | End-to-end verification |
