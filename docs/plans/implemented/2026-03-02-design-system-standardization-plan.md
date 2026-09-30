# Design System Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Incrementally standardize shilp-sutra's design system foundations to close gaps identified in the MUI comparison audit, ordered from smallest (zero-risk token additions) to largest (new components), ensuring nothing breaks at any step.

**Architecture:** Each task is backward-compatible — new tokens/components are additive, old ones deprecated but kept until migration completes. The approach is: add new → migrate usages → remove old.

**Tech Stack:** CSS custom properties, Tailwind preset, CVA, React 18, TypeScript 5.7, Vitest

**Reference:** `docs/plans/2026-03-02-design-system-standardization-audit.md`

---

## Phase 1: Token Additions (Zero-Risk, Additive Only)

These tasks only ADD new CSS custom properties and Tailwind extensions. No existing code changes. Nothing can break.

---

### Task 1: Add action state opacity tokens

Action state opacity tokens are fundamental building blocks used by every interactive component. MUI provides these globally; we currently define hover/focus/selected states per-component.

**Files:**
- Modify: `src/tokens/semantic.css:1-169` (`:root` block)
- Modify: `src/tokens/semantic.css:171-288` (`.dark` block)

**Step 1: Add action state tokens to `:root`**

In `src/tokens/semantic.css`, add after line 58 (`--color-focus-inset`):

```css
  /* ── Action State Opacities ────────────────── */
  --action-hover-opacity: 0.04;
  --action-selected-opacity: 0.08;
  --action-disabled-opacity: 0.38;
  --action-focus-opacity: 0.12;
  --action-active-opacity: 0.12;
```

**Step 2: Add dark mode overrides**

In the `.dark` block, add after line 229 (`--color-focus-inset`):

```css
  /* Action State Opacities */
  --action-hover-opacity: 0.08;
  --action-selected-opacity: 0.12;
  --action-disabled-opacity: 0.38;
  --action-focus-opacity: 0.12;
  --action-active-opacity: 0.16;
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: SUCCESS (additive only, no breakage possible)

**Step 4: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "feat(tokens): add action state opacity tokens"
```

---

### Task 2: Add font weight tokens

Named font weight tokens provide a single source of truth. Currently weights are inline in typography classes (400, 600) with no named tokens.

**Files:**
- Modify: `src/tokens/semantic.css:1-169` (`:root` block)
- Modify: `src/tailwind/preset.ts:7-13` (fontFamily section)

**Step 1: Add weight tokens to `:root`**

In `src/tokens/semantic.css`, add after the font family declarations (line 7):

```css
  /* ── Font Weights ──────────────────────────── */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
```

**Step 2: Add Tailwind font weight extensions**

In `src/tailwind/preset.ts`, add after the `fontFamily` block (after line 13):

```typescript
      fontWeight: {
        light: 'var(--font-weight-light)',
        regular: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add named font weight tokens"
```

---

### Task 3: Add breakpoint tokens

Own the breakpoint decisions in CSS custom properties so they're available to both Tailwind and JS (for resize observers, etc.).

**Files:**
- Modify: `src/tokens/semantic.css:162-164` (Layout section)

**Step 1: Add breakpoint tokens**

In `src/tokens/semantic.css`, add after the `--max-width-body` line (164):

```css
  /* ── Breakpoints ───────────────────────────── */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/tokens/semantic.css
git commit -m "feat(tokens): add breakpoint CSS custom properties"
```

---

### Task 4: Add enter/exit transition duration tokens

MUI distinguishes entering (225ms) from leaving (195ms) animations. This is a UX best practice — elements should appear slower than they disappear to feel natural.

**Files:**
- Modify: `src/tokens/semantic.css:122-132` (duration section)
- Modify: `src/tailwind/preset.ts:196-203` (transitionDuration section)

**Step 1: Add enter/exit tokens**

In `src/tokens/semantic.css`, add after `--duration-medium` (line 132):

```css
  --duration-enter: 225ms;
  --duration-exit: 195ms;
```

**Step 2: Add Tailwind extensions**

In `src/tailwind/preset.ts`, add to the `transitionDuration` block:

```typescript
        enter: 'var(--duration-enter)',
        exit: 'var(--duration-exit)',
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add enter/exit transition duration tokens"
```

---

### Task 5: Add divider color token

Explicit divider token instead of reusing border-subtle.

**Files:**
- Modify: `src/tokens/semantic.css` (both `:root` and `.dark`)

**Step 1: Add divider token to `:root`**

After `--color-border-warning` (line 56):

```css
  --color-divider:                var(--neutral-200);
```

**Step 2: Add dark mode divider**

In `.dark` block, after `--color-border-warning` (line 226):

```css
  --color-divider:                var(--neutral-700);
```

**Step 3: Add to Tailwind preset**

In `src/tailwind/preset.ts` colors block, add:

```typescript
        divider: 'var(--color-divider)',
```

**Step 4: Verify build and commit**

```bash
pnpm build
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add explicit divider color token"
```

---

## Phase 2: Typography Rationalization (High Impact, Careful Migration)

This is the most critical phase. We convert px → rem and create semantic aliases. The old classes remain as-is initially — new system is additive until migration.

---

### Task 6: Add rem-based typography CSS custom properties

Create a new set of CSS custom property tokens for font sizes using rem units. Keep existing px classes untouched.

**Files:**
- Modify: `src/tokens/semantic.css` (`:root` block)

**Step 1: Add type scale tokens**

In `src/tokens/semantic.css`, add after the font weight tokens (from Task 2):

```css
  /* ── Type Scale (rem) ──────────────────────── */
  /* Base: 16px = 1rem (browser default)          */
  --font-size-xs:   0.625rem;  /* 10px */
  --font-size-sm:   0.75rem;   /* 12px */
  --font-size-md:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.125rem;  /* 18px */
  --font-size-xl:   1.25rem;   /* 20px */
  --font-size-2xl:  1.5rem;    /* 24px */
  --font-size-3xl:  2rem;      /* 32px */
  --font-size-4xl:  2.25rem;   /* 36px */
  --font-size-5xl:  3rem;      /* 48px */
  --font-size-6xl:  3.75rem;   /* 60px */

  /* ── Line Heights ──────────────────────────── */
  --line-height-none:    1;
  --line-height-tight:   1.15;
  --line-height-snug:    1.25;
  --line-height-normal:  1.4;
  --line-height-relaxed: 1.5;
  --line-height-loose:   1.6;

  /* ── Letter Spacing ────────────────────────── */
  --tracking-tighter: -0.05em;
  --tracking-tight:   -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;
```

