# Motion System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace existing ad-hoc motion tokens with Carbon-inspired productive/expressive motion system, migrate all components, and create a Storybook guide.

**Architecture:** CSS custom properties define 7 durations + 8 easings in `semantic.css`. Tailwind preset maps them to utility classes. A `motion()` TS helper provides programmatic access. All 16 motion-using components get updated to new tokens. A new Storybook MDX page documents the system.

**Tech Stack:** CSS custom properties, Tailwind 3.4 preset, TypeScript, Storybook 8 MDX

**Design doc:** `docs/plans/2026-03-04-motion-system-design.md`

---

### Task 1: Replace motion tokens in semantic.css

**Files:**
- Modify: `src/tokens/semantic.css:179-191`

**Step 1: Replace the duration and easing token block**

In `src/tokens/semantic.css`, replace lines 179-191:

Old:
```css
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-moderate: 200ms;
  --duration-slow: 400ms;
  --duration-deliberate: 700ms;
  --ease-standard: cubic-bezier(0.2, 0, 0.38, 0.9);
  --ease-entrance: cubic-bezier(0, 0, 0.38, 0.9);
  --ease-exit: cubic-bezier(0.2, 0, 1, 0.9);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-linear: linear;
  --duration-medium: 300ms;
  --duration-enter: 225ms;
  --duration-exit: 195ms;
```

New:
```css
  /* ── Motion: Durations (Carbon-inspired scale) ── */
  --duration-instant: 0ms;
  --duration-fast-01: 70ms;
  --duration-fast-02: 110ms;
  --duration-moderate-01: 150ms;
  --duration-moderate-02: 240ms;
  --duration-slow-01: 400ms;
  --duration-slow-02: 700ms;

  /* ── Motion: Easing — Productive (task-focused, utilitarian) ── */
  --ease-productive-standard: cubic-bezier(0.2, 0, 0.38, 0.9);
  --ease-productive-entrance: cubic-bezier(0, 0, 0.38, 0.9);
  --ease-productive-exit: cubic-bezier(0.2, 0, 1, 0.9);

  /* ── Motion: Easing — Expressive (attention-grabbing, dramatic) ── */
  --ease-expressive-standard: cubic-bezier(0.4, 0.14, 0.3, 1);
  --ease-expressive-entrance: cubic-bezier(0, 0, 0.3, 1);
  --ease-expressive-exit: cubic-bezier(0.4, 0.14, 1, 1);

  /* ── Motion: Easing — Utility ── */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-linear: linear;
```

**Step 2: Verify the CSS is valid**

Run: `pnpm exec tsc --noEmit`
Expected: PASS (CSS changes don't affect TS)

**Step 3: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "feat(tokens): replace motion tokens with Carbon productive/expressive system"
```

---

### Task 2: Update Tailwind preset mappings

**Files:**
- Modify: `src/tailwind/preset.ts:259-296`

**Step 1: Update animation references in preset**

In `src/tailwind/preset.ts`, replace the `animation` block (lines 259-267):

Old:
```typescript
      animation: {
        ripple: 'ripple var(--duration-slow) linear',
        'ripple-icon': 'ripple var(--duration-medium) linear forwards',
        shake: 'shake 1s var(--ease-standard) infinite',
        'progress-indeterminate':
          'progress-indeterminate 1.5s var(--ease-standard) infinite',
        'skeleton-shimmer':
          'skeleton-shimmer 1.5s ease-in-out infinite',
      },
```

New:
```typescript
      animation: {
        ripple: 'ripple var(--duration-slow-01) linear',
        'ripple-icon': 'ripple var(--duration-moderate-02) linear forwards',
        shake: 'shake 1s var(--ease-productive-standard) infinite',
        'progress-indeterminate':
          'progress-indeterminate var(--duration-slow-02) var(--ease-productive-standard) infinite',
        'skeleton-shimmer':
          'skeleton-shimmer var(--duration-slow-02) var(--ease-linear) infinite',
      },
```

**Step 2: Replace transitionDuration block (lines 280-289)**

Old:
```typescript
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        moderate: 'var(--duration-moderate)',
        slow: 'var(--duration-slow)',
        medium: 'var(--duration-medium)',
        enter: 'var(--duration-enter)',
        exit: 'var(--duration-exit)',
        deliberate: 'var(--duration-deliberate)',
      },
