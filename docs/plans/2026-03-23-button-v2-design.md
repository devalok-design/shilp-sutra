# Button v2 — Complete Variant System Overhaul

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Button's limited two-axis system (4 variants × 2 colors) with a fully fleshed-out, industry-grade component that natively supports every interaction pattern in the design system — pills, soft/muted actions, semantic colors, and compact density — without className hacks.

**Architecture:** CVA-based compound variant matrix. Two primary axes — `variant` (visual style: solid, soft, outline, ghost, link) × `color` (semantic intent: accent, error, success, warning, neutral) = 25 first-class combinations. New `shape` prop for pill buttons. New compact sizes for dense UI. Backward-compatible deprecated aliases for `default`, `destructive` variants and `default` color. Token expansion adds missing status color steps (4, 5, 10) to semantic.css.

**Tech Stack:** React 18, TypeScript 5.7, CVA, Tailwind 3.4, Framer Motion, shilp-sutra token system.

**Design Doc:** `docs/plans/2026-03-23-button-v2-design.md`

**Research basis:** Radix Themes, Chakra UI v3, Mantine, MUI, Adobe Spectrum, Ant Design, Shadcn/ui — synthesized best practices from all seven.

---

## Conventions

**File:** `packages/core/src/ui/button.tsx` (modify in place — single file component).

**Tests:** `packages/core/src/ui/button.test.tsx` (extend existing 27 tests).

**Stories:** `packages/core/src/ui/button.stories.tsx` (overhaul existing 46 stories).

**Playground:** `button-v2-playground.html` (root, self-contained visual explorer).

**Commit after each task.** Conventional commits: `feat(core):`, `test(core):`, `fix(core):`.

---

## The New Button API

### Variant axis — visual style (how it looks)

| Variant | Rest | Hover | Active | Use case |
|---------|------|-------|--------|----------|
| `solid` | Filled bg, white text, shadow | Darker bg | Darker bg | Primary CTAs, prominent actions |
| `soft` | **NEW** — Tinted bg (step 3), colored text (step 11) | Step 4 bg | Step 5 bg | Secondary actions, pills, status indicators, tags |
| `outline` | Transparent, colored border (step 7), colored text (step 11) | Subtle bg (step 2) | Darker bg | Secondary buttons, form actions |
| `ghost` | Transparent, muted text | Surface bg | Darker surface bg | Toolbars, icon buttons, minimal actions |
| `link` | Colored text, no bg | Underline | Opacity 80% | Inline text actions |

**Removed:** `default` (alias → `solid`), `destructive` (alias → `solid` + `error`). Both kept as deprecated runtime aliases.

### Color axis — semantic intent (what it means)

| Color | Token scale | Solid bg | Soft bg | Text | Border |
|-------|-----------|----------|---------|------|--------|
| `accent` | accent-* | accent-9 | accent-3 | accent-11 | accent-7 |
| `error` | error-* | error-9 | error-3 | error-11 | error-7 |
| `success` | success-* | success-9 | success-3 | success-11 | success-7 |
| `warning` | warning-* | warning-3 | warning-3 | warning-11 | warning-7 |
| `neutral` | surface-* | surface-raised-active | surface-raised | surface-fg-muted | surface-border |

**Renamed:** `default` → `accent`. Old name kept as deprecated alias.

### Shape prop — border radius

| Shape | Radius | Use case |
|-------|--------|----------|
| `default` | Per-size (sm→md→lg) | Standard buttons |
| `pill` | `rounded-full` | Status pills, filter chips, tags |

### Weight prop (already added)

| Weight | Font | Use case |
|--------|------|----------|
| `semibold` | `font-semibold` (default) | CTAs, prominent actions |
| `normal` | `font-normal` | Menu items, subtle controls |

### Size axis (unchanged + compact additions)

