# Typography

The kit ships an 11-step type scale (`text-ds-xs` through `text-ds-6xl`) with paired line-heights. **Use the scale, not arbitrary pixel values.**

## Philosophy

- One scale, applied with intent. A page should land on 3–4 text sizes max — heading + body + caption.
- Larger headings (3xl and up) use `clamp()` to scale fluidly between mobile and desktop. Smaller sizes are fixed.
- Default font is Inter Variable (sans). `Ranade` Variable is the accent display face for marketing-heavy treatments. SF Mono is the monospace.
- Letter spacing on body sizes is tuned per-size (`body-lg: -0.01em`, `body-md: 0`, `body-sm: +0.01em`, `body-xs: +0.02em`).

## Size scale

| Token | Size | Use |
|---|---|---|
| `text-ds-xs` | 10px | Footnotes, fine print, only when space is at premium. Never for primary content. |
| `text-ds-sm` | 12px | Captions, table labels, helper text, badges. |
| `text-ds-md` | 14px | Default UI body. All input fields. Default Button label. |
| `text-ds-base` | 16px | Body copy in marketing / docs. Mobile input minimum. |
| `text-ds-lg` | 18px | Lead paragraphs, large body. |
| `text-ds-xl` | 20px | Small heading (h4). |
| `text-ds-2xl` | 24px | Section heading (h3). |
| `text-ds-3xl` | clamp 24→32 | Page heading (h2). Fluid. |
| `text-ds-4xl` | clamp 28→36 | Large page heading (h1 in product). |
| `text-ds-5xl` | clamp 32→48 | Marketing hero. |
| `text-ds-6xl` | clamp 36→60 | Marketing display. |

Pair each size with a line-height: `leading-ds-{none|tight|snug|normal|relaxed|loose}`. Default for body: `leading-ds-normal` (1.4). For headings: `leading-ds-tight` (1.15) or `leading-ds-snug` (1.25).

## Composite typography utilities

Prefer these — they bundle size + leading + weight + tracking:

| Utility | Use |
|---|---|
| `text-heading-xl` | Page hero heading. |
| `text-heading-lg` | Section heading. |
| `text-heading-md` | Card / panel heading. |
| `text-heading-sm` | Sub-heading. |
| `text-body-lg` | Lead body. |
| `text-body-md` | Default body. |
| `text-body-sm` | Secondary body. |
| `text-body-xs` | Caption, footnote. |
| `text-code` | Inline / block code. |
| `text-label-plain-lg` / `-md` / `-sm` | Form labels (non-tab). |

These are what `<Text>` applies internally. When generating raw text, prefer using `<Text variant="heading-md">` (or similar) over manually composing utilities.

## Font families

| Token | Family | Use |
|---|---|---|
| `font-sans` | Inter | Default. UI body + headings. |
| `font-display` | Inter | Marketing headings (same family by default, separate token for theming). |
| `font-accent` | Ranade | Optional display accent. Only for marketing hero / brand moments. |
| `font-mono` | SF Mono / Fira Code | Code blocks, keyboard shortcuts, tabular data. |

## Weights

`font-weight-{light|regular|medium|semibold|bold}` = 300 / 400 / 500 / 600 / 700.

Apply via Tailwind's `font-light` / `font-medium` / `font-semibold` / `font-bold`. Default is regular (400). Headings default to `font-medium` (500). **Avoid bold (700)** for headings — the kit uses medium for refined feel. Use semibold for emphasized labels.

## Hierarchy patterns

**Card heading + body:**

```tsx
<Card className="p-ds-05">
  <Text variant="heading-md">Project</Text>
  <Text variant="body-md" className="text-fg-muted mt-ds-02">
    Sub-description with metadata.
  </Text>
</Card>
```

**Page header:**

```tsx
<Stack gap="ds-03" className="mb-ds-07">
  <Text variant="heading-xl">Dashboard</Text>
  <Text variant="body-lg" className="text-fg-muted">
    Overview of every active project.
  </Text>
</Stack>
```

**Form label + input:**

```tsx
<FormField>
  <Label>Email</Label>
  <Input type="email" placeholder="you@company.com" />
  <FormHelperText>We'll never share this.</FormHelperText>
</FormField>
```

`<Label>` already applies `text-label-plain-md`. Don't override with size utilities.

## Polymorphic `<Text>`

`<Text>` is polymorphic via `as` prop:

```tsx
<Text as="h1" variant="heading-xl">Page title</Text>
<Text as="p" variant="body-md">Body copy.</Text>
<Text as="label" htmlFor="email">Email</Text>
<Text as="a" href="/x">A link</Text>
```

The `as` prop widens accepted HTML attributes to the rendered element — `htmlFor` / `href` typecheck correctly.

## Rules

- **Never** hand-pick a pixel font-size (`text-[15px]`, `text-[18px]`). Use the scale.
- **Never** use `font-bold` on headings. Use `font-medium` or `font-semibold`.
- **Never** apply two size utilities at once (`text-ds-md text-ds-lg`). Use composite variants.
- **Never** use small text (`text-ds-xs`) for anything except captions and footnotes.
- **Prefer `<Text variant="...">` over raw `<p>` / `<span>`** when typographic semantics matter.
- Inputs must be at least `text-ds-md` (14px) on desktop and `16px` on mobile (the kit enforces the iOS-zoom-safe minimum automatically).