```

New:
```typescript
      transitionDuration: {
        instant: 'var(--duration-instant)',
        'fast-01': 'var(--duration-fast-01)',
        'fast-02': 'var(--duration-fast-02)',
        'moderate-01': 'var(--duration-moderate-01)',
        'moderate-02': 'var(--duration-moderate-02)',
        'slow-01': 'var(--duration-slow-01)',
        'slow-02': 'var(--duration-slow-02)',
      },
```

**Step 3: Replace transitionTimingFunction block (lines 290-296)**

Old:
```typescript
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        entrance: 'var(--ease-entrance)',
        exit: 'var(--ease-exit)',
        bounce: 'var(--ease-bounce)',
        linear: 'var(--ease-linear)',
      },
```

New:
```typescript
      transitionTimingFunction: {
        'productive-standard': 'var(--ease-productive-standard)',
        'productive-entrance': 'var(--ease-productive-entrance)',
        'productive-exit': 'var(--ease-productive-exit)',
        'expressive-standard': 'var(--ease-expressive-standard)',
        'expressive-entrance': 'var(--ease-expressive-entrance)',
        'expressive-exit': 'var(--ease-expressive-exit)',
        bounce: 'var(--ease-bounce)',
        linear: 'var(--ease-linear)',
      },
```

**Step 4: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/tailwind/preset.ts
git commit -m "feat(tailwind): map new motion tokens to Tailwind duration/easing utilities"
```

---

### Task 3: Create motion() TypeScript utility

**Files:**
- Create: `src/ui/lib/motion.ts`
- Create: `src/ui/lib/__tests__/motion.test.ts`

**Step 1: Write the failing test**

Create `src/ui/lib/__tests__/motion.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { motion, duration, easings, durations } from '../motion'

describe('motion()', () => {
  it('returns productive-standard easing', () => {
    expect(motion('standard', 'productive')).toBe('cubic-bezier(0.2, 0, 0.38, 0.9)')
  })

  it('returns expressive-entrance easing', () => {
    expect(motion('entrance', 'expressive')).toBe('cubic-bezier(0, 0, 0.3, 1)')
  })

  it('returns expressive-exit easing', () => {
    expect(motion('exit', 'expressive')).toBe('cubic-bezier(0.4, 0.14, 1, 1)')
  })
})

describe('duration()', () => {
  it('returns fast-01 value', () => {
    expect(duration('fast-01')).toBe('70ms')
  })

  it('returns slow-02 value', () => {
    expect(duration('slow-02')).toBe('700ms')
  })

  it('returns instant value', () => {
    expect(duration('instant')).toBe('0ms')
  })
})

describe('easings', () => {
  it('exposes all 6 mode curves', () => {
    expect(Object.keys(easings.productive)).toEqual(['standard', 'entrance', 'exit'])
    expect(Object.keys(easings.expressive)).toEqual(['standard', 'entrance', 'exit'])
  })
})

describe('durations', () => {
  it('exposes all 7 duration values', () => {
    expect(Object.keys(durations)).toEqual([
      'instant', 'fast-01', 'fast-02', 'moderate-01', 'moderate-02', 'slow-01', 'slow-02',
    ])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/ui/lib/__tests__/motion.test.ts`
Expected: FAIL — module `../motion` not found

**Step 3: Write implementation**

Create `src/ui/lib/motion.ts`:

