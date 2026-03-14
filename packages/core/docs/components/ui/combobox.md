# Combobox

- Import: @devalok/shilp-sutra/ui/combobox
- Server-safe: No
- Category: ui

## Props
    options: ComboboxOption[] (REQUIRED) — { value: string, label: string, description?: string, icon?: ReactNode, disabled?: boolean }
    DISCRIMINATED UNION — type depends on `multiple` flag:
    Single (default): multiple?: false, value: string, onValueChange: (value: string) => void
    Multiple: multiple: true, value: string[], onValueChange: (value: string[]) => void
    placeholder: string (default: "Select...")
    searchPlaceholder: string (default: "Search...")
    emptyMessage: string (default: "No results found")
    disabled: boolean
    triggerClassName: string
    accessibleLabel: string (custom aria-label for trigger, falls back to placeholder)
    maxVisible: number (default: 6, max dropdown items before scroll)
    renderOption: (option, selected) => ReactNode

## Defaults
    placeholder="Select...", searchPlaceholder="Search...", emptyMessage="No results found", maxVisible=6

## Example
```jsx
<Combobox
  multiple
  options={tagOptions}
  value={selectedTags}
  onValueChange={setSelectedTags}
  placeholder="Select tags..."
/>
```

## Gotchas
- Enforces selection from list (unlike Autocomplete which allows free text)
- In multi mode, selected items appear as pills with "+N more" overflow

## Changes
### v0.18.0
- **Added** `accessibleLabel` prop — custom aria-label for trigger, falls back to placeholder

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown rendering behind Sheet/Dialog overlays

### v0.8.0
- **Changed** (BREAKING) Props now use discriminated union — `multiple: true` requires `value: string[]` and `onValueChange: (value: string[]) => void`

### v0.3.0
- **Changed** (BREAKING) `onChange` renamed to `onValueChange`
- **Changed** Now extends HTMLAttributes — accepts all standard HTML props

### v0.1.0
- **Added** Initial release
