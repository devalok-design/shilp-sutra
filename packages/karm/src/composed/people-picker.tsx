'use client'

import * as React from 'react'
import { IconCheck, IconStar, IconStarFilled } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
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
  const assigneeIds = React.useMemo(
    () => new Set(assignees.map((a) => a.id)),
    [assignees],
  )
  const leadIds = React.useMemo(
    () => new Set(leads.map((l) => l.id)),
    [leads],
  )

  const defaultHint = (
    <span className="flex items-center gap-1">
      Click to assign ·{' '}
      <Icon icon={IconStarFilled} size="xs" className="text-warning-9" /> = lead
    </span>
  )

  const resolvedHint = hint === undefined ? defaultHint : hint

  const hintEl = resolvedHint !== null && (
    <p className="text-[10px] text-surface-fg-subtle/50 uppercase tracking-wider px-ds-02">
      {resolvedHint}
    </p>
  )

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-[240px] p-ds-02 border-surface-border-strong bg-surface-overlay shadow-floating"
      >
        {hintPosition === 'top' && hintEl}

        <div className="flex flex-col">
          {members.map((member) => {
            const isAssigned = assigneeIds.has(member.id)
            const isLead = leadIds.has(member.id)

            return (
              <Button
                key={member.id}
                variant="ghost"
                size="compact-sm"
                weight="normal"
                className={cn(
                  'w-full justify-start',
                  isAssigned && 'bg-surface-raised-hover',
                )}
                onClick={() =>
                  isAssigned
                    ? onUnassign(member.id)
                    : onAssign(member.id)
                }
              >
                <Avatar size="xs" className="h-5 w-5 shrink-0">
                  {member.image && (
                    <AvatarImage src={member.image} alt={member.name} />
                  )}
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>

                <span className="truncate">{member.name}</span>

                <span className="flex-1" />

                {isAssigned && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          role="button"
                          tabIndex={0}
                          className="shrink-0 rounded-ds-sm p-0.5 transition-colors hover:bg-surface-raised"
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

                    <Icon
                      icon={IconCheck}
                      size="xs"
                      className="shrink-0 text-accent-9"
                    />
                  </>
                )}
              </Button>
            )
          })}
        </div>

        {hintPosition === 'bottom' && hintEl}
      </PopoverContent>
    </Popover>
  )
}

PeoplePicker.displayName = 'PeoplePicker'
