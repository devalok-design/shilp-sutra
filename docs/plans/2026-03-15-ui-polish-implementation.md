# UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply ~150 micro-polish improvements across tokens and all components to elevate the design system from B+ to A grade.

**Architecture:** Two-phase approach. Phase 1 changes foundation tokens/utilities (shadows, typography, focus rings, motion) that cascade to every component. Phase 2 applies targeted per-component fixes grouped into 6 parallelizable tasks by package area. Each task is a single commit.

**Tech Stack:** CSS custom properties (OKLCH), Tailwind 3.4 preset, CVA, Framer Motion, React 18, TypeScript

**Design doc:** `docs/plans/2026-03-15-ui-polish-design.md`

---

## Task 1: Multi-Layered Shadows

Replace single-layer shadow tokens with 3-layer stacks for realistic depth.

**Files:**
- Modify: `packages/core/src/tokens/semantic.css:261-265` (light mode shadows)
- Modify: `packages/core/src/tokens/semantic.css:375-379` (dark mode shadows)

**Step 1: Update light mode shadows**

In `semantic.css`, find lines 261-265 and replace:

```css
/* Before */
--shadow-01: 0 1px 2px oklch(0 0 0 / 0.10);
--shadow-02: 0 2px 6px oklch(0 0 0 / 0.12);
--shadow-03: 0 4px 16px oklch(0 0 0 / 0.14);
--shadow-04: 0 8px 32px oklch(0 0 0 / 0.18);
--shadow-05: 0 16px 48px oklch(0 0 0 / 0.22);

/* After — 3-layer stacks: contact + main + ambient */
--shadow-01: 0 1px 1px oklch(0 0 0 / 0.06), 0 1px 3px oklch(0 0 0 / 0.10), 0 2px 6px oklch(0 0 0 / 0.08);
--shadow-02: 0 1px 2px oklch(0 0 0 / 0.08), 0 4px 8px oklch(0 0 0 / 0.12), 0 8px 24px oklch(0 0 0 / 0.10);
--shadow-03: 0 2px 4px oklch(0 0 0 / 0.08), 0 8px 16px oklch(0 0 0 / 0.12), 0 16px 40px oklch(0 0 0 / 0.10);
--shadow-04: 0 2px 4px oklch(0 0 0 / 0.10), 0 12px 24px oklch(0 0 0 / 0.14), 0 24px 56px oklch(0 0 0 / 0.12);
--shadow-05: 0 4px 8px oklch(0 0 0 / 0.10), 0 16px 32px oklch(0 0 0 / 0.16), 0 32px 64px oklch(0 0 0 / 0.14);
```

**Step 2: Update dark mode shadows**

In `semantic.css`, find lines 375-379 (inside `.dark {}`) and replace:

```css
/* Before */
--shadow-01: 0 1px 2px oklch(0 0 0 / 0.30);
--shadow-02: 0 2px 6px oklch(0 0 0 / 0.40);
--shadow-03: 0 4px 16px oklch(0 0 0 / 0.50);
--shadow-04: 0 8px 32px oklch(0 0 0 / 0.60);
--shadow-05: 0 16px 48px oklch(0 0 0 / 0.70);

/* After — 3-layer stacks with ~2.5x opacity */
--shadow-01: 0 1px 1px oklch(0 0 0 / 0.15), 0 1px 3px oklch(0 0 0 / 0.25), 0 2px 6px oklch(0 0 0 / 0.20);
--shadow-02: 0 1px 2px oklch(0 0 0 / 0.20), 0 4px 8px oklch(0 0 0 / 0.30), 0 8px 24px oklch(0 0 0 / 0.25);
--shadow-03: 0 2px 4px oklch(0 0 0 / 0.20), 0 8px 16px oklch(0 0 0 / 0.30), 0 16px 40px oklch(0 0 0 / 0.25);
--shadow-04: 0 2px 4px oklch(0 0 0 / 0.25), 0 12px 24px oklch(0 0 0 / 0.35), 0 24px 56px oklch(0 0 0 / 0.30);
--shadow-05: 0 4px 8px oklch(0 0 0 / 0.25), 0 16px 32px oklch(0 0 0 / 0.40), 0 32px 64px oklch(0 0 0 / 0.35);
```

**Step 3: Run tests**

Run: `pnpm test --filter @devalok/shilp-sutra`
Expected: All tests pass (shadow tokens are CSS-only, no test breakage)

