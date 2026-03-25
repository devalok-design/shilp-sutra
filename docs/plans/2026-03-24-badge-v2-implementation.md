# Badge v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Badge + Chip with a single unified Badge component featuring 4 variants × 16 colors, interactive states, custom arbitrary colors, truncation, notification overlay (Badge.Indicator), group overflow (Badge.Group), and Chip deprecation.

**Architecture:** Full rewrite of `badge.tsx` with CVA compound variants aligned to Button v2 patterns. Badge.Indicator and Badge.Group as separate compound components. Chip becomes a deprecated re-export. All consumers migrated.

**Tech Stack:** React 18, TypeScript 5.7, CVA, Framer Motion, Radix Slot (asChild), shilp-sutra tokens, `<Icon>` system.

**Design Doc:** `docs/plans/2026-03-24-badge-v2-design.md`

---

## Conventions

**Files:** `packages/core/src/ui/`
**Tests:** `packages/core/src/ui/__tests__/`
**Stories:** `packages/core/src/ui/badge.stories.tsx`
**Commit after each task.** Conventional commits: `feat(core):`, `test(core):`, `fix(core):`.

---

## Task Dependency Graph

```
Task 1 (Badge rewrite) → Task 2 (Badge.Indicator) → Task 3 (Badge.Group)
Task 1 → Task 4 (Chip deprecation)
Task 1 → Task 5 (tests)
Task 3 + 4 → Task 6 (migrate consumers)
Task 5 + 6 → Task 7 (stories)
Task 7 → Task 8 (docs)
```

Total: **8 tasks across 4 phases.**

---

## Phase 1: Core Badge Rewrite

### Task 1: Rewrite Badge component

**Files:**
- Rewrite: `packages/core/src/ui/badge.tsx`
- Modify: `packages/core/src/ui/index.ts` (update exports)

**The full CVA definition:**

4 variants (subtle, solid, outline, soft) × 16 colors (default, accent, error, success, warning, info, neutral, teal, amber, slate, indigo, cyan, orange, emerald, custom) = 64 compound variants + the `custom` color that uses CSS variables.

```typescript
const badgeVariants = cva(
  'relative inline-flex items-center rounded-full font-sans font-medium overflow-hidden isolate transition-colors duration-fast-01 ease-productive-standard select-none [&>span:not([data-grain])]:relative [&>span:not([data-grain])]:z-[2]',
  {
    variants: {
      variant: {
        subtle: '',
        solid: '',
        outline: '',
        soft: '',
      },
      color: {
        default: '', accent: '', error: '', success: '', warning: '', info: '',
        neutral: '', teal: '', amber: '', slate: '', indigo: '', cyan: '',
        orange: '', emerald: '', custom: '',
      },
      size: {
        xs: 'h-4 px-1.5 text-[10px] gap-1',
        sm: 'h-5 px-2 text-ds-xs gap-1',
        md: 'h-6 px-2.5 text-ds-xs gap-1.5',
        lg: 'h-7 px-3 text-ds-sm gap-1.5',
      },
    },
    compoundVariants: [
      // subtle × all colors — bg step-3, text step-11, border step-7
      { variant: 'subtle', color: 'default', className: 'bg-surface-raised-hover text-surface-fg-muted border border-surface-border-strong' },
      { variant: 'subtle', color: 'accent', className: 'bg-accent-3 text-accent-11 border border-accent-7' },
      { variant: 'subtle', color: 'error', className: 'bg-error-3 text-error-11 border border-error-7' },
      { variant: 'subtle', color: 'success', className: 'bg-success-3 text-success-11 border border-success-7' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-3 text-warning-11 border border-warning-7' },
      { variant: 'subtle', color: 'info', className: 'bg-info-3 text-info-11 border border-info-7' },
      { variant: 'subtle', color: 'neutral', className: 'bg-surface-raised-hover text-surface-fg-muted border border-surface-border-strong' },
      // ... category colors follow same pattern with category-*-3/7/11
      // ... repeat for solid, outline, soft
      // custom color uses CSS variables (applied inline, not via CVA)
    ],
    defaultVariants: {
      variant: 'subtle',
      color: 'default',
      size: 'md',
    },
  },
)
```

