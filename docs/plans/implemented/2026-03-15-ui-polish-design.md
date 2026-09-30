# UI Polish & Micro-Refinement Design

**Date**: 2026-03-15
**Status**: Approved
**Scope**: ~150 improvements across tokens + all components

---

## Overview

Audit-driven polish pass to elevate shilp-sutra from B+ to A grade. Two phases: foundation token changes that cascade everywhere, then targeted per-component fixes.

---

## Phase 1: Foundation Token & Utility Improvements

### 1A. Multi-Layered Shadows

Replace single-layer shadows with 3-layer stacks (contact + main + ambient). Drop-in replacement — same token names, richer output.

**primitives.css changes:**

```css
/* Light mode */
--shadow-01: 0 1px 1px oklch(0 0 0 / 0.06), 0 1px 3px oklch(0 0 0 / 0.10), 0 2px 6px oklch(0 0 0 / 0.08);
--shadow-02: 0 1px 2px oklch(0 0 0 / 0.08), 0 4px 8px oklch(0 0 0 / 0.12), 0 8px 24px oklch(0 0 0 / 0.10);
--shadow-03: 0 2px 4px oklch(0 0 0 / 0.08), 0 8px 16px oklch(0 0 0 / 0.12), 0 16px 40px oklch(0 0 0 / 0.10);
--shadow-04: 0 2px 4px oklch(0 0 0 / 0.10), 0 12px 24px oklch(0 0 0 / 0.14), 0 24px 56px oklch(0 0 0 / 0.12);
--shadow-05: 0 4px 8px oklch(0 0 0 / 0.10), 0 16px 32px oklch(0 0 0 / 0.16), 0 32px 64px oklch(0 0 0 / 0.14);

/* Dark mode — multiply each opacity by ~2.5x */
--shadow-01: 0 1px 1px oklch(0 0 0 / 0.15), 0 1px 3px oklch(0 0 0 / 0.25), 0 2px 6px oklch(0 0 0 / 0.20);
--shadow-02: 0 1px 2px oklch(0 0 0 / 0.20), 0 4px 8px oklch(0 0 0 / 0.30), 0 8px 24px oklch(0 0 0 / 0.25);
--shadow-03: 0 2px 4px oklch(0 0 0 / 0.20), 0 8px 16px oklch(0 0 0 / 0.30), 0 16px 40px oklch(0 0 0 / 0.25);
--shadow-04: 0 2px 4px oklch(0 0 0 / 0.25), 0 12px 24px oklch(0 0 0 / 0.35), 0 24px 56px oklch(0 0 0 / 0.30);
--shadow-05: 0 4px 8px oklch(0 0 0 / 0.25), 0 16px 32px oklch(0 0 0 / 0.40), 0 32px 64px oklch(0 0 0 / 0.35);
```

### 1B. Heading Letter-Spacing

Update `semantic.css` typography tokens:

| Size | Current tracking | New tracking |
|------|-----------------|--------------|
| heading-2xl (60px) | `-0.02em` | `-0.025em` |
| heading-xl (48px) | `-0.02em` | `-0.025em` |
| heading-lg (36px) | `-0.02em` | `-0.02em` (unchanged) |
| heading-md (32px) | `-0.02em` | `-0.02em` (unchanged) |
| heading-sm (24px) | `-0.02em` | `-0.015em` |
| heading-xs (20px) | `0` | `0` (unchanged) |

### 1C. Focus Ring Utility

Add Tailwind plugin in `preset.ts`:

```ts
plugin(({ addUtilities }) => {
  addUtilities({
    '.focus-ring': {
      '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2': {},
    },
    '.focus-ring-inset': {
      '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-inset': {},
    },
    '.focus-ring-sm': {
      '@apply focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-7': {},
    },
  })
})
```

Then refactor all 30+ hardcoded instances to use the utility.

### 1D. Motion Token Alignment

In `motion.ts`:
- `tweens.fade.duration`: `0.15` → `0.11` (align with `duration-fast-02`)
- `tweens.colorShift.duration`: `0.1` → `0.07` (align with `duration-fast-01`)

Audit all hardcoded `duration-100`/`duration-200` in components → replace with `duration-fast-01`/`duration-fast-02`.

### 1E. Gradient-Fade Separator Variant

Add to Separator component:

```tsx
variant: {
  default: 'bg-surface-border',
  gradient: 'bg-gradient-to-r from-transparent via-surface-border to-transparent',
}
```

Add gradient token in `semantic.css`:
```css
--gradient-divider: linear-gradient(90deg, transparent, var(--color-surface-border) 15%, var(--color-surface-border) 85%, transparent);
```

### 1F. Tabular Nums Utility

Add to `preset.ts` extend:
```ts
fontVariantNumeric: { tabular: 'tabular-nums' }
```

