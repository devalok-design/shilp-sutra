# Autocomplete

- Import: @devalok/shilp-sutra/ui/autocomplete
- Server-safe: No
- Category: ui

## Props
    options: AutocompleteOption[] (REQUIRED) — { value: string, label: string }
    value: AutocompleteOption | null
    onValueChange?: (option: AutocompleteOption) => void
    placeholder: string
    emptyText: string (default: "No options")
    disabled: boolean
    className: string
    id: string

## Defaults
    emptyText="No options"

## Example
```jsx
<Autocomplete
  options={[{ value: 'mumbai', label: 'Mumbai' }]}
  value={selectedCity}
  onValueChange={setSelectedCity}
  placeholder="Search cities..."
/>
```

## Composability
- **Autocomplete vs Combobox:** Autocomplete allows free-text input (users can type anything); Combobox enforces selection from the list. Pick by whether "off-list" values are valid (e.g. city field that accepts typos → Autocomplete; tag picker from a fixed vocabulary → Combobox).
- **Value shape is an object** (`{ value, label }`), not a plain string — this preserves label/value decoupling for display-vs-storage.
- **FormField:** Does NOT auto-consume FormField state. Set explicit error styling via className if needed.
- **Portal rendering:** Dropdown portals to body with z-popover (1400) — stacks above Dialog/Sheet.
- **Keyboard:** ArrowDown/Up navigate suggestions, Enter selects, Esc closes. Typeahead is the input's native filtering.

## Gotchas
- Allows free-text input (no forced selection) — use Combobox for forced selection
- value is an object { value, label }, NOT just a string

## Changes
### v0.18.0
- **Fixed** Added `useEffect` to sync query when external value changes

### v0.14.0
- **Changed** z-index promoted from `z-dropdown` (1000) to `z-popover` (1400) — fixes dropdown rendering behind Sheet/Dialog overlays

### v0.3.0
- **Changed** (BREAKING) `onChange` renamed to `onValueChange`

### v0.1.1
- **Fixed** `focus:ring` changed to `focus-visible:ring` — focus ring no longer shows on mouse click

### v0.1.0
- **Added** Initial release