**Step 4: Commit**

```bash
git add packages/core/src/tokens/semantic.css
git commit -m "style(tokens): multi-layered shadows for realistic depth"
```

---

## Task 2: Typography, Motion & Focus Ring Utilities

Foundation utility improvements.

**Files:**
- Modify: `packages/core/src/tokens/typography-semantic.css:21,26,41` (heading tracking)
- Modify: `packages/core/src/ui/lib/motion.ts:20,22` (tween alignment)
- Modify: `packages/core/src/tailwind/preset.ts:360` (focus-ring plugin + tabular-nums)

**Step 1: Tighten heading letter-spacing**

In `typography-semantic.css`:
- Line 21: `--typo-heading-2xl-tracking: -0.02em;` → `-0.025em;`
- Line 26: `--typo-heading-xl-tracking: -0.02em;` → `-0.025em;`
- Line 41: `--typo-heading-sm-tracking: -0.02em;` → `-0.015em;`

(heading-lg, heading-md, heading-xs stay unchanged)

**Step 2: Align motion tweens to CSS tokens**

In `motion.ts`:
- Line 20: `fade: { type: 'tween', duration: 0.15, ease: 'easeOut' }` → `duration: 0.11`
- Line 22: `colorShift: { type: 'tween', duration: 0.1, ease: 'easeOut' }` → `duration: 0.07`

**Step 3: Add focus-ring plugin and tabular-nums to preset**

In `preset.ts`, replace line 360:

```ts
// Before
plugins: [],

// After
plugins: [
  require('tailwindcss/plugin')(({ addUtilities }: { addUtilities: Function }) => {
    addUtilities({
      '.focus-ring': {
        '&:focus-visible': {
          outline: 'none',
          'box-shadow': '0 0 0 2px var(--color-surface-1), 0 0 0 4px var(--color-accent-9)',
        },
      },
      '.focus-ring-inset': {
        '&:focus-visible': {
          outline: 'none',
          'box-shadow': 'inset 0 0 0 2px var(--color-accent-9)',
        },
      },
      '.focus-ring-sm': {
        '&:focus-visible': {
          outline: 'none',
          'box-shadow': '0 0 0 1px var(--color-accent-7)',
        },
      },
    })
  }),
],
```

Note: We use `box-shadow` instead of `ring-*` utilities so the focus ring utility is self-contained and doesn't depend on ring-color/ring-offset being set. Consumers just add `focus-ring` class.

Also add to the `extend.fontVariantNumeric` section (create if not present):
```ts
// Inside extend: {}
fontVariantNumeric: {
  tabular: 'tabular-nums',
},
```

**Step 4: Run typecheck + tests**

Run: `pnpm typecheck && pnpm test --filter @devalok/shilp-sutra`
Expected: All pass

**Step 5: Commit**

```bash
git add packages/core/src/tokens/typography-semantic.css packages/core/src/ui/lib/motion.ts packages/core/src/tailwind/preset.ts
git commit -m "style(tokens): heading tracking, motion alignment, focus-ring utility"
```

---

## Task 3: Core UI Components — Form Inputs & Controls

Polish all form-related components: Input, Textarea, Checkbox, Radio, Switch, Slider, Toggle, Select, Combobox, Number Input, Search Input.

**Files:**
- Modify: `packages/core/src/ui/input.tsx`
- Modify: `packages/core/src/ui/textarea.tsx`
- Modify: `packages/core/src/ui/checkbox.tsx`
- Modify: `packages/core/src/ui/radio.tsx`
- Modify: `packages/core/src/ui/switch.tsx`
- Modify: `packages/core/src/ui/slider.tsx`
- Modify: `packages/core/src/ui/toggle.tsx`
- Modify: `packages/core/src/ui/select.tsx`
- Modify: `packages/core/src/ui/combobox.tsx`
- Modify: `packages/core/src/ui/number-input.tsx`
- Modify: `packages/core/src/ui/search-input.tsx`
- Modify: `packages/core/src/ui/form.tsx`
- Modify: `packages/core/src/ui/label.tsx`

**Checklist of changes per component:**

**Input:**
- State borders (error/warning/success overrides): ensure parent CVA base already has `transition-colors` — it does (`transition-colors duration-fast-01`). The issue is the state overrides are applied via `cn()` outside CVA, so the transition already covers them. **Verify this — if borders snap, the override classes may need to include `transition-colors` explicitly.**
- Icon sizing: Change hardcoded `h-ico-sm w-ico-sm` for icons to be size-aware. Use a map: `{ sm: 'h-ico-sm w-ico-sm', md: 'h-ico-sm w-ico-sm', lg: 'h-ico-md w-ico-md' }`.