```typescript
export type MotionMode = 'productive' | 'expressive'
export type MotionCategory = 'standard' | 'entrance' | 'exit'
export type DurationToken =
  | 'instant'
  | 'fast-01'
  | 'fast-02'
  | 'moderate-01'
  | 'moderate-02'
  | 'slow-01'
  | 'slow-02'

export const easings: Record<MotionMode, Record<MotionCategory, string>> = {
  productive: {
    standard: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
    entrance: 'cubic-bezier(0, 0, 0.38, 0.9)',
    exit: 'cubic-bezier(0.2, 0, 1, 0.9)',
  },
  expressive: {
    standard: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
    entrance: 'cubic-bezier(0, 0, 0.3, 1)',
    exit: 'cubic-bezier(0.4, 0.14, 1, 1)',
  },
}

export const durations: Record<DurationToken, string> = {
  instant: '0ms',
  'fast-01': '70ms',
  'fast-02': '110ms',
  'moderate-01': '150ms',
  'moderate-02': '240ms',
  'slow-01': '400ms',
  'slow-02': '700ms',
}

/** Returns the CSS cubic-bezier string for a motion category and mode. */
export function motion(category: MotionCategory, mode: MotionMode): string {
  return easings[mode][category]
}

/** Returns the CSS duration string for a duration token. */
export function duration(token: DurationToken): string {
  return durations[token]
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/ui/lib/__tests__/motion.test.ts`
Expected: PASS — all 7 tests pass

**Step 5: Commit**

```bash
git add src/ui/lib/motion.ts src/ui/lib/__tests__/motion.test.ts
git commit -m "feat(motion): add motion() and duration() TypeScript utilities with tests"
```

---

### Task 4: Migrate Button component

**Files:**
- Modify: `src/ui/button.tsx:9`

**Step 1: Update the Button CVA base classes**

In `src/ui/button.tsx` line 9, find and replace:

Old: `duration-fast ease-standard`
New: `duration-fast-01 ease-productive-standard`

**Step 2: Verify build**

Run: `pnpm vitest run src/ui/__tests__/button.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/ui/button.tsx
git commit -m "refactor(button): migrate to productive motion tokens"
```

---

### Task 5: Migrate Content Card component

**Files:**
- Modify: `src/composed/content-card.tsx:6`

**Step 1: Update transition classes**

Old: `transition-[color,background-color,border-color,box-shadow] duration-moderate`
New: `transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard`

**Step 2: Commit**

```bash
git add src/composed/content-card.tsx
git commit -m "refactor(content-card): migrate to productive motion tokens"
```

---

### Task 6: Migrate Board components (Task Card + Board Column)

**Files:**
- Modify: `src/karm/board/task-card.tsx:55`
- Modify: `src/karm/board/board-column.tsx:238`

**Step 1: Update Task Card (line 55)**

Old: `transition-[color,background-color,border-color,box-shadow] duration-moderate`
New: `transition-[color,background-color,border-color,box-shadow] duration-fast-02 ease-productive-standard`

**Step 2: Update Board Column (line 238)**

Old: `transition-colors duration-moderate`
New: `transition-colors duration-fast-02 ease-productive-standard`

**Step 3: Verify board tests**

Run: `pnpm vitest run src/karm/board/`
Expected: PASS

**Step 4: Commit**

```bash
git add src/karm/board/task-card.tsx src/karm/board/board-column.tsx
git commit -m "refactor(board): migrate task-card and board-column to productive motion tokens"
```

---

### Task 7: Migrate Attendance CTA

**Files:**
- Modify: `src/karm/dashboard/attendance-cta.tsx:189`

**Step 1: Update transition**

Find the attendance CTA button area near line 189 containing `transition-all`.

Add duration and easing tokens:

Where `transition-all` appears without explicit duration/easing, add: `transition-all duration-moderate-01 ease-expressive-standard`

**Step 2: Commit**

```bash
git add src/karm/dashboard/attendance-cta.tsx
git commit -m "refactor(attendance-cta): migrate to expressive motion tokens"
```

---

### Task 8: Migrate Global Loading

**Files:**
- Modify: `src/composed/global-loading.tsx:36`

**Step 1: Update transition**

Old: `transition-all duration-slow ease-in-out`
New: `transition-all duration-slow-01 ease-productive-standard`

**Step 2: Commit**

```bash
git add src/composed/global-loading.tsx
git commit -m "refactor(global-loading): migrate to productive motion tokens"
```

---

### Task 9: Migrate Skeleton and Progress (keyframe animations)

**Files:**
- Modify: `src/ui/skeleton.tsx:13,15`
- Modify: `src/ui/progress.tsx:91`

