# Icon System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a context-aware `<Icon>` wrapper component with size tiers, stroke weights, animation presets, loading→success/error state machine, and Button integration — replacing raw Tabler icon usage with a standardized system.

**Architecture:** `<Icon>` reads size/stroke from `IconContext` (provided by Button, IconButton, IconGroup, or manually). Animation presets use Framer Motion with existing motion tokens. State machine delegates to the existing `Spinner` component for the loading→success/error choreography. Button's `startIcon`/`endIcon` change from raw ReactNode to `<Icon>` elements. Breaking change.

**Tech Stack:** React 18, TypeScript 5.7, Framer Motion, `@tabler/icons-react`, shilp-sutra token system.

**Design Doc:** `docs/plans/2026-03-24-icon-system-design.md`

---

## Conventions

**New files** go in `packages/core/src/ui/`.

**Tests:** `packages/core/src/ui/__tests__/icon.test.tsx`

**Stories:** `packages/core/src/ui/icon.stories.tsx`

**Commit after each task.** Conventional commits: `feat(core):`, `test(core):`, `fix(core):`.

---

## Task Dependency Graph

```
Task 1 (IconContext) → Task 2 (Icon component) → Task 3 (animations + Spinner fix)
Task 2 → Task 4 (IconGroup)
Task 3 → Task 5 (Button integration — breaking change, needs Spinner fix from Task 3)
Task 5 → Task 5b (IconButton update)
Task 5b → Task 6 (tests — including updating existing Button tests)
Task 6 → Task 7 (stories)
Task 5b → Task 8 (migrate core composed + karm)
Task 7 + 8 → Task 9 (docs)
```

Tasks 3 and 4 can parallelize after Task 2. Task 5 is sequential after Task 3 (depends on Spinner bare-mode fix).

Total: **10 tasks across 4 phases.**

---

## Phase 1: Foundation

### Task 1: Create IconContext + IconProvider

**Files:**
- Create: `packages/core/src/ui/icon-context.tsx`

**What to build:**

```typescript
import * as React from 'react'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type IconStroke = 'light' | 'regular' | 'bold'

export interface IconContextValue {
  size?: IconSize
  stroke?: IconStroke
}

const IconContext = React.createContext<IconContextValue>({})

export function IconProvider({
  size,
  stroke,
  children,
}: IconContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ size, stroke }), [size, stroke])
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}

export function useIconContext(): IconContextValue {
  return React.useContext(IconContext)
}

export { IconContext }
```

Add to barrel: `packages/core/src/ui/index.ts`

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): add IconContext + IconProvider + useIconContext`

---

### Task 2: Create the `<Icon>` component

**Files:**
- Create: `packages/core/src/ui/icon.tsx`

**What to build:**

Size map (px values):
```typescript
const SIZE_PX: Record<IconSize, number> = {
  xs: 14, sm: 16, md: 18, lg: 20, xl: 24, '2xl': 32,
}
```

Stroke map (per size × weight):
```typescript
const STROKE_MAP: Record<IconStroke, Record<IconSize, number>> = {
  light:   { xs: 1.25, sm: 1.5, md: 1.5, lg: 1.75, xl: 2,    '2xl': 2 },
  regular: { xs: 1.5,  sm: 2,   md: 2,   lg: 2,    xl: 2,    '2xl': 2.25 },
  bold:    { xs: 2,    sm: 2.5, md: 2.5, lg: 2.5,  xl: 2.5,  '2xl': 2.5 },
}
```

The component:
```typescript
export interface IconProps {
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string; title?: string }>
  size?: IconSize
  stroke?: IconStroke
  label?: string
  animate?: 'spin' | 'pulse' | 'bounce' | 'none' | { rotate?: number; scale?: number }
  state?: 'idle' | 'loading' | 'success' | 'error'
  className?: string
}
```

Resolution logic:
1. Read `useIconContext()` for defaults
2. Explicit props override context
3. Final defaults: `size='md'`, `stroke='regular'`

File MUST start with `'use client'` (uses Framer Motion in Task 3).

Rendering (no animation or state yet — Task 3 adds those):
```tsx
const resolvedSize = size ?? ctx.size ?? 'md'
const resolvedStroke = stroke ?? ctx.stroke ?? 'regular'
const px = SIZE_PX[resolvedSize]
const sw = STROKE_MAP[resolvedStroke][resolvedSize]

