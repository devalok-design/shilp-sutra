# Text

Typography primitive. Use instead of raw `<h1>`–`<h6>`, `<p>`, `<span>` for any visible text.

```tsx
import { Text } from '@devalok/shilp-sutra/ui/text'
```

## When to use

- Any visible text: headings, body copy, captions, section labels, inline microcopy.
- Inline code spans inside body text? Pair with `<Code>`.
- Polymorphic — `<Text as="span">`, `<Text as="div">`, etc. — to demote semantics while keeping visual weight.
- Server-safe — renders in RSC trees without `'use client'`.

## Variants

| Variant | Default element | Use |
|---|---|---|
| `heading-2xl` | `h1` | Page title / hero. |
| `heading-xl` | `h2` | Section title. |
| `heading-lg` | `h3` | Sub-section title. |
| `heading-md` | `h4` | Card title (used by `<CardTitle>`). |
| `heading-sm` | `h5` | Compact sub-heading. |
| `heading-xs` | `h6` | Smallest heading. |
| `body-lg` | `p` | Lead paragraphs. |
| `body-md` (default) | `p` | Standard body. |
| `body-sm` | `p` | Dense body — captions inside cards, table cells. |
| `body-xs` | `p` | Footnotes, fine print. |
| `label-lg` / `md` / `sm` / `xs` | `span` | UPPERCASE section labels, eyebrows. |
| `label-plain-lg` / `md` / `sm` / `xs` | `span` | Mixed-case labels (form labels, inline UI text). |
| `caption` | `span` | Image / chart captions. |
| `overline` | `span` | UPPERCASE marketing eyebrow. |
| `code` | `code` | Inline monospace code. |

`label-*` and `overline` variants are automatically uppercase. `label-plain-*` keeps mixed case.

## Props

| Prop | Type | Notes |
|---|---|---|
| `variant` | See variants table | Default `body-md`. |
| `as` | `ElementType` | Override the auto-selected HTML element. |
| `className` | `string` | For color / alignment overrides. Use semantic tokens only. |

Plus all standard HTML attributes for whatever element it renders.

## Examples

**Page heading + body:**
```tsx
<Stack gap="ds-04">
  <Text variant="heading-2xl">Projects</Text>
  <Text variant="body-md" className="text-fg-muted">
    A workspace for everything you ship.
  </Text>
</Stack>
```

**Section label + heading pair:**
```tsx
<Stack gap="ds-02">
  <Text variant="label-sm" className="text-fg-muted">REVENUE</Text>
  <Text variant="heading-xl">$2.4M</Text>
  <Text variant="body-sm" className="text-fg-muted">+18% YoY</Text>
</Stack>
```

**Visual demotion via `as`:**
```tsx
{/* h2-sized heading rendered as a div — useful when the element already has a heading ancestor */}
<Card>
  <CardHeader>
    <CardTitle>Activity</CardTitle> {/* h4 */}
    <Text variant="heading-xl" as="div">Weekly summary</Text>
  </CardHeader>
</Card>
```

**Inline span inside a paragraph:**
```tsx
<Text>
  Press <Text as="kbd" variant="code">⌘ K</Text> to open the command palette.
</Text>
```

**Caption under an image:**
```tsx
<Stack gap="ds-02">
  <img src={chart} alt="" />
  <Text variant="caption" className="text-fg-muted">
    Figure 1. Active users by region.
  </Text>
</Stack>
```

**Form field label (label-plain variant):**
```tsx
<Stack gap="ds-02">
  <Text variant="label-plain-sm" as="label" htmlFor="email">Email</Text>
  <Input id="email" type="email" />
</Stack>
```

Use `<Label>` for form fields when wired with FormField — `Text` is for non-form labels.

**Body with inline code:**
```tsx
<Text>
  Call <Code>onSubmit</Code> with the form values, or pass <Code>asChild</Code> to merge with a child element.
</Text>
```

**Truncated single line:**
```tsx
<Text variant="body-sm" className="truncate max-w-[200px]">
  {longUserName}
</Text>
```

## Composability

- **Server-safe.** No client hooks. Use freely in RSC trees.
- **No context cascade** — pure typography primitive. Variants don't propagate through children.
- **Underpins other components.** `<CardTitle>`, `<Alert>`'s title, `<PageHeader>`, `<EmptyState>`, `<SectionHeader>` all render Text internally with specific variants. Don't wrap another Text inside them.
- **`as` overrides element only, not variant.** Visual weight stays. Use to demote semantics when you have a heading ancestor.

See `foundations/typography.md` for the full type scale, line-height tokens, font stack.

## Rules

- Use Text for every visible text element. Don't write raw `<h1>` / `<p>` / `<span>` with manual classes.
- Pick variant by semantic intent, not visual size. `heading-xl` is an `<h2>` — use it for section headings, not because you want big text in a body paragraph (use `as="div"` for that).
- Don't wrap a `<Text>` inside `<CardTitle>` / `<Alert>` title — they already render Text internally.
- `label-*` and `overline` variants are automatically uppercase. Don't add `uppercase` class.
- For form labels paired with controls, use `<Label htmlFor>` from `/ui/label`. `Text variant="label-plain-*"` is for non-form labels.
- Color overrides go through semantic tokens (`text-fg-muted`, `text-fg`, `text-fg-subtle`). Never raw Tailwind palette utilities.
- Don't use Text inside another semantic heading — it produces nested headings that break screen-reader navigation.
- For inline code, use `<Code>`. `Text variant="code"` works but Code is the dedicated primitive.