**Step 2: Add Tailwind fontSize extensions**

In `src/tailwind/preset.ts`, add to theme.extend:

```typescript
      fontSize: {
        'ds-xs':   ['var(--font-size-xs)',   { lineHeight: 'var(--line-height-relaxed)' }],
        'ds-sm':   ['var(--font-size-sm)',   { lineHeight: 'var(--line-height-relaxed)' }],
        'ds-md':   ['var(--font-size-md)',   { lineHeight: 'var(--line-height-relaxed)' }],
        'ds-base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-relaxed)' }],
        'ds-lg':   ['var(--font-size-lg)',   { lineHeight: 'var(--line-height-normal)' }],
        'ds-xl':   ['var(--font-size-xl)',   { lineHeight: 'var(--line-height-snug)' }],
        'ds-2xl':  ['var(--font-size-2xl)',  { lineHeight: 'var(--line-height-snug)' }],
        'ds-3xl':  ['var(--font-size-3xl)',  { lineHeight: 'var(--line-height-tight)' }],
        'ds-4xl':  ['var(--font-size-4xl)',  { lineHeight: 'var(--line-height-tight)' }],
        'ds-5xl':  ['var(--font-size-5xl)',  { lineHeight: 'var(--line-height-tight)' }],
        'ds-6xl':  ['var(--font-size-6xl)',  { lineHeight: 'var(--line-height-tight)' }],
      },
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: SUCCESS (purely additive)

**Step 4: Commit**

```bash
git add src/tokens/semantic.css src/tailwind/preset.ts
git commit -m "feat(tokens): add rem-based type scale, line-height, and tracking tokens"
```

---

### Task 7: Create semantic typography variant tokens

Map the raw type scale to semantic names. This creates a clear mapping like MUI's h1-h6, body1-2, etc.

**Files:**
- Create: `src/tokens/typography-semantic.css`
- Modify: `src/tokens/index.css`

**Step 1: Create the semantic typography token file**

Create `src/tokens/typography-semantic.css`:

```css
/* ═══════════════════════════════════════════════════════════════════
   SEMANTIC TYPOGRAPHY VARIANTS
   Maps raw type scale tokens → meaningful component names.

   Migration guide from legacy classes:
     T1-Reg  → heading-2xl    T5-Reg  → heading-sm
     T2-Reg  → heading-xl     T6-Reg  → heading-xs
     T3-Reg  → heading-lg     B1-Reg  → body-lg
     T4-Reg  → heading-md     B2-Reg  → body-md
     B2-Semibold → body-md-semibold
     B3-Reg  → body-sm        B4-Reg  → body-xs
     L1      → label-lg       L2      → label-md
     L3      → label-sm       L4      → label-xs
   ═══════════════════════════════════════════════════════════════════ */

:root {
  /* ── Heading Variants ──────────────────────── */
  --typo-heading-2xl-size:     var(--font-size-6xl);
  --typo-heading-2xl-weight:   var(--font-weight-regular);
  --typo-heading-2xl-leading:  var(--line-height-tight);
  --typo-heading-2xl-tracking: -0.02em;

  --typo-heading-xl-size:      var(--font-size-5xl);
  --typo-heading-xl-weight:    var(--font-weight-regular);
  --typo-heading-xl-leading:   var(--line-height-tight);
  --typo-heading-xl-tracking:  -0.02em;

  --typo-heading-lg-size:      var(--font-size-4xl);
  --typo-heading-lg-weight:    var(--font-weight-regular);
  --typo-heading-lg-leading:   var(--line-height-tight);
  --typo-heading-lg-tracking:  -0.02em;

  --typo-heading-md-size:      var(--font-size-3xl);
  --typo-heading-md-weight:    var(--font-weight-regular);
  --typo-heading-md-leading:   var(--line-height-tight);
  --typo-heading-md-tracking:  -0.02em;

  --typo-heading-sm-size:      var(--font-size-2xl);
  --typo-heading-sm-weight:    var(--font-weight-regular);
  --typo-heading-sm-leading:   var(--line-height-snug);
  --typo-heading-sm-tracking:  -0.02em;

  --typo-heading-xs-size:      var(--font-size-xl);
  --typo-heading-xs-weight:    var(--font-weight-regular);
  --typo-heading-xs-leading:   var(--line-height-snug);
  --typo-heading-xs-tracking:  0;

  /* ── Body Variants ─────────────────────────── */
  --typo-body-lg-size:         var(--font-size-base);
  --typo-body-lg-weight:       var(--font-weight-regular);
  --typo-body-lg-leading:      var(--line-height-relaxed);
  --typo-body-lg-tracking:     -0.02em;

  --typo-body-md-size:         var(--font-size-md);
  --typo-body-md-weight:       var(--font-weight-regular);
  --typo-body-md-leading:      var(--line-height-relaxed);
  --typo-body-md-tracking:     -0.02em;

  --typo-body-sm-size:         var(--font-size-sm);
  --typo-body-sm-weight:       var(--font-weight-regular);
  --typo-body-sm-leading:      var(--line-height-relaxed);
  --typo-body-sm-tracking:     -0.02em;

  --typo-body-xs-size:         var(--font-size-xs);
  --typo-body-xs-weight:       var(--font-weight-regular);
  --typo-body-xs-leading:      var(--line-height-relaxed);
  --typo-body-xs-tracking:     -0.02em;

  /* ── Label Variants (uppercase UI labels) ─── */
  --typo-label-lg-size:        var(--font-size-base);
  --typo-label-lg-weight:      var(--font-weight-semibold);
  --typo-label-lg-leading:     var(--line-height-snug);
  --typo-label-lg-tracking:    0.06em;

  --typo-label-md-size:        var(--font-size-md);
  --typo-label-md-weight:      var(--font-weight-semibold);
  --typo-label-md-leading:     var(--line-height-snug);
  --typo-label-md-tracking:    0.06em;

  --typo-label-sm-size:        var(--font-size-sm);
  --typo-label-sm-weight:      var(--font-weight-semibold);
  --typo-label-sm-leading:     var(--line-height-snug);
  --typo-label-sm-tracking:    0.06em;

  --typo-label-xs-size:        var(--font-size-xs);
  --typo-label-xs-weight:      var(--font-weight-semibold);
  --typo-label-xs-leading:     var(--line-height-snug);
  --typo-label-xs-tracking:    0.06em;

  /* ── Caption & Overline ────────────────────── */
  --typo-caption-size:         var(--font-size-sm);
  --typo-caption-weight:       var(--font-weight-regular);
  --typo-caption-leading:      var(--line-height-normal);
  --typo-caption-tracking:     0.025em;

  --typo-overline-size:        var(--font-size-sm);
  --typo-overline-weight:      var(--font-weight-regular);
  --typo-overline-leading:     var(--line-height-loose);
  --typo-overline-tracking:    0.08em;
}
```

**Step 2: Import in tokens/index.css**

Add to `src/tokens/index.css`:

```css
@import './typography-semantic.css';
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/tokens/typography-semantic.css src/tokens/index.css
git commit -m "feat(tokens): add semantic typography variant tokens with legacy mapping guide"
```

---

### Task 8: Create `<Text>` typography component

A Typography/Text component that maps semantic variants to correct HTML elements. This is the React-level building block for all text rendering.

**Files:**
- Create: `src/ui/text.tsx`
- Create: `src/ui/__tests__/text.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/text.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Text } from '../text'