const Icon = icon  // the Tabler component

return label ? (
  <Icon size={px} stroke={sw} className={className} title={label} aria-label={label} role="img" />
) : (
  <Icon size={px} stroke={sw} className={className} aria-hidden="true" />
)
```

Export from barrel.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): add <Icon> component with size tiers, stroke weights, a11y`

---

## Phase 2: Animation + IconGroup

### Task 3: Add animation system to Icon

**Files:**
- Modify: `packages/core/src/ui/icon.tsx`
- Modify: `packages/core/src/ui/spinner.tsx` (make arc color use currentColor in bare mode)

**Tier 1 — Preset animations:**

Wrap the Tabler icon in `motion.span` (not `motion.svg` — the SVG is rendered by Tabler):

```tsx
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { springs } from './lib/motion'

// Animation presets
const presets = {
  spin:   { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: 'linear' } },
  pulse:  { animate: { scale: [1, 1.15, 1] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  bounce: { animate: { y: [0, -4, 0] }, transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
}
```

When `animate` is a preset string, apply from the map. When it's an object `{ rotate, scale }`, use `springs.snappy` — but guard for empty object: if neither `rotate` nor `scale` is defined, skip the animation wrapper entirely. When `'none'`, no animation. When reduced motion is preferred, skip all presets.

**Priority rule:** If both `state` and `animate` are set, `state` wins. The `animate` prop is ignored when `state !== 'idle'`. Document this in JSDoc.

**Tier 2 — State machine:**

When `state` is set, Icon switches between the Tabler icon (idle) and Spinner (loading/success/error):

```tsx
if (state && state !== 'idle') {
  // Map Icon size to Spinner size: xs/sm → 'sm', md/lg → 'md', xl/2xl → 'lg'
  const spinnerSize = resolvedSize === 'xs' || resolvedSize === 'sm' ? 'sm'
    : resolvedSize === 'xl' || resolvedSize === '2xl' ? 'lg' : 'md'
  const spinnerState = state === 'loading' ? 'spinning' : state

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key="spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className={className}
      >
        <Spinner size={spinnerSize} state={spinnerState} variant="bare" />
      </motion.span>
    </AnimatePresence>
  )
}

// idle state — render the Tabler icon (with optional preset animation)
return (
  <AnimatePresence mode="wait">
    <motion.span
      key="icon"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="inline-flex"
    >
      {/* Tabler icon rendering */}
    </motion.span>
  </AnimatePresence>
)
```

**CRITICAL Spinner fix:** The Spinner arc stroke hardcodes `var(--color-accent-9)` for the spinning state (spinner.tsx line 74: `stateColors.spinning`). In `bare` variant, the arc should use `currentColor` so it inherits the parent's text color. The exact change:

In `spinner.tsx`, change how `color` is derived (around line 108):
```tsx
// Before:
const color = stateColors[state]

// After:
const color = variant === 'bare' && state === 'spinning' ? 'currentColor' : stateColors[state]
```

