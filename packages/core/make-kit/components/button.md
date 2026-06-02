# Button

Primary action element. Use instead of `<button>` everywhere.

```tsx
import { Button } from '@devalok/shilp-sutra/ui/button'
```

## When to use

- Any user-triggered action: submit a form, open a dialog, navigate (with `asChild`), trigger a flow.
- Icon-only? Use `<IconButton>` instead.
- Action plus dropdown? Use `<SplitButton>`.
- Inline text link (no button affordance)? Use `<Link>` or `<Button variant="link">`.

## Variants — and which to pick

| Variant | When |
|---|---|
| `solid` (default) | Primary CTA. One per region. Heavy visual weight. |
| `soft` | Secondary action. **Preferred default for any non-primary action.** Tinted bg, colored text, no visible border — warmer than outline, brand-consistent. |
| `outline` | Secondary action on a colored / `surface-raised` bg where soft's tint disappears. In toolbars / icon-dense rows. Paired adjacent to a primary that needs explicit hierarchy. |
| `ghost` | Tertiary / dismissive — close, cancel, skip. Minimal weight. |
| `link` | Inline action that should read as a link but behave as a button. Use sparingly. |

**Rule:** for non-primary actions, default to `soft`. Reach for `outline` only when the three above conditions hit.

## Colors

| Color | Use |
|---|---|
| `accent` (default) | Primary brand action. |
| `error` | Destructive action. Pair with confirmation. |
| `success` | Confirmation / completion action. |
| `warning` | Caution action. |
| `neutral` | Brand-agnostic action. Filing/utility buttons. |

There is **no** `color="destructive"` — use `variant="solid" color="error"`.
There is **no** `variant="destructive"` — same.

## Sizes

| Size | Pixel height | When |
|---|---|---|
| `xs` | 28 | Filter chips, dense toolbars. |
| `sm` | 32 | Secondary actions in dense rows. |
| `md` (default) | 40 | Standard. |
| `lg` | 48 | Marketing CTAs, primary in spacious layouts. |
| `compact-xs/sm/md` | inline (height-less) | Inline buttons that flow with text. |
| `icon`, `icon-xs/sm/md/lg` | square | Use `<IconButton>` instead, with the same sizes. |

## Common props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'solid'\|'soft'\|'outline'\|'ghost'\|'link'` | See above. |
| `color` | `'accent'\|'error'\|'success'\|'warning'\|'neutral'` | See above. |
| `size` | `'xs'\|'sm'\|'md'\|'lg'` + compact + icon variants | Default `md`. |
| `startIcon`, `endIcon` | `IconInput` | Use `<Icon icon={IconX} />` or a Tabler ref. |
| `loading` | `boolean` | Disables click + shows spinner. |
| `loadingPosition` | `'start'\|'end'\|'center'` | Default `'start'`. |
| `fullWidth` | `boolean` | Stretch to parent width. |
| `shape` | `'default'\|'pill'` | Pill = fully rounded. |
| `weight` | `'semibold'\|'normal'` | Default `semibold`. Use `normal` for soft/ghost in dense areas. |
| `onClickAsync` | `(e) => Promise<void>` | Auto-runs idle → loading → success/error → idle state machine. |
| `asyncFeedbackDuration` | `number` (ms) | Default 1500. |
| `processing` | `boolean \| 'ambient' \| 'working' \| 'urgent'` | Marching-ants border for long ops. Forces `soft` variant. |
| `asChild` | `boolean` | Style transfers to child (use with router Links). |

## Examples

**Primary action:**
```tsx
<Button>Save</Button>
```

**Primary + secondary, sensible default:**
```tsx
<Stack direction="row" gap="ds-03">
  <Button>Save</Button>
  <Button variant="soft">Cancel</Button>
</Stack>
```

**Destructive with confirmation pattern:**
```tsx
<Button variant="solid" color="error" startIcon={IconTrash}>
  Delete project
</Button>
```

**Async with built-in feedback:**
```tsx
<Button onClickAsync={async () => { await api.save(form) }}>
  Save changes
</Button>
```

**Inside a ButtonGroup (toolbar):**
```tsx
<ButtonGroup variant="outline" size="sm">
  <Button startIcon={IconBold} />
  <Button startIcon={IconItalic} />
  <Button startIcon={IconUnderline} />
</ButtonGroup>
```

**With a router link (Next.js):**
```tsx
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

## Rules

- **Default to `variant="soft"`** for any non-primary action.
- **Never** `variant="destructive"` / `variant="secondary"` / `color="danger"` / `color="default"` — these don't exist.
- **Never** size `default` — use `md`.
- **Never** color-override via className (`className="bg-red-500"`) — use `color` prop.
- **Don't pair** explicit `loading` + `onClickAsync` — `onClickAsync` manages loading itself.
- **`processing` forces `variant="soft"`** so the marching ants are visible. Don't fight it.
- **Inside `<ButtonGroup>`**, omit `variant`/`color`/`size` on children unless intentionally overriding — they inherit from context.
- Icons in `startIcon` / `endIcon` auto-size via `IconProvider`. Don't pass `size` on the icon.
- For multi-line button content, use `<Stack>` inside; default Button is single-line.
