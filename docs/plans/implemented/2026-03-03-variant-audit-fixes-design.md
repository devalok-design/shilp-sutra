# Variant Audit Fixes — Design Document

**Date**: 2026-03-03
**Status**: Approved
**Source**: 9-expert mega council audit (MDS3, Radix/shadcn, Ant Design Enterprise, DS Architect, Component API Designer)

## Overview

Fixes 5 confirmed bugs and adds the top-priority variant gaps identified by the council audit.
Work is split into 4 independent batches executable in parallel via subagent-driven-development.

## Batch 1 — Form Layer

### Input: Size Variants

**Problem**: `Input` hardcodes `h-ds-md px-ds-04`. No CVA. Every compact form context requires a `className` override.

**Solution**: Add `size?: 'sm' | 'md' | 'lg'` via CVA to `Input`. Propagate the same prop to `SelectTrigger`, `Textarea`, `NumberInput`, `SearchInput`.

Size tokens (matching Button scale):
- `sm`: `h-ds-sm px-ds-03 text-ds-sm`
- `md`: `h-ds-md px-ds-04 text-ds-md` (current, now explicit default)
- `lg`: `h-ds-lg px-ds-05 text-ds-base`

### Input: Adornments

**Problem**: No icon-inside-field support. Consumers build ad-hoc wrappers.

**Solution**: Add `startIcon?: React.ReactNode` and `endIcon?: React.ReactNode` to `InputProps`. When present, `Input` renders a wrapping `<div className="relative">` with the icon as an absolutely positioned `<span>` (top-1/2 -translate-y-1/2 left/right with appropriate spacing). Input receives compensating padding class (`pl-ds-09` / `pr-ds-09`) to prevent text overlapping the icon. Pattern is consistent with Button's existing `startIcon`/`endIcon`.

### FormField: Context Bridge

**Problem**: `state` prop is `_state` (discarded). `FormHelperText` must receive `state` manually. No auto-propagation.

**Solution**:
```tsx
interface FormFieldContextValue {
  state?: FormHelperState
  helperTextId?: string
}
const FormFieldContext = createContext<FormFieldContextValue>({})
```
- `FormField` becomes a `FormFieldContext.Provider`
- `FormHelperText` reads `state` from context; explicit `state` prop overrides
- Export `useFormField()` hook for custom input consumers
- Existing `getFormFieldA11y()` helper stays unchanged (still valid for explicit wiring)

### Alert + Banner: Neutral Variant + Dismissible Footgun

**Neutral variant**:
```
variant="neutral": bg-layer-02 border-border text-text-primary
```
Uses `IconInfoCircle` as icon (non-semantic, generic). Matches Badge's `neutral` variant semantics.

**Dismissible footgun**: Remove the `dismissible: boolean` prop from both `Alert` and `Banner`. The X button renders when and only when `onDismiss?: () => void` is present. **Breaking change** — but `dismissible={true}` without `onDismiss` was already broken (button never rendered).

---

## Batch 2 — Data Display

### Avatar: Status Dot Fix + Shape Variant

**Bug**: Status dot is `absolute` inside `overflow-hidden` on `AvatarPrimitive.Root`. Dot is clipped.

**Fix**: Wrap in outer `<span className="relative inline-flex shrink-0">`. `AvatarPrimitive.Root` remains inner (keeps `overflow-hidden` for image). Status dot positions on the outer span.

**Shape variant**: Add `shape?: 'circle' | 'square' | 'rounded'` to `avatarVariants`.
- `circle`: `rounded-ds-full` (current default)
- `square`: `rounded-ds-sm`
- `rounded`: `rounded-ds-lg`

`defaultVariants.shape = 'circle'` — fully backwards compatible.

### Badge: Solid Fill Variant

**Problem**: All Badge variants use the surface/tinted treatment (`bg-*-surface`). No high-contrast solid fill for notification counts.

**Solution**: Add `fill?: 'surface' | 'solid'` prop (default `'surface'`). When `fill="solid"`:
- Intent colors use `bg-{color-token} text-text-on-color border-transparent`
- Category colors use `bg-category-{name} text-text-on-color border-transparent`
- `neutral` solid: `bg-layer-03 text-text-primary border-transparent`

Implemented via compound variants in CVA (`fill` × each `variant`).

### Toast: Semantic Variant Fix

**Bug**: `default` and `karam` are identical. `destructive` only adds a class name string with no visual difference.

**Solution**: Replace 3-variant system with 5 semantic variants matching Alert grammar:
- `default`: `border-border bg-layer-01 text-text-primary` (keep)
- `success`: `bg-success-surface border-success-border text-success-text`
- `warning`: `bg-warning-surface border-warning-border text-warning-text`
- `error`: `bg-error-surface border-error-border text-error-text` (replaces `destructive`)
- `info`: `bg-info-surface border-info-border text-info-text`

