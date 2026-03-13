'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Badge } from '@/ui/badge'
import { Progress } from '@/ui/progress'

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  description?: string | null
  status: 'active' | 'completed' | 'paused'
  taskCount?: number
  completedTasks?: number
}

const statusColorMap = {
  active: 'success' as const,
  completed: 'info' as const,
  paused: 'warning' as const,
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      className,
      name,
      description,
      status,
      taskCount = 0,
      completedTasks = 0,
      ...props
    },
    ref,
  ) => {
    const progress =
      taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0

    return (
      <div
        ref={ref}
        className={cn(
          'group cursor-pointer rounded-ds-lg border border-surface-border bg-surface-1 p-ds-05b shadow-01 transition-shadow duration-200 hover:shadow-02',
          className,
        )}
        {...props}
      >
        <div className="mb-ds-04 flex items-start justify-between">
          <h3 className="font-display text-ds-base font-semibold text-surface-fg">
            {name}
          </h3>
          <Badge color={statusColorMap[status]} size="sm">
            {status}
          </Badge>
        </div>
        {description && (
          <p className="mb-ds-05 line-clamp-2 text-ds-md text-surface-fg-muted">
            {description}
          </p>
        )}
        <div className="space-y-ds-03">
          <div className="flex items-center justify-between text-ds-sm text-surface-fg-subtle">
            <span>
              {completedTasks} / {taskCount} tasks
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-ds-02b" aria-label="Project progress" />
        </div>
      </div>
    )
  },
)
ProjectCard.displayName = 'ProjectCard'

export { ProjectCard }
