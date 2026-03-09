'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@primitives/react-popover'
import { IconCheck, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react'
import { cn } from './lib/utils'

/**
 * Option shape for a Combobox dropdown item.
 * `value` must be unique across all options — it is the key used in selection state.
 */
export interface ComboboxOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

/**
 * Props for Combobox — a searchable single or multi-select dropdown with built-in keyboard
 * navigation, pill overflow ("+ N more"), and an optional custom option renderer.
 *
 * **Single vs multi:** `multiple={false}` (default) — `value` is a `string` and `onValueChange`
 * receives a `string`. When `multiple={true}`, `value` is `string[]`, `onValueChange` receives
 * `string[]`, and selected items appear as dismissible pills in the trigger.
 *
 * The props form a **discriminated union** on `multiple` — TypeScript will narrow `value` and
 * `onValueChange` automatically, so no manual casts are needed.
 *
 * **Custom rendering:** Use `renderOption` to return custom JSX per option (e.g. avatars, badges).
 *
 * @example
 * // Single-select country picker:
 * <Combobox
 *   options={[{ value: 'in', label: 'India' }, { value: 'us', label: 'United States' }]}
 *   value={country}
 *   onValueChange={(v) => setCountry(v)}
 *   placeholder="Select country"
 * />
 *
 * @example
 * // Multi-select tag picker with pill display:
 * <Combobox
 *   multiple
 *   options={tagOptions}
 *   value={selectedTags}
 *   onValueChange={(v) => setSelectedTags(v)}
 *   placeholder="Select tags..."
 * />
 *
 * @example
 * // Custom option renderer (user avatars in assignee picker):
 * <Combobox
 *   options={users.map(u => ({ value: u.id, label: u.name }))}
 *   value={assigneeId}
 *   onValueChange={(v) => setAssigneeId(v)}
 *   renderOption={(option, selected) => (
 *     <span className="flex items-center gap-ds-03">
 *       <Avatar size="xs"><AvatarFallback>{option.label[0]}</AvatarFallback></Avatar>
 *       {option.label}
 *     </span>
 *   )}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
interface ComboboxBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  triggerClassName?: string
  /** Max visible items in the dropdown before scroll (default 6) */
  maxVisible?: number
  renderOption?: (option: ComboboxOption, selected: boolean) => React.ReactNode
}

interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value?: string
  onValueChange: (value: string) => void
}

interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  value?: string[]
  onValueChange: (value: string[]) => void
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/** Max pills shown in the trigger before "+N more" overflow */
const MAX_VISIBLE_PILLS = 2

