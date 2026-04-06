# Phase 2 Batch 6 -- Shell Components Audit

**Date:** 2026-04-06
**Auditor:** Claude Opus 4.6
**Scope:** 8 shell-layer components (app structural chrome)

---

## Summary Table

| # | Component | WCAG | APG Keyboard | API/DX | Tests | Bundle/SSR | Docs | Verdict |
|---|-----------|------|-------------|--------|-------|-----------|------|---------|
| 1 | TopBar | **F** | **F** | **C** | P | P | P | Needs work |
| 2 | AppSidebar | **C** | **C** | P | P | P | P | Needs work |
| 3 | BottomNavbar | **C** | **F** | P | **C** | P | P | Needs work |
| 4 | NotificationCenter | **C** | **C** | P | P | P | P | Needs work |
| 5 | NotificationPreferences | P | P | P | **C** | P | P | Mostly OK |
| 6 | AppCommandPalette | P | P | P | **C** | P | P | Mostly OK |
| 7 | LinkContext | N/A | N/A | P | P | P | **F** | OK (non-visual) |
| 8 | CommandRegistry | N/A | N/A | P | **F** | **C** | **F** | Needs work |

**Key:** P = Pass, F = Fail, C = Conditional (partial/needs improvement), N/A = Not applicable

---

## Critical Findings (P0)

### 1. TopBar has NO landmark role

The TopBar root renders a plain `<div>`. For an application top bar / header chrome component, it **must** be a `<header>` element (or carry `role="banner"`) per WCAG 1.3.1 (Info and Relationships). Screen reader users navigating by landmarks will not find it.

**Fix:** Change `<div>` to `<header>` in `TopBarRoot`, or add `role="banner"`.

### 2. TopBar.IconButton has no accessible name by default

The `TopBar.IconButton` renders a `<button>` with only an `aria-hidden="true"` icon span inside. The accessible name comes only from the Tooltip, but tooltips don't provide an accessible name to the trigger button. The button itself has **no** `aria-label`.

In tests, consumers must manually add `aria-label="Search"` -- but the component doesn't enforce or default it. The `tooltip` prop should double as `aria-label` on the button.

**Fix:** Add `aria-label={tooltip}` to the inner `<button>` element.

### 3. BottomNavbar "More" overlay has no keyboard support

The "More" menu overlay is opened by a button but:
- There is no `role="dialog"` or `role="menu"` on the overlay
- No focus trap -- keyboard users can tab behind the overlay
- No Escape key handler to close it (the ESLint disable comment acknowledges this)
- The overlay links inside the "More" panel lack `aria-current` for active items
- The overlay backdrop dismiss is mouse-only (acknowledged by eslint-disable comments)

### 4. No skip-navigation link anywhere in the shell

None of the shell components provide or support a skip-navigation link (`<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>`). For an app shell with sidebar + top bar, this is a WCAG 2.4.1 requirement.

---

## Per-Component Detail

---

### 1. TopBar (`top-bar.tsx`)

#### A. WCAG 2.2 AA -- **FAIL**

| Criterion | Status | Detail |
|-----------|--------|--------|
| 1.3.1 Landmarks | **FAIL** | Root is `<div>`, not `<header>`. No `role="banner"`. |
| 1.4.3 Contrast | P | Uses semantic tokens (surface-fg, surface-fg-muted). |
| 1.4.11 Non-text | P | Icon buttons have visible borders. |
| 2.4.7 Focus visible | P | Browser default focus + Radix focus management. |
| 2.5.8 Target size | P | `h-ds-sm-plus w-ds-sm-plus` = 36px, meets 24px minimum. |
| 2.3.3 Reduced motion | P | No animations in TopBar itself. |

#### B. APG Keyboard -- **FAIL**

- No `<header>` landmark for screen reader navigation.
- `TopBar.IconButton` accessible name relies on consumer adding `aria-label` -- the component should derive it from `tooltip` prop.
- TopBar.UserMenu trigger button has `outline-none` class with no visible focus replacement.

#### C. API/DX -- **CONDITIONAL**

