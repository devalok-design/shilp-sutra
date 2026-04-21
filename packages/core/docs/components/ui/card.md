# Card

- Import: @devalok/shilp-sutra/ui/card
- Server-safe: No
- Category: ui

## Props
    variant: "default" | "elevated" | "outline" | "flat"
    color: "default" | "accent" | "error" | "success" | "warning" | "info" | "neutral" (border accent color)
    size: "sm" | "md" | "lg" (padding — propagated to CardHeader/CardContent/CardFooter via context)
    interactive: boolean (enables hover shadow lift + pointer cursor)
    accent: "left" | "top" | "right" | "bottom" (render a colored accent bar on the specified edge)
    accentColor: "default" | "accent" | "error" | "success" | "warning" | "info" (color of the accent bar; default maps to accent-9)

## Compound Components
    Card (root)
      CardHeader      ← inherits size from Card context
        CardTitle
        CardDescription
      CardContent     ← inherits size from Card context
      CardFooter      ← inherits size from Card context

## Defaults
    variant="default", color="default", size="md"

## Example
```jsx
<Card variant="elevated" interactive onClick={() => navigate(url)}>
  <CardHeader>
    <CardTitle>Project</CardTitle>
    <CardDescription>Last updated 2h ago</CardDescription>
  </CardHeader>
  <CardContent><p>Content here</p></CardContent>
</Card>
```

## Composability
- **Size cascades through context** — Card's `size` prop sets padding on CardHeader, CardContent, and CardFooter via `CardSizeContext`. Don't set padding classes on sub-components directly; override via `className` if needed.
- **Not a compound state machine** — Card, CardHeader, CardTitle, etc. are purely structural. No open/close state.
- **Accent bar is independent:** The `accent` / `accentColor` props render a decorative colored edge bar (absolutely positioned, `aria-hidden`). Works alongside `color` (which tints the border) — the two can stack for layered emphasis.
- **Interactive cards:** Set `interactive={true}` + `onClick` for clickable cards (entire surface becomes the button). Add `aria-label` on the Card root when there's no visible heading. For complex multi-action cards, prefer standard Card with explicit buttons inside.
- **ContentCard (composed)** is a higher-level wrapper with built-in header/footer slots and title/actions — use it for list-row-style cards; use Card directly for custom layouts.

## Gotchas
- Use `interactive` prop for clickable cards — adds hover lift and pointer cursor
- Don't override CardHeader/CardContent/CardFooter padding via className if you want the size cascade to work — set size on Card instead

## Changes
### v0.31.0
- **Added** `color` prop: semantic border color (accent, error, success, warning, info, neutral)
- **Added** `size` prop: `sm | md | lg` — padding propagated to sub-components via React context

### v0.18.0
- **Changed** Interactive card hover lift animation migrated to Framer Motion

### v0.4.2
- **Changed** (BREAKING) `variant="outlined"` renamed to `variant="outline"`
- **Added** `cardVariants` export

### v0.1.1
- **Fixed** `leading-none tracking-tight` changed to `leading-ds-none tracking-ds-tight` for token compliance

### v0.1.0
- **Added** Initial release
