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
import type { Member } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface TaskMemberPickerProps {
  members: Member[]
  value: string | null
  onChange: (memberId: string | null) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

// ============================================================
// TaskMemberPicker
// ============================================================

const TaskMemberPicker = React.forwardRef<HTMLButtonElement, TaskMemberPickerProps>(
  function TaskMemberPicker(
    { members, value, onChange, placeholder = 'No owner', readOnly, className },
    ref,
  ) {
    const selectedMember = members.find((m) => m.id === value) ?? null

    const pickerMembers = React.useMemo(
      () => members.map((m) => ({ id: m.id, name: m.name, avatar: m.image ?? undefined })),
      [members],
    )

    const handleSelect = React.useCallback(
      (memberId: string) => {
        onChange(memberId === value ? null : memberId)
      },
      [onChange, value],
    )

    if (readOnly) {
      return (
        <div className={cn('inline-flex items-center gap-ds-03 px-ds-03 py-ds-02', className)}>
          {selectedMember ? (
            <>
              <Avatar className="h-ico-md w-ico-md">
                {selectedMember.image && (
                  <AvatarImage src={selectedMember.image} alt={selectedMember.name} />
                )}
                <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
                  {getInitials(selectedMember.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ds-md text-surface-fg">{selectedMember.name}</span>
            </>
          ) : (
            <span className="text-ds-md text-surface-fg-subtle">{placeholder}</span>
          )}
        </div>
      )
    }

    return (
      <MemberPicker
        members={pickerMembers}
        selectedIds={value ? [value] : []}
        onSelect={handleSelect}
      >
        <button
          ref={ref}
          type="button"
          className={cn(
            'inline-flex items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02 transition-colors hover:bg-surface-3',
            className,
          )}
        >
          {selectedMember ? (
            <>
              <Avatar className="h-ico-md w-ico-md">
                {selectedMember.image && (
                  <AvatarImage src={selectedMember.image} alt={selectedMember.name} />
                )}
                <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
                  {getInitials(selectedMember.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ds-md text-surface-fg">{selectedMember.name}</span>
            </>
          ) : (
            <span className="text-ds-md text-surface-fg-subtle">{placeholder}</span>
          )}
        </button>
      </MemberPicker>
    )
  },
)

TaskMemberPicker.displayName = 'TaskMemberPicker'

export { TaskMemberPicker }