**Custom color handling in the component:**

```tsx
// When color === 'custom', apply inline styles using CSS variable
const customStyles = color === 'custom' ? {
  ...(variant === 'subtle' && {
    backgroundColor: 'color-mix(in oklch, var(--badge-color) 15%, transparent)',
    color: 'var(--badge-color)',
    borderColor: 'color-mix(in oklch, var(--badge-color) 40%, transparent)',
  }),
  ...(variant === 'solid' && {
    backgroundColor: 'var(--badge-color)',
    color: 'white',
    borderColor: 'transparent',
  }),
  ...(variant === 'outline' && {
    backgroundColor: 'transparent',
    color: 'var(--badge-color)',
    borderColor: 'color-mix(in oklch, var(--badge-color) 50%, transparent)',
  }),
  ...(variant === 'soft' && {
    backgroundColor: 'color-mix(in oklch, var(--badge-color) 12%, transparent)',
    color: 'var(--badge-color)',
    borderColor: 'transparent',
  }),
} : undefined
```

**Props interface:**

```typescript
export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  startIcon?: React.ReactElement | null
  endIcon?: React.ReactElement | null
  dot?: boolean
  onDismiss?: () => void
  selected?: boolean
  disabled?: boolean
  maxWidth?: number
  circle?: boolean
}
```

**Component render:**

```tsx
const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  ({ className, variant, color, size, asChild, startIcon, endIcon, dot,
     onDismiss, onClick, selected, disabled, maxWidth, circle,
     children, style, ...props }, ref) => {

    const Comp = asChild ? Slot : onClick ? 'button' : 'span'
    const resolvedVariant = variant ?? 'subtle'
    const resolvedColor = color ?? 'default'

    const customStyles = resolvedColor === 'custom' ? /* see above */ : undefined

    return (
      <Comp
        ref={ref}
        className={cn(
          badgeVariants({ variant: resolvedVariant, color: resolvedColor, size }),
          onClick && 'cursor-pointer hover:brightness-95 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-1',
          selected && 'ring-1 ring-current/20',
          disabled && 'opacity-action-disabled pointer-events-none saturate-[0.3]',
          circle && 'justify-center px-0 aspect-square',
          className,
        )}
        style={{ ...style, ...customStyles, ...(maxWidth ? { maxWidth } : undefined) }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled && Comp === 'button' ? true : undefined}
        type={Comp === 'button' ? 'button' : undefined}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span className="relative inline-flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
            <motion.span
              className="absolute inset-0 rounded-full bg-current"
              animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
            />
            <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
          </span>
        )}

        {/* Selected check icon */}
        {selected && !startIcon && !dot && (
          <Icon icon={IconCheck} size="xs" className="shrink-0" />
        )}

        {/* Start icon */}
        {startIcon && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{startIcon}</span>}

        {/* Children — with optional truncation */}
        {maxWidth ? (
          <span className="truncate" title={typeof children === 'string' ? children : undefined}>
            {children}
          </span>
        ) : (
          children
        )}

        {/* End icon */}
        {endIcon && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{endIcon}</span>}

        {/* Dismiss button */}
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDismiss() }}
            className="shrink-0 rounded-full p-px text-current/60 hover:text-current hover:bg-current/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-9"
            aria-label={`Remove ${typeof children === 'string' ? children : ''}`.trim() || 'Remove'}
          >
            <Icon icon={IconX} size="xs" />
          </button>
        )}
      </Comp>
    )
  },
)
```

**Also export the variants:**
```typescript
export { Badge, badgeVariants }
export type { BadgeProps }
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Badge v2 — 4 variants, 16 colors, custom colors, interactive, truncation`

---

### Task 2: Badge.Indicator (notification overlay)