**Step 1: Update Skeleton**

The skeleton shimmer animation is now tokenized via the Tailwind preset animation entry (updated in Task 2), so the `animate-skeleton-shimmer` class will automatically use the new tokens. No class change needed on the skeleton component itself.

Verify the shimmer animation definition in preset.ts references `var(--duration-slow-02)` (done in Task 2).

**Step 2: Update Progress indeterminate animation**

In `src/ui/progress.tsx` line 91, the hardcoded animation:

Old: `animate-[progress-indeterminate_1.5s_ease-in-out_infinite]`
New: `animate-progress-indeterminate`

This now uses the preset-defined `progress-indeterminate` animation which was tokenized in Task 2.

**Step 3: Verify tests**

Run: `pnpm vitest run src/ui/__tests__/skeleton-a11y.test.tsx src/ui/__tests__/progress.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/ui/progress.tsx
git commit -m "refactor(progress): use tokenized animation instead of hardcoded values"
```

---

### Task 10: Migrate Transitions component

**Files:**
- Modify: `src/ui/transitions.tsx:20,23,55,58,76,80,106,109`

**Step 1: Update easing class references**

In `src/ui/transitions.tsx`:

- Line 20 (Fade): `ease-entrance` → `ease-productive-entrance`
- Line 23 (Fade duration fallback): `var(--duration-enter)` → `var(--duration-moderate-02)`
- Line 55 (Collapse): `ease-standard` → `ease-productive-standard`
- Line 58 (Collapse duration fallback): `var(--duration-moderate)` → `var(--duration-moderate-02)`
- Line 76 (Grow): `ease-entrance` → `ease-productive-entrance`
- Line 80 (Grow duration fallback): `var(--duration-enter)` → `var(--duration-moderate-02)`
- Line 106 (Slide): `ease-entrance` → `ease-productive-entrance`
- Line 109 (Slide duration fallback): `var(--duration-enter)` → `var(--duration-moderate-02)`

**Step 2: Verify tests**

Run: `pnpm vitest run src/ui/__tests__/transitions.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/ui/transitions.tsx
git commit -m "refactor(transitions): migrate Fade/Collapse/Grow/Slide to productive motion tokens"
```

---

### Task 11: Migrate Date Picker components

**Files:**
- Modify: `src/composed/date-picker/calendar-grid.tsx` (4 occurrences)
- Modify: `src/composed/date-picker/date-picker.tsx` (1 occurrence)
- Modify: `src/composed/date-picker/date-range-picker.tsx` (1 occurrence)
- Modify: `src/composed/date-picker/date-time-picker.tsx` (2 occurrences)
- Modify: `src/composed/date-picker/time-picker.tsx` (2 occurrences)

**Step 1: Add duration and easing to all transition-colors**

For every `transition-colors` in these files, add tokens:

Old: `transition-colors`
New: `transition-colors duration-fast-01 ease-productive-standard`

**Step 2: Commit**

```bash
git add src/composed/date-picker/
git commit -m "refactor(date-picker): add productive motion tokens to all transition-colors"
```

---

### Task 12: Migrate Command Palette

**Files:**
- Modify: `src/composed/command-palette.tsx:176,183-187,259`

**Step 1: Add duration tokens to Radix animate-in/out**

The `data-[state=open]:animate-in` and `data-[state=closed]:animate-out` classes use Tailwind animate plugin defaults. Add explicit duration via style or additional class.

Near lines 183-187, add duration class to the content wrapper:

Add `duration-moderate-02` to the element that has the `animate-in`/`animate-out` classes.

For the `transition-colors` at line 259:
Old: `transition-colors`
New: `transition-colors duration-fast-01 ease-productive-standard`

**Step 2: Commit**

```bash
git add src/composed/command-palette.tsx
git commit -m "refactor(command-palette): add expressive motion tokens to open/close animations"
```

---

### Task 13: Add motion to components that lack it

