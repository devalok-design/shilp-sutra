# NotificationPreferences

- Import: @devalok/shilp-sutra/shell/notification-preferences
- Server-safe: No
- Category: shell

## Props
    preferences?: NotificationPreference[]
    projects?: NotificationProject[]
    isLoading?: boolean
    onSave?: (preference: { projectId, channel, minTier, muted }) => void | Promise<void>
    onToggleMute?: (preference: NotificationPreference) => void | Promise<void>
    onUpdateTier?: (preference: NotificationPreference, newTier: string) => void | Promise<void>
    onDelete?: (preferenceId: string) => void | Promise<void>
    className?: string

NotificationPreference: { id: string, userId?: string, projectId: string | null, channel: string, minTier: string, muted: boolean }
NotificationProject: { id: string, title: string }

## Defaults
    None

## Example
```jsx
<NotificationPreferences
  preferences={prefs}
  projects={projectList}
  onSave={handleSavePref}
  onToggleMute={handleToggleMute}
  onUpdateTier={handleUpdateTier}
  onDelete={handleDeletePref}
/>
```

## Composability
- **Full-page preferences UI** — typically rendered on a settings page (`/settings/notifications`). Not an overlay; not a dropdown.
- **Per-project preferences** — each preference is tied to a project + channel + tier. Users can mute/unmute and adjust tier (INFO / IMPORTANT / CRITICAL threshold) per project-channel combo.
- **All callback props support Promise<void>** — integrate with server actions / fetch calls without manual loading state management.
- **Pairs with NotificationCenter** — NotificationCenter shows notifications in real time (driven by these preferences); NotificationPreferences lets users tune the rules.
- **Data ownership is consumer-side** — you pass `preferences` + `projects`; NotificationPreferences renders. No built-in persistence or sync.

## Gotchas
- Manages per-project notification preferences (channel, tier, mute)
- All callback props support async (Promise<void>) for server-side operations
- Typically rendered on a settings/preferences page

## Changes
### v0.1.0
- **Added** Initial release
