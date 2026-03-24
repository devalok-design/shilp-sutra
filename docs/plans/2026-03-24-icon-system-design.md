# Icon System — Design

**Date:** 2026-03-24
**Scope:** New `<Icon>` wrapper component, `IconContext` provider, `IconGroup` utility, animation system, Button integration. Breaking change to Button's `startIcon`/`endIcon` props.
**Packages:** `@devalok/shilp-sutra` (core)

---

## Design Principles

1. **Context-aware by default** — Icons read size and stroke from parent components (Button, IconButton, IconGroup) via React context. Explicit props always override.
2. **Tabler-native** — The system wraps `@tabler/icons-react` without fighting it. Prop names match Tabler conventions (`stroke`, not `weight`). Default rendering is identical to a raw Tabler icon.
3. **Animation as composition** — Preset motions (spin, pulse, bounce) are props. Choreographed transitions (loading → success) delegate to the battle-tested Spinner component. No icon-to-icon morphing.
4. **CSS inheritance for color** — Icons use `currentColor`. No color prop. Color comes from the parent's text color, which comes from the variant system (Button, Badge, etc.). This is what every major design system does.

---

## Research Basis

Synthesized from: Phosphor Icons (weight prop, IconContext), Adobe Spectrum (parent-controlled sizing via slots), MUI SvgIcon (semantic size tokens), Chakra Icon (createIcon factory), Lucide (absoluteStrokeWidth), Mantine ThemeIcon (container pattern), Iconify (1em scaling).

**Key decisions informed by research:**
- `stroke` prop with semantic values (Phosphor pattern adapted for Tabler)
- `IconContext` provider for subtree defaults (Phosphor pattern)
- Parent context sizing — Button tells Icon how big to be (Spectrum pattern)
- `aria-hidden` by default, opt-in `label` (Spectrum + Radix pattern)
- No `color` prop — `currentColor` inheritance (universal consensus)
- No `filled` prop — crude fill looks bad on most outline icons. Import `IconXxxFilled` directly.
- No icon-to-icon morphing — instant swap is better UX (industry consensus)
- Default stroke 2 — matches Tabler default and industry standard (Lucide, Phosphor regular)

---

## The `<Icon>` Component

### API

```tsx
interface IconProps extends Omit<React.SVGAttributes<SVGElement>, 'stroke'> {
  /** The Tabler icon component */
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>

  /** Size tier — reads from IconContext if not set
   *  xs=14px, sm=16px, md=18px (default), lg=20px, xl=24px, 2xl=32px */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  /** Stroke weight for outline icons
   *  light=1.5, regular=2 (default, matches Tabler), bold=2.5 */
  stroke?: 'light' | 'regular' | 'bold'

  /** Accessible label — renders <title> inside SVG + sets aria-label.
   *  Without this, icon is aria-hidden="true" (decorative). */
  label?: string

  /** Preset animation or controlled motion values.
   *  'none' explicitly disables inherited animation. */
  animate?: 'spin' | 'pulse' | 'bounce' | 'none' | { rotate?: number; scale?: number }

  /** State machine for choreographed loading → success/error transitions.
   *  Delegates to the Spinner component internally. */
  state?: 'idle' | 'loading' | 'success' | 'error'

  className?: string
}
```

### Size Tiers

| Tier | Pixels | Stroke light/regular/bold | Used by |
|------|--------|--------------------------|---------|
| `xs` | 14px | 1.25 / 1.5 / 2 | Button xs, compact-xs |
| `sm` | 16px | 1.5 / 2 / 2.5 | Button sm, compact-sm |
| `md` | 18px | 1.5 / 2 / 2.5 | Button md, compact-md (default) |
| `lg` | 20px | 1.75 / 2 / 2.5 | Button lg |
| `xl` | 24px | 2 / 2 / 2.5 | EmptyState, standalone |
| `2xl` | 32px | 2 / 2.25 / 2.5 | EmptyState lg, hero |

Default: `size="md"`, `stroke="regular"` → 18px, strokeWidth 2. Identical to `<IconPlus size={18} stroke={2} />`.

### Stroke Values

Named values map to numeric strokeWidth:

