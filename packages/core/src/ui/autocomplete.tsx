'use client'

import { autoUpdate,flip, offset, shift, size, useFloating } from '@floating-ui/react-dom'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { useFormField } from './form'
import { springs, tweens } from './lib/motion'
import { cn } from './lib/utils'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: springs.snappy },
}

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
 *   onValueChange={(opt) => setSelectedCity(opt)}
 *   placeholder="Search cities..."
 * />
 *
 * @example
 * // Employee name lookup with custom empty text:
 * <Autocomplete
 *   options={employees.map(e => ({ value: e.id, label: e.fullName }))}
 *   onValueChange={(opt) => setAssignee(opt.value)}
 *   emptyText="No employees found"
 *   placeholder="Search employees..."
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
type AutocompleteProps = React.HTMLAttributes<HTMLDivElement> & {
  options: AutocompleteOption[]
  value?: AutocompleteOption | null
  onValueChange?: (option: AutocompleteOption) => void
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
      onValueChange,
      placeholder,
      emptyText = 'No options',
      disabled,
      className,
      id: externalId,
      ...props
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
    const containerRef = React.useRef<HTMLDivElement>(null)
    const floatingRef = React.useRef<HTMLUListElement>(null)

    // Floating UI positioning
    const { refs, floatingStyles } = useFloating({
      open: isOpen,
      placement: 'bottom-start',
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(4),
        flip(),
        shift(),
        size({
          apply({ availableHeight, rects, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight, 240)}px`,
              width: `${rects.reference.width}px`,
            })
          },
        }),
      ],
    })

    // Compose external + internal ref + floating reference ref for input
    const composedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node
        refs.setReference(node)
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      },
      [ref, refs],
    )

    // Compose floating ref + listRef
    const composedFloatingRef = React.useCallback(
      (node: HTMLUListElement | null) => {
        (listRef as React.MutableRefObject<HTMLUListElement | null>).current = node
        ;(floatingRef as React.MutableRefObject<HTMLUListElement | null>).current = node
        refs.setFloating(node)
      },
      [refs],
    )

    // Sync query when value changes externally
    React.useEffect(() => {
      setQuery(value?.label ?? '')
    }, [value])

    // Cleanup blur timeout on unmount
    React.useEffect(() => {
      return () => {
        // Option selected — close and blur handled by relatedTarget check
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
        onValueChange?.(option)
      },
      [onValueChange],
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

    const fieldCtx = useFormField()
    const isError = fieldCtx.state === 'error'
    const ariaDescribedBy = fieldCtx.helperTextId
    const ariaRequired = fieldCtx.required

    const highlightedOptionId =
      highlightedIndex >= 0 ? `${optionIdPrefix}-${highlightedIndex}` : undefined

    return (
      <div ref={containerRef} className={cn('relative', className)} {...props}>
        <input
          ref={composedRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={highlightedOptionId}
          aria-invalid={isError || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired || undefined}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-ds-md w-full rounded-ds-md border border-surface-border-strong bg-surface-raised-hover px-ds-04 py-ds-03 font-sans text-ds-md text-surface-fg placeholder:text-surface-fg-subtle',
            'outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-[var(--border-focus-offset)]',
            'transition-colors duration-fast-01',
            disabled && 'opacity-action-disabled cursor-not-allowed',
          )}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={(e) => {
            // Close only if focus moved outside both the container and the portal dropdown
            const target = e.relatedTarget as Node | null
            if (
              !containerRef.current?.contains(target) &&
              !floatingRef.current?.contains(target)
            ) {
              setIsOpen(false)
            }
          }}
          onKeyDown={handleKeyDown}
        />
        {typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.ul
                  id={listboxId}
                  ref={composedFloatingRef}
                  role="listbox"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={listVariants}
                  style={floatingStyles}
                  className={cn(
                    'z-popover overflow-auto rounded-ds-md border border-surface-border-strong bg-surface-overlay shadow-raised-hover',
                  )}
                >
                  {filtered.length === 0 ? (
                    <motion.li
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={tweens.fade}
                      className="px-ds-04 py-ds-03 text-ds-md text-surface-fg-muted"
                    >
                      {emptyText}
                    </motion.li>
                  ) : (
                    filtered.map((option, index) => (
                      <motion.li
                        key={option.value}
                        id={`${optionIdPrefix}-${index}`}
                        role="option"
                        aria-selected={highlightedIndex === index}
                        variants={itemVariants}
                        className={cn(
                          'cursor-pointer px-ds-04 py-ds-03 text-ds-md text-surface-fg transition-colors duration-fast-01',
                          highlightedIndex === index && 'bg-accent-3',
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
                      </motion.li>
                    ))
                  )}
                </motion.ul>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>
    )
  },
)
Autocomplete.displayName = 'Autocomplete'

export { Autocomplete, type AutocompleteOption,type AutocompleteProps }
