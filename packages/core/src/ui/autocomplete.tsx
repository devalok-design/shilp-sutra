'use client'

import { autoUpdate, flip, offset, shift, size as sizeMiddleware, useFloating } from '@floating-ui/react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { useMotion } from '../motion/motion-provider'
import { useFormField } from './form'
import { Input, type InputProps } from './input'
import { tweens } from './lib/motion'
import { cn } from './lib/utils'
import { Spinner } from './spinner'

export type AutocompleteOption = {
  label: string
  value: string
}

/**
 * A free-text input with a live-filtered dropdown, keyboard navigation, and
 * combobox ARIA. The field itself is the DS `Input`, so it inherits size,
 * error/state painting, read-only, hover, and FormField wiring.
 *
 * Free-text (no forced selection) — for enforced selection use `Combobox`.
 * `value`/`defaultValue` are a full `AutocompleteOption` (or null).
 */
export type AutocompleteProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  options: AutocompleteOption[]
  /** Controlled selection. */
  value?: AutocompleteOption | null
  /** Initial selection for uncontrolled mode. */
  defaultValue?: AutocompleteOption | null
  onValueChange?: (option: AutocompleteOption) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  /** Input size (forwarded to the composed `Input`). */
  size?: InputProps['size']
  /** Field state (forwarded to `Input`); overrides FormField auto-consumption. */
  state?: InputProps['state']
  /** Show a loading spinner + `loadingText` (async "type to search"). */
  isLoading?: boolean
  loadingText?: string
  /** Custom option renderer. Receives the option and the current query. */
  renderOption?: (option: AutocompleteOption, query: string) => React.ReactNode
  className?: string
  id?: string
}

/** Bold the matched substring inside an option label. */
function HighlightMatch({ label, query }: { label: string; query: string }) {
  const idx = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (idx === -1) return <>{label}</>
  return (
    <>
      {label.slice(0, idx)}
      <span className="font-semibold text-accent-11">{label.slice(idx, idx + query.length)}</span>
      {label.slice(idx + query.length)}
    </>
  )
}

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      options,
      value,
      defaultValue = null,
      onValueChange,
      placeholder,
      emptyText = 'No options',
      disabled,
      size,
      state,
      isLoading = false,
      loadingText = 'Loading…',
      renderOption,
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

    // Controlled / uncontrolled selection
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<AutocompleteOption | null>(defaultValue)
    const selected = isControlled ? value : internalValue

    const [query, setQuery] = React.useState(selected?.label ?? '')
    const [isOpen, setIsOpen] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const internalRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const floatingRef = React.useRef<HTMLUListElement>(null)
    const { reducedMotion } = useMotion()

    // Floating UI — anchor the dropdown to the whole field (container width)
    const { refs, floatingStyles } = useFloating({
      open: isOpen,
      placement: 'bottom-start',
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(4),
        flip(),
        shift(),
        sizeMiddleware({
          apply({ availableHeight, rects, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight, 240)}px`,
              width: `${rects.reference.width}px`,
            })
          },
        }),
      ],
    })

    const setContainer = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node
        refs.setReference(node)
      },
      [refs],
    )

    const composedInputRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      },
      [ref],
    )

    const setFloating = React.useCallback(
      (node: HTMLUListElement | null) => {
        floatingRef.current = node
        refs.setFloating(node)
      },
      [refs],
    )

    // Sync query when the selection changes externally
    React.useEffect(() => {
      setQuery(selected?.label ?? '')
    }, [selected])

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
        if (!isControlled) setInternalValue(option)
        onValueChange?.(option)
      },
      [isControlled, onValueChange],
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return
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
          case 'Home':
            e.preventDefault()
            setHighlightedIndex(0)
            break
          case 'End':
            e.preventDefault()
            setHighlightedIndex(filtered.length - 1)
            break
          case 'Enter':
            e.preventDefault()
            if (highlightedIndex >= 0 && filtered[highlightedIndex]) handleSelect(filtered[highlightedIndex])
            break
          case 'Escape':
            setIsOpen(false)
            setHighlightedIndex(-1)
            break
        }
      },
      [disabled, isOpen, filtered, highlightedIndex, handleSelect],
    )

    // FormField wiring is auto-consumed by Input; only used here to decide the
    // standalone accessible-name fallback + the combobox aria-controls id.
    const fieldCtx = useFormField()
    const hasFieldName = !!(externalId || fieldCtx.inputId)
    const highlightedOptionId = highlightedIndex >= 0 ? `${optionIdPrefix}-${highlightedIndex}` : undefined

    return (
      <div ref={setContainer} className={cn('relative', className)} {...props}>
        <Input
          ref={composedInputRef}
          type="text"
          role="combobox"
          size={size}
          state={state}
          id={externalId}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={highlightedOptionId}
          aria-label={hasFieldName ? undefined : placeholder}
          endSection={isLoading ? <Spinner size="sm" /> : undefined}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={(e) => {
            const target = e.relatedTarget as Node | null
            if (!containerRef.current?.contains(target) && !floatingRef.current?.contains(target)) {
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
                  ref={setFloating}
                  role="listbox"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={reducedMotion ? { duration: 0 } : tweens.fade}
                  style={floatingStyles}
                  className="z-popover overflow-auto rounded-overlay bg-surface-overlay shadow-raised-hover"
                >
                  {isLoading ? (
                    <li className="flex items-center gap-ds-03 px-ds-04 py-ds-03 text-body-md text-surface-fg-muted">
                      <Spinner size="sm" />
                      {loadingText}
                    </li>
                  ) : filtered.length === 0 ? (
                    <li className="px-ds-04 py-ds-03 text-body-md text-surface-fg-muted">{emptyText}</li>
                  ) : (
                    filtered.map((option, index) => (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- WAI-ARIA combobox: keyboard nav is on the input via aria-activedescendant; options are pointer affordances, not focusable tab stops
                      <li
                        key={option.value}
                        id={`${optionIdPrefix}-${index}`}
                        role="option"
                        aria-selected={highlightedIndex === index}
                        title={option.label}
                        className={cn(
                          'cursor-pointer truncate px-ds-04 py-ds-03 text-body-md text-surface-fg transition-colors duration-fast-01',
                          highlightedIndex === index && 'bg-accent-4',
                          selected?.value === option.value && 'font-semibold',
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(option)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {renderOption ? renderOption(option, query) : <HighlightMatch label={option.label} query={query} />}
                      </li>
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

export { Autocomplete }