**Files:**
- Create: `packages/core/src/ui/badge-indicator.tsx`

```tsx
'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './lib/utils'
import { springs } from './lib/motion'

const PLACEMENT_CLASSES = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
} as const

const COLOR_CLASSES = {
  error: 'bg-error-9 text-error-fg',
  success: 'bg-success-9 text-success-fg',
  warning: 'bg-warning-9 text-warning-fg',
  accent: 'bg-accent-9 text-accent-fg',
  info: 'bg-info-9 text-info-fg',
} as const

export interface BadgeIndicatorProps {
  count?: number
  max?: number
  dot?: boolean
  color?: keyof typeof COLOR_CLASSES
  invisible?: boolean
  showZero?: boolean
  placement?: keyof typeof PLACEMENT_CLASSES
  className?: string
  children: React.ReactNode
}

export function BadgeIndicator({
  count,
  max = 99,
  dot = false,
  color = 'error',
  invisible = false,
  showZero = false,
  placement = 'top-right',
  className,
  children,
}: BadgeIndicatorProps) {
  const prefersReduced = useReducedMotion()
  const show = !invisible && (dot || (count !== undefined && (count > 0 || showZero)))
  const displayCount = count !== undefined && count > max ? `${max}+` : count

  return (
    <span className={cn('relative inline-flex', className)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            key="indicator"
            initial={prefersReduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={springs.bouncy}
            className={cn(
              'absolute flex items-center justify-center rounded-full font-sans font-semibold ring-2 ring-surface-raised',
              COLOR_CLASSES[color],
              PLACEMENT_CLASSES[placement],
              dot
                ? 'h-2.5 w-2.5'
                : 'min-w-[18px] h-[18px] px-1 text-[11px] leading-none',
            )}
          >
            {!dot && displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

BadgeIndicator.displayName = 'BadgeIndicator'
```

Export from barrel.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Badge.Indicator — notification overlay with count, dot, animated transitions`

---

### Task 3: Badge.Group (overflow)

**Files:**
- Create: `packages/core/src/ui/badge-group.tsx`

```tsx
'use client'

import * as React from 'react'
import { cn } from './lib/utils'
import { Badge } from './badge'

const GAP_CLASSES = {
  tight: 'gap-1',
  default: 'gap-1.5',
  loose: 'gap-2',
} as const

export interface BadgeGroupProps {
  max?: number
  gap?: keyof typeof GAP_CLASSES
  onOverflowClick?: () => void
  className?: string
  children: React.ReactNode
}

export function BadgeGroup({
  max,
  gap = 'default',
  onOverflowClick,
  className,
  children,
}: BadgeGroupProps) {
  const childArray = React.Children.toArray(children)
  const total = childArray.length
  const hasOverflow = max !== undefined && total > max
  const visible = hasOverflow ? childArray.slice(0, max) : childArray
  const overflowCount = hasOverflow ? total - max! : 0

  return (
    <div className={cn('flex flex-wrap items-center', GAP_CLASSES[gap], className)}>
      {visible}
      {hasOverflow && (
        <Badge
          variant="outline"
          color="neutral"
          size="sm"
          onClick={onOverflowClick}
          className={onOverflowClick ? 'cursor-pointer' : undefined}
        >
          +{overflowCount}
        </Badge>
      )}
    </div>
  )
}

BadgeGroup.displayName = 'BadgeGroup'
```

Export from barrel.

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Badge.Group — overflow with "+N" indicator`

---

## Phase 2: Deprecation + Assembly

### Task 4: Deprecate Chip, assemble compound Badge

**Files:**
- Modify: `packages/core/src/ui/chip.tsx` — replace with deprecated re-export
- Modify: `packages/core/src/ui/badge.tsx` — add compound exports (Badge.Indicator, Badge.Group)
- Modify: `packages/core/src/ui/index.ts` — update barrel

