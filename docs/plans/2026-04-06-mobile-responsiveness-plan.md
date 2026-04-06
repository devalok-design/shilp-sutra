# Mobile Responsiveness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the design system feel native on mobile — auto-responsive overlays, proper touch targets, swipe-to-dismiss, shared BottomSheet primitive.

**Architecture:** Hybrid CSS/JS approach. CSS `md:` breakpoints for visual responsive behavior (Dialog fullscreen). JS `useIsMobile()` hook for behavioral changes (swap Popover to BottomSheet). Shared internal `bottom-sheet.tsx` primitive composed by Sheet, Popover, and Select on mobile.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, framer-motion (drag gestures), vendored Radix primitives, `useIsMobile()` hook

---

## Task 1: Touch Target Utility + Tailwind Plugin

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts`

**Step 1: Add touch-target utility to the Tailwind plugin**

In the existing `plugin(function ({ addUtilities }) { ... })` section of preset.ts, add:

```ts
'.touch-target': {
  position: 'relative',
},
'.touch-target::before': {
  content: '""',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: '44px',
  minHeight: '44px',
},
```

**Step 2: Commit**

```bash
git add packages/core/src/tailwind/preset.ts
git commit -m "feat(a11y): add touch-target Tailwind utility (44px hit area)"
```

---

## Task 2: Fix Touch Targets — Checkbox, Radio, Slider, Switch

**Files:**
- Modify: `packages/core/src/ui/checkbox.tsx`
- Modify: `packages/core/src/ui/radio.tsx`
- Modify: `packages/core/src/ui/slider.tsx`
- Modify: `packages/core/src/ui/switch.tsx`

**Step 1: Checkbox — add touch-target to sm size**

Read `packages/core/src/ui/checkbox.tsx`. The `sm` size is `h-5 w-5` (20px). Add `touch-target` class to the checkbox root element for the `sm` size so the 44px invisible hit area expands touch reach. The `md` (24px) and `lg` (28px) sizes are OK but should also get touch-target for consistent 44px mobile targets.

Add `touch-target` to the base classes in the checkbox root element (it applies to all sizes — the visual stays the same but touch area is 44px).

**Step 2: Radio — same pattern**

Read `packages/core/src/ui/radio.tsx`. Add `touch-target` to the radio item element. Same approach as checkbox.

**Step 3: Slider — increase thumb to 24px visual + touch-target**

Read `packages/core/src/ui/slider.tsx`. The thumb is currently `h-6 w-6` which is already 24px. But add `touch-target` to the thumb element for 44px mobile hit area.

Actually — re-reading the source, the thumb IS already `h-6 w-6` (24px). The audit said 16px but the code says 24px. Verify by reading the current source. If it's already 24px, just add `touch-target`.

**Step 4: Switch — fix sm size**

Read `packages/core/src/ui/switch.tsx`. The `sm` config is `thumb: 'h-[18px] w-[18px]'`. Change to `h-5 w-5` (20px) and add `touch-target` to the switch root for 44px hit area on all sizes.

**Step 5: Commit**

```bash
git add packages/core/src/ui/checkbox.tsx packages/core/src/ui/radio.tsx packages/core/src/ui/slider.tsx packages/core/src/ui/switch.tsx
git commit -m "fix(a11y): 44px touch targets on Checkbox, Radio, Slider, Switch"
```

---

## Task 3: BottomSheet Internal Primitive

**Files:**
- Create: `packages/core/src/ui/lib/bottom-sheet.tsx`

**Step 1: Create the shared BottomSheet primitive**

This is an internal component (not exported to consumers). It renders:
- A backdrop overlay (semi-transparent, click to dismiss)
- A bottom-anchored panel that slides up
- A drag handle (32x4px rounded bar)
- Swipe-to-dismiss via framer-motion `drag="y"`
- `prefers-reduced-motion` support

```tsx
'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from 'framer-motion'
import { cn } from './utils'
import { tweens } from './motion'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  /** Show drag handle bar at top. @default true */
  dragHandle?: boolean
  /** Allow swipe-to-dismiss. @default true */
  swipeable?: boolean
}

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  dragHandle = true,
  swipeable = true,
}: BottomSheetProps) {
  const isReduced = useReducedMotion()
  const sheetRef = React.useRef<HTMLDivElement>(null)

  const handleDragEnd = React.useCallback(
    (_: unknown, info: PanInfo) => {
      const sheetHeight = sheetRef.current?.getBoundingClientRect().height ?? 300
      // Dismiss if dragged past 30% or velocity > 500
      if (info.offset.y > sheetHeight * 0.3 || info.velocity.y > 500) {
        onClose()
      }
    },
    [onClose],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-modal bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={tweens.fade}
            onClick={onClose}
          />
          {/* Sheet panel */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            className={cn(
              'fixed inset-x-0 bottom-0 z-modal max-h-[85vh] overflow-y-auto rounded-t-ds-xl border-t border-surface-border-strong bg-surface-overlay shadow-overlay',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={isReduced ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
            drag={swipeable && !isReduced ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {dragHandle && (
              <div className="flex justify-center pt-ds-03 pb-ds-02">
                <div className="h-1 w-8 rounded-ds-full bg-surface-border" />
              </div>
            )}
            <div className="px-ds-05 pb-ds-06">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Commit**

```bash
git add packages/core/src/ui/lib/bottom-sheet.tsx
git commit -m "feat: add internal BottomSheet primitive for mobile overlays"
```

---

## Task 4: Dialog — fullScreen on Mobile

**Files:**
- Modify: `packages/core/src/ui/dialog.tsx`

**Step 1: Add responsive prop and mobile fullscreen behavior**

Read `packages/core/src/ui/dialog.tsx` fully. The `DialogContent` component currently renders as a centered modal with `fixed left-[50%] top-[50%]` positioning.

Add a `responsive` prop (default `true`) to `DialogContent`. When `responsive` is true, use CSS breakpoints to make the dialog fullScreen on mobile:

On the `motion.div` inside DialogContent, change the className to:
```tsx
className={cn(
  // Mobile: fullScreen
  'fixed inset-0 z-modal grid w-full gap-ds-05 border-none bg-surface-overlay p-ds-06 shadow-none',
  // Desktop: centered modal
  'md:inset-auto md:left-[50%] md:top-[50%] md:max-w-lg md:rounded-ds-xl md:border md:border-surface-border-strong md:shadow-overlay',
  // When NOT responsive, always use desktop layout
  !responsive && 'inset-auto left-[50%] top-[50%] max-w-lg rounded-ds-xl border border-surface-border-strong shadow-overlay',
  className,
)}
```

Also adjust the motion: on mobile, slide up instead of scale:
- `initial`: mobile `{ y: '100%' }`, desktop `{ opacity: 0, scale: 0.95 }`
- Use `useIsMobile()` to determine which animation to use
- Or: keep the scale animation for simplicity (it works on both)

Actually, the simplest approach: keep the existing framer-motion animation (scale) for both — it works fine on mobile. The key change is just the CSS layout (fullScreen vs centered).

For the `DialogPrimitive.Close` button: on mobile fullScreen, position it at the top-right of the full-screen panel. The current `absolute right-ds-05 top-ds-05` already works for both layouts.

**Step 2: Export responsive prop**

Add `responsive?: boolean` to the DialogContent props type and the existing exports.

**Step 3: Commit**

```bash
git add packages/core/src/ui/dialog.tsx
git commit -m "feat(mobile): Dialog auto-fullScreen on mobile via CSS breakpoints"
```

---

## Task 5: Sheet — Bottom Sheet on Mobile with Swipe

**Files:**
- Modify: `packages/core/src/ui/sheet.tsx`

**Step 1: Add mobile bottom-sheet behavior**

Read `packages/core/src/ui/sheet.tsx` fully. The `SheetContent` has a `side` prop (left/right/top/bottom).

Add behavior: when on mobile (`useIsMobile()`), override `side` to `"bottom"` regardless of prop, show a drag handle, and enable swipe-to-dismiss.

In `SheetContent`:
1. Import `useIsMobile` from `../../hooks/use-mobile`
2. At the top of the component: `const isMobile = useIsMobile()`
3. Compute effective side: `const effectiveSide = isMobile ? 'bottom' : side`
4. Use `effectiveSide` for the slide direction and CVA variant
5. Add drag handle when mobile: a 32x4px bar at the top
6. Add `drag="y"` and `dragConstraints={{ top: 0 }}` on the motion.div when mobile
7. Add `onDragEnd` handler that calls `onOpenChange(false)` when dragged past 30% or velocity > 500

**Step 2: Add responsive prop**

Add `responsive?: boolean` (default `true`) to `SheetContentProps`. When `false`, don't override to bottom on mobile.

**Step 3: Commit**

```bash
git add packages/core/src/ui/sheet.tsx
git commit -m "feat(mobile): Sheet auto-bottom with swipe-to-dismiss on mobile"
```

---

## Task 6: Popover — Bottom Drawer on Mobile

**Files:**
- Modify: `packages/core/src/ui/popover.tsx`

**Step 1: Add mobile bottom-drawer behavior**

Read `packages/core/src/ui/popover.tsx`. The `PopoverContent` renders as a floating positioned div.

Add: when `useIsMobile()`, render the BottomSheet primitive instead of the floating Popover.

In `PopoverContent`:
1. Import `useIsMobile` and `BottomSheet` from `./lib/bottom-sheet`
2. `const isMobile = useIsMobile()`
3. If mobile, return:
```tsx
<BottomSheet open={open} onClose={() => onOpenChange?.(false)}>
  {children}
</BottomSheet>
```
4. If desktop, return the existing Radix Popover rendering

The tricky part: `PopoverContent` doesn't have direct access to `onOpenChange`. It reads `open` from context but can't close the popover. The Radix `PopoverPrimitive.Content` handles dismiss via Escape and outside click.

Solution: On mobile, render the BottomSheet OUTSIDE of the Radix Popover portal. Use the `PopoverOpenContext` value and call the parent's `onOpenChange`. We need to thread `onOpenChange` through context.

Add `onOpenChange` to the `PopoverOpenContext` (currently it only has `open: boolean`). Change to `{ open: boolean; onOpenChange: (open: boolean) => void }`.

**Step 2: Commit**

```bash
git add packages/core/src/ui/popover.tsx
git commit -m "feat(mobile): Popover renders as bottom drawer on mobile"
```

---

## Task 7: Select — Bottom Drawer on Mobile

**Files:**
- Modify: `packages/core/src/ui/select.tsx`

**Step 1: Add mobile bottom-drawer behavior**

Read `packages/core/src/ui/select.tsx`. The `SelectContent` renders a Radix Select listbox.

On mobile, instead of the floating dropdown, render a BottomSheet containing the options list with 44px row heights.

Pattern:
1. Import `useIsMobile` and `BottomSheet`
2. In `SelectContent`, check `isMobile`
3. If mobile, render `<BottomSheet>` with the options list inside, styled with `py-ds-03` on each option for 44px touch rows
4. If desktop, use existing Radix Select rendering

The Select primitive is complex (it manages selection state, keyboard nav, etc.). The mobile rendering must still use Radix's `SelectItem` components for state management, but wrap them in a BottomSheet layout instead of a floating dropdown.

Approach: On mobile, render `SelectContent` inside a BottomSheet with `SelectPrimitive.Viewport` containing the items. The viewport is what Radix uses for the scrollable option list.

**Step 2: Commit**

```bash
git add packages/core/src/ui/select.tsx
git commit -m "feat(mobile): Select renders as bottom drawer on mobile"
```

---

## Task 8: Tests for Mobile Responsiveness

**Files:**
- Create: `packages/core/src/ui/__tests__/mobile-responsive.test.tsx`
- Create: `packages/core/src/ui/lib/__tests__/bottom-sheet.test.tsx`

**Step 1: BottomSheet tests**

Test:
- Renders when open, not when closed
- Backdrop click calls onClose
- Drag handle visible by default, hidden when `dragHandle={false}`
- Has `role="dialog"` and `aria-modal`
- axe: toHaveNoViolations

**Step 2: Dialog responsive tests**

Test:
- Default: has fullScreen classes on mobile (check for `md:` responsive classes)
- `responsive={false}`: does not have fullScreen classes
- axe: toHaveNoViolations in both modes

**Step 3: Commit**

```bash
git add packages/core/src/ui/__tests__/mobile-responsive.test.tsx packages/core/src/ui/lib/__tests__/bottom-sheet.test.tsx
git commit -m "test: add mobile responsiveness tests for BottomSheet and Dialog"
```

---

## Task 9: Stories for Mobile Components

**Files:**
- Create: `packages/core/src/ui/lib/bottom-sheet.stories.tsx` (internal, for dev reference)
- Modify: `packages/core/src/ui/dialog.stories.tsx` — add "Mobile FullScreen" story
- Modify: `packages/core/src/ui/sheet.stories.tsx` — add "Mobile Bottom Sheet" story

**Step 1: Add mobile stories**

For Dialog, add a story that shows the fullScreen behavior:
```tsx
export const MobileFullScreen: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  // render open dialog
}
```

Similar for Sheet with bottom + swipe behavior.

**Step 2: Commit**

```bash
git add packages/core/src/ui/lib/bottom-sheet.stories.tsx packages/core/src/ui/dialog.stories.tsx packages/core/src/ui/sheet.stories.tsx
git commit -m "docs: add mobile responsive stories for Dialog, Sheet, BottomSheet"
```

---

## Execution Strategy

**Task dependencies:**
- Task 1 (touch utility) → Task 2 (touch targets) — sequential
- Task 3 (BottomSheet) → Tasks 4, 5, 6, 7 (Dialog, Sheet, Popover, Select) — BottomSheet first, then others in parallel
- Task 8 (tests) → after all component tasks
- Task 9 (stories) → after all component tasks

**Parallelizable after Task 3:**
- Tasks 4, 5, 6, 7 can run in parallel (different files)
- Tasks 8, 9 can run in parallel after 4-7

**Estimated: 9 tasks, ~4 parallel rounds.**