**Files:**
- Modify: `src/ui/accordion.tsx` — add `transition-[height] duration-moderate-02 ease-productive-standard` to content
- Modify: `src/ui/tooltip.tsx` — add `duration-fast-02 ease-productive-entrance` to content
- Modify: `src/ui/dialog.tsx` — add `duration-moderate-02` to overlay/content with `ease-expressive-entrance`
- Modify: `src/ui/sheet.tsx` — add `duration-moderate-02` to overlay/content with `ease-expressive-entrance`
- Modify: `src/ui/dropdown-menu.tsx` — add `duration-moderate-01 ease-productive-entrance` to content
- Modify: `src/ui/toast.tsx` — add `duration-moderate-02 ease-expressive-entrance` to toast element

**Step 1: Read each file and identify the correct element for motion**

For each component, find the content/overlay element and add the appropriate transition/duration/easing classes per the design doc.

**Step 2: Verify all tests pass**

Run: `pnpm vitest run`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/ui/accordion.tsx src/ui/tooltip.tsx src/ui/dialog.tsx src/ui/sheet.tsx src/ui/dropdown-menu.tsx src/ui/toast.tsx
git commit -m "feat(motion): add productive/expressive motion tokens to accordion, tooltip, dialog, sheet, dropdown-menu, toast"
```

---

### Task 14: Export motion utilities from package index

**Files:**
- Modify: `src/index.ts`

**Step 1: Add motion exports**

Add to `src/index.ts`:

```typescript
export { motion, duration, easings, durations } from './ui/lib/motion'
export type { MotionMode, MotionCategory, DurationToken } from './ui/lib/motion'
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: PASS — motion exports included in bundle

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat(exports): add motion utilities to package public API"
```

---

### Task 15: Create Storybook Motion Guide

**Files:**
- Create: `src/ui/motion.mdx`

**Step 1: Create the MDX documentation page**

Create `src/ui/motion.mdx` with the following content (Storybook MDX format):

```mdx
import { Meta } from '@storybook/blocks'

<Meta title="Foundations/Motion" />

# Motion System

shilp-sutra uses a **productive/expressive** motion model inspired by Carbon Design System.

## Two Modes

### Productive Motion
Utilitarian and unobtrusive. Used when users are focused on completing tasks.
- Button hover states
- Dropdown menus opening
- Table sorting
- Toggle switches
- Form input focus

### Expressive Motion
Enthusiastic and vibrant. Reserved for significant moments.
- Modal/dialog entrance
- Toast notifications appearing
- System alerts
- Primary action confirmation
- Page-level transitions

## Duration Scale

| Token | Value | Tailwind Class | Use Case |
|-------|-------|---------------|----------|
| `--duration-instant` | 0ms | `duration-instant` | Disabled states, immediate |
| `--duration-fast-01` | 70ms | `duration-fast-01` | Button press, toggle, icon swap |
| `--duration-fast-02` | 110ms | `duration-fast-02` | Fade in/out, color shifts |
| `--duration-moderate-01` | 150ms | `duration-moderate-01` | Tooltip, small dropdown |
| `--duration-moderate-02` | 240ms | `duration-moderate-02` | Accordion, toast, dialog |
| `--duration-slow-01` | 400ms | `duration-slow-01` | Modal entrance, large panel |
| `--duration-slow-02` | 700ms | `duration-slow-02` | Overlay dimming, background |

**Rule of thumb:** The larger the element or distance traveled, the longer the duration.

## Easing Curves

### Productive Easings

| Token | Tailwind Class | When to Use |
|-------|---------------|-------------|
| `--ease-productive-standard` | `ease-productive-standard` | Element transforms in place (sort, resize, reposition) |
| `--ease-productive-entrance` | `ease-productive-entrance` | Element appears (dropdown, tooltip, fade-in) |
| `--ease-productive-exit` | `ease-productive-exit` | Element disappears (close, dismiss) |

### Expressive Easings

| Token | Tailwind Class | When to Use |
|-------|---------------|-------------|
| `--ease-expressive-standard` | `ease-expressive-standard` | Dramatic transform (hero animation, attention) |
| `--ease-expressive-entrance` | `ease-expressive-entrance` | Dramatic appearance (modal, toast, alert) |
| `--ease-expressive-exit` | `ease-expressive-exit` | Dramatic departure (dismissing important UI) |

### Utility Easings

