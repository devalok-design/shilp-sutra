# Mobile Responsiveness Implementation Plan (v2 — post-audit)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the design system feel native on mobile — auto-responsive overlays, proper touch targets, swipe-to-dismiss, shared BottomSheet primitive built on Radix Dialog.

**Architecture:** Hybrid CSS/JS approach. CSS `md:` breakpoints for visual responsive behavior (Dialog fullscreen). JS `useIsMobile()` hook for behavioral changes (swap Popover to BottomSheet). Shared internal `bottom-sheet.tsx` built on Radix Dialog primitive (gets focus trap, scroll lock, Escape for free). Select mobile deferred to follow-up.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, framer-motion (drag gestures), vendored Radix Dialog primitive, `useIsMobile()` hook

**Audit fixes incorporated:** BottomSheet built on Radix Dialog (focus trap + scroll lock + Escape), snap points, PanInfo type fix, context threading for Sheet/Popover onClose, Select deferred, ResponsiveOverlay reconciled, slide-up animation on mobile Dialog, Toast touch targets.

---

## Task 1: Touch Target Utility + Tailwind Plugin

**Files:**
- Modify: `packages/core/src/tailwind/preset.ts`

Read the file. Find the `plugin(({ addBase, addUtilities }) => { ... })` block. Add the touch-target utility inside `addUtilities`:

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
  'min-width': '44px',
  'min-height': '44px',
},
```

Commit: `feat(a11y): add touch-target Tailwind utility (44px hit area)`

---

## Task 2: Fix Touch Targets — Checkbox, Radio, Slider, Switch, Toast

**Files:**
- Modify: `packages/core/src/ui/checkbox.tsx`
- Modify: `packages/core/src/ui/radio.tsx`
- Modify: `packages/core/src/ui/slider.tsx`
- Modify: `packages/core/src/ui/switch.tsx`
- Modify: `packages/core/src/ui/toast.tsx`

Read each file first.

**Checkbox:** Add `touch-target` to the base classes of the `CheckboxPrimitive.Root` element (applies to all sizes). The visual size stays the same but touch area becomes 44px.

**Radio:** Same pattern — add `touch-target` to the `RadioGroupPrimitive.Item` element.

**Slider:** Thumb is already `h-6 w-6` (24px visual). Add `touch-target` to the `SliderPrimitive.Thumb` element for 44px touch area.

**Switch:** The `sm` thumb is `h-[18px] w-[18px]`. Change to `h-5 w-5` (20px). Add `touch-target` to the `SwitchPrimitives.Root` element for all sizes.

**Toast:** Find action buttons in upload/file toast rows. Add `touch-target` class to small icon-only buttons that were previously sized at 24px (already fixed from earlier audit, just add the 44px touch expansion).

Commit: `fix(a11y): 44px touch targets on Checkbox, Radio, Slider, Switch, Toast`

---

## Task 3: BottomSheet Primitive (Built on Radix Dialog)

**Files:**
- Create: `packages/core/src/ui/lib/bottom-sheet.tsx`

This is an **internal** component (not exported to consumers). Built on the same `@primitives/react-dialog` that Dialog and Sheet use, so it gets focus trap, scroll lock, Escape key, and `aria-modal` for free.

Key features:
- Radix Dialog underneath (focus trap, scroll lock, Escape dismiss, body scroll lock)
- Slide-up animation via framer-motion
- Drag handle (32x4px rounded bar)
- Swipe-to-dismiss via framer-motion `drag="y"` (30% threshold or >500px/s velocity)
- Snap points: half-screen (50vh) and full-screen (85vh)
- `prefers-reduced-motion` support

```tsx
'use client'

import * as React from 'react'
import * as DialogPrimitive from '@primitives/react-dialog'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { tweens } from './motion'

export interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  /** Show drag handle bar at top. @default true */
  dragHandle?: boolean
  /** Allow swipe-to-dismiss. @default true */
  swipeable?: boolean
  /** Title for accessibility (sets aria-label on the dialog). */
  title?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  className,
  dragHandle = true,
  swipeable = true,
  title,
}: BottomSheetProps) {
  const isReduced = useReducedMotion()
  const sheetRef = React.useRef<HTMLDivElement>(null)

  const handleDragEnd = React.useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      const sheetHeight = sheetRef.current?.getBoundingClientRect().height ?? 300
      if (info.offset.y > sheetHeight * 0.3 || info.velocity.y > 500) {
        onOpenChange(false)
      }
    },
    [onOpenChange],
  )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Backdrop */}
            <DialogPrimitive.Overlay forceMount asChild>
              <motion.div
                className="fixed inset-0 z-modal bg-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={tweens.fade}
              />
            </DialogPrimitive.Overlay>

            {/* Sheet panel */}
            <DialogPrimitive.Content
              forceMount
              asChild
              aria-label={title}
            >
              <motion.div
                ref={sheetRef}
                className={cn(
                  'fixed inset-x-0 bottom-0 z-modal max-h-[85vh] overflow-y-auto rounded-t-ds-xl border-t border-surface-border-strong bg-surface-overlay shadow-overlay outline-none',
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
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
```

**Key audit fixes applied:**
- Uses Radix Dialog (not standalone) — focus trap, scroll lock, Escape, body scroll lock all handled
- `PanInfo` type replaced with inline `{ offset: { y: number }; velocity: { y: number } }` (PanInfo not exported in framer-motion v12)
- `onOpenChange` callback instead of `onClose` (matches Radix pattern)
- `aria-label` via `title` prop for screen readers
- `outline-none` on content (Radix requires it for focus management)

Commit: `feat: add internal BottomSheet primitive built on Radix Dialog`

---

## Task 4: Dialog — fullScreen on Mobile with Slide-Up

**Files:**
- Modify: `packages/core/src/ui/dialog.tsx`

Read the full file. `DialogContent` currently renders as a centered modal at `fixed left-[50%] top-[50%]`.

**Changes:**

1. Import `useIsMobile` from `../hooks/use-mobile`
2. Add `responsive?: boolean` (default `true`) to `DialogContentProps` (extend the existing type)
3. In the `DialogContent` component:
   - `const isMobile = responsive !== false ? useIsMobile() : false`
   - Change className on the `motion.div` to use responsive breakpoints:
     ```tsx
     className={cn(
       'fixed z-modal grid w-full gap-ds-05 bg-surface-overlay p-ds-06',
       responsive
         ? // Mobile: fullscreen. Desktop: centered modal
           'inset-0 md:inset-auto md:left-[50%] md:top-[50%] md:max-w-lg md:rounded-ds-xl md:border md:border-surface-border-strong md:shadow-overlay'
         : // Always desktop layout
           'left-[50%] top-[50%] max-w-lg rounded-ds-xl border border-surface-border-strong shadow-overlay',
       className,
     )}
     ```
   - Change the framer-motion animation based on `isMobile`:
     ```tsx
     initial={isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
     animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
     exit={isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
     ```

4. On mobile fullscreen, the close button positioning (`absolute right-ds-05 top-ds-05`) already works.

Commit: `feat(mobile): Dialog auto-fullScreen with slide-up on mobile`

---

## Task 5: Sheet/Popover Context — Thread onClose

**Files:**
- Modify: `packages/core/src/ui/sheet.tsx`
- Modify: `packages/core/src/ui/popover.tsx`

**Prerequisite for Tasks 6 and 7.** Both Sheet and Popover need their content components to be able to close the overlay (for swipe-to-dismiss on mobile).

**Sheet:**
1. Change `SheetOpenContext` from `React.createContext(false)` to:
   ```tsx
   const SheetOpenContext = React.createContext<{ open: boolean; onClose: () => void }>({ open: false, onClose: () => {} })
   ```
2. In the `Sheet` root component, update the provider value:
   ```tsx
   const contextValue = React.useMemo(() => ({ open, onClose: () => handleOpenChange(false) }), [open, handleOpenChange])
   <SheetOpenContext.Provider value={contextValue}>
   ```
3. Update all `React.useContext(SheetOpenContext)` consumers to destructure `{ open }` or `{ open, onClose }`.

**Popover:**
1. Change `PopoverOpenContext` from `React.createContext(false)` to:
   ```tsx
   const PopoverOpenContext = React.createContext<{ open: boolean; onClose: () => void }>({ open: false, onClose: () => {} })
   ```
2. Same provider update pattern as Sheet.
3. Update `PopoverContent` consumer to destructure.

Commit: `refactor: thread onClose through Sheet and Popover contexts`

---

## Task 6: Sheet — Bottom Sheet on Mobile with Swipe

**Files:**
- Modify: `packages/core/src/ui/sheet.tsx`

Read the full file (after Task 5 changes). `SheetContent` has `side` prop with CVA variants.

**Changes:**

1. Import `useIsMobile` from `../hooks/use-mobile`
2. Add `responsive?: boolean` (default `true`) to `SheetContentProps`
3. In `SheetContent`:
   - `const isMobile = responsive !== false ? useIsMobile() : false`
   - `const { open, onClose } = React.useContext(SheetOpenContext)`
   - `const effectiveSide = isMobile ? 'bottom' : (side ?? 'right')`
   - Use `effectiveSide` for both CVA variant and slide direction
   - When mobile, add drag handle and swipe-to-dismiss:
     ```tsx
     drag={isMobile ? 'y' : false}
     dragConstraints={{ top: 0 }}
     dragElastic={0.2}
     onDragEnd={(_, info) => {
       const h = ref.current?.getBoundingClientRect().height ?? 300
       if (info.offset.y > h * 0.3 || info.velocity.y > 500) onClose()
     }}
     ```
   - Add drag handle before children when mobile:
     ```tsx
     {isMobile && (
       <div className="flex justify-center pt-ds-03 pb-ds-02">
         <div className="h-1 w-8 rounded-ds-full bg-surface-border" />
       </div>
     )}
     ```

Commit: `feat(mobile): Sheet auto-bottom with swipe-to-dismiss on mobile`

---

## Task 7: Popover — Bottom Drawer on Mobile

**Files:**
- Modify: `packages/core/src/ui/popover.tsx`

Read the full file (after Task 5 changes). `PopoverContent` renders as floating div via Radix.

**Changes:**

1. Import `useIsMobile` from `../hooks/use-mobile`
2. Import `BottomSheet` from `./lib/bottom-sheet`
3. In `PopoverContent`:
   - `const isMobile = useIsMobile()`
   - `const { open, onClose } = React.useContext(PopoverOpenContext)`
   - If mobile, return BottomSheet instead of Radix Popover:
     ```tsx
     if (isMobile) {
       return (
         <BottomSheet open={open} onOpenChange={(v) => { if (!v) onClose() }} title="Menu">
           {children}
         </BottomSheet>
       )
     }
     // else: existing Radix Popover rendering
     ```
   - Note: BottomSheet creates its own Radix Dialog portal, so the Radix Popover portal is not used on mobile.

Commit: `feat(mobile): Popover renders as bottom drawer on mobile`

---

## Task 8: Deprecate ResponsiveOverlay

**Files:**
- Modify: `packages/core/src/composed/responsive-overlay.tsx`

Now that Dialog and Sheet are individually mobile-aware, `ResponsiveOverlay` is redundant. Add a JSDoc deprecation notice:

```tsx
/**
 * @deprecated Dialog and Sheet now auto-adapt to mobile viewports.
 * Use `<Dialog>` directly — it fullScreens on mobile.
 * Use `<Sheet>` directly — it becomes a bottom sheet on mobile.
 * This component will be removed in a future major version.
 */
```

Don't delete it — consumers may still use it. Just mark deprecated.

Commit: `deprecate: ResponsiveOverlay — Dialog and Sheet are now individually mobile-aware`

---

## Task 9: Tests for Mobile Responsiveness

**Files:**
- Create: `packages/core/src/ui/lib/__tests__/bottom-sheet.test.tsx`
- Create: `packages/core/src/ui/__tests__/mobile-responsive.test.tsx`

**BottomSheet tests:**
- Renders when open, not when closed
- Backdrop renders with overlay class
- Drag handle visible by default, hidden when `dragHandle={false}`
- Has `role="dialog"` and `aria-modal="true"` (from Radix Dialog)
- Escape key closes (from Radix Dialog)
- `axe: toHaveNoViolations()`

Note: `useIsMobile()` needs `window.matchMedia` mock — the existing mock in test-setup.ts handles this. For testing swipe gestures, framer-motion drag is not testable in jsdom — add a comment noting this limitation.

**Dialog responsive tests:**
- Check that responsive Dialog renders with `md:` breakpoint classes
- Check that `responsive={false}` renders desktop classes only
- `axe: toHaveNoViolations()`

Commit: `test: add BottomSheet and Dialog responsive tests`

---

## Task 10: Stories for Mobile Components

**Files:**
- Create: `packages/core/src/ui/lib/bottom-sheet.stories.tsx`
- Modify: `packages/core/src/ui/dialog.stories.tsx` — add MobileFullScreen story
- Modify: `packages/core/src/ui/sheet.stories.tsx` — add MobileBottomSheet story
- Modify: `packages/core/src/ui/popover.stories.tsx` — add MobileDrawer story

Each mobile story should use viewport parameter:
```tsx
parameters: { viewport: { defaultViewport: 'mobile1' } }
```

Commit: `docs: add mobile responsive stories for BottomSheet, Dialog, Sheet, Popover`

---

## NOT in this plan (deferred)

- **Select mobile bottom drawer** — Radix Select manages its own focus/positioning/scroll internally. Wrapping Viewport in BottomSheet breaks Radix internals. Needs a design spike with a concrete approach (likely rendering SelectItems inside a Radix Dialog on mobile, fully bypassing SelectContent). Deferred to follow-up.
- **Snap points** — Half-screen/full-screen snap points for BottomSheet. The current implementation dismisses on 30% drag or snaps back. Full snap point support (animate to 50vh or 85vh) requires additional framer-motion constraint logic. Can be added as enhancement without API changes.
- **DropdownMenu/ContextMenu mobile** — Design doc doesn't scope these. Can be added later following the Popover pattern.

---

## Execution Strategy

| Round | Tasks | Parallel? |
|-------|-------|-----------|
| 1 | Task 1 (touch utility) → Task 2 (touch targets) | Sequential |
| 2 | Task 3 (BottomSheet) → Task 5 (context threading) | Sequential |
| 3 | Task 4 (Dialog), Task 6 (Sheet), Task 7 (Popover), Task 8 (deprecate) | Parallel (different files) |
| 4 | Task 9 (tests), Task 10 (stories) | Parallel |
