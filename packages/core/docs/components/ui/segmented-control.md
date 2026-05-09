# SegmentedControl

- Import: @devalok/shilp-sutra/ui/segmented-control
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg"
    variant: "default" | "solid"
    options: SegmentedControlOption[] (REQUIRED)
    selectedId: string (REQUIRED)
    onSelect: (id: string) => void (REQUIRED)
    disabled: boolean

## Types
    SegmentedControlOption = { id: string, text: string, icon?: ComponentType<{ className?: string }> }
    SegmentedControlSize = 'sm' | 'md' | 'lg'
    SegmentedControlVariant = 'default' | 'solid'

## Defaults
    size: "md"
    variant: "default"

## Example
```jsx
<SegmentedControl
  size="md"
  variant="default"
  options={[
    { id: 'list', text: 'List' },
    { id: 'grid', text: 'Grid' },
  ]}
  selectedId={viewMode}
  onSelect={setViewMode}
/>
```

## Composability
- **Data-driven, not compound** — unlike Tabs/ToggleGroup, SegmentedControl takes an `options` array rather than children. This makes it easier to render from a list but harder to customize per-option styling; use Tabs if you need compound children.
- **When to use vs Tabs:** SegmentedControl is for mutually-exclusive VIEW-MODE toggles (List/Grid/Kanban) — short labels, no associated content panel. Tabs is for content switching where each tab has a corresponding TabsContent. Both render `role="tablist"`.
- **Option icons** auto-size based on the `size` prop — don't set explicit icon sizes.
- Fully controlled — there's no `defaultSelectedId`. Manage state in parent.
- Built from scratch (no Radix primitive) — standard HTML buttons with `aria-selected` and roving tabindex.

## Gotchas
- Controlled only — selectedId + onSelect are required
- Uses data-driven API (options prop), not compound children
- Use Tabs (not SegmentedControl) when you need associated content panels per option

## Changes
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
