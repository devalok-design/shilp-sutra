'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/ui/avatar'
import { MemberPicker } from '@/composed/member-picker'
import { getInitials } from '@/composed/lib/string-utils'
import { IconPlus, IconX } from '@tabler/icons-react'
import type { Member } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface TaskAssigneePickerProps {
  members: Member[]
  value: Member[]
  onAssign: (userId: string) => void
  onUnassign: (userId: string) => void
  readOnly?: boolean
  className?: string
}

// ============================================================
// TaskAssigneePicker
// ============================================================

const TaskAssigneePicker = React.forwardRef<HTMLDivElement, TaskAssigneePickerProps>(
  function TaskAssigneePicker(
    { members, value, onAssign, onUnassign, readOnly, className },
    ref,
  ) {
    const assigneeIds = value.map((m) => m.id)

    const pickerMembers = React.useMemo(
      () => members.map((m) => ({ id: m.id, name: m.name, avatar: m.image ?? undefined })),
      [members],
    )

    const handleToggle = React.useCallback(
      (userId: string) => {
        if (assigneeIds.includes(userId)) {
          onUnassign(userId)
        } else {
          onAssign(userId)
        }
      },
      [assigneeIds, onAssign, onUnassign],
    )

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-ds-02b', className)}>
        {value.map((member) => (
          <div
            key={member.id}
            className="inline-flex items-center gap-ds-02 rounded-ds-full bg-surface-2 py-ds-01 pl-ds-01 pr-ds-03"
          >
            <Avatar className="h-ico-sm w-ico-sm">
              {member.image && (
                <AvatarImage src={member.image} alt={member.name} />
              )}
              <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-ds-sm text-surface-fg-muted">
              {member.name.split(' ')[0]}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onUnassign(member.id)}
                className="ml-ds-01 rounded-ds-full p-ds-01 transition-colors hover:bg-surface-3"
                aria-label={`Remove ${member.name}`}
              >
                <IconX className="h-ds-03 w-ds-03 text-surface-fg-subtle" />
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <MemberPicker
            members={pickerMembers}
            selectedIds={assigneeIds}
            onSelect={handleToggle}
            multiple
          >
            <button
              type="button"
              className="inline-flex h-ico-md w-ico-md items-center justify-center rounded-ds-full border border-dashed border-surface-border transition-colors hover:bg-surface-3 hover:border-surface-border"
              aria-label="Add assignee"
            >
              <IconPlus className="h-3 w-3 text-surface-fg-subtle" />
            </button>
          </MemberPicker>
        )}
        {readOnly && value.length === 0 && (
          <span className="text-ds-md text-surface-fg-subtle">None</span>
        )}
      </div>
    )
  },
)

TaskAssigneePicker.displayName = 'TaskAssigneePicker'

export { TaskAssigneePicker }
