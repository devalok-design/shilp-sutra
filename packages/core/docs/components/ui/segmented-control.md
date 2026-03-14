# SegmentedControl

- Import: @devalok/shilp-sutra/ui/segmented-control
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg" (REQUIRED) — also accepts legacy "small" | "medium" | "big"
    variant: "filled" | "tonal" (REQUIRED)
    options: SegmentedControlOption[] (REQUIRED)
    selectedId: string (REQUIRED)
    onSelect: (id: string) => void (REQUIRED)
    disabled: boolean

## Types
    SegmentedControlOption = { id: string, text: string, icon?: ComponentType<{ className?: string }> }
    SegmentedControlSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'big' (legacy aliases)
    SegmentedControlVariant = 'filled' | 'tonal'

## Example
```jsx
<SegmentedControl
  size="md"
  variant="tonal"
  options={[
    { id: 'list', text: 'List' },
    { id: 'grid', text: 'Grid' },
  ]}
  selectedId={viewMode}
  onSelect={setViewMode}
/>
```

## Gotchas
- Controlled only — selectedId + onSelect are required
- Uses data-driven API (options prop), not compound children

## Changes
### v0.18.0
- **Fixed** `bg-interactive` changed to `bg-accent-9`, `bg-field` changed to `bg-surface-3` (OKLCH migration)

### v0.4.2
- **Changed** (BREAKING) `color` prop renamed to `variant` (values `filled`/`tonal` unchanged)

### v0.1.1
- **Fixed** `tabIndex={0}` changed to `tabIndex={-1}` on tablist wrapper — fixes double-focus keyboard navigation bug
- **Fixed** Removed `!important` override — resolved specificity by restructuring base CVA classes

### v0.1.0
- **Added** Initial release