```typescript
const STROKE_MAP = {
  light:   { xs: 1.25, sm: 1.5, md: 1.5, lg: 1.75, xl: 2, '2xl': 2 },
  regular: { xs: 1.5,  sm: 2,   md: 2,   lg: 2,    xl: 2, '2xl': 2.25 },
  bold:    { xs: 2,    sm: 2.5, md: 2.5, lg: 2.5,  xl: 2.5, '2xl': 2.5 },
} as const
```

Stroke scales with size to maintain consistent visual weight. A 14px icon with stroke 2 looks heavy; the same icon at 24px with stroke 2 looks normal. The map compensates for this.

### Accessibility

- **Decorative (default):** `aria-hidden="true"` on the SVG. No screen reader announcement.
- **Meaningful (with `label`):** `aria-label={label}`, `role="img"`, `<title>{label}</title>` inside SVG. Removes `aria-hidden`.

### Reduced Motion

Icon reads `useReducedMotion()` from Framer Motion. When reduced motion is preferred:
- `spin` → static (no rotation)
- `pulse` → static (no scale)
- `bounce` → static
- `state` transitions → opacity crossfade only (no arc drawing, no path animation)
- Controlled `{ rotate, scale }` → instant snap (duration 0)

---

## `IconContext` Provider

```tsx
interface IconContextValue {
  size?: IconProps['size']
  stroke?: IconProps['stroke']
}

const IconContext = React.createContext<IconContextValue>({})

function IconProvider({ size, stroke, children }: IconContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ size, stroke }), [size, stroke])
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}
```

Resolution order: explicit prop > IconContext > defaults (`size="md"`, `stroke="regular"`).

**Who provides context:**
- `Button` — provides `{ size }` mapped from Button's size prop
- `IconButton` — provides `{ size }` mapped from IconButton's size prop
- `IconGroup` — provides `{ size, stroke }` explicitly
- `IconProvider` — manual, for toolbars/navs/custom contexts

---

## `<IconGroup>` Utility

```tsx
interface IconGroupProps {
  size?: IconProps['size']
  stroke?: IconProps['stroke']
  gap?: 'tight' | 'default' | 'loose'  // 2px / 4px / 8px
  className?: string
  children: React.ReactNode
}
```

Renders a flex row with consistent gap, provides IconContext to children.

```tsx
<IconGroup size="sm" stroke="light" gap="tight">
  <Icon icon={IconBold} />
  <Icon icon={IconItalic} />
  <Icon icon={IconUnderline} />
</IconGroup>
```

---

## Animation System

### Tier 1: Preset Motions

Applied via the `animate` prop. Uses existing motion tokens from `lib/motion.ts`.

| Preset | Motion | Duration | Easing | Use case |
|--------|--------|----------|--------|----------|
| `spin` | rotate 360° continuous | 1s per revolution | linear | Loading indicators |
| `pulse` | scale 1 → 1.15 → 1 | 2s loop | easeInOut | Attention/notification |
| `bounce` | translateY 0 → -4px → 0 | 1.5s loop | easeInOut | New content hint |
| `none` | no animation | — | — | Override inherited animation |
| `{ rotate: N }` | rotate to N degrees | `springs.snappy` | spring | Chevron expand/collapse |
| `{ scale: N }` | scale to N | `springs.snappy` | spring | Active/selected state |

Implementation: Framer Motion `motion.svg` with `animate` prop. Presets map to Framer transition configs.

### Tier 2: State Machine (Loading → Success/Error)

The `state` prop triggers a choreographed sequence:

```
idle → loading:
  1. Current icon fades out (opacity 1→0, 100ms, tweens.fade)
  2. Spinner fades in (opacity 0→1, 100ms, tweens.fade)
  3. Spinner arc rotates + stroke-dasharray cycles (existing Spinner animation)

loading → success:
  1. Spinner arc stops rotating
  2. Arc morphs into checkmark (pathLength 0→1, 350ms, easeOut) — existing Spinner behavior
  3. Brief hold (300ms)
  4. Checkmark fades out, original icon fades back in (or stays as check — configurable)

loading → error:
  1. Same as success but draws X mark instead of checkmark
  2. Uses error color from inherited text color

success/error → idle:
  1. Check/X fades out (150ms)
  2. Original icon fades in (150ms)
```