**Textarea:**
- Same state-border verification as Input.
- Add `cursor-ns-resize` alongside existing `resize-y`.

**Checkbox:**
- Add hover state to CVA base: `hover:border-accent-7 hover:bg-surface-4`
- Error: add `bg-error-2` alongside existing `border-error-7`

**Radio:**
- Add hover: `hover:border-accent-7 hover:bg-surface-4`
- Wrap indicator icon in `motion.div` with `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy}`

**Switch:**
- Unchecked track hover: add `data-[state=unchecked]:hover:bg-surface-4`
- Thumb press: add `whileTap={{ scale: 0.85 }}` to thumb's motion.div

**Slider:**
- Thumb: change `transition-[color,transform]` easing to `ease-productive-standard`
- Thumb hover: add `hover:shadow-02`
- Active scale: `active:scale-125` → `active:scale-[1.15]`

**Toggle:**
- Add `transition-colors duration-fast-01` to CVA base
- Outline variant: add `hover:border-surface-border-strong`

**Select:**
- SelectItem: add `hover:bg-surface-2` alongside existing `focus:bg-surface-2`
- Add `transition-colors duration-fast-01` to SelectItem

**Combobox:**
- Trigger open state: add conditional `open && 'border-accent-7 bg-surface-4'`
- Option: add `transition-colors duration-fast-01` to option className
- Pill close: replace `hover:opacity-75` with `hover:scale-110 hover:bg-surface-3 transition-transform`

**Number Input:**
- Add focus ring to input: `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-7`
- Stepper buttons: add `hover:bg-surface-3 active:scale-90 transition-[color,transform]`

**Search Input:**
- Wrap clear button in AnimatePresence: `initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={springs.snappy}`

**Form (FormHelperText):**
- Wrap FormHelperText in AnimatePresence with fade + slide:
  `initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={tweens.fade}`

**Label:**
- Add `transition-opacity duration-fast-01` to base class

**Step: Run tests**

Run: `pnpm test --filter @devalok/shilp-sutra`
Expected: All pass. These are CSS class changes; existing tests verify rendering, not specific classes.

**Step: Commit**

```bash
git add packages/core/src/ui/input.tsx packages/core/src/ui/textarea.tsx packages/core/src/ui/checkbox.tsx packages/core/src/ui/radio.tsx packages/core/src/ui/switch.tsx packages/core/src/ui/slider.tsx packages/core/src/ui/toggle.tsx packages/core/src/ui/select.tsx packages/core/src/ui/combobox.tsx packages/core/src/ui/number-input.tsx packages/core/src/ui/search-input.tsx packages/core/src/ui/form.tsx packages/core/src/ui/label.tsx
git commit -m "style(ui): polish form inputs & controls — hover states, transitions, animations"
```

---

## Task 4: Core UI Components — Buttons, Cards, Navigation & Feedback

Polish Button, IconButton, Card, Badge, Chip, Link, Breadcrumb, Pagination, Tabs, Accordion, Alert, Dialog, Sheet, Dropdown Menu, Tooltip, Toast, Toggle Group, Button Group, Progress, Separator, Skeleton, Code, Popover.

**Files:**
- Modify: `packages/core/src/ui/button.tsx`
- Modify: `packages/core/src/ui/card.tsx`
- Modify: `packages/core/src/ui/badge.tsx`
- Modify: `packages/core/src/ui/chip.tsx`
- Modify: `packages/core/src/ui/link.tsx`
- Modify: `packages/core/src/ui/breadcrumb.tsx`
- Modify: `packages/core/src/ui/pagination.tsx`
- Modify: `packages/core/src/ui/tabs.tsx`
- Modify: `packages/core/src/ui/accordion.tsx`
- Modify: `packages/core/src/ui/alert.tsx`
- Modify: `packages/core/src/ui/dialog.tsx`
- Modify: `packages/core/src/ui/sheet.tsx`
- Modify: `packages/core/src/ui/dropdown-menu.tsx`
- Modify: `packages/core/src/ui/tooltip.tsx`
- Modify: `packages/core/src/ui/toast.tsx`
- Modify: `packages/core/src/ui/progress.tsx`
- Modify: `packages/core/src/ui/separator.tsx`
- Modify: `packages/core/src/ui/skeleton.tsx`
- Modify: `packages/core/src/ui/code.tsx`
- Modify: `packages/core/src/ui/avatar.tsx`

