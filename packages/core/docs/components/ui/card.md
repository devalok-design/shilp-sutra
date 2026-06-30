# Card

- Import: @devalok/shilp-sutra/ui/card
- Server-safe: No
- Category: ui

## Props
    variant: "default" | "elevated" | "outline" | "flat"
    color: "default" | "accent" | "error" | "success" | "warning" | "info" | "neutral" (border accent color)
    size: "sm" | "md" | "lg" (padding — propagated to CardHeader/CardContent/CardFooter via context)
    interactive: boolean (enables hover shadow lift + pointer cursor)

### CardAction
    placement: "top-right" (default) | "top-left" | "bottom-right" | "bottom-left"
    tuck: boolean (pull a step toward the corner so an icon button's glyph aligns to the content edge)

## Compound Components
    Card (root)
      CardAction      ← absolutely-positioned corner slot (badge, icon button, menu)
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
- **Corner slots via `CardAction`:** Pin a badge, icon button, or menu to any corner (`placement`), inset to match the card's content padding. `tuck` pulls an icon button so its glyph (not its padding box) aligns to the content edge. Replaces the removed `accent` decorative bar — composition, not a bespoke prop. Card is `relative` to anchor it.
- **`color` paints the border, never a stacked rail:** `color` tints the 1px edge (semantic accent/error/success/…). The DS never stacks a border + drop shadow or a colored rail on top (make-kit rule #6 — that reads as an AI tell).
- **Interactive cards:** Set `interactive={true}` + `onClick` for clickable cards (entire surface becomes the button). Add `aria-label` on the Card root when there's no visible heading. For complex multi-action cards, prefer standard Card with explicit buttons inside.
- **ContentCard (composed) is deprecated** — compose `Card` + `CardHeader`/`CardContent`/`CardAction` directly instead.

## Gotchas
- Use `interactive` prop for clickable cards — adds hover lift and pointer cursor
- Don't override CardHeader/CardContent/CardFooter padding via className if you want the size cascade to work — set size on Card instead

## Changes
### v0.44.0
- **BREAKING** Removed `accent` / `accentColor` (the colored edge-bar / left-rail). Use `<CardAction>` for corner content, or `color` for a tinted border. The DS no longer ships a stacked rail (make-kit rule #6).
- **Added** `<CardAction>` compound — composable corner slot (4 placements, `tuck`).
- **Changed** Gap-model padding: the container owns vertical `py` + inter-slot `gap`; slots own only horizontal `px`. Adding/removing a slot can't unbalance the bottom edge. Card is now `relative`.

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
