# karmCommandRegistry

- Import: @devalok/shilp-sutra-karm (top-level export)
- Server-safe: No
- Category: shell

Pre-configured command registry for the Karm app's AppCommandPalette. Contains all page routes and admin routes.

Exports: karmCommandRegistry

## Type
```ts
const karmCommandRegistry: CommandRegistry
```

Where `CommandRegistry` is `{ pages: CommandPageItem[], adminPages: CommandPageItem[] }` from `@devalok/shilp-sutra/shell/command-registry`.

## Pages
| id | label | path | keywords |
|----|-------|------|----------|
| nav-dashboard | Dashboard | / | home |
| nav-attendance | Attendance | /attendance | clock, time |
| nav-breaks | Breaks | /breaks | leave, vacation |
| nav-projects | Projects | /projects | board, kanban |
| nav-my-tasks | My Tasks | /my-tasks | todo |
| nav-devsabha | Devsabha | /devsabha | standup, meeting |
| nav-adjustments | Adjustments | /adjustments | corrections |
| nav-profile | Profile | /profile | account, settings |

## Admin Pages
| id | label | path | keywords |
|----|-------|------|----------|
| nav-admin-dashboard | Admin Dashboard | /admin | admin, overview |
| nav-admin-breaks | Manage Breaks | /admin/breaks | admin, leave |
| nav-admin-attendance | Manage Attendance | /admin/attendance | admin, time |
| nav-admin-lokwasi | Lokwasi | /admin/lokwasi | admin, onboarding |
| nav-admin-onboarding | Onboarding | /admin/onboarding | admin, new hire |
| nav-admin-config | System Config | /admin/system-config | admin, settings, configuration |

## Example
```jsx
import { CommandRegistryProvider } from '@devalok/shilp-sutra/shell/command-registry'
import { karmCommandRegistry } from '@devalok/shilp-sutra-karm'

<CommandRegistryProvider registry={karmCommandRegistry}>
  <AppCommandPalette
    user={user}
    onNavigate={(path) => router.push(path)}
  />
</CommandRegistryProvider>
```

## Gotchas
- Each entry includes a Tabler icon (e.g. `IconLayoutDashboard`, `IconUmbrella`) — these are bundled, not tree-shaken
- The registry is a plain object, not a React component — pass it to `CommandRegistryProvider`
- Admin pages are only shown in the command palette when the user has admin role (handled by AppCommandPalette)
- To add new routes, extend the registry object in your app rather than modifying this export

## Changes
### v0.9.0
- **Added** Initial release with 8 pages and 6 admin pages
