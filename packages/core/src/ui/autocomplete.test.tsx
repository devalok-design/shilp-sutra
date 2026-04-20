import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import type { AutocompleteOption } from './autocomplete'
import { Autocomplete } from './autocomplete'

const cities: AutocompleteOption[] = [
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'kolkata', label: 'Kolkata' },
]

describe('Autocomplete', () => {
  // ── Basic rendering ────────────────────────────────────────────────────────
  it('renders input with combobox role', () => {
    render(<Autocomplete options={cities} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders input with placeholder', () => {
    render(<Autocomplete options={cities} placeholder="Search cities..." />)
    expect(screen.getByPlaceholderText('Search cities...')).toBeInTheDocument()
  })

  it('opens dropdown on focus and shows all options', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    await user.click(screen.getByRole('combobox'))

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(cities.length)
  })

  // ── Filtering ──────────────────────────────────────────────────────────────
  it('filters options as user types', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'mum')

    expect(screen.getByRole('option', { name: 'Mumbai' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Delhi' })).not.toBeInTheDocument()
  })

  it('filtering is case-insensitive', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'DELHI')

    expect(screen.getByRole('option', { name: 'Delhi' })).toBeInTheDocument()
  })

  // ── Selection ──────────────────────────────────────────────────────────────
  it('selects option on click and fires onValueChange', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Autocomplete options={cities} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Delhi' }))

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'delhi', label: 'Delhi' }),
    )
  })

  it('updates input text after selection', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Bangalore' }))

    expect(screen.getByRole('combobox')).toHaveValue('Bangalore')
  })

  // ── Empty state ────────────────────────────────────────────────────────────
  it('shows empty text when no options match', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} emptyText="No cities found" />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'zzz')

    expect(screen.getByText('No cities found')).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('shows default empty text', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'zzz')

    expect(screen.getByText('No options')).toBeInTheDocument()
  })

  // ── Keyboard navigation ────────────────────────────────────────────────────
  it('navigates with ArrowDown and selects with Enter', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Autocomplete options={cities} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'mumbai' }),
    )
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    // AnimatePresence exit animation keeps the element briefly; wait for removal
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  // ── ARIA attributes ────────────────────────────────────────────────────────
  it('sets aria-expanded based on dropdown state', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={cities} />)

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('sets aria-autocomplete="list"', () => {
    render(<Autocomplete options={cities} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list')
  })

  // ── Disabled ───────────────────────────────────────────────────────────────
  it('renders disabled state', () => {
    render(<Autocomplete options={cities} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  // ── a11y ───────────────────────────────────────────────────────────────────
  it('has no a11y violations', async () => {
    const { container } = render(
      <Autocomplete options={cities} placeholder="Search cities..." />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
