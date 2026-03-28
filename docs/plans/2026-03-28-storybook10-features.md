# Storybook 10 Feature Adoption

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adopt Storybook 9+10 features — browser testing for 103 play functions, story audit + tags, dark mode globals, and CSF Factories enablement.

**Architecture:** Five phases — Vitest addon setup (highest value, enables CI testing of play functions in real Chromium), story audit + cleanup (fix 4 missing autodocs, tag 181 stories), tags infrastructure (status tags + sidebar filtering), story globals documentation, and CSF Factories config with `definePreview()`. Each phase has a hard gate before proceeding.

**Tech Stack:** @storybook/addon-vitest 10.3.3, @vitest/browser, Playwright (Chromium), Vitest 4 `test.projects`

---

## Verified Facts (from npm registry + installed types + official docs)

- `@storybook/addon-vitest@10.3.3` exists on npm; peer deps: `vitest ^3.0.0 || ^4.0.0`, `@vitest/browser-playwright ^4.0.0`
- `@vitest/browser@4.0.18` and `@vitest/browser-playwright@4.0.18` exist — must pin to match our `vitest@4.0.18`
- Import path: `@storybook/addon-vitest/vitest-plugin` exports `storybookTest`
- Vitest 4 browser provider: `playwright({})` function from `@vitest/browser-playwright`, NOT the string `'playwright'`
- **Vitest addon does NOT need Storybook running** — transforms stories via portable stories. `storybookUrl` is optional (for debug links on failures).
- Vitest 4 has `defineConfig` and `defineProject` but NOT `defineWorkspace` — use `test.projects` array instead
- Tags config shape: `{ tagName: { defaultFilterSelection?: 'include' | 'exclude' } }` — NOT `{ sidebar: boolean }`
- Built-in tags: `dev` (sidebar), `test` (test runner), `autodocs`, `play-fn` (auto-applied), `manifest`
- Remove inherited tags with `!` prefix: `tags: ['!dev']` hides from sidebar
- CSF Factories API: `definePreview()` exported from `@storybook/react-vite`, returns `ReactPreview` with `.meta()` and `.story()`. Status: **Preview** (not yet in official docs, confirmed via installed types)
- `definePreview()` requires `{ addons: [...] }` parameter — plain `Preview` objects are NOT compatible
- `@storybook/addon-mcp@0.4.2` exists; peer deps: `storybook ^10.3.0`, `@storybook/addon-vitest ^10.3.0` — Phase 1 must be done before Phase 6
- 181 story files (120 core, 59 karm, 2 brand), 103 with play functions
- 4 stories missing autodocs tags
- Current `pnpm -r test` runs per-package vitest configs — must not break this

---

## Phase 1: Vitest Addon + Browser Testing

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Add Vitest browser testing packages**

```bash
pnpm add -D @storybook/addon-vitest @vitest/browser@4.0.18 @vitest/browser-playwright@4.0.18 playwright
```

> **Note:** Pin `@vitest/browser` and `@vitest/browser-playwright` to `4.0.18` to match our installed `vitest@4.0.18`. The `playwright` package provides the browser binary.

**Step 2: Install Playwright Chromium browser binary**

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

### Task 3: Add storybook test project to root vitest config

**Files:**
- Modify: `vitest.config.ts` (root)

**Step 1: Rewrite root vitest.config.ts with `test.projects`**

The root `vitest.config.ts` currently defines a standalone config. Replace it with a `test.projects` array that includes the existing per-package configs plus a new `storybook` browser test project.

> **IMPORTANT:** Vitest 4 removed `defineWorkspace`. Do NOT create `vitest.workspace.ts`. Use `test.projects` inside `defineConfig` instead.

> **IMPORTANT:** The existing `pnpm -r test` flow (which runs `vitest run` from each package dir using their own configs) must keep working. Per-package vitest configs are self-contained and are not affected by the root config. The root `test.projects` is only used when running `vitest` from the repo root (e.g. `vitest --project storybook`).

```ts
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, 'packages/core/src/primitives'),
      '@': resolve(__dirname, 'packages/core/src'),
    },
  },
  test: {
    projects: [
      // Storybook browser test project
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: resolve(__dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          // storybookTest plugin generates test entries from stories — don't pick up unit tests
          include: [],
          testTimeout: 30_000,
          // Retry flaky browser tests once
          retry: 1,
        },
      },
    ],
  },
})
```

> **Note:** The `playwright({})` function call (from `@vitest/browser-playwright`) is required for Vitest 4. The string `'playwright'` was the Vitest 3 syntax and will not work.

**Step 2: Verify per-package tests still work**

```bash
cd packages/core && pnpm vitest run src/ui/button.test.tsx
```

Expected: PASS (per-package config is unaffected).

