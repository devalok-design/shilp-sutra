# Framer Motion Full Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the entire CSS-based animation system with Framer Motion springs and primitives across all shilp-sutra packages.

**Architecture:** A motion primitives layer (`motion-presets.ts`, `MotionProvider`, `motion-primitives.tsx`) replaces Tailwind keyframes, CSS transitions, and data-state animations. Components consume primitives or `motion.*` elements directly. Springs for spatial motion, tweens for non-spatial. Single `MotionProvider` handles reduced motion globally.

**Tech Stack:** framer-motion 12.36, React 18, TypeScript 5.7, Vite 5.4, Vitest + RTL

**Design doc:** `docs/plans/2026-03-13-framer-motion-full-migration-design.md`

---

## Task 1: Motion Presets

**Files:**
- Replace: `packages/core/src/ui/lib/motion.ts`

**Step 1: Write the new motion presets**

Replace the entire file with Framer Motion transition objects:

```ts
'use client'

import type { Transition } from 'framer-motion'

// ── Spring configs (spatial: position, scale, size, rotation) ──

export const springs = {
  /** Micro-interactions: buttons, hover, form inputs */
  snappy: { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 } as Transition,
  /** Dialogs, sheets, panels, navigation */
  smooth: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as Transition,
  /** Toasts, pop-ins, celebration feedback */
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.5 } as Transition,
  /** Collapse/expand, accordion, height changes */
  gentle: { type: 'spring', stiffness: 200, damping: 25, mass: 0.8 } as Transition,
} as const

// ── Tween configs (non-spatial: opacity, color, background) ──

export const tweens = {
  /** Opacity enter/exit */
  fade: { type: 'tween', duration: 0.15, ease: 'easeOut' } as Transition,
  /** Hover color, bg, border transitions */
  colorShift: { type: 'tween', duration: 0.1, ease: 'easeOut' } as Transition,
} as const

// ── Stagger helper ──

export function stagger(delay = 0.04) {
  return {
    visible: { transition: { staggerChildren: delay } },
    hidden: { transition: { staggerChildren: delay } },
  }
}

// ── Reduced motion helper ──

export function withReducedMotion(transition: Transition): Transition {
  return { ...transition, duration: 0 }
}

// ── Preset types ──

export type SpringPreset = keyof typeof springs
export type TweenPreset = keyof typeof tweens
```

**Step 2: Run typecheck**

