# Autocomplete

- Import: @devalok/shilp-sutra/ui/autocomplete
- Server-safe: No
- Category: ui

## Props
    options: AutocompleteOption[] (REQUIRED) — { value: string, label: string }
    value?: AutocompleteOption | null (controlled)
    defaultValue?: AutocompleteOption | null (uncontrolled initial)
    onValueChange?: (option: AutocompleteOption) => void
    placeholder?: string
    emptyText?: string (default: "No options")
    disabled?: boolean
    size?: (forwarded to Input)
    state?: 'default' | 'error' | 'warning' | 'success' (forwarded to Input)
    isLoading?: boolean
    loadingText?: string (default: "Loading…")
    renderOption?: (option, query) => ReactNode
    className?: string
    id?: string

## Defaults
    emptyText="No options"
    loadingText="Loading…"

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
- **Composes `Input`** — the field is the DS `Input`, so it inherits `size`, error/`state` painting, read-only, hover, and FormField wiring. Autocomplete owns only the dropdown + behavior.
- **Autocomplete vs Combobox:** Autocomplete allows free-text input (users can type anything); Combobox enforces selection from the list.
- **Value shape is an object** (`{ value, label }`), not a plain string. Controlled via `value`, or uncontrolled via `defaultValue`.
- **FormField:** auto-consumes FormField state (via the composed Input) — inside a FormField, error border + `aria-invalid`/`aria-describedby`/`required` are wired automatically. Pass `state` to override.
- **Async / "type to search":** set `isLoading` to show a spinner (in the field + the listbox) with `loadingText`.
- **Matched-text highlight:** the query substring is bolded in each option by default; override the whole row with `renderOption`.
- **Portal rendering:** Dropdown portals to body with z-popover (1400) — stacks above Dialog/Sheet.
- **Keyboard:** ArrowDown/Up/Home/End navigate, Enter selects, Esc closes.

## Gotchas
- Allows free-text input (no forced selection) — use Combobox for forced selection
- value is an object { value, label }, NOT just a string
- Client-side filtering only (known list). For huge/remote lists, drive `options` yourself with `isLoading` — no built-in virtualization.

## Changes
### v0.53.0
- **Changed** Re-parented onto the DS `Input` primitive — inherits `size`, error/`state` painting, read-only, hover, and FormField auto-consumption (previously re-rolled its own `<input>` and read FormField error but never painted it).
- **Added** `defaultValue` (uncontrolled), `size`, `state`, `isLoading`/`loadingText` (async), `renderOption`, and matched-substring highlighting.
- **Fixed** Doc corrected — it DOES auto-consume FormField (via Input). Dropped a keystroke-frequency stagger animation + a dead effect.

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
