'use client'

import * as React from 'react'
import { cn } from './lib/utils'

type AutocompleteOption = {
  label: string
  value: string
}

/**
 * Props for Autocomplete — a free-text input with a live-filtered dropdown list, keyboard
 * navigation, and ARIA combobox semantics. Suitable for "type to search" fields where the
 * full list is known ahead of time (client-side filtering only).
 *
 * **Key distinction from Combobox:** Autocomplete allows free-text input (no forced selection),
 * while `<Combobox>` enforces selection from the list. Use Autocomplete for search-as-you-type
 * with suggestions; use Combobox for structured single or multi-select dropdowns.
 *
 * **`value`:** A full `AutocompleteOption` object (or null), not just the string value.
 * The input's text is synced to `value.label` on mount.
 *
 * @example
 * // City search autocomplete:
 * <Autocomplete
 *   options={[{ value: 'mumbai', label: 'Mumbai' }, { value: 'delhi', label: 'Delhi' }]}
 *   value={selectedCity}
 *   onChange={(opt) => setSelectedCity(opt)}
 *   placeholder="Search cities..."
 * />
 *
 * @example
 * // Employee name lookup with custom empty text:
 * <Autocomplete
 *   options={employees.map(e => ({ value: e.id, label: e.fullName }))}
 *   onChange={(opt) => setAssignee(opt.value)}
 *   emptyText="No employees found"
 *   placeholder="Search employees..."
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
type AutocompleteProps = {
  options: AutocompleteOption[]
  value?: AutocompleteOption | null
  onChange?: (option: AutocompleteOption) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  id?: string
}

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder,
      emptyText = 'No options',
      disabled,
      className,
      id: externalId,
    },
    ref,
  ) => {
    const internalId = React.useId()
    const baseId = externalId || internalId
    const listboxId = `${baseId}-listbox`
    const optionIdPrefix = `${baseId}-option`

    const [query, setQuery] = React.useState(value?.label ?? '')
    const [isOpen, setIsOpen] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const internalRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLUListElement>(null)
    const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

    // Compose external + internal ref
    const composedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      },
      [ref],
    )

    // Cleanup blur timeout on unmount
    React.useEffect(() => {
      return () => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
      }
    }, [])

    const filtered = React.useMemo(
      () =>
        query
          ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
          : options,
      [options, query],
    )

    const handleSelect = React.useCallback(
      (option: AutocompleteOption) => {
        setQuery(option.label)
        setIsOpen(false)
        setHighlightedIndex(-1)
        onChange?.(option)
      },
      [onChange],
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
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
      },
      [isOpen, filtered, highlightedIndex, handleSelect],
    )

    const highlightedOptionId =
      highlightedIndex >= 0 ? `${optionIdPrefix}-${highlightedIndex}` : undefined

    return (
      <div className={cn('relative', className)}>
        <input
          ref={composedRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={highlightedOptionId}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-ds-md w-full rounded-ds-md border border-border bg-field px-ds-04 py-ds-03 font-sans text-ds-md text-text-primary placeholder:text-text-placeholder',
            'outline-none focus:ring-2 focus:ring-focus focus:ring-offset-[var(--border-focus-offset)]',
            'transition-colors duration-fast-01',
            disabled && 'opacity-[var(--action-disabled-opacity,0.38)] cursor-not-allowed',
          )}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150)
          }}
          onKeyDown={handleKeyDown}
        />
        {isOpen && (
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            className={cn(
              'absolute z-dropdown mt-ds-02 w-full overflow-auto rounded-ds-md border border-border bg-layer-01 shadow-02',
              'max-h-60',
            )}
          >
            {filtered.length === 0 ? (
              <li className="px-ds-04 py-ds-03 text-ds-md text-text-secondary">
                {emptyText}
              </li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  id={`${optionIdPrefix}-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={cn(
                    'cursor-pointer px-ds-04 py-ds-03 text-ds-md text-text-primary transition-colors duration-fast-01',
                    highlightedIndex === index && 'bg-interactive-selected',
                    value?.value === option.value && 'font-semibold',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(option)
                    }
                  }}
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
  },
)
Autocomplete.displayName = 'Autocomplete'

export { Autocomplete, type AutocompleteProps, type AutocompleteOption }
