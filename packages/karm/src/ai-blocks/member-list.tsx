'use client'

import * as React from 'react'
import { Badge } from '@/ui/badge'
import { cn } from '@/ui/lib/utils'
import type { BlockComponentProps } from '@/ai/types'

// ============================================================
// Types
// ============================================================

export interface MemberListData {
  members: Array<{
    name: string
    role?: string
    status?: string
    avatar?: string
  }>
  title?: string
}

// ============================================================
// Component
// ============================================================

function MemberListBlock({ data }: BlockComponentProps<MemberListData>) {
  const { members, title } = data

  if (!members || members.length === 0) return null

  return (
    <div className="flex flex-col gap-ds-03">
      {title && (
        <p className="text-ds-sm font-medium text-surface-fg">{title}</p>
      )}
      <div className="flex flex-col divide-y divide-surface-border-strong rounded-ds-lg border border-surface-border-strong overflow-hidden">
        {members.map((member, index) => (
          <div
            key={`${member.name}-${index}`}
            className="flex items-center gap-ds-03 bg-surface-raised px-ds-04 py-ds-03"
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt=""
                className="h-ds-xs w-ds-xs rounded-ds-full object-cover"
              />
            ) : (
              <div className="flex h-ds-xs w-ds-xs items-center justify-center rounded-ds-full bg-accent-3 text-ds-xs font-medium text-accent-11">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-ds-sm text-surface-fg">{member.name}</span>
            {member.role && (
              <Badge variant="subtle" size="xs">{member.role}</Badge>
            )}
            {member.status && (
              <Badge variant="outline" size="xs">{member.status}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

MemberListBlock.displayName = 'MemberListBlock'

export { MemberListBlock }
