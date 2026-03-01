'use client'

import { Search, X, Loader2 } from 'lucide-react'
import * as React from 'react'
import { cn } from './lib/utils'

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  loading?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, loading, ...props }, ref) => {
    const hasValue = value !== undefined && value !== ''

    return (
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 h-[var(--icon-md)] w-[var(--icon-md)] text-[var(--color-text-secondary)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={ref}
          value={value}
          aria-busy={loading}
          className={cn(
            'flex w-full font-sans text-sm',
            'h-[var(--size-md)] pl-10 pr-9',
            'bg-[var(--color-field)] text-[var(--color-text-primary)]',
            'border border-[var(--color-border-default)] rounded-[var(--radius-md)]',
            'placeholder:text-[var(--color-text-placeholder)]',
            'hover:bg-[var(--color-field-hover)]',
            'transition-colors duration-[var(--duration-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:border-[var(--color-border-interactive)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {loading ? (
          <Loader2
            className="absolute right-3 h-[var(--icon-md)] w-[var(--icon-md)] text-[var(--color-text-secondary)] animate-spin pointer-events-none"
            aria-hidden="true"
          />
        ) : hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 rounded-[var(--radius-full)] h-5 w-5 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-layer-02)] transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  },
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }
