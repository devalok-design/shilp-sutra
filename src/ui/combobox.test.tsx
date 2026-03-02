import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Combobox } from './combobox'
import type { ComboboxOption } from './combobox'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragonfruit' },
  { value: 'elderberry', label: 'Elderberry' },
]

describe('Combobox', () => {
  it('renders with placeholder', () => {
    render(<Combobox options={fruits} onChange={vi.fn()} placeholder="Pick a fruit" />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit')
  })

  it('opens popover on trigger click and shows search input', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} placeholder="Pick a fruit" />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(fruits.length)
  })

  it('filters options when typing in search', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'ban')

    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Cherry' })).not.toBeInTheDocument()
  })

  it('calls onChange on option click (single select)', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('supports multi-select with array value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        value={['apple']}
        onChange={onChange}
        multiple
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Cherry' }))

    expect(onChange).toHaveBeenCalledWith(['apple', 'cherry'])
  })

  it('deselects in multi-select when clicking selected option', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        value={['apple', 'banana']}
        onChange={onChange}
        multiple
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Banana' }))

    expect(onChange).toHaveBeenCalledWith(['apple'])
  })

  it('shows empty message when no results match', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        onChange={vi.fn()}
        emptyMessage="No fruits found"
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'xyz')

    expect(screen.getByText('No fruits found')).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('shows default empty message when none provided', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'xyz')

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<Combobox options={fruits} onChange={vi.fn()} disabled placeholder="Pick" />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('does not open popover when disabled', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} disabled />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('navigates options with keyboard (ArrowDown, Enter)', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    const searchInput = screen.getByPlaceholderText('Search...')

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('navigates options with ArrowUp', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('banana')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows selected check mark (aria-selected)', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} value="banana" onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    const bananaOption = screen.getByRole('option', { name: /Banana/ })
    expect(bananaOption).toHaveAttribute('aria-selected', 'true')

    const appleOption = screen.getByRole('option', { name: /Apple/ })
    expect(appleOption).toHaveAttribute('aria-selected', 'false')
  })

  it('shows pills for multi-select values', () => {
    render(
      <Combobox
        options={fruits}
        value={['apple', 'banana']}
        onChange={vi.fn()}
        multiple
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(within(trigger).getByText('Apple')).toBeInTheDocument()
    expect(within(trigger).getByText('Banana')).toBeInTheDocument()
  })

  it('shows +N more when pills exceed the fixed limit of 2', () => {
    render(
      <Combobox
        options={fruits}
        value={['apple', 'banana', 'cherry', 'dragonfruit']}
        onChange={vi.fn()}
        multiple
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(within(trigger).getByText('Apple')).toBeInTheDocument()
    expect(within(trigger).getByText('Banana')).toBeInTheDocument()
    expect(within(trigger).queryByText('Cherry')).not.toBeInTheDocument()
    expect(within(trigger).getByText('+2 more')).toBeInTheDocument()
  })

  it('pill limit stays at 2 even when maxVisible is larger', () => {
    render(
      <Combobox
        options={fruits}
        value={['apple', 'banana', 'cherry', 'dragonfruit']}
        onChange={vi.fn()}
        multiple
        maxVisible={10}
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(within(trigger).getByText('Apple')).toBeInTheDocument()
    expect(within(trigger).getByText('Banana')).toBeInTheDocument()
    expect(within(trigger).queryByText('Cherry')).not.toBeInTheDocument()
    expect(within(trigger).getByText('+2 more')).toBeInTheDocument()
  })

  it('forwards ref (HTMLButtonElement)', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(
      <Combobox
        ref={ref as React.Ref<HTMLButtonElement>}
        options={fruits}
        onChange={vi.fn()}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('applies custom className to trigger', () => {
    render(
      <Combobox
        options={fruits}
        onChange={vi.fn()}
        className="my-custom-class"
      />,
    )
    expect(screen.getByRole('combobox')).toHaveClass('my-custom-class')
  })

  it('applies triggerClassName to trigger element', () => {
    render(
      <Combobox
        options={fruits}
        onChange={vi.fn()}
        triggerClassName="trigger-custom"
      />,
    )
    expect(screen.getByRole('combobox')).toHaveClass('trigger-custom')
  })

  it('uses custom searchPlaceholder', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        onChange={vi.fn()}
        searchPlaceholder="Type to filter..."
      />,
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByPlaceholderText('Type to filter...')).toBeInTheDocument()
  })

  it('displays selected value label in trigger (single select)', () => {
    render(
      <Combobox
        options={fruits}
        value="cherry"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Cherry')
  })

  it('clears search input when popover reopens', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'ban')
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('')
    expect(screen.getAllByRole('option')).toHaveLength(fruits.length)
  })

  it('skips disabled options when navigating with ArrowDown', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const optionsWithDisabled: ComboboxOption[] = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Bravo', disabled: true },
      { value: 'c', label: 'Charlie' },
    ]
    render(<Combobox options={optionsWithDisabled} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))

    // ArrowDown from -1 -> 0 (Alpha), ArrowDown skips 1 (Bravo disabled) -> 2 (Charlie)
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('renders custom content via renderOption prop', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        onChange={vi.fn()}
        renderOption={(option) => (
          <span data-testid="custom-option">{option.label.toUpperCase()}</span>
        )}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    const customOptions = screen.getAllByTestId('custom-option')
    expect(customOptions).toHaveLength(fruits.length)
    expect(customOptions[0]).toHaveTextContent('APPLE')
  })

  it('navigates to first option with Home key', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))

    // Move down a few times, then press Home
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Home}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('apple')
  })

  it('navigates to last option with End key', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))

    await user.keyboard('{End}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('elderberry')
  })

  it('renders option icon when provided', async () => {
    const user = userEvent.setup()
    const optionsWithIcon: ComboboxOption[] = [
      { value: 'star', label: 'Star', icon: <span data-testid="star-icon">*</span> },
      { value: 'plain', label: 'Plain' },
    ]
    render(<Combobox options={optionsWithIcon} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByTestId('star-icon')).toBeInTheDocument()
  })

  it('renders option description when provided', async () => {
    const user = userEvent.setup()
    const optionsWithDesc: ComboboxOption[] = [
      { value: 'a', label: 'Alpha', description: 'First letter' },
      { value: 'b', label: 'Bravo' },
    ]
    render(<Combobox options={optionsWithDesc} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByText('First letter')).toBeInTheDocument()
  })

  it('removes pill via X button and calls onChange without that value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        value={['apple', 'banana']}
        onChange={onChange}
        multiple
      />,
    )

    const trigger = screen.getByRole('combobox')
    const removeApple = within(trigger).getByLabelText('Remove Apple')
    await user.click(removeApple)

    expect(onChange).toHaveBeenCalledWith(['banana'])
  })

  it('keeps popover open after selection in multi-select mode', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Combobox
        options={fruits}
        value={[]}
        onChange={onChange}
        multiple
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Apple' }))

    // Popover should still be open
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('closes popover after selection in single-select mode', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Apple' }))

    // Popover should close
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('sets aria-activedescendant on search input when option is highlighted', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    const searchInput = screen.getByPlaceholderText('Search...')

    // No highlight initially
    expect(searchInput).not.toHaveAttribute('aria-activedescendant')

    // Navigate down to first option
    await user.keyboard('{ArrowDown}')

    // Now aria-activedescendant should point to the first option's id
    const firstOption = screen.getAllByRole('option')[0]
    expect(searchInput).toHaveAttribute('aria-activedescendant', firstOption.id)
  })

  it('uses maxVisible to control listbox scroll height', async () => {
    const user = userEvent.setup()
    render(<Combobox options={fruits} onChange={vi.fn()} maxVisible={4} />)

    await user.click(screen.getByRole('combobox'))

    const listbox = screen.getByRole('listbox')
    // 4 items * 36px = 144px
    expect(listbox).toHaveStyle({ maxHeight: '144px' })
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Combobox
        options={fruits}
        onChange={vi.fn()}
        placeholder="Select a fruit"
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
