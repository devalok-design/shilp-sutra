import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import { Badge } from '../../ui/badge'

interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
          'group cursor-pointer rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] p-5 shadow-[var(--shadow-01)] transition-shadow duration-200 hover:shadow-[var(--shadow-02)]',
          className,
        )}
        {...props}
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-display text-base font-semibold text-[var(--color-text-primary)]">
            {name}
          </h3>
          <Badge variant={statusVariantMap[status]} size="sm">
            {status}
          </Badge>
        </div>
        {description && (
          <p className="mb-4 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-helper)]">
            <span>
              {completedTasks} / {taskCount} tasks
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-layer-03)]">
            <div
              className="h-full rounded-[var(--radius-full)] bg-[var(--color-interactive)] transition-[width] duration-300"
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