describe('Text', () => {
  it('renders heading-2xl as h1 by default', () => {
    render(<Text variant="heading-2xl">Hello</Text>)
    const el = screen.getByText('Hello')
    expect(el.tagName).toBe('H1')
  })

  it('renders body-md as p by default', () => {
    render(<Text variant="body-md">Body text</Text>)
    const el = screen.getByText('Body text')
    expect(el.tagName).toBe('P')
  })

  it('renders label-sm as span by default', () => {
    render(<Text variant="label-sm">Label</Text>)
    const el = screen.getByText('Label')
    expect(el.tagName).toBe('SPAN')
  })

  it('allows overriding the element with as prop', () => {
    render(<Text variant="heading-2xl" as="span">Override</Text>)
    const el = screen.getByText('Override')
    expect(el.tagName).toBe('SPAN')
  })

  it('applies custom className', () => {
    render(<Text variant="body-md" className="custom">Styled</Text>)
    const el = screen.getByText('Styled')
    expect(el).toHaveClass('custom')
  })

  it('renders children correctly', () => {
    render(<Text variant="body-md">Content here</Text>)
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLParagraphElement>
    render(<Text variant="body-md" ref={ref}>Ref test</Text>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('applies label uppercase transform', () => {
    render(<Text variant="label-md">Label Text</Text>)
    const el = screen.getByText('Label Text')
    expect(el.className).toContain('uppercase')
  })

  it('applies overline uppercase transform', () => {
    render(<Text variant="overline">Overline Text</Text>)
    const el = screen.getByText('Overline Text')
    expect(el.className).toContain('uppercase')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/ui/__tests__/text.test.tsx`
Expected: FAIL — module not found

**Step 3: Write the Text component**

Create `src/ui/text.tsx`:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const textVariants = cva('font-sans', {
  variants: {
    variant: {
      'heading-2xl': 'text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)]',
      'heading-xl':  'text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] tracking-[var(--typo-heading-xl-tracking)]',
      'heading-lg':  'text-[length:var(--typo-heading-lg-size)] font-[number:var(--typo-heading-lg-weight)] leading-[var(--typo-heading-lg-leading)] tracking-[var(--typo-heading-lg-tracking)]',
      'heading-md':  'text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] tracking-[var(--typo-heading-md-tracking)]',
      'heading-sm':  'text-[length:var(--typo-heading-sm-size)] font-[number:var(--typo-heading-sm-weight)] leading-[var(--typo-heading-sm-leading)] tracking-[var(--typo-heading-sm-tracking)]',
      'heading-xs':  'text-[length:var(--typo-heading-xs-size)] font-[number:var(--typo-heading-xs-weight)] leading-[var(--typo-heading-xs-leading)] tracking-[var(--typo-heading-xs-tracking)]',
      'body-lg':     'text-[length:var(--typo-body-lg-size)] font-[number:var(--typo-body-lg-weight)] leading-[var(--typo-body-lg-leading)] tracking-[var(--typo-body-lg-tracking)]',
      'body-md':     'text-[length:var(--typo-body-md-size)] font-[number:var(--typo-body-md-weight)] leading-[var(--typo-body-md-leading)] tracking-[var(--typo-body-md-tracking)]',
      'body-sm':     'text-[length:var(--typo-body-sm-size)] font-[number:var(--typo-body-sm-weight)] leading-[var(--typo-body-sm-leading)] tracking-[var(--typo-body-sm-tracking)]',
      'body-xs':     'text-[length:var(--typo-body-xs-size)] font-[number:var(--typo-body-xs-weight)] leading-[var(--typo-body-xs-leading)] tracking-[var(--typo-body-xs-tracking)]',
      'label-lg':    'text-[length:var(--typo-label-lg-size)] font-[number:var(--typo-label-lg-weight)] leading-[var(--typo-label-lg-leading)] tracking-[var(--typo-label-lg-tracking)] uppercase',
      'label-md':    'text-[length:var(--typo-label-md-size)] font-[number:var(--typo-label-md-weight)] leading-[var(--typo-label-md-leading)] tracking-[var(--typo-label-md-tracking)] uppercase',
      'label-sm':    'text-[length:var(--typo-label-sm-size)] font-[number:var(--typo-label-sm-weight)] leading-[var(--typo-label-sm-leading)] tracking-[var(--typo-label-sm-tracking)] uppercase',
      'label-xs':    'text-[length:var(--typo-label-xs-size)] font-[number:var(--typo-label-xs-weight)] leading-[var(--typo-label-xs-leading)] tracking-[var(--typo-label-xs-tracking)] uppercase',
      caption:       'text-[length:var(--typo-caption-size)] font-[number:var(--typo-caption-weight)] leading-[var(--typo-caption-leading)] tracking-[var(--typo-caption-tracking)]',
      overline:      'text-[length:var(--typo-overline-size)] font-[number:var(--typo-overline-weight)] leading-[var(--typo-overline-leading)] tracking-[var(--typo-overline-tracking)] uppercase',
    },
  },
  defaultVariants: {
    variant: 'body-md',
  },
})

type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>

const defaultElementMap: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  'heading-2xl': 'h1',
  'heading-xl':  'h2',
  'heading-lg':  'h3',
  'heading-md':  'h4',
  'heading-sm':  'h5',
  'heading-xs':  'h6',
  'body-lg':     'p',
  'body-md':     'p',
  'body-sm':     'p',
  'body-xs':     'p',
  'label-lg':    'span',
  'label-md':    'span',
  'label-sm':    'span',
  'label-xs':    'span',
  caption:       'span',
  overline:      'span',
}

type TextProps<T extends React.ElementType = 'p'> = {
  variant?: TextVariant
  as?: T
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'variant' | 'className' | 'children'>

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body-md', as, className, children, ...props }, ref) => {
    const Component = as || defaultElementMap[variant] || 'p'
    return React.createElement(
      Component,
      { ref, className: cn(textVariants({ variant }), className), ...props },
      children,
    )
  },
)
Text.displayName = 'Text'

export { Text, textVariants, type TextProps, type TextVariant }
```

**Step 4: Run tests**

Run: `pnpm vitest run src/ui/__tests__/text.test.tsx`
Expected: ALL PASS

**Step 5: Export from ui/index.ts**

Add to `src/ui/index.ts` after the Link export (line 216):

```typescript
export { Text, textVariants, type TextProps, type TextVariant } from './text'
```

**Step 6: Verify full build**

Run: `pnpm build && pnpm vitest run`
Expected: SUCCESS

**Step 7: Commit**

```bash
git add src/ui/text.tsx src/ui/__tests__/text.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Text typography component with semantic variant mapping"
```

---

### Task 9: Add Text component Storybook stories

**Files:**
- Create: `src/ui/text.stories.tsx`

**Step 1: Create stories**

Create `src/ui/text.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Text } from './text'

const meta = {
  title: 'UI/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'heading-2xl', 'heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'heading-xs',
        'body-lg', 'body-md', 'body-sm', 'body-xs',
        'label-lg', 'label-md', 'label-sm', 'label-xs',
        'caption', 'overline',
      ],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label'],
    },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-05">
      <Text variant="heading-2xl">Heading 2XL (h1)</Text>
      <Text variant="heading-xl">Heading XL (h2)</Text>
      <Text variant="heading-lg">Heading LG (h3)</Text>
      <Text variant="heading-md">Heading MD (h4)</Text>
      <Text variant="heading-sm">Heading SM (h5)</Text>
      <Text variant="heading-xs">Heading XS (h6)</Text>
      <hr className="border-[var(--color-divider)]" />
      <Text variant="body-lg">Body LG — 16px primary body text for reading</Text>
      <Text variant="body-md">Body MD — 14px default body text for UI</Text>
      <Text variant="body-sm">Body SM — 12px secondary text and captions</Text>
      <Text variant="body-xs">Body XS — 10px fine print</Text>
      <hr className="border-[var(--color-divider)]" />
      <Text variant="label-lg">Label LG</Text>
      <Text variant="label-md">Label MD</Text>
      <Text variant="label-sm">Label SM</Text>
      <Text variant="label-xs">Label XS</Text>
      <hr className="border-[var(--color-divider)]" />
      <Text variant="caption">Caption text</Text>
      <Text variant="overline">Overline text</Text>
    </div>
  ),
}

export const CustomElement: Story = {
  args: {
    variant: 'heading-lg',
    as: 'span',
    children: 'H3 styles on a <span>',
  },
}

export const WithColor: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03">
      <Text variant="heading-sm" className="text-[var(--color-text-primary)]">Primary heading</Text>
      <Text variant="body-md" className="text-[var(--color-text-secondary)]">Secondary body text</Text>
      <Text variant="body-sm" className="text-[var(--color-text-tertiary)]">Tertiary small text</Text>
      <Text variant="body-md" className="text-[var(--color-text-brand)]">Brand colored text</Text>
      <Text variant="body-md" className="text-[var(--color-text-error)]">Error text</Text>
    </div>
  ),
}
```

**Step 2: Verify Storybook builds**

Run: `pnpm storybook --ci --smoke-test` (or just `pnpm build-storybook` if available)

**Step 3: Commit**

```bash
git add src/ui/text.stories.tsx
git commit -m "docs(ui): add stories for Text component"
```

---

## Phase 3: Layout Primitives (New Components, Zero Breakage)

New components only — nothing existing changes.

---

### Task 10: Create `<Stack>` layout component

A flexbox layout primitive with spacing, direction, alignment, and optional dividers. Replaces ad-hoc `flex flex-col gap-X` patterns.

**Files:**
- Create: `src/ui/stack.tsx`
- Create: `src/ui/__tests__/stack.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/stack.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stack } from '../stack'

describe('Stack', () => {
  it('renders children', () => {
    render(<Stack><div>Child 1</div><div>Child 2</div></Stack>)
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('defaults to vertical (column) direction', () => {
    const { container } = render(<Stack>Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('supports horizontal direction', () => {
    const { container } = render(<Stack direction="horizontal">Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-row')
  })

  it('applies gap spacing', () => {
    const { container } = render(<Stack gap="ds-04">Content</Stack>)
    expect(container.firstChild).toHaveClass('gap-ds-04')
  })

  it('applies custom className', () => {
    const { container } = render(<Stack className="custom">Content</Stack>)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('renders as custom element', () => {
    render(<Stack as="section" data-testid="stack">Content</Stack>)
    expect(screen.getByTestId('stack').tagName).toBe('SECTION')
  })

  it('supports align and justify', () => {
    const { container } = render(
      <Stack align="center" justify="between">Content</Stack>
    )
    expect(container.firstChild).toHaveClass('items-center')
    expect(container.firstChild).toHaveClass('justify-between')
  })

  it('supports wrap', () => {
    const { container } = render(<Stack wrap>Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-wrap')
  })
})
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run src/ui/__tests__/stack.test.tsx`
Expected: FAIL

**Step 3: Implement Stack**

Create `src/ui/stack.tsx`:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'

type StackProps<T extends React.ElementType = 'div'> = {
  as?: T
  direction?: 'vertical' | 'horizontal'
  gap?: string
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'className' | 'children'>

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const

const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ as, direction = 'vertical', gap, align, justify, wrap, className, children, ...props }, ref) => {
    const Component = as || 'div'
    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          gap && `gap-${gap}`,
          align && alignMap[align],
          justify && justifyMap[justify],
          wrap && 'flex-wrap',
          className,
        ),
        ...props,
      },
      children,
    )
  },
)
Stack.displayName = 'Stack'

export { Stack, type StackProps }
```

**Step 4: Run tests**

Run: `pnpm vitest run src/ui/__tests__/stack.test.tsx`
Expected: ALL PASS

**Step 5: Export and commit**

Add to `src/ui/index.ts`:

```typescript
export { Stack, type StackProps } from './stack'
```

```bash
pnpm build && pnpm vitest run
git add src/ui/stack.tsx src/ui/__tests__/stack.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Stack layout component"
```

---

### Task 11: Create `<Container>` layout component

A max-width centering container, using the existing `--max-width` and `--max-width-body` tokens.

**Files:**
- Create: `src/ui/container.tsx`
- Create: `src/ui/__tests__/container.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/container.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container } from '../container'

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('defaults to div element', () => {
    render(<Container data-testid="container">Content</Container>)
    expect(screen.getByTestId('container').tagName).toBe('DIV')
  })

  it('supports as prop', () => {
    render(<Container as="main" data-testid="container">Content</Container>)
    expect(screen.getByTestId('container').tagName).toBe('MAIN')
  })

  it('applies custom className', () => {
    render(<Container className="custom" data-testid="container">Content</Container>)
    expect(screen.getByTestId('container')).toHaveClass('custom')
  })

  it('applies mx-auto for centering', () => {
    render(<Container data-testid="container">Content</Container>)
    expect(screen.getByTestId('container')).toHaveClass('mx-auto')
  })
})
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run src/ui/__tests__/container.test.tsx`
Expected: FAIL

**Step 3: Implement Container**

Create `src/ui/container.tsx`:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'

type ContainerProps<T extends React.ElementType = 'div'> = {
  as?: T
  maxWidth?: 'default' | 'body' | 'full'
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'className' | 'children'>

const maxWidthMap = {
  default: 'max-w-[var(--max-width)]',
  body: 'max-w-[var(--max-width-body)]',
  full: 'max-w-full',
} as const

const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ as, maxWidth = 'default', className, children, ...props }, ref) => {
    const Component = as || 'div'
    return React.createElement(
      Component,
      {
        ref,
        className: cn('mx-auto w-full px-ds-05', maxWidthMap[maxWidth], className),
        ...props,
      },
      children,
    )
  },
)
Container.displayName = 'Container'

export { Container, type ContainerProps }
```

