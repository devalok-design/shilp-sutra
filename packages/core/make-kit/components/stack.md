# Stack

Flexbox layout primitive. Use instead of `<div className="flex flex-col gap-4">` everywhere.

```tsx
import { Stack } from '@devalok/shilp-sutra/ui/stack'
```

## When to use

- Stacking elements vertically or horizontally with consistent gap.
- Any time you'd write `flex` + `gap-*` + `items-*` + `justify-*` on a div.
- Centering + width-capping a page section? Use `<Container>`, then a `<Stack>` inside.
- Grid layouts (rows × columns)? Use a Tailwind `grid` div directly — Stack is for one-axis layouts.

Server-safe — no hydration, no context.

## Props

| Prop | Type | Notes |
|---|---|---|
| `direction` | `'vertical'\|'horizontal'\|'row'\|'column'` | Default `vertical`. `row` = `horizontal`, `column` = `vertical` (aliases). |
| `gap` | `'ds-01'..'ds-13'` \| `0..13` | Design-system spacing token. Numbers map 1:1 to `ds-0N`. |
| `align` | `'start'\|'center'\|'end'\|'stretch'\|'baseline'` | Cross-axis alignment (`align-items`). |
| `justify` | `'start'\|'center'\|'end'\|'between'\|'around'\|'evenly'` | Main-axis alignment (`justify-content`). |
| `wrap` | `boolean` | Enables `flex-wrap`. |
| `as` | `ElementType` | Default `'div'`. Polymorphic. |
| `className` | `string` | For overrides — don't reach for raw `flex-*` utilities. |

## Gap cadence

Default to the 3-tier cadence from `foundations/spacing.md`:

| Gap | Use |
|---|---|
| `ds-03` (8 px) | Related items inside a group (icon + label, button row). |
| `ds-05` (16 px) | Grouped sections within a card / form. |
| `ds-07` (32 px) | Page sections / major regions. |

Don't reach for every adjacent token. If `ds-04` "feels right," it usually means a parent's padding or the section relationship needs a rethink.

## Examples

**Vertical form layout:**
```tsx
<Stack gap="ds-05">
  <FormField>
    <Label htmlFor="name">Name</Label>
    <Input id="name" />
  </FormField>
  <FormField>
    <Label htmlFor="email">Email</Label>
    <Input id="email" />
  </FormField>
</Stack>
```

**Horizontal toolbar:**
```tsx
<Stack direction="horizontal" gap="ds-03" align="center">
  <Button variant="soft" startIcon={IconFilter}>Filter</Button>
  <Button variant="soft" startIcon={IconSortDescending}>Sort</Button>
  <Separator orientation="vertical" className="h-6" />
  <Button variant="solid" startIcon={IconPlus}>New</Button>
</Stack>
```

**Avatar + label cluster:**
```tsx
<Stack direction="horizontal" gap="ds-03" align="center">
  <Avatar size="sm" src={user.avatar} alt={user.name} />
  <Stack gap="ds-01">
    <Text variant="label-plain-sm">{user.name}</Text>
    <Text variant="body-xs" className="text-fg-muted">{user.role}</Text>
  </Stack>
</Stack>
```

**Page-section spacing:**
```tsx
<Container>
  <Stack gap="ds-07">
    <PageHeader title="Projects" description="A workspace for everything you ship." />
    <Stack gap="ds-05">
      <SectionHeader title="Active" />
      <ProjectGrid projects={active} />
    </Stack>
    <Stack gap="ds-05">
      <SectionHeader title="Archived" />
      <ProjectGrid projects={archived} />
    </Stack>
  </Stack>
</Container>
```

**Wrap for tag cluster:**
```tsx
<Stack direction="horizontal" gap="ds-02" wrap>
  {tags.map((tag) => <Badge key={tag} color="neutral">{tag}</Badge>)}
</Stack>
```

For tag clusters specifically, prefer `<Badge.Group>` — it handles overflow with `+N` automatically.

**Justify-between (label + action):**
```tsx
<Stack direction="horizontal" gap="ds-04" align="center" justify="between">
  <Text variant="heading-md">Team</Text>
  <Button variant="soft" startIcon={IconPlus} size="sm">Invite</Button>
</Stack>
```

**Polymorphic — semantic list:**
```tsx
<Stack as="ul" gap="ds-03">
  {items.map((item) => (
    <Stack as="li" key={item.id} direction="horizontal" gap="ds-03" align="center">
      <Icon icon={IconCheck} />
      <Text variant="body-sm">{item.label}</Text>
    </Stack>
  ))}
</Stack>
```

**Numeric gap shortcut:**
```tsx
<Stack gap={5}>  {/* same as gap="ds-05" */}
  …
</Stack>
```

**Inside Card (no extra padding):**
```tsx
<Card>
  <CardContent>
    <Stack gap="ds-04">
      <Text variant="label-sm" className="text-fg-muted">REVENUE</Text>
      <Text variant="heading-xl">$2.4M</Text>
      <Text variant="body-sm" className="text-fg-muted">+18% YoY</Text>
    </Stack>
  </CardContent>
</Card>
```

CardContent already supplies the outer padding. Stack just spaces the children.

## Composability

- **Server-safe.** Nothing to hydrate. Use in RSC trees.
- **Polymorphic via `as`** — `<Stack as="ul">`, `<Stack as="section">`, `<Stack as="nav">`. Inherits flex behavior on the chosen element.
- **Compose with Container:** `<Container><Stack>...</Stack></Container>`. Container centers + caps width; Stack arranges children.
- **No responsive direction prop** — for `flex-col md:flex-row` use a plain div with Tailwind utilities directly, or render two Stacks with display toggling.

See `foundations/spacing.md` for the gap cadence, `foundations/surfaces.md` for layout-on-surfaces context.

## Rules

- Default to the `ds-03 / ds-05 / ds-07` cadence. Reach for other tokens only with a deliberate reason.
- Use Stack everywhere you'd write `flex` + `gap` on a div. Don't mix Stack and raw flex utilities in the same tree.
- For grid (2D) layouts, use a plain `grid` div. Stack is one-axis only.
- For responsive direction changes, drop to a plain div with Tailwind responsive flex utilities. Stack doesn't have a responsive direction prop.
- Don't add padding to a Stack — wrap it in a Container or Card. Padding lives on containers, not layout primitives.
- For tag clusters with potential overflow, use `<Badge.Group>` instead of `<Stack wrap>` — it handles `+N` collapsing.
- Numeric `gap={4}` and string `gap="ds-04"` are equivalent. Pick a convention per file and stick with it.
- `direction="row"` and `direction="column"` are aliases for `horizontal` / `vertical`. Pick one naming pair per codebase.
