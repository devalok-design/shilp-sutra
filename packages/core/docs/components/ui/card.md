# Card

- Import: @devalok/shilp-sutra/ui/card
- Server-safe: No
- Category: ui

## Props
    variant: "default" | "elevated" | "outline" | "flat"
    interactive: boolean (enables hover shadow lift + pointer cursor)

## Compound Components
    Card (root)
      CardHeader
        CardTitle
        CardDescription
      CardContent
      CardFooter

## Defaults
    variant="default"

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
### v0.18.0
- **Changed** Interactive card hover lift animation migrated to Framer Motion

### v0.4.2
- **Changed** (BREAKING) `variant="outlined"` renamed to `variant="outline"`
- **Added** `cardVariants` export

### v0.1.1
- **Fixed** `leading-none tracking-tight` changed to `leading-ds-none tracking-ds-tight` for token compliance

### v0.1.0
- **Added** Initial release
