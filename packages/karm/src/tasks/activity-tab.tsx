'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { EmptyState } from '@/composed/empty-state'
import { IconActivity } from '@tabler/icons-react'
import {
  ActivityTimeline,
  ActivityEntry,
} from './tabs'

// ============================================================
// Types
// ============================================================

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorType: 'USER' | 'CLIENT' | 'SYSTEM' | 'AGENT'
  actorId: string | null
  action: string
  entityType: string
  entityId: string
  projectId: string | null
  metadata: Record<string, unknown> | null
}

interface ActivityTabProps extends React.HTMLAttributes<HTMLDivElement> {
  activities: AuditLogEntry[]
}

// ============================================================
// Activity Tab
// ============================================================

const ActivityTab = React.forwardRef<HTMLDivElement, ActivityTabProps>(
  function ActivityTab({ activities, className, ...props }, ref) {
  if (activities.length === 0) {
    return (
      <EmptyState
        ref={ref}
        icon={<IconActivity />}
        title="No activity yet"
        description="Actions on this task will appear here"
        compact
        className={className}
        {...props}
      />
    )
  }

  return (
    <ActivityTimeline ref={ref} className={cn(className)} {...props}>
      {activities.map((entry) => (
        <ActivityEntry key={entry.id} entry={entry} />
      ))}
    </ActivityTimeline>
  )
},
)

ActivityTab.displayName = 'ActivityTab'

export { ActivityTab }
export type { ActivityTabProps }
