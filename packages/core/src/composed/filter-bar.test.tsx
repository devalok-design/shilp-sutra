import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FilterBar } from './filter-bar'

describe('FilterBar', () => {
  it('renders with toolbar role', () => {
    render(<FilterBar />)
    expect(screen.getByRole('toolbar', { name: 'Filters' })).toBeInTheDocument()
  })

  it('renders search input when onSearchChange is provided', () => {
    render(
      <FilterBar searchValue="" onSearchChange={vi.fn()} searchPlaceholder="Find..." />,
    )
    expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument()
  })

  it('does not render search input when onSearchChange is absent', () => {
    render(<FilterBar searchPlaceholder="Find..." />)
    expect(screen.queryByPlaceholderText('Find...')).not.toBeInTheDocument()
  })

  it('calls onSearchChange when typing in search', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(
      <FilterBar searchValue="" onSearchChange={onSearchChange} />,
    )
    await user.type(screen.getByPlaceholderText('Search...'), 'hello')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('renders children', () => {
    render(
      <FilterBar>
        <span>Custom filter</span>
      </FilterBar>,
    )
    expect(screen.getByText('Custom filter')).toBeInTheDocument()
  })

  it('renders clear all button when onClearAll is provided', () => {
    render(<FilterBar onClearAll={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
  })

  it('calls onClearAll when clear all button is clicked', async () => {
    const user = userEvent.setup()
    const onClearAll = vi.fn()
    render(<FilterBar onClearAll={onClearAll} />)
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })

  it('does not render clear all button when onClearAll is absent', () => {
    render(<FilterBar />)
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<FilterBar className="extra-class" />)
    expect(screen.getByRole('toolbar')).toHaveClass('extra-class')
  })
})