**Step 3: Verify the storybook project resolves**

```bash
pnpm vitest list --project storybook 2>&1 | head -20
```

Expected: A list of story test entries.

**Step 4: Commit**

```bash
git add vitest.config.ts
git commit -m "feat: add storybook browser test project via Vitest 4 test.projects"
```

---

### Task 4: Add test scripts and verify

**Files:**
- Modify: `package.json`

**Step 1: Add storybook test scripts**

Add to root `package.json` scripts:

```json
"test:storybook": "vitest --project storybook",
"test:storybook:ci": "vitest run --project storybook"
```

**Step 2: Run a single story test to verify**

The plugin transforms stories into tests via portable stories — no running Storybook needed:

```bash
pnpm vitest run --project storybook -- button.stories
```

Expected: Tests pass — each story gets a smoke test, and stories with `play:` functions get those executed in Chromium.

**Step 3: If that passes, run the full storybook test suite**

```bash
pnpm test:storybook:ci
```

Expected: Most pass. Some may fail due to missing mocks or browser-specific issues. Document failures.

**Step 4: Commit**

```bash
git add package.json vitest.config.ts
git commit -m "feat: add test:storybook scripts for browser-based story testing"
```

---

### Task 5: Add Storybook tests to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Add Playwright install and storybook test steps**

After the existing `Test` step and `Build` step, add:

```yaml
- name: Install Playwright
  run: npx playwright install chromium

- name: Test Stories (browser)
  run: pnpm test:storybook:ci
```

> **Note:** The Vitest addon does NOT need Storybook running. It transforms stories into tests via portable stories and runs them directly in Playwright. No `storybookScript` or `storybookUrl` is needed for CI. Optionally, add `storybookUrl` pointing to the deployed Storybook for debug links in failure output.

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add storybook browser tests to CI pipeline"
```

### GATE: Do not proceed to Phase 2 unless storybook tests run successfully locally. Some individual story failures are OK — the infrastructure must work.

### Fallback: If the Vitest addon doesn't work (version incompatibility, browser mode issues), skip Phase 1 entirely and proceed to Phase 2. The story audit, tags, and CSF Factories are all independent and still valuable.

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
    deprecated: { defaultFilterSelection: 'exclude' },
    internal: { defaultFilterSelection: 'exclude' },
  },
}
```

This sets `deprecated` and `internal` stories to be excluded from the sidebar filter by default. Users can toggle them back in the sidebar filter dropdown. The API shape is `{ [tag]: { defaultFilterSelection?: 'include' | 'exclude' } }`.

> **Note:** Stories can remove inherited tags with the `!` prefix: `tags: ['!dev']` hides a story from the sidebar entirely. Built-in tags: `dev` (sidebar), `test` (test runner), `autodocs`, `play-fn` (auto-applied to stories with play functions).

**Step 2: Start Storybook and verify the sidebar filter dropdown appears**

```bash
pnpm dev
```

**Step 3: Commit**

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

**Tagging criteria:**
- `stable` — Component is in production use, API is not expected to change. **Default for most components.**
- `experimental` — New component or major API revision in progress. Apply to: v3 task-panel components, any component marked WIP in its source.
- `deprecated` — Component is being replaced. Apply only if a replacement exists.

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

> **Execution:** Best done with parallel subagents — one per package (core, karm, brand). Each subagent reads every story file, adds the status tag, fixes any missing autodocs.

**Step 1: Audit and tag core stories (120 files)**

**Step 2: Audit and tag karm stories (59 files)**

**Step 3: Audit and tag brand stories (2 files)**

**Step 4: Verify no stories are missing status tags**

```bash
grep -rL "'stable'\|'experimental'\|'deprecated'" packages/*/src/**/*.stories.tsx
```

Expected: No results.

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
- Modify: `packages/core/src/Introduction.mdx`

**Step 1: Add documentation section**

Add a section explaining how to create dark mode story variants using per-story globals:

```mdx
## Dark Mode Variants

Individual stories can declare their theme context using story globals:

```tsx
export const DarkMode: Story = {
  globals: { theme: 'dark' },
}
```

The existing ThemeWrapper decorator reads `globals.theme` and toggles the `.dark` class on `<html>`. Use this pattern to create permanent dark-mode variants of any story.

You can also toggle dark mode from the Storybook toolbar (sun/moon icon).
```

**Step 2: Commit**

```bash
git add packages/core/src/Introduction.mdx
git commit -m "docs: document story globals pattern for dark mode variants"
```

---

## Phase 4: CSF Factories Enablement

### Task 9: Rewrite preview.ts with definePreview() and add alias

**Files:**
- Modify: `.storybook/vite.config.ts`
- Rewrite: `.storybook/preview.ts`