| Size | Height | Padding | Font | Use case |
|------|--------|---------|------|----------|
| `xs` | 28px | px-ds-03 | text-ds-sm | Compact UI, inline |
| `sm` | 32px | px-ds-04 | text-ds-sm | Secondary, forms |
| `md` | 40px | px-ds-05 | text-ds-md | Default CTA |
| `lg` | 48px | px-ds-06 | text-ds-base | Hero, modal primary |
| `compact-xs` | auto | px-ds-02 py-ds-01 | text-ds-sm | **NEW** — Dense lists, property rows |
| `compact-sm` | auto | px-ds-03 py-ds-01b | text-ds-sm | **NEW** — Dense toolbars |
| `compact-md` | auto | px-ds-04 py-ds-02 | text-ds-md | **NEW** — Dense forms |
| `icon-*` | square | — | — | Icon-only (unchanged) |

Compact sizes use padding-only height (no fixed `h-*`), making them content-driven. Perfect for popover options and property editors.

---

## Compound Variant Matrix (25 combinations)

### solid × colors

```
solid + accent:  bg-accent-9  text-accent-fg  hover:bg-accent-10  active:bg-accent-10  shadow-raised hover:shadow-brand
solid + error:   bg-error-9   text-error-fg   hover:bg-error-10   active:bg-error-10   shadow-raised
solid + success: bg-success-9 text-success-fg hover:bg-success-10 active:bg-success-10 shadow-raised
solid + warning: bg-warning-9 text-warning-fg hover:bg-warning-10 active:bg-warning-10 shadow-raised
solid + neutral: bg-surface-3 text-surface-fg hover:bg-surface-4  active:bg-surface-4
```

### soft × colors

```
soft + accent:  bg-accent-3  text-accent-11  hover:bg-accent-4  active:bg-accent-5
soft + error:   bg-error-3   text-error-11   hover:bg-error-4   active:bg-error-5
soft + success: bg-success-3 text-success-11 hover:bg-success-4 active:bg-success-5
soft + warning: bg-warning-3 text-warning-11 hover:bg-warning-4 active:bg-warning-5
soft + neutral: bg-surface-raised text-surface-fg-muted hover:bg-surface-raised-hover active:bg-surface-raised-active
```

### outline × colors

```
outline + accent:  bg-transparent text-accent-11  border-accent-7  hover:bg-accent-2  active:bg-accent-3
outline + error:   bg-transparent text-error-11   border-error-7   hover:bg-error-2   active:bg-error-3
outline + success: bg-transparent text-success-11 border-success-7 hover:bg-success-2 active:bg-success-3
outline + warning: bg-transparent text-warning-11 border-warning-7 hover:bg-warning-2 active:bg-warning-3
outline + neutral: bg-transparent text-surface-fg  border-surface-border-strong hover:bg-surface-raised active:bg-surface-raised-active
```

### ghost × colors

```
ghost + accent:  bg-transparent text-accent-11       hover:bg-accent-3  hover:text-accent-11  active:bg-accent-4
ghost + error:   bg-transparent text-error-11        hover:bg-error-3   hover:text-error-11   active:bg-error-4
ghost + success: bg-transparent text-success-11      hover:bg-success-3 hover:text-success-11 active:bg-success-4
ghost + warning: bg-transparent text-warning-11      hover:bg-warning-3 hover:text-warning-11 active:bg-warning-4
ghost + neutral: bg-transparent text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg active:bg-surface-raised-active
```

### link × colors

```
link + accent:  text-accent-11       (base: underline-offset-4 hover:underline active:opacity-80)
link + error:   text-error-11
link + success: text-success-11
link + warning: text-warning-11
link + neutral: text-surface-fg-muted
```

**Note:** `ghost + neutral` is what the current `ghost + default` is. This ensures backward compatibility — the most-used ghost button looks identical.

---

## Token Expansion Required

The semantic token system currently has steps 3, 7, 9, 11 for status colors. The soft variant needs steps 4 and 5 (hover/active), and solid variant needs step 10 (hover). Outline needs step 2.

**Add to `packages/core/src/tokens/semantic.css`:**