| Check | Status | Detail |
|-------|--------|--------|
| forwardRef | P | All subcomponents use forwardRef. |
| displayName | P | All set (TopBar, TopBar.Left, etc.). |
| className + cn() | P | All merge via cn(). |
| Props spread | **C** | TopBarRoot spreads props but puts `{...props}` before `ref` and `className` -- props go first which is correct. However, `TopBar.UserMenu` does NOT spread extra props and does NOT accept `className` on the root (only on the button wrapper). |
| Exported types | P | TopBarProps, TopBarUser, UserMenuItem exported. |

#### D. Test Quality -- **PASS**

- 14 tests covering rendering, interactions, className merge, layout modes.
- `toHaveNoViolations()` present.
- Tests for userMenuItem interactions (onClick, onNavigate, badge).
- Heavy mocking of Tooltip/DropdownMenu (necessary for unit testing).

#### E. Bundle/SSR -- **PASS**

- `'use client'` directive present (correct -- uses hooks, Radix components).
- No `@server-safe` annotation (correct -- not server-safe).

#### F. Documentation -- **PASS**

- Story file with `tags: ['autodocs', 'stable']`.
- 8 stories covering all major configurations.

---

### 2. AppSidebar (`sidebar.tsx`)

#### A. WCAG 2.2 AA -- **CONDITIONAL**

| Criterion | Status | Detail |
|-----------|--------|--------|
| 1.3.1 Landmarks | **C** | Has `aria-label="Main navigation"` on the `ShadcnSidebar` wrapper. However, `ShadcnSidebar` renders a `<div>`, not `<nav>` or `<aside>`. The aria-label is on a non-landmark div, so screen readers won't announce it as a navigation landmark. |
| 1.4.3 Contrast | P | Semantic tokens for all text/bg. Active state uses accent-11 on accent-2. |
| 1.4.11 Non-text | P | Active indicator bar (accent-9), clear hover states. |
| 2.4.7 Focus visible | P | Links use browser default focus. |
| 2.5.8 Target size | P | Nav items have py-ds-03 padding, adequate. |
| 2.3.3 Reduced motion | P | No framer-motion usage. CSS transition with `duration-fast-02`. |

#### B. APG Keyboard -- **CONDITIONAL**

- `aria-current="page"` correctly applied to active links and active child links.
- Collapsible sections have `aria-label="Toggle {title}"` on the chevron button.
- No `role="navigation"` on the sidebar itself (the underlying `Sidebar` UI component renders `<div>` not `<nav>`).
- No skip-nav support.

#### C. API/DX -- **PASS**

| Check | Status |
|-------|--------|
| forwardRef | P |
| displayName | P (`AppSidebar`) |
| className + cn() | P |
| Props spread | P (`{...props}` on ShadcnSidebar) |
| Exported types | P (NavItem, NavGroup, SidebarUser, AppSidebarProps, NavSubItem, SidebarFooterConfig, SidebarPromo) |

#### D. Test Quality -- **PASS**

- 20 tests across 7 describe blocks.
- `toHaveNoViolations()` present (in preFooterClassName block).
- Tests for nav groups, badges (cap at 99+), group actions, structured footer, renderItem, collapsible children, preFooterClassName.
- Keyboard interaction tested (chevron toggle click).
- Missing: no axe test on the main render path (only in the preFooterClassName block).

#### E. Bundle/SSR -- **PASS**

- `'use client'` present. Correct -- uses hooks, Collapsible, Avatar.

#### F. Documentation -- **PASS**

- Story file with `tags: ['autodocs', 'stable']`.
- 14 stories covering default, active routes, badges, collapsible, footer variants, header slot, promo.

---

### 3. BottomNavbar (`bottom-navbar.tsx`)

#### A. WCAG 2.2 AA -- **CONDITIONAL**

| Criterion | Status | Detail |
|-----------|--------|--------|
| 1.3.1 Landmarks | P | Uses `<nav aria-label="Mobile navigation">`. Correct landmark. |
| 1.4.3 Contrast | P | Semantic tokens. Active items use accent-11. |
| 1.4.11 Non-text | P | Active indicator bar visible. |
| 2.4.7 Focus visible | **C** | Links get browser focus, but the "More" overlay items have no visible focus style defined. |
| 2.5.8 Target size | P | `h-16` (64px) height, `max-w-[70px]`. |
| 2.3.3 Reduced motion | **F** | Uses `framer-motion` (`whileTap`, `layoutId`, `AnimatePresence`) but does NOT check `prefers-reduced-motion`. The `springs` config has no reduced motion integration. |
| 1.4.10 Reflow | P | Fixed bottom bar, responsive by design. |

