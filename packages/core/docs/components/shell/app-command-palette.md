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

## Composability
- **Shell-level wrapper around composed/CommandPalette** — adds opinionated app conventions: user-aware admin command groups, search result integration, navigation dispatch.
- **Required setup:** Place inside `<CommandRegistryProvider>` (which owns the list of page items). Typically at app root next to TopBar.
- **Router integration via onNavigate:** Pass `(path) => router.push(path)` (Next.js) or equivalent for your framework. All page command clicks funnel through this callback.
- **Server-search integration:** Pass `onSearch` + `searchResults` + `onSearchResultSelect` for async search (API calls). `isSearching` drives a loading state. When these props are omitted, AppCommandPalette falls back to local filtering of registered pages.
- **Admin gating:** `isAdmin=true` surfaces `adminPages` from CommandRegistry. Takes precedence over `user.role`-based detection so you can force admin mode during testing / impersonation.
- **For scoped, non-app-wide palettes** (per-page command trees, custom popups), use composed/CommandPalette directly without the Registry layer.

## Gotchas
- Uses CommandRegistry context for page navigation items (see CommandRegistryProvider)
- `isAdmin` takes precedence over `user.role` for showing admin command groups
- Should be placed at the app root level, typically alongside TopBar

## Changes
### v0.3.0
- **Fixed** Added missing `'use client'` directive

### v0.1.0
- **Added** Initial release
