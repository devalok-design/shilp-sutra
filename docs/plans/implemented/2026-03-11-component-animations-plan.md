# Component Animation System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 19 new animation keyframes and apply cohesive micro-interactions + entrance animations across 21 core components.

**Architecture:** All keyframes and utilities live in `packages/core/src/tailwind/preset.ts`. Micro-interactions are always-on CSS (hover/active/state transitions). Entrance animations are opt-in via `animate-*` classes. Dismiss animations use internal state to delay unmount. `prefers-reduced-motion` is already handled globally.

**Tech Stack:** Tailwind 3.4, CVA, React 18, TypeScript 5.7

---

### Task 1: Add 19 new keyframes and animation utilities to preset.ts

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts`

**Step 1: Add keyframes**

Add these 19 keyframes to the existing `keyframes` object (after the `lift` keyframe):

```typescript
'slide-down': {
  '0%': { opacity: '0', transform: 'translateY(-8px)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
},
'slide-left': {
  '0%': { opacity: '0', transform: 'translateX(20px)' },
  '100%': { opacity: '1', transform: 'translateX(0)' },
},
'slide-out-up': {
  '0%': { opacity: '1', transform: 'translateY(0)' },
  '100%': { opacity: '0', transform: 'translateY(-8px)' },
},
'slide-out-down': {
  '0%': { opacity: '1', transform: 'translateY(0)' },
  '100%': { opacity: '0', transform: 'translateY(8px)' },
},
'check-pop': {
  '0%': { transform: 'scale(0)' },
  '60%': { transform: 'scale(1.2)' },
  '100%': { transform: 'scale(1)' },
},
'tab-indicator': {
  '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
  '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
},
'count-up': {
  '0%': { opacity: '0', transform: 'translateY(100%)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
},
wiggle: {
  '0%, 100%': { transform: 'rotate(0deg)' },
  '20%': { transform: 'rotate(-3deg)' },
  '40%': { transform: 'rotate(3deg)' },
  '60%': { transform: 'rotate(-1deg)' },
  '80%': { transform: 'rotate(1deg)' },
},
'pulse-ring': {
  '0%': { boxShadow: '0 0 0 0 currentColor', opacity: '0.4' },
  '100%': { boxShadow: '0 0 0 6px currentColor', opacity: '0' },
},
'rubber-band': {
  '0%': { transform: 'scaleX(1)' },
  '20%': { transform: 'scaleX(1.15)' },
  '40%': { transform: 'scaleX(0.9)' },
  '60%': { transform: 'scaleX(1.05)' },
  '80%': { transform: 'scaleX(0.98)' },
  '100%': { transform: 'scaleX(1)' },
},
'collapse-out': {
  '0%': { gridTemplateRows: '1fr', opacity: '1' },
  '100%': { gridTemplateRows: '0fr', opacity: '0' },
},
'expand-in': {
  '0%': { gridTemplateRows: '0fr', opacity: '0' },
  '100%': { gridTemplateRows: '1fr', opacity: '1' },
},
'shimmer-sweep': {
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
},
'swing-in': {
  '0%': { opacity: '0', transform: 'perspective(800px) rotateX(-60deg)' },
  '70%': { opacity: '1', transform: 'perspective(800px) rotateX(5deg)' },
  '100%': { opacity: '1', transform: 'perspective(800px) rotateX(0deg)' },
},
'pop-in': {
  '0%': { opacity: '0', transform: 'scale(0.5)' },
  '70%': { opacity: '1', transform: 'scale(1.05)' },
  '100%': { opacity: '1', transform: 'scale(1)' },
},
float: {
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-4px)' },
},
'subtle-bounce': {
  '0%': { transform: 'translateY(0)' },
  '40%': { transform: 'translateY(-2px)' },
  '100%': { transform: 'translateY(0)' },
},
'spin-in': {
  '0%': { opacity: '0', transform: 'rotate(0deg) scale(0)' },
  '100%': { opacity: '1', transform: 'rotate(360deg) scale(1)' },
},
stamp: {
  '0%': { opacity: '0.5', transform: 'scale(1.4)' },
  '60%': { opacity: '1', transform: 'scale(0.95)' },
  '100%': { opacity: '1', transform: 'scale(1)' },
},
```

**Step 2: Add animation utilities**

Add these 19 animation utilities to the existing `animation` object (after `lift`):

```typescript
'slide-down': 'slide-down var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'slide-left': 'slide-left var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'slide-out-up': 'slide-out-up var(--duration-moderate-01) var(--ease-expressive-exit) both',
'slide-out-down': 'slide-out-down var(--duration-moderate-01) var(--ease-expressive-exit) both',
'check-pop': 'check-pop var(--duration-moderate-02) var(--ease-bounce) both',
'tab-indicator': 'tab-indicator var(--duration-moderate-01) var(--ease-expressive-entrance) both',
'count-up': 'count-up var(--duration-moderate-02) var(--ease-expressive-entrance) both',
wiggle: 'wiggle var(--duration-moderate-02) var(--ease-productive-standard) both',
'pulse-ring': 'pulse-ring var(--duration-slow-01) var(--ease-expressive-standard) infinite',
'rubber-band': 'rubber-band var(--duration-moderate-02) var(--ease-productive-standard) both',
'collapse-out': 'collapse-out var(--duration-moderate-01) var(--ease-productive-exit) both',
'expand-in': 'expand-in var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'shimmer-sweep': 'shimmer-sweep var(--duration-slow-02) var(--ease-linear) infinite',
'swing-in': 'swing-in var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'pop-in': 'pop-in var(--duration-moderate-02) var(--ease-bounce) both',
float: 'float 3s var(--ease-expressive-standard) infinite',
'subtle-bounce': 'subtle-bounce var(--duration-fast-02) var(--ease-bounce) both',
'spin-in': 'spin-in var(--duration-moderate-02) var(--ease-expressive-entrance) both',
stamp: 'stamp var(--duration-moderate-02) var(--ease-bounce) both',
```

**Step 3: Verify build**

Run: `cd packages/core && pnpm build 2>&1 | tail -3`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add packages/core/src/tailwind/preset.ts
git commit -m "feat(core): add 19 animation keyframes and utilities to tailwind preset"
```

---

### Task 2: Card — hover lift + press sink

**Files:**
- Modify: `packages/core/src/ui/card.tsx`

**Step 1: Upgrade interactive Card animations**

Find this line (approximately line 84):
```typescript
interactive &&
  'hover:shadow-02 hover:border-border-strong cursor-pointer transition-shadow duration-fast-01',
```

Replace with:
```typescript
interactive &&
  'hover:shadow-02 hover:border-border-strong hover:-translate-y-px active:scale-[0.98] cursor-pointer transition-all duration-fast-02 ease-productive-standard',
```

**Step 2: Verify build**

Run: `cd packages/core && pnpm build 2>&1 | tail -3`

**Step 3: Commit**

```bash
git add packages/core/src/ui/card.tsx
git commit -m "feat(card): add hover lift and press sink micro-interactions"
```

---

### Task 3: Button + IconButton — press feedback

**Files:**
- Modify: `packages/core/src/ui/button.tsx`
- Modify: `packages/core/src/ui/icon-button.tsx`

**Step 1: Add press translate to Button CVA base**

In `button.tsx`, find the CVA base string (line ~11):
```typescript
'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans font-semibold select-none border border-transparent transition-[color,background-color,border-color,box-shadow] duration-fast-01 ease-productive-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]',
```

Replace with:
```typescript
'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans font-semibold select-none border border-transparent transition-[color,background-color,border-color,box-shadow,transform] duration-fast-01 ease-productive-standard active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]',
```

Changes: added `transform` to transition list, added `active:translate-y-px`.

**Step 2: Add press translate to IconButton**

In `icon-button.tsx`, find the className for the inner button element where `shape` override is applied. Add `active:translate-y-px` to the className that merges with buttonVariants. The IconButton already uses `buttonVariants` so it inherits the press translate from Step 1 automatically. No change needed here unless IconButton has its own base classes.

Verify by reading `icon-button.tsx` — if it renders `<Button>` or uses `buttonVariants()`, it inherits automatically.

**Step 3: Verify build**

Run: `cd packages/core && pnpm build 2>&1 | tail -3`

**Step 4: Commit**

```bash
git add packages/core/src/ui/button.tsx packages/core/src/ui/icon-button.tsx
git commit -m "feat(button): add active press translate micro-interaction"
```

---

### Task 4: Chip — press rubber-band + dismiss rotate

**Files:**
- Modify: `packages/core/src/ui/chip.tsx`

**Step 1: Add active animation to clickable chips**

Find the section in the Chip component where `onClick` adds `cursor-pointer hover:bg-field-hover` (or similar interactive classes). Add `active:scale-95` to that conditional.

**Step 2: Upgrade dismiss button with rotate**

Find the dismiss button className (approximately line 144):
```typescript
className="flex-shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full p-ds-01 hover:bg-layer-03 transition-colors duration-fast-01 [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
```

Replace with:
```typescript
className="flex-shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full p-ds-01 hover:bg-layer-03 hover:rotate-90 transition-[colors,transform] duration-fast-02 [&>svg]:w-ico-sm [&>svg]:h-ico-sm"
```

Changes: added `hover:rotate-90`, changed `transition-colors` to `transition-[colors,transform]`, `duration-fast-01` to `duration-fast-02`.

**Step 3: Verify build + commit**

```bash
git add packages/core/src/ui/chip.tsx
git commit -m "feat(chip): add press scale and dismiss rotate micro-interactions"
```

---

### Task 5: Badge — dismiss rotate + dot pulse

**Files:**
- Modify: `packages/core/src/ui/badge.tsx`

**Step 1: Upgrade dismiss button with rotate**

Find the dismiss button className (approximately line 156):
```typescript
className="ml-ds-01 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
```

Replace with:
```typescript
className="ml-ds-01 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full text-icon-secondary transition-[colors,transform] duration-fast-02 hover:text-icon-primary hover:bg-field hover:rotate-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
```

**Step 2: Add pulse-ring to dot indicator**

Find the dot `<span>` rendered when `dot` prop is true. Add `animate-pulse-ring` to its className.

**Step 3: Verify build + commit**

```bash
git add packages/core/src/ui/badge.tsx
git commit -m "feat(badge): add dismiss rotate and dot pulse-ring animations"
```

---

### Task 6: Toggle — press scale

**Files:**
- Modify: `packages/core/src/ui/toggle.tsx`

**Step 1: Add active scale to CVA base**

Find the CVA base string:
```typescript
'inline-flex items-center justify-center gap-ds-03 rounded-ds-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38] data-[state=on]:bg-interactive-subtle data-[state=on]:text-interactive',
```

Replace with:
```typescript
'inline-flex items-center justify-center gap-ds-03 rounded-ds-md font-medium transition-[colors,transform] duration-fast-02 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38] data-[state=on]:bg-interactive-subtle data-[state=on]:text-interactive',
```

Changes: `transition-colors` → `transition-[colors,transform] duration-fast-02`, added `active:scale-95`.

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/toggle.tsx
git commit -m "feat(toggle): add active press scale micro-interaction"
```

---

### Task 7: Switch — bounce easing on thumb

**Files:**
- Modify: `packages/core/src/ui/switch.tsx`

**Step 1: Upgrade thumb easing**

Find the Thumb className:
```typescript
"pointer-events-none block h-ico-md w-ico-md rounded-ds-full bg-text-on-color shadow-02 ring-0 transition-transform duration-fast-01 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
```

Replace with:
```typescript
"pointer-events-none block h-ico-md w-ico-md rounded-ds-full bg-text-on-color shadow-02 ring-0 transition-transform duration-moderate-01 ease-bounce data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
```

Changes: `duration-fast-01` → `duration-moderate-01`, added `ease-bounce` for satisfying overshoot.

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/switch.tsx
git commit -m "feat(switch): add bounce easing to thumb transition"
```

---

### Task 8: Checkbox — check-pop indicator

**Files:**
- Modify: `packages/core/src/ui/checkbox.tsx`

**Step 1: Add check-pop to indicator**

Find the `CheckboxPrimitive.Indicator` element. Add `animate-check-pop` to its className. The indicator is the element that wraps the checkmark icon inside the checkbox root.

Look for something like:
```typescript
<CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current', ...)}>
```

Add `animate-check-pop` to this className.

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/checkbox.tsx
git commit -m "feat(checkbox): add check-pop animation on indicator"
```

---

### Task 9: Tabs — tab-indicator animation

**Files:**
- Modify: `packages/core/src/ui/tabs.tsx`

**Step 1: Add animation to line variant active border**

In the `tabsTriggerVariants` CVA, find the `line` variant array:
```typescript
line: [
  'px-ds-05 py-ds-03 -mb-px border-b-2 border-transparent',
  'text-text-secondary hover:text-text-primary',
  'data-[state=active]:border-interactive data-[state=active]:text-interactive',
],
```

Replace with:
```typescript
line: [
  'px-ds-05 py-ds-03 -mb-px border-b-2 border-transparent',
  'text-text-secondary hover:text-text-primary',
  'data-[state=active]:border-interactive data-[state=active]:text-interactive data-[state=active]:animate-tab-indicator',
],
```

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/tabs.tsx
git commit -m "feat(tabs): add tab-indicator animation on active trigger"
```

---

### Task 10: Stepper — check-pop + connector transition

**Files:**
- Modify: `packages/core/src/ui/stepper.tsx`

**Step 1: Add transition to connector line**

Find the connector className (approximately lines 74–82):
```typescript
index < activeStep
  ? 'bg-interactive'
  : 'bg-border',
```

Ensure the connector element has `transition-colors duration-moderate-01 ease-productive-standard` in its className.

**Step 2: Add check-pop to completed step icon**

Find where the completed step renders a check icon (e.g. `<IconCheck />` inside the step circle). Wrap or add `animate-check-pop` to the icon when `state === 'completed'`.

**Step 3: Verify build + commit**

```bash
git add packages/core/src/ui/stepper.tsx
git commit -m "feat(stepper): add check-pop and connector transitions"
```

---

### Task 11: Alert — dismiss animation

**Files:**
- Modify: `packages/core/src/ui/alert.tsx`

**Step 1: Add dismiss animation state**

The Alert needs an internal `isDismissing` state so the dismiss animation plays before the element is removed. Wrap the existing dismiss logic:

```typescript
const [isDismissing, setIsDismissing] = React.useState(false)

const handleDismiss = () => {
  setIsDismissing(true)
  setTimeout(() => onDismiss?.(), 150) // matches duration-moderate-01
}
```

**Step 2: Apply animation class**

Add to the root element's className:
```typescript
isDismissing && 'animate-slide-out-up',
```

**Step 3: Wire dismiss button to handleDismiss instead of onDismiss directly**

**Step 4: Verify build + commit**

```bash
git add packages/core/src/ui/alert.tsx
git commit -m "feat(alert): add slide-out-up dismiss animation"
```

---

### Task 12: Banner — dismiss animation

**Files:**
- Modify: `packages/core/src/ui/banner.tsx`

**Step 1: Same pattern as Alert — add isDismissing state**

```typescript
const [isDismissing, setIsDismissing] = React.useState(false)

const handleDismiss = () => {
  setIsDismissing(true)
  setTimeout(() => onDismiss?.(), 150)
}
```

**Step 2: Apply animation class to root**

Add to root className:
```typescript
isDismissing && 'animate-collapse-out overflow-hidden',
```

**Step 3: Wire dismiss button + verify build + commit**

```bash
git add packages/core/src/ui/banner.tsx
git commit -m "feat(banner): add collapse-out dismiss animation"
```

---

### Task 13: Slider — thumb hover/active scale

**Files:**
- Modify: `packages/core/src/ui/slider.tsx`

**Step 1: Add hover and active scale to thumb**

Find the Thumb className:
```typescript
"block h-ico-sm w-ico-sm rounded-ds-full border-2 border-interactive bg-layer-01 shadow-01 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]"
```

Replace with:
```typescript
"block h-ico-sm w-ico-sm rounded-ds-full border-2 border-interactive bg-layer-01 shadow-01 transition-[colors,transform] duration-fast-02 hover:scale-110 active:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]"
```

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/slider.tsx
git commit -m "feat(slider): add thumb hover and active scale micro-interactions"
```

---

### Task 14: Progress — smooth bar fill easing

**Files:**
- Modify: `packages/core/src/ui/progress.tsx`

**Step 1: Upgrade transition on indicator**

Find the `progressIndicatorVariants` CVA base:
```typescript
'h-full w-full flex-1 transition-all',
```

Replace with:
```typescript
'h-full w-full flex-1 transition-all duration-moderate-02 ease-expressive-standard',
```

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/progress.tsx
git commit -m "feat(progress): add smooth expressive easing to bar fill"
```

---

### Task 15: Toast — bounce entrance easing

**Files:**
- Modify: `packages/core/src/ui/toast.tsx`

**Step 1: The Toast already has full Radix animation. The enhancement is subtle — no code change needed here since the Radix `animate-in`/`animate-out` uses tailwindcss-animate which has its own easing. Skip this task — the Toast animation is already professional.**

---

### Task 16: Skeleton — shimmer-sweep variant

**Files:**
- Modify: `packages/core/src/ui/skeleton.tsx`

**Step 1: Upgrade shimmer variant**

The `shimmer` variant already uses `animate-skeleton-shimmer`. Optionally add `shimmer-sweep` as an alias or upgrade the existing one. Since the existing shimmer already works well, and `shimmer-sweep` is functionally identical to `skeleton-shimmer`, skip creating a duplicate. The existing animation is already professional.

**No changes needed — mark complete.**

---

### Task 17: StatCard — trend stamp animation

**Files:**
- Modify: `packages/core/src/ui/stat-card.tsx`

**Step 1: Add stamp animation to trend indicator**

Find the delta/trend icon area. Look for where `IconTrendingUp` or `IconArrowUpRight` (or similar trend direction icon) is rendered. Add `animate-stamp` to its className.

Also find the value display element (the large number) and add `animate-count-up` to make the value slide up on render. Wrap the value in an `overflow-hidden` container:

```tsx
<div className="overflow-hidden">
  <span className="inline-block animate-count-up text-ds-3xl font-semibold">
    {value}
  </span>
</div>
```

**Step 2: Verify build + commit**

```bash
git add packages/core/src/ui/stat-card.tsx
git commit -m "feat(stat-card): add count-up value and stamp trend animations"
```

---

### Task 18: EmptyState — float icon

**Files:**
- Modify: `packages/core/src/composed/empty-state.tsx`

**Step 1: Add float animation to icon container**

Find the icon container className:
```typescript
className={cn(
  'flex items-center justify-center rounded-ds-xl bg-layer-02',
  compact ? 'h-ds-md w-ds-md' : 'h-ds-lg w-ds-lg',
)}
```

Replace with:
```typescript
className={cn(
  'flex items-center justify-center rounded-ds-xl bg-layer-02 animate-float',
  compact ? 'h-ds-md w-ds-md' : 'h-ds-lg w-ds-lg',
)}
```

**Step 2: Verify build + commit**

```bash
git add packages/core/src/composed/empty-state.tsx
git commit -m "feat(empty-state): add float animation to icon"
```

---

### Task 19: NotificationCenter — item nudge + dot wiggle

**Files:**
- Modify: `packages/core/src/shell/notification-center.tsx`

**Step 1: Add hover nudge to notification items**

Find the NotificationItem className:
```typescript
'group relative flex w-full cursor-pointer items-start gap-ds-04 px-ds-05 py-ds-04 text-left transition-colors',
```

Replace with:
```typescript
'group relative flex w-full cursor-pointer items-start gap-ds-04 px-ds-05 py-ds-04 text-left transition-[colors,transform] duration-fast-02 hover:translate-x-0.5',
```

**Step 2: Add wiggle to unread indicator dot**

Find the unread indicator dot:
```typescript
<span className="block h-[8px] w-[8px] rounded-ds-full bg-interactive" />
```

Replace with:
```typescript
<span className="block h-[8px] w-[8px] rounded-ds-full bg-interactive animate-wiggle" />
```

**Step 3: Add transition to dismiss button**

Find the dismiss button className:
```typescript
className="absolute right-ds-03 top-ds-03 hidden rounded-ds-sm p-ds-01 text-text-placeholder hover:bg-layer-03 hover:text-text-secondary group-hover:flex group-focus-within:flex"
```

Add `transition-colors duration-fast-02` to it.

**Step 4: Verify build + commit**

```bash
git add packages/core/src/shell/notification-center.tsx
git commit -m "feat(notification-center): add item nudge, dot wiggle, dismiss transition"
```

---

### Task 20: BottomNavbar — tab-indicator + tap bounce

**Files:**
- Modify: `packages/core/src/shell/bottom-navbar.tsx`

**Step 1: Replace opacity transition on active indicator**

Find the active indicator:
```typescript
className={cn(
  'absolute top-0 h-[3px] w-full rounded-b-ds-sm bg-interactive p-0 transition-opacity duration-slow-01',
  isActive ? 'opacity-100' : 'opacity-0',
)}
```

Replace with:
```typescript
className={cn(
  'absolute top-0 h-[3px] w-full rounded-b-ds-sm bg-interactive p-0 transition-[opacity,transform] duration-moderate-01',
  isActive ? 'opacity-100 animate-tab-indicator' : 'opacity-0 scale-x-0',
)}
```

**Step 2: Add tap bounce to nav items**

Find the NavItem className:
```typescript
'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-ds-02 p-ds-02 pt-0 text-ds-sm',
```

Replace with:
```typescript
'flex h-16 max-w-[70px] flex-1 cursor-pointer flex-col items-center gap-ds-02 p-ds-02 pt-0 text-ds-sm active:animate-subtle-bounce',
```

**Step 3: Apply same indicator treatment to the "More" button indicator**

Find the More button's indicator (same pattern as Step 1) and apply the same replacement.

**Step 4: Verify build + commit**

```bash
git add packages/core/src/shell/bottom-navbar.tsx
git commit -m "feat(bottom-navbar): add tab-indicator and tap bounce animations"
```

---

### Task 21: Full build + test verification

**Step 1: Run full build**

```bash
cd packages/core && pnpm build
```

**Step 2: Run all tests**

```bash
cd packages/core && pnpm test
```

**Step 3: Run karm tests (board components still work)**

```bash
cd packages/karm && pnpm test
```

**Step 4: Fix any failures**

All animation changes are CSS-only (no behavioral changes), so tests should pass without modification. If any snapshot tests fail, update them.

---

### Summary

| Task | Component(s) | Type | Changes |
|------|-------------|------|---------|
| 1 | preset.ts | Foundation | 19 keyframes + 19 utilities |
| 2 | Card | Micro-interaction | Hover lift, press sink |
| 3 | Button, IconButton | Micro-interaction | Press translate |
| 4 | Chip | Micro-interaction | Press scale, dismiss rotate |
| 5 | Badge | Micro-interaction | Dismiss rotate, dot pulse |
| 6 | Toggle | Micro-interaction | Press scale |
| 7 | Switch | Micro-interaction | Bounce easing on thumb |
| 8 | Checkbox | Micro-interaction | Check-pop indicator |
| 9 | Tabs | Micro-interaction | Tab-indicator animation |
| 10 | Stepper | Micro-interaction | Check-pop, connector transition |
| 11 | Alert | Dismiss animation | Slide-out-up with state delay |
| 12 | Banner | Dismiss animation | Collapse-out with state delay |
| 13 | Slider | Micro-interaction | Thumb hover/active scale |
| 14 | Progress | Polish | Expressive bar fill easing |
| 15 | Toast | Skip | Already well-animated |
| 16 | Skeleton | Skip | Existing shimmer is sufficient |
| 17 | StatCard | Delighter | Count-up value, stamp trend |
| 18 | EmptyState | Delighter | Float icon |
| 19 | NotificationCenter | Delighter | Item nudge, dot wiggle |
| 20 | BottomNavbar | Micro-interaction | Tab-indicator, tap bounce |
| 21 | Verification | Testing | Full build + test pass |
