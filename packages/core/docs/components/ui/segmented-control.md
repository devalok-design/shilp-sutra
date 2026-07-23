# SegmentedControl

- Import: @devalok/shilp-sutra/ui/segmented-control
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg"
    variant: "soft" | "solid"
    options: SegmentedControlOption[] (REQUIRED)
    value: string                          // controlled
    defaultValue: string                   // uncontrolled initial
    onValueChange: (id: string) => void
    disabled: boolean
    fullWidth: boolean
    selectedId: string                     // @deprecated — use value
    onSelect: (id: string) => void         // @deprecated — use onValueChange

## Types
    SegmentedControlOption = { id: string, text?: React.ReactNode, icon?: IconInput, ariaLabel?: string }
    SegmentedControlSize = 'sm' | 'md' | 'lg'
    SegmentedControlVariant = 'soft' | 'solid'

## Defaults
    size: "md"
    variant: "soft"
    fullWidth: false

## Example
```jsx
<SegmentedControl
  size="md"
  variant="soft"
  options={[
    { id: 'list', text: 'List' },
    { id: 'grid', text: 'Grid' },
  ]}
  value={viewMode}
  onValueChange={setViewMode}
/>
```

## Composability
- **Data-driven, not compound** — unlike Tabs/ToggleGroup, SegmentedControl takes an `options` array rather than children. This makes it easier to render from a list but harder to customize per-option styling; use Tabs if you need compound children.
- **When to use vs Tabs:** SegmentedControl is for mutually-exclusive VIEW-MODE toggles (List/Grid/Kanban) — short labels, no associated content panel. Tabs is for content switching where each tab has a corresponding TabsContent. SegmentedControl renders `role="radiogroup"` with `role="radio"` segments (a panel-less single-select); Tabs renders `role="tablist"`.
- **Option icons** auto-size based on the `size` prop — don't set explicit icon sizes.
- **`fullWidth`** switches segments from content-hug (default) to equal-fill: each segment takes an equal share of the container (a 2-item toggle splits 50/50, a 3-item switcher gives each a third). Use for view switchers and toolbar toggles that should fill their column; leave off for compact inline toolbars.
- **Visual model:** a rounded-rect track (not a full pill) — a translucent recessed groove with a single soft-shadowed sliding thumb. The track has no border/inset shadow; the thumb carries the only edge. Elevation inverts in dark so the groove stays visible.
- **Controlled or uncontrolled** — pass `value` + `onValueChange` to control it, or `defaultValue` (optional; falls back to the first option) to let it own state. Matches the Tabs/ToggleGroup vocabulary. `selectedId`/`onSelect` are deprecated aliases that still work.
- **Option labels accept `ReactNode`** — a segment can hold a count badge or custom node, not just a string. `text` is optional: omit it for an **icon-only** segment and set `ariaLabel` so the segment still has an accessible name.
- **Touch targets** — each segment has a 44px minimum hit area (via `touch-target`) even though the visual height stays dense.
- **RTL** — Arrow-key navigation tracks reading order: in a right-to-left context `ArrowLeft` moves to the next option and `ArrowRight` to the previous (detected from the nearest `dir` attribute).
- Built from scratch (no Radix primitive) — standard HTML buttons with `role="radio"` + `aria-checked` and roving tabindex.

## Gotchas
- Controlled (`value`) or uncontrolled (`defaultValue`) — `selectedId`/`onSelect` are deprecated aliases
- Uses data-driven API (options prop), not compound children
- Use Tabs (not SegmentedControl) when you need associated content panels per option

## Changes
### v0.52.0
- **Changed** Visual rebuild — rounded-rect track (was full pill), translucent recessed track with no border/inset, single ring-less soft-shadow thumb. Dark-mode elevation inverts so the groove stays visible. New tokens: `--color-segment-track`, `--color-segment-thumb`, `--shadow-segment`.
- **Added** `value` / `defaultValue` / `onValueChange` — canonical controlled+uncontrolled API (aligns with Tabs/ToggleGroup).
- **Added** `fullWidth` prop — segments split the container equally.
- **Added** 44px minimum touch targets (`touch-target`), keeping dense visual height.
- **Added** Crisp bounce-free thumb motion (reduced-motion aware) + `motion-safe` press-scale feedback.
- **Changed** Option `text` widened from `string` to `ReactNode`, and made optional (omit for icon-only segments).
- **Added** `ariaLabel` per option for icon-only segments; RTL-aware Arrow-key navigation.
- **Deprecated** `variant="default"` → `variant="soft"`; `selectedId` → `value`; `onSelect` → `onValueChange`. All old names still accepted as aliases; update call sites.

### v0.38.0
- **Removed** (BREAKING) deprecated `variant="accent"` alias. Use `variant="solid"`.

### v0.18.0
- **Fixed** `bg-interactive` changed to `bg-accent-9`, `bg-field` changed to `bg-surface-3` (OKLCH migration)

### v0.4.2
- **Changed** (BREAKING) `color` prop renamed to `variant`

### v0.1.1
- **Fixed** `tabIndex={0}` changed to `tabIndex={-1}` on tablist wrapper — fixes double-focus keyboard navigation bug
- **Fixed** Removed `!important` override — resolved specificity by restructuring base CVA classes

### v0.1.0
- **Added** Initial release