The compound assembly in badge.tsx:
```typescript
import { BadgeIndicator } from './badge-indicator'
import { BadgeGroup } from './badge-group'

const BadgeCompound = Object.assign(Badge, {
  Indicator: BadgeIndicator,
  Group: BadgeGroup,
})

export { BadgeCompound as Badge }
```

Chip deprecation — MUST be a wrapper, not a plain alias (Chip uses `label` prop, Badge uses `children`):
```typescript
/** @deprecated Use <Badge onClick={...}> instead of <Chip> */
export const Chip = React.forwardRef<HTMLElement, any>(({ label, icon, ...props }, ref) => (
  <Badge ref={ref} startIcon={icon} {...props}>{label}</Badge>
))
Chip.displayName = 'Chip'

/** @deprecated Use Badge.Group for overflow. For exit animations, wrap in AnimatePresence */
export { AnimatePresence as ChipGroup } from 'framer-motion'
// NOTE: ChipGroup STAYS as AnimatePresence for backward compat (exit animations).
// Badge.Group is a DIFFERENT component (overflow "+N"). They are not interchangeable.
```

**Verify:** `pnpm --filter @devalok/shilp-sutra typecheck`

**Commit:** `feat(core): Badge compound export (Indicator, Group), Chip deprecated with wrapper`

---

## Audit Fixes (applied to plan)

### Fix: `color="brand"` in karm constants (CRITICAL-1)

Task 6 migration MUST include `packages/karm/src/tasks/task-constants.ts`:
- Change `BadgeColor` type to derive from Badge's actual color type
- Change `'brand'` to `'accent'` in REVIEW_STATUS_MAP
- Grep: `grep -rn "brand" packages/karm/ --include="*.ts" --include="*.tsx"`

### Fix: `solid + custom` contrast (WARNING-2)

In Task 1, the custom color for solid variant should accept an optional `--badge-fg-color` override:
```css
solid + custom:
  background: var(--badge-color);
  color: var(--badge-fg-color, white);
```
Document in JSDoc: "For light custom colors on solid variant, set `--badge-fg-color` to a dark value."

### Fix: onClick + onDismiss nested buttons (WARNING-3)

In Task 1, when both `onClick` and `onDismiss` are present:
- Render outer as `<div role="button" tabIndex={0} onKeyDown={handleEnter}>` instead of `<button>`
- This avoids nested `<button>` (invalid HTML) while keeping keyboard support
- The dismiss `<button>` stays as a real `<button>` inside the `role="button"` div

### Fix: Icon sizing scales with badge size (WARNING-5)

Replace hardcoded `[&>svg]:h-3 [&>svg]:w-3` with per-size mapping:
```typescript
const iconSizeMap = {
  xs: '[&>svg]:h-2.5 [&>svg]:w-2.5',   // 10px
  sm: '[&>svg]:h-3 [&>svg]:w-3',         // 12px
  md: '[&>svg]:h-3 [&>svg]:w-3',         // 12px
  lg: '[&>svg]:h-3.5 [&>svg]:w-3.5',     // 14px
}
```

### Fix: xs dismiss button (WARNING-4)

At xs size, hide the dismiss button text and show only a tiny × with `min-touch-target` class:
```tsx
onDismiss && size !== 'xs' ? <button ...><Icon icon={IconX} /></button> :
onDismiss && size === 'xs' ? <button className="min-w-[24px] min-h-[24px] -mr-1 ..."...><Icon icon={IconX} /></button>
```
The touch target extends beyond the badge boundary via negative margin.

### Fix: Badge.Group overflow badge matches surrounding size (INFO-4)

Add `size` prop to BadgeGroup that propagates to the overflow badge:
```tsx
<Badge variant="outline" color="neutral" size={size ?? 'sm'}>+{overflowCount}</Badge>
```

---

## Phase 3: Tests + Migration

### Task 5: Tests

**Files:**
- Rewrite: `packages/core/src/ui/__tests__/badge.test.tsx` (or create new)

