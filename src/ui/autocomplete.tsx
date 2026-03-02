import * as React from 'react'
import { cn } from './lib/utils'

type AutocompleteOption = {
  label: string
  value: string
}

type AutocompleteProps = {
  options: AutocompleteOption[]
  value?: AutocompleteOption | null
  onChange?: (option: AutocompleteOption) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  emptyText = 'No options',
  disabled,
  className,
}: AutocompleteProps) {
  const [query, setQuery] = React.useState(value?.label ?? '')
  const [isOpen, setIsOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const filtered = React.useMemo(
    () =>
      query
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  )

  const handleSelect = (option: AutocompleteOption) => {
    setQuery(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
    onChange?.(option)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true)
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="autocomplete-listbox"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex h-[var(--size-md)] w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-field)] px-ds-04 py-ds-03 font-sans text-[length:var(--font-size-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]',
          'outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-[var(--border-focus-offset)]',
          'transition-colors duration-fast',
          disabled && 'opacity-[var(--action-disabled-opacity,0.38)] cursor-not-allowed',
        )}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul
          id="autocomplete-listbox"
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute z-dropdown mt-ds-02 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] shadow-02',
            'max-h-60',
          )}
        >
          {filtered.length === 0 ? (
            <li className="px-ds-04 py-ds-03 text-[length:var(--font-size-md)] text-[var(--color-text-secondary)]">
              {emptyText}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  'cursor-pointer px-ds-04 py-ds-03 text-[length:var(--font-size-md)] text-[var(--color-text-primary)] transition-colors duration-fast',
                  highlightedIndex === index && 'bg-[var(--color-interactive-selected)]',
                  value?.value === option.value && 'font-[number:var(--font-weight-semibold)]',
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export { Autocomplete, type AutocompleteProps, type AutocompleteOption }
