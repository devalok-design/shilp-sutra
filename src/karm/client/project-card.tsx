import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { Badge } from '../../ui/badge'

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  description?: string | null
  status: 'active' | 'completed' | 'paused'
  taskCount?: number
  completedTasks?: number
}

const statusVariantMap = {
  active: 'green' as const,
  completed: 'blue' as const,
  paused: 'yellow' as const,
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
          'group cursor-pointer rounded-ds-lg border border-border-subtle bg-layer-01 p-ds-05b shadow-01 transition-shadow duration-moderate hover:shadow-02',
          className,
        )}
        {...props}
      >
        <div className="mb-ds-04 flex items-start justify-between">
          <h3 className="font-display text-ds-base font-semibold text-text-primary">
            {name}
          </h3>
          <Badge variant={statusVariantMap[status]} size="sm">
            {status}
          </Badge>
        </div>
        {description && (
          <p className="mb-ds-05 line-clamp-2 text-ds-md text-text-secondary">
            {description}
          </p>
        )}
        <div className="space-y-ds-03">
          <div className="flex items-center justify-between text-ds-sm text-text-helper">
            <span>
              {completedTasks} / {taskCount} tasks
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-ds-full bg-layer-03">
            <div
              className="h-full rounded-ds-full bg-interactive transition-[width] duration-slow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  },
)
ProjectCard.displayName = 'ProjectCard'

export { ProjectCard }
