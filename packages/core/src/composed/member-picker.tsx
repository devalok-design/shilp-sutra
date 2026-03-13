'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui/avatar'
import { IconCheck, IconSearch } from '@tabler/icons-react'
import { getInitials } from './lib/string-utils'

// ============================================================
// Types
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
// MemberPicker
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
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')

    const filtered = members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    )

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          ref={ref}
          {...props}
          className={cn("w-[220px] border-surface-border-strong bg-surface-1 p-0", className)}
          align="start"
          sideOffset={4}
        >
          <div className="flex items-center gap-ds-03 border-b border-surface-border-strong px-ds-04 py-ds-03">
            <IconSearch className="h-ico-sm w-ico-sm shrink-0 text-surface-fg-subtle" stroke={1.5} />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search members"
              className="w-full bg-transparent text-ds-md font-body text-surface-fg placeholder:text-surface-fg-subtle outline-none"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto py-ds-02">
            {filtered.map((member) => {
              const isSelected = selectedIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onSelect(member.id)
                    if (!multiple) setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left transition-colors',
                    'hover:bg-surface-3',
                    isSelected && 'bg-surface-3',
                  )}
                >
                  <Avatar className="h-ico-md w-ico-md">
                    {member.avatar && (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    )}
                    <AvatarFallback className="bg-surface-3 text-ds-xs font-semibold text-accent-fg">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-ds-md font-body text-surface-fg">
                    {member.name}
                  </span>
                  {isSelected && (
                    <IconCheck className="h-ico-sm w-ico-sm shrink-0 text-accent-11" />
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="px-ds-04 py-ds-05 text-center text-ds-sm font-body text-surface-fg-subtle">
                No members found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)

MemberPicker.displayName = 'MemberPicker'

export { MemberPicker }