Remove `karam` (was identical to `default`). Update `ToastAction` group selectors for `error` variant.

### Card: Variant System

**Problem**: Single visual treatment. `elevated`, `outlined`, `flat` styles require `className` overrides.

**Solution**: Add `variant?: 'default' | 'elevated' | 'outlined' | 'flat'` via CVA on `Card`.
- `default`: `bg-layer-01 border border-border-subtle shadow-01` (current)
- `elevated`: `bg-layer-01 shadow-03` (no border)
- `outlined`: `bg-layer-01 border border-border` (no shadow)
- `flat`: `bg-layer-02` (no border, no shadow)

`interactive` boolean stays; adds `cursor-pointer hover:shadow-02 focus-visible:ring-2 focus-visible:ring-focus transition-shadow`.

---

## Batch 3 — Interactive Tags (Chip)

**Files**: `src/ui/chip.tsx`

### Size: Add `lg`

```
lg: 'h-ds-sm-plus px-ds-05 text-ds-md'  // sm-plus = 36px
```

### Colors: Add `info` + 7 Sapta Varna Category Colors

Current colors: `default | primary | success | error | warning`

Add: `info | teal | amber | slate | indigo | cyan | orange | emerald`

All category color tokens already exist in semantic.css. Add compound variants for each new color × `filled` and × `outlined` style:

- `filled` + category color → `bg-category-{name}-surface text-category-{name}-text border-category-{name}-border`
- `outlined` + category color → `border-category-{name}-border text-category-{name}-text`
- `filled` + `info` → `bg-info-surface text-info-text border-info-border`
- `outlined` + `info` → `border-info-border text-info-text`

---

## Batch 4 — System Coherence

### Button: `danger` → `error` Hard Rename

**Rename**:
- `variant="danger"` → `variant="error"`
- `variant="danger-ghost"` → `variant="error-ghost"`

CSS is unchanged — only string keys change. Scan entire codebase for `variant="danger"` and `variant="danger-ghost"` in karm/ stories and components; update all usages.

**Button active: states** (missing pressed state):
- `secondary` add: `active:bg-interactive-selected`
- `ghost` add: `active:bg-layer-03`
- `link` add: `active:opacity-70`
- `primary` already has `active:bg-interactive-active` ✓
- `error` already has implicit via opacity ✓

### Tabs: Context Bridge

**Bug**: `TabsList` writes no context. `TabsTrigger` reads no context. Must re-pass `variant` to every trigger.

**Solution**:
```tsx
const TabsListContext = createContext<{ variant?: 'line' | 'contained' }>({})
// TabsList: wrap children in TabsListContext.Provider with its own variant
// TabsTrigger: reads variant from context, explicit prop overrides
```

Net effect: `variant` passed once to `TabsList`, all `TabsTrigger` children inherit it.

### Token: `--color-info` Solid Fill

**Gap**: `--color-info-surface`, `--color-info-border`, `--color-info-text` exist. `--color-info` (solid fill) is absent — inconsistent with `--color-success`, `--color-error`, `--color-warning`.

**Add**:
```css
/* Light mode */
--color-info: var(--blue-600);
/* Dark mode */
--color-info: var(--blue-500);
```

---

## File Impact Summary

| Batch | Files Modified |
|-------|---------------|
| 1 — Form | `input.tsx`, `select.tsx`, `textarea.tsx`, `number-input.tsx`, `search-input.tsx`, `form.tsx`, `alert.tsx`, `banner.tsx` |
| 2 — Data Display | `avatar.tsx`, `badge.tsx`, `toast.tsx`, `card.tsx` |
| 3 — Tags | `chip.tsx` |
| 4 — Coherence | `button.tsx`, `tabs.tsx`, `semantic.css`, karm/ usages of `variant="danger"` |

## Breaking Changes

| Change | Type | Migration |
|--------|------|-----------|
| `Alert/Banner dismissible` prop removed | Breaking | Replace `dismissible={true} onDismiss={fn}` → `onDismiss={fn}` |
| Button `danger` → `error` | Breaking | Replace string value site-by-site |
| Button `danger-ghost` → `error-ghost` | Breaking | Replace string value site-by-site |
| Toast `karam` removed | Breaking | Replace with `default` |
| Toast `destructive` → `error` | Breaking | Replace with `error` |

## What Does NOT Change

- Button primary's pink glow hover effect (`shadow-brand`) — distinctive, keep as-is
- Badge's 15-variant system — comprehensive, already correct
- Token architecture (primitives → semantic → tailwind preset)
- Spinner, Skeleton — complete and accessible
- Avatar status semantic labels (role="img" aria-label)
- `getFormFieldA11y()` helper — still valid and useful
