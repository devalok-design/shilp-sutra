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

  it('shows +N more when pills exceed maxVisible (default 2)', () => {
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

  it('respects custom maxVisible for pills', () => {
    render(
      <Combobox
        options={fruits}
        value={['apple', 'banana', 'cherry', 'dragonfruit']}
        onChange={vi.fn()}
        multiple
        maxVisible={3}
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(within(trigger).getByText('Apple')).toBeInTheDocument()
    expect(within(trigger).getByText('Banana')).toBeInTheDocument()
    expect(within(trigger).getByText('Cherry')).toBeInTheDocument()
    expect(within(trigger).queryByText('Dragonfruit')).not.toBeInTheDocument()
    expect(within(trigger).getByText('+1 more')).toBeInTheDocument()
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
