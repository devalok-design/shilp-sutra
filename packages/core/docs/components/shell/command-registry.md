# CommandRegistry

- Import: @devalok/shilp-sutra/shell/command-registry
- Server-safe: No
- Category: shell

Exports: CommandRegistryProvider, useCommandRegistry

## Props

### CommandRegistryProvider
    children: ReactNode
    registry: CommandRegistry (REQUIRED)

CommandRegistry: { pages: CommandPageItem[], adminPages: CommandPageItem[] }
CommandPageItem: { id: string, label: string, icon: ReactNode, path: string, keywords?: string[] }

### useCommandRegistry hook
    Returns: CommandRegistry | null

## Defaults
    None

## Example
```jsx
<CommandRegistryProvider
  registry={{
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: <IconHome />, path: '/dashboard' },
      { id: 'projects', label: 'Projects', icon: <IconFolder />, path: '/projects' },
    ],
    adminPages: [
      { id: 'users', label: 'Manage Users', icon: <IconUsers />, path: '/admin/users' },
    ],
  }}
>
  <App />
</CommandRegistryProvider>
```

## Gotchas
- Provides the command registry context consumed by AppCommandPalette
- Place at app root, wrapping both AppCommandPalette and the rest of the app
- `useCommandRegistry()` returns `null` if no provider is found — handle this case

## Changes
### v0.1.0
- **Added** Initial release
