# Phase 2 — Batch 4: Navigation & Layout Components

**Date:** 2026-04-06
**Scope:** 21 components — navigation, buttons, icons, layout primitives, disclosure
**Auditor:** Claude Code (automated deep audit)

---

## Summary Table

| # | Component | A. WCAG | B. Keyboard/APG | C. API/DX | D. Tests | E. Bundle/SSR | F. Docs | Verdict |
|---|-----------|---------|-----------------|-----------|----------|---------------|---------|---------|
| 1 | Breadcrumb | **P** | **P** | **P** | **F** — no test file | **P** | **P** | C |
| 2 | Tabs | **P** | **P** | **P** | **C** — no axe, no keyboard tests | **P** | **P** | C |
| 3 | Pagination | **P** | **P** | **P** | **P** | **P** | **P** | P |
| 4 | NavigationMenu | **P** | **P** | **P** | **C** — no keyboard tests | **P** | **P** | C |
| 5 | Link | **P** | **P** | **P** | **F** — no test file | **P** | **P** | C |
| 6 | Button | **P** | **P** | **P** | **C** — no axe test | **P** | **P** | C |
| 7 | ButtonGroup | **P** | **P** | **P** | **C** — no axe test | **P** | **P** | C |
| 8 | ButtonProcessing | **P** | N/A | **C** — no displayName, no forwardRef | **F** — no test file | **P** | **F** — no story | F |
| 9 | IconButton | **P** | **P** | **P** | **P** | **P** | **P** | P |
| 10 | Icon | **P** | N/A | **P** | **P** | **P** | **P** | P |
| 11 | IconContext | **P** | N/A | **P** | **F** — no test file | **P** | **F** — no story | F |
| 12 | IconGroup | **P** | **P** | **C** — no forwardRef | **P** | **P** | **F** — no story | C |
| 13 | Container | **P** | N/A | **P** | **P** | **P** | **P** | P |
| 14 | Stack | **P** | N/A | **P** | **P** | **P** | **P** | P |
| 15 | Separator | **P** | N/A | **P** | **P** | **P** | **P** | P |
| 16 | Text | **P** | N/A | **P** | **P** | **P** | **P** | P |
| 17 | VisuallyHidden | **P** | N/A | **P** | **C** — no axe test | **P** | **P** | C |
| 18 | AspectRatio | **P** | N/A | **P** | **P** | **P** | **P** | P |
| 19 | Collapsible | **P** | **P** | **P** | **P** | **P** | **P** | P |
| 20 | Stepper | **C** — no aria on step states | **C** — no keyboard nav | **P** | **C** — no axe, no a11y assertions | **P** | **P** | C |
| 21 | Sidebar | **F** — no landmark role | **P** | **P** | **C** — minimal, no axe, no keyboard | **P** | **P** | F |

**Legend:** P = Pass, C = Concern, F = Fail

**Totals:** 10 Pass, 8 Concern, 3 Fail (ButtonProcessing, IconContext, Sidebar)

---

## Per-Component Detail

---

### 1. Breadcrumb (`ui/breadcrumb.tsx`)

**A. WCAG 2.2 AA — PASS**
- Renders `<nav aria-label="breadcrumb">` — correct landmark with label.
- `BreadcrumbPage` has `aria-current="page"` on the last (current) item.
- `BreadcrumbSeparator` has `role="presentation"` + `aria-hidden="true"`.
- `BreadcrumbEllipsis` has `aria-hidden="true"` with sr-only "More" text.
- `BreadcrumbLink` has `focus-visible:ring-2` focus indicator.
- Uses `<ol>` list semantics for the breadcrumb trail — correct.

**B. Keyboard/APG — PASS**
- Breadcrumb APG pattern requires: `<nav aria-label="Breadcrumb">`, `<ol>`, `aria-current="page"` on last. All present.
- Links are naturally focusable via Tab. No special keyboard handling needed for breadcrumb.

**C. API/DX — PASS**
- All sub-components use `forwardRef` + `displayName`.
- `className` + `cn()` on all.
- Props spread via `{...props}`.
- `asChild` via Slot on `BreadcrumbLink`.
- Exports `BreadcrumbProps` and `BreadcrumbLinkProps` types.

**D. Tests — FAIL**
- **No test file exists.** Zero coverage.

**E. Bundle/SSR — PASS**
- `'use client'` directive — correct. Uses Slot, icons, cn — all client-side.

**F. Documentation — PASS**
- Story file: `breadcrumb.stories.tsx` exists.

**Verdict: C** — Excellent component implementation, but zero test coverage is a hard gap.

**Fixes needed:**
- [ ] Create `breadcrumb.test.tsx` with: axe audit, nav landmark assertion, aria-current="page" on BreadcrumbPage, separator aria-hidden, ref forwarding, className merge.

