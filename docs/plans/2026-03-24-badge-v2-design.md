# Badge v2 — Complete Overhaul

**Date:** 2026-03-24
**Scope:** Replace Badge + Chip with a single unified Badge component. Add Badge.Indicator (notification overlay), Badge.Group (overflow), custom colors, truncation, interactive states.
**Packages:** `@devalok/shilp-sutra` (core)

---

## Design Principles

1. **One component, not two.** Badge handles both display and interactive use cases. Chip is deprecated.
2. **Aligned with Button v2.** Same variant names (subtle, solid, outline, soft), same color axis pattern, same `startIcon`/`endIcon` slots.
3. **Arbitrary colors for user-defined labels.** The `custom` color reads a CSS variable, enabling any hex/oklch color.
4. **Composable.** `DevalokGrain` works inside Badge. `asChild` renders as any element. `Badge.Indicator` and `Badge.Group` are separate compound components.

---

## Research Basis

Synthesized from: Mantine Badge (8 variants, leftSection/rightSection, dot variant, circle, autoContrast), MUI Badge+Chip (notification overlay, max overflow, avatar support), PatternFly Label (editable, group overflow, 9+ colors), Radix Badge (highContrast, radius), Linear labels (user-defined colors, dot indicator), Chakra Tag (closable, startElement/endElement).

---

## The Badge Component

### Variant Axis (visual style)

| Variant | Rest | Use case |
|---------|------|----------|
| `subtle` | Tinted bg (step 3), colored text (step 11), colored border (step 7) | Default — status, category, metadata |
| `solid` | Filled bg (step 9), contrasting text, no border | High emphasis — notifications, critical status |
| `outline` | Transparent bg, colored border (step 7), colored text (step 11) | Low emphasis — filter tags, removable labels |
| `soft` | Tinted bg (step 3), colored text (step 11), NO border | Lightest — inline mentions, gentle tags |

### Color Axis

| Color | Token source |
|-------|-------------|
| `default` | surface-* (neutral gray) |
| `accent` | accent-* (pink) |
| `error` | error-* (red) |
| `success` | success-* (green) |
| `warning` | warning-* (amber bright) |
| `info` | info-* (blue) |
| `teal` | category-teal-* |
| `amber` | category-amber-* |
| `slate` | category-slate-* |
| `indigo` | category-indigo-* |
| `cyan` | category-cyan-* |
| `orange` | category-orange-* |
| `emerald` | category-emerald-* |
| `neutral` | surface-* (same as default but explicit name) |
| `custom` | reads `--badge-color` CSS variable |

### Size Axis

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `xs` | 16px | px-1.5 | text-ds-xs |
| `sm` | 20px | px-2 | text-ds-xs |
| `md` | 24px | px-2.5 | text-ds-sm |
| `lg` | 28px | px-3 | text-ds-sm |

### Shape

Always `rounded-full` (pill). No shape prop — badges are always pills.

For single-character counts, add `circle` boolean that forces equal width = height.

### Props

```typescript
interface BadgeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
  VariantProps<typeof badgeVariants> {
  /** Render as a different element via Radix Slot */
  asChild?: boolean
  /** Leading icon — use <Icon> component */
  startIcon?: React.ReactElement | null
  /** Trailing icon — use <Icon> component */
  endIcon?: React.ReactElement | null
  /** Animated dot indicator (leading position) */
  dot?: boolean
  /** Dismiss handler — shows × button */
  onDismiss?: () => void
  /** Click handler — makes badge interactive with hover/active states */
  onClick?: React.MouseEventHandler
  /** Selected state — stronger bg, check icon (for filter chips) */
  selected?: boolean
  /** Disabled state — muted, non-interactive */
  disabled?: boolean
  /** Max width in px — truncates with ellipsis */
  maxWidth?: number
  /** Force equal width/height for single-character content (counts) */
  circle?: boolean
}
```

### Custom Color Implementation

The `custom` color variant reads from a CSS variable:

```css
/* subtle + custom */
background: color-mix(in oklch, var(--badge-color) 15%, transparent);
color: var(--badge-color);
border-color: color-mix(in oklch, var(--badge-color) 40%, transparent);

/* solid + custom */
background: var(--badge-color);
color: white; /* or dark, determined by luminance check */
border: transparent;

/* outline + custom */
background: transparent;
color: var(--badge-color);
border-color: color-mix(in oklch, var(--badge-color) 50%, transparent);

/* soft + custom */
background: color-mix(in oklch, var(--badge-color) 12%, transparent);
color: var(--badge-color);
border: transparent;
```

