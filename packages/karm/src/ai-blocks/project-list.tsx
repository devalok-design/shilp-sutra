'use client'

import * as React from 'react'
import { Badge } from '@/ui/badge'
import { cn } from '@/ui/lib/utils'
import type { BlockComponentProps } from '@/ai/types'

// ============================================================
// Types
// ============================================================

export interface ProjectListData {
  projects: Array<{
    name: string
    status?: string
    memberCount?: number
    type?: string
  }>
  title?: string
}

// ============================================================
// Helpers
// ============================================================

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  'on track': 'success',
  'at risk': 'warning',
  paused: 'warning',
  overdue: 'error',
  completed: 'info',
  archived: 'default',
}

function getStatusColor(status?: string) {
  if (!status) return 'default' as const
  return STATUS_COLOR[status.toLowerCase()] ?? ('default' as const)
}

// ============================================================
// Component
// ============================================================

function ProjectListBlock({ data }: BlockComponentProps<ProjectListData>) {
  const { projects, title } = data

  if (!projects || projects.length === 0) return null

  return (
    <div className="flex flex-col gap-ds-03">
      {title && (
        <p className="text-ds-sm font-medium text-surface-fg">{title}</p>
      )}
      <div className="flex flex-col divide-y divide-surface-border-strong rounded-ds-lg border border-surface-border-strong overflow-hidden">
        {projects.map((project, index) => (
          <div
            key={`${project.name}-${index}`}
            className="flex items-center gap-ds-03 bg-surface-raised px-ds-04 py-ds-03"
          >
            <span className="flex-1 text-ds-sm font-medium text-surface-fg">
              {project.name}
            </span>
            {project.type && (
              <Badge variant="outline" size="xs">{project.type}</Badge>
            )}
            {project.memberCount != null && (
              <span className="text-ds-xs text-surface-fg-muted">
                {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
              </span>
            )}
            {project.status && (
              <Badge variant="subtle" color={getStatusColor(project.status)} size="xs">
                {project.status}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

ProjectListBlock.displayName = 'ProjectListBlock'

export { ProjectListBlock }