**Checklist of changes per component:**

**Button:**
- Active scale: `active:scale-[0.97]` → `active:scale-[0.95]`
- Add `transition-colors duration-fast-01` to outline + ghost variant strings
- Add `disabled:cursor-not-allowed` to base CVA

**Card:**
- Interactive whileHover: `y: -2` → `y: -3`
- Outline variant: `border-2` → `border`
- Non-interactive: add `transition-shadow duration-fast-02` to base CVA
- CardTitle: `tracking-ds-tight` → `tracking-normal`

**Badge:**
- Add `transition-colors duration-fast-01` to base CVA
- Dismiss button: add `hover:scale-110` alongside existing `hover:rotate-90`

**Chip:**
- Make hover color-aware: replace generic `hover:bg-surface-4` with per-color hover maps
- Tap scale: `0.95` → `0.97`
- Add focus-ring to clickable chips: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9`
- Dismiss active: add `active:scale-90`

**Link:**
- Underline animation: replace `underline` with `decoration-transparent hover:decoration-current transition-all duration-fast-01`
  Keep `underline-offset-2`
- Add `active:opacity-80`

**Breadcrumb:**
- BreadcrumbPage: `font-normal` → `font-medium`
- Link: add `duration-fast-01` to existing `transition-colors`
- BreadcrumbItem gap: `gap-ds-02b` → `gap-ds-03`

**Pagination:**
- PaginationLink: add `active:scale-95` and `tabular-nums`
- Ensure `transition-colors` has `duration-fast-01`

**Tabs:**
- TabsContent: wrap children in `motion.div` with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tweens.fade}`

**Accordion:**
- AccordionTrigger: replace `hover:underline` with `hover:bg-surface-2 rounded-ds-md`
- Add `data-[state=open]:bg-surface-2` to trigger
- AccordionContent inner: add `pt-ds-02` for breathing room

**Alert:**
- Dismiss button: add `active:scale-95` and ensure `duration-fast-01`
- Body: replace `opacity-[0.9]` with `text-surface-fg-muted`

**Dialog:**
- Close button: add `duration-fast-01` to transition-colors and `active:scale-90`

**Sheet:**
- Close button: add `active:scale-90`

**Dropdown Menu:**
- MenuItem: add `hover:bg-surface-2` alongside existing `focus:bg-surface-2`
- Add `transition-colors duration-fast-01` to MenuItem base
- Add `active:bg-surface-3`

**Tooltip:**
- Exit transition: use lower stiffness spring for faster exit

**Toast:**
- Action button: add `hover:bg-surface-3` subtle background

**Progress:**
- Label: add `tabular-nums`

**Separator:**
- Add `variant` prop with `default` and `gradient`:
  - gradient: `bg-[image:linear-gradient(90deg,transparent,var(--color-surface-border)_15%,var(--color-surface-border)_85%,transparent)] bg-transparent`

**Skeleton:**
- Shimmer animation easing: change from `ease-linear` to `ease-in-out` in the keyframe definition (preset.ts or wherever `animate-skeleton-shimmer` is defined)
- Add `[background-attachment:fixed]` to shimmer variant class

**Code:**
- Block: `border-surface-border` → `border-surface-border-strong`
- Inline: add `border border-surface-border`

**Avatar:**
- **BUG FIX**: AvatarFallback must use `ringShapeMap[resolvedShape]` or equivalent for border-radius (currently hardcodes `rounded-ds-full`)

**Step: Run tests**

Run: `pnpm test --filter @devalok/shilp-sutra`
Expected: All pass

**Step: Commit**

```bash
git add packages/core/src/ui/*.tsx
git commit -m "style(ui): polish buttons, cards, navigation, overlays, feedback components"
```

---

## Task 5: Composed & Shell Components

Polish all composed and shell components.