/** Approximate height of a single option item in px */
const ITEM_HEIGHT_PX = 36

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found',
      multiple = false,
      disabled = false,
      className,
      triggerClassName,
      maxVisible = 6,
      renderOption,
      ...rest
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const searchInputRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLUListElement>(null)
    const optionIdPrefix = React.useId()
    const listboxId = React.useId()

    const selectedValues = React.useMemo<string[]>(() => {
      if (value === undefined || value === null) return []
      if (Array.isArray(value)) return value
      return [value]
    }, [value])

    const filteredOptions = React.useMemo(
      () =>
        search
          ? options.filter((o) =>
              o.label.toLowerCase().includes(search.toLowerCase()),
            )
          : options,
      [options, search],
    )

    const isSelected = React.useCallback(
      (optionValue: string) => selectedValues.includes(optionValue),
      [selectedValues],
    )

    const handleSelect = React.useCallback(
      (optionValue: string) => {
        if (multiple) {
          const newValue = selectedValues.includes(optionValue)
            ? selectedValues.filter((v) => v !== optionValue)
            : [...selectedValues, optionValue]
          ;(onValueChange as (value: string[]) => void)(newValue)
        } else {
          ;(onValueChange as (value: string) => void)(optionValue)
          setOpen(false)
        }
      },
      [multiple, selectedValues, onValueChange],
    )

    const handleRemovePill = React.useCallback(
      (e: React.SyntheticEvent, optionValue: string) => {
        e.stopPropagation()
        e.preventDefault()
        const newValue = selectedValues.filter((v) => v !== optionValue)
        ;(onValueChange as (value: string[]) => void)(newValue)
      },
      [selectedValues, onValueChange],
    )

    const handleOpenChange = React.useCallback(
      (nextOpen: boolean) => {
        if (disabled) return
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearch('')
          setHighlightedIndex(-1)
        }
      },
      [disabled],
    )

    // Auto-focus search input when popover opens
    React.useEffect(() => {
      if (open) {
        // Use a small timeout to allow the popover to render
        const timer = setTimeout(() => {
          searchInputRef.current?.focus()
        }, 0)
        return () => clearTimeout(timer)
      }
    }, [open])

    const findNextEnabledIndex = React.useCallback(
      (currentIndex: number, direction: 1 | -1): number => {
        const len = filteredOptions.length
        if (len === 0) return -1

        let nextIndex = currentIndex + direction
        while (nextIndex >= 0 && nextIndex < len) {
          if (!filteredOptions[nextIndex].disabled) return nextIndex
          nextIndex += direction
        }
        return currentIndex
      },
      [filteredOptions],
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault()
            const nextIdx = findNextEnabledIndex(highlightedIndex, 1)
            setHighlightedIndex(nextIdx)
            break
          }
          case 'ArrowUp': {
            e.preventDefault()
            const prevIdx = findNextEnabledIndex(highlightedIndex, -1)
            setHighlightedIndex(prevIdx)
            break
          }
          case 'Home': {
            e.preventDefault()
            const firstEnabled = filteredOptions.findIndex((o) => !o.disabled)
            setHighlightedIndex(firstEnabled)
            break
          }
          case 'End': {
            e.preventDefault()
            let lastEnabled = -1
            for (let i = filteredOptions.length - 1; i >= 0; i--) {
              if (!filteredOptions[i].disabled) {
                lastEnabled = i
                break
              }
            }
            setHighlightedIndex(lastEnabled)
            break
          }
          case 'Enter': {
            e.preventDefault()
            if (
              highlightedIndex >= 0 &&
              highlightedIndex < filteredOptions.length &&
              !filteredOptions[highlightedIndex].disabled
            ) {
              handleSelect(filteredOptions[highlightedIndex].value)
            }
            break
          }
          case 'Escape': {
            e.preventDefault()
            setOpen(false)
            setSearch('')
            setHighlightedIndex(-1)
            break
          }
        }
      },
      [highlightedIndex, filteredOptions, findNextEnabledIndex, handleSelect],
    )

    // Scroll highlighted option into view
    React.useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const optionEl = listRef.current.children[highlightedIndex] as HTMLElement
        if (optionEl) {
          optionEl.scrollIntoView?.({ block: 'nearest' })
        }
      }
    }, [highlightedIndex])

    const getSelectedLabel = React.useCallback(() => {
      if (selectedValues.length === 0) return null
      const option = options.find((o) => o.value === selectedValues[0])
      return option?.label ?? null
    }, [selectedValues, options])

    const renderTriggerContent = () => {
      if (multiple && selectedValues.length > 0) {
        const visiblePills = selectedValues.slice(0, MAX_VISIBLE_PILLS)
        const remaining = selectedValues.length - MAX_VISIBLE_PILLS

        return (
          <span className="flex flex-1 flex-wrap items-center gap-ds-02 overflow-hidden">
            {visiblePills.map((val) => {
              const option = options.find((o) => o.value === val)
              if (!option) return null
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-ds-01 rounded-ds-md bg-interactive-subtle px-ds-03 py-[1px] text-ds-sm"
                >
                  {option.label}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-ds-full outline-none hover:opacity-75"
                    onClick={(e) => handleRemovePill(e, val)}
                    aria-label={`Remove ${option.label}`}
                    tabIndex={-1}
                  >
                    <IconX className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              )
            })}
            {remaining > 0 && (
              <span className="text-ds-sm text-text-secondary">
                +{remaining} more
              </span>
            )}
          </span>
        )
      }

      if (!multiple && selectedValues.length === 1) {
        const label = getSelectedLabel()
        if (label) {
          return <span className="flex-1 truncate text-left">{label}</span>
        }
      }

      return (
        <span className="flex-1 truncate text-left text-text-placeholder">
          {placeholder}
        </span>
      )
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <div className={cn('relative', className)} {...rest}>
        <PopoverPrimitive.Trigger asChild disabled={disabled}>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            aria-label={placeholder}
            disabled={disabled}
            className={cn(
              'flex h-ds-md w-full items-center justify-between whitespace-nowrap rounded-ds-md border border-border bg-field px-ds-04 py-ds-03 text-ds-md',
              'transition-colors duration-fast-01',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:border-border-interactive',
              'disabled:cursor-not-allowed disabled:opacity-[0.38]',
              triggerClassName,
            )}
          >
            {renderTriggerContent()}
            <IconChevronDown className={cn("ml-ds-02 h-ico-sm w-ico-sm shrink-0 opacity-[0.5] transition-transform duration-fast-01", open && 'rotate-180')} aria-hidden="true" />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={cn(
              'z-dropdown w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-ds-lg border border-border-subtle bg-layer-01 shadow-02',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            )}
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              searchInputRef.current?.focus()
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-ds-02 border-b border-border-subtle px-ds-04">
              <IconSearch className="h-ico-sm w-ico-sm shrink-0 text-text-tertiary" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                className="flex-1 bg-transparent py-ds-03 text-ds-md outline-none placeholder:text-text-placeholder"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={
                  highlightedIndex >= 0
                    ? `${optionIdPrefix}-option-${highlightedIndex}`
                    : undefined
                }
                aria-label="Search options"
              />
            </div>

            {/* Options list */}
            {filteredOptions.length === 0 ? (
              <div className="px-ds-04 py-ds-05 text-center text-ds-md text-text-tertiary">
                {emptyMessage}
              </div>
            ) : (
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                className="overflow-auto p-ds-02"
                style={{ maxHeight: `${maxVisible * ITEM_HEIGHT_PX}px` }}
              >
                {filteredOptions.map((option, index) => {
                  const selected = isSelected(option.value)
                  return (
                    <li
                      key={option.value}
                      id={`${optionIdPrefix}-option-${index}`}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={option.disabled || undefined}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center gap-ds-03 rounded-ds-md px-ds-04 py-ds-03 text-ds-md outline-none',
                        'transition-colors',
                        highlightedIndex === index &&
                          'bg-interactive-subtle',
                        selected && 'text-interactive',
                        option.disabled &&
                          'pointer-events-none opacity-[0.38]',
                      )}
                      onClick={() => {
                        if (!option.disabled) {
                          handleSelect(option.value)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!option.disabled && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          handleSelect(option.value)
                        }
                      }}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setHighlightedIndex(index)
                        }
                      }}
                    >
                      {option.icon && (
                        <span className="flex h-ico-sm w-ico-sm items-center justify-center shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <span className="flex flex-1 flex-col">
                        {renderOption ? (
                          renderOption(option, selected)
                        ) : (
                          <>
                            <span>{option.label}</span>
                            {option.description && (
                              <span className="text-ds-sm text-text-secondary">
                                {option.description}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                      {selected && (
                        <IconCheck className="h-ico-sm w-ico-sm shrink-0" aria-hidden="true" />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
        </div>
      </PopoverPrimitive.Root>
    )
  },
)
Combobox.displayName = 'Combobox'

export { Combobox }
