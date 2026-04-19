'use client'

import * as React from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../ui/avatar'
import { getInitials } from './lib/string-utils'
import { type MultiSelectItem,MultiSelectPopover } from './multi-select-popover'

// ============================================================
// Types — backward-compatible with original MemberPicker
// ============================================================

export interface MemberPickerMember {
  id: string
  name: string
  avatar?: string
}

export interface MemberPickerProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  members: MemberPickerMember[]
  selectedIds: string[]
  onSelect: (memberId: string) => void
  multiple?: boolean
  placeholder?: string
  children: React.ReactNode
}

// ============================================================
// MemberPicker — thin wrapper around MultiSelectPopover
// ============================================================

const MemberPicker = React.forwardRef<HTMLDivElement, MemberPickerProps>(
  (
    {
      members,
      selectedIds,
      onSelect,
      children,
      multiple = false,
      placeholder = 'Search members...',
      ...props
    },
    ref,
  ) => {
    const items: MultiSelectItem[] = React.useMemo(
      () => members.map((m) => ({ id: m.id, label: m.name, image: m.avatar })),
      [members],
    )

    function handleChange(ids: string[]) {
      // Find the toggled id
      const added = ids.find((id) => !selectedIds.includes(id))
      const removed = selectedIds.find((id) => !ids.includes(id))
      const toggled = added ?? removed
      if (toggled) onSelect(toggled)
    }

    return (
      <MultiSelectPopover
        ref={ref}
        items={items}
        value={selectedIds}
        onValueChange={handleChange}
        searchPlaceholder={placeholder}
        maxSelections={multiple ? undefined : 1}
        renderItem={(item) => (
          <div className="flex items-center gap-ds-03">
            <Avatar className="h-ico-md w-ico-md">
              {item.image && <AvatarImage src={item.image} alt={item.label} />}
              <AvatarFallback className="bg-surface-raised-hover text-ds-xs font-semibold text-surface-fg">
                {getInitials(item.label)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-ds-md font-body text-surface-fg">
              {item.label}
            </span>
          </div>
        )}
        {...props}
      >
        {children}
      </MultiSelectPopover>
    )
  },
)

MemberPicker.displayName = 'MemberPicker'

export { MemberPicker }
