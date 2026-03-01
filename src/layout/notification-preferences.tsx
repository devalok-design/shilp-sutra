'use client'

/**
 * NotificationPreferences -- Manage notification rules per channel/project.
 *
 * Props-driven: accepts preferences array, projects, and callbacks.
 * No internal fetching -- the consumer is responsible for data loading.
 */
import { useState } from 'react'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Switch } from '../ui/switch'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Plus, Trash2, Bell, MessageSquare } from 'lucide-react'
import { cn } from '../ui/lib/utils'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface NotificationPreference {
  id: string
  userId?: string
  projectId: string | null
  channel: string
  minTier: string
  muted: boolean
}

export interface NotificationProject {
  id: string
  title: string
}

export interface NotificationPreferencesProps {
  /** Current preference rules */
  preferences?: NotificationPreference[]
  /** Available projects for scoping rules */
  projects?: NotificationProject[]
  /** Whether data is loading */
  isLoading?: boolean
  /** Called to add or update a preference */
  onSave?: (preference: {
    projectId: string | null
    channel: string
    minTier: string
    muted: boolean
  }) => void | Promise<void>
  /** Called to toggle mute on a preference */
  onToggleMute?: (preference: NotificationPreference) => void | Promise<void>
  /** Called to update the tier on a preference */
  onUpdateTier?: (
    preference: NotificationPreference,
    newTier: string,
  ) => void | Promise<void>
  /** Called to delete a preference */
  onDelete?: (preferenceId: string) => void | Promise<void>
  /** Additional className */
  className?: string
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const CHANNEL_LABELS: Record<string, { label: string; icon: typeof Bell }> = {
  IN_APP: { label: 'In-App', icon: Bell },
  GOOGLE_CHAT: { label: 'Google Chat', icon: MessageSquare },
}

const TIER_LABELS: Record<string, string> = {
  INFO: 'All (Info+)',
  IMPORTANT: 'Important+',
  CRITICAL: 'Critical only',
}

// -----------------------------------------------------------------------
// NotificationPreferences
// -----------------------------------------------------------------------

export default function NotificationPreferences({
  preferences = [],
  projects = [],
  isLoading = false,
  onSave,
  onToggleMute,
  onUpdateTier,
  onDelete,
  className,
}: NotificationPreferencesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newProjectId, setNewProjectId] = useState<string>('global')
  const [newChannel, setNewChannel] = useState<string>('IN_APP')
  const [newMinTier, setNewMinTier] = useState<string>('INFO')
  const [newMuted, setNewMuted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave({
        projectId: newProjectId === 'global' ? null : newProjectId,
        channel: newChannel,
        minTier: newMinTier,
        muted: newMuted,
      })
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('[Preferences] Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setNewProjectId('global')
    setNewChannel('IN_APP')
    setNewMinTier('INFO')
    setNewMuted(false)
  }

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'Global (all projects)'
    const project = projects.find((p) => p.id === projectId)
    return project?.title || 'Unknown project'
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold">
            Notification Preferences
          </CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-[var(--radius-full)] border-2 border-[var(--color-border-default)] border-t-[var(--color-interactive)]" />
            </div>
          ) : preferences.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--color-text-placeholder)]">
                No custom preferences set. All notifications are delivered by
                default.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {preferences.map((pref, i) => {
                const channelInfo =
                  CHANNEL_LABELS[pref.channel] || CHANNEL_LABELS.IN_APP
                const ChannelIcon = channelInfo.icon

                return (
                  <div
                    key={pref.id}
                    className={cn(
                      'flex items-center gap-4 py-3',
                      i < preferences.length - 1 &&
                        'border-b border-[var(--color-border-default)]',
                    )}
                  >
                    {/* Channel icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-layer-02)]">
                      <ChannelIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {channelInfo.label}
                      </p>
                      <p className="text-xs text-[var(--color-text-placeholder)]">
                        {getProjectName(pref.projectId)}
                      </p>
                    </div>

                    {/* Min tier */}
                    <Select
                      value={pref.minTier}
                      onValueChange={(v) => onUpdateTier?.(pref, v)}
                    >
                      <SelectTrigger className="h-7 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIER_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Muted toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--color-text-placeholder)]">
                        {pref.muted ? 'Muted' : 'Active'}
                      </span>
                      <Switch
                        checked={!pref.muted}
                        onCheckedChange={() => onToggleMute?.(pref)}
                      />
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete?.(pref.id)}
                      className="shrink-0 rounded p-1.5 text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-layer-02)] hover:text-[var(--color-danger)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Preference Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Notification Rule</DialogTitle>
            <DialogDescription>
              Customize how you receive notifications for a specific channel
              and project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Scope
              </label>
              <Select value={newProjectId} onValueChange={setNewProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">
                    Global (all projects)
                  </SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Channel
              </label>
              <Select value={newChannel} onValueChange={setNewChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_APP">In-App</SelectItem>
                  <SelectItem value="GOOGLE_CHAT">Google Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Minimum Tier
              </label>
              <Select value={newMinTier} onValueChange={setNewMinTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIER_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-[var(--color-text-primary)]">
                Mute this channel
              </label>
              <Switch checked={newMuted} onCheckedChange={setNewMuted} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddDialog(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

NotificationPreferences.displayName = 'NotificationPreferences'