This makes the spinning arc inherit text color in bare mode (used by Icon's state machine inside colored Buttons), while keeping the filled variant's semantic colors (green for success, red for error) intact.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Icon animations — spin/pulse/bounce presets + loading→success/error state machine`

---

### Task 4: Create IconGroup

**Files:**
- Create: `packages/core/src/ui/icon-group.tsx`

```tsx
import * as React from 'react'
import { cn } from './lib/utils'
import { IconProvider, type IconSize, type IconStroke } from './icon-context'

const gapClasses = {
  tight: 'gap-0.5',    // 2px
  default: 'gap-1',    // 4px
  loose: 'gap-2',      // 8px
} as const

export interface IconGroupProps {
  size?: IconSize
  stroke?: IconStroke
  gap?: 'tight' | 'default' | 'loose'
  /** Accessible label — required when using role="toolbar" */
  label?: string
  /** Set to "toolbar" for formatting toolbars (adds role + aria-label). Default: no role. */
  role?: 'toolbar'
  className?: string
  children: React.ReactNode
}

export function IconGroup({
  size,
  stroke,
  gap = 'default',
  label,
  role: ariaRole,
  className,
  children,
}: IconGroupProps) {
  return (
    <IconProvider size={size} stroke={stroke}>
      <div
        role={ariaRole}
        aria-label={ariaRole ? label : undefined}
        className={cn('inline-flex items-center', gapClasses[gap], className)}
      >
        {children}
      </div>
    </IconProvider>
  )
}

IconGroup.displayName = 'IconGroup'
```

Export from barrel.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): add IconGroup — flex row + IconContext for toolbars`

---

### Task 5: Button integration (breaking change)

**Files:**
- Modify: `packages/core/src/ui/button.tsx`

**What changes in Button:**

1. **Remove** `iconSizeClass` map — Icon handles its own sizing via context
2. **Keep** `spinnerSizeMap` — Button's loading state still renders `<Spinner>` directly (not via `<Icon>`), so it needs the size mapping. Rename to `BUTTON_TO_SPINNER_SIZE` for clarity.
3. **Keep** `iconInsetClass` — padding compensation stays in Button
4. **Keep** `pillPaddingClass` — Button layout concern

5. **Add IconContext.Provider** wrapping the button's children:

```typescript
// Map Button size to Icon size tier
const BUTTON_TO_ICON_SIZE: Record<string, IconSize> = {
  xs: 'xs', sm: 'sm', md: 'md', lg: 'lg',
  'compact-xs': 'xs', 'compact-sm': 'sm', 'compact-md': 'md',
  icon: 'md', 'icon-xs': 'xs', 'icon-sm': 'sm', 'icon-md': 'md', 'icon-lg': 'lg',
}
```

6. **Simplify startIcon/endIcon rendering** — no longer need iconClass wrapper sizing:

```tsx
const renderStartSlot = () => {
  if (loading && loadingPosition === 'start') {
    return (
      <span className={cn('inline-flex shrink-0 items-center justify-center', startIcon && inset.start)}>
        <Spinner size={spinnerSize} variant="bare" />
      </span>
    )
  }
  if (startIcon) {
    return (
      <span className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', inset.start, dimIcon && 'opacity-90')}>
        {startIcon}
      </span>
    )
  }
  return null
}
```

The `startIcon` is now an `<Icon>` component that sizes itself via context. Button just wraps it in a span for inset margin and opacity.

7. **Wrap render in IconProvider:**

```tsx
<IconContext.Provider value={{ size: BUTTON_TO_ICON_SIZE[resolvedSize] }}>
  <button ...>
    {grainElements}
    {renderStartSlot()}
    {renderChildren()}
    {renderEndSlot()}
  </button>
</IconContext.Provider>
```

8. **Update ButtonProps** — change `startIcon`/`endIcon` type from `React.ReactNode` to `React.ReactElement | null` (accepts `<Icon>` elements and conditional `null`). This preserves the `startIcon={condition ? <Icon ... /> : null}` pattern. Keep the prop names the same.

9. **Update async feedback icon** — use `<Icon>` for the check/X:

```tsx
import { Icon } from './icon'
import { IconCheck, IconX } from '@tabler/icons-react'

const asyncFeedbackIcon = isAsyncFeedback ? (
  <span className={cn('inline-flex shrink-0 items-center justify-center pointer-events-none', startIcon && inset.start)}>
    <AnimatePresence mode="wait">
      <motion.span key={asyncState} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={springs.bouncy} className="inline-flex items-center justify-center h-full w-full">
        <Icon icon={asyncState === 'success' ? IconCheck : IconX} />
      </motion.span>
    </AnimatePresence>
  </span>
) : null
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core)!: Button uses IconContext — startIcon/endIcon accept <Icon>`

---

### Task 5b: Update IconButton for Icon system

**Files:**
- Modify: `packages/core/src/ui/icon-button.tsx`

**What changes:**

1. **Update `icon` prop type** — change from `React.ReactNode` to `React.ReactElement` (must be `<Icon>`).

2. **Add `IconProvider` wrapper** — IconButton already maps `sm/md/lg` to `icon-sm/icon-md/icon-lg` Button sizes. The Button's `IconContext.Provider` will provide context from those icon-* sizes. Verify that `BUTTON_TO_ICON_SIZE['icon-sm']` maps to `'sm'`, etc. If so, no additional context wrapper is needed in IconButton — the Button wrapper handles it.

3. **Update JSDoc** — document that `icon` must be `<Icon icon={...} />`, not a raw Tabler icon.

4. **Verify** existing IconButton behavior is preserved — shape (square/circle), loading state, variant/color passthrough.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): IconButton accepts <Icon> component`

---

## Phase 3: Testing + Stories

### Task 6: Write tests

**Files:**
- Create: `packages/core/src/ui/__tests__/icon.test.tsx`

Test cases:
- Icon renders Tabler icon at default size (18px)
- Icon renders at each size tier (xs=14, sm=16, md=18, lg=20, xl=24, 2xl=32)
- Icon applies stroke weight (light=1.5 at md, regular=2 at md, bold=2.5 at md)
- Icon reads size from IconContext when no explicit prop
- Explicit size prop overrides IconContext
- Icon renders aria-hidden by default
- Icon with label renders aria-label and role="img"
- Icon with animate="spin" wraps in motion element
- Icon with animate="none" does not animate
- Icon with state="loading" renders Spinner
- Icon with state="success" renders Spinner in success state
- IconGroup renders children in flex container
- IconGroup provides context to child Icons

**IMPORTANT:** The existing `button.test.tsx` tests pass raw SVG elements and Tabler icons to `startIcon`/`endIcon`. These will fail TypeScript after the type change to `React.ReactElement | null`. Update all existing startIcon/endIcon test usages to wrap in `<Icon>`:

Before: `render(<Button startIcon={<svg>...</svg>}>Test</Button>)`
After: `render(<Button startIcon={<Icon icon={IconPlus} />}>Test</Button>)`

Run full test suite: `pnpm --filter @devalok/shilp-sutra test -- --run`

**Commit:** `test(core): Icon component + update Button tests for <Icon> wrapper`

---

### Task 7: Write stories

**Files:**
- Create: `packages/core/src/ui/icon.stories.tsx`

Stories to create (~10):
1. **SizeScale** — IconPlus at xs through 2xl side by side
2. **StrokeWeights** — IconPlus at light/regular/bold per size tier (grid)
3. **InButton** — Icons auto-sized inside Button at xs/sm/md/lg
4. **InContext** — Icon in Badge, EmptyState, standalone, nav
5. **IconGroupToolbar** — Formatting toolbar with tight/default/loose gaps
6. **AnimatePresets** — Spin, pulse, bounce, controlled rotate
7. **StateMachine** — Interactive: click to cycle idle → loading → success → idle
8. **Accessibility** — With/without labels, screen reader info
9. **WithGrain** — Icons inside DevalokGrain buttons
10. **MigrationGuide** — Before (`startIcon={<IconPlus />}`) vs After (`startIcon={<Icon icon={IconPlus} />}`)

**Commit:** `feat(core): Icon stories — sizes, strokes, animations, state machine, migration`

---

## Phase 4: Migration + Docs

### Task 8: Migrate core composed components + karm to `<Icon>`

**Files (core composed — use grep to find all startIcon/endIcon usages):**
- `packages/core/src/ui/button.stories.tsx`
- `packages/core/src/composed/bulk-action-bar.tsx`
- `packages/core/src/composed/file-preview.tsx`
- `packages/core/src/shell/master-detail.tsx`
- Any other file in `packages/core/src/` with `startIcon={<Icon` or `endIcon={<Icon` patterns

**Files (karm):**
- All files in `packages/karm/src/` that pass Tabler icons to Button `startIcon`/`endIcon`

Pattern: Find all `startIcon={<TablerIcon ...` and `endIcon={<TablerIcon ...` and wrap:

Before: `startIcon={<IconPlus />}`
After: `startIcon={<Icon icon={IconPlus} />}`

Before: `startIcon={<IconPlus stroke={1.5} />}`
After: `startIcon={<Icon icon={IconPlus} stroke="light" />}`

**Verify:**
- `pnpm --filter @devalok/shilp-sutra typecheck`
- `pnpm --filter @devalok/shilp-sutra-karm typecheck`
- `pnpm --filter @devalok/shilp-sutra-karm test -- --run`

**Commit:** `refactor(karm): migrate all Button icons to <Icon> component`

---

### Task 9: Update docs

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`

CHANGELOG:
- Breaking: Button `startIcon`/`endIcon` now require `<Icon>` wrapper
- Added: `<Icon>` component with size tiers, stroke weights, animations
- Added: `IconContext`, `IconProvider`, `IconGroup`
- Added: Icon state machine (loading → success/error)

llms.txt: Update Button section, add Icon section.
llms-full.txt: Full Icon API reference.

**Commit:** `docs(core): CHANGELOG + llms.txt — Icon system, Button breaking change`

---

## Total: 9 tasks across 4 phases.
