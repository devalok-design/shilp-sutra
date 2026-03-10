# Board Animation System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add expressive animations to the board — card enter/exit, hover lift, drag overlay, column stagger, filter chip transitions, bulk bar upgrades, focus ring, and context menu — all using the existing shilp-sutra motion token system.

**Architecture:** Upstream first — add new keyframes, animation utilities, and a stagger system to the core Tailwind preset. Then apply animations to board components using Tailwind classes only (no JS animation libraries). All animations respect `prefers-reduced-motion` via the existing global CSS rule in semantic.css.

**Tech Stack:** Tailwind 3.4 (preset.ts keyframes + animation), CSS custom properties, CVA variants, React state for stagger indices.

**Design Doc:** `docs/plans/2026-03-11-board-animations-design.md`

---

## Task 1: Upstream — New Keyframes & Animations in preset.ts

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts` (keyframes at line ~268, animation at line ~296)

**Step 1: Add keyframes**

Add these entries inside `theme.extend.keyframes` (after the existing `caret-blink` keyframe, before the closing `}`):

```typescript
'fade-in': {
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
},
'fade-out': {
  '0%': { opacity: '1' },
  '100%': { opacity: '0' },
},
'slide-up': {
  '0%': { opacity: '0', transform: 'translateY(8px)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
},
'slide-right': {
  '0%': { opacity: '0', transform: 'translateX(20px)' },
  '100%': { opacity: '1', transform: 'translateX(0)' },
},
'scale-in': {
  '0%': { opacity: '0', transform: 'scale(0.96)' },
  '100%': { opacity: '1', transform: 'scale(1)' },
},
'scale-out': {
  '0%': { opacity: '1', transform: 'scale(1)' },
  '100%': { opacity: '0', transform: 'scale(0.96)' },
},
'glow-pulse': {
  '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
  '50%': { boxShadow: '0 0 8px 2px rgba(99, 102, 241, 0.15)' },
},
'scale-bounce': {
  '0%': { transform: 'scale(0.85)' },
  '60%': { transform: 'scale(1.04)' },
  '100%': { transform: 'scale(1)' },
},
'lift': {
  '0%': { transform: 'scale(1) translateY(0)' },
  '100%': { transform: 'scale(1.03) translateY(-2px)' },
},
```

**Step 2: Add animation utilities**

Add these entries inside `theme.extend.animation` (after `caret-blink`):

```typescript
'fade-in': 'fade-in var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'fade-out': 'fade-out var(--duration-moderate-01) var(--ease-expressive-exit) both',
'slide-up': 'slide-up var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'slide-right': 'slide-right var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'scale-in': 'scale-in var(--duration-moderate-02) var(--ease-expressive-entrance) both',
'scale-out': 'scale-out var(--duration-moderate-01) var(--ease-expressive-exit) both',
'glow-pulse': 'glow-pulse var(--duration-slow-01) var(--ease-expressive-standard) 1',
'scale-bounce': 'scale-bounce var(--duration-moderate-02) var(--ease-bounce) both',
'lift': 'lift var(--duration-moderate-02) var(--ease-expressive-entrance) both',
```

**Step 3: Add stagger delay plugin**

Add a new `plugin` entry to the preset. Inside the `plugins` array (or create one at the top level of the preset config), add a utility that reads `--stagger-index`:

In the preset's root config (after `theme`), add:

```typescript
plugins: [
  function ({ addUtilities }: { addUtilities: Function }) {
    addUtilities({
      '.delay-stagger': {
        animationDelay: 'calc(var(--stagger-index, 0) * 30ms)',
      },
      '.delay-stagger-50': {
        animationDelay: 'calc(var(--stagger-index, 0) * 50ms)',
      },
    })
  },
],
```

If `plugins` already exists, append to it.

**Step 4: Run existing motion tests**

```bash
cd packages/core && npx vitest run src/ui/lib/__tests__/motion.test.ts
```

Expected: all 8 tests pass (keyframe/animation additions are in Tailwind config, not in motion.ts).

**Step 5: Commit**

```bash
git commit -m "feat(core): add board animation keyframes, utilities, and stagger plugin to preset"
```

---

## Task 2: Upstream — Update Motion Tests

**Files:**
- Test: `packages/core/src/ui/lib/__tests__/motion.test.ts`

**Step 1: Read the existing test file to understand its structure**

**Step 2: Add a simple smoke test that the new animation class names resolve**

This is optional — the animations are Tailwind config, so they're validated at build time. If the existing test file only tests `motion.ts` exports, skip this task and move on.

**Step 3: Commit if changes made**

```bash
git commit -m "test(core): verify new animation keyframes in preset"
```

---

## Task 3: Card Enter Animation (Staggered Slide-Up)

**Files:**
- Modify: `packages/karm/src/board/board-column.tsx`

**Step 1: Add stagger indices to task cards**

In `board-column.tsx`, where cards are rendered inside the `SortableContext` (around line 67), wrap each card's outer element with a `--stagger-index` inline style:

Change the task mapping from:
```tsx
{column.tasks.map((task) => (
  <TaskContextMenu key={task.id} taskId={task.id}>
    {viewMode === 'compact' ? (
      <TaskCardCompact task={task} />
    ) : (
      <TaskCard task={task} />
    )}
  </TaskContextMenu>
))}
```

To:
```tsx
{column.tasks.map((task, taskIdx) => (
  <div
    key={task.id}
    className="animate-slide-up delay-stagger"
    style={{ '--stagger-index': taskIdx } as React.CSSProperties}
  >
    <TaskContextMenu taskId={task.id}>
      {viewMode === 'compact' ? (
        <TaskCardCompact task={task} />
      ) : (
        <TaskCard task={task} />
      )}
    </TaskContextMenu>
  </div>
))}
```

**Step 2: Run board-column tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/board-column.test.tsx
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git commit -m "feat(board): add staggered slide-up enter animation to task cards"
```

---

## Task 4: Column Enter Animation (Staggered Slide-Right)

**Files:**
- Modify: `packages/karm/src/board/kanban-board.tsx`

**Step 1: Add stagger index to columns in BoardCanvas**

In `kanban-board.tsx`, inside the `BoardCanvas` function where columns are mapped (the `columns.map` block), wrap each column div with animation classes:

Change:
```tsx
{columns.map((column, index) => (
  <div key={column.id} className="flex-shrink-0">
    <BoardColumn column={column} index={index} />
  </div>
))}
```

To:
```tsx
{columns.map((column, index) => (
  <div
    key={column.id}
    className="flex-shrink-0 animate-slide-right delay-stagger-50"
    style={{ '--stagger-index': index } as React.CSSProperties}
  >
    <BoardColumn column={column} index={index} />
  </div>
))}
```

**Step 2: Run kanban-board tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/kanban-board.test.tsx
```

Expected: all 7 tests pass.

**Step 3: Commit**

```bash
git commit -m "feat(board): add staggered slide-right enter animation to columns"
```

---

## Task 5: Card Hover Lift & Select Glow

**Files:**
- Modify: `packages/karm/src/board/task-card.tsx`

**Step 1: Add hover lift to default card**

In `task-card.tsx`, the `taskCardVariants` CVA definition (line ~58). The base class string already has `transition-all duration-fast-02 ease-productive-standard`.

Add `hover:-translate-y-px hover:shadow-02` to the base string. The card already has `hover:bg-layer-active hover:shadow-01` — change `hover:shadow-01` to `hover:shadow-02` for the lift effect.

**Step 2: Add glow pulse on selection**

In the `TaskCardVisual` function, where the selected state classes are applied (look for `isSelected` conditional classes around line 155-165), add the `animate-glow-pulse` class when selected. The selection ring is already there (`ring-1 ring-accent/50`). Add:

```
isSelected && 'animate-glow-pulse',
```

to the card's className alongside the existing selected classes. Note: `animate-glow-pulse` plays once (`1` fill mode), so it pulses once on selection then stops.

**Step 3: Do the same for compact card**

The compact card CVA (line ~348) — add `hover:-translate-y-px` to base. Add `animate-glow-pulse` to selected state.

**Step 4: Run task-card tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/task-card.test.tsx
```

Expected: all 15 tests pass.

**Step 5: Commit**

```bash
git commit -m "feat(board): add hover lift and selection glow pulse to task cards"
```

---

## Task 6: Checkbox Animation

**Files:**
- Modify: `packages/karm/src/board/task-card.tsx`

**Step 1: Add scale-bounce to checkbox appearance**

In both `TaskCardVisual` and `TaskCardCompactVisual`, where the Checkbox is rendered (search for `<Checkbox`), the checkbox wrapper already has `transition-opacity` and toggles between `opacity-0` and `opacity-100`.

Add `animate-scale-bounce` alongside the opacity transition so the checkbox pops in when it becomes visible. The checkbox container div class should become something like:

```
'absolute -top-2 -left-2 z-10 transition-opacity',
(anySelected || isSelected) ? 'opacity-100 animate-scale-bounce' : 'opacity-0',
```

Note: `animate-scale-bounce` uses `animation-fill-mode: both`, so it only plays on mount/class-add.

**Step 2: Run task-card tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/task-card.test.tsx
```

**Step 3: Commit**

```bash
git commit -m "feat(board): add scale-bounce animation to checkbox appearance"
```

---

## Task 7: Drag Overlay Animation

**Files:**
- Modify: `packages/karm/src/board/task-card.tsx`
- Modify: `packages/karm/src/board/kanban-board.tsx`

**Step 1: Style the drag overlay card**

In `task-card.tsx`, find `TaskCardVisual` where `isDragOverlay` is checked. When `isDragOverlay` is true, the card should have:
- `scale-[1.03]` (slight enlarge)
- `rotate-[1.5deg]` (subtle tilt)
- `shadow-03` (elevated shadow)
- `animate-lift` (animate into the lifted state)

Find where `isDragOverlay` affects the card classes and add:

```
isDragOverlay && 'scale-[1.03] rotate-[1.5deg] shadow-03 animate-lift',
```

Also for compact variant.

**Step 2: Add drop animation to DragOverlay in kanban-board.tsx**

In `kanban-board.tsx`, the `DragOverlay` component currently has `dropAnimation={null}`. Change it to a custom drop animation with bounce:

```tsx
const dropAnimationConfig = {
  duration: 240,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // bounce
}
```

Then use: `<DragOverlay dropAnimation={dropAnimationConfig}>`

**Step 3: Style the drag source placeholder**

In `TaskCardVisual`, when `isDragging` is true (the source card while dragging), add `opacity-40` class:

```
isDragging && 'opacity-40',
```

Same for compact variant.

**Step 4: Run tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/task-card.test.tsx src/board/__tests__/kanban-board.test.tsx
```

**Step 5: Commit**

```bash
git commit -m "feat(board): add lift/tilt/shadow animation to drag overlay"
```

---

## Task 8: Filter Chip Animations

**Files:**
- Modify: `packages/karm/src/board/board-toolbar.tsx`

**Step 1: Add scale-in animation to filter chips**

In `board-toolbar.tsx`, find where filter chips (badges) are rendered (the `chips.map` block). Each chip Badge should get `animate-scale-in delay-stagger` with `--stagger-index`:

Change chip rendering from:
```tsx
{chips.map((chip) => (
  <Badge key={chip.key} ...>
```

To:
```tsx
{chips.map((chip, idx) => (
  <div
    key={chip.key}
    className="animate-scale-in delay-stagger"
    style={{ '--stagger-index': idx } as React.CSSProperties}
  >
    <Badge ...>
```

Close the wrapper div after the Badge.

**Step 2: Run toolbar tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/board-toolbar.test.tsx
```

Expected: all 14 tests pass.

**Step 3: Commit**

```bash
git commit -m "feat(board): add staggered scale-in animation to filter chips"
```

---

## Task 9: Bulk Action Bar Upgrade

**Files:**
- Modify: `packages/karm/src/board/bulk-action-bar.tsx`

**Step 1: Upgrade easing**

In `bulk-action-bar.tsx` line ~80, change `ease-productive-standard` to `ease-expressive-entrance`:

```
'grid transition-[grid-template-rows,opacity] duration-moderate-02 ease-expressive-entrance',
```

Also change `duration-200` to `duration-moderate-02` to use design tokens.

**Step 2: Add staggered fade-in to action buttons**

Find where the action buttons are rendered inside the bar. Wrap each button in a stagger container:

Each action button (Move, Priority, Assign, Visibility, Delete) gets:
```tsx
<div
  className="animate-fade-in delay-stagger"
  style={{ '--stagger-index': N } as React.CSSProperties}
>
  {/* button */}
</div>
```

Where N is 0, 1, 2, 3, 4 for each button respectively.

**Step 3: Run bulk action bar tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/bulk-action-bar.test.tsx
```

Expected: all 8 tests pass.

**Step 4: Commit**

```bash
git commit -m "feat(board): upgrade bulk action bar to expressive easing with staggered buttons"
```

---

## Task 10: Focus Ring Animation

**Files:**
- Modify: `packages/karm/src/board/task-card.tsx`

**Step 1: Animate focus ring transition**

In the task card CVA variants, the focused state applies `ring-1 ring-focus`. Add a smooth transition to the ring:

The base class already has `transition-all duration-fast-02 ease-productive-standard`, which covers `ring` properties. Verify the focus state is `isFocused && 'ring-1 ring-focus'` — this should already animate smoothly due to `transition-all`.

If `transition-all` is NOT covering ring (rings are box-shadows in Tailwind), ensure the transition property includes `box-shadow`:

Add `transition-[all,box-shadow]` or verify `transition-all` covers it (it does in Tailwind 3.4).

Same for compact card.

**Step 2: Run tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/task-card.test.tsx
```

**Step 3: Commit**

```bash
git commit -m "feat(board): ensure focus ring animates smoothly between cards"
```

---

## Task 11: Context Menu Animation

**Files:**
- Modify: `packages/karm/src/board/task-context-menu.tsx`

**Step 1: Add enter animation to ContextMenuContent**

In `task-context-menu.tsx`, the `ContextMenuContent` already renders from Radix. Add animation classes to it:

Change:
```tsx
<ContextMenuContent className="w-52">
```

To:
```tsx
<ContextMenuContent className="w-52 animate-scale-in">
```

Radix ContextMenu handles its own open/close transitions, but adding `animate-scale-in` provides a polished entrance.

**Step 2: Run context menu tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/task-context-menu.test.tsx
```

**Step 3: Commit**

```bash
git commit -m "feat(board): add scale-in animation to context menu"
```

---

## Task 12: Column Header Add-Task Animation Upgrade

**Files:**
- Modify: `packages/karm/src/board/column-header.tsx`

**Step 1: Upgrade grid-rows animation easing**

In `column-header.tsx` line ~372, change `duration-200 ease-productive-standard` to `duration-moderate-02 ease-expressive-entrance`:

```
'grid transition-[grid-template-rows,opacity] duration-moderate-02 ease-expressive-entrance',
```

**Step 2: Run column-header tests**

```bash
cd packages/karm && npx vitest run src/board/__tests__/column-header.test.tsx
```

Expected: all 20 tests pass.

**Step 3: Commit**

```bash
git commit -m "feat(board): upgrade column header add-task animation to expressive easing"
```

---

## Task 13: Full Test Suite & Visual Review

**Steps:**

1. Run all board tests:
```bash
cd packages/karm && npx vitest run src/board/__tests__/
```
Expected: all 102 tests pass.

2. Run core tests:
```bash
cd packages/core && npx vitest run
```
Expected: all 659 tests pass.

3. Typecheck:
```bash
pnpm typecheck
```
Expected: no new errors.

4. Start Storybook and visually review all board stories:
```bash
pnpm dev
```

Check:
- KanbanBoard > FullBoard: columns stagger in from right, cards stagger up within each column
- Task cards: hover lifts card slightly, selection shows glow pulse
- Drag a card: overlay lifts+tilts, source fades, drop bounces
- Open toolbar filters: chips animate in with scale-bounce
- Select tasks: bulk bar slides in with expressive easing, buttons stagger
- Right-click card: context menu scales in
- Keyboard nav: focus ring transitions smoothly

**Step: Commit any fixes**

```bash
git commit -m "fix(board): resolve animation issues found in visual review"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Upstream keyframes + animations + stagger | preset.ts |
| 2 | Motion tests (if needed) | motion.test.ts |
| 3 | Card enter stagger | board-column.tsx |
| 4 | Column enter stagger | kanban-board.tsx |
| 5 | Card hover lift + select glow | task-card.tsx |
| 6 | Checkbox bounce | task-card.tsx |
| 7 | Drag overlay lift/tilt/drop | task-card.tsx, kanban-board.tsx |
| 8 | Filter chip animations | board-toolbar.tsx |
| 9 | Bulk bar upgrade | bulk-action-bar.tsx |
| 10 | Focus ring animation | task-card.tsx |
| 11 | Context menu animation | task-context-menu.tsx |
| 12 | Column header animation upgrade | column-header.tsx |
| 13 | Full test suite + visual review | all |