---

### 2. Tabs (`ui/tabs.tsx`)

**A. WCAG 2.2 AA — PASS**
- Built on Radix `@primitives/react-tabs` which provides `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`.
- Focus visible: `focus-visible:ring-2 focus-visible:ring-accent-9` on triggers and content.
- Animations via Framer Motion — respects reduced motion via framer-motion's global `ReducedMotion` support.
- `disabled:opacity-action-disabled` + `disabled:pointer-events-none` for disabled state.

**B. Keyboard/APG — PASS**
- Radix Tabs primitive uses `RovingFocusGroup` — confirmed in vendored source. Arrow keys navigate between tabs, roving tabindex is managed.
- Tab/Shift+Tab moves focus into/out of the tab list. Left/Right arrows move between tabs.
- `aria-selected` managed by Radix primitive.

**C. API/DX — PASS**
- `forwardRef` on Tabs, TabsList, TabsTrigger, TabsContent.
- `displayName` set on all.
- CVA for variant/size axis via `tabsListVariants` and `tabsTriggerVariants`.
- Context propagation (variant from TabsList to TabsTrigger).
- Exports `TabsProps`, `TabsListProps`, `TabsTriggerProps`, `TabsContentProps`, `TabsSize`, `TabsColor`.

**D. Tests — CONCERN**
- Tests cover: rendering, click switching, aria-selected, size classes, color classes.
- **Missing:** No `axe()` / `toHaveNoViolations()` test.
- **Missing:** No keyboard navigation test (arrow keys between tabs).
- **Missing:** No test for disabled tab behavior.
- **Missing:** No ref forwarding test.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Radix primitive, framer-motion, React context — all client-side.

**F. Documentation — PASS**
- Story file: `tabs.stories.tsx` exists.

**Verdict: C** — Solid implementation via Radix, but test file has meaningful gaps.

**Fixes needed:**
- [ ] Add `axe()` test.
- [ ] Add keyboard navigation test (ArrowRight/ArrowLeft between tabs).
- [ ] Add disabled tab test.
- [ ] Add ref forwarding test.

---

### 3. Pagination (`ui/pagination.tsx`)

**A. WCAG 2.2 AA — PASS**
- `<nav role="navigation" aria-label="pagination">` — correct landmark.
- `aria-current="page"` on active page button.
- Previous/Next have `aria-label="Go to previous/next page"`.
- Disabled state on first/last page boundaries.
- `focus-visible:ring-2` on PaginationLink.
- Ellipsis has `aria-hidden="true"` + sr-only "More pages".
- Target size: `h-ds-sm-plus w-ds-sm-plus` — should meet 24x24 minimum.

