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

export interface MemberPickerProps {
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
          className="w-[220px] border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-0"
          align="start"
          sideOffset={4}
        >
          <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-3 py-2">
            <IconSearch className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-placeholder)]" stroke={1.5} />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[13px] font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto py-1">
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
                    'flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors',
                    'hover:bg-[var(--color-field)]',
                    isSelected && 'bg-[var(--color-field)]',
                  )}
                >
                  <Avatar className="h-5 w-5">
                    {member.avatar && (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    )}
                    <AvatarFallback className="bg-[var(--color-layer-03)] text-[8px] font-semibold text-[var(--color-text-on-color)]">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-[13px] font-body text-[var(--color-text-primary)]">
                    {member.name}
                  </span>
                  {isSelected && (
                    <IconCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-interactive)]" />
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12px] font-body text-[var(--color-text-placeholder)]">
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
