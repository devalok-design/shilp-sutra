'use client'

import { IconSearch, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { springs } from './lib/motion'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

type SearchInputSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClasses: Record<SearchInputSize, string> = {
  xs: 'h-ds-xs-plus text-ds-sm pl-ds-07 pr-ds-06',
  sm: 'h-ds-sm text-ds-sm pl-ds-08 pr-ds-07',
  md: 'h-ds-md text-ds-md pl-[2.5rem] pr-[2.25rem]',
  lg: 'h-ds-lg text-ds-md pl-[3rem] pr-[2.5rem]',
}

/**
 * Props for SearchInput — a search field with a built-in leading magnifier icon, optional loading
 * spinner, and an auto-shown clear button when `value` is non-empty and `onClear` is provided.
 *
 * **Sizes:** `sm` | `md` (default) | `lg` — matches Input's `size` prop API.
 * HTML's native `size` attribute is excluded — use CSS width instead.
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
 * <SearchInput size="sm" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void
  loading?: boolean
  /** @default 'md' */
  size?: SearchInputSize
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, loading, size = 'md', ...props }, ref) => {
    const hasValue = value !== undefined && value !== ''

    return (
      <div className="relative flex items-center">
        <IconSearch
          className="absolute left-[0.75rem] h-ico-md w-ico-md text-surface-fg-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={ref}
          value={value}
          aria-busy={loading}
          className={cn(
            'flex w-full font-sans',
            sizeClasses[size],
            'bg-surface-raised-hover text-surface-fg',
            'border border-surface-border-strong rounded-ds-md',
            'placeholder:text-surface-fg-subtle',
            'hover:bg-surface-raised-active',
            'transition-colors duration-fast-01 ease-productive-standard',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:border-accent-7',
            'disabled:cursor-not-allowed disabled:opacity-action-disabled',
            className,
          )}
          {...props}
        />
        {loading ? (
          <span className="absolute right-[0.75rem] pointer-events-none" aria-hidden="true">
            <Spinner size="sm" />
          </span>
        ) : (
          <AnimatePresence>
            {hasValue && onClear && (
              <motion.button
                type="button"
                onClick={onClear}
                className="absolute right-[0.75rem] rounded-ds-full h-ico-md w-ico-md flex items-center justify-center text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised transition-colors ease-productive-standard"
                aria-label="Clear search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springs.snappy}
              >
                <IconX className="h-ico-sm w-ico-sm" />
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    )
  },
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }
