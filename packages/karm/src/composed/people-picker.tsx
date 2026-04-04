'use client'

import * as React from 'react'
import { IconStar, IconStarFilled, IconSearch } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@/ui/popover'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PeoplePickerMember {
  id: string
  name: string
  image?: string | null
  isOnLeave?: boolean
}

export interface PeoplePickerProps {
  members: PeoplePickerMember[]
  assignees: PeoplePickerMember[]
  leads: PeoplePickerMember[]
  onAssign: (memberId: string) => void
  onUnassign: (memberId: string) => void
  onToggleLead: (memberId: string) => void
  hintPosition?: 'top' | 'bottom'
  hint?: React.ReactNode | null
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

// ---------------------------------------------------------------------------
// PeoplePicker
// ---------------------------------------------------------------------------

export function PeoplePicker({
  members,
  assignees,
  leads,
  onAssign,
  onUnassign,
  onToggleLead,
  hintPosition = 'top',
  hint,
  children,
  align = 'start',
}: PeoplePickerProps) {
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const assigneeIds = React.useMemo(
    () => new Set(assignees.map((a) => a.id)),
    [assignees],
  )
  const leadIds = React.useMemo(
    () => new Set(leads.map((l) => l.id)),
    [leads],
  )

  // Filter + sort: assigned first, then alphabetical
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    const list = q
      ? members.filter((m) => m.name.toLowerCase().includes(q))
      : members
    return [...list].sort((a, b) => {
      const aAssigned = assigneeIds.has(a.id) ? 0 : 1
      const bAssigned = assigneeIds.has(b.id) ? 0 : 1
      if (aAssigned !== bAssigned) return aAssigned - bAssigned
      return a.name.localeCompare(b.name)
    })
  }, [members, query, assigneeIds])

  const showSearch = members.length > 5

  const resolvedHint = hint === undefined
    ? <span className="text-surface-fg-subtle/60">Click name to assign · star for lead</span>
    : hint

  const hintEl = resolvedHint !== null && (
    <p className="text-[10px] text-surface-fg-subtle/50 px-ds-02 py-ds-01">
      {resolvedHint}
    </p>
  )

  return (
    <Popover onOpenChange={(open) => { if (!open) setQuery('') }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-[260px] p-ds-02 border-surface-border-strong bg-surface-overlay shadow-floating"
        onOpenAutoFocus={(e) => {
          if (showSearch) {
            e.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        {hintPosition === 'top' && hintEl}

        {/* Search input — shown when 6+ members */}
        {showSearch && (
          <div className="relative mb-ds-02">
            <Icon
              icon={IconSearch}
              size="xs"
              className="absolute left-ds-02 top-1/2 -translate-y-1/2 text-surface-fg-subtle/40 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full rounded-ds-md border border-surface-border bg-surface-1 py-ds-02 pl-7 pr-ds-03 text-ds-xs text-surface-fg placeholder:text-surface-fg-subtle/40 outline-none focus:border-accent-7 transition-colors"
            />
          </div>
        )}

        <div className="flex flex-col gap-ds-01 max-h-[280px] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-ds-03 py-ds-04 text-center text-ds-xs text-surface-fg-subtle">
              No matches
            </p>
          )}
          {filtered.map((member) => {
            const isAssigned = assigneeIds.has(member.id)
            const isLead = leadIds.has(member.id)

            return (
              <button
                key={member.id}
                type="button"
                className={cn(
                  'group/row flex items-center gap-ds-03 w-full rounded-ds-md px-ds-03 py-ds-03 text-left transition-colors hover:bg-surface-raised-hover',
                )}
                onClick={() =>
                  isAssigned
                    ? onUnassign(member.id)
                    : onAssign(member.id)
                }
              >
                <Avatar size="xs" className="h-6 w-6 shrink-0">
                  {member.image && (
                    <AvatarImage src={member.image} alt={member.name} />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className={cn(
                    'text-ds-sm truncate',
                    isAssigned ? 'text-accent-11 font-semibold' : 'text-surface-fg-muted',
                  )}>
                    {member.name}
                  </span>
                  {member.isOnLeave && (
                    <span className="text-[10px] text-warning-11">On leave</span>
                  )}
                </div>

                {/* Lead star — only for assigned members */}
                {isAssigned && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'shrink-0 rounded-ds-sm p-0.5 transition-all hover:bg-surface-raised',
                          isLead ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100',
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleLead(member.id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            onToggleLead(member.id)
                          }
                        }}
                      >
                        <Icon
                          icon={isLead ? IconStarFilled : IconStar}
                          size="xs"
                          className={
                            isLead
                              ? 'text-warning-9'
                              : 'text-surface-fg-subtle/30'
                          }
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isLead ? 'Remove as lead' : 'Make lead'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </button>
            )
          })}
        </div>

        {hintPosition === 'bottom' && hintEl}
      </PopoverContent>
    </Popover>
  )
}

PeoplePicker.displayName = 'PeoplePicker'