> **IMPORTANT:** CSF Factories requires `definePreview()` from `@storybook/react-vite`. This returns a `ReactPreview` object with `.meta()` and `.story()` methods. A plain `Preview` object does NOT have these methods. The existing `preview.ts` must be rewritten, not just given a named export.

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

**Step 2: Rewrite preview.ts using definePreview()**

The current preview.ts has decorators, globalTypes, parameters, etc. All of this needs to be passed through `definePreview()`:

```ts
import React from 'react'
import { definePreview } from '@storybook/react-vite'
import { TooltipProvider } from '../packages/core/src/ui/tooltip'
import theme from './theme'
import '../packages/core/src/tokens/index.css'
import '../storybook.css'

// ThemeWrapper decorator — same as current
function ThemeWrapper({ theme: selectedTheme, children }: { theme: string; children: React.ReactNode }) {
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark')
    return () => { document.documentElement.classList.remove('dark') }
  }, [selectedTheme])
  return React.createElement(React.Fragment, null, children)
}

const withThemeToggle = (Story: any, context: any) => {
  const selectedTheme = (context.globals.theme as string) || 'light'
  return React.createElement(ThemeWrapper, { theme: selectedTheme }, React.createElement(Story))
}

export const preview = definePreview({
  addons: [],
  decorators: [
    withThemeToggle,
    (Story: any) =>
      React.createElement(
        TooltipProvider,
        null,
        React.createElement(
          'div',
          { className: 'story-surface', style: { background: 'var(--color-surface-base)', padding: '2rem', borderRadius: '8px' } },
          React.createElement(Story)
        )
      ),
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Toggle light / dark mode for component preview',
      toolbar: {
        icon: 'sun',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    backgrounds: { disable: true },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      darkClass: ['dark'],
      lightClass: [],
      stylePreview: true,
      classTarget: 'html',
    },
    docs: { theme },
    options: {
      storySort: {
        order: [
          'Getting Started', 'About', 'Foundations', ['Motion', 'Motion Overview', 'Motion Primitives', 'Motion Showcase'],
          'Iconography', 'Guides', ['Import Paths', 'Coming from shadcn'],
          'UI', ['Introduction', 'Core', 'Layout', 'Form Controls', 'Data Display', 'Navigation', 'Feedback', 'Charts', '*'],
          'Composed', ['Introduction', '*'],
          'Shell', ['Introduction', '*'],
          'Brand', ['Introduction', 'Devalok', ['Logo'], 'Karm', ['Logo']],
          'Karm', ['Introduction', 'Board', 'Tasks', 'Chat', 'Dashboard', 'Client', 'Admin', '*'],
          'Changelog',
        ],
      },
    },
  },
})

// Default export for backwards compatibility with CSF3 stories
export default preview
```

> **Note:** The `addons: []` array in `definePreview()` is for type-level addon integration (flowing addon types into stories). The actual addon registration remains in `main.ts`. Pass an empty array if no addon-specific types are needed.

**Step 3: Verify Storybook still works**

```bash
pnpm dev
```

Check that:
- Stories render correctly
- Dark mode toggle works
- Docs pages generate
- Controls work

**Step 4: Verify typecheck passes**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add .storybook/vite.config.ts .storybook/preview.ts
git commit -m "feat: rewrite preview.ts with definePreview() for CSF Factories support

Uses definePreview() from @storybook/react-vite which returns a
ReactPreview with .meta() and .story() methods. Existing CSF3 stories
continue to work via the default export."
```

---

### Task 10: Create a CSF Factories example story

**Files:**
- Modify: One simple existing story (e.g. `packages/core/src/ui/separator.stories.tsx`)

> **Pick a simple story** with few variants and no play functions. Convert it in place — CSF Factories is stable enough in SB10 Preview and will become default in SB11.

**Step 1: Convert the story to CSF Factories format**

```tsx
import { preview } from '#.storybook/preview'
import { Separator } from './separator'

