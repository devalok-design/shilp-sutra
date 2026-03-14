# NotificationPreferences

- Import: @devalok/shilp-sutra/shell/notification-preferences
- Server-safe: No
- Category: shell

## Props
    preferences: NotificationPreference[]
    projects: NotificationProject[]
    isLoading: boolean
    onSave: (preference: { projectId, channel, minTier, muted }) => void | Promise<void>
    onToggleMute: (preference: NotificationPreference) => void | Promise<void>
    onUpdateTier: (preference: NotificationPreference, newTier: string) => void | Promise<void>
    onDelete: (preferenceId: string) => void | Promise<void>
    className: string

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

## Gotchas
- Manages per-project notification preferences (channel, tier, mute)
- All callback props support async (Promise<void>) for server-side operations
- Typically rendered on a settings/preferences page

## Changes
### v0.1.0
- **Added** Initial release