| Token | Tailwind Class | When to Use |
|-------|---------------|-------------|
| `--ease-bounce` | `ease-bounce` | Playful micro-interactions (typing indicator) |
| `--ease-linear` | `ease-linear` | Continuous animations (spinner, progress bar, shimmer) |

## Decision Tree

```text
Is this a task-focused micro-interaction?
├── YES → Use PRODUCTIVE mode
│   ├── Element stays visible? → ease-productive-standard
│   ├── Element appearing? → ease-productive-entrance
│   └── Element leaving? → ease-productive-exit
└── NO → Is this an attention-grabbing moment?
    ├── YES → Use EXPRESSIVE mode
    │   ├── Element stays visible? → ease-expressive-standard
    │   ├── Element appearing? → ease-expressive-entrance
    │   └── Element leaving? → ease-expressive-exit
    └── NO → Is it continuous/looping?
        ├── YES → ease-linear
        └── NO → ease-productive-standard (safe default)
```

## Usage in Components

### Tailwind Classes (preferred)

```tsx
// Button hover — productive, fast
<button className="transition-colors duration-fast-01 ease-productive-standard">

// Modal entrance — expressive, moderate
<div className="transition-all duration-moderate-02 ease-expressive-entrance">

// Spinner — continuous, linear
<div className="animate-spin ease-linear">
```

### CSS Custom Properties

```css
.my-element {
  transition: opacity var(--duration-fast-02) var(--ease-productive-entrance);
}
```

### TypeScript Utility

```tsx
import { motion, duration } from '@devalok/shilp-sutra'

// Get easing curve string
motion('standard', 'productive')
// → 'cubic-bezier(0.2, 0, 0.38, 0.9)'

// Get duration string
duration('moderate-02')
// → '240ms'

// Use in inline styles
<div style={{
  transition: `transform ${duration('moderate-02')} ${motion('entrance', 'expressive')}`
}} />
```

## Accessibility

shilp-sutra respects `prefers-reduced-motion: reduce` at the global level. When a user has reduced motion enabled:

- All `animation-duration` values collapse to 0.01ms
- All `transition-duration` values collapse to 0.01ms
- `scroll-behavior` reverts to `auto`

No action needed from consumers — this is handled automatically.

## Component Motion Reference

| Component | Duration | Easing | Mode |
|-----------|----------|--------|------|
| Button | fast-01 (70ms) | productive-standard | Productive |
| Content Card | fast-02 (110ms) | productive-standard | Productive |
| Task Card | fast-02 (110ms) | productive-standard | Productive |
| Dropdown Menu | moderate-01 (150ms) | productive-entrance | Productive |
| Tooltip | fast-02 (110ms) | productive-entrance | Productive |
| Accordion | moderate-02 (240ms) | productive-standard | Productive |
| Dialog | moderate-02 (240ms) | expressive-entrance | Expressive |
| Sheet | moderate-02 (240ms) | expressive-entrance | Expressive |
| Toast | moderate-02 (240ms) | expressive-entrance | Expressive |
| Command Palette | moderate-02 (240ms) | expressive-entrance | Expressive |
| Attendance CTA | moderate-01 (150ms) | expressive-standard | Expressive |
| Global Loading | slow-01 (400ms) | productive-standard | Productive |
| Skeleton shimmer | slow-02 (700ms) | linear | Productive |
| Progress bar | slow-02 (700ms) | linear | Productive |
```

**Step 2: Verify Storybook builds**

Run: `pnpm storybook build`
Expected: PASS — new page appears under Foundations/Motion

**Step 3: Commit**

```bash
git add src/ui/motion.mdx
git commit -m "docs(storybook): add Motion system guide with productive/expressive usage"
```

---

### Task 16: Create interactive Motion demo stories

**Files:**
- Create: `src/ui/motion.stories.tsx`

**Step 1: Create interactive demo stories**

Create `src/ui/motion.stories.tsx`:

```tsx
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { durations } from './lib/motion'

const meta: Meta = {
  title: 'Foundations/Motion',
  tags: ['autodocs'],
}
export default meta

/**
 * Interactive visualization of all 7 duration tokens.
 * Click "Animate" to see each duration in action.
 */