#### B. APG Keyboard -- **FAIL**

- `aria-current="page"` on active links -- good.
- `aria-expanded` on "More" button -- good.
- `aria-label="More navigation options"` -- good.
- **FAIL:** "More" overlay has no keyboard close (Escape), no focus trap, no `role` attribute. It's a mouse-only interaction with keyboard users stuck once the overlay is open.
- **FAIL:** Overlay items (inside "More") are rendered as `<Link>` elements but without `aria-current` for active items.

#### C. API/DX -- **PASS**

| Check | Status |
|-------|--------|
| forwardRef | P |
| displayName | P (`BottomNavbar`) |
| className + cn() | P |
| Props spread | P (`{...props}` on `<nav>`) |
| Exported types | P |

#### D. Test Quality -- **CONDITIONAL**

- 7 tests in `__tests__/bottom-navbar.test.tsx`.
- `toHaveNoViolations()` present.
- All tests focus on badge rendering only. **Missing:** active state tests, More button interaction, aria-expanded, basic rendering.
- No keyboard interaction tests.

#### E. Bundle/SSR -- **PASS**

- `'use client'` present. Correct -- uses useState, framer-motion.

#### F. Documentation -- **PASS**

- Story file with `tags: ['autodocs', 'stable']`.
- 10 stories including badges, roles, overflow.

---

### 4. NotificationCenter (`notification-center.tsx`)

#### A. WCAG 2.2 AA -- **CONDITIONAL**

| Criterion | Status | Detail |
|-----------|--------|--------|
| 1.3.1 Landmarks | P | Popover-based, no landmark needed. |
| 1.4.3 Contrast | P | Semantic tokens throughout. |
| 1.4.11 Non-text | P | Tier dots use semantic color tokens (info-9, warning-9, error-9). |
| 2.4.7 Focus visible | P | Trigger button has border. Notification items are focusable divs. |
| 2.5.8 Target size | P | Trigger is `h-ds-sm-plus w-ds-sm-plus`. |
| 2.3.3 Reduced motion | **F** | Uses `framer-motion` for notification entry animations and bell wiggle. No `prefers-reduced-motion` check. |

#### B. APG Keyboard -- **CONDITIONAL**

- Trigger button has proper `aria-label` with unread count.
- Notification items use `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space) -- good.
- Dismiss buttons stop event propagation correctly.
- **Missing:** No `aria-live` region for announcing new notifications. When new notifications arrive, screen readers won't know.
- **Missing:** Focus is not managed when the popover opens (Radix Popover handles this, but the notification list itself doesn't auto-focus the first item).

#### C. API/DX -- **PASS**

| Check | Status |
|-------|--------|
| forwardRef | P |
| displayName | P |
| className + cn() | P (both className and popoverClassName) |
| Props spread | P (`{...props}` on trigger button) |
| Exported types | P |

#### D. Test Quality -- **PASS**

- 15 tests across 5 describe blocks.
- `toHaveNoViolations()` present.
- Tests for navigation routing, footer slot, empty state, header actions, popover className, dismiss interactions, keyboard Enter activation.
- Good coverage of edge cases.

#### E. Bundle/SSR -- **PASS**

- `'use client'` present. Correct.

#### F. Documentation -- **PASS**

- Story file with `tags: ['autodocs', 'stable']`.
- 15 stories covering all states.

---

### 5. NotificationPreferences (`notification-preferences.tsx`)

#### A. WCAG 2.2 AA -- **PASS**

| Criterion | Status | Detail |
|-----------|--------|--------|
| 1.3.1 Info/relations | P | Form controls have associated `<label>` elements with `htmlFor`. |
| 1.4.3 Contrast | P | Semantic tokens. |
| 2.4.7 Focus visible | P | Uses Button, Select, Switch (all have focus styles). |
| 2.5.8 Target size | P | Buttons and switches are adequately sized. |

#### B. APG Keyboard -- **PASS**

- Dialog-based add flow uses Radix Dialog (keyboard managed).
- Select dropdowns use Radix Select (keyboard managed).
- Switch toggle is keyboard accessible.
- Labels properly associated via `htmlFor`/`id`.

#### C. API/DX -- **PASS**

| Check | Status |
|-------|--------|
| forwardRef | P (named function + forwardRef) |
| displayName | P |
| className + cn() | P |
| Props spread | P (`{...(props as Omit<typeof props, 'color'>)}` -- handles Card color conflict) |
| Exported types | P |

#### D. Test Quality -- **CONDITIONAL**

- 4 tests only (renders, axe, className, props spread).
- `toHaveNoViolations()` present.
- **Missing:** No tests for preference list rendering, add dialog flow, onSave/onToggleMute/onUpdateTier/onDelete callbacks, loading state, empty state.

#### E. Bundle/SSR -- **PASS**

- `'use client'` present. Correct.

#### F. Documentation -- **PASS**

- Story file with `tags: ['autodocs', 'stable']`.
- 8 stories.

---

### 6. AppCommandPalette (`app-command-palette.tsx`)

#### A. WCAG 2.2 AA -- **PASS**

- Delegates entirely to `CommandPalette` composed component which handles ARIA.
- The wrapper itself adds no visual elements.

#### B. APG Keyboard -- **PASS**

- Delegates to `CommandPalette` which implements the combobox pattern (input + listbox, arrow nav, Escape).
- Keybinding support (Ctrl+K toggle, configurable/disableable).

#### C. API/DX -- **PASS**

| Check | Status |
|-------|--------|
| forwardRef | P |
| displayName | P |
| className + cn() | P |
| Props spread | P (`{...props}` on CommandPalette) |
| Exported types | P (SearchResult, SearchResultGroup, AppCommandPaletteUser, AppCommandPaletteProps) |

#### D. Test Quality -- **CONDITIONAL**

- 13 tests.
- `toHaveNoViolations()` present.
- Tests cover className, props spread, search results, grouped results, pass-through props.
- CommandPalette is fully mocked, so tests only verify prop assembly -- **no real keyboard or ARIA testing** happens at this level. This is acceptable since CommandPalette has its own tests, but the integration boundary isn't validated.

#### E. Bundle/SSR -- **PASS**

- `'use client'` present. Correct.

#### F. Documentation -- **PASS**

- Story file with `tags: ['autodocs', 'stable']`.
- 18 stories covering admin/associate/super-admin, search results, grouped results, controlled state, keybindings, custom empty/footer.

---

### 7. LinkContext (`link-context.tsx`)

Re-export module from `../ui/lib/link-context`. Non-visual context provider.

#### A. WCAG -- **N/A** (context provider, no DOM)
#### B. APG Keyboard -- **N/A**

#### C. API/DX -- **PASS**

- Clean re-export of `LinkProvider`, `useLink`, `LinkProviderProps`.
- Canonical source in `ui/lib/` to avoid module boundary violations.
- `DefaultLink` has `displayName`.

#### D. Test Quality -- **PASS**

- 3 tests in `__tests__/link-context.test.tsx`.
- `toHaveNoViolations()` present.
- Tests default anchor, custom provider, and useLink without provider.

#### E. Bundle/SSR -- **PASS**

- Re-export file has no `'use client'` -- correct, it's just a re-export.
- Canonical source has `'use client'` (uses React.createContext, React.forwardRef).

#### F. Documentation -- **FAIL**

- No story file. As a context provider this is understandable, but there's no Storybook documentation for how to use `LinkProvider`.

---

### 8. CommandRegistry (`command-registry.tsx`)

Non-visual context provider for registering command palette pages/admin pages.

#### A. WCAG -- **N/A** (context provider, no DOM)
#### B. APG Keyboard -- **N/A**

#### C. API/DX -- **PASS**

| Check | Status |
|-------|--------|
| forwardRef | N/A (not a visual component) |
| displayName | P (`CommandRegistryProvider`) |
| Exported types | P (CommandPageItem, CommandRegistry, CommandRegistryProviderProps) |

#### D. Test Quality -- **FAIL**

- **No test file exists.** The provider, hook, and context are completely untested.
- Should test: provider renders children, useCommandRegistry returns registry when provided, returns null when no provider.

#### E. Bundle/SSR -- **CONDITIONAL**

- No `'use client'` directive. This file uses `React.createContext` and `React.useContext` which are client-only APIs. It needs `'use client'` to work properly in RSC environments, OR it should be annotated `// @server-safe` if the context is server-safe (it's not -- `useContext` is client-only).

