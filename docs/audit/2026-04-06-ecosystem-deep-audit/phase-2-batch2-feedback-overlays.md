# Phase 2 Batch 2: Feedback & Overlays Audit

**Date:** 2026-04-06
**Auditor:** Claude Opus 4.6 (automated deep audit)
**Scope:** 13 components -- Alert, AlertDialog, Banner, Dialog, Sheet, Popover, Tooltip, HoverCard, Toast, Toaster, DropdownMenu, ContextMenu, Menubar

## Summary Table

| # | Component | WCAG 2.2 | APG Keyboard | API/DX | Tests | Bundle/SSR | Docs | Overall |
|---|-----------|----------|--------------|--------|-------|------------|------|---------|
| 1 | Alert | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 2 | AlertDialog | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 3 | Banner | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 4 | Dialog | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 5 | Sheet | PASS | PASS | PASS | CONCERN | CONCERN | PASS | Good |
| 6 | Popover | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 7 | Tooltip | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 8 | HoverCard | PASS | FAIL | PASS | PASS | CONCERN | PASS | Needs fix |
| 9 | Toast | CONCERN | PASS | PASS | PASS | CONCERN | PASS | Needs fix |
| 10 | Toaster | PASS | PASS | PASS | CONCERN | CONCERN | PASS | Acceptable |
| 11 | DropdownMenu | PASS | PASS | PASS | CONCERN | CONCERN | PASS | Needs tests |
| 12 | ContextMenu | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |
| 13 | Menubar | PASS | PASS | PASS | PASS | CONCERN | PASS | Good |

**Legend:** PASS = meets criteria, CONCERN = minor issue, FAIL = significant gap

---

## 1. Alert

**File:** `packages/core/src/ui/alert.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | `role="alert"` for screen reader announcements. Dismiss button has `min-h-ds-xs min-w-ds-xs` (24x24px) meeting target size. `focus-visible:ring-2 focus-visible:ring-accent-9` on dismiss button. Text colors use semantic tokens (info-11, success-11, etc.) mapped to accessible contrast. |
| APG Keyboard | PASS | Alert is non-interactive (informational). Dismiss button is a native `<button>` with keyboard access. No trap needed. |
| API/DX | PASS | `React.forwardRef`, `displayName` set, `className` + `cn()`, CVA variants (variant/color/size), props spread via `motionProps()`, types exported (`AlertProps`). Compound pattern not needed. |
| Tests | PASS | 26 tests covering: role="alert", children, title, CVA variants (subtle/filled/outline x all colors), dismiss click+callback, size classes (sm/md/lg), ref forwarding, className merge. axe violations checked for all 4 colors + dismissible. |
| Bundle/SSR | CONCERN | No `@server-safe` annotation. Has `'use client'` directive. Uses framer-motion so correctly client-only. |
| Docs | PASS | Story with `autodocs`+`stable` tags. JSDoc with usage examples. |

**Reduced motion:** Framer Motion's `AnimatePresence` exit animation (`opacity: 0, y: -8`) is NOT explicitly gated with `motion-safe` or `useReducedMotion`. Framer Motion v10+ respects `prefers-reduced-motion` globally by reducing animations to instant transitions, so this is acceptable but not explicit.

**Issues:**
- (Minor) No explicit `prefers-reduced-motion` handling -- relies on Framer Motion's built-in behavior, which is acceptable.

---

## 2. AlertDialog

**File:** `packages/core/src/ui/alert-dialog.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Radix AlertDialog primitive provides `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` (via AlertDialogTitle), `aria-describedby` (via AlertDialogDescription). Focus ring on Action/Cancel buttons via `focus-visible:ring-2`. Action button has `h-ds-md` height (meets target size). |
| APG Keyboard | PASS | Radix primitive provides: focus trap, Escape close (prevented by default in alertdialog -- user must click action/cancel), focus restore to trigger, `aria-modal`. Verified in vendored `react-alert-dialog.js` and `react-dialog.js` (FocusScope, `role="alertdialog"`). |
| API/DX | PASS | `forwardRef` on all sub-components (Content, Header, Footer, Title, Description, Action, Cancel). `displayName` set on all. `className` + `cn()`. Types exported (`AlertDialogContentProps`, `AlertDialogActionProps`, `AlertDialogCancelProps`). Full compound pattern. |
| Tests | PASS | 8 tests: trigger render, closed state, open on click, action/cancel handlers, controlled open, className merge, axe violations. |
| Bundle/SSR | CONCERN | No `@server-safe` annotation. `'use client'` present. Correct for client-only modal. |
| Docs | PASS | Story with `autodocs`+`stable`. Demonstrates standard AlertDialog pattern. |

