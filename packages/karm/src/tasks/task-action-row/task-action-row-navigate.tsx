'use client'

import * as React from 'react'
import { IconChevronRight } from '@tabler/icons-react'
import { IconButton } from '@/ui/icon-button'

export interface TaskActionRowNavigateProps {
  href?: string
  onClick?: (e: React.MouseEvent) => void
}

const TaskActionRowNavigate = React.forwardRef<HTMLButtonElement, TaskActionRowNavigateProps>(
  ({ href, onClick }, ref) => {
    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onClick) {
          onClick(e)
        } else if (href) {
          window.location.href = href
        }
      },
      [href, onClick],
    )

    return (
      <IconButton
        ref={ref}
        icon={<IconChevronRight className="h-ico-sm w-ico-sm" />}
        size="sm"
        variant="ghost"
        aria-label="Open task in project board"
        onClick={handleClick}
        className="text-surface-fg-subtle hover:text-accent-11 hover:bg-accent-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150"
      />
    )
  },
)
TaskActionRowNavigate.displayName = 'TaskActionRowNavigate'

export { TaskActionRowNavigate }
