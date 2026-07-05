# Spacing

The kit uses a `ds-*` spacing scale (2 → 160 px) so utilities never collide with consumer values. **Default to a three-tier cadence — `ds-03` / `ds-05` / `ds-07` — not every adjacent token.**

## Three-tier cadence (the rule)

| Tier | Token | Pixels | Use |
|---|---|---|---|
| Related | `ds-03` | 8 | Items that read as one chunk — icon + label, label + input, badges in a row. |
| Grouped | `ds-05` | 16 | Sections within a card — heading group, controls group, body. |
| Section | `ds-07` | 32 | Distinct page sections, big breaks. |

**Do not** reach for `ds-04` (12 px) or `ds-06` (24 px) just because they exist. Three tiers create rhythm; five create noise.

If you need a *fourth* tier (e.g. between heading and body inside one group), use `ds-02` (4 px) — that's the "tight pair" tier (caption to value, hint to input).

## Full scale

| Token | Pixels | Typical use |
|---|---|---|
| `ds-01` | 2 | Hairline gap. Rare. |
| `ds-02` | 4 | Tight pair (caption under value, icon to text inside dense control). |
| `ds-02b` | 6 | Off-cadence; use sparingly. |
| `ds-03` | 8 | **Related** (default). |
| `ds-04` | 12 | Use only when 8 is too tight and 16 is too loose. |
| `ds-05` | 16 | **Grouped** (default). |
| `ds-05b` | 20 | Off-cadence; rare. |
| `ds-06` | 24 | Comfortable section gap; prefer `ds-07` unless 32 is too much. |
| `ds-06b` | 28 | Off-cadence. |
| `ds-07` | 32 | **Section** (default). |
| `ds-08` | 40 | Big section. |
| `ds-09` | 48 | Hero spacing. |
| `ds-10` | 64 | Marketing. |
| `ds-11+` | 80 / 96 / 160 | Marketing only. |

## How to apply

```tsx
// Padding
// Card manages its own padding via the size prop — NEVER add p-* to a Card
// (it fights the gap model). Use size="sm" | "md" | "lg" instead.
<Card size="sm">…</Card>                    // tighter card
<div className="px-ds-07 py-ds-09">…</div>  // page region

// Gaps
<Stack gap="ds-03">…</Stack>                // related items
<Stack gap="ds-05">…</Stack>                // grouped items
<Stack gap="ds-07">…</Stack>                // sections

// Margins (rare — prefer gap)
<Text className="mt-ds-02">helper</Text>    // tight pair
```

## `<Stack>` over flex divs

Don't write `<div className="flex flex-col gap-ds-05">`. Use `<Stack>`:

```tsx
<Stack gap="ds-05">
  <Text variant="heading-md">Heading</Text>
  <Text variant="body-md">Body</Text>
  <Button>CTA</Button>
</Stack>

<Stack direction="row" gap="ds-03" align="center">
  <Icon icon={IconUser} />
  <Text>Username</Text>
</Stack>
```

`<Stack>` ships with `direction` (row | col, default col), `gap` (ds-* token), `align`, `justify`, `wrap`, `as` (polymorphic).

## Component sizing (separate from spacing)

Heights for controls use `ds-{size}` aliases:

| Token | Pixels | Component sizes |
|---|---|---|
| `ds-xs` | 24 | n/a (rare) |
| `ds-xs-plus` | 28 | Button/Input/Select **xs** |
| `ds-sm` | 32 | Button/Input/Select **sm** |
| `ds-md` | 40 | Button/Input/Select **md** (default) |
| `ds-lg` | 48 | Button/Input/Select **lg** |
| `ds-xl` | 56 | Button **xl** |

Apply via component `size` prop, not className.

## Page layout tokens

| Token | Use |
|---|---|
| `--spacing-page-x` | Horizontal page padding. Responsive: 16 → 24 → 40 px. |
| `--spacing-section-gap` | Vertical gap between major page sections. |
| `--spacing-card-gap` | Vertical gap between adjacent cards. |

Apply via:

```tsx
<main className="px-(--spacing-page-x) py-ds-09">
  <Stack gap="(--spacing-section-gap)">
    …
  </Stack>
</main>
```

## Rules

- **Default** to `ds-03 / ds-05 / ds-07`. Justify any deviation.
- **Never** use raw Tailwind spacing (`p-4`, `gap-6`). The kit's spacing is `ds-*` namespaced.
- **Never** mix arbitrary pixel values (`p-[14px]`). Pick a scale token.
- **Prefer `<Stack gap>` over `flex … gap-*`**. Cleaner semantics, polymorphic via `as`.
- Component sizes (xs / sm / md / lg / xl) come from the size prop, not from manual height utilities.
