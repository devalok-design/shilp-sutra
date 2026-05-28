'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

export function TabsHero() {
  return (
    <div className="max-w-xl">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-ds-04">
          <Text variant="body-sm" className="text-surface-fg-muted">
            Tabs in shilp-sutra ship with keyboard navigation, accessible roving focus, and
            controlled or uncontrolled modes. Wire the active state to your URL if the content
            deserves a deep link.
          </Text>
        </TabsContent>
        <TabsContent value="changelog" className="pt-ds-04">
          <Text variant="body-sm" className="text-surface-fg-muted">
            v{SHILP_SUTRA_MINOR} · BREAKING.json manifest, Next.js recipe polish, release skill-regen automation.
          </Text>
        </TabsContent>
        <TabsContent value="discussion" className="pt-ds-04">
          <Text variant="body-sm" className="text-surface-fg-muted">
            Open a GitHub issue at devalok-design/shilp-sutra or file feedback through the
            ai-agent-feedback label.
          </Text>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function TabsVariants() {
  return (
    <div className="flex flex-col gap-ds-06">
      <div className="p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
        <span className="text-ds-xs font-mono text-surface-fg-subtle">vertical orientation</span>
        <Tabs defaultValue="profile" orientation="vertical" className="mt-ds-03 flex gap-ds-04">
          <TabsList className="flex-col">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="profile">
              <Text variant="body-sm" className="text-surface-fg-muted">
                Name, email, locale. The small things people see first.
              </Text>
            </TabsContent>
            <TabsContent value="account">
              <Text variant="body-sm" className="text-surface-fg-muted">
                Password, 2FA, active sessions, danger zone.
              </Text>
            </TabsContent>
            <TabsContent value="notifications">
              <Text variant="body-sm" className="text-surface-fg-muted">
                Email cadence, push tokens, quiet hours.
              </Text>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