Run: `cd packages/core && npx tsc --noEmit`
Expected: PASS (no consumers of old API yet — we'll migrate them in later tasks)

**Step 3: Commit**

```bash
git add packages/core/src/ui/lib/motion.ts
git commit -m "refactor(motion): replace CSS duration/easing tokens with FM spring/tween presets"
```

---

## Task 2: MotionProvider

**Files:**
- Create: `packages/core/src/motion/motion-provider.tsx`
- Create: `packages/core/src/motion/index.ts`

**Step 1: Create the MotionProvider**

```tsx
'use client'

import * as React from 'react'
import { MotionConfig, useReducedMotion as useFMReducedMotion } from 'framer-motion'
import { springs, tweens } from '../ui/lib/motion'

type ReducedMotionMode = 'user' | boolean

type MotionContextValue = {
  springs: typeof springs
  tweens: typeof tweens
  reducedMotion: boolean
}

const MotionContext = React.createContext<MotionContextValue>({
  springs,
  tweens,
  reducedMotion: false,
})

type MotionProviderProps = {
  children: React.ReactNode
  /** 'user' = detect OS preference, true = force off, false = force on */
  reducedMotion?: ReducedMotionMode
}

function MotionProvider({ children, reducedMotion = 'user' }: MotionProviderProps) {
  const osPreference = useFMReducedMotion() ?? false
  const isReduced = reducedMotion === 'user' ? osPreference : reducedMotion

  const value = React.useMemo<MotionContextValue>(
    () => ({ springs, tweens, reducedMotion: isReduced }),
    [isReduced],
  )

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion === 'user' ? 'user' : reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  )
}

function useMotion() {
  return React.useContext(MotionContext)
}

export { MotionProvider, useMotion, type MotionProviderProps }
```

**Step 2: Create barrel export**

`packages/core/src/motion/index.ts`:
```ts
export { MotionProvider, useMotion, type MotionProviderProps } from './motion-provider'
export { springs, tweens, stagger, type SpringPreset, type TweenPreset } from '../ui/lib/motion'
```

**Step 3: Run typecheck**

Run: `cd packages/core && npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/core/src/motion/
git commit -m "feat(motion): add MotionProvider with global reduced-motion control"
```

---

## Task 3: Motion Primitives

**Files:**
- Create: `packages/core/src/motion/primitives.tsx`
- Create: `packages/core/src/motion/primitives-index.ts`

**Step 1: Write all motion primitives**

Create `packages/core/src/motion/primitives.tsx` with: `MotionFade`, `MotionScale`, `MotionPop`, `MotionSlide`, `MotionCollapse`, `MotionStagger`, `MotionStaggerItem`.

Each primitive:
- Uses `AnimatePresence` internally
- Accepts `show` prop for mount/unmount
- Accepts optional `preset` override
- Accepts `className`, `as`, `layout`, `layoutId`, `whileInView`, `viewportOnce`, `viewportMargin`
- Forwards refs
- Uses spring + fade tween combo (spatial + opacity)

Key implementation notes:
- `MotionCollapse` uses `motion.div` with `animate={{ height: 'auto' }}` / `exit={{ height: 0 }}` — Framer Motion handles height:auto natively
- `MotionStagger` uses variant orchestration with `staggerChildren`
- All exit animations are real unmount animations via `AnimatePresence`

**Step 2: Create barrel**

`packages/core/src/motion/primitives-index.ts`:
```ts
export {
  MotionFade,
  MotionScale,
  MotionPop,
  MotionSlide,
  MotionCollapse,
  MotionStagger,
  MotionStaggerItem,
} from './primitives'
```

**Step 3: Run typecheck**

Run: `cd packages/core && npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/core/src/motion/primitives.tsx packages/core/src/motion/primitives-index.ts
git commit -m "feat(motion): add 7 motion primitives with AnimatePresence"
```

---

## Task 4: Wire Exports in package.json

**Files:**
- Modify: `packages/core/package.json` (exports map)
- Modify: `packages/core/vite.config.ts` (entry points)

**Step 1: Add entry points to Vite config**

Add `motion` and `motion/primitives` entries to `collectEntries()` or the manual entries in vite.config.ts.

**Step 2: Add export paths to package.json**

```json
"./motion": {
  "import": "./dist/motion/index.js",
  "types": "./dist/motion/index.d.ts"
},
"./motion/primitives": {
  "import": "./dist/motion/primitives-index.js",
  "types": "./dist/motion/primitives-index.d.ts"
}
```

**Step 3: Build and verify**

Run: `cd packages/core && pnpm build`
Expected: PASS, dist/motion/ contains the files

**Step 4: Commit**

```bash
git add packages/core/package.json packages/core/vite.config.ts
git commit -m "feat(motion): wire motion exports in package.json and vite config"
```

---

## Task 5: Motion Primitives Tests

**Files:**
- Create: `packages/core/src/motion/__tests__/motion-primitives.test.tsx`
- Create: `packages/core/src/motion/__tests__/motion-provider.test.tsx`

**Step 1: Write tests for MotionProvider**

Test:
- Renders children
- `useMotion()` returns springs/tweens/reducedMotion
- `reducedMotion={true}` forces reduced motion
- `reducedMotion="user"` default

**Step 2: Write tests for each motion primitive**

For each primitive (MotionFade, MotionScale, MotionPop, MotionSlide, MotionCollapse, MotionStagger/Item):
- Renders children when `show={true}`
- Does not render children when `show={false}`
- Accepts className
- Forwards ref
- Accepts `as` prop for polymorphic rendering

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- src/motion/`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add packages/core/src/motion/__tests__/
git commit -m "test(motion): add tests for MotionProvider and all motion primitives"
```

---

## Task 6: Migrate Dialog & AlertDialog

**Files:**
- Modify: `packages/core/src/ui/dialog.tsx` (lines 71, 83-90)
- Modify: `packages/core/src/ui/alert-dialog.tsx` (lines 21, 33-38)

**Step 1: Migrate Dialog**

- Import `AnimatePresence`, `motion` from framer-motion, and presets
- `DialogOverlay`: Replace `data-[state=*]:animate-*` classes with `motion.div` + `MotionFade`-style animation (opacity 0→1→0)
- `DialogContent`: Replace zoom+slide classes with `motion.div` using `smooth` spring for scale (0.95→1) + `fade` tween for opacity
- Use Radix `forceMount` on Portal/Overlay/Content to let AnimatePresence control lifecycle
- Wire open/closed state from Radix context to AnimatePresence

**Step 2: Migrate AlertDialog**

Same pattern as Dialog — identical animation treatment.

**Step 3: Run existing tests**

Run: `cd packages/core && pnpm test -- dialog`
Expected: PASS (tests should still work since behavior is identical)

**Step 4: Commit**

```bash
git add packages/core/src/ui/dialog.tsx packages/core/src/ui/alert-dialog.tsx
git commit -m "refactor(dialog): migrate to Framer Motion AnimatePresence"
```

---

## Task 7: Migrate Sheet

**Files:**
- Modify: `packages/core/src/ui/sheet.tsx` (lines 70, 80-90, sheetVariants)

**Step 1: Migrate Sheet**

- `SheetOverlay`: `motion.div` with fade tween
- `SheetContent`: `motion.div` with `smooth` spring, direction-aware slide (use side prop to determine initial x/y offset)
  - top: `initial={{ y: '-100%' }}`
  - bottom: `initial={{ y: '100%' }}`
  - left: `initial={{ x: '-100%' }}`
  - right: `initial={{ x: '100%' }}`
- Use `forceMount` + `AnimatePresence`

**Step 2: Run tests**

Run: `cd packages/core && pnpm test -- sheet`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/core/src/ui/sheet.tsx
git commit -m "refactor(sheet): migrate to Framer Motion with spring slide"
```

---

## Task 8: Migrate Popover-Family Components

**Files:**
- Modify: `packages/core/src/ui/popover.tsx` (line 24)
- Modify: `packages/core/src/ui/dropdown-menu.tsx` (lines 110, 129)
- Modify: `packages/core/src/ui/context-menu.tsx` (lines 49, 65)
- Modify: `packages/core/src/ui/select.tsx` (line 123)
- Modify: `packages/core/src/ui/hover-card.tsx` (line 22)
- Modify: `packages/core/src/ui/combobox.tsx` (line 363)
- Modify: `packages/core/src/ui/menubar.tsx` (lines 78, 102)

**Step 1: Create shared popover animation pattern**

All these components share the same animation: scale from 0.95→1 + fade in, with side-aware transform origin.

Create a shared utility or inline the pattern:
- `motion.div` with `snappy` spring for scale
- `fade` tween for opacity
- Transform origin based on `data-side` attribute (or computed from placement)
- `forceMount` + `AnimatePresence`

**Step 2: Apply to all 8 components**

Each component gets the same treatment — remove all `data-[state=*]:animate-*` and `data-[side=*]:slide-*` classes, replace with motion.div.

**Step 3: Run tests**

Run: `cd packages/core && pnpm test`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add packages/core/src/ui/popover.tsx packages/core/src/ui/dropdown-menu.tsx packages/core/src/ui/context-menu.tsx packages/core/src/ui/select.tsx packages/core/src/ui/hover-card.tsx packages/core/src/ui/combobox.tsx packages/core/src/ui/menubar.tsx
git commit -m "refactor(overlays): migrate popover-family to Framer Motion scale spring"
```

---

## Task 9: Migrate Tooltip & NavigationMenu

**Files:**
- Modify: `packages/core/src/ui/tooltip.tsx` (line 23)
- Modify: `packages/core/src/ui/navigation-menu.tsx` (lines 72, 89, 107)

**Step 1: Migrate Tooltip**

- `motion.div` with `snappy` spring (fast, responsive)
- Scale 0.95→1 + fade, side-aware origin
- `forceMount` + `AnimatePresence`

**Step 2: Migrate NavigationMenu**

Three animated elements:
- `NavigationMenuContent` (line 72): Uses `data-[motion^=from-/to-]` — replace with `AnimatePresence` + `MotionSlide` direction based on motion direction
- `NavigationMenuViewport` (line 89): `motion.div` with `smooth` spring, scale + `layout` for width/height changes
- `NavigationMenuIndicator` (line 107): `motion.div` with fade + `layout` for position sliding

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- tooltip navigation`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/core/src/ui/tooltip.tsx packages/core/src/ui/navigation-menu.tsx
git commit -m "refactor(tooltip,nav-menu): migrate to Framer Motion"
```

---

## Task 10: Migrate Accordion & Collapsible

**Files:**
- Modify: `packages/core/src/ui/accordion.tsx` (lines 76, 82, 94)
- Modify: `packages/core/src/ui/collapsible.tsx` (line 19)

**Step 1: Migrate Accordion**

- `AccordionContent` (line 94): Replace `animate-accordion-down/up` with `motion.div` using `gentle` spring + height 0→auto animation
  - Framer Motion handles `height: "auto"` natively
  - `AnimatePresence` for exit
  - `forceMount` on Radix AccordionContent
- `AccordionTrigger` chevron (line 82): Replace `transition-transform duration-moderate-02` with `motion.svg` using `snappy` spring for rotation

**Step 2: Migrate Collapsible**

- `CollapsibleContent` (line 19): Same as Accordion — `gentle` spring + height auto + `AnimatePresence`

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- accordion collapsible`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/core/src/ui/accordion.tsx packages/core/src/ui/collapsible.tsx
git commit -m "refactor(accordion,collapsible): migrate to Framer Motion height:auto spring"
```

---

## Task 11: Migrate Button, Card, Toggle

**Files:**
- Modify: `packages/core/src/ui/button.tsx` (line 11)
- Modify: `packages/core/src/ui/card.tsx` (line 84)
- Modify: `packages/core/src/ui/toggle.tsx` (line 10)

**Step 1: Migrate Button**

- Replace `transition-[color,background-color,border-color,box-shadow,transform]` + `active:translate-y-px` with:
- Render as `motion.button` (or wrap the Slot pattern with motion)
- `whileTap={{ scale: 0.97 }}` with `snappy` spring
- `colorShift` tween for hover color transitions (via `whileHover` or keep CSS for colors)

**Step 2: Migrate Card**

- Interactive card (line 84): Replace `hover:shadow-02 hover:-translate-y-px transition-all` with:
- `motion.div` with `whileHover={{ y: -2 }}` using `snappy` spring
- Shadow change via `whileHover` style or keep CSS shadow transition

**Step 3: Migrate Toggle**

- Replace `transition-[color,transform] active:scale-95` with:
- `motion.button` with `whileTap={{ scale: 0.95 }}` using `snappy` spring

**Step 4: Run tests**

Run: `cd packages/core && pnpm test -- button card toggle`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/button.tsx packages/core/src/ui/card.tsx packages/core/src/ui/toggle.tsx
git commit -m "refactor(button,card,toggle): migrate to motion.* with spring interactions"
```

---

## Task 12: Migrate Checkbox, Switch, Tabs

**Files:**
- Modify: `packages/core/src/ui/checkbox.tsx` (lines 54, 64)
- Modify: `packages/core/src/ui/switch.tsx` (lines 18, 27)
- Modify: `packages/core/src/ui/tabs.tsx` (lines 68, 75)

**Step 1: Migrate Checkbox**

- Check indicator (line 64): Replace `animate-check-pop` with `motion.svg` using `bouncy` spring for scale + `motion.path` with `pathLength` 0→1 for the checkmark draw
- Root (line 54): Replace `transition-colors` with `motion.button` + `colorShift` tween

**Step 2: Migrate Switch**

- Thumb (line 27): Replace `transition-transform duration-moderate-01 ease-bounce` with `motion.span` using `layout` prop — Framer Motion `layout` spring will animate the thumb position when data-state changes
- Root (line 18): Replace `transition-colors` with `colorShift` tween

**Step 3: Migrate Tabs**

- Tab trigger (line 68): Replace `transition-[color,background-color,border-color,box-shadow]` with `motion.button` + `colorShift` tween
- Tab indicator (line 75): Replace `animate-tab-indicator` with `layoutId="tab-indicator"` — the indicator slides smoothly between tabs via shared layout animation

**Step 4: Run tests**

Run: `cd packages/core && pnpm test -- checkbox switch tabs`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/checkbox.tsx packages/core/src/ui/switch.tsx packages/core/src/ui/tabs.tsx
git commit -m "refactor(checkbox,switch,tabs): migrate to FM layout + pathLength + springs"
```

---

## Task 13: Migrate Form Inputs

**Files:**
- Modify: `packages/core/src/ui/input.tsx` (line 17)
- Modify: `packages/core/src/ui/textarea.tsx` (line 16)

**Step 1: Migrate Input**

- Replace `transition-colors duration-fast-01` with `motion.input` + `colorShift` tween on focus/hover

**Step 2: Migrate Textarea**

- Same as Input: `motion.textarea` + `colorShift` tween

**Step 3: Run tests**

Run: `cd packages/core && pnpm test -- input textarea`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/core/src/ui/input.tsx packages/core/src/ui/textarea.tsx
git commit -m "refactor(input,textarea): migrate to motion.* with colorShift tween"
```

---

## Task 14: Migrate Karm Stagger Patterns

**Files:**
- Modify: `packages/karm/src/board/bulk-action-bar.tsx` (lines 89-186)
- Modify: `packages/karm/src/board/board-column.tsx` (line 97)
- Modify: `packages/karm/src/board/kanban-board.tsx` (line 271)
- Modify: `packages/karm/src/board/board-toolbar.tsx` (line 362)
- Modify: `packages/karm/src/board/task-context-menu.tsx` (line 72)

**Step 1: Migrate BulkActionBar**

Replace 5 elements with `animate-fade-in delay-stagger` + `--stagger-index` with:
- Wrap in `<MotionStagger>` parent
- Each button becomes `<MotionStaggerItem>`
- Remove `--stagger-index` inline styles

**Step 2: Migrate BoardColumn**

Replace `animate-slide-up delay-stagger` with:
- `<MotionStagger>` wrapping task cards
- Each task card wrapper: `<MotionStaggerItem>`

**Step 3: Migrate KanbanBoard**

Replace `animate-slide-right delay-stagger-50` with:
- `<MotionStagger delay={0.05}>` wrapping columns
- Each column: `<MotionStaggerItem>`

**Step 4: Migrate BoardToolbar**

Replace `animate-scale-in delay-stagger` with:
- `<MotionStagger>` wrapping filter chips
- Each chip: `<MotionStaggerItem>`

**Step 5: Migrate TaskContextMenu**

Replace `animate-scale-in` with `<MotionScale>`.

**Step 6: Run tests**

Run: `cd packages/karm && pnpm test`
Expected: PASS

**Step 7: Commit**

```bash
git add packages/karm/src/board/
git commit -m "refactor(karm/board): migrate stagger patterns to MotionStagger"
```

---

## Task 15: Migrate Karm Transition Classes

**Files:**
- Modify: `packages/karm/src/dashboard/attendance-cta.tsx` (line 192)
- Modify: `packages/karm/src/dashboard/daily-brief.tsx` (lines 115-150)
- Modify: `packages/karm/src/dashboard/scratchpad-widget.tsx` (lines 68-248)
- Modify: `packages/karm/src/dashboard/sidebar-scratchpad.tsx` (lines 39-77)
- Modify: `packages/karm/src/board/column-header.tsx` (lines 272-463)
- Modify: `packages/karm/src/board/task-card.tsx` (lines 58-430)
- Modify: `packages/karm/src/client/project-card.tsx` (line 42)

**Step 1: Migrate interactive cards/CTAs**

- `attendance-cta.tsx`: Replace `transition-all` hover effects with `motion.div` + `whileHover={{ y: -2 }}` + `whileTap={{ scale: 0.98 }}` using `snappy` spring
- `project-card.tsx`: Same pattern — `motion.div` with `whileHover`
- `task-card.tsx`: Replace `transition-all duration-fast-02` with `motion.div`

**Step 2: Migrate collapse/expand patterns**

- `daily-brief.tsx`, `sidebar-scratchpad.tsx`: Replace `transition-[grid-template-rows]` with `<MotionCollapse>`
- `column-header.tsx` (line 352): Replace grid-template-rows transition with `<MotionCollapse>`

**Step 3: Migrate hover color transitions**

- All `transition-colors` on buttons, links, list items across chat/tasks/admin: Replace with `motion.*` elements + `colorShift` tween

**Step 4: Run tests**

Run: `cd packages/karm && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/karm/src/
git commit -m "refactor(karm): migrate all CSS transitions to Framer Motion"
```

---

## Task 16: Chart Entrance Animations

**Files:**
- Modify: `packages/core/src/ui/charts/line-chart.tsx`
- Modify: `packages/core/src/ui/charts/area-chart.tsx`
- Modify: `packages/core/src/ui/charts/bar-chart.tsx`
- Modify: `packages/core/src/ui/charts/gauge-chart.tsx`
- Modify: `packages/core/src/ui/charts/pie-chart.tsx`
- Modify: `packages/core/src/ui/charts/radar-chart.tsx`
- Modify: `packages/core/src/ui/charts/sparkline.tsx`
- Modify: `packages/core/src/ui/charts/_internal/animation.ts`

**Step 1: Update animation utility**

Replace `_internal/animation.ts` to use `useMotion()` from MotionProvider instead of its own `useReducedMotion()`.

**Step 2: Wrap chart containers**

Each chart component: wrap the SVG container in `<MotionFade>` + `<MotionScale>` for entrance animation when `animate={true}`.

- Remove the unused `void _duration` patterns
- Keep D3-based data transitions (only GaugeChart has one — keep it)

**Step 3: Sparkline path animation**

Replace static sparkline SVG paths with `motion.path` + `pathLength` animation for a draw-in effect.

**Step 4: Run tests**

Run: `cd packages/core && pnpm test -- charts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/ui/charts/
git commit -m "refactor(charts): add FM entrance animations, sparkline pathLength draw"
```

---

## Task 17: Remove Old Transitions Component

**Files:**
- Delete: `packages/core/src/ui/transitions.tsx`
- Modify: `packages/core/src/ui/index.ts` (remove transitions export)
- Modify: any files importing from transitions.tsx

**Step 1: Find all imports of transitions.tsx**

Search for `from './transitions'` or `from '../transitions'` or `'./ui/transitions'` across the codebase.

**Step 2: Replace imports**

Each consumer switches to the equivalent motion primitive:
- `Fade` → `MotionFade`
- `Collapse` → `MotionCollapse`
- `Grow` → `MotionScale`
- `Slide` → `MotionSlide`

**Step 3: Delete transitions.tsx and update barrel**

**Step 4: Run tests**

Run: `cd packages/core && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old CSS transitions.tsx, replaced by motion primitives"
```

---

## Task 18: Remove Old useReducedMotion Hook

**Files:**
- Delete: `packages/core/src/ui/lib/use-reduced-motion.ts`
- Modify: any files importing it

**Step 1: Find all imports**

Search for `use-reduced-motion` across the codebase.

**Step 2: Replace with useMotion() or FM's built-in**

Each consumer switches to `useMotion().reducedMotion` from MotionProvider.

**Step 3: Delete the file**

**Step 4: Run tests**

Run: `cd packages/core && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old useReducedMotion hook, replaced by MotionProvider"
```

---

## Task 19: Tailwind Preset Cleanup

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts` (lines 268-540)

**Step 1: Remove replaced keyframes**

Remove all keyframes from lines 268-440 EXCEPT:
- `caret-blink` (line 291-294)
- `skeleton-shimmer` (line 287-290)
- `progress-indeterminate` (line 283-286)

Remove corresponding animation utilities from lines 441-483 EXCEPT the 3 kept keyframes.

**Step 2: Remove stagger plugin**

Remove `delay-stagger` and `delay-stagger-50` utilities (lines 529-538).

**Step 3: Keep animate-pulse and animate-spin**

These are Tailwind defaults, keep them.

**Step 4: Run full test suite**

Run: `pnpm test`
Expected: ALL PASS (no component should reference removed keyframes anymore)

**Step 5: Run build**

Run: `pnpm build`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/core/src/tailwind/preset.ts
git commit -m "refactor(tailwind): remove 40+ keyframes replaced by Framer Motion"
```

---

## Task 20: Storybook Stories for Motion Primitives

**Files:**
- Create: `packages/core/src/motion/motion-primitives.stories.tsx`

**Step 1: Write stories**

Cover all 7 primitives with interactive stories:
- MotionFade: toggle show/hide
- MotionScale: toggle show/hide
- MotionPop: toggle show/hide with bouncy overshoot visible
- MotionSlide: toggle with direction control (up/down/left/right)
- MotionCollapse: toggle expand/collapse with real content
- MotionStagger + MotionStaggerItem: list of items appearing with stagger
- Layout animation demo: tabs with `layoutId` indicator
- whileInView demo: cards animating on scroll

**Step 2: Verify stories render in Storybook**

Run: `cd packages/core && pnpm storybook` (manual verification)

**Step 3: Commit**

```bash
git add packages/core/src/motion/motion-primitives.stories.tsx
git commit -m "docs(motion): add Storybook stories for all motion primitives"
```

---

## Task 21: Update Documentation

**Files:**
- Modify: `packages/core/src/ui/motion.mdx` (rewrite for FM system)
- Modify: `packages/core/llms.txt` (update motion section)
- Modify: `packages/core/llms-full.txt` (update motion section)

**Step 1: Rewrite motion.mdx**

Replace the CSS-token-based docs with:
- Spring presets reference table
- Tween presets reference table
- MotionProvider setup guide
- Motion primitives API reference
- Decision tree: which preset for which component type
- Layout animation guide
- whileInView guide
- Reduced motion behavior

**Step 2: Update llms.txt and llms-full.txt**

Add motion system section with:
- Import paths
- Available presets
- Primitive components
- MotionProvider setup

**Step 3: Commit**

```bash
git add packages/core/src/ui/motion.mdx packages/core/llms.txt packages/core/llms-full.txt
git commit -m "docs(motion): rewrite all motion documentation for Framer Motion system"
```

---

## Task 22: Final Verification

**Step 1: Full typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 2: Full test suite**

Run: `pnpm test`
Expected: ALL PASS

**Step 3: Full build**

Run: `pnpm build`
Expected: PASS

**Step 4: Verify no leftover CSS animation references**

Search for: `animate-in`, `animate-out`, `data-[state=open]:animate`, `data-[state=closed]:animate`, `delay-stagger`, `animate-fade-in`, `animate-slide-up`, `animate-scale-in`, `animate-check-pop`, `animate-tab-indicator`, `animate-accordion`, `animate-collapsible`

Expected: Zero matches in component source files (only in stories/docs if at all)

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification — all clean"
```

---

## Execution Notes

- **Task order matters**: Tasks 1-4 build the foundation, Tasks 5 tests it, Tasks 6-16 migrate components, Tasks 17-19 clean up old system, Tasks 20-21 document, Task 22 verifies
- **Parallel opportunities**: Tasks 6+7 can run in parallel. Tasks 8+9 can run in parallel. Tasks 11+12+13 can run in parallel. Tasks 14+15 can run in parallel.
- **Spinner v2**: Already done — ships with this work. No changes needed.
- **Toast**: Uses sonner library — investigate whether we control its animations or sonner does. If sonner controls it, leave as-is.
