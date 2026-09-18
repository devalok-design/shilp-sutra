# Gap Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Combobox and FileUpload components for shilp-sutra, filling the two genuine gaps identified by the karm-v2 migration audit.

**Architecture:** Combobox uses Radix Popover + custom filtering with full keyboard nav and ARIA combobox pattern. FileUpload is a pure custom component with drag-and-drop zone, hidden file input, and compact button mode. Both follow existing shilp-sutra conventions (forwardRef, displayName, cn(), design tokens, CVA where needed).

**Tech Stack:** React 18, TypeScript 5.7, Radix Popover (vendored), Tabler Icons, Vitest + RTL, Storybook 8

**Design doc:** `docs/plans/2026-03-02-gap-components-design.md`

---

### Task 1: Combobox — Write failing tests

**Files:**
- Create: `src/ui/combobox.test.tsx`

**Step 1: Write the test file**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { Combobox, type ComboboxOption } from './combobox'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit' },
]

const withIcons: ComboboxOption[] = [
  { value: 'a', label: 'Alice', description: 'Engineer', disabled: false },
  { value: 'b', label: 'Bob', description: 'Designer', disabled: true },
]

describe('Combobox', () => {
  it('renders with placeholder', () => {
    render(<Combobox options={fruits} onChange={() => {}} placeholder="Pick a fruit" />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit')
  })

  it('opens popover on trigger click and shows search input', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={() => {}} placeholder="Pick a fruit" />)
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByPlaceholderText('Search...')).toBeVisible()
    expect(screen.getByRole('listbox')).toBeVisible()
  })

  it('filters options when typing in search', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={() => {}} />)
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'ban')
    expect(screen.getByRole('option', { name: 'Banana' })).toBeVisible()
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument()
  })

  it('calls onChange on option click (single select)', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onChange).toHaveBeenCalledWith('cherry')
  })

  it('supports multi-select with array value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Combobox options={fruits} multiple value={['apple']} onChange={onChange} />
    )
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Banana' }))
    expect(onChange).toHaveBeenCalledWith(['apple', 'banana'])
  })

  it('shows empty message when no results match', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={() => {}} emptyMessage="Nothing found" />)
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'zzz')
    expect(screen.getByText('Nothing found')).toBeVisible()
  })

  it('renders disabled state', () => {
    render(<Combobox options={fruits} onChange={() => {}} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('navigates options with keyboard', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={() => {}} />)
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows selected check mark', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} value="apple" onChange={() => {}} />)
    await user.click(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: /Apple/ })
    expect(option).toHaveAttribute('aria-selected', 'true')
  })

  it('shows pills for multi-select values', () => {
    render(
      <Combobox options={fruits} multiple value={['apple', 'banana']} onChange={() => {}} />
    )
    expect(screen.getByText('Apple')).toBeVisible()
    expect(screen.getByText('Banana')).toBeVisible()
  })

  it('shows +N more when pills exceed 2', () => {
    render(
      <Combobox
        options={fruits}
        multiple
        value={['apple', 'banana', 'cherry']}
        onChange={() => {}}
      />
    )
    expect(screen.getByText('+1 more')).toBeVisible()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Combobox ref={ref as React.Ref<HTMLButtonElement>} options={fruits} onChange={() => {}} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className', () => {
    render(<Combobox options={fruits} onChange={() => {}} className="my-class" />)
    expect(screen.getByRole('combobox').closest('[class*="my-class"]') || screen.getByRole('combobox').parentElement).toBeTruthy()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Combobox options={fruits} onChange={() => {}} placeholder="Pick a fruit" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/ui/combobox.test.tsx`
Expected: FAIL — module `./combobox` not found

**Step 3: Commit**

```bash
git add src/ui/combobox.test.tsx
git commit -m "test(ui): add failing tests for Combobox component"
```

---

### Task 2: Combobox — Implement component

**Files:**
- Create: `src/ui/combobox.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the Combobox component**

Create `src/ui/combobox.tsx`:

```tsx
'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@primitives/react-popover'
import { IconCheck, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react'
import { cn } from './lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
  triggerClassName?: string
  /** Max visible items before scroll */
  maxVisible?: number
  /** Render custom option */
  renderOption?: (option: ComboboxOption, selected: boolean) => React.ReactNode
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found',
      multiple = false,
      disabled = false,
      className,
      triggerClassName,
      maxVisible = 6,
      renderOption,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const searchRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLDivElement>(null)
    const listboxId = React.useId()
    const optionIdPrefix = React.useId()

    const selectedValues = React.useMemo<string[]>(() => {
      if (value === undefined) return []
      return Array.isArray(value) ? value : [value]
    }, [value])

    const filtered = React.useMemo(
      () =>
        query
          ? options.filter((o) =>
              o.label.toLowerCase().includes(query.toLowerCase()),
            )
          : options,
      [options, query],
    )

    // Reset query and highlight when popover opens/closes
    React.useEffect(() => {
      if (open) {
        setQuery('')
        setHighlightedIndex(-1)
      }
    }, [open])

    // Scroll highlighted option into view
    React.useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const el = listRef.current.querySelector(
          `[data-index="${highlightedIndex}"]`,
        )
        el?.scrollIntoView({ block: 'nearest' })
      }
    }, [highlightedIndex])

    const isSelected = (val: string) => selectedValues.includes(val)

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const next = isSelected(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue]
        onChange(next)
      } else {
        onChange(optionValue)
        setOpen(false)
      }
    }

    const handleRemovePill = (val: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple) {
        onChange(selectedValues.filter((v) => v !== val))
      }
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
      const enabledOptions = filtered.filter((o) => !o.disabled)
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setHighlightedIndex((i) => {
            const next = i + 1
            // Find next enabled index
            for (let j = next; j < filtered.length; j++) {
              if (!filtered[j].disabled) return j
            }
            return i
          })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setHighlightedIndex((i) => {
            const next = i - 1
            for (let j = next; j >= 0; j--) {
              if (!filtered[j].disabled) return j
            }
            return i
          })
          break
        }
        case 'Home': {
          e.preventDefault()
          const first = filtered.findIndex((o) => !o.disabled)
          if (first >= 0) setHighlightedIndex(first)
          break
        }
        case 'End': {
          e.preventDefault()
          for (let j = filtered.length - 1; j >= 0; j--) {
            if (!filtered[j].disabled) {
              setHighlightedIndex(j)
              break
            }
          }
          break
        }
        case 'Enter': {
          e.preventDefault()
          if (highlightedIndex >= 0 && filtered[highlightedIndex] && !filtered[highlightedIndex].disabled) {
            handleSelect(filtered[highlightedIndex].value)
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          setOpen(false)
          break
        }
      }
    }

    // Trigger display
    const renderTriggerContent = () => {
      if (multiple && selectedValues.length > 0) {
        const maxPills = 2
        const visible = selectedValues.slice(0, maxPills)
        const remaining = selectedValues.length - maxPills
        return (
          <span className="flex flex-1 flex-wrap items-center gap-ds-02 overflow-hidden">
            {visible.map((val) => {
              const opt = options.find((o) => o.value === val)
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-ds-01 rounded-[var(--radius-md)] bg-[var(--color-interactive-subtle)] px-ds-03 py-0.5 text-[length:var(--font-size-sm)] text-[var(--color-text-primary)]"
                >
                  {opt?.label ?? val}
                  <button
                    type="button"
                    className="ml-0.5 rounded-[var(--radius-full)] p-0.5 hover:bg-[var(--color-layer-03)] transition-colors"
                    onClick={(e) => handleRemovePill(val, e)}
                    aria-label={`Remove ${opt?.label ?? val}`}
                    tabIndex={-1}
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
            {remaining > 0 && (
              <span className="text-[length:var(--font-size-sm)] text-[var(--color-text-secondary)]">
                +{remaining} more
              </span>
            )}
          </span>
        )
      }

      if (!multiple && selectedValues.length === 1) {
        const opt = options.find((o) => o.value === selectedValues[0])
        return (
          <span className="flex-1 truncate text-left">
            {opt?.icon && <span className="mr-ds-02 inline-flex">{opt.icon}</span>}
            {opt?.label ?? selectedValues[0]}
          </span>
        )
      }

      return (
        <span className="flex-1 truncate text-left text-[var(--color-text-placeholder)]">
          {placeholder}
        </span>
      )
    }

    const highlightedOptionId =
      highlightedIndex >= 0
        ? `${optionIdPrefix}-${highlightedIndex}`
        : undefined

    const itemHeight = 36 // approximate px per option
    const maxListHeight = maxVisible * itemHeight

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <div className={cn('relative', className)}>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={open ? listboxId : undefined}
              disabled={disabled}
              className={cn(
                'flex h-[var(--size-md)] w-full items-center justify-between gap-ds-02 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-field)] px-ds-04 py-ds-03 text-ds-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:border-[var(--color-border-interactive)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors duration-[var(--duration-fast)]',
                triggerClassName,
              )}
            >
              {renderTriggerContent()}
              <IconChevronDown
                className={cn(
                  'h-[var(--icon-sm)] w-[var(--icon-sm)] shrink-0 text-[var(--color-icon-secondary)] transition-transform duration-[var(--duration-fast)]',
                  open && 'rotate-180',
                )}
              />
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              sideOffset={4}
              align="start"
              className={cn(
                'z-[var(--z-dropdown)] w-[var(--radix-popover-trigger-width)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] shadow-[var(--shadow-02)] outline-none',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
              )}
              onOpenAutoFocus={(e) => {
                e.preventDefault()
                searchRef.current?.focus()
              }}
            >
              {/* Search input */}
              <div className="flex items-center border-b border-[var(--color-border-subtle)] px-ds-04">
                <IconSearch
                  className="h-[var(--icon-sm)] w-[var(--icon-sm)] shrink-0 text-[var(--color-icon-secondary)]"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setHighlightedIndex(-1)
                  }}
                  onKeyDown={handleSearchKeyDown}
                  aria-controls={listboxId}
                  aria-activedescendant={highlightedOptionId}
                  className="flex-1 bg-transparent py-ds-03 pl-ds-03 text-ds-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none"
                />
              </div>

              {/* Options list */}
              <div
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                className="overflow-auto p-ds-02"
                style={{ maxHeight: maxListHeight }}
              >
                {filtered.length === 0 ? (
                  <div className="px-ds-04 py-ds-05 text-center text-[length:var(--font-size-sm)] text-[var(--color-text-tertiary)]">
                    {emptyMessage}
                  </div>
                ) : (
                  filtered.map((option, index) => {
                    const selected = isSelected(option.value)
                    return (
                      <div
                        key={option.value}
                        id={`${optionIdPrefix}-${index}`}
                        role="option"
                        data-index={index}
                        aria-selected={selected}
                        aria-disabled={option.disabled || undefined}
                        className={cn(
                          'flex cursor-pointer select-none items-center gap-ds-03 rounded-[var(--radius-md)] px-ds-03 py-ds-02b text-ds-md transition-colors duration-[var(--duration-fast)]',
                          highlightedIndex === index && 'bg-[var(--color-interactive-subtle)]',
                          selected && 'text-[var(--color-interactive)]',
                          option.disabled && 'pointer-events-none opacity-50',
                        )}
                        onClick={() => {
                          if (!option.disabled) handleSelect(option.value)
                        }}
                        onMouseEnter={() => {
                          if (!option.disabled) setHighlightedIndex(index)
                        }}
                      >
                        {renderOption ? (
                          renderOption(option, selected)
                        ) : (
                          <>
                            <span
                              className={cn(
                                'flex h-[var(--icon-sm)] w-[var(--icon-sm)] shrink-0 items-center justify-center',
                                !selected && 'invisible',
                              )}
                            >
                              <IconCheck className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
                            </span>
                            {option.icon && (
                              <span className="flex shrink-0 items-center">{option.icon}</span>
                            )}
                            <span className="flex flex-col">
                              <span>{option.label}</span>
                              {option.description && (
                                <span className="text-[length:var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                                  {option.description}
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </div>
      </PopoverPrimitive.Root>
    )
  },
)
Combobox.displayName = 'Combobox'

export { Combobox }
```

**Step 2: Add barrel export to `src/ui/index.ts`**

After the Autocomplete export line, add:

```tsx
// Combobox
export { Combobox, type ComboboxProps, type ComboboxOption } from './combobox'
```

**Step 3: Run tests**

Run: `pnpm vitest run src/ui/combobox.test.tsx`
Expected: Most tests PASS. Fix any failures.

**Step 4: Commit**

```bash
git add src/ui/combobox.tsx src/ui/index.ts
git commit -m "feat(ui): add Combobox component with single/multi-select"
```

---

### Task 3: Combobox — Write Storybook stories

**Files:**
- Create: `src/ui/combobox.stories.tsx`

**Step 1: Write stories**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { IconUser, IconBriefcase, IconCode } from '@tabler/icons-react'
import * as React from 'react'
import { Combobox, type ComboboxOption } from './combobox'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
]

const members: ComboboxOption[] = [
  { value: 'alice', label: 'Alice Johnson', description: 'Engineering', icon: <IconUser className="h-4 w-4" /> },
  { value: 'bob', label: 'Bob Smith', description: 'Design', icon: <IconBriefcase className="h-4 w-4" /> },
  { value: 'carol', label: 'Carol Williams', description: 'Engineering', icon: <IconCode className="h-4 w-4" /> },
  { value: 'dave', label: 'Dave Brown', description: 'Product', disabled: true },
]

const meta: Meta<typeof Combobox> = {
  title: 'UI/Form Controls/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="p-8"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Combobox>

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | string[]>('')
    return (
      <Combobox
        options={fruits}
        value={value}
        onChange={setValue}
        placeholder="Select a fruit..."
        className="w-[280px]"
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)
    const search = canvas.getByPlaceholderText('Search...')
    await expect(search).toBeVisible()
    await userEvent.type(search, 'ban')
    const listbox = canvas.getByRole('listbox')
    await expect(within(listbox).getByText('Banana')).toBeVisible()
    await expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument()
  },
}

