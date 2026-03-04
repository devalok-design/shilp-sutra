'use client'

import { IconSearch, IconX, IconLoader2 } from '@tabler/icons-react'
import * as React from 'react'
import { cn } from './lib/utils'

type SearchInputSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<SearchInputSize, string> = {
  sm: 'h-ds-sm text-ds-sm pl-ds-08 pr-ds-07',
  md: 'h-ds-md text-ds-md pl-10 pr-9',
  lg: 'h-ds-lg text-ds-lg pl-12 pr-10',
}

/**
 * Props for SearchInput — a search field with a built-in leading magnifier icon, optional loading
 * spinner, and an auto-shown clear button when `value` is non-empty and `onClear` is provided.
 *
 * **Important:** Use `inputSize` (not `size`) to control height — `size` is reserved for the HTML
 * attribute. Options: `'sm'` | `'md'` (default) | `'lg'`.
 *
 * **Clear button:** Appears automatically when `value !== ''` and `onClear` is provided.
 * When `loading` is true, a spinning loader replaces the clear button.
 *
 * @example
 * // Controlled search with clear:
 * <SearchInput
 *   value={query}
 *   onChange={(e) => setQuery(e.target.value)}
 *   onClear={() => setQuery('')}
 *   placeholder="Search tasks..."
 * />
 *
 * @example
 * // Async search with loading state while fetching results:
 * <SearchInput
 *   value={query}
 *   onChange={handleSearch}
 *   loading={isSearching}
 *   placeholder="Search clients..."
 * />
 *
 * @example
 * // Compact search bar in a toolbar:
 * <SearchInput inputSize="sm" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  loading?: boolean
  /** @default 'md' */
  inputSize?: SearchInputSize
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, loading, inputSize = 'md', ...props }, ref) => {
    const hasValue = value !== undefined && value !== ''

    return (
      <div className="relative flex items-center">
        <IconSearch
          className="absolute left-3 h-ico-md w-ico-md text-text-secondary pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={ref}
          value={value}
          aria-busy={loading}
          className={cn(
            'flex w-full font-sans',
            sizeClasses[inputSize],
            'bg-field text-text-primary',
            'border border-border rounded-ds-md',
            'placeholder:text-text-placeholder',
            'hover:bg-field-hover',
            'transition-colors duration-fast-01',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
            'disabled:cursor-not-allowed disabled:opacity-[0.38]',
            className,
          )}
          {...props}
        />
        {loading ? (
          <IconLoader2
            className="absolute right-3 h-ico-md w-ico-md text-text-secondary animate-spin pointer-events-none"
            aria-hidden="true"
          />
        ) : hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 rounded-ds-full h-ico-md w-ico-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-layer-02 transition-colors"
            aria-label="Clear search"
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        ) : null}
      </div>
    )
  },
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }
