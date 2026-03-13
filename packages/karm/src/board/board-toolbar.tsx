'use client'

import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/ui/lib/utils'
import { MotionStagger, MotionStaggerItem } from '@/motion/primitives'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { SegmentedControl } from '@/ui/segmented-control'
import {
  IconSearch,
  IconFilter,
  IconUser,
  IconLayoutGrid,
  IconLayoutList,
  IconX,
} from '@tabler/icons-react'
import { useBoardContext } from './board-context'
import { collectAllLabels } from './board-utils'

// ============================================================
// Helpers
// ============================================================

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

const DUE_DATE_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
] as const

// ============================================================
// Component
// ============================================================

export interface BoardToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const BoardToolbar = React.forwardRef<HTMLDivElement, BoardToolbarProps>(({ className, ...props }, ref) => {
  const {
    rawColumns,
    members,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    viewMode,
    setViewMode,
    highlightMyTasks,
    setHighlightMyTasks,
  } = useBoardContext()

  // Debounced search
  const [searchValue, setSearchValue] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setSearchValue(val)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setFilters({ search: val })
      }, 200)
    },
    [setFilters],
  )

  // Clean up debounce timeout on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  // Sync external filter changes back to local search
  useEffect(() => {
    setSearchValue(filters.search)
  }, [filters.search])

  const allMembers = members
  const allLabels = collectAllLabels(rawColumns)

  // ---- Filter toggle helpers ----

  const togglePriority = (p: string) => {
    const current = filters.priorities
    setFilters({
      priorities: current.includes(p)
        ? current.filter((x) => x !== p)
        : [...current, p],
    })
  }

  const toggleAssignee = (id: string) => {
    const current = filters.assignees
    setFilters({
      assignees: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  }

  const toggleLabel = (label: string) => {
    const current = filters.labels
    setFilters({
      labels: current.includes(label)
        ? current.filter((x) => x !== label)
        : [...current, label],
    })
  }

  const setDueDateRange = (val: string) => {
    setFilters({
      dueDateRange:
        val === filters.dueDateRange ? null : (val as typeof filters.dueDateRange),
    })
  }

  // ---- View mode options ----

  const viewOptions = [
    { id: 'default', text: 'Board', icon: IconLayoutGrid },
    { id: 'compact', text: 'Compact', icon: IconLayoutList },
  ]

  // ---- Active filter chips ----

  const chips: { key: string; label: string; onRemove: () => void }[] = []

  for (const p of filters.priorities) {
    chips.push({
      key: `priority-${p}`,
      label: p.charAt(0) + p.slice(1).toLowerCase(),
      onRemove: () => togglePriority(p),
    })
  }
  for (const id of filters.assignees) {
    const member = allMembers.find((m) => m.id === id)
    chips.push({
      key: `assignee-${id}`,
      label: member?.name ?? id,
      onRemove: () => toggleAssignee(id),
    })
  }
  for (const l of filters.labels) {
    chips.push({
      key: `label-${l}`,
      label: l,
      onRemove: () => toggleLabel(l),
    })
  }
  if (filters.dueDateRange && filters.dueDateRange !== 'none') {
    const opt = DUE_DATE_OPTIONS.find((o) => o.value === filters.dueDateRange)
    chips.push({
      key: 'due-date',
      label: opt?.label ?? filters.dueDateRange,
      onRemove: () => setFilters({ dueDateRange: null }),
    })
  }

  return (
    <div ref={ref} className={cn("flex flex-col gap-ds-02", className)} {...props}>
      {/* Main toolbar row */}
      <div className="flex items-center gap-ds-03">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            size="sm"
            startIcon={<IconSearch className="h-ico-sm w-ico-sm" />}
            endIcon={
              searchValue ? (
                <button
                  onClick={() => {
                    setSearchValue('')
                    setFilters({ search: '' })
                  }}
                  className="pointer-events-auto cursor-pointer text-surface-fg-subtle hover:text-surface-fg"
                  aria-label="Clear search"
                >
                  <IconX className="h-3 w-3" />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-ds-01">
          {/* Priority filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  filters.priorities.length > 0 && 'text-accent-11',
                )}
                title="Filter by priority"
              >
                <IconFilter className="h-ico-sm w-ico-sm mr-ds-01" />
                Priority
                {filters.priorities.length > 0 && (
                  <span className="ml-ds-01 text-ds-xs">({filters.priorities.length})</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRIORITY_OPTIONS.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={filters.priorities.includes(p)}
                  onCheckedChange={() => togglePriority(p)}
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assignee filter */}
          {allMembers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    filters.assignees.length > 0 && 'text-accent-11',
                  )}
                  title="Filter by assignee"
                >
                  <IconUser className="h-ico-sm w-ico-sm mr-ds-01" />
                  Assignee
                  {filters.assignees.length > 0 && (
                    <span className="ml-ds-01 text-ds-xs">({filters.assignees.length})</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 max-h-56 overflow-y-auto">
                <DropdownMenuLabel>Assignee</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allMembers.map((m) => (
                  <DropdownMenuCheckboxItem
                    key={m.id}
                    checked={filters.assignees.includes(m.id)}
                    onCheckedChange={() => toggleAssignee(m.id)}
                  >
                    {m.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Label filter */}
          {allLabels.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    filters.labels.length > 0 && 'text-accent-11',
                  )}
                  title="Filter by label"
                >
                  Label
                  {filters.labels.length > 0 && (
                    <span className="ml-ds-01 text-ds-xs">({filters.labels.length})</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 max-h-56 overflow-y-auto">
                <DropdownMenuLabel>Label</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allLabels.map((l) => (
                  <DropdownMenuCheckboxItem
                    key={l}
                    checked={filters.labels.includes(l)}
                    onCheckedChange={() => toggleLabel(l)}
                  >
                    {l}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Due date filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  filters.dueDateRange && filters.dueDateRange !== 'none' && 'text-accent-11',
                )}
                title="Filter by due date"
              >
                Due date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel>Due date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.dueDateRange ?? ''}
                onValueChange={setDueDateRange}
              >
                {DUE_DATE_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* My tasks toggle */}
        <Button
          variant={highlightMyTasks ? 'outline' : 'ghost'}
          size="sm"
          onClick={() => setHighlightMyTasks(!highlightMyTasks)}
          title="Highlight my tasks"
          aria-label="Highlight my tasks"
          aria-pressed={highlightMyTasks}
          className={cn(highlightMyTasks && 'text-accent-11')}
        >
          <IconUser className="h-ico-sm w-ico-sm" />
        </Button>

        {/* View mode toggle */}
        <SegmentedControl
          size="sm"
          variant="tonal"
          options={viewOptions}
          selectedId={viewMode}
          onSelect={(id) => setViewMode(id as 'default' | 'compact')}
        />
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <MotionStagger className="flex items-center gap-ds-02 flex-wrap">
          {chips.map((chip) => (
            <MotionStaggerItem key={chip.key}>
              <Badge
                variant="subtle"
                size="sm"
                onDismiss={chip.onRemove}
              >
                {chip.label}
              </Badge>
            </MotionStaggerItem>
          ))}
          <button
            onClick={clearFilters}
            className="text-ds-xs text-surface-fg-subtle hover:text-accent-11 transition-colors"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </MotionStagger>
      )}
    </div>
  )
})

BoardToolbar.displayName = 'BoardToolbar'