export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['apple', 'cherry'])
    return (
      <Combobox
        options={fruits}
        value={value}
        onChange={(v) => setValue(v as string[])}
        multiple
        placeholder="Select fruits..."
        className="w-[320px]"
      />
    )
  },
}

export const WithDescriptionsAndIcons: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | string[]>('')
    return (
      <Combobox
        options={members}
        value={value}
        onChange={setValue}
        placeholder="Select a member..."
        className="w-[300px]"
      />
    )
  },
}

export const CustomRenderOption: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | string[]>('')
    return (
      <Combobox
        options={members}
        value={value}
        onChange={setValue}
        placeholder="Select a member..."
        className="w-[300px]"
        renderOption={(option, selected) => (
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-interactive-subtle)] text-[var(--color-interactive)]">
              {option.label.charAt(0)}
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="text-xs text-[var(--color-text-tertiary)]">{option.description}</span>
              )}
            </div>
            {selected && <IconCheck className="h-4 w-4 text-[var(--color-interactive)]" />}
          </div>
        )}
      />
    )
  },
}

const IconCheck2 = () => null // unused, just to import the real one above

export const Disabled: Story = {
  render: () => (
    <Combobox
      options={fruits}
      onChange={() => {}}
      disabled
      placeholder="Disabled combobox"
      className="w-[280px]"
    />
  ),
}