Apply to: Pagination, NumberInput, ColumnHeader WIP, dashboard metrics, task IDs, timer displays.

---

## Phase 2: Per-Component Polish

### Core UI Components

#### Accordion
- Add `hover:bg-surface-2` to trigger (replace bare `hover:underline`)
- Add `data-[state=open]:bg-surface-2` for open state background
- Add `pt-ds-02` breathing room to content
- Chevron: upgrade color to `text-surface-fg-subtle`

#### Alert
- Dismiss button: add `active:scale-95` and `duration-fast-01`
- Body: replace `opacity-[0.9]` with semantic `text-surface-fg-muted`

#### Avatar
- **BUG FIX**: Fallback must respect `shape` prop (currently hardcodes `rounded-ds-full`)
- Derive badge sizing from avatar size tokens
- Inset status dot position slightly

#### Badge
- Add `transition-colors duration-fast-01` to base CVA
- Dismiss button: add `hover:scale-110`

#### Breadcrumb
- Current page: `font-normal` → `font-medium`
- Link transitions: add `duration-fast-01`
- Base gap: `gap-ds-02b` → `gap-ds-03`

#### Button
- Active scale: `0.97` → `0.95`
- Add `transition-colors duration-fast-01` to outline/ghost variants
- Add `disabled:cursor-not-allowed`
- Link variant: respect `color` prop instead of hardcoding `text-info-11`

#### Card
- Interactive hover: `y: -2` → `y: -3`
- Outline variant: `border-2` → `border`
- Add `transition-shadow duration-fast-02` to non-interactive cards
- CardTitle: `tracking-ds-tight` → `tracking-normal`

#### Checkbox
- Add hover state: `hover:border-accent-7 hover:bg-surface-4`
- Error state: add `bg-error-2` background tint
- Check animation: add subtle `rotate: [0, 12, 0]`

#### Chip
- Color-aware hover (e.g., `hover:bg-success-4` for success chips)
- Tap scale: `0.95` → `0.97`
- Add `focus-ring` to clickable chips
- Dismiss: add `active:scale-90`

#### Code
- Block border: `border-surface-border` → `border-surface-border-strong`
- Inline: add `border border-surface-border`
- Add copy-to-clipboard button on block variant

#### Combobox
- Open state on trigger: `border-accent-7 bg-surface-4`
- Option highlight: add `transition-colors duration-fast-01`
- Pill close: `hover:opacity-75` → `hover:scale-110 hover:bg-surface-3`
- Empty state: wrap in motion.div with fade

#### Dialog
- Close button: add `duration-fast-01` and `active:scale-90`

#### Dropdown Menu
- **CRITICAL**: Add `hover:bg-surface-2` to MenuItem, CheckboxItem, RadioItem
- Add `transition-colors duration-fast-01` to focus states
- Add `active:bg-surface-3` pressed feedback

#### Form / FormHelperText
- Wrap helper text in AnimatePresence with fade + slide-up
- State color transitions: wrap in motion with colorShift tween

#### Input / Textarea
- State borders: add `transition-colors duration-fast-02`
- Scale icons per input size: sm→ico-sm, lg→ico-md
- Textarea: style resize handle

#### Label
- Add `transition-opacity duration-fast-01`

#### Link
- Underline animation: `decoration-transparent hover:decoration-current transition-all duration-fast-01`
- Add `active:opacity-80`

#### Number Input
- Add `focus-ring-sm` to input
- Stepper buttons: add `active:scale-90 transition-transform hover:bg-surface-3`

#### Pagination
- Add `active:scale-95`
- Add `transition-colors duration-fast-01`
- Add `tabular-nums`

#### Popover
- Add side-based initial offset (like Tooltip)

#### Progress
- Add `tabular-nums` to label
- Track: subtle shimmer overlay during indeterminate

#### Radio
- Add hover: `hover:border-accent-7 hover:bg-surface-4`
- Animate indicator with `springs.bouncy` scale-in

#### Search Input
- Clear button: wrap in AnimatePresence with opacity + scale
- Icon padding: hardcoded → token-based

#### Select
- Add `hover:bg-surface-2` to SelectItem (same as DropdownMenu fix)
- Add `transition-colors duration-fast-01`

#### Separator
- Add `gradient` variant (Phase 1E)

#### Sheet
- Close button: add `active:scale-90`

#### Skeleton
- Shimmer easing: `linear` → `ease-in-out`
- Add `background-attachment: fixed` for synced shimmer

#### Slider
- Thumb easing: add `ease-productive-standard`
- Thumb hover: add `hover:shadow-02`
- Active scale: `1.25` → `1.15`

#### Switch
- Unchecked hover: `hover:bg-surface-4` on track
- Thumb press: `whileTap={{ scale: 0.85 }}`

