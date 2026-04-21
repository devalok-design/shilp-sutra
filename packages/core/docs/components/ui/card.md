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

## Gotchas
- Use `interactive` prop for clickable cards — adds hover lift and pointer cursor

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