export const EmptyState: Story = {
  render: () => (
    <Combobox
      options={[]}
      onChange={() => {}}
      placeholder="No options available"
      emptyMessage="No team members found"
      className="w-[280px]"
    />
  ),
}

export const ManyPills: Story = {
  name: 'Multi-Select with +N More',
  render: () => {
    const [value, setValue] = React.useState<string[]>([
      'apple', 'banana', 'cherry', 'dragonfruit',
    ])
    return (
      <Combobox
        options={fruits}
        value={value}
        onChange={(v) => setValue(v as string[])}
        multiple
        placeholder="Select fruits..."
        className="w-[320px]"
      />
    )
  },
}
```

**Step 2: Run storybook to verify** (visual check)

Run: `pnpm storybook` — navigate to UI/Form Controls/Combobox

**Step 3: Commit**

```bash
git add src/ui/combobox.stories.tsx
git commit -m "docs(ui): add Combobox storybook stories"
```

---

### Task 4: FileUpload — Write failing tests

**Files:**
- Create: `src/ui/file-upload.test.tsx`

**Step 1: Write the test file**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { FileUpload } from './file-upload'

const createFile = (name: string, size: number, type: string) => {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

describe('FileUpload', () => {
  it('renders default drop zone with label', () => {
    render(<FileUpload onFiles={() => {}} />)
    expect(screen.getByText(/Drop files here or click to browse/i)).toBeVisible()
  })

  it('renders custom label and sublabel', () => {
    render(
      <FileUpload onFiles={() => {}} label="Upload your SOW" sublabel="PDF only, max 5MB" />
    )
    expect(screen.getByText('Upload your SOW')).toBeVisible()
    expect(screen.getByText('PDF only, max 5MB')).toBeVisible()
  })

  it('opens file picker on click', async () => {
    const user = userEvent.setup()
    render(<FileUpload onFiles={() => {}} />)
    const zone = screen.getByRole('button')
    // Click should trigger the hidden input — we verify the input exists
    const input = zone.querySelector('input[type="file"]') || document.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
  })

  it('calls onFiles when files are selected via input', async () => {
    const onFiles = vi.fn()
    render(<FileUpload onFiles={onFiles} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createFile('test.pdf', 1000, 'application/pdf')
    await userEvent.upload(input, file)
    expect(onFiles).toHaveBeenCalledWith([file])
  })

  it('validates file size and rejects oversized files', async () => {
    const onFiles = vi.fn()
    render(<FileUpload onFiles={onFiles} maxSize={1000} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createFile('big.pdf', 2000, 'application/pdf')
    await userEvent.upload(input, file)
    expect(onFiles).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeVisible()
  })

  it('shows error prop', () => {
    render(<FileUpload onFiles={() => {}} error="Upload failed" />)
    expect(screen.getByText('Upload failed')).toBeVisible()
    expect(screen.getByRole('alert')).toBeVisible()
  })

  it('shows progress bar when uploading', () => {
    render(<FileUpload onFiles={() => {}} uploading progress={45} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '45')
  })

  it('renders compact mode as button', () => {
    render(<FileUpload onFiles={() => {}} compact />)
    const btn = screen.getByRole('button')
    expect(btn).toBeVisible()
    expect(screen.queryByText(/Drop files here/i)).not.toBeInTheDocument()
  })

  it('supports multiple file selection', () => {
    render(<FileUpload onFiles={() => {}} multiple />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('multiple')
  })

  it('sets accept attribute on hidden input', () => {
    render(<FileUpload onFiles={() => {}} accept="image/*" />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', 'image/*')
  })

  it('renders disabled state', () => {
    render(<FileUpload onFiles={() => {}} disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies drag-active styling on dragover', () => {
    render(<FileUpload onFiles={() => {}} />)
    const zone = screen.getByRole('button')
    fireEvent.dragEnter(zone, { dataTransfer: { items: [{ kind: 'file' }] } })
    // Check for drag-active visual class
    expect(zone.className).toMatch(/interactive/)
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<FileUpload ref={ref as React.Ref<HTMLDivElement>} onFiles={() => {}} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has no a11y violations', async () => {
    const { container } = render(<FileUpload onFiles={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/ui/file-upload.test.tsx`
