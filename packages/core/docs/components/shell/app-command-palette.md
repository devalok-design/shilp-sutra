# AppCommandPalette

- Import: @devalok/shilp-sutra/shell/app-command-palette
- Server-safe: No
- Category: shell

## Props
    user?: AppCommandPaletteUser | null — { name, role? } (optional)
    isAdmin?: boolean (shows admin command groups regardless of user.role; takes precedence over role-based detection)
    extraGroups?: CommandGroup[]
    onNavigate?: (path: string) => void
    onSearch?: (query: string) => void
    searchResults?: SearchResult[]
    isSearching?: boolean (shows loading state while search is in progress)
    onSearchResultSelect?: (result: SearchResult) => void

SearchResult: { id: string, title: string, snippet?: string, entityType: string, projectId?: string | null, metadata?: Record<string, unknown> }
AppCommandPaletteUser: { name: string, role?: string }

## Defaults
    None

## Example
```jsx
<AppCommandPalette
  user={{ name: 'John', role: 'admin' }}
  isAdmin={true}
  onNavigate={(path) => router.push(path)}
  searchResults={results}
  onSearchResultSelect={(r) => router.push(`/${r.entityType}/${r.id}`)}
/>
```

## Gotchas
- Uses CommandRegistry context for page navigation items (see CommandRegistryProvider)
- `isAdmin` takes precedence over `user.role` for showing admin command groups
- Should be placed at the app root level, typically alongside TopBar

## Changes
### v0.3.0
- **Fixed** Added missing `'use client'` directive

### v0.1.0
- **Added** Initial release
