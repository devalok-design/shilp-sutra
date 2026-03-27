# Button Processing Animation + Layout Transitions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a composable processing state (marching ants + glow) and always-on layout animation to Button, making state transitions feel polished and intentional.

**Architecture:** CSS `@property` + `conic-gradient` for marching ants, CSS `box-shadow` keyframes for glow, Framer Motion `layout` for width transitions. Processing overlay renders as a pseudo-element-style span at z-[3] above grain. Button becomes `motion.button` always.

**Tech Stack:** React 18, TypeScript, CVA, Framer Motion, CSS `@property`, Tailwind preset keyframes.

**Design Doc:** `docs/plans/2026-03-27-button-processing-animation-design.md`

---

## Conventions

- **Package:** `packages/core/`
- **Tests:** `packages/core/src/ui/button.test.tsx`
- **Stories:** `packages/core/src/ui/button.stories.tsx`
- **Typecheck:** `pnpm --filter @devalok/shilp-sutra typecheck`
- **Test:** `pnpm --filter @devalok/shilp-sutra test -- --run -- button`
- **Commit after each task.**

---

## Task Dependency Graph

```
Task 1 (CSS keyframes in preset.ts) ──┐
                                       ├──→ Task 3 (processing overlay component)
Task 2 (layout ease in motion.ts) ────┘         │
                                                 ├──→ Task 5 (Button integration)
Task 4 (processing props on ButtonProps) ────────┘         │
                                                           ├──→ Task 6 (tests)
                                                           ├──→ Task 7 (stories)
                                                           └──→ Task 8 (docs)
```

**Total: 8 tasks.**

---

## Task 1: Add CSS keyframes + @property to Tailwind preset

**File:** `packages/core/src/tailwind/preset.ts`

Add three things to the preset:

1. A CSS `@property` rule for `--border-angle` (needed for conic-gradient animation).
2. Three keyframes: `processing-ants` (border rotation), `processing-glow` (breathing shadow), `processing-complete` (accelerated finish).
3. Animation utility classes with speed mappings.

**In the `keyframes` section (after `timer-bar`):**

```typescript
// Processing: marching ants (rotating conic-gradient border)
'processing-ants': {
  to: { '--border-angle': '360deg' },
},
// Processing: breathing glow (pulsing box-shadow)
'processing-glow': {
  '0%, 100%': { boxShadow: '0 0 0 0 var(--processing-glow-color)' },
  '50%': { boxShadow: '0 0 8px 3px var(--processing-glow-color)' },
},
```

**In the `animation` section (after `timer-bar`):**

```typescript
'processing-ants-ambient': 'processing-ants 3s linear infinite',
'processing-ants-working': 'processing-ants 2s linear infinite',
'processing-ants-urgent':  'processing-ants 1s linear infinite',
'processing-glow-ambient': 'processing-glow 3s ease-in-out infinite',
'processing-glow-working': 'processing-glow 2s ease-in-out infinite',
'processing-glow-urgent':  'processing-glow 1s ease-in-out infinite',
```

**Add the `@property` rule via `addBase` in the preset plugin section.** Find where `addBase` is called (likely in the plugin function) and add:

```css
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): add processing animation keyframes + @property to Tailwind preset`

---

## Task 2: Add layout ease preset to motion.ts

**File:** `packages/core/src/ui/lib/motion.ts`

Add a tween preset for layout transitions — smooth, no overshoot:

```typescript
// In the tweens object, after 'elegant':
/** Button/element layout transitions — smooth width/height changes, no overshoot */
layout: { type: 'tween', duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } as Transition,
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): add layout tween preset for smooth width transitions`

---

## Task 3: Create ProcessingOverlay internal component

**File:** Create `packages/core/src/ui/button-processing.tsx`

This is an internal component (not exported from barrel) that renders the processing visual.