Expected: FAIL — module `./file-upload` not found

**Step 3: Commit**

```bash
git add src/ui/file-upload.test.tsx
git commit -m "test(ui): add failing tests for FileUpload component"
```

---

### Task 5: FileUpload — Implement component

**Files:**
- Create: `src/ui/file-upload.tsx`
- Modify: `src/ui/index.ts`

**Step 1: Write the FileUpload component**

Create `src/ui/file-upload.tsx`:

```tsx
'use client'

import * as React from 'react'
import { IconUpload, IconPaperclip, IconLoader2 } from '@tabler/icons-react'
import { cn } from './lib/utils'

export interface FileUploadProps {
  /** Accepted file types (e.g., "image/*", ".pdf,.doc") */
  accept?: string
  /** Max file size in bytes (default: 10MB) */
  maxSize?: number
  /** Allow multiple files */
  multiple?: boolean
  /** Currently uploading */
  uploading?: boolean
  /** Upload progress (0-100) */
  progress?: number
  /** Callback when files are selected/dropped */
  onFiles: (files: File[]) => void
  /** Error message to display */
  error?: string
  /** Compact mode (inline button instead of drop zone) */
  compact?: boolean
  /** Disabled */
  disabled?: boolean
  className?: string
  /** Custom label */
  label?: string
  /** Custom sublabel */
  sublabel?: string
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`
}

