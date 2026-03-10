'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/ui/context-menu'
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowRight,
  IconAlertTriangle,
  IconUser,
  IconTag,
  IconCalendar,
  IconEye,
  IconEyeOff,
  IconTrash,
} from '@tabler/icons-react'
import { useBoardContext } from './board-context'
import { PRIORITY_COLORS } from './board-constants'
import type { BoardMember } from './board-types'

// ============================================================
// Helpers
// ============================================================

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', icon: IconArrowDown },
  { value: 'MEDIUM', label: 'Medium', icon: IconArrowRight },
  { value: 'HIGH', label: 'High', icon: IconArrowUp },
  { value: 'URGENT', label: 'Urgent', icon: IconAlertTriangle },
] as const

function collectAllMembers(
  columns: { tasks: { owner: BoardMember | null; assignees: BoardMember[] }[] }[],
): BoardMember[] {
  const seen = new Set<string>()
  const members: BoardMember[] = []
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.owner && !seen.has(task.owner.id)) {
        seen.add(task.owner.id)
        members.push(task.owner)
      }
      for (const a of task.assignees) {
        if (!seen.has(a.id)) {
          seen.add(a.id)
          members.push(a)
        }
      }
    }
  }
  return members
}

function collectAllLabels(
  columns: { tasks: { labels: string[] }[] }[],
): string[] {
  const set = new Set<string>()
  for (const col of columns) {
    for (const task of col.tasks) {
      for (const l of task.labels) set.add(l)
    }
  }
  return Array.from(set).sort()
}

// ============================================================
// Component
// ============================================================

export interface TaskContextMenuProps {
  taskId: string
  children: React.ReactNode
}

export function TaskContextMenu({ taskId, children }: TaskContextMenuProps) {
  const {
    rawColumns,
    onQuickPriorityChange,
    onQuickAssign,
    onQuickLabelAdd,
    onQuickDueDateChange,
    onQuickVisibilityChange,
    onQuickDelete,
  } = useBoardContext()

  const allMembers = collectAllMembers(rawColumns)
  const allLabels = collectAllLabels(rawColumns)

  const dateInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52 animate-scale-in">
        {/* Priority submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <IconAlertTriangle className="mr-ds-03 h-ico-sm w-ico-sm" />
            Set Priority
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            {PRIORITY_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <ContextMenuItem
                  key={opt.value}
                  onSelect={() => onQuickPriorityChange(taskId, opt.value)}
                >
                  <Icon
                    className={cn(
                      'mr-ds-03 h-ico-sm w-ico-sm',
                      PRIORITY_COLORS[opt.value as keyof typeof PRIORITY_COLORS],
                    )}
                  />
                  {opt.label}
                </ContextMenuItem>
              )
            })}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Assign submenu */}
        {allMembers.length > 0 && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <IconUser className="mr-ds-03 h-ico-sm w-ico-sm" />
              Assign
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-44 max-h-48 overflow-y-auto">
              {allMembers.map((m) => (
                <ContextMenuItem
                  key={m.id}
                  onSelect={() => onQuickAssign(taskId, m.id)}
                >
                  {m.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* Label submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <IconTag className="mr-ds-03 h-ico-sm w-ico-sm" />
            Add Label
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40 max-h-48 overflow-y-auto">
            {allLabels.length > 0 ? (
              allLabels.map((l) => (
                <ContextMenuItem
                  key={l}
                  onSelect={() => onQuickLabelAdd(taskId, l)}
                >
                  {l}
                </ContextMenuItem>
              ))
            ) : (
              <div className="px-ds-03 py-ds-02 text-ds-xs text-text-tertiary">
                No labels found
              </div>
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Due date */}
        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault()
            dateInputRef.current?.showPicker()
          }}
        >
          <IconCalendar className="mr-ds-03 h-ico-sm w-ico-sm" />
          Set Due Date
          <input
            ref={dateInputRef}
            type="date"
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            onChange={(e) => {
              onQuickDueDateChange(taskId, e.target.value || null)
            }}
            tabIndex={-1}
          />
        </ContextMenuItem>

        {/* Visibility submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <IconEye className="mr-ds-03 h-ico-sm w-ico-sm" />
            Visibility
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem
              onSelect={() => onQuickVisibilityChange(taskId, 'INTERNAL')}
            >
              <IconEyeOff className="mr-ds-03 h-ico-sm w-ico-sm" />
              Internal only
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => onQuickVisibilityChange(taskId, 'EVERYONE')}
            >
              <IconEye className="mr-ds-03 h-ico-sm w-ico-sm" />
              Visible to all
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Delete */}
        <ContextMenuItem
          className="text-error focus:text-error"
          onSelect={() => onQuickDelete(taskId)}
        >
          <IconTrash className="mr-ds-03 h-ico-sm w-ico-sm" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

TaskContextMenu.displayName = 'TaskContextMenu'
