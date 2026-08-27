# Surface

```tsx
import { Surface } from '@devalok/shilp-sutra/ui/surface'
```

The low-level elevated container. It paints a tokened surface — background + shadow + radius, with optional padding and border — and nothing else. Card, Popover, Toast, and Sheet are built on it.

## When to use

- You need a plain elevated box (a promo, a callout, a small panel) and don't need Card's header/content/footer slots.
- You're building a new component that sits on a surface — compose `Surface`, never hand-roll `bg-surface-panel … shadow-raised`.

Use `<Card>` instead when you want the gap-model padding rhythm and the `CardHeader`/`CardContent`/`CardFooter` slots. Use raw utilities for nothing — if it's a surface, it's a `Surface`.

## Elevation — and which to pick

| `elevation` | Surface | Use for |
|---|---|---|
| `flat` | `bg-surface-panel`, no shadow | On-page tiles. Pair with `bordered` for an edge. |
| `raised` *(default)* | `bg-surface-panel` + `shadow-raised` | Cards, panels — anything sitting on the page. |
| `floating` | `bg-surface-overlay` + `shadow-floating` | Toasts, floating toolbars. |
| `overlay` | `bg-surface-overlay` + `shadow-overlay` | Popovers, menus, dialogs. |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `elevation` | `flat \| raised \| floating \| overlay` | `raised` | bg + shadow together. |
| `padding` | `none \| sm \| md \| lg` | `none` | Simple all-side: 0 / 12 / 16 / 24px. Not Card's gap model. |
| `radius` | `none \| control \| surface \| overlay \| pill` | `surface` | Maps `rounded-*` tokens. |
| `bordered` | `boolean` | `false` | Border-led edge. Only for `flat` — see Rules. |
| `asChild` | `boolean` | `false` | Render as the child element (Slot). |

Plus all native `div` props. Server-safe; forwards ref.

## Examples

```tsx
// Raised panel with padding
<Surface elevation="raised" padding="md">…</Surface>

// On-page, border-led tile (no shadow)
<Surface elevation="flat" bordered padding="sm">…</Surface>

// Overlay chrome
<Surface elevation="overlay" padding="sm" radius="overlay">…</Surface>

// The whole surface is a link — no wrapper node
<Surface asChild elevation="raised" padding="sm">
  <a href="/upgrade">Upgrade to Pro</a>
</Surface>
```

## Rules

- **Edge OR elevation, never both.** `bordered` + a shadowed `elevation` is the double-edge anti-pattern (dev-warns). Use `elevation="flat" bordered`, or drop `bordered`.
- `flat` is still a surface (`bg-surface-panel`), not the page — a card without a shadow, not a hole in the page.
- Don't reach for `Surface` when you mean `Card` — if you're rebuilding header/content/footer spacing by hand, use `Card`.
- Padding is symmetric. For anything asymmetric, use `className` or `Card`.
