# Icon

- Import: @devalok/shilp-sutra/ui (barrel export)
- Server-safe: No
- Category: ui

## Props
    icon: ForwardRefExoticComponent (REQUIRED — Tabler icon or any ForwardRef SVG icon component)
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" — reads from IconContext if not set
    stroke: "light" | "regular" | "bold" — reads from IconContext if not set
    label: string — accessible label (renders <title> + sets aria-label; without it, icon is aria-hidden)
    animate: "spin" | "pulse" | "bounce" | "draw" | "none" | { rotate?: number; scale?: number }
    state: "idle" | "loading" | "success" | "error" — delegates to Spinner (bare variant)
    className: string

## Defaults
    size: "md" (from context or fallback)
    stroke: "regular" (from context or fallback)
    state: undefined (no state machine)
    animate: undefined (static render)

## Example
```jsx
<Icon icon={IconPlus} />
<Icon icon={IconPlus} size="xs" stroke="light" />
<Icon icon={IconPlus} label="Add item" />
<Icon icon={IconPlus} animate="spin" />
<Icon icon={IconCheck} animate="draw" />
<Icon icon={IconPlus} state="loading" />
<Icon icon={IconPlus} state="success" />
```

## Composability
- **IconContext consumption** — Icon auto-reads `size` and `stroke` from the nearest IconProvider. Button, IconButton, IconGroup, Input (startSection/endSection), Badge, NumberInput, and more all wrap their children in IconProvider so nested Icons auto-size. Explicit props always override context.
- **Use Tabler icon components** — the `icon` prop expects a ForwardRef SVG component (the shape Tabler React exports). Any icon lib following that shape works, but Tabler is the standard.
- **Label for a11y:** Without `label`, Icon is `aria-hidden="true"` (decorative — appropriate inside labeled buttons). With `label`, renders `role="img"` + aria-label + `<title>` for standalone icons.
- **State overrides animate:** When both are set, state wins. `state="loading"` renders a bare Spinner; success/error render animated glyphs via Framer Motion.
- **Reduced motion:** All animations respect `prefers-reduced-motion` — animate props fall back to static render.

## Gotchas
- Without `label`, the icon renders `aria-hidden="true"` (decorative)
- With `label`, the icon renders `role="img"` with `aria-label` and a `<title>` element
- **Priority rule:** If both `state` and `animate` are set, `state` wins
- `state="loading"` renders a bare Spinner; `state="success"` / `state="error"` render animated checkmark/cross
- Size tiers map to pixel values: xs=14, sm=16, md=18, lg=20, xl=24, 2xl=32
- Stroke weight varies by size tier (lighter strokes on smaller icons)
- Reads size/stroke from IconContext (provided by Button, IconGroup, etc.); explicit props override context
- `animate="draw"` works with IconCheck, IconX, and CircleCheck only — other icons fall back to static render
- Respects `prefers-reduced-motion` — animations disabled when user prefers reduced motion

## Changes
### v0.29.0
- **Added** Initial release — context-aware Icon wrapper with size tiers, stroke weights, accessibility, animations, state machine
- **Added** `animate="draw"` — SVG path-draw animation using `pathLength`. Draws check/X strokes progressively (0.35s easeOut). Respects `prefers-reduced-motion`.
