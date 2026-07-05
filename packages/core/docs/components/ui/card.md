# Card

- Import: @devalok/shilp-sutra/ui/card
- Server-safe: No
- Category: ui

## Props
    variant: "default" | "elevated" | "outline" | "flat"
    color: "default" | "accent" | "error" | "success" | "warning" | "info" | "neutral" (border accent color)
    size: "sm" | "md" | "lg" (sets --card-spacing / --card-gap once; container + slots + CardAction + CardBleed all read the pair)
    orientation: "vertical" | "horizontal" (vertical is default; horizontal = row layout with media pane + <CardSection> column)
    interactive: boolean (enables hover shadow lift + pointer cursor)

### CardAction
    placement: "top-right" (default) | "top-left" | "bottom-right" | "bottom-left"
    tuck: boolean (pull a step toward the corner so an icon button's glyph aligns to the content edge)

### CardBleed
    side: "x" (default) | "top" | "bottom" | "y" | "all" (which card padding to negate; top/bottom/y for direct children — inherit the card radius; x/all for content inside a slot)

## Compound Components
    Card (root)         ← owns py + gap via --card-spacing / --card-gap
      CardBleed         ← escape hatch from the padding (full-bleed media, edge bands)
      CardAction        ← absolutely-positioned corner slot (badge, icon button, menu)
      CardHeader        ← px-(--card-spacing) only
        CardTitle
        CardDescription
      CardContent       ← px-(--card-spacing) only
      CardFooter        ← px-(--card-spacing) only
      CardSection       ← vertical column that re-establishes py + gap (horizontal cards)

## Defaults
    variant="default", color="default", size="md", orientation="vertical"

## Example
```jsx
<Card variant="elevated" interactive onClick={() => navigate(url)}>
  <CardHeader>
    <CardTitle>Project</CardTitle>
    <CardDescription>Last updated 2h ago</CardDescription>
  </CardHeader>
  <CardContent><p>Content here</p></CardContent>
</Card>
```

## Composability
- **Size is one CSS variable** — Card's `size` prop assigns `--card-spacing`/`--card-gap`; slots, CardAction corners, and CardBleed negations all read the same pair (no React context). Retune a card with a single override: `className="[--card-spacing:var(--spacing-ds-07)]"`. Never add `p-*` classes to Card or a slot.
- **Direct children are full-width** — only slots are inset, so a `<Separator />` or tinted band between slots is edge-to-edge for free. Text must live inside a slot; dev builds warn on bare text/`<p>` children.
- **Full-bleed via `<CardBleed>`** — negates the same variable the padding reads (Radix `Inset` / Polaris `Bleed` equivalent). `side="top"/"bottom"` for cover media as direct children; `side="x"` to escape a slot's inset. Never `x`/`all` on a direct child (overflows).
- **Horizontal cards** — `orientation="horizontal"` makes the root a padding-less row; wrap the text column in `<CardSection>` to restore the py/gap rhythm; the media pane owns the left edge (`rounded-l-surface overflow-hidden`).
- **Not a compound state machine** — Card, CardHeader, CardTitle, etc. are purely structural. No open/close state.
- **Corner slots via `CardAction`:** Pin a badge, icon button, or menu to any corner (`placement`), inset to match the card's content padding. `tuck` pulls an icon button so its glyph (not its padding box) aligns to the content edge. Replaces the removed `accent` decorative bar — composition, not a bespoke prop. Card is `relative` to anchor it.
- **`color` paints the border, never a stacked rail:** `color` tints the 1px edge (semantic accent/error/success/…). The DS never stacks a border + drop shadow or a colored rail on top (make-kit rule #6 — that reads as an AI tell).
- **Interactive cards:** Set `interactive={true}` + `onClick` for clickable cards (entire surface becomes the button). Add `aria-label` on the Card root when there's no visible heading. For complex multi-action cards, prefer standard Card with explicit buttons inside.
- **Composes:** content-card (alternative-to) — ContentCard (composed) is deprecated; compose `Card` + `CardHeader`/`CardContent`/`CardAction` directly instead.
- **Composes:** stat-card (specializes) — StatCard builds ON Card's surface model; the same applies to any metric/widget card you write — specialize Card, never re-roll its border/padding/shadow surface.

## Gotchas
- Use `interactive` prop for clickable cards — adds hover lift and pointer cursor
- Don't add padding classes to Card or its slots — override `--card-spacing` instead
- Bare text as a direct child of Card gets no horizontal inset (wrap it in CardContent); dev builds warn

## Changes
### v0.45.0
- **Changed** Size axis now assigns `--card-spacing`/`--card-gap` CSS variables instead of per-size literal classes; `CardSizeContext` and the per-size slot/corner lookup maps are gone. Rendered spacing is identical (sm 16/8, md 20/12, lg 24/16). Consumer `className` padding overrides on slots keep working via tw-merge; anything targeting the old literal classes (`px-ds-05b` etc.) in CSS selectors must switch to the variables.
- **Added** `<CardBleed side>` — full-bleed escape hatch that negates `--card-spacing` (cover images, edge bands, in-slot breakouts).
- **Added** `orientation="horizontal"` + `<CardSection>` — sanctioned horizontal media card layout.
- **Added** Dev-only warning when Card receives bare text / textual elements as direct children.

### v0.44.0
- **BREAKING** Removed `accent` / `accentColor` (the colored edge-bar / left-rail). Use `<CardAction>` for corner content, or `color` for a tinted border. The DS no longer ships a stacked rail (make-kit rule #6).
- **Added** `<CardAction>` compound — composable corner slot (4 placements, `tuck`).
- **Changed** Gap-model padding: the container owns vertical `py` + inter-slot `gap`; slots own only horizontal `px`. Adding/removing a slot can't unbalance the bottom edge. Card is now `relative`.

### v0.31.0
- **Added** `color` prop: semantic border color (accent, error, success, warning, info, neutral)
- **Added** `size` prop: `sm | md | lg` — padding propagated to sub-components via React context

### v0.18.0
- **Changed** Interactive card hover lift animation migrated to Framer Motion

### v0.4.2
- **Changed** (BREAKING) `variant="outlined"` renamed to `variant="outline"`
- **Added** `cardVariants` export

### v0.1.1
- **Fixed** `leading-none tracking-tight` changed to `leading-ds-none tracking-ds-tight` for token compliance

### v0.1.0
- **Added** Initial release
