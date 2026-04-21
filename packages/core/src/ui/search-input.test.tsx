import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { SearchInput } from './search-input'

describeConformance(
  'SearchInput',
  (props) => <SearchInput aria-label="Search" {...props} />,
)

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders search icon', () => {
    const { container } = render(<SearchInput placeholder="Search" />)
    // The IconSearch is aria-hidden, find the SVG in the container
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
  })

  it('handles value change', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SearchInput placeholder="Search" value="" onChange={onChange} />,
    )

    await user.type(screen.getByPlaceholderText('Search'), 'hello')

    expect(onChange).toHaveBeenCalled()
  })

  it('shows clear button when value is present and onClear is provided', () => {
    render(
      <SearchInput
        placeholder="Search"
        value="query"
        onClear={vi.fn()}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('does not show clear button when value is empty', () => {
    render(
      <SearchInput
        placeholder="Search"
        value=""
        onClear={vi.fn()}
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('does not show clear button when onClear is not provided', () => {
    render(
      <SearchInput
        placeholder="Search"
        value="query"
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', async () => {
    const onClear = vi.fn()
    const user = userEvent.setup()
    render(
      <SearchInput
        placeholder="Search"
        value="query"
        onClear={onClear}
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(onClear).toHaveBeenCalledOnce()
  })

  it('renders disabled state', () => {
    render(<SearchInput placeholder="Search" disabled />)
    expect(screen.getByPlaceholderText('Search')).toBeDisabled()
  })

  it('shows loading spinner instead of clear button when loading', () => {
    render(
      <SearchInput
        placeholder="Search"
        value="query"
        onClear={vi.fn()}
        loading
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search')).toHaveAttribute('aria-busy', 'true')
  })

})
