# Light/Dark Mode Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all light/dark mode gaps identified by the 7-member expert council: token hygiene, arbitrary value cleanup, theme infrastructure, and visual audit preparation.

**Architecture:** CSS-first approach using custom properties with `.dark` class toggle. New `useColorMode` hook for programmatic access. Blocking script for FOWT prevention. Cookie-based persistence for RSC readiness.

**Tech Stack:** React 18, TypeScript, Tailwind 3.4, CSS custom properties, Vitest + RTL

---

## Phase 1: Token Hygiene

### Task 1: Add new semantic tokens for inset glow/overlay/text-shadow

**Files:**
- Modify: `src/tokens/semantic.css`
- Modify: `src/tailwind/preset.ts`

**Step 1: Add light-mode tokens to semantic.css**

Add before the closing `}` of the `:root` block (after line 232):

```css
  /* ── Inset Glow & Overlay ─────────────────────────── */
  --color-inset-glow:            rgba(255, 255, 255, 0.25);
  --color-inset-glow-strong:     rgba(255, 255, 255, 0.16);
  --color-inset-glow-subtle:     rgba(255, 255, 255, 0.10);
  --color-surface-overlay-light: rgba(255, 255, 255, 0.20);
  --color-surface-overlay-dark:  rgba(0, 0, 0, 0.12);
  --color-text-shadow:           rgba(0, 0, 0, 0.15);
```

**Step 2: Add dark-mode overrides to the `.dark` block**

Add before the shadows section in `.dark` (after line 343):

```css
  /* Inset Glow & Overlay */
  --color-inset-glow:            rgba(255, 255, 255, 0.10);
  --color-inset-glow-strong:     rgba(255, 255, 255, 0.08);
  --color-inset-glow-subtle:     rgba(255, 255, 255, 0.05);
  --color-surface-overlay-light: rgba(255, 255, 255, 0.08);
  --color-surface-overlay-dark:  rgba(0, 0, 0, 0.25);
  --color-text-shadow:           rgba(0, 0, 0, 0.40);
```

**Step 3: Add Tailwind preset mappings**

In `src/tailwind/preset.ts`, add to the `colors` object (after line 191):

```typescript
        'inset-glow': 'var(--color-inset-glow)',
        'inset-glow-strong': 'var(--color-inset-glow-strong)',
        'inset-glow-subtle': 'var(--color-inset-glow-subtle)',
        'surface-overlay-light': 'var(--color-surface-overlay-light)',
        'surface-overlay-dark': 'var(--color-surface-overlay-dark)',
        'layer-accent-subtle': 'var(--color-layer-accent-subtle)',
        'error-hover': 'var(--color-error-hover)',
```

**Step 4: Run typecheck and build**

```bash
pnpm tsc --noEmit && pnpm build
```

Expected: PASS (no consumers yet)

**Step 5: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add inset-glow, surface-overlay, text-shadow tokens with dark variants"
```

---

### Task 2: Add `color-scheme` CSS property

**Files:**
- Modify: `src/tokens/semantic.css`

**Step 1: Add color-scheme to :root**

At the top of the `:root` block (after line 1), add:

```css
  color-scheme: light;
```

**Step 2: Add color-scheme to .dark**

At the top of the `.dark` block (after line 235), add:

```css
  color-scheme: dark;