**Issues:** None.

---

## 3. Banner

**File:** `packages/core/src/ui/banner.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | `role="alert"`. Dismiss button has `min-h-ds-xs min-w-ds-xs` (24x24px). `focus-visible:ring-2 focus-visible:ring-accent-9`. `aria-label="Dismiss"`. |
| APG Keyboard | PASS | Banner is informational. Dismiss and action buttons are native `<button>` elements, keyboard accessible by default. |
| API/DX | PASS | `forwardRef`, `displayName`, `className` + `cn()`, CVA. `actions` slot (plural) replaces deprecated `action` prop. Types exported (`BannerProps`). |
| Tests | PASS | 9 tests in `banner.test.tsx` + 7 in `banner-a11y.test.tsx`: role, children, color variants, dismiss button presence/click, actions/action slots, deprecated prop fallback, className merge, axe violations for all colors + dismissible + actions. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. |

**Issues:** None.

---

## 4. Dialog

**File:** `packages/core/src/ui/dialog.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Radix Dialog primitive provides `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (auto-linked to DialogTitle). Close button has `min-h-ds-xs min-w-ds-xs` (24x24px). `focus-visible:ring-2`. `<span className="sr-only">Close</span>` for accessible label. Overlay uses `bg-overlay`. Content uses `bg-surface-overlay`. |
| APG Keyboard | PASS | Radix Dialog provides: FocusScope (focus trap), Escape to close, focus restore to trigger. Verified `FocusScope` import and `role: "dialog"`, `aria-labelledby: context.titleId` in vendored primitive. |
| API/DX | PASS | `forwardRef` on all parts. `displayName` on all. `className` + `cn()`. `DialogContentRaw` export for advanced use (e.g., CommandPalette). Types exported. Full compound pattern with 11 exports. |
| Tests | PASS | 4 tests in `dialog.test.tsx` + 1 in `dialog-a11y.test.tsx`: trigger, closed state, open+content, close button, axe violations. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. Comprehensive JSDoc with compound pattern documentation. |

**Issues:**
- (Minor) Tests could be more comprehensive -- no Escape key test, no focus trap test, no focus restore test. These behaviors are handled by Radix primitives, but explicit test coverage would catch regressions if the vendored primitives are updated.

---

## 5. Sheet

**File:** `packages/core/src/ui/sheet.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Built on Radix Dialog primitive -- inherits `role="dialog"`, `aria-modal`, `aria-labelledby`. Close button: `min-h-ds-xs min-w-ds-xs` (24x24px), `focus-visible:ring-2`, `<span className="sr-only">Close</span>`. Side variants for all 4 edges. |
| APG Keyboard | PASS | Same as Dialog: focus trap, Escape close, focus restore. Built on `@primitives/react-dialog`. |
| API/DX | PASS | `forwardRef` on all parts. `displayName`. `className` + `cn()`. CVA for side variants. Types exported (`SheetContentProps`). Full compound pattern with 10 exports. |
| Tests | CONCERN | Only 1 test (axe violations in open state with title/description) in `sheet-a11y.test.tsx`. No co-located `.test.tsx`. Missing: trigger click open, side variants, close button, Escape key, className merge, ref forwarding. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. Comprehensive JSDoc. |

**Issues:**
- **Test coverage is thin.** Sheet has only 1 axe test. Needs: trigger opens sheet, content visible, close button works, side variants render correct classes, className merge, controlled state.

---

## 6. Popover

