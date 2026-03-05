import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Autocomplete } from '../autocomplete'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

describe('Autocomplete', () => {
  it('renders input', () => {
    render(<Autocomplete options={options} placeholder="Search fruits" />)
    expect(screen.getByPlaceholderText('Search fruits')).toBeInTheDocument()
  })

  it('shows options on focus', () => {
    render(<Autocomplete options={options} placeholder="Search" />)
    fireEvent.focus(screen.getByPlaceholderText('Search'))
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('filters options on input', () => {
    render(<Autocomplete options={options} placeholder="Search" />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ban' } })
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
  })

  it('calls onValueChange when option selected', () => {
    const onValueChange = vi.fn()
    render(<Autocomplete options={options} placeholder="Search" onValueChange={onValueChange} />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.focus(input)
    fireEvent.click(screen.getByText('Banana'))
    expect(onValueChange).toHaveBeenCalledWith({ label: 'Banana', value: 'banana' })
  })

  it('shows empty state when no results', () => {
    render(<Autocomplete options={options} placeholder="Search" emptyText="No results" />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'xyz' } })
    expect(screen.getByText('No results')).toBeInTheDocument()
  })
})
