# SearchInput

- Import: @devalok/shilp-sutra/ui/search-input
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg"
    loading: boolean (shows spinner instead of clear button)
    onClear: () => void (shows X button when value is non-empty)
    value: string
    onChange: ChangeEventHandler
    (plus standard input attributes except native "size")

## Defaults
    size: "md"

## Example
```jsx
<SearchInput
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery('')}
  placeholder="Search tasks..."
  loading={isSearching}
/>
```

## Composability
- Purpose-built variant of Input for search — renders the leading search icon and a contextual clear/loading trailing slot. For anything more custom, use Input with explicit `startSection` / `endSection`.
- **`onClear` makes the X button appear** only when `value` is non-empty. Pair them so users can reset.
- **`loading={true}` swaps the clear button for a spinner** with `aria-busy="true"` on the input — useful for debounced/async search.
- Doesn't auto-consume FormField (no `state` prop) — wrap a regular Input inside FormField for validated search fields.
- Keyboard: Escape auto-triggers `onClear` when wired (handled via `type="search"`'s native behavior on most browsers).

## Gotchas
- HTML native "size" attribute is excluded — use CSS width instead
- Clear button only appears when both `onClear` is provided AND `value` is non-empty

## Changes
### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency

### v0.2.0
- **Changed** `inputSize` prop renamed to `size` to match Input API

### v0.1.1
- **Fixed** Token compliance — replaced `pl-10 pr-9` and icon offsets with explicit arbitrary values

### v0.1.0
- **Added** Initial release
