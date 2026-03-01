# Design System Comprehensive Roadmap — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical gaps (a11y, testing, CI, docs, API consistency) and establish brand identity for the shilp-sutra design system in a single execution session.

**Architecture:** Four phases executed in order, with independent tasks within each phase parallelized via subagents. Phase 0 (quick wins) → Phase 1 (foundation) → Phase 2 (standards & API) → Phase 3 (identity & polish).

**Tech Stack:** React 18, TypeScript 5.7, Vite 5.4, Tailwind 3.4, CVA, Vitest, axe-core, Storybook 8.6

---

## Phase 0: Quick Wins (30 minutes)

### Task 0.1: Add prefers-reduced-motion global CSS

**Files:**
- Modify: `src/tokens/semantic.css` (append at end)

**Step 1: Add reduced motion media query**

Add to the end of `src/tokens/semantic.css`:
```css
/* ── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 2: Verify Storybook still loads**

Run: `pnpm dev &` then kill after confirming no CSS errors.

**Step 3: Commit**
```bash
git add src/tokens/semantic.css
git commit -m "fix(a11y): add prefers-reduced-motion global rule

WCAG 2.3.3 compliance — disables all animations/transitions
when user has requested reduced motion.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.2: Fix Toast accessibility

**Files:**
- Modify: `src/ui/toast.tsx` (line 50)

**Step 1: Add aria attributes to Toast root**

In `src/ui/toast.tsx`, the `ToastPrimitives.Root` element at line 50 needs `role="status"` and `aria-live="polite"`:

```tsx
// BEFORE (line 50-53):
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />

// AFTER:
    <ToastPrimitives.Root
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
```

**Step 2: Commit**
```bash
git add src/ui/toast.tsx
git commit -m "fix(a11y): add role=status and aria-live to Toast

Screen readers now announce toast notifications.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.3: Fix Input accessibility (aria-invalid)

**Files:**
- Modify: `src/ui/input.tsx` (lines 10-36)

**Step 1: Add aria-invalid to input element**

The `<input>` element needs `aria-invalid` when state is 'error':

```tsx
// In the <input> element, add before {...props}:
        aria-invalid={state === 'error' || undefined}
```

This goes right before `ref={ref}` on the input element.

**Step 2: Commit**
```bash
git add src/ui/input.tsx
git commit -m "fix(a11y): add aria-invalid to Input error state

Screen readers now announce when input has validation errors.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.4: Fix Calendar keyboard + aria-label

**Files:**
- Modify: `src/karm/admin/dashboard/calendar.tsx` (lines 138-160)

**Step 1: Add Space key handler and aria-label to date cells**

```tsx
// BEFORE (lines 141-155):
    role="button"
    tabIndex={0}
    ...
    onClick={() => handleDayClick(index, day.fullDate)}
    onKeyDown={(e) =>
      e.key === 'Enter' && handleDayClick(index, day.fullDate)
    }

// AFTER:
    role="button"
    tabIndex={day.isPadding ? -1 : 0}
    aria-label={day.isPadding ? undefined : day.fullDate}
    ...
    onClick={() => handleDayClick(index, day.fullDate)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleDayClick(index, day.fullDate)
      }
    }}
```

**Step 2: Commit**
```bash
git add src/karm/admin/dashboard/calendar.tsx
git commit -m "fix(a11y): add aria-label and Space key to calendar dates

Date cells now announce their date to screen readers and
respond to both Enter and Space keys.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.5: Fix z-index violations

**Files:**
- Modify: `src/karm/admin/break/leave-request.tsx` (lines 104, 117)

**Step 1: Replace z-[999999] with z-[var(--z-tooltip)]**

Two occurrences — both tooltip divs. Replace `z-[999999]` with `z-[1600]` (the --z-tooltip value).

```
FIND:    z-[999999]
REPLACE: z-[1600]
```

Both at lines 104 and 117.

**Step 2: Commit**
```bash
git add src/karm/admin/break/leave-request.tsx
git commit -m "fix(karm): replace arbitrary z-index with token value

Uses z-tooltip (1600) instead of z-[999999].

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.6: Fix table scope attributes

**Files:**
- Modify: `src/ui/table.tsx` (around line 73)

**Step 1: Add scope="col" to TableHead th element**