```tsx
'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './lib/utils'

type ProcessingSpeed = 'ambient' | 'working' | 'urgent'
type ProcessingStyle = 'ants' | 'glow'

// Color token → CSS color for conic-gradient and box-shadow
const COLOR_TOKENS: Record<string, { solid: string; glow: string }> = {
  accent:  { solid: 'var(--color-accent-9)',  glow: 'oklch(from var(--color-accent-9) l c h / 0.25)' },
  error:   { solid: 'var(--color-error-9)',   glow: 'oklch(from var(--color-error-9) l c h / 0.25)' },
  success: { solid: 'var(--color-success-9)', glow: 'oklch(from var(--color-success-9) l c h / 0.25)' },
  warning: { solid: 'var(--color-warning-9)', glow: 'oklch(from var(--color-warning-9) l c h / 0.25)' },
  neutral: { solid: 'var(--color-neutral-9)', glow: 'oklch(from var(--color-neutral-9) l c h / 0.25)' },
}

const ANTS_ANIMATION: Record<ProcessingSpeed, string> = {
  ambient: 'animate-processing-ants-ambient',
  working: 'animate-processing-ants-working',
  urgent:  'animate-processing-ants-urgent',
}

const GLOW_ANIMATION: Record<ProcessingSpeed, string> = {
  ambient: 'animate-processing-glow-ambient',
  working: 'animate-processing-glow-working',
  urgent:  'animate-processing-glow-urgent',
}

export interface ProcessingOverlayProps {
  active: boolean
  speed: ProcessingSpeed
  style: ProcessingStyle
  color: string // 'accent' | 'error' | etc.
}

export function ProcessingOverlay({ active, speed, style: processingStyle, color }: ProcessingOverlayProps) {
  const prefersReduced = useReducedMotion()
  const tokens = COLOR_TOKENS[color] ?? COLOR_TOKENS.accent

  if (processingStyle === 'glow') {
    return (
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'pointer-events-none absolute inset-0 z-[3] rounded-[inherit]',
              !prefersReduced && GLOW_ANIMATION[speed],
            )}
            style={{
              '--processing-glow-color': tokens.glow,
              boxShadow: prefersReduced ? `0 0 4px 1px ${tokens.glow}` : undefined,
            } as React.CSSProperties}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    )
  }

  // Ants style (default)
  return (
    <AnimatePresence>
      {active && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'pointer-events-none absolute inset-[-1.5px] z-[3] rounded-[inherit]',
            !prefersReduced && ANTS_ANIMATION[speed],
          )}
          style={{
            background: prefersReduced
              ? undefined
              : `conic-gradient(from var(--border-angle), ${tokens.solid}, transparent 40%, transparent 60%, ${tokens.solid})`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1.5px',
            border: prefersReduced ? `1.5px dashed ${tokens.solid}` : undefined,
          } as React.CSSProperties}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  )
}
```

**Key details:**
- `inset-[-1.5px]` positions the overlay 1.5px outside the button (the border width)
- `mask` + `maskComposite: exclude` creates the border-only ring from the conic-gradient
- `padding: 1.5px` defines the border thickness — not too thick, not too thin
- `rounded-[inherit]` matches the button's border-radius
- `z-[3]` renders above grain (z-[1]) and content (z-[2])
- `prefers-reduced-motion`: static dashed border (ants) or static subtle shadow (glow)
- `AnimatePresence` handles the completion transition (exit animation)
- Exit for ants: fade out. Exit for glow: slight scale-up + fade (the "final pulse")

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): ProcessingOverlay internal component — ants + glow styles`

---

## Task 4: Add processing props to ButtonProps

**File:** `packages/core/src/ui/button.tsx`

Add four new props to the `ButtonProps` interface (after `asyncFeedbackDuration`):

```typescript
/**
 * Show processing animation — animated border/glow while content stays visible.
 * `true` = "working" speed. Use semantic speeds for intent:
 * - `"ambient"` (3s) — background sync, file upload
 * - `"working"` (2s) — standard API call, generation
 * - `"urgent"` (1s) — retry, nearly done
 */
processing?: boolean | 'ambient' | 'working' | 'urgent'

/** Override processing animation color. Defaults to button's own color. */
processingColor?: 'accent' | 'error' | 'success' | 'warning' | 'neutral'

/** Processing visual style. 'ants' = rotating border, 'glow' = breathing shadow. Default: 'ants' */
processingStyle?: 'ants' | 'glow'

/** Disable button during processing. Default: true. Set false for cancel-by-click patterns. */
processingDisabled?: boolean
```

No logic changes yet — just the type definitions.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): add processing props to ButtonProps interface`

---

## Task 5: Integrate processing + layout into Button component