```css
/* Error scale expansion */
--color-error-2:  oklch(from var(--color-red-2) l c h);
--color-error-4:  oklch(from var(--color-red-4) l c h);
--color-error-5:  oklch(from var(--color-red-5) l c h);
--color-error-10: oklch(from var(--color-red-10) l c h);

/* Success scale expansion */
--color-success-2:  oklch(from var(--color-green-2) l c h);
--color-success-4:  oklch(from var(--color-green-4) l c h);
--color-success-5:  oklch(from var(--color-green-5) l c h);
--color-success-10: oklch(from var(--color-green-10) l c h);

/* Warning scale expansion */
--color-warning-2:  oklch(from var(--color-yellow-2) l c h);
--color-warning-4:  oklch(from var(--color-yellow-4) l c h);
--color-warning-5:  oklch(from var(--color-yellow-5) l c h);
--color-warning-10: oklch(from var(--color-yellow-10) l c h);

/* Info scale expansion */
--color-info-2:  oklch(from var(--color-blue-2) l c h);
--color-info-4:  oklch(from var(--color-blue-4) l c h);
--color-info-5:  oklch(from var(--color-blue-5) l c h);
--color-info-10: oklch(from var(--color-blue-10) l c h);
```

**Add to Tailwind preset** (`packages/core/src/tailwind/preset.ts`):

Map new token steps to utilities: `bg-error-2`, `bg-error-4`, `bg-error-5`, `bg-error-10`, etc.

---

## Backward Compatibility

### Deprecated aliases (kept in CVA, log warnings in dev)

| Old API | Maps to |
|---------|---------|
| `variant="default"` | `variant="solid" color="accent"` |
| `variant="destructive"` | `variant="solid" color="error"` |
| `color="default"` | `color="accent"` |

### Breaking changes (acceptable)

| Change | Impact | Migration |
|--------|--------|-----------|
| `ghost + default` text color changes | Was `text-surface-fg-muted` | Now `ghost + neutral` (mapped automatically) |
| None — all existing prop combinations keep working | — | — |

The `ghost + default` (now `ghost + accent`) becomes `text-accent-11` instead of `text-surface-fg-muted`. To preserve the old behavior, consumers use `ghost + neutral`. But since `color="default"` maps to `color="accent"` AND we want the old ghost behavior to stay the same, the deprecated alias `color="default"` should map to `color="neutral"` ONLY for `ghost` variant. This is the one nuanced migration.

**Decision:** Keep `color="default"` mapping to `accent` for all variants (simplicity). Document the ghost color change. Consumers who want the old muted ghost use `color="neutral"` explicitly.

Actually — this is a regression risk. Let me reconsider. The safest approach: when both `variant` and `color` are unset (both falling back to defaults), the button renders as `solid + accent` (unchanged). When `variant="ghost"` and `color` is unset, it should still look the same as today. So `ghost`'s default color behavior should remain `neutral`-like.

**Resolution:** The `ghost` variant compound with `accent` color should use the same tokens as today's `ghost + default`:

```
ghost + accent: bg-transparent text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg active:bg-surface-raised-active
```

This means `ghost + accent` looks neutral (matching today), and consumers who want a colored ghost use `ghost + error`, `ghost + success`, etc. explicitly. This preserves 100% backward compat for the most common ghost button usage.

---

## ButtonGroup Updates

Propagate new props through context:

```typescript
interface ButtonGroupContextValue {
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  weight?: ButtonProps['weight']
  size?: ButtonProps['size']
  shape?: ButtonProps['shape']
}
```

---

## IconButton Updates