Implementation: Wraps existing `Spinner` component. The Icon component renders either the Tabler icon or the Spinner based on `state`. AnimatePresence handles crossfades. Spinner inherits `currentColor` for arc color (not hardcoded accent).

---

## Button Integration (Breaking Change)

### What changes

| Before | After |
|--------|-------|
| `startIcon={<IconPlus />}` | `startIcon={<Icon icon={IconPlus} />}` |
| Button's `iconSizeClass` map sizes icons | Icon reads `IconContext` from Button |
| Button's `iconInsetClass` applies negative margin | Button applies inset on its own wrapper span |
| Button's `dimIcon` logic (opacity 0.9) | Icon inherits opacity from Button's icon wrapper |
| Button renders icon in `<span className={cn(iconClass, ...)}>` | Button renders icon in `<span className="...inset...opacity...">` |

### What moves OUT of Button

- `iconSizeClass` record — deleted (Icon handles sizing)
- `spinnerSizeMap` record — deleted (Icon/Spinner handle sizing)
- `dimIcon` logic — simplified (Button wrapper applies `opacity-90`)

### What stays in Button

- `iconInsetClass` record — negative margin is a Button layout concern
- `pillPaddingClass` — Button padding concern
- `startIcon`/`endIcon` prop (type changes to `React.ReactElement`)
- Icon wrapper `<span>` with inset, opacity, pointer-events-none, z-index

### Button provides IconContext

```tsx
// Inside Button's render:
const iconContextValue = useMemo(() => ({
  size: BUTTON_TO_ICON_SIZE[resolvedSize], // md → 'md', xs → 'xs', lg → 'lg', etc.
}), [resolvedSize])

return (
  <IconContext.Provider value={iconContextValue}>
    <button ...>
      {grainElements}
      {renderStartSlot()}
      {renderChildren()}
      {renderEndSlot()}
    </button>
  </IconContext.Provider>
)
```

The Icon inside reads context and sizes itself. Button no longer needs to know about icon dimensions.

### Migration

Every usage of `startIcon={<TablerIcon />}` becomes `startIcon={<Icon icon={TablerIcon} />}`. This is a mechanical find-and-replace across the codebase.

---

## Storybook Stories (~10)

1. **Size Scale** — One icon (IconPlus) at xs through 2xl, side by side
2. **Stroke Weights** — Same icon at light/regular/bold per size tier
3. **In Context: Button** — Icons in buttons at every size, showing auto-sizing
4. **In Context: Components** — Icon in Badge, Input adornment, EmptyState, Nav item
5. **IconGroup** — Toolbar pattern with tight/default/loose gap
6. **Animate: Presets** — Spin, pulse, bounce, controlled rotate/scale
7. **Animate: State Machine** — Interactive demo: click to trigger idle → loading → success/error → idle
8. **Accessibility** — With/without labels, screen reader behavior
9. **With DevalokGrain** — Icons inside grain buttons at different sizes
10. **Migration Guide** — Before/after showing old `startIcon={<IconPlus />}` vs new `startIcon={<Icon icon={IconPlus} />}`

---

## File Structure

```
packages/core/src/ui/
  icon.tsx              — <Icon> component
  icon-context.tsx      — IconContext + IconProvider + useIconContext hook
  icon-group.tsx        — <IconGroup> utility
  icon.stories.tsx      — All 10 stories
  icon.test.tsx         — Tests
```

---

## What Does NOT Change

- Tabler icons library — no change, no fork, no wrapper around the package
- Spinner component — stays as-is, Icon delegates to it for state transitions
- EmptyState — will adopt `<Icon>` in a follow-up, not in this PR
- IconButton — will provide IconContext, but its API stays the same
- DevalokGrain — unrelated, no changes

---

## Risks

1. **Breaking change to Button startIcon/endIcon** — Every consumer must update. Mechanical but tedious. The karm package has ~30 Button usages with icons.
2. **Spinner color inheritance** — Spinner currently hardcodes accent-9 for the arc. Needs to be updated to use `currentColor` for the state machine to work correctly inside colored buttons.
3. **Context stacking** — If an IconGroup is inside a Button, which context wins? Resolution order (explicit prop > nearest context) handles this, but needs testing.
