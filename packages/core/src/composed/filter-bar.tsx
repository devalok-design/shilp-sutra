'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { SearchInput } from '../ui/search-input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { MultiSelectPopover, type MultiSelectItem } from './multi-select-popover'

// ============================================================
// Context
// ============================================================

type FilterBarSize = 'xs' | 'sm' | 'md'

const FilterBarContext = React.createContext<{ size: FilterBarSize }>({ size: 'sm' })

// ============================================================
// FilterBar
// ============================================================

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onClearAll?: () => void
  /** Size propagated to all child controls @default 'sm' */
  size?: FilterBarSize
}

function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onClearAll,
  size = 'sm',
  children,
  className,
  ...props
}: FilterBarProps) {
  return (
    <FilterBarContext.Provider value={{ size }}>
      <div
        className={cn('flex flex-wrap items-center gap-ds-03', className)}
        role="toolbar"
        aria-label="Filters"
        {...props}
      >
        {onSearchChange && (
          <SearchInput
            size={size}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={searchValue ? () => onSearchChange('') : undefined}
            placeholder={searchPlaceholder}
            className="w-48"
          />
        )}
        {children}
        {onClearAll && (
          <Button variant="ghost" size={size} onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>
    </FilterBarContext.Provider>
  )
}

// ============================================================
// FilterSelect
// ============================================================

export interface FilterSelectProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  /** Label for the "all" option @default 'All' */
  allLabel?: string
  className?: string
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  allLabel = 'All',
  className,
}: FilterSelectProps) {
  const { size } = React.useContext(FilterBarContext)
  const isFiltered = value !== '' && value !== 'all'

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size={size}
        className={cn('w-40', isFiltered && 'border-accent-7', className)}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ============================================================
// FilterMultiSelect
// ============================================================

export interface FilterMultiSelectProps {
  label: string
  value: string[]
  onValueChange: (values: string[]) => void
  options: { value: string; label: string }[]
  className?: string
}

function FilterMultiSelect({
  label,
  value,
  onValueChange,
  options,
  className,
}: FilterMultiSelectProps) {
  const { size } = React.useContext(FilterBarContext)
  const count = value.length

  const items: MultiSelectItem[] = React.useMemo(
    () => options.map((o) => ({ id: o.value, label: o.label })),
    [options],
  )

  // Trigger button sized by FilterBar context
  const triggerSizeClasses: Record<string, string> = {
    xs: 'h-ds-xs-plus text-ds-sm px-ds-02',
    sm: 'h-ds-sm text-ds-sm px-ds-03',
    md: 'h-ds-md text-ds-md px-ds-04',
  }

  return (
    <MultiSelectPopover
      items={items}
      value={value}
      onValueChange={onValueChange}
      searchPlaceholder={`Search ${label.toLowerCase()}...`}
    >
      <button
        type="button"
        className={cn(
          'flex items-center justify-between gap-ds-02 whitespace-nowrap rounded-ds-md border bg-surface-raised-hover text-surface-fg',
          'hover:bg-surface-raised-active transition-colors duration-fast-01 ease-productive-standard',
          triggerSizeClasses[size],
          count > 0 ? 'border-accent-7' : 'border-surface-border-strong',
          'w-40',
          className,
        )}
      >
        <span className="flex items-center gap-ds-02 truncate">
          <span>{label}</span>
          {count > 0 && (
            <Badge size="xs" variant="solid" className="ml-ds-01">
              {count}
            </Badge>
          )}
        </span>
        <svg className="h-3.5 w-3.5 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </MultiSelectPopover>
  )
}

export { FilterBar, FilterSelect, FilterMultiSelect }
