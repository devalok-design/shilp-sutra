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

## Composability
- **Context provider for AppCommandPalette.** Registers page-level navigation items that the command palette surfaces as commands.
- **Place at app root** — wrap both AppCommandPalette and the rest of the app inside `<CommandRegistryProvider>`. Positioning matters: any AppCommandPalette outside the provider gets `useCommandRegistry() === null` and falls back to minimal functionality.
- **Separation of pages vs adminPages** — the palette filters based on user role / `isAdmin` flag. Keep admin-only routes in the adminPages array to avoid leaking them to regular users.
- **useCommandRegistry()** is the consumer hook — returns the full registry or null. Use in your own command-aware components (e.g. a Spotlight-style keyboard-search embed elsewhere in the app).
- **Works with LinkProvider** — CommandPaletteItems navigate via `onNavigate` prop on AppCommandPalette, which routes to your framework's Link component.

## Gotchas
- Provides the command registry context consumed by AppCommandPalette
- Place at app root, wrapping both AppCommandPalette and the rest of the app
- `useCommandRegistry()` returns `null` if no provider is found — handle this case

## Changes
### v0.1.0
- **Added** Initial release