**Step 4: Run tests, export, commit**

```bash
pnpm vitest run src/ui/__tests__/container.test.tsx
```

Add to `src/ui/index.ts`:

```typescript
export { Container, type ContainerProps } from './container'
```

```bash
pnpm build && pnpm vitest run
git add src/ui/container.tsx src/ui/__tests__/container.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Container layout component"
```

---

## Phase 4: Transition Components (New, Zero Breakage)

---

### Task 12: Create transition animation components

Reusable `<Fade>`, `<Slide>`, `<Collapse>`, and `<Grow>` components for entrance/exit animations. These use the existing duration and easing tokens.

**Files:**
- Create: `src/ui/transitions.tsx`
- Create: `src/ui/__tests__/transitions.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/transitions.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Fade, Collapse, Grow } from '../transitions'

describe('Fade', () => {
  it('renders children when open', () => {
    render(<Fade open>Visible</Fade>)
    expect(screen.getByText('Visible')).toBeInTheDocument()
  })

  it('sets opacity 0 when closed', () => {
    render(<Fade open={false}>Hidden</Fade>)
    const el = screen.getByText('Hidden')
    expect(el.style.opacity).toBe('0')
  })

  it('sets opacity 1 when open', () => {
    render(<Fade open>Visible</Fade>)
    const el = screen.getByText('Visible')
    expect(el.style.opacity).toBe('1')
  })
})

describe('Collapse', () => {
  it('renders children', () => {
    render(<Collapse open>Content</Collapse>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('sets height 0 when closed', () => {
    render(<Collapse open={false}><div>Content</div></Collapse>)
    const wrapper = screen.getByText('Content').parentElement
    expect(wrapper?.style.height).toBe('0px')
  })
})

describe('Grow', () => {
  it('renders children when open', () => {
    render(<Grow open>Content</Grow>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('scales to 0 when closed', () => {
    render(<Grow open={false}>Content</Grow>)
    const el = screen.getByText('Content')
    expect(el.style.transform).toContain('scale(0)')
  })
})
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run src/ui/__tests__/transitions.test.tsx`
Expected: FAIL