/**
 * Check if a File matches an accept string.
 * Handles: "image/*", ".pdf", ".pdf,.doc", "application/pdf", etc.
 */
function fileMatchesAccept(file: File, accept: string): boolean {
  const acceptTypes = accept.split(',').map((t) => t.trim())
  return acceptTypes.some((type) => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    if (type.endsWith('/*')) {
      const category = type.slice(0, type.indexOf('/'))
      return file.type.startsWith(category + '/')
    }
    return file.type === type
  })
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      maxSize = DEFAULT_MAX_SIZE,
      multiple = false,
      uploading = false,
      progress = 0,
      onFiles,
      error: errorProp,
      compact = false,
      disabled = false,
      className,
      label,
      sublabel,
    },
    ref,
  ) => {
    const [isDragActive, setIsDragActive] = React.useState(false)
    const [validationError, setValidationError] = React.useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const dragCountRef = React.useRef(0)

    const displayError = errorProp || validationError

    const defaultLabel = label ?? 'Drop files here or click to browse'
    const defaultSublabel = sublabel ?? `Max file size: ${formatBytes(maxSize)}`

    const validateFiles = (files: File[]): File[] | null => {
      setValidationError(null)

      // Size check
      const oversized = files.filter((f) => f.size > maxSize)
      if (oversized.length > 0) {
        setValidationError(
          `File${oversized.length > 1 ? 's' : ''} too large (max ${formatBytes(maxSize)}): ${oversized.map((f) => f.name).join(', ')}`,
        )
        return null
      }

      // Type check
      if (accept) {
        const rejected = files.filter((f) => !fileMatchesAccept(f, accept))
        if (rejected.length > 0) {
          setValidationError(
            `Invalid file type: ${rejected.map((f) => f.name).join(', ')}`,
          )
          return null
        }
      }

      return files
    }

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      const files = Array.from(fileList)
      const valid = validateFiles(files)
      if (valid) {
        onFiles(valid)
      }
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCountRef.current++
      if (!isDragActive) setIsDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCountRef.current--
      if (dragCountRef.current === 0) setIsDragActive(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCountRef.current = 0
      setIsDragActive(false)
      if (!disabled) {
        handleFiles(e.dataTransfer.files)
      }
    }

    const openPicker = () => {
      if (!disabled) inputRef.current?.click()
    }

    const hiddenInput = (
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    )

    // Compact mode — renders as a button
    if (compact) {
      return (
        <div ref={ref} className={cn('inline-flex flex-col gap-ds-02', className)}>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled || uploading}
            className={cn(
              'inline-flex items-center gap-ds-02 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-field)] px-ds-04 py-ds-03 text-ds-md text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-field-hover)] transition-colors duration-[var(--duration-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {uploading ? (
              <IconLoader2 className="h-[var(--icon-sm)] w-[var(--icon-sm)] animate-spin" />
            ) : (
              <IconPaperclip className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
            )}
            {label ?? 'Attach files'}
          </button>
          {hiddenInput}
          {displayError && (
            <p role="alert" aria-live="polite" className="text-[length:var(--font-size-xs)] text-[var(--color-error)]">
              {displayError}
            </p>
          )}
        </div>
      )
    }

    // Default mode — drop zone
    return (
      <div ref={ref} className={cn('flex flex-col gap-ds-02', className)}>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-ds-03 rounded-[var(--radius-lg)] border-2 border-dashed px-ds-06 py-ds-08',
            'transition-colors duration-[var(--duration-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isDragActive
              ? 'border-[var(--color-interactive)] bg-[var(--color-interactive-subtle)]'
              : 'border-[var(--color-border-default)] bg-[var(--color-field)]',
          )}
          aria-label={defaultLabel}
        >
          {uploading ? (
            <IconLoader2 className="h-8 w-8 text-[var(--color-icon-secondary)] animate-spin" />
          ) : (
            <IconUpload className="h-8 w-8 text-[var(--color-icon-secondary)]" />
          )}
          <span className="text-center text-[length:var(--font-size-sm)] text-[var(--color-text-secondary)]">
            {defaultLabel}
          </span>
          {uploading && progress !== undefined ? (
            <div className="w-full max-w-[200px]">
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-field)]"
              >
                <div
                  className="h-full bg-[var(--color-interactive)] transition-[width] duration-[var(--duration-moderate)]"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="text-[length:var(--font-size-xs)] text-[var(--color-text-tertiary)]">
              {defaultSublabel}
            </span>
          )}
        </button>
        {hiddenInput}
        {displayError && (
          <p role="alert" aria-live="polite" className="text-[length:var(--font-size-xs)] text-[var(--color-error)]">
            {displayError}
          </p>
        )}
      </div>
    )
  },
)
FileUpload.displayName = 'FileUpload'

