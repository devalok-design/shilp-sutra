# Card

The default container for any panel-style content that sits **on** the page.

```tsx
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@devalok/shilp-sutra/ui/card'
```

## When to use

- Any rectangular region that reads as a discrete unit on the page: dashboards widgets, list items, marketing feature blocks.
- Need built-in header / actions / footer slots? Use `<ContentCard>` (composed wrapper).
- Need just a tinted region with no card affordance? Use a `<div className="bg-surface-raised">` (rare; usually Card is right).

Card renders on `surface-raised` with `shadow-raised`. **Never** override its background or border.

## Variants

| Variant | Use |
|---|---|
| `default` (default) | `surface-raised` + `shadow-raised`. Standard card. |
| `elevated` | Slightly stronger shadow. Use for hero / hovered emphasis. |
| `outline` | `surface-raised` + border-only (no shadow). Dense lists where 12 cards stacked together would feel too lifted. |
| `flat` | `surface-raised` + no shadow, no border. For cards inside an already-elevated container. |

## Colors

| Color | What it tints |
|---|---|
| `default` (default) | Standard border. |
| `accent`, `error`, `success`, `warning`, `info`, `neutral` | Border picks up the semantic color at step-7. Use to signal status without filling the whole card. |

## Sizes (padding cascade)

`size` on Card propagates to `CardHeader`, `CardContent`, `CardFooter` via React context:

| Size | Default padding |
|---|---|
| `sm` | `ds-04` (12 px) |
| `md` (default) | `ds-05` (16 px) |
| `lg` | `ds-07` (32 px) |

Override on a sub-component via `className` only if absolutely necessary — it breaks the cascade.

## Compound shape

```
Card (root)
  CardHeader      ← inherits size from Card
    CardTitle
    CardDescription
  CardContent     ← inherits size from Card
  CardFooter      ← inherits size from Card
```

## Other props

| Prop | Type | Notes |
|---|---|---|
| `interactive` | `boolean` | Adds hover lift + `cursor-pointer`. Make the whole card clickable. Provide `onClick` and `aria-label`. |

### CardAction (corner slot)

| Prop | Type | Notes |
|---|---|---|
| `placement` | `'top-right'` (default) `\| 'top-left' \| 'bottom-right' \| 'bottom-left'` | Which corner. Inset matches the card's content padding. |
| `tuck` | `boolean` | Pull a step toward the corner so an icon button's glyph (not its padding box) aligns to the content edge. |

## Examples

**Standard:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Q4 revenue</CardTitle>
    <CardDescription>Last updated 2h ago</CardDescription>
  </CardHeader>
  <CardContent>
    <Text variant="heading-lg">$2.4M</Text>
    <Text variant="body-sm" className="text-fg-muted">+18% YoY</Text>
  </CardContent>
</Card>
```

**Interactive (whole card clickable):**
```tsx
<Card interactive onClick={() => navigate(`/projects/${id}`)} aria-label={`Open ${name}`}>
  <CardHeader>
    <CardTitle>{name}</CardTitle>
    <CardDescription>{owner} · {memberCount} members</CardDescription>
  </CardHeader>
</Card>
```

**Status-tinted border (warning):**
```tsx
<Card color="warning">
  <CardHeader>
    <CardTitle>Action required</CardTitle>
    <CardDescription>2 invoices are overdue.</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button variant="soft" color="warning">Review</Button>
  </CardFooter>
</Card>
```

**Corner slot — status badge / overflow action:**
```tsx
<Card>
  <CardAction><Badge color="success" size="xs">DEPLOYED</Badge></CardAction>
  <CardHeader>
    <CardTitle>Deploy succeeded</CardTitle>
    <CardDescription>main · 2 min ago</CardDescription>
  </CardHeader>
  <CardAction placement="bottom-right" tuck>
    <Button variant="ghost" size="sm">View logs</Button>
  </CardAction>
</Card>
```

**Dense list — outline variant, no shadow accumulation:**
```tsx
<Stack gap="ds-03">
  {items.map((item) => (
    <Card key={item.id} variant="outline" size="sm">
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
    </Card>
  ))}
</Stack>
```

**Inside a colored region (flat):**
```tsx
<div className="bg-surface-sunken p-ds-07">
  <Card variant="flat">…</Card>  {/* nested-feel, no double shadow */}
</div>
```

## Rules

- **Never** `bg-surface-base` on a Card — cards sit on `surface-raised`. The pre-publish audit rejects this.
- **Never** combine `border-*` + `shadow-*` on a Card. Pick one (Card already does — don't override).
- **Use `interactive` + `onClick` + `aria-label`** for clickable cards. Don't wrap a Card in a `<button>` — broken nesting.
- **`size` on Card** drives sub-component padding. Don't set padding on `CardContent` directly.
- **Don't stack `default` cards inside another `default` card.** The nested one should be `flat` or `outline`.
- For row-style content (avatar + title + meta + actions), prefer `<ContentCard>` from `/composed/content-card` — it bundles the slots.
