# Combobox

- Import: @devalok/shilp-sutra/ui/combobox
- Server-safe: No
- Category: ui

## Props
    options: ComboboxOption[] (REQUIRED) — { value: string, label: string, description?: string, icon?: ReactNode, disabled?: boolean }
    size: "xs" | "sm" | "md" | "lg" (trigger height)
    DISCRIMINATED UNION — type depends on `multiple` flag:
    Single (default): multiple?: false, value?: string, onValueChange: (value: string) => void
    Multiple: multiple: true, value?: string[], onValueChange: (value: string[]) => void
    placeholder: string (default: "Select...")
    searchPlaceholder: string (default: "Search...")
    emptyMessage: string (default: "No results found")
    disabled: boolean
    className: string (wrapper div — the positioning container, NOT the trigger)
    triggerClassName: string (the actual Popover trigger button)
    accessibleLabel: string (custom aria-label for trigger, falls back to placeholder)
    maxVisible: number (default: 6, max dropdown items before scroll)
    renderOption: (option, selected) => ReactNode

## Defaults
    size="md", placeholder="Select...", searchPlaceholder="Search...", emptyMessage="No results found", maxVisible=6

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

## Composability
- **Combobox vs Autocomplete vs Select:** Combobox = typeahead search + forced selection (the user picks from filtered options). Autocomplete = typeahead + free text allowed. Select = no typeahead, click-to-open with fixed options. Pick by user behavior, not visual style.
- **Single vs multi mode** is a discriminated union — `multiple: true` changes the shape of value (`string[]`) and onValueChange. TypeScript enforces the pairing.
- **Multi-select pills:** Capped at 2 visible + "+N more" overflow regardless of `maxVisible`. Clicking the +N opens a popover list of all selected items (handled by the component).
- **className vs triggerClassName:** className lands on the wrapper (positioning); triggerClassName lands on the trigger button (styling the control). Know which you need.
- **Portal + z-popover (1400):** content stacks above Dialog/Sheet; works inside scrolling containers without clipping.
- **renderOption:** For complex option rendering (avatar + label + description), pass `renderOption: (option, selected) => <YourCustom />`. The selected state is a boolean flag.
- **FormField:** Does NOT auto-consume FormField state. Wrap in FormField for label + helper text, but style error manually.

## Gotchas
- Enforces selection from list (unlike Autocomplete which allows free text)
- In multi mode, selected items appear as pills with "+N more" overflow (capped at 2 visible pills regardless of `maxVisible`)
- `className` vs `triggerClassName`: `className` lands on the wrapper div (useful for width/positioning); `triggerClassName` lands on the actual Popover trigger button (useful for styling the control itself)
- Dropdown content is portalled to document.body — parent styles like `overflow: hidden` don't clip it, and container-scoped test queries won't find it

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
