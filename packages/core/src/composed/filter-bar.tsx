'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { springs } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'
import { SearchInput } from '../ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { type MultiSelectItem,MultiSelectPopover } from './multi-select-popover'

// ============================================================
// Context
// ============================================================

type FilterBarSize = 'xs' | 'sm' | 'md'

const FilterBarContext = React.createContext<{ size: FilterBarSize }>({ size: 'sm' })

// ============================================================
// FilterBar
// ============================================================

/**
 * A toolbar for filtering lists/tables. Composes a search input, slot-based
 * filter controls (Select, MultiSelect), and an optional "Clear all" button.
 * Size is propagated to all child controls via context.
 */
export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled search input value. Omit `onSearchChange` to hide the search input entirely. */
  searchValue?: string
  /** Called when the search input changes. If not provided, the search input is hidden. */
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** When provided, a "Clear all" button appears that calls this handler. */
  onClearAll?: () => void
  /** Size propagated to all child controls. @default 'sm' */
  size?: FilterBarSize
}

const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onClearAll,
  size = 'sm',
  children,
  className,
  ...props
}, ref) => {
  return (
    <FilterBarContext.Provider value={{ size }}>
      <div
        ref={ref}
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
})
FilterBar.displayName = 'FilterBar'

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
    xs: 'h-ds-xs-plus text-body-sm px-ds-02',
    sm: 'h-ds-sm text-body-sm px-ds-03',
    md: 'h-ds-md text-body-md px-ds-04',
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
          'flex items-center justify-between gap-ds-02 whitespace-nowrap rounded-control border bg-surface-raised-hover text-surface-fg',
          'hover:bg-surface-raised-active transition-colors duration-fast-01 ease-productive-standard',
          triggerSizeClasses[size],
          count > 0 ? 'border-accent-7' : 'border-surface-border-strong',
          'w-40',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-ds-02">
          <span className="truncate">{label}</span>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={springs.snappy}
              className="inline-flex"
            >
              <Badge size="xs" variant="solid" className="ml-ds-01">
                {count}
              </Badge>
            </motion.span>
          )}
        </span>
        <Icon icon={IconChevronDown} size="xs" className="opacity-50 shrink-0" />
      </button>
    </MultiSelectPopover>
  )
}

export { FilterBar, FilterMultiSelect,FilterSelect }