#### Tabs
- Tab content: add fade transition on TabsContent
- Line variant: add faint preview underline on hover

#### Toast
- Action button: add `hover:bg-surface-3`

#### Toggle
- Add `transition-colors duration-fast-01` for state changes
- Outline: `hover:border-surface-border-strong`

#### Tooltip
- Exit: faster spring (lower stiffness) than entry

### Composed Components

#### Activity Feed
- Item stagger: `delay: index * 0.03s`
- Chevron: `transition-transform duration-fast-02`
- Expandable rows: `hover:bg-surface-2 rounded-ds-md`

#### Avatar Group
- Mount stagger: scale-in per avatar (50ms delay)
- Individual hover: `hover:scale-110 hover:shadow-02 hover:z-10`

#### Command Palette
- Kbd: add inset shadow `shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]`
- Smooth scroll-into-view

#### Content Card
- Add `will-change-[box-shadow]` for jank-free shadow transitions

#### Empty State
- Stagger: icon first, text 200ms later
- Icon wrapper: subtle gradient background

#### Global Loading
- Add glow at 100%: `shadow-[0_0_8px_var(--color-accent-9)]`

#### Loading Skeleton
- Add `background-attachment: fixed`
- Stagger rows: `animation-delay` per row (50ms)

#### Member Picker
- Selected state: `bg-accent-2 text-accent-11` (differentiate from hover)
- Checkmark: springs.bouncy scale-in
- Search input: focus-ring-sm
- Item transitions: duration-fast-01

#### Page Header
- Title: add `font-semibold`
- Breadcrumb links: add focus-ring

#### Priority Indicator
- Differentiate URGENT from HIGH (pulse animation)

#### Status Badge
- Add scale to morph: `scale: [0.95, 1]`
- Dot: scale-in animation

#### Date Picker / Calendar
- Day click: brief `scale(1.05)`
- Nav buttons: focus-ring
- Time picker: scroll-snap-type

#### Rich Text Editor
- Link form: slide-down + fade entrance
- Toolbar buttons: transition-colors duration-fast-01

#### Schedule View
- Event hover: `hover:shadow-01 hover:scale-[1.02]`
- Now indicator: pulse animation
- Alternate grid line weights

### Shell Components

#### Sidebar
- Active indicator: slide-in transition
- Chevron: ease-productive-standard
- Nav items: transition-colors duration-fast-02
- Promo banner: shadow-01 + subtle gradient

#### Top Bar
- Icon buttons: `active:scale-90 transition-transform`
- Theme toggle: rotate icon on toggle
- Notification badge: zoom-in-75 entrance

#### Bottom Navbar
- More menu: slide-up + fade entrance
- Nav link: transition-colors duration-fast-02

#### Notification Center
- Items: stagger fade-in + slide-right (50ms delay)
- Dismiss button: transition-opacity duration-fast-01
- Read/unread dot: transition-opacity duration-fast-02

### Karm Domain Components

#### TaskCard
- Drag handle: transition-opacity duration-fast-02
- Due date: colored badge based on urgency
- Blocked indicator: subtle pulse

#### Board Column
- WIP exceeded: pulse or stronger border
- Column accent: top-border bar from COLUMN_ACCENT_COLORS

#### Admin Tables
- Row hover: transition-colors duration-fast-01
- Sticky headers: sticky top-0 bg-surface-2 shadow-01 z-raised
- Header typography: font-semibold uppercase tracking-wider text-ds-xs

#### Calendar (Admin)
- Day selection: scale(1.05) bounce
- Today: pulse ring
- Month nav: slide transition

#### Chat Panel
- Message stagger: delay index * 0.02s
- Agent selector: left accent bar on selected

#### Dashboard
- Skeleton: shimmer with background-attachment fixed
- Chevron: springs.snappy
- Heatmap cells: hover:ring-1 ring-accent-7 hover:scale-105

#### ProjectCard
- Hover: scale-[1.01] alongside shadow lift
- Progress bar: motion.div with springs.smooth
- Status badge: morph animation

---

## Implementation Strategy

**Phase 1 (Foundation)**: 6 token/utility changes — all components benefit automatically.
**Phase 2 (Components)**: ~150 individual fixes, parallelizable by package:
- Stream A: Core UI components (accordion → tooltip)
- Stream B: Composed + Shell components
- Stream C: Karm domain components

Each stream can be a separate worktree agent working in parallel.

## Risk Assessment

- Shadow changes are drop-in (same token names) — low risk
- Focus ring refactor touches many files — medium risk, test thoroughly
- Motion alignment may affect animation feel — verify in Storybook
- Component-level changes are isolated — low risk per change

## Testing

- Visual regression via Storybook review
- `pnpm typecheck && pnpm lint && pnpm test` gate
- Manual dark mode verification for shadow/focus changes
- Reduced motion verification for new animations