**Files:**
- Modify: `packages/core/src/composed/activity-feed.tsx`
- Modify: `packages/core/src/composed/avatar-group.tsx`
- Modify: `packages/core/src/composed/command-palette.tsx`
- Modify: `packages/core/src/composed/content-card.tsx`
- Modify: `packages/core/src/composed/empty-state.tsx`
- Modify: `packages/core/src/composed/global-loading.tsx`
- Modify: `packages/core/src/composed/loading-skeleton.tsx`
- Modify: `packages/core/src/composed/member-picker.tsx`
- Modify: `packages/core/src/composed/page-header.tsx`
- Modify: `packages/core/src/composed/priority-indicator.tsx`
- Modify: `packages/core/src/composed/status-badge.tsx`
- Modify: `packages/core/src/composed/rich-text-editor.tsx`
- Modify: `packages/core/src/composed/schedule-view.tsx`
- Modify: `packages/core/src/composed/date-picker/calendar-grid.tsx`
- Modify: `packages/core/src/shell/sidebar.tsx`
- Modify: `packages/core/src/shell/top-bar.tsx`
- Modify: `packages/core/src/shell/bottom-navbar.tsx`
- Modify: `packages/core/src/shell/notification-center.tsx`

**Checklist — Composed:**

**Activity Feed:**
- Add stagger to items: `transition={{ delay: index * 0.03 }}` on each ActivityFeedItem
- Chevron: add `transition-transform duration-fast-02` (if missing)
- Expandable rows: add `hover:bg-surface-2 rounded-ds-md cursor-pointer`

**Avatar Group:**
- Add stagger scale-in per avatar: `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...springs.bouncy, delay: index * 0.05 }}`
- Individual hover: add `hover:scale-110 hover:z-10 transition-transform duration-fast-02` to each avatar wrapper

**Command Palette:**
- Kbd elements: add `shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]` (light) / dark mode: `shadow-[inset_0_-1px_0_rgba(255,255,255,0.1)]`

**Content Card:**
- Add `will-change-[box-shadow]` to base for jank-free shadow transitions

**Empty State:**
- Stagger: icon appears first, text fades in 200ms later using `motion.div` with delay

**Global Loading:**
- Add glow at 100%: style the bar with `style={{ boxShadow: state === 'complete' ? '0 0 8px var(--color-accent-9)' : 'none' }}`

**Loading Skeleton:**
- Verify shimmer variant uses `[background-attachment:fixed]` (may need to add to Skeleton component directly or to the composed wrappers)

**Member Picker:**
- Selected state: change from `bg-surface-3` to `bg-accent-2 text-accent-11`
- Checkmark: wrap in `motion.span` with `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy}`
- Search input: add `focus-visible:ring-1 focus-visible:ring-accent-7`
- Item: add `transition-colors duration-fast-01`

