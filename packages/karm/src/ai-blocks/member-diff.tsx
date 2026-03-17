'use client'

import * as React from 'react'
import { Badge } from '@/ui/badge'
import { cn } from '@/ui/lib/utils'
import type { BlockComponentProps } from '@/ai/types'

// ============================================================
// Types
// ============================================================

export interface MemberDiffData {
  members: Array<{
    name: string
    action: 'add' | 'remove' | 'unchanged'
    projects: string[]
    role?: string
  }>
  summary?: string
}

// ============================================================
// Component
// ============================================================

const ACTION_CONFIG = {
  add: { label: 'Adding', color: 'success' as const },
  remove: { label: 'Removing', color: 'error' as const },
  unchanged: { label: 'No change', color: 'default' as const },
} as const

function MemberDiffBlock({ data, confidence }: BlockComponentProps<MemberDiffData>) {
  const { members, summary } = data

  if (!members || members.length === 0) return null

  return (
    <div className="flex flex-col gap-ds-03">
      {members.map((member, index) => {
        const config = ACTION_CONFIG[member.action]
        return (
          <div
            key={`${member.name}-${index}`}
            className={cn(
              'flex flex-col gap-ds-02 rounded-ds-lg border px-ds-04 py-ds-03',
              member.action === 'add' && 'border-success-7 bg-success-2',
              member.action === 'remove' && 'border-error-7 bg-error-2',
              member.action === 'unchanged' && 'border-surface-border-strong bg-surface-raised',
            )}
          >
            <div className="flex items-center gap-ds-03">
              <span className="text-ds-sm font-medium text-surface-fg">
                {member.name}
              </span>
              {member.role && (
                <Badge variant="outline" size="xs">{member.role}</Badge>
              )}
              <Badge variant="subtle" color={config.color} size="xs">
                {config.label}
              </Badge>
            </div>
            {member.projects.length > 0 && (
              <div className="flex flex-wrap gap-ds-02">
                {member.projects.map((project) => (
                  <Badge key={project} variant="outline" color="default" size="xs">
                    {project}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {summary && (
        <p className="mt-ds-02 text-ds-xs text-surface-fg-muted">{summary}</p>
      )}
    </div>
  )
}

MemberDiffBlock.displayName = 'MemberDiffBlock'

export { MemberDiffBlock }
