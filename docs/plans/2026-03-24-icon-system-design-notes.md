# Icon System — Design Notes

**Status:** Research notes for a future implementation session.
**Context:** Discovered during Button v2 work that we have no icon guidance, wrapper, or composable system.

## What Tabler Gives Us

Every `@tabler/icons-react` icon accepts:
- `size` (default 24) — width + height in px
- `color` (default `currentColor`) — stroke or fill color
- `stroke` (default 2) — stroke-width for outline icons (1–3 range practical)
- `title` — accessible `<title>` inside SVG
- `className` — for Tailwind overrides
- `...rest` — any SVG attribute

Two types: **outline** (stroke-based, our standard) and **filled** (solid fill, `IconXxxFilled`).

## What We Don't Have

1. **No `<Icon>` wrapper component** — consumers pass raw Tabler icons everywhere. No standardized sizing, no color inheritance guarantees, no a11y defaults.

2. **No stroke-weight guidance** — smaller icons look heavier because stroke-width stays at 2. We should recommend:
   - xs (14px): stroke 1.5
   - sm (16px): stroke 1.5
   - md (18px): stroke 1.75
   - lg (20px): stroke 2

3. **No icon color tokens** — icons just inherit `currentColor`. This works but there's no way to say "icon should be muted" without wrapping in a span with `text-surface-fg-muted`.

4. **No filled vs outline guidance** — when to use filled (emphasis, active state) vs outline (default, passive).

5. **No icon animation primitives** — spinning (loading), pulsing (notification), rotating (expand/collapse).

6. **No icon-in-context patterns** — how to pair icons with text (inline, leading, trailing), proper alignment, proper spacing.

## Proposed: `<Icon>` Wrapper Component

```tsx
<Icon
  icon={IconPlus}           // Tabler icon component
  size="md"                 // maps to DS size tokens: xs=14, sm=16, md=18, lg=20
  weight="light"            // stroke: light=1.5, regular=1.75, bold=2
  color="muted"             // color: default=currentColor, muted=surface-fg-muted, subtle=surface-fg-subtle
  filled                    // auto-switch to IconPlusFilled if available
  label="Add item"          // sets title + aria-label
/>
```

Benefits:
- Single import, no size/stroke guessing
- Consistent sizing across the DS
- Accessibility (title/label) by default
- Color tokens for common patterns
- Type-safe — only valid sizes/weights

## Proposed: Icon Stories

- **Size Scale** — xs through lg with stroke recommendations
- **Weight Comparison** — light/regular/bold at each size
- **Color Tokens** — default/muted/subtle/accent/error/success/warning
- **Outline vs Filled** — when to use each, side by side
- **In Context** — icon in button, input, badge, nav, card, table cell
- **Animation** — spin, pulse, rotate primitives
- **Accessibility** — with/without labels, screen reader behavior

## Priority

Medium — the current approach (raw Tabler icons with manual props) works. The wrapper would add consistency and reduce boilerplate but isn't blocking anything. Should be done before the next major component pass.
