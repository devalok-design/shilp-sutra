# Radius

Two layers: a primitive scale and semantic role tokens. **Components reference roles. Override roles, not individual components.**

## Two-layer model

**Primitive scale** (size buckets):

| Token | Pixels |
|---|---|
| `radius-ds-none` | 0 |
| `radius-ds-sm` | 2 |
| `radius-ds-md` | 6 |
| `radius-ds-lg` | 10 |
| `radius-ds-xl` | 16 |
| `radius-ds-2xl` | 24 |
| `radius-ds-full` | 9999 (pill) |

**Semantic roles** (mapped to scale at the default preset):

| Role | Default | Where it applies |
|---|---|---|
| `radius-control` | 6 | Button, Input, Select, IconButton, segmented item, Tab trigger. |
| `radius-control-inner` | 2 | Inner elements inside a control (e.g. selected segment indicator). |
| `radius-surface` | 10 | Cards, widgets, panels. |
| `radius-overlay-sm` | 6 | Tooltip, Toast. |
| `radius-overlay` | 10 | Popover, Dropdown, Menubar. |
| `radius-overlay-lg` | 16 | Dialog, Sheet. |
| `radius-pill` | 9999 | Badge, Switch, Radio dot, Avatar circle. Pill always wins. |
| `radius-bubble` | 24 | Chat bubbles. |

## How to apply

In components: never — they apply the right role automatically.

In your own elements (rare):

```tsx
<div className="bg-surface-panel rounded-(--radius-surface) p-ds-05">…</div>
```

TW4 shorthand `rounded-(--radius-surface)` is the right way. **Do not** use `rounded-ds-lg` directly — it's not a semantic role, and the pre-publish audit rejects it in `src/ui/`.

## Shape presets

The kit ships three shape presets, switchable via `[data-shape]` on `<html>`:

| Preset | Roles |
|---|---|
| `sharp` | control 2 / control-inner 0 / surface 4 / overlay 4–6 |
| `slightly-rounded` (default) | control 6 / control-inner 2 / surface 10 / overlay 6–16 |
| `rounded` | control 10 / control-inner 4 / surface 16 / overlay 10–24 |

Toggle by setting `data-shape="rounded"` on `<html>` (or any subtree) — every component re-skins instantly. Pill shapes (Badge, Switch, Radio dot, Avatar circle) stay pill regardless of preset.

```html
<html data-shape="rounded">
```

## Custom override

Consumers can swap any role in their global CSS:

```css
:root {
  --radius-control: 4px;     /* sharper buttons + inputs */
  --radius-surface: 12px;    /* gentler cards */
}
```

Override the role, not individual components. That way one declaration re-skins the whole system.

## Rules

- **Never** hand-pick a pixel radius (`rounded-[12px]`). Use a role.
- **Never** use `rounded-ds-*` directly in component-level code — that's the primitive scale, not the role.
- **Never** override `<Card>`, `<Button>` etc. radius via className. Override the role instead.
- **Pill shapes** are uncontested — Badge, Switch, Radio dot, Avatar circle stay pill no matter the preset.