```tsx
// BEFORE:
  <th
    ref={ref}
    className={cn(...)}
    {...props}
  />

// AFTER:
  <th
    ref={ref}
    scope="col"
    className={cn(...)}
    {...props}
  />
```

**Step 2: Commit**
```bash
git add src/ui/table.tsx
git commit -m "fix(a11y): add scope=col to TableHead

Improves screen reader table navigation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.7: Create CHANGELOG.md

**Files:**
- Create: `CHANGELOG.md`

**Step 1: Create initial CHANGELOG**

```markdown
# Changelog

All notable changes to `@devalok/shilp-sutra` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Toast now announces to screen readers (role="status", aria-live)
- Input sets aria-invalid on error state
- Calendar date cells have aria-labels and keyboard support (Enter + Space)
- Table headers have scope="col" for screen reader navigation
- Animations respect prefers-reduced-motion
- Z-index violations fixed in leave-request tooltips

## [0.1.0] - 2026-02-28

### Added
- Initial release: 114 components across ui/, shared/, layout/, karm/ modules
- 3-tier design token system (primitives → semantic → Tailwind)
- Vendored Radix UI primitives (zero @radix-ui runtime deps)
- Dark mode support via .dark class toggle
- Storybook 8.6 with 95 stories
- AdminDashboard compound component pattern
```

**Step 2: Commit**
```bash
git add CHANGELOG.md
git commit -m "docs: create CHANGELOG.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 0.8: Upgrade ESLint a11y rules

**Files:**
- Modify: `eslint.config.js` (lines 63-68)

**Step 1: Change jsx-a11y from warn to error**

```js
// BEFORE (lines 63-68):
// ── JSX Accessibility (recommended rules, all downgraded to warn) ─
...Object.fromEntries(
  Object.entries(jsxA11y.flatConfigs.recommended.rules).map(
    ([key, val]) => [key, Array.isArray(val) ? ['warn', ...val.slice(1)] : 'warn'],
  ),
),

// AFTER:
// ── JSX Accessibility (recommended rules at error level) ─
...jsxA11y.flatConfigs.recommended.rules,
```

**Step 2: Run lint to see current violation count**

Run: `pnpm lint 2>&1 | tail -5`

If there are too many errors to fix immediately, we can selectively keep a few rules at warn. But try error first.

**Step 3: Commit**
```bash
git add eslint.config.js
git commit -m "fix(lint): elevate jsx-a11y rules to error level

Accessibility violations now block builds instead of warning.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 1: Foundation (Testing + CI + Tokens)

### Task 1.1: Set up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test scripts + vitest devDep)

**Step 1: Install vitest and testing deps**

Run:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest-axe jsdom
```

**Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, 'src/primitives'),
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
})
```

**Step 3: Create test setup file**

Create `src/test-setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

**Step 4: Add test scripts to package.json**

Add to scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Step 5: Write a smoke test to verify setup**

Create `src/ui/button.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

**Step 6: Run test**

Run: `pnpm test`
Expected: 1 test passes.

**Step 7: Commit**
```bash
git add vitest.config.ts src/test-setup.ts src/ui/button.test.tsx package.json pnpm-lock.yaml
git commit -m "test: set up Vitest with React Testing Library

Adds vitest, @testing-library/react, jest-dom, vitest-axe.
Includes smoke test for Button component.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.2: Write core component tests (20 components)

**Files:**
- Create: 20 test files in `src/ui/`, `src/shared/`, `src/layout/`

Write tests for these critical components (each file should test rendering + a11y via axe):

**UI components (12):**
1. `src/ui/button.test.tsx` — variants, disabled, asChild, axe
2. `src/ui/input.test.tsx` — states (error/warning/success), aria-invalid, axe
3. `src/ui/checkbox.test.tsx` — checked/unchecked/indeterminate, axe
4. `src/ui/select.test.tsx` — open/close, selection, axe
5. `src/ui/dialog.test.tsx` — open/close, focus trap, axe
6. `src/ui/toast.test.tsx` — role=status, aria-live, axe
7. `src/ui/tabs.test.tsx` — tab switching, keyboard nav, axe
8. `src/ui/accordion.test.tsx` — expand/collapse, axe
9. `src/ui/badge.test.tsx` — variants, dismissible, axe
10. `src/ui/alert.test.tsx` — role=alert, variants, axe
11. `src/ui/spinner.test.tsx` — role=status, sr-only text, axe
12. `src/ui/table.test.tsx` — scope=col, structure, axe

