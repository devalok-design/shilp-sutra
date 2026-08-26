# Card

The default container for any panel-style content that sits **on** the page.

```tsx
import {
  Card,
  CardAction,
  CardBleed,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSection,
} from '@devalok/shilp-sutra/ui/card'
```

## When to use

- Any rectangular region that reads as a discrete unit on the page: dashboards widgets, list items, marketing feature blocks.
- Header / actions / footer are built in as slots (`CardHeader`, `CardAction`, `CardFooter`) — don't reach for a wrapper. (`<ContentCard>` is deprecated; use Card slots.)
- Need just a tinted region with no card affordance? Use a `<div className="bg-surface-panel">` (rare; usually Card is right).

Card renders on `surface-panel`. The `default` variant is tonal — a surface-tone shift plus a whisper hairline (`border-card`), no shadow. **Never** override its background or border.

## Variants

| Variant | Use |
|---|---|
| `default` (default) | `surface-panel` + tonal `border-card` hairline, no shadow. Standard card — depth from tone, not a drop shadow. |
| `elevated` | `shadow-raised-hover`, no border. Use when a card must visibly pop (hero, dragged tile, spotlight panel). |
| `outline` | `surface-panel` + strong border-only (no shadow). Dense lists where stacked shadowed cards would feel too lifted. |
| `flat` | `surface-panel` + no shadow, no border. For cards inside an already-elevated container. |

## Colors

| Color | What it tints |
|---|---|
| `default` (default) | Standard border. |
| `accent`, `error`, `success`, `warning`, `info`, `neutral` | Border picks up the semantic color at step-7. Use to signal status without filling the whole card. |

## Sizes (one CSS variable)

`size` sets `--card-spacing` / `--card-gap` once on the root. The container reads them for its
vertical padding + inter-slot gap; every slot reads `--card-spacing` for its horizontal inset;
`CardAction` corners and `CardBleed` negations read the same variable.

| Size | `--card-spacing` | `--card-gap` |
|---|---|---|
| `sm` | `ds-05` (16 px) | `ds-03` (8 px) |
| `md` (default) | `ds-05b` (20 px) | `ds-04` (12 px) |
| `lg` | `ds-06` (24 px) | `ds-05` (16 px) |

To retune a single card, override the variable — never add `p-*`/`pt-*` classes:

```tsx
<Card className="[--card-spacing:var(--spacing-ds-07)]">…</Card>
```

## Compound shape

```
Card (root)              ← owns py + gap (vertical rhythm)
  CardBleed side="top"   ← optional full-bleed media (negates the card padding)
  CardHeader             ← owns px only
    CardTitle
    CardDescription
  CardContent            ← owns px only
  CardFooter             ← owns px only
  CardAction             ← absolute corner overlay
```

Direct children of Card span its **full width** (only slots are inset). A `<Separator />` or a
tinted band placed between slots is edge-to-edge for free. The flip side: **text must live inside
a slot** — a bare `<p>` as a direct child gets no horizontal inset (dev builds warn).

### CardBleed (escape the padding)

| Prop | Type | Notes |
|---|---|---|
| `side` | `'x'` (default) `\| 'top' \| 'bottom' \| 'y' \| 'all'` | Which card padding to negate. `top`/`bottom`/`y` are for **direct children** (cover images, edge bands) and inherit the card radius. `x`/`all` are for content **inside a slot**. Never use `x`/`all` on a direct child — it will overflow. |

### Horizontal cards

`orientation="horizontal"` turns the root into a padding-less row; put the media pane first and
wrap the text column in `<CardSection>`, which re-establishes py + gap from the same variables:

```tsx
<Card orientation="horizontal">
  <div className="w-28 shrink-0 overflow-hidden rounded-l-surface">
    <img className="h-full w-full object-cover" src={thumb} alt="" />
  </div>
  <CardSection>
    <CardHeader><CardTitle>Title</CardTitle></CardHeader>
    <CardFooter>meta</CardFooter>
  </CardSection>
</Card>
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

- **Never** `bg-surface-base` on a Card — cards sit on `surface-panel`. The pre-publish audit rejects this.
- **Never** combine `border-*` + `shadow-*` on a Card. Pick one (Card already does — don't override).
- **Use `interactive` + `onClick` + `aria-label`** for clickable cards. Don't wrap a Card in a `<button>` — broken nesting.
- **`size` on Card** drives all spacing via `--card-spacing`. Never set `p-*` on Card or a slot — override the variable if a one-off is truly needed.
- **Full-bleed** media/dividers use `<CardBleed>` (or plain direct children for full-width strips) — never negative-margin hacks.
- **Don't stack `default` cards inside another `default` card.** The nested one should be `flat` or `outline`, or better, a `bg-surface-base` recess.
- For row-style content (avatar + title + meta + actions), compose Card slots — `<ContentCard>` is deprecated and will be removed next major.