**Step 3: Implement transition components**

Create `src/ui/transitions.tsx`:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'

type TransitionProps = {
  open: boolean
  duration?: string
  className?: string
  children: React.ReactNode
  unmountOnClose?: boolean
}

const Fade = React.forwardRef<HTMLDivElement, TransitionProps>(
  ({ open, duration, className, children, unmountOnClose = false, ...props }, ref) => {
    if (unmountOnClose && !open) return null
    return (
      <div
        ref={ref}
        className={cn('transition-opacity ease-entrance', className)}
        style={{
          opacity: open ? 1 : 0,
          transitionDuration: duration || 'var(--duration-enter)',
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Fade.displayName = 'Fade'

const Collapse = React.forwardRef<HTMLDivElement, TransitionProps>(
  ({ open, duration, className, children, ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState<number | undefined>(open ? undefined : 0)

    React.useEffect(() => {
      if (!contentRef.current) return
      if (open) {
        setHeight(contentRef.current.scrollHeight)
        const timer = setTimeout(() => setHeight(undefined), 300)
        return () => clearTimeout(timer)
      } else {
        setHeight(contentRef.current.scrollHeight)
        requestAnimationFrame(() => setHeight(0))
      }
    }, [open])

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden transition-[height] ease-standard', className)}
        style={{
          height: height !== undefined ? `${height}px` : 'auto',
          transitionDuration: duration || 'var(--duration-moderate)',
        }}
        {...props}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    )
  },
)
Collapse.displayName = 'Collapse'

const Grow = React.forwardRef<HTMLDivElement, TransitionProps>(
  ({ open, duration, className, children, unmountOnClose = false, ...props }, ref) => {
    if (unmountOnClose && !open) return null
    return (
      <div
        ref={ref}
        className={cn('transition-[opacity,transform] ease-entrance', className)}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(0)',
          transitionDuration: duration || 'var(--duration-enter)',
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Grow.displayName = 'Grow'

const Slide = React.forwardRef<
  HTMLDivElement,
  TransitionProps & { direction?: 'up' | 'down' | 'left' | 'right' }
>(({ open, direction = 'up', duration, className, children, unmountOnClose = false, ...props }, ref) => {
  if (unmountOnClose && !open) return null
  const translateMap = {
    up: 'translateY(100%)',
    down: 'translateY(-100%)',
    left: 'translateX(100%)',
    right: 'translateX(-100%)',
  }
  return (
    <div
      ref={ref}
      className={cn('transition-transform ease-entrance', className)}
      style={{
        transform: open ? 'translate(0)' : translateMap[direction],
        transitionDuration: duration || 'var(--duration-enter)',
      }}
      {...props}
    >
      {children}
    </div>
  )
})
Slide.displayName = 'Slide'

export { Fade, Collapse, Grow, Slide, type TransitionProps }
```

**Step 4: Run tests**

Run: `pnpm vitest run src/ui/__tests__/transitions.test.tsx`
Expected: ALL PASS

**Step 5: Export and commit**

Add to `src/ui/index.ts`:

```typescript
export { Fade, Collapse, Grow, Slide, type TransitionProps } from './transitions'
```

```bash
pnpm build && pnpm vitest run
git add src/ui/transitions.tsx src/ui/__tests__/transitions.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Fade, Collapse, Grow, Slide transition components"
```

---

## Phase 5: Missing Core Components

---

### Task 13: Create `<Chip>` component

Interactive tag component — unlike Badge (display only), Chip supports click, delete, and selection.

**Files:**
- Create: `src/ui/chip.tsx`
- Create: `src/ui/__tests__/chip.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/chip.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chip } from '../chip'

describe('Chip', () => {
  it('renders label text', () => {
    render(<Chip label="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders as button when onClick provided', () => {
    render(<Chip label="Clickable" onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders as span when not interactive', () => {
    render(<Chip label="Static" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Chip label="Click me" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders delete button when onDelete provided', () => {
    const onDelete = vi.fn()
    render(<Chip label="Deletable" onDelete={onDelete} />)
    const deleteBtn = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('supports variant prop', () => {
    const { container } = render(<Chip label="Outlined" variant="outlined" />)
    expect(container.firstChild?.className).toContain('border')
  })

  it('supports disabled state', () => {
    render(<Chip label="Disabled" onClick={() => {}} disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run src/ui/__tests__/chip.test.tsx`
Expected: FAIL

**Step 3: Implement Chip**

Create `src/ui/chip.tsx`:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const chipVariants = cva(
  'inline-flex items-center gap-ds-02 font-sans text-[length:var(--font-size-sm)] leading-[var(--line-height-relaxed)] rounded-[var(--radius-full)] transition-colors duration-fast',
  {
    variants: {
      variant: {
        filled: 'bg-[var(--color-layer-02)] text-[var(--color-text-primary)] border border-transparent',
        outlined: 'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-default)]',
      },
      size: {
        sm: 'h-6 px-ds-03',
        md: 'h-8 px-ds-04',
      },
      color: {
        default: '',
        primary: '',
        success: '',
        error: '',
        warning: '',
      },
    },
    compoundVariants: [
      { variant: 'filled', color: 'primary', className: 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]' },
      { variant: 'filled', color: 'success', className: 'bg-[var(--color-success-surface)] text-[var(--color-success-text)] border-[var(--color-success-border)]' },
      { variant: 'filled', color: 'error', className: 'bg-[var(--color-error-surface)] text-[var(--color-error-text)] border-[var(--color-error-border)]' },
      { variant: 'filled', color: 'warning', className: 'bg-[var(--color-warning-surface)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]' },
      { variant: 'outlined', color: 'primary', className: 'border-[var(--color-border-interactive)] text-[var(--color-text-interactive)]' },
      { variant: 'outlined', color: 'success', className: 'border-[var(--color-border-success)] text-[var(--color-success-text)]' },
      { variant: 'outlined', color: 'error', className: 'border-[var(--color-border-error)] text-[var(--color-error-text)]' },
      { variant: 'outlined', color: 'warning', className: 'border-[var(--color-border-warning)] text-[var(--color-warning-text)]' },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      color: 'default',
    },
  },
)

type ChipProps = Omit<VariantProps<typeof chipVariants>, 'color'> & {
  label: string
  color?: 'default' | 'primary' | 'success' | 'error' | 'warning'
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler
  onDelete?: () => void
  disabled?: boolean
  className?: string
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  ({ label, variant, size, color, icon, onClick, onDelete, disabled, className, ...props }, ref) => {
    const isClickable = !!onClick
    const Component = isClickable ? 'button' : 'span'
    const interactiveClass = isClickable && !disabled
      ? 'cursor-pointer hover:bg-[var(--color-field-hover)]'
      : ''
    const disabledClass = disabled
      ? 'opacity-[var(--action-disabled-opacity,0.38)] cursor-not-allowed'
      : ''

    return React.createElement(
      Component,
      {
        ref,
        className: cn(chipVariants({ variant, size, color }), interactiveClass, disabledClass, className),
        onClick: isClickable ? onClick : undefined,
        disabled: isClickable ? disabled : undefined,
        type: isClickable ? 'button' : undefined,
        ...props,
      },
      <>
        {icon && <span className="flex-shrink-0 [&>svg]:w-ico-sm [&>svg]:h-ico-sm">{icon}</span>}
        <span>{label}</span>
        {onDelete && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="flex-shrink-0 rounded-[var(--radius-full)] p-0.5 hover:bg-[var(--color-layer-03)] transition-colors duration-fast [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </>,
    )
  },
)
Chip.displayName = 'Chip'

export { Chip, chipVariants, type ChipProps }
```

**Step 4: Run tests, export, commit**

```bash
pnpm vitest run src/ui/__tests__/chip.test.tsx
```

Add to `src/ui/index.ts`:

```typescript
export { Chip, chipVariants, type ChipProps } from './chip'
```

```bash
pnpm build && pnpm vitest run
git add src/ui/chip.tsx src/ui/__tests__/chip.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Chip component with filled/outlined variants and delete support"
```

---

### Task 14: Create `<Stepper>` component

Multi-step workflow indicator (horizontal and vertical).

**Files:**
- Create: `src/ui/stepper.tsx`
- Create: `src/ui/__tests__/stepper.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/stepper.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stepper, Step } from '../stepper'

describe('Stepper', () => {
  const steps = ['Account', 'Profile', 'Review']

  it('renders all steps', () => {
    render(
      <Stepper activeStep={0}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    steps.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('marks completed steps', () => {
    render(
      <Stepper activeStep={1}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    const firstStep = screen.getByText('Account').closest('[data-step]')
    expect(firstStep).toHaveAttribute('data-state', 'completed')
  })

  it('marks active step', () => {
    render(
      <Stepper activeStep={1}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    const secondStep = screen.getByText('Profile').closest('[data-step]')
    expect(secondStep).toHaveAttribute('data-state', 'active')
  })

  it('marks pending steps', () => {
    render(
      <Stepper activeStep={0}>
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    const lastStep = screen.getByText('Review').closest('[data-step]')
    expect(lastStep).toHaveAttribute('data-state', 'pending')
  })

  it('supports vertical orientation', () => {
    const { container } = render(
      <Stepper activeStep={0} orientation="vertical">
        {steps.map((label) => <Step key={label} label={label} />)}
      </Stepper>
    )
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('supports optional step description', () => {
    render(
      <Stepper activeStep={0}>
        <Step label="Account" description="Create your account" />
      </Stepper>
    )
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run src/ui/__tests__/stepper.test.tsx`
Expected: FAIL

**Step 3: Implement Stepper**

Create `src/ui/stepper.tsx`:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'

type StepState = 'completed' | 'active' | 'pending'

type StepperContextValue = {
  activeStep: number
  orientation: 'horizontal' | 'vertical'
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
  orientation: 'horizontal',
})

type StepperProps = {
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
}

function Stepper({ activeStep, orientation = 'horizontal', className, children }: StepperProps) {
  const steps = React.Children.toArray(children)
  return (
    <StepperContext.Provider value={{ activeStep, orientation }}>
      <div
        className={cn(
          'flex gap-ds-02',
          orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
          className,
        )}
        role="list"
      >
        {steps.map((child, index) => (
          <React.Fragment key={index}>
            {React.isValidElement<StepInternalProps>(child)
              ? React.cloneElement(child, { _index: index })
              : child}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1',
                  orientation === 'vertical'
                    ? 'ml-ds-04 w-0.5 min-h-[var(--spacing-05)]'
                    : 'h-0.5 min-w-[var(--spacing-05)]',
                  index < activeStep
                    ? 'bg-[var(--color-interactive)]'
                    : 'bg-[var(--color-border-default)]',
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </StepperContext.Provider>
  )
}

type StepProps = {
  label: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

type StepInternalProps = StepProps & { _index?: number }

function Step({ label, description, icon, className, _index = 0 }: StepInternalProps) {
  const { activeStep, orientation } = React.useContext(StepperContext)
  const state: StepState = _index < activeStep ? 'completed' : _index === activeStep ? 'active' : 'pending'

  return (
    <div
      data-step=""
      data-state={state}
      role="listitem"
      className={cn(
        'flex items-center gap-ds-03',
        orientation === 'vertical' && 'py-ds-02',
        className,
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-ds-sm h-ds-sm rounded-[var(--radius-full)] text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] transition-colors duration-fast',
          state === 'completed' && 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]',
          state === 'active' && 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]',
          state === 'pending' && 'bg-[var(--color-layer-02)] text-[var(--color-text-tertiary)] border border-[var(--color-border-default)]',
        )}
      >
        {icon || (state === 'completed' ? (
          <svg className="w-ico-sm h-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          _index + 1
        ))}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-[length:var(--font-size-md)] font-[number:var(--font-weight-medium)] leading-[var(--line-height-snug)]',
            state === 'pending'
              ? 'text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-text-primary)]',
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-[length:var(--font-size-sm)] text-[var(--color-text-secondary)] leading-[var(--line-height-relaxed)]">
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

export { Stepper, Step, type StepperProps, type StepProps }
```

**Step 4: Run tests, export, commit**

```bash
pnpm vitest run src/ui/__tests__/stepper.test.tsx
```

Add to `src/ui/index.ts`:

```typescript
export { Stepper, Step, type StepperProps, type StepProps } from './stepper'
```

```bash
pnpm build && pnpm vitest run
git add src/ui/stepper.tsx src/ui/__tests__/stepper.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Stepper/Step component for multi-step workflows"
```

---

### Task 15: Create `<Autocomplete>` component

Combobox with search/filter, using existing Select and Popover primitives.

**Files:**
- Create: `src/ui/autocomplete.tsx`
- Create: `src/ui/__tests__/autocomplete.test.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the failing test**

Create `src/ui/__tests__/autocomplete.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Autocomplete } from '../autocomplete'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

describe('Autocomplete', () => {
  it('renders input', () => {
    render(<Autocomplete options={options} placeholder="Search fruits" />)
    expect(screen.getByPlaceholderText('Search fruits')).toBeInTheDocument()
  })

  it('shows options on focus', () => {
    render(<Autocomplete options={options} placeholder="Search" />)
    fireEvent.focus(screen.getByPlaceholderText('Search'))
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('filters options on input', () => {
    render(<Autocomplete options={options} placeholder="Search" />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ban' } })
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
  })

  it('calls onChange when option selected', () => {
    const onChange = vi.fn()
    render(<Autocomplete options={options} placeholder="Search" onChange={onChange} />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.focus(input)
    fireEvent.click(screen.getByText('Banana'))
    expect(onChange).toHaveBeenCalledWith({ label: 'Banana', value: 'banana' })
  })

  it('shows empty state when no results', () => {
    render(<Autocomplete options={options} placeholder="Search" emptyText="No results" />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'xyz' } })
    expect(screen.getByText('No results')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify failure**

Run: `pnpm vitest run src/ui/__tests__/autocomplete.test.tsx`
Expected: FAIL

**Step 3: Implement Autocomplete**

Create `src/ui/autocomplete.tsx`:

```tsx
import * as React from 'react'
import { cn } from './lib/utils'

type AutocompleteOption = {
  label: string
  value: string
}

type AutocompleteProps = {
  options: AutocompleteOption[]
  value?: AutocompleteOption | null
  onChange?: (option: AutocompleteOption) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  emptyText = 'No options',
  disabled,
  className,
}: AutocompleteProps) {
  const [query, setQuery] = React.useState(value?.label ?? '')
  const [isOpen, setIsOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const filtered = React.useMemo(
    () =>
      query
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  )

  const handleSelect = (option: AutocompleteOption) => {
    setQuery(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
    onChange?.(option)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true)
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="autocomplete-listbox"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex h-[var(--size-md)] w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-field)] px-ds-04 py-ds-03 font-sans text-[length:var(--font-size-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]',
          'outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-[var(--border-focus-offset)]',
          'transition-colors duration-fast',
          disabled && 'opacity-[var(--action-disabled-opacity,0.38)] cursor-not-allowed',
        )}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul
          id="autocomplete-listbox"
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute z-dropdown mt-ds-02 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] shadow-02',
            'max-h-60',
          )}
        >
          {filtered.length === 0 ? (
            <li className="px-ds-04 py-ds-03 text-[length:var(--font-size-md)] text-[var(--color-text-secondary)]">
              {emptyText}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  'cursor-pointer px-ds-04 py-ds-03 text-[length:var(--font-size-md)] text-[var(--color-text-primary)] transition-colors duration-fast',
                  highlightedIndex === index && 'bg-[var(--color-interactive-selected)]',
                  value?.value === option.value && 'font-[number:var(--font-weight-semibold)]',
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export { Autocomplete, type AutocompleteProps, type AutocompleteOption }
```

**Step 4: Run tests, export, commit**

```bash
pnpm vitest run src/ui/__tests__/autocomplete.test.tsx
```

Add to `src/ui/index.ts`:

```typescript
export { Autocomplete, type AutocompleteProps, type AutocompleteOption } from './autocomplete'
```

```bash
pnpm build && pnpm vitest run
git add src/ui/autocomplete.tsx src/ui/__tests__/autocomplete.test.tsx src/ui/index.ts
git commit -m "feat(ui): add Autocomplete combobox component"
```

---

## Phase 6: Legacy Typography Migration (Careful, File-by-File)

This is the largest phase. Each step migrates one file from legacy classes to the new `<Text>` component or new Tailwind font-size classes.

**This phase should be done incrementally over time — not in one sitting.** Each step migrates a small set of files.

---

### Task 16: Create legacy-to-semantic typography mapping reference

Before starting migration, document the exact mapping so every migration is consistent.

**Files:**
- Modify: `src/tokens/typography-semantic.css` (already has mapping in header comment)

The mapping from Task 7's header comment should be the canonical reference:

| Legacy Class | Semantic Name | HTML Element | Tailwind Class |
|---|---|---|---|
| T1-Reg | heading-2xl | h1 | `text-ds-6xl` |
| T2-Reg | heading-xl | h2 | `text-ds-5xl` |
| T3-Reg | heading-lg | h3 | `text-ds-4xl` |
| T4-Reg | heading-md | h4 | `text-ds-3xl` |
| T5-Reg | heading-sm | h5 | `text-ds-2xl` |
| T6-Reg | heading-xs | h6 | `text-ds-xl` |
| T7-Reg | (use heading-xs or body-lg) | — | `text-ds-lg` |
| B1-Reg | body-lg | p | `text-ds-base` |
| B2-Reg | body-md | p | `text-ds-md` |
| B2-Semibold | body-md + font-semibold | p | `text-ds-md font-semibold` |
| B3-Reg | body-sm | p/span | `text-ds-sm` |
| B4-Reg | body-xs | span | `text-ds-xs` |
| B5-Reg | body-lg (relaxed) | p | `text-ds-base` |
| B6-Reg | body-md + font-semibold | span | `text-ds-md font-semibold` |
| B7-Reg | body-sm | span | `text-ds-sm` |
| B8-Reg | body-md | span | `text-ds-md` |
| L1 | label-lg | span | `text-ds-base uppercase font-semibold tracking-wider` |
| L2 | label-md | span | `text-ds-md uppercase font-semibold tracking-wider` |
| L3 | label-sm | span | `text-ds-sm uppercase font-semibold tracking-wider` |
| L4 | label-xs | span | `text-ds-xs uppercase font-semibold tracking-wider` |
| L6 | label-md | span | `text-ds-md uppercase font-semibold tracking-wider` |
| P1-P7 | body-lg / body-md / body-sm | p | `text-ds-lg` / `text-ds-base` / `text-ds-md` / `text-ds-sm` |

**Strategy:** Replace class references one file at a time. Use `<Text>` component where possible. Where raw classes are needed (inside CVA variant strings), use `text-ds-*` classes instead.

**Step 1: Commit the reference**

```bash
git add -A
git commit -m "docs(tokens): finalize typography migration mapping reference"
```

---

### Task 17: Migrate ui/ components from legacy typography classes

Migrate the 30+ ui/ files that reference legacy typography classes. Each file is independent. Priority: most-imported components first.

**Approach per file:**
1. Replace `B2-Semibold` in CVA strings with `text-ds-md font-semibold`
2. Replace `B2-Reg` with `text-ds-md`
3. Replace `B3-Reg` with `text-ds-sm`
4. Replace `T*-Reg` with `text-ds-*` equivalents
5. Run `pnpm vitest run` after each file
6. Commit each file individually

**Example: `src/ui/button.tsx`** (line ~20 has `B2-Semibold`):
```
Old: 'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans B2-Semibold...'
New: 'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans text-ds-md font-semibold...'
```

**This is a mechanical task.** There are ~330 occurrences across 81 files. Work through them in batches of 5-10 files, testing after each batch.

**Step 1: Migrate and test batch**

For each batch:
1. Find-and-replace legacy class in the file
2. Run `pnpm vitest run`
3. Visual check in Storybook if available
4. Commit batch

```bash
git commit -m "refactor(ui): migrate button, badge, alert to rem typography"
```

**Step 2: After all files migrated, add deprecation comment to old classes**

In `src/tokens/typography.css`, add at top:

```css
/* ⚠️ DEPRECATED: These px-based classes are kept for backward compatibility.
   Use <Text variant="..."> component or text-ds-* Tailwind classes instead.
   See src/tokens/typography-semantic.css for the canonical type scale. */
```

```bash
git add -A
git commit -m "refactor: complete typography migration to rem-based system"
```

---

## Summary: Task Dependency Order

```
Phase 1 (Additive tokens — zero risk):
  Task 1:  Action state opacity tokens
  Task 2:  Font weight tokens
  Task 3:  Breakpoint tokens
  Task 4:  Enter/exit duration tokens
  Task 5:  Divider color token

Phase 2 (Typography — additive, then component):
  Task 6:  Rem type scale tokens (depends on Task 2)
  Task 7:  Semantic typography variant tokens (depends on Task 6)
  Task 8:  <Text> component (depends on Task 7)
  Task 9:  Text Storybook stories (depends on Task 8)

Phase 3 (Layout primitives — new components):
  Task 10: <Stack> component
  Task 11: <Container> component

Phase 4 (Transition components — new):
  Task 12: Fade, Collapse, Grow, Slide

Phase 5 (Missing core components):
  Task 13: <Chip> component
  Task 14: <Stepper> component
  Task 15: <Autocomplete> component

Phase 6 (Migration — careful, incremental):
  Task 16: Migration reference doc (depends on Task 7)
  Task 17: File-by-file migration (depends on Task 8, 16)
```

Total: 17 tasks, ~40 commits, zero breaking changes at any step.