**File:** `packages/core/src/ui/button.tsx`

This is the main integration task. Changes:

**1. Add imports:**

```typescript
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { tweens } from './lib/motion'
import { ProcessingOverlay } from './button-processing'
```

**2. Destructure new props** (in the forwardRef function params):

```typescript
processing: processingProp,
processingColor,
processingStyle = 'ants',
processingDisabled = true,
```

**3. Resolve processing state** (after `resolvedSize`):

```typescript
const processingSpeed = processingProp === true ? 'working'
  : processingProp === false || !processingProp ? undefined
  : processingProp
const isProcessing = !!processingSpeed
const resolvedProcessingColor = processingColor ?? resolvedColor ?? 'accent'
// Map deprecated 'default' color alias
const normalizedProcessingColor = resolvedProcessingColor === 'default' ? 'accent' : resolvedProcessingColor
```

**4. Update disabled logic** (line ~450):

```typescript
disabled={disabled || loading || isAsyncFeedback || (isProcessing && processingDisabled)}
```

**5. Add `aria-busy`** for processing:

```typescript
aria-busy={loading || isProcessing || undefined}
```

**6. Change `<button>` to `<motion.button>`** with layout:

```typescript
const prefersReduced = useReducedMotion()

<motion.button
  layout={!prefersReduced}
  transition={{ layout: tweens.layout }}
  {...motionProps(props)}
  // ... rest of existing props
>
```