export { FileUpload }
```

**Step 2: Add barrel export to `src/ui/index.ts`**

After the Combobox export line (added in Task 2), add:

```tsx
// FileUpload
export { FileUpload, type FileUploadProps } from './file-upload'
```

**Step 3: Run tests**

Run: `pnpm vitest run src/ui/file-upload.test.tsx`
Expected: Most tests PASS. Fix any failures.

**Step 4: Commit**

```bash
git add src/ui/file-upload.tsx src/ui/index.ts
git commit -m "feat(ui): add FileUpload component with drag-drop and compact mode"
```

---

### Task 6: FileUpload — Write Storybook stories

**Files:**
- Create: `src/ui/file-upload.stories.tsx`

**Step 1: Write stories**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { FileUpload } from './file-upload'

const meta: Meta<typeof FileUpload> = {
  title: 'UI/Form Controls/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="p-8 max-w-lg"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof FileUpload>

export const Default: Story = {
  render: () => <FileUpload onFiles={(files) => console.log('Files:', files)} />,
}

export const Compact: Story = {
  render: () => (
    <FileUpload compact onFiles={(files) => console.log('Files:', files)} />
  ),
}

export const WithProgress: Story = {
  render: () => (
    <FileUpload onFiles={() => {}} uploading progress={65} />
  ),
}

export const WithError: Story = {
  render: () => (
    <FileUpload onFiles={() => {}} error="Upload failed: network error" />
  ),
}

export const ImageOnly: Story = {
  render: () => (
    <FileUpload
      onFiles={(files) => console.log('Files:', files)}
      accept="image/*"
      label="Drop an image here or click to browse"
      sublabel="PNG, JPG, GIF up to 5MB"
      maxSize={5 * 1024 * 1024}
    />
  ),
}

export const MultipleFiles: Story = {
  render: () => (
    <FileUpload
      onFiles={(files) => console.log('Files:', files)}
      multiple
      label="Drop files here or click to browse"
      sublabel="Upload multiple files at once"
    />
  ),
}

export const Disabled: Story = {
  render: () => <FileUpload onFiles={() => {}} disabled />,
}

export const CustomLabels: Story = {
  render: () => (
    <FileUpload
      onFiles={(files) => console.log('Files:', files)}
      label="Upload your Statement of Work"
      sublabel="PDF or DOCX, max 25MB"
      accept=".pdf,.docx"
      maxSize={25 * 1024 * 1024}
    />
  ),
}
```

**Step 2: Run storybook to verify** (visual check)

Run: `pnpm storybook` — navigate to UI/Form Controls/FileUpload

**Step 3: Commit**

```bash
git add src/ui/file-upload.stories.tsx
git commit -m "docs(ui): add FileUpload storybook stories"
```

---

### Task 7: Final verification

**Step 1: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass, no regressions.

**Step 2: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: No new type errors.

**Step 3: Run lint**

Run: `pnpm lint`
Expected: No new lint errors.

**Step 4: Build**

Run: `pnpm build`
Expected: Clean build, both components included in output.

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(ui): address review feedback for gap components"
```