```

**Step 3: Run build to verify**

```bash
pnpm build
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "feat(tokens): add color-scheme property for native element theming"
```

---

### Task 3: Replace hardcoded rgba() in segmented-control.tsx

**Files:**
- Modify: `src/karm/custom-buttons/segmented-control.tsx`

**Step 1: Replace line 28 text-shadow**

```diff
- filled: "text-[var(--color-text-on-color)] [text-shadow:0px_1px_1px_rgba(0,0,0,0.15)]",
+ filled: "text-[var(--color-text-on-color)] [text-shadow:0px_1px_1px_var(--color-text-shadow)]",
```

**Step 2: Replace line 51 inset shadows**

```diff
- 'shadow-[0px_1px_3px_0.05px_var(--color-interactive-hover),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
+ 'shadow-[0px_1px_3px_0.05px_var(--color-interactive-hover),inset_0px_8px_16px_0px_var(--color-inset-glow-strong),inset_0px_2px_0px_0px_var(--color-inset-glow-subtle)]',
```

**Step 3: Replace line 66 inset shadows**

```diff
- 'shadow-[0px_4px_8px_0px_var(--color-interactive-hover),0px_1px_3px_0.05px_var(--color-layer-02),inset_0px_8px_16px_0px_rgba(255,255,255,0.16),inset_0px_2px_0px_0px_rgba(255,255,255,0.1)]',
+ 'shadow-[0px_4px_8px_0px_var(--color-interactive-hover),0px_1px_3px_0.05px_var(--color-layer-02),inset_0px_8px_16px_0px_var(--color-inset-glow-strong),inset_0px_2px_0px_0px_var(--color-inset-glow-subtle)]',
```

**Step 4: Replace lines 116-117 ripple backgrounds**

```diff
- filled: 'bg-[rgba(255,255,255,0.2)]',
- tonal: 'bg-[rgba(0,0,0,0.12)]',
+ filled: 'bg-surface-overlay-light',
+ tonal: 'bg-surface-overlay-dark',
```

**Step 5: Run build to verify**

```bash
pnpm build
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/karm/custom-buttons/segmented-control.tsx
git commit -m "fix(segmented-control): replace hardcoded rgba() with semantic tokens"
```

---

### Task 4: Replace hardcoded rgba() in render-date.tsx

**Files:**
- Modify: `src/karm/admin/dashboard/render-date.tsx`

**Step 1: Replace all 4 instances of rgba(255,255,255,0.25)**

Lines 179, 183, 211, 223 all use the same pattern. Replace each:

```diff
- shadow-[inset_0_4px_4px_rgba(255,255,255,0.25),
+ shadow-[inset_0_4px_4px_var(--color-inset-glow),
```

There are exactly 4 occurrences of `rgba(255,255,255,0.25)` in this file.

**Step 2: Run build**

```bash
pnpm build
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/karm/admin/dashboard/render-date.tsx
git commit -m "fix(render-date): replace hardcoded rgba() with inset-glow token"
```

---

### Task 5: Replace hardcoded rgba() in edit-break.tsx and calendar.tsx

**Files:**
- Modify: `src/karm/admin/break/edit-break.tsx`
- Modify: `src/karm/admin/dashboard/calendar.tsx`

**Step 1: Replace rgba in edit-break.tsx line 589**

```diff
- shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)_inset,
+ shadow-[0px_4px_4px_0px_var(--color-inset-glow)_inset,
```

**Step 2: Replace rgba in calendar.tsx line 170**

```diff
- shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)_inset,
+ shadow-[0px_4px_4px_0px_var(--color-inset-glow)_inset,
```

**Step 3: Verify zero remaining hardcoded rgba() in components**

```bash
grep -r "rgba(" src/ --include="*.tsx" | grep -v "stories" | grep -v "test" | grep -v "primitives" | grep -v "semantic.css"
```

Expected: Zero results (all rgba() now in semantic.css only)

**Step 4: Run build**

```bash
pnpm build
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/karm/admin/break/edit-break.tsx src/karm/admin/dashboard/calendar.tsx
git commit -m "fix(edit-break,calendar): replace hardcoded rgba() with inset-glow token"
```

---

### Task 6: Add missing Tailwind preset mappings

**Files:**
- Modify: `src/tailwind/preset.ts`

**Step 1: Add max-width mappings**

In `preset.ts`, add a new `maxWidth` section in the `extend` block:

```typescript
      maxWidth: {
        layout: 'var(--max-width)',
        'layout-body': 'var(--max-width-body)',
      },
```

**Step 2: Run typecheck**

```bash
pnpm tsc --noEmit
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/tailwind/preset.ts
git commit -m "feat(preset): add max-width layout mappings"
```

---

## Phase 2: Arbitrary Value Cleanup

This phase replaces ~598 instances of `bg-[var(--color-*)]` with their Tailwind preset equivalents across ~118 files. This is a mechanical, parallelizable task.

### Task 7: Clean up UI module arbitrary values (41 components)

**Files:**
- Modify: All `src/ui/*.tsx` files that contain `[var(--color-*)]`, `[var(--shadow-*)]`, `[var(--radius-*)]`, `[var(--icon-*)]`, `[var(--size-*)]`, `[var(--spacing-*)]`, `[var(--z-*)]`, `[var(--duration-*)]`

**Step 1: Perform replacements**

Apply these transformations across all `src/ui/*.tsx` files:

Color replacements (most common):
- `bg-[var(--color-X)]` -> `bg-X` (where X matches a key in preset.ts colors)
- `text-[var(--color-X)]` -> `text-X`
- `border-[var(--color-X)]` -> `border-X`
- `ring-[var(--color-X)]` -> `ring-X`
- `fill-[var(--color-X)]` -> `fill-X`
- `divide-[var(--color-X)]` -> `divide-X`

Shadow replacements:
- `shadow-[var(--shadow-NN)]` -> `shadow-NN`

Radius replacements:
- `rounded-[var(--radius-X)]` -> `rounded-ds-X`
- `rounded-t-[var(--radius-X)]` -> `rounded-t-ds-X` (and -b, -l, -r, -tl, -tr, -bl, -br)

Size replacements:
- `w-[var(--icon-X)]` -> `w-ico-X`
- `h-[var(--icon-X)]` -> `h-ico-X`
- `w-[var(--size-X)]` -> `w-ds-X`
- `h-[var(--size-X)]` -> `h-ds-X`

Spacing replacements:
- `p-[var(--spacing-XX)]` -> `p-ds-XX` (and px, py, pt, pb, pl, pr)
- `m-[var(--spacing-XX)]` -> `m-ds-XX`
- `gap-[var(--spacing-XX)]` -> `gap-ds-XX`

Z-index replacements:
- `z-[var(--z-X)]` -> `z-X`

Duration replacements:
- `duration-[var(--duration-X)]` -> `duration-X`

**EXCEPTIONS - DO NOT REPLACE:**
- `[var(--radix-*)]` patterns (Radix UI runtime variables)
- Complex shadow values with multiple parts containing `var(--color-*)` inside `shadow-[...]` compound values
- `[var(--typo-*)]` patterns in the Text component (these reference typography-semantic tokens)
- Any `[var(--border-secondary)]` or `[var(--border-tertiary)]` (these are undefined tokens that need separate audit)

**Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass

**Step 3: Run build**

```bash
pnpm build
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/ui/
git commit -m "refactor(ui): replace arbitrary CSS variable values with preset utilities"
```

---

### Task 8: Clean up shared module arbitrary values (13 components)

**Files:**
- Modify: All `src/shared/*.tsx` and `src/shared/**/*.tsx` files

**Step 1: Apply same transformation rules as Task 7**

Same replacement patterns. The shared module has ~13 components with arbitrary values.

**Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/shared/
git commit -m "refactor(shared): replace arbitrary CSS variable values with preset utilities"
```

---

### Task 9: Clean up layout module arbitrary values (6 components)

**Files:**
- Modify: All `src/layout/*.tsx` files

**Step 1: Apply same transformation rules as Task 7**

Same replacement patterns. The layout module has ~6 components.

**Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/layout/
git commit -m "refactor(layout): replace arbitrary CSS variable values with preset utilities"
```

---

### Task 10: Clean up karm module arbitrary values (43 components)

**Files:**
- Modify: All `src/karm/**/*.tsx` files (excluding `*.stories.tsx`)

**Step 1: Apply same transformation rules as Task 7**

Same replacement patterns. The karm module is the largest with ~43 components.

**Step 2: Run tests and build**

```bash
pnpm test && pnpm build
```

Expected: All pass

**Step 3: Commit**

```bash
git add src/karm/
git commit -m "refactor(karm): replace arbitrary CSS variable values with preset utilities"
```

---

### Task 11: Verify zero remaining arbitrary token values

**Step 1: Search for remaining violations**

```bash
grep -rn "\[var(--color-" src/ --include="*.tsx" | grep -v "stories" | grep -v "test" | grep -v "shadow-\[" | wc -l
```

Expected: 0 (or only compound shadow values that can't be replaced)

**Step 2: Search for remaining non-color violations**

```bash
grep -rn "\[var(--radius-\|var(--shadow-\|var(--icon-\|var(--size-\|var(--spacing-\|var(--z-\|var(--duration-" src/ --include="*.tsx" | grep -v "stories" | grep -v "test" | grep -v "radix" | wc -l
```

Expected: 0 (or only intentional exceptions like Radix variables)

---

## Phase 3: Theme Infrastructure

### Task 12: Write failing tests for useColorMode hook

**Files:**
- Create: `src/hooks/use-color-mode.test.ts`

**Step 1: Write tests**

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useColorMode } from './use-color-mode'

describe('useColorMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.cookie = 'theme=; max-age=0; path=/'
  })

  it('defaults to system when no preference saved', () => {
    const { result } = renderHook(() => useColorMode())
    expect(result.current.colorMode).toBe('system')
  })

  it('reads saved preference from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useColorMode())
    expect(result.current.colorMode).toBe('dark')
  })

  it('toggleColorMode switches from light to dark', () => {
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('light'))
    act(() => result.current.toggleColorMode())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggleColorMode switches from dark to light', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('dark'))
    act(() => result.current.toggleColorMode())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setColorMode persists to localStorage', () => {
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('dark'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('setColorMode sets cookie for SSR', () => {
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('dark'))
    expect(document.cookie).toContain('theme=dark')
  })

  it('setColorMode("system") uses matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('system'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
```

**Step 2: Run to verify failures**

```bash
pnpm vitest run src/hooks/use-color-mode.test.ts
```

Expected: FAIL (module not found)

**Step 3: Commit**

```bash
git add src/hooks/use-color-mode.test.ts
git commit -m "test(hooks): add failing tests for useColorMode hook"
```

---

### Task 13: Implement useColorMode hook

**Files:**
- Create: `src/hooks/use-color-mode.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Create the hook**

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'

export type ColorMode = 'light' | 'dark' | 'system'

function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return mode
}

export function useColorMode() {
  const [mode, setModeState] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as ColorMode) ?? 'system'
  })

  const setColorMode = useCallback((newMode: ColorMode) => {
    const resolved = resolveMode(newMode)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('theme', newMode)
    document.cookie = `theme=${newMode};path=/;max-age=31536000;SameSite=Lax`
    setModeState(newMode)
  }, [])

  const toggleColorMode = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setColorMode(isDark ? 'light' : 'dark')
  }, [setColorMode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  return { colorMode: mode, setColorMode, toggleColorMode } as const
}
```

**Step 2: Export from hooks barrel**

In `src/hooks/index.ts`, add:

```typescript
export { useColorMode, type ColorMode } from './use-color-mode'
```

**Step 3: Run tests**

```bash
pnpm vitest run src/hooks/use-color-mode.test.ts
```

Expected: All 7 tests PASS

**Step 4: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add src/hooks/use-color-mode.ts src/hooks/index.ts
git commit -m "feat(hooks): implement useColorMode hook with system preference and cookie support"
```

---

### Task 14: Create FOWT prevention script

**Files:**
- Create: `src/scripts/theme-init.ts`

**Step 1: Create the script**

```typescript
/**
 * Blocking theme initialization script.
 *
 * Inject this into <head> as an inline <script> to prevent
 * flash-of-wrong-theme (FOWT) on page load. Reads localStorage
 * first, falls back to prefers-color-scheme system preference.
 *
 * Usage in Next.js App Router layout.tsx (server component):
 *   import { THEME_INIT_SCRIPT } from '@devalok/shilp-sutra/scripts/theme-init'
 *   // Inject using your framework's safe script injection method
 *
 * Usage in plain HTML:
 *   <script>{THEME_INIT_SCRIPT}</script>
 */
export const THEME_INIT_SCRIPT = [
  '(function(){',
  'try{',
  'var d=document.documentElement,',
  't=localStorage.getItem("theme");',
  'if(t==="dark")d.classList.add("dark");',
  'else if(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)',
  'd.classList.add("dark")',
  '}catch(e){}',
  '})()',
].join('')
```

**Step 2: Run typecheck**

```bash
pnpm tsc --noEmit
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/scripts/theme-init.ts
git commit -m "feat(scripts): add FOWT prevention script for SSR/RSC theme initialization"
```

---

### Task 15: Refactor TopBar to use useColorMode

**Files:**
- Modify: `src/layout/top-bar.tsx`
- Test: `src/layout/top-bar.test.tsx` (verify existing tests still pass)

**Step 1: Replace theme state management in TopBar**

In `src/layout/top-bar.tsx`, replace lines 76-93:

```diff
- const [theme, setTheme] = useState<'light' | 'dark'>('light')
-
- useEffect(() => {
-   const savedTheme = localStorage.getItem('theme')
-   if (savedTheme === 'dark') {
-     document.documentElement.classList.add('dark')
-     setTheme('dark')
-   }
- }, [])
-
- const toggleTheme = () => {
-   document.documentElement.classList.toggle('dark')
-   const themeToSet = document.documentElement.classList.contains('dark')
-     ? 'dark'
-     : 'light'
-   localStorage.setItem('theme', themeToSet)
-   setTheme(themeToSet)
- }
+ const { colorMode, toggleColorMode } = useColorMode()
```

Add import at the top of the file:

```typescript
import { useColorMode } from '../hooks/use-color-mode'
```

Update any references to `theme` -> `colorMode` and `toggleTheme` -> `toggleColorMode` in the JSX.

**Step 2: Remove unused imports**

Remove `useState` and `useEffect` if no longer used by other code in the component.

**Step 3: Run TopBar tests**

```bash
pnpm vitest run src/layout/top-bar.test.tsx
```

Expected: All existing tests pass

**Step 4: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add src/layout/top-bar.tsx
git commit -m "refactor(top-bar): use shared useColorMode hook instead of internal theme state"
```

---

## Phase 4: Visual Audit Preparation

### Task 16: Run automated contrast audit

**Step 1: Manual Storybook audit**

This is a manual/visual task. Use Storybook to:

1. Open Storybook: `pnpm storybook`
2. Toggle dark mode using the toolbar button
3. Verify each component category:
   - Form controls (Input, Select, Checkbox, Radio, Switch, Textarea)
   - Data display (Card, Table, Badge, Alert, StatCard)
   - Navigation (Button, Tabs, Breadcrumb, Pagination)
   - Feedback (Toast, Tooltip, Dialog, Sheet)
   - Charts (all chart types)
   - Karm domain components (task cards, kanban board, chat)

4. Check for:
   - Text readable against backgrounds (4.5:1 minimum for normal text)
   - Focus rings visible in both modes
   - Status colors (success/error/warning/info) surfaces legible
   - Shadow/elevation creates depth perception in dark mode
   - Chart colors distinguishable in dark mode

**Step 2: Document any visual issues found**

Create a file `docs/audit/2026-03-02-dark-mode-visual-findings.md` with descriptions of any issues.

**Step 3: Commit findings**

```bash
git add docs/audit/
git commit -m "docs: dark mode visual audit findings"
```

---

### Task 17: Final verification and cleanup

**Step 1: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass

**Step 2: Run typecheck**

```bash
pnpm tsc --noEmit
```

Expected: PASS

**Step 3: Run build**

```bash
pnpm build
```

Expected: PASS

**Step 4: Verify no remaining hardcoded rgba() in components**

```bash
grep -rn "rgba(" src/ --include="*.tsx" | grep -v "stories\|test\|primitives\|\.css"
```

Expected: 0 results

---

## Reference: Mapping Table for Arbitrary Value Cleanup

The following Tailwind preset utility mappings are used in Tasks 7-10.

### Color Utilities

| Arbitrary Value Token | Preset Key | Example Usage |
|---|---|---|
| `--color-text-primary` | `text-primary` | `text-text-primary` |
| `--color-text-secondary` | `text-secondary` | `text-text-secondary` |
| `--color-text-tertiary` | `text-tertiary` | `text-text-tertiary` |
| `--color-text-placeholder` | `text-placeholder` | `text-text-placeholder` |
| `--color-text-disabled` | `text-disabled` | `text-text-disabled` |
| `--color-text-error` | `text-error` | `text-text-error` |
| `--color-text-success` | `text-success` | `text-text-success` |
| `--color-text-warning` | `text-warning` | `text-text-warning` |
| `--color-text-on-color` | `text-on-color` | `text-text-on-color` |
| `--color-text-link` | `text-link` | `text-text-link` |
| `--color-text-brand` | `text-brand` | `text-text-brand` |
| `--color-text-helper` | `text-helper` | `text-text-helper` |
| `--color-text-interactive` | `text-interactive` | `text-text-interactive` |
| `--color-interactive` | `interactive` | `bg-interactive` / `text-interactive` |
| `--color-interactive-hover` | `interactive-hover` | `bg-interactive-hover` |
| `--color-interactive-active` | `interactive-active` | `bg-interactive-active` |
| `--color-interactive-selected` | `interactive-selected` | `bg-interactive-selected` |
| `--color-interactive-subtle` | `interactive-subtle` | `bg-interactive-subtle` |
| `--color-interactive-disabled` | `interactive-disabled` | `bg-interactive-disabled` |
| `--color-background` | `background` | `bg-background` |
| `--color-layer-01` | `layer-01` | `bg-layer-01` |
| `--color-layer-02` | `layer-02` | `bg-layer-02` |
| `--color-layer-03` | `layer-03` | `bg-layer-03` |
| `--color-overlay` | `overlay` | `bg-overlay` |
| `--color-field` | `field` | `bg-field` |
| `--color-field-hover` | `field-hover` | `bg-field-hover` |
| `--color-field-02` | `field-02` | `bg-field-02` |
| `--color-field-02-hover` | `field-02-hover` | `bg-field-02-hover` |
| `--color-border-default` | `border` | `border-border` |
| `--color-border-subtle` | `border-subtle` | `border-border-subtle` |
| `--color-border-strong` | `border-strong` | `border-border-strong` |
| `--color-border-interactive` | `border-interactive` | `border-border-interactive` |
| `--color-border-error` | `border-error` | `border-border-error` |
| `--color-border-success` | `border-success` | `border-border-success` |
| `--color-border-warning` | `border-warning` | `border-border-warning` |
| `--color-focus` | `focus` | `ring-focus` |
| `--color-success` | `success` | `bg-success` |
| `--color-error` | `error` | `bg-error` |
| `--color-warning` | `warning` | `bg-warning` |
| `--color-info` | `info` | `bg-info` |
| `--color-divider` | `divider` | `border-divider` |
| `--color-icon-primary` | `icon-primary` | `text-icon-primary` |
| `--color-icon-secondary` | `icon-secondary` | `text-icon-secondary` |
| `--color-icon-disabled` | `icon-disabled` | `text-icon-disabled` |
| `--color-icon-on-color` | `icon-on-color` | `text-icon-on-color` |
| `--color-icon-interactive` | `icon-interactive` | `text-icon-interactive` |
| `--color-accent` | `accent` | `bg-accent` |
| `--color-accent-hover` | `accent-hover` | `bg-accent-hover` |
| `--color-accent-subtle` | `accent-subtle` | `bg-accent-subtle` |

### Non-Color Utilities

| Arbitrary Value | Preset Replacement |
|---|---|
| `rounded-[var(--radius-full)]` | `rounded-ds-full` |
| `rounded-[var(--radius-lg)]` | `rounded-ds-lg` |
| `rounded-[var(--radius-md)]` | `rounded-ds-md` |
| `rounded-[var(--radius-xl)]` | `rounded-ds-xl` |
| `rounded-[var(--radius-sm)]` | `rounded-ds-sm` |
| `rounded-[var(--radius-2xl)]` | `rounded-ds-2xl` |
| `shadow-[var(--shadow-01)]` | `shadow-01` |
| `shadow-[var(--shadow-02)]` | `shadow-02` |
| `shadow-[var(--shadow-03)]` | `shadow-03` |
| `shadow-[var(--shadow-04)]` | `shadow-04` |
| `shadow-[var(--shadow-05)]` | `shadow-05` |
| `w-[var(--icon-sm)]` | `w-ico-sm` |
| `h-[var(--icon-sm)]` | `h-ico-sm` |
| `w-[var(--icon-md)]` | `w-ico-md` |
| `h-[var(--icon-md)]` | `h-ico-md` |
| `z-[var(--z-dropdown)]` | `z-dropdown` |
| `z-[var(--z-modal)]` | `z-modal` |
| `duration-[var(--duration-fast)]` | `duration-fast` |
| `duration-[var(--duration-moderate)]` | `duration-moderate` |

### DO NOT REPLACE (intentional arbitrary values)

| Pattern | Reason |
|---|---|
| `[var(--radix-*)]` | Radix UI runtime measurement variables |
| `shadow-[complex_multi-part_value]` | Compound shadow values with mixed tokens |
| `[var(--typo-*)]` | Typography semantic tokens used in Text component |