#### F. Documentation -- **FAIL**

- No story file.
- No Storybook documentation for how to register commands.

---

## Systemic Issues

### 1. Framer Motion + Reduced Motion (affects BottomNavbar, NotificationCenter)

Both components use `framer-motion` animations (`whileTap`, `AnimatePresence`, `motion.div initial/animate`) but never check `prefers-reduced-motion`. The `motion.ts` utility exports a `withReducedMotion()` helper, but it's never used in shell components. Framer Motion v11+ auto-respects `prefers-reduced-motion` by default via its `ReducedMotion` feature, but this should be verified for the bundled version.

### 2. No Skip-Navigation Pattern

None of the shell components provide a skip-nav link. For the intended use case (sidebar + topbar + main content), WCAG 2.4.1 "Bypass Blocks" requires a mechanism to skip repeated navigation. This should be either:
- A `<SkipNavLink>` component in the shell layer
- Documentation telling consumers to add their own

### 3. Sidebar UI Primitive Renders `<div>`, Not `<nav>` or `<aside>`

The `Sidebar` UI primitive (`ui/sidebar.tsx`) renders nested `<div>` elements. Even though `AppSidebar` passes `aria-label="Main navigation"`, the label lands on a `<div>`, not a landmark element. This means the sidebar is invisible to landmark navigation. The fix should be in the `Sidebar` UI primitive (changing the inner wrapper to `<aside>` or `<nav>`), not in `AppSidebar`.

### 4. TopBar UserMenu Trigger Has `outline-none`

The UserMenu trigger button has `className="flex items-center gap-ds-03 outline-none"` -- this removes the focus indicator entirely with no replacement. WCAG 2.4.7 violation.

---

## Recommended Fixes by Priority

### P0 (Must Fix Before Next Release)

1. **TopBar:** Change root `<div>` to `<header>` element.
2. **TopBar.IconButton:** Add `aria-label={tooltip}` on the `<button>`.
3. **TopBar.UserMenu:** Remove `outline-none` or add a visible focus replacement.
4. **CommandRegistry:** Add `'use client'` directive.

### P1 (Should Fix Soon)

5. **Sidebar UI primitive:** Change inner render element to `<aside>` or add `role="navigation"`.
6. **BottomNavbar "More" overlay:** Add `role="dialog"`, Escape-to-close, and focus trap.
7. **BottomNavbar "More" overlay items:** Add `aria-current` for active items.
8. **NotificationCenter:** Verify framer-motion respects `prefers-reduced-motion` or use `withReducedMotion`.
9. **BottomNavbar:** Same reduced-motion check.
10. **CommandRegistry:** Add test file with basic provider/hook tests.

### P2 (Nice to Have)

11. **Shell layer:** Add a `SkipNavLink` component or document the pattern.
12. **NotificationCenter:** Consider `aria-live="polite"` region for new notification announcements.
13. **BottomNavbar tests:** Add tests beyond badge rendering (active state, More button, basic render).
14. **NotificationPreferences tests:** Add interaction tests for the add dialog and callbacks.
15. **LinkContext / CommandRegistry:** Add minimal Storybook docs (even if just a docs page, no visual stories).

---

## Test Coverage Summary

| Component | Test Count | axe Test | Keyboard Test | Interaction Tests |
|-----------|-----------|----------|---------------|-------------------|
| TopBar | 14 | Yes | No | Yes (click) |
| AppSidebar | 20 | Yes | Yes (collapse toggle) | Yes |
| BottomNavbar | 7 | Yes | No | No (badges only) |
| NotificationCenter | 15 | Yes | Yes (Enter key) | Yes |
| NotificationPreferences | 4 | Yes | No | No |
| AppCommandPalette | 13 | Yes | No (mocked) | No (mocked) |
| LinkContext | 3 | Yes | No | No |
| CommandRegistry | 0 | No | No | No |

**Total: 76 tests across 7 files, 1 component untested.**