const meta = preview.meta({
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

Navigate to the story. Verify:
- Story renders correctly
- Autodocs page generates
- Controls work
- No type errors in IDE

**Step 3: Commit**

```bash
git add packages/core/src/ui/separator.stories.tsx
git commit -m "feat: convert separator story to CSF Factories as reference

New stories should follow this pattern. Existing CSF3 stories remain
valid and will be migrated gradually."
```

---

## Phase 5: Final Verification

### Task 11: End-to-end verification

**Step 1: Run core unit tests**

```bash
cd packages/core && pnpm vitest run
```

Expected: 188 files, 1650 tests pass.

**Step 2: Run Storybook browser tests (if Phase 1 succeeded)**

```bash
pnpm test:storybook:ci
```

**Step 3: Build Storybook**

```bash
pnpm build-storybook
```

Expected: Builds without errors.

**Step 4: Verify sidebar filtering**

Start Storybook, check that:
- Stories tagged `deprecated` are hidden by default
- The sidebar filter dropdown shows tag options
- Status tags are visible

**Step 5: Verify CSF Factories story works**

Navigate to the converted separator story, verify rendering + autodocs.

**Step 6: Typecheck and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: Clean.

**Step 7: Final commit if any fixes needed**

---

## Phase 6: Storybook MCP Server

### Task 12: Install and configure @storybook/addon-mcp

The Storybook MCP server (`@storybook/addon-mcp`) exposes component metadata, stories, API docs, and live testing capabilities to AI agents via Model Context Protocol at `localhost:6006/mcp`. Available in SB 10.3+.

**What it gives AI agents:**
- Component metadata (props, stories, docs) — agents reuse existing components instead of inventing new
- Live preview embedding — verify generated UI in chat
- Self-verification — agents can run component + a11y tests autonomously
- Benchmarked: 12.8% better code reuse, 2.76x faster generation, 27% fewer tokens

**This is especially valuable for us** because Karm's Claude Code agent already uses `llms.txt` and `llms-full.txt` for component intelligence. The MCP server is the live, interactive version of that.

**Files:**
- Modify: `package.json`
- Modify: `.storybook/main.ts`

**Step 1: Install the addon**

```bash
pnpm add -D @storybook/addon-mcp
```

**Step 2: Register in main.ts**

Add `@storybook/addon-mcp` to the addons array:

```ts
addons: [
  '@storybook/addon-vitest',
  '@storybook/addon-mcp',
  {
    name: '@storybook/addon-docs',
    // ...
  },
  '@storybook/addon-a11y',
  'storybook-dark-mode',
],
```

**Step 3: Verify MCP endpoint is available**

Start Storybook and check the MCP endpoint:

```bash
pnpm dev
# In another terminal:
curl -s http://localhost:6006/mcp | head -20
```

Expected: JSON response with MCP server metadata.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .storybook/main.ts
git commit -m "feat: add Storybook MCP server for AI agent integration

@storybook/addon-mcp exposes component metadata, stories, and testing
capabilities to AI agents via MCP at localhost:6006/mcp. This gives
Claude Code (and other AI tools) live component intelligence when
building UI with our design system."
```

---

### Task 13: Register MCP server in Claude Code config

**Files:**
- Modify: `.claude/settings.json` or `.mcp.json` (whichever is the project MCP config)

**Step 1: Add the Storybook MCP server to the project's MCP config**

The MCP server runs at `http://localhost:6006/mcp` when Storybook dev server is running. Register it so Claude Code can discover it:

```bash
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

Or manually add to the project's MCP config:

```json
{
  "mcpServers": {
    "storybook": {
      "type": "http",
      "url": "http://localhost:6006/mcp"
    }
  }
}
```

> **Note:** This MCP server is only available when Storybook is running (`pnpm dev`). It won't be available in CI or when Storybook is not started. That's fine — it's a development-time tool.

**Step 2: Verify Claude Code sees the MCP server**

Start Storybook, then in a Claude Code session, check if the MCP tools are available.

**Step 3: Update Karm's CLAUDE.md**

Add a note to Karm's CLAUDE.md (or equivalent) telling AI agents that when Storybook is running, they can use the MCP server for component intelligence instead of reading llms.txt:

```markdown
## Storybook MCP Server

When the Storybook dev server is running (`pnpm dev` in shilp-sutra),
an MCP server is available at `localhost:6006/mcp` providing:
- Live component metadata (props, stories, docs)
- Component testing capabilities
- Live preview embedding

This is the interactive version of llms.txt / llms-full.txt.
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: register Storybook MCP server for Claude Code integration"
```

---

## Summary

| Phase | Tasks | Key Deliverable |
|-------|-------|-----------------|
| 1 | Tasks 1-5 | Play functions running as CI browser tests |
| 2 | Tasks 6-7 | 181 stories audited, tagged, cleaned up |
| 3 | Task 8 | Dark mode globals documented |
| 4 | Tasks 9-10 | CSF Factories enabled with `definePreview()` + reference story |
| 5 | Task 11 | End-to-end verification |
| 6 | Tasks 12-13 | Storybook MCP server for AI agent component intelligence |

## Rollback

- **Phase 1 fails:** Skip entirely, proceed to Phase 2. Story audit + tags + CSF Factories are independent.
- **CSF Factories breaks:** Revert preview.ts to the pre-`definePreview()` version. The `default export` ensures CSF3 stories always work.
- **Tags break sidebar:** Remove `tags` property from main.ts. Stories render fine without it.
- **MCP addon breaks:** Remove `@storybook/addon-mcp` from main.ts. Everything else works without it.