**Shared components (5):**
13. `src/shared/empty-state.test.tsx` — with/without actions, axe
14. `src/shared/status-badge.test.tsx` — all status variants, axe
15. `src/shared/command-palette.test.tsx` — keyboard nav, search, axe
16. `src/shared/error-boundary.test.tsx` — error display, axe
17. `src/shared/date-picker.test.tsx` — open/close, selection, axe

**Layout (3):**
18. `src/layout/top-bar.test.tsx` — rendering, axe
19. `src/layout/bottom-navbar.test.tsx` — rendering, axe
20. `src/layout/notification-center.test.tsx` — rendering, axe

**Test pattern for each file:**
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { ComponentName } from './component-name'

expect.extend(toHaveNoViolations)

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>content</ComponentName>)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ComponentName>content</ComponentName>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Step: Run all tests**

Run: `pnpm test`
Expected: All 20+ tests pass.

**Step: Commit**
```bash
git add src/**/*.test.tsx
git commit -m "test: add unit + a11y tests for 20 core components

Each component tested for rendering, behavior, and axe-core
accessibility violations.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.3: Add CI quality gates

**Files:**
- Modify: `.github/workflows/deploy-storybook.yml`

**Step 1: Add quality gates before Storybook build**

Insert these steps after `pnpm install` and before `pnpm build-storybook`:

```yaml
      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build library
        run: pnpm build
```

**Step 2: Commit**
```bash
git add .github/workflows/deploy-storybook.yml
git commit -m "ci: add typecheck, lint, test, build gates

Pipeline now validates quality before deploying Storybook.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.4: Expose spacing + sizing tokens to Tailwind

**Files:**
- Modify: `src/tailwind/preset.ts`

**Step 1: Add spacing and sizing to the theme.extend section**

Add inside `theme: { extend: { ... } }`:

```ts
      spacing: {
        'ds-01': 'var(--spacing-01)',
        'ds-02': 'var(--spacing-02)',
        'ds-03': 'var(--spacing-03)',
        'ds-04': 'var(--spacing-04)',
        'ds-05': 'var(--spacing-05)',
        'ds-06': 'var(--spacing-06)',
        'ds-07': 'var(--spacing-07)',
        'ds-08': 'var(--spacing-08)',
        'ds-09': 'var(--spacing-09)',
        'ds-10': 'var(--spacing-10)',
        'ds-11': 'var(--spacing-11)',
        'ds-12': 'var(--spacing-12)',
        'ds-13': 'var(--spacing-13)',
      },
      width: {
        'ds-xs': 'var(--size-xs)',
        'ds-sm': 'var(--size-sm)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
        'ico-sm': 'var(--icon-sm)',
        'ico-md': 'var(--icon-md)',
        'ico-lg': 'var(--icon-lg)',
        'ico-xl': 'var(--icon-xl)',
      },
      height: {
        'ds-xs': 'var(--size-xs)',
        'ds-sm': 'var(--size-sm)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
        'ico-sm': 'var(--icon-sm)',
        'ico-md': 'var(--icon-md)',
        'ico-lg': 'var(--icon-lg)',
        'ico-xl': 'var(--icon-xl)',
      },
      minHeight: {
        'ds-xs': 'var(--size-xs)',
        'ds-sm': 'var(--size-sm)',
        'ds-md': 'var(--size-md)',
        'ds-lg': 'var(--size-lg)',
        'ds-xl': 'var(--size-xl)',
      },
```

**Step 2: Commit**
```bash
git add src/tailwind/preset.ts
git commit -m "feat(tokens): expose spacing + sizing tokens to Tailwind

Developers can now use p-ds-05, gap-ds-03, h-ds-md, w-ico-lg
instead of verbose var() syntax.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.5: Fix pink contrast for WCAG AA

**Files:**
- Modify: `src/tokens/primitives.css`
- Modify: `src/tokens/semantic.css`

**Step 1: Evaluate and adjust pink-500**

The legacy system used Pink-600 (#D33163) as "Primary-default" / "Blooming-lotus". The current system maps --color-interactive to --pink-500 which is #D33163 (actually the same hex). The issue is using this as foreground text on white.

The fix: Add a new semantic token `--color-text-interactive` that uses a darker shade for text contexts while keeping `--color-interactive` for backgrounds (where contrast with white text is fine).

In `src/tokens/semantic.css`, add in the :root section near the interactive tokens:
```css
  --color-text-interactive:     var(--pink-700);
