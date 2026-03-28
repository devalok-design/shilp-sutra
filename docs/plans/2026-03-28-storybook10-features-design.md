# Storybook 10 Feature Adoption — Design

**Goal:** Leverage Storybook 9+10 features we gained by jumping from SB8→10 to improve testing, organization, and developer experience across the design system.

**Architecture:** Five workstreams — Vitest browser testing (highest value), story audit + cleanup, tags infrastructure, story globals for dark mode, and CSF Factories enablement.

---

## Context

We upgraded from Storybook 8 to 10 (skipping 9), which means we have two major versions of features available that we haven't opted into. The current setup works but leaves significant value on the table:

- 35 play functions exist but only run interactively in the browser — no CI coverage
- 170+ stories with no organizational tags — sidebar relies on manual `storySort`
- Accessibility testing happens in jsdom (vitest-axe) but not in a real browser
- No test coverage visibility for story-exercised code paths
- CSF3 story format works but requires manual type annotations

---

## 1. Vitest Addon + Browser Testing

### What

Install `@storybook/addon-vitest` with Playwright to run stories as real Vitest tests in Chromium.

### Why

- **35 play functions become CI tests** with zero story code changes
- **Every story gets a smoke test** — catches render crashes automatically
- **A11y checks in real browser** — axe-core running against actual DOM, not jsdom approximation
- **Test coverage reports** — see which code paths stories exercise
- **Test Widget** — sidebar shows pass/fail badges per-story during dev

### How

**Dependencies:**
```
@storybook/addon-vitest
@vitest/browser
@vitest/browser-playwright (or playwright directly)
```

**Config changes:**

1. Add addon to `.storybook/main.ts`:
```ts
addons: [
  '@storybook/addon-vitest',
  // ... existing addons
]
```

2. Create `vitest.workspace.ts` at root defining a `storybook` project alongside existing `core` and `karm` test projects:
```ts
import { defineWorkspace } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

export default defineWorkspace([
  'packages/core/vitest.config.ts',
  'packages/karm/vitest.config.ts',
  {
    extends: '.storybook/vite.config.ts',
    plugins: [
      storybookTest({ configDir: '.storybook' }),
    ],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        provider: 'playwright',
        headless: true,
        instances: [{ browser: 'chromium' }],
      },
    },
  },
])
```

3. Add scripts to root `package.json`:
```json
"test:storybook": "vitest --project storybook",
"test:storybook:ci": "vitest run --project storybook"
```

4. Add to CI workflow (after build):
```yaml
- run: npx playwright install chromium
- run: pnpm test:storybook:ci
```

### Key decisions

- Story tests run in **real Chromium** (Playwright), NOT jsdom. Separate test project from unit tests.
- Existing unit tests (core: 188 files, karm: 59 files) are unaffected — they keep running in jsdom via their own vitest configs.
- The Vitest addon's a11y integration complements our existing vitest-axe usage, not replaces it. Unit tests keep vitest-axe for fast feedback; story tests add real-browser a11y.

### Risks

- Playwright adds ~150MB to node_modules and CI install time (~30s for `playwright install chromium`)
- Story tests are slower than jsdom unit tests — run separately, not in the main `pnpm test` command
- Some play functions may fail in real browser if they relied on jsdom quirks (unlikely but possible)

---

## 2. Story Audit + Cleanup

### What

Audit all 170+ stories across core, karm, and brand packages. Remove dead stories, fix misplaced ones, ensure consistent hierarchy.

### Audit checklist per story

- [ ] Component still exists and is exported
- [ ] Story renders without errors
- [ ] Title follows convention (see below)
- [ ] Has `tags: ['autodocs']` if component is public API
- [ ] Has appropriate status tag (`stable`, `experimental`, `deprecated`)
- [ ] Play function (if any) still works

### Title convention