**B. Keyboard/APG — PASS**
- Pagination uses native `<button>` elements — Tab navigates between buttons.
- APG pagination pattern does not require arrow key navigation (that's for tab-like patterns).
- Current page clearly indicated via `aria-current="page"`.
- Disabled buttons prevent navigation beyond boundaries.

**C. API/DX — PASS**
- `forwardRef` on all sub-components and `PaginationNav`.
- `displayName` on all.
- `className` + `cn()` merging.
- Props spread.
- `asChild` support on `PaginationLink`.
- Exports types: `PaginationLinkProps`, `PaginationNavProps`.
- Utility `generatePagination` exported for custom layouts.

**D. Tests — PASS**
- `generatePagination` unit tests: 7 cases covering edge conditions.
- `PaginationNav` tests: page rendering, aria-current, click handlers, prev/next, disabled states, boundary behavior, ellipsis, nav landmark, ref forwarding, className merge.
- `axe()` test present.
- 16 tests total — thorough.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Slot, icons — client-side.

**F. Documentation — PASS**
- Story file: `pagination.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 4. NavigationMenu (`ui/navigation-menu.tsx`)

**A. WCAG 2.2 AA — PASS**
- Built on Radix `@primitives/react-navigation-menu` — provides proper role structure.
- `NavigationMenuList` renders with list role.
- `NavigationMenuTrigger` has `focus-visible:ring-2 focus-visible:ring-accent-9`.
- Viewport uses `bg-surface-overlay` — correct surface level for floating content.
- Animations via framer-motion with spring/tween transitions.

**B. Keyboard/APG — PASS**
- Radix NavigationMenu handles keyboard navigation: arrow keys between triggers, Enter/Space to open, Escape to close.
- Content is positioned in a viewport that receives focus appropriately.

**C. API/DX — PASS**
- `forwardRef` on NavigationMenu, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuViewport, NavigationMenuIndicator.
- `displayName` on all (uses primitive displayName).
- `className` + `cn()` on all.
- Props spread.
- Exports `NavigationMenuProps`, `NavigationMenuContentProps`.

**D. Tests — CONCERN**
- Tests cover: trigger rendering, link rendering, content hidden initially, content opens on click, className merge, ref forwarding, list role.
- `axe()` test present.
- **Missing:** No keyboard navigation test (arrow keys between items, Escape to close).
- **Missing:** No test for content close behavior (clicking elsewhere, Escape key).
- 8 tests — adequate but keyboard gaps.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Radix, framer-motion, MutationObserver.

**F. Documentation — PASS**
- Story file: `navigation-menu.stories.tsx` exists.

**Verdict: C** — Good implementation, keyboard test coverage is the gap.

**Fixes needed:**
- [ ] Add keyboard navigation tests.
- [ ] Add Escape-to-close test.

---

### 5. Link (`ui/link.tsx`)

**A. WCAG 2.2 AA — PASS**
- Renders as `<a>` by default — correct semantics.
- Underline decoration for link identification (not just color).
- `focus-visible:ring-2 focus-visible:ring-accent-9` visible focus.
- `rounded-ds-sm` ensures focus ring has visual contrast.
- Color uses `text-accent-11` (designed for WCAG contrast on page backgrounds).

**B. Keyboard/APG — PASS**
- Native `<a>` element — Enter activates. Focusable by Tab.
- `asChild` allows custom routing (Next Link, etc.).

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- `className` + `cn()`.
- Props spread via `{...props}`.
- `asChild` support.
- `inline` prop for display control.
- Exports `LinkProps` type.

**D. Tests — FAIL**
- **No test file exists.** Zero coverage.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Slot (for asChild).

**F. Documentation — PASS**
- Story file: `link.stories.tsx` exists.

**Verdict: C** — Clean, minimal component but zero test coverage.

**Fixes needed:**
- [ ] Create `link.test.tsx` with: renders as anchor, href forwarding, inline/block display, asChild, focus ring, className merge, ref forwarding, axe test.

---

### 6. Button (`ui/button.tsx`)

**A. WCAG 2.2 AA — PASS**
- Uses native `<button>` element (via `motion.button`) — full semantic button behavior.
- `focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2` — visible focus indicator.
- `disabled:pointer-events-none disabled:opacity-action-disabled disabled:cursor-not-allowed disabled:saturate-[0.3]` — proper disabled indication.
- `aria-busy` set during loading state.
- `aria-disabled` used for processing state (preserves focusability).
- Target size: All button sizes from `h-ds-xs-plus` upward — should meet 24x24px minimum.
- Reduced motion: Explicit `useReducedMotion()` from framer-motion in component body; width transition skipped when reduced.

**B. Keyboard/APG — PASS**
- Native `<button>` element inherently handles Enter and Space activation.
- Disabled state prevents click handlers.
- Loading state disables button and sets aria-busy.
- Processing state uses `aria-disabled` + `pointer-events-none` — still focusable but non-interactive.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- Full CVA variant system: variant (solid/soft/outline/ghost/link), color (accent/error/success/warning/neutral), size (12 options), weight, shape.
- Deprecated aliases maintained (default → solid, destructive → solid+error).
- `startIcon`/`endIcon` slots with automatic sizing via IconProvider.
- `loading` + `loadingPosition` (start/end/center).
- `onClickAsync` with automatic loading → success/error state machine.
- `processing` with speed tiers (ambient/working/urgent).
- `fullWidth`, `asChild`, `shape` (default/pill).
- ButtonGroup context inheritance.
- Exports `ButtonProps`, `buttonVariants`.

**D. Tests — CONCERN**
- 35 tests covering: rendering, variants, ref, click, disabled, className, icons, loading states, onClickAsync, sizes, shapes, compact sizes, deprecated aliases, weight, processing state.
- **Missing:** No `axe()` / `toHaveNoViolations()` test.
- **Missing:** No keyboard-specific test (Enter/Space activation).

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses framer-motion, Radix Slot, context, DOM refs.

**F. Documentation — PASS**
- Story file: `button.stories.tsx` exists.

**Verdict: C** — Extensive, well-designed component. Missing axe test is the gap.

**Fixes needed:**
- [ ] Add `axe()` test.
- [ ] Add keyboard activation test (Enter and Space fire onClick).

---

### 7. ButtonGroup (`ui/button-group.tsx`)

**A. WCAG 2.2 AA — PASS**
- `role="group"` on container — correct ARIA role for grouped buttons.
- Visual joining via negative margins and border-radius overrides — maintains individual button focus.

**B. Keyboard/APG — PASS**
- Individual buttons are naturally focusable. Tab navigates between them.
- No special keyboard handling required for a button group (it's not a toolbar).
- Note: Could optionally add `role="toolbar"` + arrow key nav for toolbar pattern, but `role="group"` is also valid.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- Context propagation for variant, color, weight, shape, size.
- `orientation` prop (horizontal/vertical) with correct CSS.
- `className` + `cn()`.
- Exports `ButtonGroupProps`, `useButtonGroup`.

**D. Tests — CONCERN**
- Tests cover: children rendering, group role, orientations, context variant propagation, className merge.
- **Missing:** No `axe()` test.
- **Missing:** No ref forwarding test.
- 6 tests — reasonable but could be more thorough.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses React context.

**F. Documentation — PASS**
- Story file: `button-group.stories.tsx` exists.

**Verdict: C** — Missing axe test.

**Fixes needed:**
- [ ] Add `axe()` test.
- [ ] Add ref forwarding test.

---

### 8. ButtonProcessing (`ui/button-processing.tsx`)

**A. WCAG 2.2 AA — PASS**
- `aria-hidden="true"` on the overlay — correct (decorative animation).
- Respects reduced motion via custom `useReducedMotion` hook — animation stops when reduced motion preferred.
- Purely visual overlay with no semantic content.

**B. Keyboard/APG — N/A**
- Internal component, not directly interactive.

**C. API/DX — CONCERN**
- Not exported from barrel (internal to Button).
- No `displayName` set on `ProcessingOverlay`.
- Not a `forwardRef` component (function component).
- No exported types (only `ProcessingSpeed` exported).
- These are acceptable for an internal component, but `displayName` would help debugging.

**D. Tests — FAIL**
- **No test file exists.** Testing is done indirectly through Button tests, but no direct unit tests for processing overlay behavior, speed mapping, color mapping, or reduced motion.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses framer-motion, DOM APIs.

**F. Documentation — FAIL**
- **No story file.** Internal component, so not critical, but no way to visually review the processing animation independently.

**Verdict: F** — Internal component with no direct tests or stories. While it's tested indirectly through Button, the reduced motion behavior and visual rendering should have direct coverage.

**Fixes needed:**
- [ ] Add basic tests for ProcessingOverlay: reduced motion, color mapping, speed mapping.
- [ ] Consider adding a story to button.stories.tsx showcasing processing states (may already exist).

---

### 9. IconButton (`ui/icon-button.tsx`)

**A. WCAG 2.2 AA — PASS**
- **`aria-label` is required in the TypeScript interface** — `'aria-label': string`. This is enforced at the type level. Critical requirement met.
- Delegates to `<Button>` which provides all focus/disabled styling.
- Target size: Uses `icon-sm/md/lg` sizes from Button — should meet 24x24px.

**B. Keyboard/APG — PASS**
- Delegates to `<Button>` which is a native `<button>` — Enter and Space activate.
- Loading state handled via Button's loading system.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- Clean size mapping: `sm → icon-sm`, `md → icon-md`, `lg → icon-lg`.
- Shape prop: `square` (default) | `circle`.
- Inherits all Button variants/colors.
- Omits non-applicable Button props: `startIcon`, `endIcon`, `fullWidth`, `loadingPosition`, `children`.
- Exports `IconButtonProps`.

**D. Tests — PASS**
- Tests cover: rendering with icon and aria-label, accessible name, circle shape, default square, variant forwarding, size mapping, click events, loading state, ref forwarding.
- `axe()` test present.
- 9 tests — good coverage.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Delegates to Button.

**F. Documentation — PASS**
- Story file: `icon-button.stories.tsx` exists.

**Verdict: P** — Fully compliant. aria-label enforcement at the type level is the gold standard.

---

### 10. Icon (`ui/icon.tsx`)

**A. WCAG 2.2 AA — PASS**
- With `label`: renders `role="img"` + `aria-label` — accessible.
- Without `label`: renders `aria-hidden="true"` — correctly hidden from AT.
- Draw animation provides `role="img"` + `aria-label` when `label` is set.
- Reduced motion: Explicit `useReducedMotion()` check — static render when reduced motion is preferred.

**B. Keyboard/APG — N/A**
- Non-interactive component.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- Size tiers (xs/sm/md/lg/xl/2xl) with pixel mapping.
- Stroke weight tiers (light/regular/bold) with per-size stroke width mapping.
- IconContext integration (reads size/stroke from context).
- Animation presets (spin/pulse/bounce/draw) + custom object.
- State machine (idle/loading/success/error) with Spinner integration.
- Priority: state > animate.
- Exports `IconProps`.

**D. Tests — PASS**
- Tests cover: all 6 size tiers, stroke weights, accessible label (role="img"), aria-hidden (decorative), IconContext inheritance, context override, animation wrappers, state machine (loading/idle), priority rule, axe tests (with and without label).
- 17 tests — thorough.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses framer-motion, context.

**F. Documentation — PASS**
- Story file: `icon.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 11. IconContext (`ui/icon-context.tsx`)

**A. WCAG 2.2 AA — PASS**
- Pure context provider — no rendering, no a11y impact.

**B. Keyboard/APG — N/A**
- Non-interactive context utility.

**C. API/DX — PASS**
- Exports `IconSize`, `IconStroke`, `IconContextValue` types.
- `IconProvider` component with `useMemo` for stable context value.
- `useIconContext` hook for consumers.
- `IconContext` exported for edge cases.

**D. Tests — FAIL**
- **No test file exists.** Context inheritance is tested indirectly through Icon tests, but no direct unit tests for IconProvider/useIconContext behavior.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses React context.

**F. Documentation — FAIL**
- **No story file.** A context provider generally doesn't need a story, but there's no standalone documentation either.

**Verdict: F** — Low-risk internal utility, but zero direct test coverage. The indirect testing via Icon tests partially mitigates this.

**Fixes needed:**
- [ ] Add basic tests: IconProvider provides values, useIconContext reads them, default values when no provider.

---

### 12. IconGroup (`ui/icon-group.tsx`)

**A. WCAG 2.2 AA — PASS**
- `role="toolbar"` + `aria-label` when role is set — correct APG toolbar pattern.
- `aria-label` correctly omitted when no role (avoids misleading AT).
- Inline flex layout with gap options.

**B. Keyboard/APG — PASS**
- When `role="toolbar"`, APG requires arrow key navigation — this is NOT implemented (just a `<div>`). However, the toolbar role is optional and typically used with IconButtons that are individually focusable.
- For non-toolbar usage, just renders an inline container.
- Note: If `role="toolbar"` is set, APG technically requires arrow key roving tabindex. This is a minor concern but not critical since icon buttons inside are individually tabbable.

**C. API/DX — CONCERN**
- **Not `forwardRef`** — function component with no ref forwarding. This breaks the pattern used by all other components.
- Has `displayName`.
- `className` + `cn()`.
- Props: `size`, `stroke`, `gap`, `label`, `role`, `className`, `children`.
- Exports `IconGroupProps`.

**D. Tests — PASS**
- Tests cover: children rendering, gap classes (default/loose/tight), toolbar role with label, no role by default, no aria-label without role, className merge, multiple children.
- `axe()` test present.
- 9 tests — good.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses IconProvider context.

**F. Documentation — FAIL**
- **No story file** (`icon-group.stories.tsx` not found).

**Verdict: C** — Missing forwardRef and no story.

**Fixes needed:**
- [ ] Convert to `forwardRef` pattern.
- [ ] Create `icon-group.stories.tsx`.

---

### 13. Container (`ui/container.tsx`)

**A. WCAG 2.2 AA — PASS**
- Purely layout component — no semantic role (correct, it's a generic container).
- `as` prop allows rendering as `<main>`, `<section>`, etc. for landmark semantics.

**B. Keyboard/APG — N/A**
- Non-interactive layout primitive.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- Polymorphic `as` prop.
- `maxWidth` prop: `default` | `body` | `full`.
- `className` + `cn()`.
- Props spread.
- Exports `ContainerProps`.

**D. Tests — PASS**
- Tests cover: default div, maxWidth variants (default/body/full), base layout classes, as prop (main/section), className merge, ref forwarding, HTML attribute passthrough.
- `axe()` test present.
- 10 tests — thorough.

**E. Bundle/SSR — PASS**
- `// @server-safe` — correct. Pure CSS class component with no hooks/context/effects.

**F. Documentation — PASS**
- Story file: `container.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 14. Stack (`ui/stack.tsx`)

**A. WCAG 2.2 AA — PASS**
- Purely layout component — no semantic concerns.
- `as` prop allows semantic element rendering.

**B. Keyboard/APG — N/A**
- Non-interactive layout primitive.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- Polymorphic `as` prop.
- Direction: `vertical` | `horizontal` | `row` | `column`.
- Gap: accepts token strings (`ds-01` through `ds-13`) and numbers.
- Align, justify, wrap props.
- `className` + `cn()`.
- Exports `StackProps`, `SpacingToken`.

**D. Tests — PASS**
- Tests cover: default div, all directions (vertical/horizontal/row/column), gap with token strings, gap with numbers, align (center/baseline), justify (between/evenly), wrap, as prop (section/ul), className merge, ref forwarding.
- `axe()` test present.
- 14 tests — thorough.

**E. Bundle/SSR — PASS**
- `// @server-safe` — correct. Pure CSS class component.

**F. Documentation — PASS**
- Story file: `stack.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 15. Separator (`ui/separator.tsx`)

**A. WCAG 2.2 AA — PASS**
- Built on Radix `@primitives/react-separator`.
- Decorative (default): `role="none"` — correctly hidden from AT.
- Non-decorative: `role="separator"` + `aria-orientation`.
- Visual variants (gradient) are purely decorative.

**B. Keyboard/APG — N/A**
- Non-interactive component.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- `variant` prop: `default` | `gradient` | `gradient-left` | `gradient-right`.
- `orientation` + `decorative` from Radix.
- `className` + `cn()`.
- Exports `SeparatorProps`.

**D. Tests — PASS**
- Tests cover: horizontal/vertical, variant classes (default/gradient/gradient-left/gradient-right), decorative role="none", non-decorative role="separator", className merge, ref forwarding.
- `axe()` test present.
- 10 tests — good.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Radix primitive.

**F. Documentation — PASS**
- Story file: `separator.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 16. Text (`ui/text.tsx`)

**A. WCAG 2.2 AA — PASS**
- Automatic semantic element mapping: heading variants → `<h1>`–`<h6>`, body → `<p>`, label/caption → `<span>`.
- Typography uses CSS custom properties for size/weight/leading/tracking — responsive-friendly.
- `as` prop allows overriding element (e.g., heading styles on a non-heading).

**B. Keyboard/APG — N/A**
- Non-interactive component.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- CVA for variant system covering: heading-2xl through heading-xs, body-lg through body-xs, label-lg through label-xs, caption, overline.
- Polymorphic `as` prop.
- `className` + `cn()`.
- Exports `Text`, `textVariants`, `TextProps`, `TextVariant`.

**D. Tests — PASS**
- Tests cover: default body-md as `<p>`, heading variants as correct elements, body/label/caption/overline variants, uppercase on labels, as prop override, className merge, ref forwarding (default and with `as`), HTML attribute passthrough.
- `axe()` test present.
- 14 tests — thorough.

**E. Bundle/SSR — PASS**
- `// @server-safe` — correct. Pure CSS class component with CVA.

**F. Documentation — PASS**
- Story file: `text.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 17. VisuallyHidden (`ui/visually-hidden.tsx`)

**A. WCAG 2.2 AA — PASS**
- Uses Tailwind `sr-only` class — standard screen-reader-only technique.
- Content remains in DOM for AT but visually hidden.

**B. Keyboard/APG — N/A**
- Non-interactive utility.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- `className` + `cn()`.
- Renders as `<span>`.
- Exports `VisuallyHiddenProps`.

**D. Tests — CONCERN**
- Tests cover: renders children, sr-only class, custom className, span element, ref forwarding.
- **Missing:** No `axe()` test.
- 5 tests — basic but adequate for such a simple component.

**E. Bundle/SSR — PASS**
- `// @server-safe` — correct. Pure CSS class component.

**F. Documentation — PASS**
- Story file: `visually-hidden.stories.tsx` exists.

**Verdict: C** — Missing axe test on a component whose entire purpose is accessibility.

**Fixes needed:**
- [ ] Add `axe()` test — ironic that the a11y utility component lacks an a11y test.

---

### 18. AspectRatio (`ui/aspect-ratio.tsx`)

**A. WCAG 2.2 AA — PASS**
- Thin wrapper around Radix `@primitives/react-aspect-ratio`.
- Uses padding-bottom technique for ratio — no a11y concerns.

**B. Keyboard/APG — N/A**
- Non-interactive layout utility.

**C. API/DX — PASS**
- `forwardRef` + `displayName`.
- `className` + `cn()`.
- Passes `ratio` prop to Radix.

**D. Tests — PASS**
- Tests cover: children rendering, default ratio, padding-bottom style, className merge, ref forwarding, 1:1 ratio.
- `axe()` test present.
- 7 tests — adequate.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Radix primitive.

**F. Documentation — PASS**
- Story file: `aspect-ratio.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 19. Collapsible (`ui/collapsible.tsx`)

**A. WCAG 2.2 AA — PASS**
- Built on Radix `@primitives/react-collapsible`.
- Radix primitive provides `aria-expanded` + `aria-controls` on trigger — confirmed in vendored source.
- Trigger is a `<button>` element — Enter/Space activate.
- Content animation uses CSS `animate-collapsible-down/up` + framer-motion opacity fade.

**B. Keyboard/APG — PASS**
- Enter/Space toggle content — handled by Radix's `<button>` trigger.
- `aria-expanded` changes to reflect open/closed state.
- `aria-controls` links trigger to content region.

**C. API/DX — PASS**
- `Collapsible` = direct Radix Root (no wrapper needed).
- `CollapsibleTrigger` = direct Radix Trigger.
- `CollapsibleContent` wrapped with `forwardRef` + animation.
- `displayName` on CollapsibleContent.
- `className` + `cn()` on content.
- Exports `CollapsibleProps`.

**D. Tests — PASS**
- Tests cover: trigger rendering, hidden by default, defaultOpen, expand on click, collapse on second click, controlled open, onOpenChange callback, className merge.
- `axe()` test present (when expanded).
- 8 tests — solid.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses Radix primitive, framer-motion.

**F. Documentation — PASS**
- Story file: `collapsible.stories.tsx` exists.

**Verdict: P** — Fully compliant.

---

### 20. Stepper (`ui/stepper.tsx`)

**A. WCAG 2.2 AA — CONCERN**
- Uses `role="list"` on container and `role="listitem"` on each step — provides structure.
- Step state is communicated via `data-state` attribute (completed/active/pending) — **but `data-state` is not exposed to AT**. There is no `aria-current="step"` on the active step, no `aria-label` describing step state.
- Step numbers are visible (1, 2, 3) and completed steps show a checkmark SVG — visual state communication is good.
- **Missing:** No `aria-label` or `aria-description` on steps to communicate state to screen readers. The step label text alone doesn't convey "completed" vs "active" vs "pending".
- Animations use framer-motion (layoutId for active indicator, scale for checkmark) — framer-motion respects reduced motion globally.

**B. Keyboard/APG — CONCERN**
- Stepper renders as a list (`role="list"`) — there is no keyboard navigation between steps.
- Steps are not interactive (not clickable) — they are purely indicative, so keyboard navigation is not strictly required.
- However, if a consumer wanted to make steps clickable (e.g., go back to a previous step), there's no built-in support for that.
- The APG stepper pattern is not standardized, but communicating step state to AT is expected.

**C. API/DX — PASS**
- `forwardRef` + `displayName` on Stepper, Step, StepperContent.
- Context for activeStep, orientation, stepperId.
- `Stepper` injects `_index` into children via cloneElement.
- `Step` has `label`, `description`, `icon` props.
- `StepperContent` provides AnimatePresence slide transitions.
- Orientation: horizontal/vertical.
- Exports types.

**D. Tests — CONCERN**
- Tests cover: renders all steps, marks completed/active/pending via data-state, vertical orientation, step description.
- **Missing:** No `axe()` test.
- **Missing:** No test for screen reader state communication.
- **Missing:** No ref forwarding test.
- **Missing:** No StepperContent test.
- 6 tests — minimal.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses framer-motion, React context, useId.

**F. Documentation — PASS**
- Story file: `stepper.stories.tsx` exists.

**Verdict: C** — Step state not communicated to AT. Missing axe test.

**Fixes needed:**
- [ ] Add `aria-current="step"` on the active step, or provide `aria-label` on each step that includes its state (e.g., "Step 1: Account — completed").
- [ ] Add `axe()` test.
- [ ] Add StepperContent test.
- [ ] Add ref forwarding test.

---

### 21. Sidebar (`ui/sidebar.tsx`)

**A. WCAG 2.2 AA — FAIL**
- **No landmark role.** The Sidebar renders as `<div>` with no `role="navigation"`, `role="complementary"`, `<nav>`, or `<aside>`. This means screen readers cannot identify the sidebar as a distinct navigational region.
- `SidebarInset` renders as `<main>` — correct for main content area.
- `SidebarTrigger` has sr-only text "Toggle Sidebar" — good.
- `SidebarRail` has `aria-label="Toggle Sidebar"` — but also `tabIndex={-1}` which removes it from tab order (intentional — it's a drag/click handle).
- `SidebarMenuButton` has focus ring, disabled states, active states.
- `SidebarGroupLabel`, `SidebarGroupAction` have focus rings.
- Mobile sidebar uses `<Sheet>` which provides dialog semantics.
- Keyboard shortcut `Ctrl+B` to toggle — nice feature, but not discoverable.

**B. Keyboard/APG — PASS**
- Keyboard toggle via `Ctrl+B` — handled in `useEffect`.
- `SidebarTrigger` is a button that toggles sidebar.
- Menu items are buttons/links, naturally focusable.
- `SidebarMenuSubButton` defaults to `<a>` — focusable.
- Note: No roving tabindex on menu items (each item is individually tabbable), which is acceptable for a navigation pattern.

**C. API/DX — PASS**
- `forwardRef` + `displayName` on all 20+ sub-components.
- CVA on `SidebarMenuButton`.
- Context: `SidebarContext` with `useSidebar` hook.
- `asChild` support on SidebarMenuButton, SidebarMenuSubButton, SidebarGroupLabel, SidebarGroupAction, SidebarMenuAction.
- Tooltip integration for collapsed state.
- `side` (left/right), `variant` (sidebar/floating/inset), `collapsible` (offcanvas/icon/none).
- Cookie persistence for state.
- Comprehensive sub-component system.

**D. Tests — CONCERN**
- Tests cover: SidebarProvider (renders children, CSS properties, className), Sidebar (collapsible=none), sub-component data-sidebar attributes (header/content/footer), useSidebar throws outside provider.
- **Missing:** No `axe()` test.
- **Missing:** No keyboard toggle test (`Ctrl+B`).
- **Missing:** No SidebarTrigger toggle test.
- **Missing:** No collapsed/expanded state test.
- **Missing:** No SidebarMenuButton tests (active state, tooltip, variants).
- **Missing:** No ref forwarding test.
- 7 tests — very minimal for such a complex component.

**E. Bundle/SSR — PASS**
- `'use client'` — correct. Uses hooks, context, DOM APIs, framer-motion.

**F. Documentation — PASS**
- Story file: `sidebar.stories.tsx` exists (in `ui/`).

**Verdict: F** — Missing landmark role is a WCAG failure. Test coverage is woefully thin for a component of this complexity.

**Fixes needed (critical):**
- [ ] **Add landmark role to Sidebar.** The inner `<div data-sidebar="sidebar">` should be `<aside>` or `<nav>` (or have `role="navigation"` / `role="complementary"`). `<nav>` is most appropriate since it contains navigation menus.
- [ ] Add `aria-label` on the navigation landmark (e.g., "Main navigation").

**Fixes needed (tests):**
- [ ] Add `axe()` test.
- [ ] Add keyboard toggle test (`Ctrl+B`).
- [ ] Add SidebarTrigger toggle test.
- [ ] Add collapsed/expanded state assertions.
- [ ] Add SidebarMenuButton active state test.
- [ ] Add ref forwarding test.

---

## Cross-Cutting Issues

### 1. Missing Test Files (4 components)
| Component | Priority |
|-----------|----------|
| Breadcrumb | High — navigation component with ARIA semantics |
| Link | High — fundamental interactive component |
| IconContext | Low — utility, tested indirectly |
| ButtonProcessing | Low — internal, tested indirectly |

### 2. Missing axe() Tests
The following components have test files but no `toHaveNoViolations()` axe assertion:
- Tabs
- Button
- ButtonGroup
- VisuallyHidden (ironic)
- Stepper

### 3. Missing Keyboard Tests
Navigation components that should have keyboard interaction tests:
- **Tabs** — needs ArrowLeft/ArrowRight between tabs test
- **NavigationMenu** — needs arrow key navigation test
- **Sidebar** — needs Ctrl+B keyboard toggle test

### 4. Missing Stories
- ButtonProcessing (internal — not exported, low priority)
- IconContext (context provider — low priority)
- IconGroup (exported component — should have a story)

### 5. Sidebar Landmark Role (WCAG Failure)
The Sidebar component renders as `<div>` with no ARIA landmark. This is a WCAG 1.3.1 failure. The fix is straightforward: change the inner container to `<nav>` or add `role="navigation"`.

### 6. Stepper Accessibility Gap
Step states (completed/active/pending) are only communicated visually and via `data-state` attributes. Screen readers receive no indication of step progress. Adding `aria-current="step"` on the active step and `aria-label` with state information would fix this.

### 7. @server-safe Annotations — Correct
| Annotation | Components |
|-----------|-----------|
| `// @server-safe` | Container, Stack, Text, VisuallyHidden |
| `'use client'` | All others (17 components) |

All annotations are correct. Server-safe components have no hooks, context, effects, or browser APIs.

---

## Recommended Fix Priority

**P0 (Critical — WCAG failures):**
1. Sidebar: Add `<nav>` or `role="navigation"` landmark
2. Stepper: Add `aria-current="step"` + screen reader state communication

**P1 (High — missing tests for navigation components):**
3. Breadcrumb: Create test file with full coverage
4. Link: Create test file with full coverage
5. Tabs: Add axe test + keyboard navigation test
6. Button: Add axe test
7. Sidebar: Expand test coverage significantly

**P2 (Medium — test gaps):**
8. NavigationMenu: Add keyboard tests
9. ButtonGroup: Add axe test
10. VisuallyHidden: Add axe test
11. Stepper: Add axe test + expand coverage
12. IconGroup: Add forwardRef, create story

**P3 (Low — internal components):**
13. IconContext: Add basic test
14. ButtonProcessing: Add basic test