Note: use `motionProps(props)` helper (already imported in the file's scope from `./lib/motion`) to cast React HTML props for framer-motion compatibility.

**7. Wrap icon slots in `motion.span`** for coordinated layout animation:

```tsx
// renderStartSlot — wrap existing spans:
<motion.span layout={!prefersReduced} className={cn('inline-flex shrink-0 ...')}>
  ...
</motion.span>

// renderEndSlot — same pattern
```

**8. Render ProcessingOverlay** inside the button, after grain elements:

```tsx
{/* Processing overlay — above grain, below nothing (border layer) */}
{isProcessing && (
  <ProcessingOverlay
    active={isProcessing}
    speed={processingSpeed!}
    style={processingStyle}
    color={normalizedProcessingColor}
  />
)}
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): integrate processing overlay + layout animation into Button`

---

## Task 6: Tests

**File:** `packages/core/src/ui/button.test.tsx`

Add test cases for the new features. Read the existing test file first to match patterns.

**Processing tests:**

```typescript
describe('processing state', () => {
  it('sets aria-busy when processing', () => {
    render(<Button processing>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('is disabled by default when processing', () => {
    render(<Button processing>Save</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is NOT disabled when processingDisabled={false}', () => {
    render(<Button processing processingDisabled={false}>Cancel</Button>)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('normalizes processing={true} to "working"', () => {
    const { container } = render(<Button processing>Save</Button>)
    const overlay = container.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('renders processing overlay when processing is set', () => {
    const { container } = render(<Button processing="ambient">Syncing</Button>)
    const overlay = container.querySelector('[aria-hidden="true"][class*="z-[3]"]')
    expect(overlay).toBeInTheDocument()
  })

  it('does not render overlay when processing is false', () => {
    const { container } = render(<Button processing={false}>Save</Button>)
    const overlay = container.querySelector('[class*="z-[3]"]')
    expect(overlay).toBeNull()
  })
})
```

**Layout tests are not practical in jsdom** (no layout engine), so skip layout animation tests. They'll be verified visually in Storybook.

**Verify:** `pnpm --filter @devalok/shilp-sutra test -- --run -- button`

**Commit:** `test(core): Button processing state — aria-busy, disabled, overlay rendering`

---

## Task 7: Stories

**File:** `packages/core/src/ui/button.stories.tsx`

Add a new story section for processing. Read existing stories to match the format.

**Stories to add:**

1. **ProcessingAnts** — Ants style at all three speeds side by side, with color variants:

```tsx
export const ProcessingAnts: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div className="flex items-center gap-ds-04">
        <Button processing="ambient">Ambient</Button>
        <Button processing="working">Working</Button>
        <Button processing="urgent">Urgent</Button>
      </div>
      <div className="flex items-center gap-ds-04">
        <Button processing="working" color="error">Error</Button>
        <Button processing="working" color="success">Success</Button>
        <Button processing="working" color="warning">Warning</Button>
      </div>
      <div className="flex items-center gap-ds-04">
        <Button processing="working" processingColor="success">Color Override</Button>
        <Button processing="working" variant="outline">Outline</Button>
        <Button processing="working" variant="ghost">Ghost</Button>
      </div>
    </div>
  ),
}
```

2. **ProcessingGlow** — Glow style, good for ghost/soft:

```tsx
export const ProcessingGlow: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      <Button processing="working" processingStyle="glow" variant="ghost">Ghost Glow</Button>
      <Button processing="working" processingStyle="glow" variant="soft">Soft Glow</Button>
      <Button processing="working" processingStyle="glow">Solid Glow</Button>
    </div>
  ),
}
```

3. **ProcessingWithGrain** — Processing + DevalokGrain:

```tsx
export const ProcessingWithGrain: Story = {
  render: () => (
    <Button processing="working">
      <DevalokGrain intensity="subtle" />
      Generating Report
    </Button>
  ),
}
```

4. **ProcessingInteractive** — Stateful demo: idle → processing → done:

```tsx
export const ProcessingInteractive: Story = {
  render: () => {
    const [state, setState] = React.useState<'idle' | 'processing' | 'done'>('idle')
    return (
      <Button
        processing={state === 'processing' ? 'working' : false}
        startIcon={state === 'done' ? <Icon icon={IconCheck} /> : <Icon icon={IconSend} />}
        color={state === 'done' ? 'success' : 'accent'}
        onClick={() => {
          setState('processing')
          setTimeout(() => setState('done'), 3000)
          setTimeout(() => setState('idle'), 5000)
        }}
      >
        {state === 'idle' ? 'Generate' : state === 'processing' ? 'Generating...' : 'Done!'}
      </Button>
    )
  },
}
```

5. **LayoutAnimation** — Buttons that change content, showing smooth width transitions:

```tsx
export const LayoutAnimation: Story = {
  render: () => {
    const [expanded, setExpanded] = React.useState(false)
    return (
      <div className="flex items-center gap-ds-04">
        <Button
          startIcon={expanded ? <Icon icon={IconCheck} /> : undefined}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Saved successfully' : 'Save'}
        </Button>
      </div>
    )
  },
}
```

**Verify:** Boot Storybook, navigate to Button stories, check all five new stories render correctly.

**Commit:** `feat(core): Button processing + layout animation stories`

---

## Task 8: Update docs

**Files:**
- `packages/core/docs/components/ui/button.md` — add processing props + layout to Changes
- `packages/core/llms.txt` — add processing props to Button entry
- Regenerate `llms-full.txt`: `cd packages/core && node scripts/build-component-docs.mjs`

**In button.md v0.29.0 Changes, add:**

```markdown
- **Added** `processing` prop — animated border/glow for background activity (`"ambient"` | `"working"` | `"urgent"`)
- **Added** `processingColor` — override processing animation color independently
- **Added** `processingStyle` — `"ants"` (rotating border, default) or `"glow"` (breathing shadow)
- **Added** `processingDisabled` — disable during processing (default: true)
- **Added** Always-on layout animation — smooth width transitions via Framer Motion
```

**In llms.txt Button entry, add:**

```
processing?('ambient'|'working'|'urgent'|boolean), processingColor?('accent'|'error'|'success'|'warning'|'neutral'), processingStyle?('ants'|'glow'), processingDisabled?(boolean, default true). Layout animation always on.
```

**Commit:** `docs: Button processing animation + layout transitions`

---

## Summary

| Task | Phase | What | Files |
|------|-------|------|-------|
| 1 | Foundation | CSS keyframes + @property in preset | preset.ts |
| 2 | Foundation | Layout ease tween in motion.ts | motion.ts |
| 3 | Component | ProcessingOverlay internal component | button-processing.tsx (new) |
| 4 | Types | Processing props on ButtonProps | button.tsx |
| 5 | Integration | Wire processing + layout into Button | button.tsx |
| 6 | Tests | Processing state tests | button.test.tsx |
| 7 | Stories | 5 new processing + layout stories | button.stories.tsx |
| 8 | Docs | Update button.md, llms.txt, regenerate llms-full.txt | 3 files |
