# Surface

- Import: @devalok/shilp-sutra/ui/surface
- Server-safe: Yes
- Category: ui

The low-level elevated container primitive. Owns background + shadow + radius + optional padding and border — nothing else. Card, Popover, Toast, Sheet, and other surfaces compose it.

## Props
### Surface
    elevation: "flat" | "raised" | "floating" | "overlay"
    padding: "none" | "sm" | "md" | "lg"
    radius: "none" | "control" | "surface" | "overlay" | "pill"
    bordered: "true" | "false"
    asChild: boolean — render as the passed child element (Radix Slot) instead of a div

## Defaults
    Surface: elevation="raised", padding="none", radius="surface", bordered=false

## Elevation
    flat      — bg-surface-panel, no shadow (pair with `bordered` for an on-page tile)
    raised    — bg-surface-panel + shadow-raised (card level)
    floating  — bg-surface-overlay + shadow-floating (toasts, floating toolbars)
    overlay   — bg-surface-overlay + shadow-overlay (popovers, menus, dialogs)

## Padding
    none=0 · sm=ds-04 (12px) · md=ds-05 (16px) · lg=ds-06 (24px) — simple all-side (not Card's gap model)

## Example
```jsx
// Raised panel with padding
<Surface elevation="raised" padding="md">…</Surface>

// On-page, border-led tile (no shadow)
<Surface elevation="flat" bordered padding="sm">…</Surface>

// The whole surface is a link
<Surface asChild elevation="raised" padding="sm">
  <a href="/upgrade">Upgrade to Pro</a>
</Surface>
```

## Composability
- Server-safe — renders in RSC trees.
- The base layer: `Card` = Surface + gap-model padding + color edge + header/content/footer slots. Reach for Card when you want that slot rhythm; reach for Surface for a plain elevated box.
- `asChild` merges the surface classes onto your own element (a link, section, or `motion.div`) with no extra wrapper node.
- Padding is symmetric all-side. For asymmetric or gap-model spacing, use Card or add your own utilities via `className`.

## Gotchas
- **Edge OR elevation, never both.** Combining `bordered` with a shadowed elevation (raised/floating/overlay) is the double-edge anti-pattern and dev-warns. Use `elevation="flat"` with `bordered`, or drop `bordered` and let the shadow be the edge.
- `flat` still uses `bg-surface-panel` (a card without a shadow), not the page background — it is a surface, not a hole.

## Changes
### Unreleased
- **Added** Initial release — `elevation` / `padding` / `radius` / `bordered` / `asChild`. The low-level surface primitive that Card and other surfaces compose.