```

And in the `.dark` section:
```css
  --color-text-interactive:     var(--pink-300);
```

**Step 2: Commit**
```bash
git add src/tokens/semantic.css
git commit -m "fix(a11y): add text-interactive token for WCAG AA contrast

--color-text-interactive uses pink-700 (light) / pink-300 (dark)
for text on backgrounds, passing 4.5:1 contrast ratio.
--color-interactive unchanged for background usage.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Standards & API

### Task 2.1: Fix any type casts

**Files:**
- Modify: `src/karm/admin/dashboard/attendance-overview.tsx` (lines 178, 182)
- Modify: `src/karm/admin/dashboard/render-date.tsx` (line 95)
- Modify: `src/karm/admin/break/edit-break-balance.tsx` (lines 38-40)

**Step 1: Fix attendance-overview.tsx**

Read the file first to understand the GroupedAttendance type, then replace:
```tsx
// Line 178: (groupUsers as any[]).length
// Line 182: (groupUsers as any[]).map(({ user }: any) => ({

// Fix: type the groupUsers properly based on the component's data types
```

**Step 2: Fix render-date.tsx**

```tsx
// Line 95: const disabled = (day as any).isDisabled || false
// Fix: extend the DayInfo type to include isDisabled, or use proper type guard
```

**Step 3: Fix edit-break-balance.tsx**

```tsx
// Lines 38-40: selectedLeave?.cashout === ('-' as unknown as number)
// Fix: handle the string case explicitly
const cashoutValue = selectedLeave?.cashout
const initialCashOut = typeof cashoutValue === 'string' || !cashoutValue ? 0 : cashoutValue
```

**Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: No errors.