**File:** `packages/core/src/ui/popover.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Radix Popover primitive. Content has `outline-none` (focus management handled by Radix). `bg-surface-overlay`, `shadow-floating`. No focus trap (correct -- popover is non-modal). |
| APG Keyboard | PASS | Radix Popover provides: non-modal behavior, Escape to close, focus returns to trigger. No focus trap (correct for popover). Click outside closes. |
| API/DX | PASS | `forwardRef` on PopoverContent. `displayName`. `className` + `cn()`. `PopoverAnchor` exported. Types exported (`PopoverContentProps`). |
| Tests | PASS | 7 tests in `popover.test.tsx` + 2 in `popover-a11y.test.tsx`: trigger, closed state, open click, toggle (onOpenChange true/false), controlled open, className merge, axe violations. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. |

**Issues:** None.

---

## 7. Tooltip

**File:** `packages/core/src/ui/tooltip.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Radix Tooltip provides `role="tooltip"` on content. Inverted color scheme (`bg-surface-inverted`, `text-surface-inverted-fg`) for high contrast. AutoProvider wraps with `delayDuration={300}` for accessibility. |
| APG Keyboard | PASS | Radix Tooltip provides: appears on focus (keyboard accessible via trigger focus), Escape to dismiss, NOT keyboard-focusable itself (correct). `delayDuration={300}` default. Tooltip is NOT a focus trap. |
| API/DX | PASS | `forwardRef` on TooltipContent. `displayName`. `className` + `cn()`. `AutoProvider` auto-wraps in TooltipProvider if none exists (DX improvement). `TooltipProvider` exported for explicit control. Types exported. |
| Tests | PASS | 7 tests in `tooltip.test.tsx` + 1 in `tooltip-a11y.test.tsx`: trigger, closed by default, controlled open, explicit provider, className merge, side prop, default offset, axe violations. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. |

**Issues:** None.

---

## 8. HoverCard

**File:** `packages/core/src/ui/hover-card.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Content styled with `bg-surface-overlay`, `shadow-floating`, `outline-none`. |
| APG Keyboard | **FAIL** | HoverCard is **pointer-only by design** (Radix HoverCard has no keyboard/focus activation). The Radix primitive has no `onKeyDown`, no focus handlers -- it is purely `pointerEnter`/`pointerLeave` driven. This means keyboard-only users cannot access the hover card content at all. Per WCAG 2.1.1 (Keyboard) and APG guidance, supplementary information must be accessible via keyboard. The trigger is typically a link (`<a>`), so the link itself is keyboard accessible, but the hover card content is not reachable. |
| API/DX | PASS | `forwardRef` on HoverCardContent. `displayName`. `className` + `cn()`. Controlled/uncontrolled state. Types exported (`HoverCardContentProps`). |
| Tests | PASS | 7 tests in `hover-card.test.tsx` + 2 in `hover-card-a11y.test.tsx`: trigger, closed by default, controlled open, pointerEnter, onOpenChange callback, className merge, defaultOpen, axe violations. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. |

**Issues:**
- **CRITICAL: Keyboard inaccessible.** HoverCard content is only reachable via pointer hover. Keyboard-only users and screen reader users cannot access this supplementary content. This is a known limitation of the Radix HoverCard primitive. **Recommendation:** Document that HoverCard must only be used for *supplementary, non-essential* information (decoration, preview), and the trigger itself must contain or link to all essential content. If essential info is in the hover card, use Popover instead. Consider adding a note to the component JSDoc and story.

---

## 9. Toast / ToastContent

**File:** `packages/core/src/ui/toast.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | **CONCERN** | Toast renders `role="status"` and `aria-live="polite"` (correct). Timer bar uses `motion-safe:animate-timer-bar` (good -- respects reduced motion). However, **UploadFileRow retry/cancel buttons are only `h-4 w-4` (16x16px)**, which fails WCAG 2.5.8 Target Size (24x24px minimum). Action buttons in ToastContent have proper padding (`px-ds-02 py-ds-01`) which may meet the sparse spacing exception, but the upload row buttons are compact without sufficient padding. |
| APG Keyboard | PASS | `role="status"` with `aria-live="polite"` (correct for non-urgent notifications). Self-managed dismiss timer pauses on hover via `onMouseEnter`/`onMouseLeave`. Action and cancel buttons are native `<button>` elements. Upload toast has `aria-label="File uploads"` and a `sr-only` live region for progress announcements. |
| API/DX | PASS | Imperative API (`toast()`, `toast.success()`, `toast.error()`, etc.). `toast.promise()` for async operations. `toast.undo()` for undo patterns. `toast.upload()` for file uploads. `toast.custom()` for arbitrary content. `toast.dismiss()` for programmatic dismissal. All internal components exported for testing (`ToastContent`, `UploadToastContent`, `UploadFileRow`, `TimerBar`, `formatFileSize`). Types re-exported from `toast-types.ts`. |
| Tests | PASS | 31 tests across rendering (6), accessibility (3), action buttons (3), upload toast (8), UploadFileRow (4), timer bar (4), formatFileSize (7), dismiss (1), undo (1). Covers: role/aria-live, axe violations, action click handlers, upload file states, progress display, retry/cancel callbacks, timer bar pause, file size formatting. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. Imports from `sonner`. |
| Docs | PASS | Story with `autodocs`+`stable`. Comprehensive JSDoc on `toast()` API. |

