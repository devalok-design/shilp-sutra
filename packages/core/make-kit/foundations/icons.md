# Icons

The kit uses **Tabler Icons** exclusively. Custom icon libraries are not supported.

## Install

`@tabler/icons-react` is declared as a peer dependency:

```bash
npm i @tabler/icons-react
```

## Import + use

```tsx
import { Icon } from '@devalok/shilp-sutra/ui/icon'
import { IconHome, IconUser, IconSettings } from '@tabler/icons-react'

<Icon icon={IconHome} />
<Icon icon={IconUser} size={20} />
<Icon icon={IconSettings} className="text-fg-muted" />
```

Or pass the component directly to a prop that accepts `IconInput`:

```tsx
<Button startIcon={IconPlus}>Add</Button>
<Badge icon={IconCheck}>Verified</Badge>
```

## `IconInput` (universal icon prop type)

Every icon-accepting prop across the kit (`startIcon`, `endIcon`, `icon`, `leftIcon`, `rightIcon`) takes `IconInput`. Four shapes work interchangeably:

```tsx
// 1. Component reference (Tabler component)
<Button startIcon={IconPlus} />

// 2. Rendered <Icon> element
<Button startIcon={<Icon icon={IconPlus} />} />

// 3. Rendered Tabler element directly
<Button startIcon={<IconPlus />} />

// 4. Any custom node (svg, span with bg)
<Button startIcon={<MyCustomIcon />} />
```

Prefer shape 1 (component ref) — the kit applies the right size and color via context.

## Sizing via `IconProvider`

Don't add `className="h-4 w-4"` on every Icon. Wrap a subtree:

```tsx
import { IconProvider } from '@devalok/shilp-sutra/ui/icon-context'

<IconProvider size={16}>
  <NavSection>
    <Icon icon={IconHome} />
    <Icon icon={IconUser} />
    {/* all icons here = 16px */}
  </NavSection>
</IconProvider>
```

Override per-icon with `<Icon icon={...} size={24} />`.

Default sizes by component context:

| Context | Default size |
|---|---|
| Button (md) | 16 |
| Button (sm / xs) | 14 |
| Button (lg / xl) | 18 / 20 |
| Input (any size) | 16 |
| Badge | 12 |
| Standalone | 16 (recommended) |

## Color

Icons inherit `currentColor` by default. To color one:

```tsx
<Icon icon={IconAlertTriangle} className="text-warning-11" />
<Icon icon={IconCheck} className="text-success-11" />
```

Inside a `<Button>` or `<Badge>`, color is inherited from the button/badge — don't override.

## Multi-color / branded icons (OAuth, etc.)

OAuthButton ships brand glyphs for 13 providers. To use a brand's official multi-color SVG, pass `icon` to override:

```tsx
<OAuthButton provider="google" icon={<GoogleColorSVG />} />
```

For custom branded icons elsewhere, use raw `<svg>` — `<Icon>` is for Tabler outline glyphs.

## Rules

- **Tabler only** — no lucide-react, no heroicons, no mui-icons. The kit is sized for Tabler's stroke weight.
- **Use `<Icon icon={...} />`** — don't render Tabler components directly when inside a kit component that accepts `IconInput`.
- **Don't size with className** (`h-4 w-4`) — use `size` prop or `IconProvider`.
- **Don't color icons inside Button / Badge** — they inherit from the parent. Color only on standalone icons.
- **Don't pass a string** (`"check"`) — `IconInput` excludes strings/numbers. Always a component or element.
