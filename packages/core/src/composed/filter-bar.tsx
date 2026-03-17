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

  // Simple multi-select using checkboxes in a dropdown
  return (
    <div className={cn('relative', className)}>
      <Select
        value={value[0] ?? ''}
        onValueChange={(v) => {
          if (value.includes(v)) {
            onValueChange(value.filter((x) => x !== v))
          } else {
            onValueChange([...value, v])
          }
        }}
      >
        <SelectTrigger size={size} className={cn('w-40', count > 0 && 'border-accent-7')}>
          <span className="flex items-center gap-ds-02">
            <span>{label}</span>
            {count > 0 && (
              <Badge size="xs" variant="solid" className="ml-ds-01">
                {count}
              </Badge>
            )}
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {value.includes(o.value) ? `✓ ${o.label}` : o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { FilterBar, FilterSelect, FilterMultiSelect }