- Support new `color` values: `accent`, `error`, `success`, `warning`, `neutral`
- Keep existing `shape: 'square' | 'circle'` (separate from Button's `shape` prop)

---

## Phase Plan

### Phase 1: Token expansion
- Add steps 2, 4, 5, 10 to status color scales in semantic.css
- Update Tailwind preset to expose new steps
- Verify dark mode tokens

### Phase 2: Button CVA overhaul
- Rewrite buttonVariants with new variant × color matrix
- Add shape prop (applied in component, not CVA)
- Add compact sizes
- Keep weight prop
- Deprecated aliases for backward compat

### Phase 3: Component updates
- Update ButtonGroup context
- Update IconButton for new colors
- Update JSDoc and type exports

### Phase 4: Tests
- New tests for soft variant × all colors
- New tests for shape="pill"
- New tests for compact sizes
- New tests for success, warning, neutral colors
- Backward compat tests for deprecated aliases

### Phase 5: Stories
- Overhaul stories with full variant × color grid
- Add soft variant showcase
- Add pill shape showcase
- Add compact size showcase
- Add color semantic showcase

### Phase 6: Playground
- Self-contained HTML playground with live controls
- All variant × color × size × shape combinations
- Side-by-side comparison with real shilp-sutra tokens

### Phase 7: Migrate TaskPanel v3
- Replace all className hacks with native Button props
- Verify in Storybook

---

## Task Breakdown

### Task 1: Expand status color tokens

**Files:**
- Modify: `packages/core/src/tokens/semantic.css`
- Modify: `packages/core/src/tailwind/preset.ts`

**Step 1:** Add steps 2, 4, 5, 10 for error, success, warning, info in semantic.css (both light and dark themes). Map from existing primitive OKLCH scales.

**Step 2:** Update Tailwind preset to include the new token steps in the color config object.

**Step 3:** Verify: `pnpm --filter @devalok/shilp-sutra build` succeeds.

**Step 4:** Commit: `feat(core): expand status color tokens — add steps 2, 4, 5, 10`

---

### Task 2: Rewrite Button CVA variants

**Files:**
- Modify: `packages/core/src/ui/button.tsx`

**Step 1:** Replace the `buttonVariants` CVA definition with the new variant × color × weight × size matrix. Keep the `default` and `destructive` variant aliases. Add `accent` as default color (with `default` as deprecated alias). Add `soft` variant. Add `success`, `warning`, `neutral` to color axis. Add compact sizes.

The full CVA:

```typescript
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 whitespace-nowrap font-sans select-none border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        solid: '',
        soft: '',
        outline: '',
        ghost: '',
        link: 'underline-offset-4 hover:underline active:opacity-80',
        // Deprecated aliases
        default: '',
        destructive: '',
      },
      color: {
        accent: '',
        error: '',
        success: '',
        warning: '',
        neutral: '',
        // Deprecated alias
        default: '',
      },
      weight: {
        semibold: 'font-semibold',
        normal: 'font-normal',
      },
      size: {
        xs: 'h-ds-xs-plus rounded-ds-sm px-ds-03 text-ds-sm',
        sm: 'h-ds-sm rounded-ds-md px-ds-04 text-ds-sm',
        md: 'h-ds-md rounded-ds-md px-ds-05 text-ds-md',
        lg: 'h-ds-lg rounded-ds-lg px-ds-06 text-ds-base',
        'compact-xs': 'rounded-ds-sm px-ds-02 py-ds-01 text-ds-sm',
        'compact-sm': 'rounded-ds-md px-ds-03 py-ds-01b text-ds-sm',
        'compact-md': 'rounded-ds-md px-ds-04 py-ds-02 text-ds-md',
        icon: 'h-ds-md w-ds-md rounded-ds-md',
        'icon-xs': 'h-ds-xs-plus w-ds-xs-plus rounded-ds-sm',
        'icon-sm': 'h-ds-sm w-ds-sm rounded-ds-md',
        'icon-md': 'h-ds-md w-ds-md rounded-ds-md',
        'icon-lg': 'h-ds-lg w-ds-lg rounded-ds-lg',
      },
    },
    compoundVariants: [
      // ============ SOLID ============
      { variant: 'solid', color: 'accent',  className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'solid', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'solid', color: 'success', className: 'bg-success-9 text-success-fg hover:bg-success-10 active:bg-success-10 shadow-raised' },
      { variant: 'solid', color: 'warning', className: 'bg-warning-9 text-warning-fg hover:bg-warning-10 active:bg-warning-10 shadow-raised' },
      { variant: 'solid', color: 'neutral', className: 'bg-surface-3 text-surface-fg hover:bg-surface-4 active:bg-surface-4' },

      // ============ SOFT ============
      { variant: 'soft', color: 'accent',  className: 'bg-accent-3 text-accent-11 hover:bg-accent-4 active:bg-accent-5' },
      { variant: 'soft', color: 'error',   className: 'bg-error-3 text-error-11 hover:bg-error-4 active:bg-error-5' },
      { variant: 'soft', color: 'success', className: 'bg-success-3 text-success-11 hover:bg-success-4 active:bg-success-5' },
      { variant: 'soft', color: 'warning', className: 'bg-warning-3 text-warning-11 hover:bg-warning-4 active:bg-warning-5' },
      { variant: 'soft', color: 'neutral', className: 'bg-surface-raised text-surface-fg-muted hover:bg-surface-raised-hover active:bg-surface-raised-active' },

      // ============ OUTLINE ============
      { variant: 'outline', color: 'accent',  className: 'bg-transparent text-accent-11 border-accent-7 hover:bg-accent-2 active:bg-accent-3' },
      { variant: 'outline', color: 'error',   className: 'bg-transparent text-error-11 border-error-7 hover:bg-error-2 active:bg-error-3' },
      { variant: 'outline', color: 'success', className: 'bg-transparent text-success-11 border-success-7 hover:bg-success-2 active:bg-success-3' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent text-warning-11 border-warning-7 hover:bg-warning-2 active:bg-warning-3' },
      { variant: 'outline', color: 'neutral', className: 'bg-transparent text-surface-fg border-surface-border-strong hover:bg-surface-raised active:bg-surface-raised-active' },

      // ============ GHOST ============
      // ghost + accent intentionally uses neutral tokens for backward compat
      // (the most common ghost button is the toolbar/icon ghost — should stay muted)
      { variant: 'ghost', color: 'accent',  className: 'bg-transparent text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg active:bg-surface-raised-active' },
      { variant: 'ghost', color: 'error',   className: 'bg-transparent text-error-11 hover:bg-error-3 active:bg-error-4' },
      { variant: 'ghost', color: 'success', className: 'bg-transparent text-success-11 hover:bg-success-3 active:bg-success-4' },
      { variant: 'ghost', color: 'warning', className: 'bg-transparent text-warning-11 hover:bg-warning-3 active:bg-warning-4' },
      { variant: 'ghost', color: 'neutral', className: 'bg-transparent text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg active:bg-surface-raised-active' },

      // ============ LINK ============
      { variant: 'link', color: 'accent',  className: 'text-accent-11' },
      { variant: 'link', color: 'error',   className: 'text-error-11' },
      { variant: 'link', color: 'success', className: 'text-success-11' },
      { variant: 'link', color: 'warning', className: 'text-warning-11' },
      { variant: 'link', color: 'neutral', className: 'text-surface-fg-muted' },

      // ============ DEPRECATED ALIASES ============
      // "default" variant → solid (all colors)
      { variant: 'default', color: 'accent',  className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'default', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'default', color: 'success', className: 'bg-success-9 text-success-fg hover:bg-success-10 active:bg-success-10 shadow-raised' },
      { variant: 'default', color: 'warning', className: 'bg-warning-9 text-warning-fg hover:bg-warning-10 active:bg-warning-10 shadow-raised' },
      { variant: 'default', color: 'neutral', className: 'bg-surface-3 text-surface-fg hover:bg-surface-4 active:bg-surface-4' },
      { variant: 'default', color: 'default', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-raised hover:shadow-brand' },

      // "destructive" variant → solid + error (all color values)
      { variant: 'destructive', color: 'accent',  className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'error',   className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'success', className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'warning', className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'neutral', className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },
      { variant: 'destructive', color: 'default', className: 'bg-error-9 text-error-fg hover:bg-error-10 active:bg-error-10 shadow-raised' },

      // "default" color alias → accent (for solid/soft/outline/ghost/link)
      { variant: 'solid',   color: 'default', className: 'bg-accent-9 text-accent-fg hover:bg-accent-10 active:bg-accent-10 shadow-raised hover:shadow-brand' },
      { variant: 'soft',    color: 'default', className: 'bg-accent-3 text-accent-11 hover:bg-accent-4 active:bg-accent-5' },
      { variant: 'outline', color: 'default', className: 'bg-transparent text-accent-11 border-accent-7 hover:bg-accent-2 active:bg-accent-3' },
      { variant: 'ghost',   color: 'default', className: 'bg-transparent text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg active:bg-surface-raised-active' },
      { variant: 'link',    color: 'default', className: 'text-accent-11' },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'accent',
      weight: 'semibold',
      size: 'md',
    },
  },
)
```

**Step 2:** Add `shape` prop to ButtonProps interface:

```typescript
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  // ... existing props ...
  /** Button shape — 'pill' applies rounded-full for chip/tag-like buttons */
  shape?: 'default' | 'pill'
}
```

**Step 3:** Apply shape in the component render (not in CVA, because rounded-full needs to override per-size radius via tailwind-merge):

```typescript
// In the component's cn() call:
cn(
  buttonVariants({ variant: resolvedVariant, color: resolvedColor, weight: resolvedWeight, size: resolvedSize }),
  shape === 'pill' && 'rounded-full',
  fullWidth && 'w-full',
  // ... rest
)
```

**Step 4:** Update `iconSizeClass` and `spinnerSizeMap` to include compact sizes:

```typescript
const iconSizeClass: Record<string, string> = {
  // ... existing ...
  'compact-xs': 'h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5',
  'compact-sm': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
  'compact-md': 'h-ico-sm w-ico-sm [&>svg]:h-ico-sm [&>svg]:w-ico-sm',
}

const spinnerSizeMap: Record<string, 'sm' | 'md'> = {
  // ... existing ...
  'compact-xs': 'sm',
  'compact-sm': 'sm',
  'compact-md': 'sm',
}
```

**Step 5:** Update JSDoc to document new API.

**Step 6:** Typecheck: `pnpm --filter @devalok/shilp-sutra typecheck`

**Step 7:** Commit: `feat(core): Button v2 — soft variant, 5 colors, shape, compact sizes`

---

### Task 3: Update ButtonGroup context

**Files:**
- Modify: `packages/core/src/ui/button-group.tsx`

**Step 1:** Add `weight` and `shape` to ButtonGroupContextValue and component props.

**Step 2:** Typecheck.

**Step 3:** Commit: `feat(core): ButtonGroup propagates weight and shape`

---

### Task 4: Update IconButton for new colors

**Files:**
- Modify: `packages/core/src/ui/icon-button.tsx`

**Step 1:** Update `IconButtonProps` to accept `color: 'accent' | 'error' | 'success' | 'warning' | 'neutral'`. Keep existing `shape: 'square' | 'circle'` (separate from Button's shape — IconButton has its own concept).

**Step 2:** Typecheck.

**Step 3:** Commit: `feat(core): IconButton supports new color axis`

---

### Task 5: Write tests for new variants

**Files:**
- Modify: `packages/core/src/ui/button.test.tsx`

**Step 1:** Add tests for:
- `variant="soft"` renders with correct class (bg-accent-3)
- `variant="soft" color="error"` renders with correct class (bg-error-3)
- `variant="soft" color="success"` renders with correct class (bg-success-3)
- `variant="soft" color="warning"` renders with correct class (bg-warning-3)
- `variant="soft" color="neutral"` renders with correct class (bg-surface-raised)
- `shape="pill"` renders with rounded-full
- `size="compact-xs"` renders without h-* class (padding only)
- `size="compact-sm"` renders without h-* class
- Deprecated: `variant="default"` still renders (backward compat)
- Deprecated: `variant="destructive"` still renders (backward compat)
- Deprecated: `color="default"` still renders (backward compat)
- `color="success"` + `variant="solid"` renders bg-success-9
- `color="warning"` + `variant="outline"` renders border-warning-7

**Step 2:** Run tests: `pnpm --filter @devalok/shilp-sutra test -- --run`

**Step 3:** Commit: `test(core): Button v2 — soft, colors, shape, compact, deprecated aliases`

---

### Task 6: Overhaul stories

**Files:**
- Modify: `packages/core/src/ui/button.stories.tsx`

**Step 1:** Add new stories:
- **VariantGrid** — 5 variants × 5 colors grid (the hero story)
- **SoftShowcase** — soft variant across all colors + sizes
- **PillButtons** — shape="pill" across variants and colors
- **CompactSizes** — compact-xs/sm/md compared to standard sizes
- **SemanticColors** — color="success/warning/error/neutral" across variants
- **DeprecatedAliases** — default + destructive still work (migration reference)
- **RealWorldPatterns** — Status pill, review approve, visibility toggle, popover option

Keep existing stories working (they use the deprecated aliases).

**Step 2:** Run Storybook, visually verify each story.

**Step 3:** Commit: `feat(core): Button v2 stories — full variant × color matrix`

---

### Task 7: Build playground

**Files:**
- Create: `button-v2-playground.html` (project root)

**Step 1:** Build a self-contained HTML playground (same pattern as the TaskPanel playgrounds). Controls panel on left, live preview on right. Controls:
- Variant selector (solid, soft, outline, ghost, link)
- Color selector (accent, error, success, warning, neutral)
- Size selector (all sizes including compact)
- Shape toggle (default / pill)
- Weight toggle (semibold / normal)
- Icon toggles (start, end, both, none)
- State toggles (loading, disabled)
- Dark mode toggle

Preview shows the button in isolation + in context (toolbar row, form row, popover menu, pill row).

Use the actual shilp-sutra token values (hardcoded from semantic.css) for accurate color representation.

**Step 2:** Commit: `feat(core): Button v2 interactive playground`

---

### Task 8: Migrate TaskPanel v3 to native Button API

**Files:**
- Modify: `packages/karm/src/tasks/v3/task-panel-quick-props.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-description.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-subtasks.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-timeline.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-message-input.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-wing-properties.tsx`
- Modify: `packages/karm/src/tasks/v3/task-panel-wing-review.tsx`
- Modify: `packages/karm/src/tasks/v3/timeline/timeline-comment.tsx`

**Step 1:** Replace className hacks with native props:

| Current hack | New API |
|-------------|---------|
| `className="rounded-full ..."` on pills | `shape="pill"` |
| `className="bg-success-9 ..."` on approve | `variant="solid" color="success"` |
| `className="bg-success-3 text-success-11 ..."` on visibility | `variant="soft" color="success"` |
| `className="text-warning-11 hover:bg-warning-3"` on vis toggle | `variant="ghost" color="warning"` |
| `className="h-auto ..."` on property triggers | `size="compact-xs"` |
| `weight="normal"` on popover options | (keep — weight is now a first-class prop) |
| `className="w-full justify-start"` on options | (keep — layout concern, not variant) |
| `className="border border-dashed ..."` on prompts | (keep — niche pattern, className is appropriate) |

**Step 2:** Typecheck: `pnpm --filter @devalok/shilp-sutra-karm typecheck`

**Step 3:** Run tests: `pnpm --filter @devalok/shilp-sutra-karm test -- --run`

**Step 4:** Verify in Storybook.

**Step 5:** Commit: `refactor(karm): TaskPanel v3 uses Button v2 native props — remove className hacks`

---

## Task Dependency Graph

```
Task 1 (tokens) → Task 2 (CVA rewrite)
Task 2 → Task 3 (ButtonGroup) | Task 4 (IconButton) | Task 5 (tests)
Task 5 → Task 6 (stories)
Task 2 → Task 7 (playground)
Task 6 → Task 8 (migrate v3)
```

Tasks 3, 4, 5, and 7 can run in parallel after Task 2.

Total: **8 tasks across 3 phases.** Estimated: Phase 1-2 are the core work, Phase 3 is migration and polish.
