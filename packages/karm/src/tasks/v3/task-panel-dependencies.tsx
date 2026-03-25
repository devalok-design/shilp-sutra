'use client'

import * as React from 'react'
import { Icon } from '@/ui/icon'
import { Badge } from '@/ui/badge'
import { IconArrowBarRight, IconArrowBarToRight } from '@tabler/icons-react'
import { useTaskPanel } from './task-panel-context'

export interface TaskPanelDependenciesProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelDependencies(props: TaskPanelDependenciesProps) {
  const { task, mode } = useTaskPanel()

  if (mode === 'peek') return null

  const deps = task.dependencies
  if (!deps || (deps.blockedBy.length === 0 && deps.blocking.length === 0)) return null

  return (
    <div className="px-ds-06 py-ds-03 border-b border-surface-border-subtle" {...props}>
      {deps.blockedBy.length > 0 && (
        <div className="mb-ds-03">
          <div className="flex items-center gap-ds-02 mb-ds-02">
            <Icon icon={IconArrowBarRight} size="xs" className="text-error-11" />
            <span className="text-ds-xs font-medium text-error-11">Blocked by</span>
          </div>
          <div className="flex flex-col gap-ds-01 pl-ds-05">
            {deps.blockedBy.map(dep => (
              <div key={dep.id} className="flex items-center gap-ds-02 text-ds-xs">
                <span className="font-mono text-surface-fg-subtle">{dep.taskId}</span>
                <span className="text-surface-fg-muted truncate">{dep.title}</span>
                <Badge size="xs" variant="outline" className="ml-auto shrink-0">{dep.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {deps.blocking.length > 0 && (
        <div>
          <div className="flex items-center gap-ds-02 mb-ds-02">
            <Icon icon={IconArrowBarToRight} size="xs" className="text-warning-11" />
            <span className="text-ds-xs font-medium text-warning-11">Blocking</span>
          </div>
          <div className="flex flex-col gap-ds-01 pl-ds-05">
            {deps.blocking.map(dep => (
              <div key={dep.id} className="flex items-center gap-ds-02 text-ds-xs">
                <span className="font-mono text-surface-fg-subtle">{dep.taskId}</span>
                <span className="text-surface-fg-muted truncate">{dep.title}</span>
                <Badge size="xs" variant="outline" className="ml-auto shrink-0">{dep.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

TaskPanelDependencies.displayName = 'TaskPanelDependencies'