**Issues:**
- **Upload file row buttons are 16x16px** (`h-4 w-4`). Should be at minimum `min-h-ds-xs min-w-ds-xs` (24x24px) or have sufficient padding to meet target size.
- Toast dismiss timer pauses on hover but not on keyboard focus -- the `onMouseEnter`/`onMouseLeave` handlers don't have `onFocus`/`onBlur` equivalents. Keyboard users who Tab into a toast action button won't pause the timer. (Note: focus *does* pause in the ToastContent via `onMouseEnter`, but it should also pause on `onFocusCapture`/`onBlurCapture`.)

---

## 10. Toaster

**File:** `packages/core/src/ui/toaster.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Wraps Sonner `Toaster` with design system styling. `z-toast` z-index token. Default `hotkey` is `['altKey', 'KeyT']` for keyboard access to toast region. |
| APG Keyboard | PASS | Sonner provides keyboard navigation within toast region. Hotkey provides keyboard shortcut to focus region. |
| API/DX | PASS | `forwardRef`. `displayName`. `className`. Clean props interface (`ToasterProps`) with sensible defaults (position, closeButton, duration, hotkey, visibleToasts). |
| Tests | CONCERN | Only 4 tests: renders, className, ref forwarding, position prop. No integration test with actual toast rendering (those are in `toast.test.tsx`). No axe test on the Toaster itself. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. Imports from `sonner`. |
| Docs | PASS | Story with `autodocs`+`stable`. Clear JSDoc with root layout example. |

**Issues:**
- (Minor) No axe test on the Toaster wrapper itself.

---

## 11. DropdownMenu

**File:** `packages/core/src/ui/dropdown-menu.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Radix DropdownMenu primitives provide correct ARIA roles: `role="menu"` on content, `role="menuitem"` on items, `role="menuitemcheckbox"` on checkbox items, `role="menuitemradio"` on radio items. Focus indicators via `focus:bg-surface-raised`. Disabled items have `data-[disabled]:pointer-events-none data-[disabled]:opacity-action-disabled`. |
| APG Keyboard | PASS | Radix menu primitive provides: Enter/Space to open, arrow key navigation, typeahead search, Escape to close, submenu support (ArrowRight to open sub, ArrowLeft to close), Home/End navigation. Verified `role: "menu"`, `role: "menuitem"` in vendored `react-menu.js`. |
| API/DX | PASS | `forwardRef` on all content sub-components. `displayName` on all. `className` + `cn()`. `inset` prop for indented items. Full compound pattern with 16 exports. Types exported. Sub-menu support with animated content. |
| Tests | **CONCERN** | Only 2 tests in `dropdown-menu-a11y.test.tsx` (axe in closed/open state). **No co-located `.test.tsx` file.** Missing: trigger click opens menu, item click fires onSelect, keyboard navigation, checkbox items, radio items, submenu interaction, disabled items, shortcut rendering, className merge. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. Comprehensive JSDoc with compound pattern docs. |

**Issues:**
- **Test coverage is critically thin.** DropdownMenu has only 2 axe tests. It needs a full co-located test file matching the ContextMenu test pattern (which has 11 tests covering trigger, content, items, disabled, onSelect, shortcuts, checkbox, radio, submenu, axe).

---

## 12. ContextMenu