export const DurationScale: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const tokens = Object.entries(durations) as [string, string][]
    return (
      <div className="space-y-ds-04">
        <button
          type="button"
          onClick={() => setActive((p) => !p)}
          className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors duration-fast-01 ease-productive-standard"
        >
          {active ? 'Reset' : 'Animate'}
        </button>
        <div className="space-y-ds-03">
          {tokens.map(([name, value]) => (
            <div key={name} className="flex items-center gap-ds-04">
              <code className="w-40 text-[length:var(--font-size-xs)] text-text-secondary font-mono">
                {name} ({value})
              </code>
              <div className="relative h-8 flex-1 rounded-ds-sm bg-layer-02 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-ds-sm bg-interactive"
                  style={{
                    width: active ? '100%' : '0%',
                    transition: `width ${value} var(--ease-productive-standard)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Side-by-side comparison of productive vs. expressive easing.
 */
export const EasingComparison: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const categories = ['standard', 'entrance', 'exit'] as const
    return (
      <div className="space-y-ds-04">
        <button
          type="button"
          onClick={() => setActive((p) => !p)}
          className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors duration-fast-01 ease-productive-standard"
        >
          {active ? 'Reset' : 'Animate'}
        </button>
        <div className="grid grid-cols-2 gap-ds-06">
          <div>
            <h3 className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-primary mb-ds-03">
              Productive
            </h3>
            {categories.map((cat) => (
              <div key={cat} className="mb-ds-03">
                <code className="text-[length:var(--font-size-xs)] text-text-secondary">{cat}</code>
                <div className="relative h-6 mt-ds-01 rounded-ds-sm bg-layer-02 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-ds-sm bg-interactive"
                    style={{
                      width: active ? '100%' : '0%',
                      transition: `width 400ms var(--ease-productive-${cat})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-primary mb-ds-03">
              Expressive
            </h3>
            {categories.map((cat) => (
              <div key={cat} className="mb-ds-03">
                <code className="text-[length:var(--font-size-xs)] text-text-secondary">{cat}</code>
                <div className="relative h-6 mt-ds-01 rounded-ds-sm bg-layer-02 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-ds-sm bg-brand-primary"
                    style={{
                      width: active ? '100%' : '0%',
                      transition: `width 400ms var(--ease-expressive-${cat})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
```

**Step 2: Verify Storybook runs**

Run: `pnpm storybook build`
Expected: PASS — interactive stories render under Foundations/Motion

**Step 3: Commit**

```bash
git add src/ui/motion.stories.tsx
git commit -m "docs(storybook): add interactive motion duration and easing demo stories"
```

---

### Task 17: Run full test suite and build verification

**Files:** None (verification only)

**Step 1: Run full test suite**

Run: `pnpm vitest run`
Expected: All 729+ tests PASS

**Step 2: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

**Step 3: Run build**

Run: `pnpm build`
Expected: PASS

**Step 4: Run Storybook build**

Run: `pnpm storybook build`
Expected: PASS

If any tests fail due to old token names in snapshot strings or test assertions, update those tests to reference the new token names.

---

### Task 18: Final commit — update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add motion system entry**

Add under the `[Unreleased]` section:

```markdown
### Added
- Carbon-inspired productive/expressive motion system with 7 duration tokens and 8 easing curves
- `motion()` and `duration()` TypeScript utilities for programmatic motion access
- Storybook "Foundations/Motion" guide with interactive demos and usage documentation

### Changed
- All motion-using components migrated to new token system (Button, Content Card, Task Card, Board Column, Attendance CTA, Global Loading, Skeleton, Progress, Transitions, Date Picker, Command Palette)
- Added motion tokens to Accordion, Tooltip, Dialog, Sheet, Dropdown Menu, Toast

### Removed
- Old duration tokens: `--duration-fast`, `--duration-moderate`, `--duration-slow`, `--duration-deliberate`, `--duration-medium`, `--duration-enter`, `--duration-exit`
- Old easing tokens: `--ease-standard`, `--ease-entrance`, `--ease-exit`
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): add motion system changes"
```