Consumer usage:
```tsx
<Badge color="custom" style={{ '--badge-color': '#8B5CF6' } as React.CSSProperties}>
  Sprint 4
</Badge>
```

### Interactive States

When `onClick` is provided:
- `cursor-pointer`
- Hover: bg darkens one step (step 4 for subtle/soft, step 10 for solid)
- Active: `scale(0.95)` (matches Button)
- Focus: `ring-2 ring-accent-9 ring-offset-2`

When `selected`:
- Bg uses step 4 instead of step 3 (for subtle/soft)
- A small check icon appears as `startIcon` (auto-inserted, doesn't replace explicit startIcon)

When `disabled`:
- `opacity-action-disabled`, `pointer-events-none`, `cursor-not-allowed`
- `saturate(0.3)` (matches Button disabled)

### Dismiss Button

When `onDismiss` is provided, an × button renders as the trailing element:
- Uses `<Icon icon={IconX}>` at the badge's size tier
- `pointer-events: auto` (badge itself may be non-interactive)
- Hover: `bg-current/10` tint
- `aria-label="Remove {children text}"`
- Animated exit with scale + opacity (Framer Motion)

### Truncation

When `maxWidth` is set:
- `max-width: {maxWidth}px` on the badge
- Children text wrapped in a `<span className="truncate">`
- `title` attribute auto-set to full text for hover tooltip

---

## Badge.Indicator (Notification Overlay)

Separate compound component for the corner count/dot pattern:

```typescript
interface BadgeIndicatorProps {
  /** Number to display. Hidden when 0 unless showZero is true. */
  count?: number
  /** Maximum count — shows "{max}+" when exceeded. Default: 99 */
  max?: number
  /** Dot-only mode (no count text) */
  dot?: boolean
  /** Badge color. Default: 'error' (red dot/count) */
  color?: BadgeColor
  /** Hide without unmounting (for animations) */
  invisible?: boolean
  /** Show "0" instead of hiding when count is 0 */
  showZero?: boolean
  /** Position on the wrapped element */
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /** The element to overlay the badge on */
  children: React.ReactNode
}
```

Renders:
```html
<span class="relative inline-flex">
  {children}
  <span class="absolute {placement} min-w-[18px] h-[18px] rounded-full bg-error-9 text-white text-[11px] font-semibold flex items-center justify-center">
    5
  </span>
</span>
```

Animations:
- Count change: scale bounce (`springs.bouncy`)
- Enter: scale from 0 → 1
- Exit (invisible): scale to 0 + opacity to 0
- `prefers-reduced-motion`: opacity crossfade only

---

## Badge.Group (Overflow)

```typescript
interface BadgeGroupProps {
  /** Show at most N badges. Default: Infinity (no limit) */
  max?: number
  /** Gap between badges */
  gap?: 'tight' | 'default' | 'loose'  // 2px / 4px / 8px
  /** Click handler on the "+X" overflow badge */
  onOverflowClick?: () => void
  className?: string
  children: React.ReactNode
}
```

When `max` is set and children count exceeds it:
- Shows first N badges
- Renders a "+X" badge (outline variant, neutral color) as the last item
- "+X" badge is clickable if `onOverflowClick` is provided

```tsx
<Badge.Group max={3} onOverflowClick={showAllLabels}>
  {labels.map(l => <Badge key={l} color="teal">{l}</Badge>)}
</Badge.Group>
// With 5 labels: [bug] [auth] [critical] [+2]
```

---

## Chip Deprecation

`Chip` becomes a re-export of `Badge` with a console warning in dev:

```typescript
/** @deprecated Use <Badge onClick={...}> instead */
export const Chip = Badge
```

`ChipGroup` becomes a re-export of `Badge.Group`.

---

## File Structure

```
packages/core/src/ui/
  badge.tsx              — Badge component (rewrite)
  badge-indicator.tsx    — Badge.Indicator overlay
  badge-group.tsx        — Badge.Group overflow
  badge.stories.tsx      — All stories
  badge.test.tsx         — Tests
```

---

## What Does NOT Change

- Token system — no new tokens needed (custom color uses CSS variables + color-mix)
- Other components that consume Badge — they get the new API automatically
- DevalokGrain — works inside Badge via the same composition pattern as Button