```
Core UI:       UI/<category>/<Component>
  categories:  Core, Layout, Form Controls, Data Display, Navigation, Feedback, Charts
Core Composed: Composed/<Component>
Core Shell:    Shell/<Component>
Core Motion:   Foundations/Motion/<Component>
Core AI:       AI/<Component>
Karm:          Karm/<domain>/<Component>
  domains:     Board, Tasks, Chat, Dashboard, Client, Admin, Composed
Brand:         Brand/<org>/<Component>
  orgs:        Devalok, Karm
Docs:          Getting Started, About, Foundations, Guides, Changelog
```

### Cleanup actions

- Delete stories for removed/renamed components
- Fix stories with wrong title hierarchy
- Add missing `autodocs` tags
- Remove duplicate stories (same component, different locations)

---

## 3. Tags Infrastructure

### What

Configure tag-based sidebar filtering and apply status tags to all stories during the audit.

### Tag taxonomy

| Tag | Meaning | Sidebar default |
|-----|---------|----------------|
| `autodocs` | Generate docs page (existing) | visible |
| `stable` | Production-ready component | visible |
| `experimental` | API may change | visible (with badge) |
| `deprecated` | Will be removed | hidden |
| `internal` | Not part of public API | hidden |

### Config in main.ts

```ts
tags: {
  deprecated: { sidebar: false },
  internal: { sidebar: false },
}
```

Users can toggle visibility in the sidebar filter dropdown.

### Application

Tags are applied per-story `meta`:
```ts
const meta = {
  title: 'UI/Core/Button',
  component: Button,
  tags: ['autodocs', 'stable'],
}
```

During the story audit (#2), every story gets a status tag. New stories going forward must include a status tag.

---

## 4. Story Globals for Dark Mode

### What

Document and enable per-story theme globals so individual stories can declare their theme context.

### Current state

preview.ts has a `ThemeWrapper` decorator that reads `context.globals.theme` and toggles `.dark` on `<html>`. A toolbar toggle lets users switch between light/dark.

### What changes

Nothing in the decorator. We document that stories can declare dark mode variants:

```ts
export const DarkMode: Story = {
  globals: { theme: 'dark' },
}
```

This is purely a convention — the existing decorator already reads `globals.theme`. We just haven't been using per-story globals.

### Where to document

Add a section to the Introduction MDX docs explaining the dark mode variant pattern.

---

## 5. CSF Factories Enablement

### What

Enable the CSF Factories story format for new stories. No mass migration of existing stories.

### Setup

CSF Factories requires a `#.storybook/preview` import alias. Add to `.storybook/vite.config.ts`:

```ts
resolve: {
  alias: {
    '#.storybook': resolve(__dirname),
  },
}
```

### Convention

**New stories** use CSF Factories:
```ts
import { config } from '#.storybook/preview'

const meta = config.meta({
  component: Button,
  title: 'UI/Core/Button',
  tags: ['autodocs', 'stable'],
})
export default meta

export const Default = meta.story({
  args: { children: 'Click me' },
})
```

**Existing stories** stay in CSF3 until touched for other reasons. Both formats coexist indefinitely.

### Benefits

- Full type inference — no `Meta<typeof X>`, no `type Story = StoryObj<typeof X>`
- Addon types flow through `config.meta()` automatically
- Less boilerplate per story file

### Note

CSF Factories is in "Preview" status in SB10, becomes default in SB11. React-only for now (fine for us).

---

## Out of Scope

- Mass CSF3 → CSF Factories migration (separate effort after conventions stabilize)
- Module automocking (`sb.mock`) — no current need
- Test codegen / story generation from UI — we write stories in code
- RSC testing — experimental, we don't use RSCs
- Replacing `storySort` with tags — tags filter visibility, `storySort` controls order, keep both

---

## Execution Order

1. **Vitest addon** — highest value, independent of other work
2. **Story audit + tags** — bundled together, one pass through all stories
3. **Story globals** — documentation only, trivial
4. **CSF Factories** — config + convention doc, then adopt for new stories