**File:** `packages/core/src/ui/context-menu.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Same Radix menu primitives as DropdownMenu. Correct ARIA roles. Focus indicators. Disabled states. |
| APG Keyboard | PASS | Radix ContextMenu: right-click to open (contextmenu event), arrow navigation, typeahead, Escape to close, submenu support. Note: Shift+F10 support depends on browser native context menu behavior -- Radix ContextMenu uses the DOM `contextmenu` event which fires on Shift+F10. |
| API/DX | PASS | Same pattern as DropdownMenu. `forwardRef` on all parts. `displayName`. Full compound pattern with 16 exports. Types exported. |
| Tests | PASS | 11 tests: trigger, closed state, contextmenu opens, label, disabled items, onSelect, shortcuts, checkbox items, radio items, submenu, axe violations. Good coverage. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. |

**Issues:** None. This is the gold standard that DropdownMenu tests should follow.

---

## 13. Menubar

**File:** `packages/core/src/ui/menubar.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| WCAG 2.2 | PASS | Radix Menubar primitive provides `role="menubar"` on root, `role="menuitem"` on triggers, `role="menu"` on content. Focus indicators via `focus-visible:bg-surface-raised-hover` on triggers and `focus:bg-surface-raised` on items. |
| APG Keyboard | PASS | Radix Menubar provides: Left/Right between menu triggers, Up/Down within menu content, Enter/Space to open, Escape to close, Home/End, typeahead. Verified `role: "menubar"`, `role: "menuitem"` in vendored `react-menubar.js`. |
| API/DX | PASS | `forwardRef` on root and all sub-components. `displayName`. `className` + `cn()`. `inset` prop. Full compound pattern with 16 exports. Types exported. |
| Tests | PASS | 10 tests: trigger rendering, closed state, click opens, label text, disabled items, onSelect, shortcuts, checkbox items, className merge, axe violations. |
| Bundle/SSR | CONCERN | No `@server-safe`. `'use client'` present. |
| Docs | PASS | Story with `autodocs`+`stable`. |

**Issues:**
- (Minor) MenubarContent does not use AnimatePresence for exit animation -- it uses `MenubarPrimitive.Portal` directly with a `motion.div` for enter animation, but has no controlled exit path. This means the menu content will snap-disappear instead of animating out. This is a minor visual inconsistency with DropdownMenu/ContextMenu which both have animated exits via AnimatePresence. The comment in source acknowledges this limitation ("MenubarMenu doesn't expose open/onOpenChange").

---

## Cross-Cutting Findings

### 1. Reduced Motion (applies to ALL 13 components)
All animated overlay components (AlertDialog, Dialog, Sheet, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Menubar) use Framer Motion for entry/exit animations. **None of them explicitly gate animations with `useReducedMotion()` or `motion-safe:` Tailwind utilities.** They rely entirely on Framer Motion v10+'s built-in `prefers-reduced-motion` behavior, which automatically reduces spring/tween animations to instant transitions when the OS setting is enabled.

**Verdict:** This is acceptable because Framer Motion handles it globally. However, for explicitness and defensive coding, the `motion.ts` utility has a `withReducedMotion()` helper that is unused by any of these components.

The one exception is the Toast timer bar, which correctly uses `motion-safe:animate-timer-bar` (CSS animation, not Framer Motion).

### 2. `@server-safe` Annotations
**None of the 13 components have `@server-safe` annotations.** All have `'use client'` directives. This is correct -- all of these components use Framer Motion and/or Radix primitives which require client-side JavaScript. The `@server-safe` annotation would be wrong here.

### 3. Surface Layering
All overlay content panels use `bg-surface-overlay` (Dialog, AlertDialog, Sheet, Popover, DropdownMenu, ContextMenu, Menubar). HoverCard and Tooltip also use `bg-surface-overlay` and `bg-surface-inverted` respectively. Alert and Banner use semantic color backgrounds. All comply with the surface layering rules.

---

## Priority Issues (sorted by severity)

### HIGH
1. **HoverCard keyboard inaccessibility** -- Pointer-only activation. Document limitation prominently; consumers must only use for supplementary non-essential info.
2. **DropdownMenu has no functional tests** -- Only 2 axe tests. Needs full test coverage following ContextMenu pattern.
3. **Sheet has minimal tests** -- Only 1 axe test. Needs trigger/content/close/side tests.

### MEDIUM
4. **Toast UploadFileRow buttons too small** -- Retry/cancel buttons are 16x16px (`h-4 w-4`), should be 24x24px minimum per WCAG 2.5.8.
5. **Toast timer doesn't pause on keyboard focus** -- Only pauses on `mouseEnter`, should also pause on `focusCapture`/`blurCapture` for keyboard users interacting with action buttons.

### LOW
6. **MenubarContent lacks exit animation** -- Snaps closed instead of animating out, inconsistent with DropdownMenu/ContextMenu.
7. **Dialog tests lack keyboard coverage** -- No Escape key, focus trap, or focus restore tests (behavior is from Radix primitives but should have regression tests).
