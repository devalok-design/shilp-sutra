# CommandPalette

- Import: @devalok/shilp-sutra/composed/command-palette
- Server-safe: No
- Category: composed

## Props
    groups: CommandGroup[] — { label: string, items: CommandItem[] }
    placeholder: string (default: "Search or jump to...")
    onSearch: (query: string) => void
    emptyMessage: string (default: "No results found.")

CommandItem shape: { id, label, description?, icon?, shortcut?, onSelect: () => void }

## Defaults
    placeholder="Search or jump to...", emptyMessage="No results found."

## Example
```jsx
<CommandPalette
  groups={[{
    label: 'Navigation',
    items: [{ id: 'dash', label: 'Dashboard', onSelect: () => navigate('/') }],
  }]}
/>
```

## Gotchas
- Opens with Ctrl+K / Cmd+K by default
- Items animate in with staggered slide-up (30ms delay cascade); groups fade in; active item icon/shortcut highlight in interactive color (v0.15.0)

## Changes
### v0.15.0
- **Added** Staggered slide-up entrance animations for items, fade-in for groups/empty state/footer, scale-in for search icon, active item icon/shortcut color transitions

### v0.8.0
- **Added** Full ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`)

### v0.1.0
- **Added** Initial release