Test cases:
- Renders with default variant and color
- Each variant applies correct classes (subtle, solid, outline, soft)
- Custom color applies inline styles
- `startIcon` renders before text
- `dot` renders animated indicator
- `onDismiss` renders × button, click fires callback
- `onClick` renders as `<button>`, fires callback
- `selected` adds ring class and check icon
- `disabled` adds opacity and pointer-events-none
- `maxWidth` truncates with ellipsis
- `circle` forces square aspect ratio
- `asChild` renders as child element
- Badge.Indicator shows count, respects max ("99+"), hides when invisible
- Badge.Indicator dot mode shows no count
- Badge.Group shows max items + overflow badge
- Badge.Group overflow click fires callback

**Verify:** `pnpm --filter @devalok/shilp-sutra test -- --run`

**Commit:** `test(core): Badge v2 — variants, colors, interactive, indicator, group`

---

### Task 6: Migrate consumers

**Files:**
- All files in `packages/core/src/` and `packages/karm/src/` that use `Badge` or `Chip`

The Badge API is mostly backward compatible except:
- `secondary` variant → use `subtle`
- `destructive` variant → use `solid color="error"`
- `brand` color → use `accent`

For Chip usages:
- `<Chip label="X" onClick={fn} />` → `<Badge onClick={fn}>X</Badge>`
- `<Chip label="X" icon={<I/>} onDismiss={fn} />` → `<Badge startIcon={<Icon icon={I}/>} onDismiss={fn}>X</Badge>`
- `<ChipGroup>` → `<Badge.Group>`

Run grep to find all usages:
```bash
grep -rn "variant=\"secondary\"\|variant=\"destructive\"\|color=\"brand\"" packages/ --include="*.tsx"
grep -rn "<Chip\b\|<ChipGroup" packages/ --include="*.tsx" | grep -v "test\|stories"
```

**Verify:**
```
pnpm --filter @devalok/shilp-sutra typecheck
pnpm --filter @devalok/shilp-sutra-karm typecheck
```

**Commit:** `refactor: migrate all Badge/Chip consumers to Badge v2 API`

---

## Phase 4: Stories + Docs

### Task 7: Stories

**Files:**
- Rewrite: `packages/core/src/ui/badge.stories.tsx`

Stories:
1. **Default** — basic badge with controls
2. **VariantColorGrid** — 4 variants × key colors matrix
3. **CustomColors** — arbitrary hex colors via `--badge-color`
4. **Interactive** — clickable badges with selected state
5. **Dismissible** — badges with × button
6. **WithIcons** — startIcon, endIcon, dot
7. **Truncation** — long text with maxWidth
8. **Sizes** — xs through lg + circle
9. **Indicator** — notification overlay on avatars and icons
10. **Group** — overflow with "+N" indicator
11. **WithGrain** — DevalokGrain inside solid badges
12. **RealWorld** — task labels, status badges, filter chips, notification dots

**Commit:** `feat(core): Badge v2 stories — variants, custom colors, interactive, indicator, group`

---

### Task 8: Docs

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `packages/core/llms.txt`
- Modify: `packages/core/llms-full.txt`

CHANGELOG:
- Breaking: Badge rewritten (secondary/destructive/brand removed)
- Breaking: Chip deprecated (use Badge with onClick)
- Added: Badge soft variant, custom colors, interactive states, truncation
- Added: Badge.Indicator for notification overlays
- Added: Badge.Group for overflow handling

**Commit:** `docs(core): CHANGELOG + llms.txt — Badge v2`

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Badge CVA rewrite | badge.tsx |
| 2 | Badge.Indicator | badge-indicator.tsx |
| 3 | Badge.Group | badge-group.tsx |
| 4 | Chip deprecation + compound assembly | chip.tsx, badge.tsx, index.ts |
| 5 | Tests | badge.test.tsx |
| 6 | Migrate consumers | core + karm files |
| 7 | Stories | badge.stories.tsx |
| 8 | Docs | CHANGELOG, llms.txt |