**Page Header:**
- Title: add `font-semibold`
- Breadcrumb links: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 rounded-ds-sm`

**Priority Indicator:**
- URGENT: add a subtle animation to differentiate from HIGH: `animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}`

**Status Badge:**
- Morph transition: add `scale` to AnimatePresence: `initial={{ opacity: 0.6, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}`

**Rich Text Editor:**
- Toolbar buttons: add `transition-colors duration-fast-01`

**Schedule View:**
- Event hover: add `hover:shadow-01 transition-[box-shadow,transform] duration-fast-02 hover:scale-[1.02]`
- Now indicator: wrap dot in `motion.div` with pulse: `animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}`

**Calendar Grid:**
- Day click: add brief scale animation
- Nav buttons: add focus-visible ring

**Checklist — Shell:**

**Sidebar:**
- Nav items: add `transition-colors duration-fast-02` to both active and inactive variants
- Chevron: add `ease-productive-standard` to `transition-transform`
- Promo banner: add `shadow-01`

**Top Bar:**
- Icon buttons: add `active:scale-90 transition-transform duration-fast-01`
- Theme toggle: add `transition-transform` to icon wrapper for rotation

**Bottom Navbar:**
- More menu modal: add AnimatePresence with `initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={springs.smooth}`
- Nav links: add `transition-colors duration-fast-02`

**Notification Center:**
- Notification items: add stagger using MotionStagger/MotionStaggerItem or manual `delay: index * 0.03`
- Dismiss button: add `transition-opacity duration-fast-01`
- Dot opacity: add `transition-opacity duration-fast-02`

**Step: Run tests**

Run: `pnpm test --filter @devalok/shilp-sutra`
Expected: All pass

**Step: Commit**

```bash
git add packages/core/src/composed/ packages/core/src/shell/
git commit -m "style(composed,shell): polish composed & shell components"
```

---

## Task 6: Karm Domain Components

Polish all karm package components.

**Files:**
- Modify: `packages/karm/src/board/task-card.tsx`
- Modify: `packages/karm/src/board/task-card-compact.tsx`
- Modify: `packages/karm/src/board/board-column.tsx`
- Modify: `packages/karm/src/board/column-header.tsx`
- Modify: `packages/karm/src/board/column-empty.tsx`
- Modify: `packages/karm/src/board/board-toolbar.tsx`
- Modify: `packages/karm/src/admin/breaks.tsx` (or equivalent table files)
- Modify: `packages/karm/src/admin/break-balance.tsx`
- Modify: `packages/karm/src/admin/attendance-overview.tsx`
- Modify: `packages/karm/src/chat/chat-panel.tsx`
- Modify: `packages/karm/src/chat/conversation-list.tsx`
- Modify: `packages/karm/src/dashboard/daily-brief.tsx`
- Modify: `packages/karm/src/dashboard/week-heatmap.tsx`
- Modify: `packages/karm/src/client/project-card.tsx`
- Modify: `packages/karm/src/tasks/task-detail-panel.tsx`

**Checklist:**

**TaskCard:**
- Drag handle: add `transition-opacity duration-fast-02`
- Blocked indicator: add `animate-pulse` to the `border-l-error-9` bar (via a wrapper or CSS)

**BoardColumn:**
- Column header: consider adding top accent bar from COLUMN_ACCENT_COLORS (a 2px `border-t` with column color)
- WIP exceeded: add `ring-1 ring-error-7` for stronger visual

**Admin Tables (Breaks, BreakBalance, etc.):**
- All table rows: add `transition-colors duration-fast-01` to hover states
- Headers: ensure consistent `font-semibold uppercase tracking-wider text-ds-xs text-surface-fg-subtle`

**Attendance Overview:**
- Avatar groups: add hover scale on individual avatars (via className)

**Chat:**
- Conversation list actions: add `transition-opacity duration-fast-01` to `group-hover:opacity-100` elements

**Dashboard:**
- DailyBrief chevron: change to `springs.snappy` if currently using CSS transition
- Heatmap cells: add `hover:ring-1 hover:ring-accent-7 transition-all duration-fast-01`

**ProjectCard:**
- Add `hover:scale-[1.01]` alongside existing shadow lift
- Progress bar: use `motion.div` with `springs.smooth` for animated width

**TaskDetailPanel:**
- Tab content: add fade transition (same pattern as Task 4 Tabs fix)

**Step: Run tests**

Run: `pnpm test --filter @devalok/shilp-sutra-karm`
Expected: All pass

**Step: Commit**

```bash
git add packages/karm/src/
git commit -m "style(karm): polish board, admin, chat, dashboard, client components"
```

---

## Task 7: Verification & Final Audit

**Step 1: Run full test suite**

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Expected: All pass

**Step 2: Run build**

```bash
pnpm build
```

Expected: Clean build, no errors

**Step 3: Visual review in Storybook**

```bash
cd packages/core && pnpm storybook
```

Check:
- Shadows look natural (not flat, not overdone)
- Transitions feel smooth (no snapping)
- Focus rings appear consistently on Tab navigation
- Dark mode shadows and focus rings work
- Headings look tighter (letter-spacing change)
- Skeleton shimmer syncs across page

**Step 4: Commit any Storybook-discovered fixes**

```bash
git add -A && git commit -m "fix(ui): address Storybook review findings"
```

---

## Parallelization Strategy

Tasks 1-2 are sequential (foundation must come first).
Tasks 3-6 can run in parallel (each touches different files):

```
Task 1 → Task 2 → ┬─ Task 3 (form inputs)
                   ├─ Task 4 (buttons, cards, nav)
                   ├─ Task 5 (composed + shell)
                   └─ Task 6 (karm)
                   → Task 7 (verification)
```

Each parallel task should run in an isolated worktree to avoid merge conflicts.

---

## Risk Notes

- **Shadow changes** are drop-in (same CSS var names) — zero breakage risk
- **Focus ring utility** is additive — existing hardcoded rings still work; refactoring is optional follow-up
- **Motion alignment** may subtly change animation feel — verify in Storybook
- **Avatar fallback bug** is a real fix, not just polish — test with square/rounded shapes
- **Separator gradient variant** adds a new prop — backward compatible (default stays same)
- **Dropdown/Select hover** is the highest-value fix — mouse users currently get no feedback
