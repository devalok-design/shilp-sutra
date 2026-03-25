'use client'

import { IconSearch, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { springs } from './lib/motion'
import { Spinner } from './spinner'
import { Icon } from './icon'
import { Input } from './input'
import { Button } from './button'

type SearchInputSize = 'xs' | 'sm' | 'md' | 'lg'

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
  ({ className, value, onClear, loading, size = 'md', placeholder, ...props }, ref) => {
    const hasValue = value !== undefined && value !== ''

    const endContent = loading ? (
      <Spinner size="sm" />
    ) : (
      <AnimatePresence>
        {hasValue && onClear && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={springs.snappy}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClear}
              aria-label="Clear search"
            >
              <Icon icon={IconX} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    )

    return (
      <Input
        ref={ref}
        size={size}
        startSection={<Icon icon={IconSearch} />}
        endSection={endContent}
        endSectionClickable={!!hasValue && !loading}
        placeholder={placeholder}
        value={value}
        aria-busy={loading || undefined}
        className={className}
        {...props}
      />
    )
  },
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }
