# Surfaces & Shadows

The kit ships five semantic surface tiers and a paired shadow system. **Picking the right surface is mandatory** — the wrong one breaks elevation hierarchy and dark mode adaptation. There is a hard rule about never combining surfaces with borders.

## The five surface tiers

| Tier | Token | What sits here |
|---|---|---|
| **Base** | `surface-base` | Page background. The "back wall." |
| **Raised** | `surface-raised` | Cards, widgets, panels — anything that floats **on** the page. |
| **Sunken** | `surface-sunken` | Shell chrome (Sidebar, TopBar), board columns, segmented-control tracks. |
| **Overlay** | `surface-overlay` | Floating layers — Dialog, Sheet, Popover, Dropdown, Toast, Tooltip-when-light, Input field. |
| **Inverted** | `surface-inverted` | Tooltips, inverted badges. Pair with `text-surface-inverted-fg`. |

Each tier has hover / active variants:

- `surface-raised-hover` — hover on a raised element.
- `surface-raised-active` — pressed / selected raised element.

And a disabled state:

- `surface-disabled` + `text-surface-fg-disabled`.

## Decision matrix

| Building… | Surface | Shadow |
|---|---|---|
| Page / layout shell | `surface-base` | none |
| Sidebar / TopBar (shell) | `surface-sunken` | `shadow-raised` |
| Card / widget / panel | `surface-raised` | `shadow-raised` |
| Card on hover | `surface-raised` | `shadow-raised-hover` |
| Board column / well / track | `surface-sunken` | none |
| Popover / dropdown / menu | `surface-overlay` | `shadow-floating` |
| Dialog / modal / sheet | `surface-overlay` | `shadow-overlay` |
| Tooltip | `surface-inverted` | `shadow-floating` |
| Toast | `surface-overlay` | `shadow-floating` |
| Input (rest) | `surface-overlay` | none |
| Input (focus) | `surface-overlay` | `shadow-ring` |
| Button (solid) | accent colors | `shadow-raised` |
| Button (disabled) | `surface-disabled` | none |
| Segmented track | `surface-sunken` | `shadow-inset` |
| Selected item | current surface | `shadow-glow` |
| Backdrop (under modal) | `bg-backdrop` | none |

## Shadow tokens

| Token | When |
|---|---|
| `shadow-raised` | Cards, panels, shell chrome at rest. |
| `shadow-raised-hover` | Cards on hover. Subtle lift. |
| `shadow-floating` | Popovers, dropdowns, menus, tooltips. |
| `shadow-overlay` | Dialogs, sheets. Deepest. |
| `shadow-brand` | Optional brand-tinted glow. Use on hero CTA. |
| `shadow-glow` | Selection / focus accent. |
| `shadow-inset` | Toggle / segmented track deboss. |
| `shadow-ring` | Focus ring (2px accent). |
| `shadow-ring-sm` | Subtle separator (1px border-color). |
| `shadow-kbd` | Inset for keyboard shortcut badges. |
| `shadow-success` / `shadow-error` / `shadow-warning` | Status glow. Use on status notifications. |

## The hard rule: never combine `border-*` with `shadow-*`

Shadow tokens include a 1-px ring layer (inset hairline + drop shadow). Adding an explicit `border-surface-border` on top creates a 2-px edge that looks broken.

❌ **Wrong:**
```tsx
<div className="bg-surface-raised border border-surface-border shadow-raised rounded-(--radius-surface)">
```

✅ **Right (shadow only):**
```tsx
<div className="bg-surface-raised shadow-raised rounded-(--radius-surface)">
```

✅ **Right (border only — when shadow is unwanted, e.g. dense lists):**
```tsx
<div className="bg-surface-raised border border-surface-border rounded-(--radius-surface)">
```

`<Card>` already follows this rule. Don't override with extra border classes.

## Elevation reasoning

Surfaces describe **what kind of layer** something is, not **how high** it is. Two cards next to each other are both `raised`. A dialog over them isn't `raised-more` — it's `overlay`. A sidebar isn't `raised-but-lower` — it's `sunken`.

This means: **don't stack `raised` on `raised`**. If you'd reach for that, the inner element is probably `overlay` or wants a `surface-sunken` recess instead.

## Dark mode

In dark mode the kit lightens surfaces with elevation (so `surface-overlay` is *brighter* than `surface-base`). This is the inverse of light mode and is intentional — it's how Stripe / Linear / Material 3 model elevation in dark. Don't fight it.

## Page composition example

```tsx
<div className="min-h-screen bg-surface-base">
  <aside className="bg-surface-sunken">  {/* Sidebar */}
    …
  </aside>
  <main className="bg-surface-base p-ds-07">
    <Card>  {/* Card — brings its own surface, shadow, and padding (never add p-*) */}
      …
      <Dialog>
        <DialogContent className="bg-surface-overlay shadow-overlay">
          …  {/* Modal */}
        </DialogContent>
      </Dialog>
    </Card>
  </main>
</div>
```

(In practice you wouldn't write the `bg-*` / `shadow-*` directly — `<Card>`, `<DialogContent>`, `<Sidebar>` apply them. This is just the layer model.)

## Rules

- **Card-like elements** (anything that reads as a panel on the page) → `surface-raised`, never `surface-base`.
- **Overlay-like elements** → `surface-overlay`, always.
- **Never** combine an explicit border with a shadow token.
- **Never** invent a sixth tier. Five is the system.
- **Don't** override `<Card>`, `<DialogContent>`, `<PopoverContent>` surface — they pick the right one for you.
- For Storybook authors and pre-publish audit: components in `src/ui/` that render as cards must NOT use `bg-surface-base`. The audit script will reject it.
