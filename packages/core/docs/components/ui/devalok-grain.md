# DevalokGrain

- Import: @devalok/shilp-sutra/ui/devalok-grain
- Server-safe: No
- Category: ui

## Props
    intensity: "subtle" | "medium" | "heavy" — grain intensity level
    surface: "solid" | "soft" — affects noise opacity ('solid' for filled backgrounds, 'soft' for tinted/muted)
    sheen: boolean — inner highlight (top-lit emboss) for premium 3D feel
    animated: boolean — fade-in entrance animation on mount
    hoverIntensify: boolean — increase grain visibility on parent hover (requires parent `group` class)
    tint: string — CSS color for the directional gradient (e.g. "oklch(0.55 0.19 360)", "var(--color-accent-9)")

## Defaults
    intensity: "subtle"
    surface: "solid"
    sheen: false
    animated: false
    hoverIntensify: false
    tint: undefined (no gradient, noise texture only)

## Example
```jsx
{/* Inside a Button (Button already has relative/overflow-hidden/isolate): */}
<Button>
  <DevalokGrain />
  Save changes
</Button>

{/* Inside a Card: */}
<Card className="relative overflow-hidden isolate">
  <DevalokGrain surface="soft" />
  Card content
</Card>

{/* Heavy grain with tint on a hero section: */}
<div className="relative overflow-hidden isolate rounded-ds-lg bg-accent-9 p-8">
  <DevalokGrain intensity="heavy" tint="oklch(0.55 0.19 360)" />
  <h1 className="relative z-[2]">Hero</h1>
</div>
```

## Gotchas
- Parent element MUST have `relative overflow-hidden isolate` for the grain to render correctly
- The grain layers are absolute-positioned at `z-[1]` — content that should appear above must use `z-[2]` or higher
- Uses `rounded-[inherit]` to match parent border-radius automatically
- Renders `aria-hidden="true"` — purely decorative
- Without `tint`, only the noise texture renders (no directional gradient)
- `hoverIntensify` requires the parent to have a `group` class for `group-hover:` to work
- Respects `prefers-reduced-motion` — entrance animation disabled when user prefers reduced motion

## Changes
### v0.29.0
- **Added** Initial release — brand noise texture with directional gradient, sheen, animation, and hover intensification