**Step 5: Commit**
```bash
git add src/karm/admin/dashboard/attendance-overview.tsx src/karm/admin/dashboard/render-date.tsx src/karm/admin/break/edit-break-balance.tsx
git commit -m "fix(types): remove all any casts in karm/admin

Properly types groupUsers, day.isDisabled, and cashout value.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.2: Rename CustomButton type → variant

**Files:**
- Modify: `src/karm/custom-buttons/CustomButton.tsx`
- Modify: Any stories referencing `type` prop

**Step 1: Rename in component**

```tsx
// BEFORE:
export type ButtonType = 'filled' | 'tonal' | 'outline' | 'text'
interface CustomButtonProps {
  type: ButtonType

// AFTER:
export type ButtonVariant = 'filled' | 'tonal' | 'outline' | 'text'
/** @deprecated Use ButtonVariant instead */
export type ButtonType = ButtonVariant
interface CustomButtonProps {
  variant: ButtonVariant
  /** @deprecated Use variant instead */
  type?: ButtonVariant
```

Internally, use `variant` (falling back to `type` for backwards compat):
```tsx
const CustomButton: React.FC<CustomButtonProps> = ({
  variant: variantProp,
  type: typeProp,
  ...
}) => {
  const variant = variantProp ?? typeProp ?? 'filled'
```

Rename `typeClasses` → `variantClasses`.

**Step 2: Update stories to use variant**

**Step 3: Run typecheck + lint**

Run: `pnpm typecheck && pnpm lint`

**Step 4: Commit**
```bash
git add src/karm/custom-buttons/CustomButton.tsx src/karm/custom-buttons/CustomButton.stories.tsx
git commit -m "refactor(karm): rename CustomButton type prop to variant

Aligns with design system convention. type kept as deprecated
alias for one release cycle.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.3: Export all prop types

**Files:**
- Modify: Various component files to export their Props interfaces
- Modify: Barrel index files as needed

**Step 1: Audit and export missing prop types**

Ensure these are exported from their respective index files:
- AvatarStackProps from ui/
- DataTableProps from ui/
- Any other component Props interfaces that are defined but not exported

**Step 2: Commit**
```bash
git commit -m "feat(types): export all component prop interfaces

Consumers can now import props types without ComponentProps<typeof> hacks.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.4: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

**Step 1: Write contributing guide**

Include:
- Setup instructions (pnpm install, pnpm dev)
- Component creation checklist (forwardRef, displayName, className, CVA, exported types)
- Compound component policy (>8 props or 2+ sections → compound)
- Commit convention (conventional commits with scope)
- Testing requirements (unit test + axe-core assertion)
- Module boundary rules (karm/ imports from ui/shared/layout, never primitives/_internal)
- PR process

**Step 2: Commit**
```bash
git add CONTRIBUTING.md
git commit -m "docs: create CONTRIBUTING.md with component guidelines

Includes compound component policy, testing requirements,
module boundary rules, and commit conventions.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.5: Add Storybook play() tests for top interactive components

**Files:**
- Modify: 10 existing story files to add play() functions

**Priority stories to add play() functions:**
1. `src/ui/dialog.stories.tsx` — open, close, focus trap
2. `src/ui/select.stories.tsx` — open, select option, keyboard nav
3. `src/ui/tabs.stories.tsx` — click tabs, keyboard arrows
4. `src/ui/accordion.stories.tsx` — expand, collapse
5. `src/ui/dropdown-menu.stories.tsx` — open, navigate, select
6. `src/shared/command-palette.stories.tsx` — search, navigate, select
7. `src/ui/checkbox.stories.tsx` — check, uncheck
8. `src/ui/toast.stories.tsx` — trigger, verify aria
9. `src/ui/input.stories.tsx` — type, error state
10. `src/ui/alert-dialog.stories.tsx` — open, confirm, cancel

**Pattern:**
```tsx
import { within, userEvent, expect } from '@storybook/test'

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // interaction assertions here
  },
}
```

**Step: Commit**
```bash
git commit -m "test(stories): add play() interaction tests to 10 stories

Interactive components now have automated interaction testing
via Storybook test runner.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: Identity & Polish

### Task 3.1: Create design philosophy manifesto

**Files:**
- Create: `docs/design-philosophy.md`

**Content:**
A one-page document covering:
- **Name origin:** "Shilp Sutra" (शिल्प सूत्र) — craft principles
- **Design values:** Warmth, precision, accessibility, cultural grounding
- **Color philosophy:** Pink as primary — warmth and energy; the legacy of "Blooming Lotus"
- **Color glossary:** Map poetic names to tokens (Blooming-lotus = --color-interactive, Divine-white = --color-background, Dusk = --pink-200, Blush = --pink-300)
- **Composition philosophy:** Compound components over prop sprawl; opinionated about composition
- **Accessibility stance:** WCAG AA minimum, baked into components
- **Motion philosophy:** Purposeful, respectful of user preferences
- **Density:** Comfortable default, compact option for data-heavy tools

**Step: Commit**
```bash
git add docs/design-philosophy.md
git commit -m "docs: create design philosophy manifesto

Documents the cultural foundation, color glossary with legacy
poetic names, and design values of Shilp Sutra.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3.2: Custom Storybook theme

**Files:**
- Create: `.storybook/theme.ts`
- Modify: `.storybook/preview.ts`
- Modify: `.storybook/main.ts` (if needed for manager)
- Create: `.storybook/manager.ts`

**Step 1: Create custom theme**

```ts
// .storybook/theme.ts
import { create } from '@storybook/theming/create'

export default create({
  base: 'light',
  brandTitle: 'Shilp Sutra — शिल्प सूत्र',
  brandUrl: 'https://github.com/devalok',
  brandTarget: '_self',

  // Colors
  colorPrimary: '#D33163',
  colorSecondary: '#B12651',

  // UI
  appBg: '#FCF7F7',
  appContentBg: '#FFFFFF',
  appBorderColor: '#EFD5D9',
  appBorderRadius: 8,

  // Text
  textColor: '#282425',
  textInverseColor: '#FCF7F7',

  // Toolbar
  barTextColor: '#6B6164',
  barSelectedColor: '#D33163',
  barBg: '#FFFFFF',

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: '"JetBrains Mono", monospace',
})
```

**Step 2: Create manager.ts to apply theme**

```ts
// .storybook/manager.ts
import { addons } from '@storybook/manager-api'
import theme from './theme'

addons.setConfig({ theme })
```

**Step 3: Update preview.ts to use theme in docs**

Add to parameters:
```ts
docs: { theme },
```

**Step 4: Commit**
```bash
git add .storybook/theme.ts .storybook/manager.ts .storybook/preview.ts
git commit -m "feat(storybook): add branded Shilp Sutra theme

Custom colors, typography, and branding in Storybook UI.
Uses studio pink palette for a distinctive portfolio presence.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3.3: Add gradient tokens

**Files:**
- Modify: `src/tokens/semantic.css`
- Modify: `src/tailwind/preset.ts`

**Step 1: Add gradient tokens to semantic.css**

In `:root`:
```css
  /* ── Gradients ─────────────────────────────────── */
  --gradient-brand-light:       linear-gradient(135deg, var(--pink-400), var(--purple-500));
  --gradient-brand-dark:        linear-gradient(135deg, var(--pink-600), var(--purple-700));
```

In `.dark`:
```css
  --gradient-brand-light:       linear-gradient(135deg, var(--pink-500), var(--purple-600));
  --gradient-brand-dark:        linear-gradient(135deg, var(--pink-700), var(--purple-800));
```

**Step 2: Expose in Tailwind preset**

Add to theme.extend:
```ts
backgroundImage: {
  'gradient-brand': 'var(--gradient-brand-light)',
  'gradient-brand-dark': 'var(--gradient-brand-dark)',
},
```

**Step 3: Commit**
```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add branded gradient tokens

Two pink-to-purple gradients for hero surfaces and empty states.
Available as bg-gradient-brand and bg-gradient-brand-dark.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3.4: Write admin component stories (batch)

**Files:**
- Create: ~10 story files for the most critical admin components

**Priority admin stories (10):**
1. `src/karm/admin/dashboard/admin-dashboard.stories.tsx` — compound component API demo
2. `src/karm/admin/dashboard/calendar.stories.tsx` — weekly/monthly views
3. `src/karm/admin/dashboard/attendance-overview.stories.tsx` — with data, empty
4. `src/karm/admin/dashboard/leave-requests.stories.tsx` — with requests, empty
5. `src/karm/admin/break/break-admin.stories.tsx` — main break management view
6. `src/karm/admin/break/breaks.stories.tsx` — break list variants
7. `src/karm/admin/break/leave-request.stories.tsx` — single request card
8. `src/karm/admin/break/edit-break.stories.tsx` — edit form
9. `src/karm/admin/dashboard/associate-detail.stories.tsx` — detail panel
10. `src/karm/admin/adjustments/approved-adjustments.stories.tsx` — adjustments list

Each story should have:
- Default state with realistic mock data
- Empty/loading states where applicable
- Tags: `['autodocs']`
- Proper Meta typing

**Step: Commit**
```bash
git commit -m "feat(stories): add stories for 10 admin components

Documents AdminDashboard compound API, calendar, attendance,
breaks, and leave request management components.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3.5: Resolve DashboardSkeleton duplication

**Files:**
- Modify: `src/karm/admin/index.ts` or `src/shared/index.ts`

**Decision:** Keep the shared/page-skeletons.tsx version as the canonical DashboardSkeleton (it's more generic). The karm/admin version is admin-specific and should be renamed to `AdminDashboardSkeleton`.

**Step 1: Rename in karm/admin**

Rename the export in `src/karm/admin/index.ts` from `DashboardSkeleton` to `AdminDashboardSkeleton`.

**Step 2: Update any internal imports**

**Step 3: Commit**
```bash
git commit -m "fix: resolve DashboardSkeleton naming conflict

Karm admin version renamed to AdminDashboardSkeleton.
Shared version remains as DashboardSkeleton.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3.6: Resolve --color-danger vs --color-error duplication

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Check usage of --color-danger**

Search for `--color-danger` across codebase. If unused or minimal, remove it and keep only `--color-error` family.

If used, add a comment marking it as deprecated alias:
```css
  /* @deprecated Use --color-error instead */
  --color-danger:               var(--color-error);
```

**Step 2: Commit**
```bash
git commit -m "fix(tokens): resolve danger/error token duplication

Standardized on --color-error family. --color-danger deprecated.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Execution Notes

**Parallelization opportunities:**
- Phase 0: Tasks 0.1-0.8 are all independent — can run as 8 parallel subagents
- Phase 1: Tasks 1.1 must complete before 1.2; 1.3 and 1.4 are independent; 1.5 is independent
- Phase 2: Tasks 2.1-2.5 are all independent — can run as 5 parallel subagents
- Phase 3: Tasks 3.1-3.6 are all independent — can run as 6 parallel subagents

**Verification after each phase:**
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

**Total estimated tasks:** 22 tasks across 4 phases
