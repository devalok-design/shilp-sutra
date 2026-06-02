# Badge

Small inline status / label / chip. Counts, statuses, tags, filter chips.

```tsx
import { Badge } from '@devalok/shilp-sutra/ui/badge'
```

## When to use

- Status pill on a row (Active / Pending / Failed).
- Filter chip with optional dismiss X.
- Selectable tag (multi-select chips).
- Count indicator on an Avatar / Icon / Button — use `<Badge.Indicator>`.
- A horizontal cluster of tags — wrap in `<Badge.Group>` with optional `max`.

Not for in-flow text emphasis — use `<Text variant="label-*">` or `<Code>`.

## Variants

| Variant | When |
|---|---|
| `subtle` (default) | Tinted bg, colored border. Most common. |
| `solid` | Filled background, on-color text. Use for high-emphasis statuses (e.g. red error). |
| `outline` | Border-only, transparent bg. Use on already-tinted backgrounds. |
| `soft` | Tinted bg, no border. Lighter than `subtle`. Use in dense lists. |

## Colors

| Color | Use |
|---|---|
| `default` (default) | Neutral / generic. |
| `accent` | Brand-aligned tag. |
| `error` | Failed / blocked / critical. |
| `success` | Active / completed / healthy. |
| `warning` | Caution / overdue. |
| `info` | Informational / new. |
| `neutral` | Brand-agnostic muted tag. |
| `teal`, `amber`, `slate`, `indigo`, `cyan`, `orange`, `emerald` | Categorical (Kanban columns, project labels). Pick distinct hues per category. |
| `custom` | Drives off `--badge-color` (and `--badge-fg-color` for solid) inline CSS vars. |

## Sizes

| Size | When |
|---|---|
| `xs` | Inline next to a 14 px text run. |
| `sm` | Filter chips, dense tables. |
| `md` (default) | Standard row pills. |
| `lg` | Hero / marketing badges. |

## Props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'subtle'\|'solid'\|'outline'\|'soft'` | Default `subtle`. |
| `color` | See colors table | Default `default`. |
| `size` | `'xs'\|'sm'\|'md'\|'lg'` | Default `md`. |
| `startIcon` | `ReactElement` | Use `<Icon icon={IconX} />` — auto-sized. |
| `endIcon` | `ReactElement` | Same. |
| `dot` | `boolean` | Animated leading status dot. Use for live-state badges. |
| `onClick` | `() => void` | Renders as `<button>` — interactive badge. |
| `selected` | `boolean` | Toggle state — shows a check icon. Pair with `onClick`. |
| `disabled` | `boolean` | Reduced opacity + pointer-events-none. |
| `onDismiss` | `() => void` | Inline X button for filter chips. |
| `maxWidth` | `number` | Triggers truncation with `title` tooltip. |
| `truncate` | `boolean` | Ellipsis overflow without explicit maxWidth. |
| `circle` | `boolean` | Square aspect-ratio (icon-only / count badges). |
| `asChild` | `boolean` | Merge with a child (router Link, etc.). |

## Interactive modes

| Combo | Renders as | Use |
|---|---|---|
| `onClick` only | `<button>` | Selectable tag, filter chip. |
| `onDismiss` only | `<span>` with inner X button | Read-only chip with dismiss. |
| `onClick` + `onDismiss` | `<div role="button">` | Selectable + dismissible (avoids nested buttons). |

## Examples

**Status pill:**
```tsx
<Badge variant="solid" color="success">Active</Badge>
<Badge color="warning">Overdue</Badge>
<Badge color="error" dot>Failed</Badge>
```

**Dismissible filter chip:**
```tsx
<Badge color="accent" onDismiss={() => removeFilter('react')}>
  React
</Badge>
```

**Selectable tag (toggle):**
```tsx
<Badge
  onClick={() => toggleTag('design')}
  selected={selectedTags.has('design')}
  color="accent"
>
  Design
</Badge>
```

**Categorical chip with leading icon:**
```tsx
<Badge color="teal" startIcon={<Icon icon={IconUsers} />}>
  Engineering
</Badge>
```

**Count indicator on an Avatar:**
```tsx
<Badge.Indicator content={3} color="error">
  <Avatar src={user.avatar} alt={user.name} />
</Badge.Indicator>
```

**Tag cluster with overflow:**
```tsx
<Badge.Group max={3} size="sm" onOverflowClick={() => setShowAll(true)}>
  <Badge>React</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Tailwind</Badge>
  <Badge>Vite</Badge>
  <Badge>Vitest</Badge>
</Badge.Group>
{/* Renders: React, TypeScript, Tailwind, +2 */}
```

**As a router link:**
```tsx
<Badge asChild>
  <Link href="/tags/react">React</Link>
</Badge>
```

**Custom color:**
```tsx
<Badge color="custom" style={{ '--badge-color': '#8b5cf6' }}>
  Beta
</Badge>
```

## Composability

- **Badge.Group** lays out badges with consistent gap and an optional overflow indicator. Doesn't style children — they keep their own variant / color / size.
- **Badge.Indicator** overlays a count or dot onto any child (Icon, Avatar, Button). Positioning-only.
- **IconProvider:** `startIcon` / `endIcon` auto-size to badge size. Don't set explicit size on the nested Icon.
- **asChild:** Compose with router Link for nav-style badges.

See `foundations/color.md` for the color step system, `foundations/icons.md` for IconProvider.

## Rules

- For destructive / failed states, use `variant="solid" color="error"`. There is no `variant="destructive"`.
- Use `Badge.Group` for any tag list — manual gap-handling drifts from the spacing cadence.
- For toggle-style selectable tags, use `onClick` + `selected`. Don't roll your own with `<Toggle>` styled to look like a Badge.
- Don't nest a Badge inside a Button — it produces invalid nested buttons. Use `Badge.Indicator` over the Button instead.
- Icons in `startIcon` / `endIcon` go through `<Icon icon={...} />`. Don't pass `size` on the Icon.
- For truncated badges, set `truncate` AND a `maxWidth` or container width. Both work together.
- The deprecated `Chip` component was merged into Badge — use `Badge` with `onClick` for interactive tags.
