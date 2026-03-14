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

## Gotchas
- HTML native "size" attribute is excluded — use CSS width instead

## Changes
### v0.15.0
- **Changed** `lg` size font changed from `text-ds-lg` (18px) to `text-ds-md` (14px) — all input sizes now use 14px for consistency

### v0.2.0
- **Changed** `inputSize` prop renamed to `size` to match Input API

### v0.1.1
- **Fixed** Token compliance — replaced `pl-10 pr-9` and icon offsets with explicit arbitrary values

### v0.1.0
- **Added** Initial release
