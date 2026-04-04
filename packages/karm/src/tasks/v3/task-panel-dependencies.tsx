'use client'

import * as React from 'react'
import { Icon } from '@/ui/icon'
import { Badge } from '@/ui/badge'
import { IconArrowBarRight, IconArrowBarToRight } from '@tabler/icons-react'
import { TaskSection } from '../../composed/task-section'
import { useTaskPanel } from './task-panel-context'

export interface TaskPanelDependenciesProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskPanelDependencies(props: TaskPanelDependenciesProps) {
  const { task, mode } = useTaskPanel()

  if (mode === 'peek') return null

  const deps = task.dependencies
  if (!deps || (deps.blockedBy.length === 0 && deps.blocking.length === 0)) return null

  const totalCount = deps.blockedBy.length + deps.blocking.length

  return (
    <div className="px-ds-06 py-ds-03 border-b border-surface-border-subtle" {...props}>
      <TaskSection title="Dependencies" count={totalCount} defaultOpen={false}>
        <div className="px-ds-04 pb-ds-03 mt-ds-02">
          {deps.blockedBy.length > 0 && (
            <div className="mb-ds-03">
              <div className="flex items-center gap-ds-02 mb-ds-02">
                <Icon icon={IconArrowBarRight} size="xs" className="text-error-11" />
                <span className="text-ds-xs font-medium text-error-11">Blocked by</span>
              </div>
              <div className="flex flex-col gap-ds-01">
                {deps.blockedBy.map(dep => (
                  <div key={dep.id} className="flex items-center gap-ds-02 text-ds-xs rounded-ds-md px-ds-03 py-ds-03 hover:bg-surface-raised-hover transition-colors">
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
              <div className="flex flex-col gap-ds-01">
                {deps.blocking.map(dep => (
                  <div key={dep.id} className="flex items-center gap-ds-02 text-ds-xs rounded-ds-md px-ds-03 py-ds-03 hover:bg-surface-raised-hover transition-colors">
                    <span className="font-mono text-surface-fg-subtle">{dep.taskId}</span>
                    <span className="text-surface-fg-muted truncate">{dep.title}</span>
                    <Badge size="xs" variant="outline" className="ml-auto shrink-0">{dep.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TaskSection>
    </div>
  )
}

TaskPanelDependencies.displayName = 'TaskPanelDependencies'
