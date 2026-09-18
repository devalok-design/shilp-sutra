# Button System Enhancement Design

**Date:** 2026-03-02
**Status:** Approved

## Goal

Enhance the core `Button` (`src/ui/button.tsx`) with icon support, loading state, icon-only mode, and button groups — inspired by MUI's button API. Then retire `CustomButton` and deprecated `IconButton` from `karm/custom-buttons/`.

## Current State

- `src/ui/button.tsx` — 6 variants, 6 sizes (3 text + 3 icon), `asChild` support via Radix Slot, CVA-based
- `src/karm/custom-buttons/CustomButton.tsx` — Material-inspired with `leftIcon`/`rightIcon`, ripple, shake
- `src/karm/custom-buttons/icon-button.tsx` — Deprecated icon-only button
- `src/ui/spinner.tsx` — Existing spinner component with sm/md/lg sizes

## Design

### 1. Enhanced Button Props

```tsx
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  startIcon?: React.ReactNode   // Icon before text
  endIcon?: React.ReactNode     // Icon after text
  loading?: boolean             // Shows spinner, disables interaction
  loadingPosition?: 'start' | 'end' | 'center'  // Default: 'start'
  fullWidth?: boolean           // width: 100%
}
```

**Behavior:**
- `startIcon` / `endIcon` render inside the button with auto-sized wrappers
- Icon size maps to button size: sm→16px, md→18px, lg→20px
- `loading=true` replaces the icon at `loadingPosition` with `<Spinner>`, sets `aria-busy="true"`, disables the button
- `loading` with `loadingPosition="center"` hides children and shows spinner centered
- `fullWidth` adds `w-full` class

### 2. IconButton Component

New file: `src/ui/icon-button.tsx`

```tsx
interface IconButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth' | 'loadingPosition'> {
  icon: React.ReactNode
  'aria-label': string           // Required — WCAG AA
  shape?: 'square' | 'circle'   // Default: 'square'
}
```

**Behavior:**
- Thin wrapper around `Button` — maps `size` to `icon-{size}`, passes `icon` as children
- `shape="circle"` adds `rounded-full` override
- Loading state replaces icon with spinner
- aria-label required at type level

### 3. ButtonGroup Component

New file: `src/ui/button-group.tsx`

```tsx
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  orientation?: 'horizontal' | 'vertical'  // Default: 'horizontal'
}
```

**Behavior:**
- React context passes `variant`/`size` to child Buttons (children can override)
- Horizontal: connected borders — inner buttons lose adjacent border-radius
- Vertical: same logic for top/bottom radius
- Uses CSS `[&>*:not(:first-child):not(:last-child)]` selectors for border-radius removal

### 4. File Changes

**Modified:**
- `src/ui/button.tsx` — Add startIcon, endIcon, loading, fullWidth props
- `src/ui/button.stories.tsx` — Add stories for new features
- `src/ui/button.test.tsx` — Add tests for new features
- `src/ui/index.ts` — Export IconButton, ButtonGroup

**New:**
- `src/ui/icon-button.tsx` — IconButton component
- `src/ui/icon-button.stories.tsx` — IconButton stories
- `src/ui/button-group.tsx` — ButtonGroup component + context
- `src/ui/button-group.stories.tsx` — ButtonGroup stories

**Migration (delete after consumer updates):**
- Update ~12 consumers in `src/karm/admin/` from CustomButton/IconButton → Button/IconButton
- Delete: `CustomButton.tsx`, `icon-button.tsx`, `use-button-state.ts`, `use-ripple.ts`
- Keep: `segmented-control.tsx`
- Update: `src/karm/custom-buttons/index.ts`, `src/karm/index.ts`

### 5. NOT Adding (YAGNI)

- No ripple/shake animations (deferred)
- No `color` prop (variant handles color intent)
- No `disableElevation` / `disableRipple`
- No `href` prop (use `asChild` with `<a>`)

### 6. Accessibility

- `loading` sets `aria-busy="true"` and `disabled`
- `IconButton` requires `aria-label` at type level
- All focus states preserved (existing focus-visible ring)
- Spinner includes `sr-only` "Loading..." text (already in Spinner component)
