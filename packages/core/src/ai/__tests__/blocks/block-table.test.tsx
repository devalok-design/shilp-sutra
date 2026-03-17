import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { BlockTable } from '../../blocks/block-table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', variant: 'badge' as const },
  { key: 'count', label: 'Count', variant: 'number' as const },
]

const rows = [
  { id: '1', name: 'Alpha', status: 'Active', count: 42 },
  { id: '2', name: 'Beta', status: { label: 'Paused', color: 'warning' }, count: 7 },
  { id: '3', name: 'Gamma', status: 'Done', count: 100 },
]

describe('BlockTable', () => {
  it('renders column headers', () => {
    render(<BlockTable data={{ columns, rows }} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()
  })

  it('renders row data in cells', () => {
    render(<BlockTable data={{ columns, rows }} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders caption when provided', () => {
    render(
      <BlockTable data={{ columns, rows, caption: 'Summary of projects' }} />,
    )
    expect(screen.getByText('Summary of projects')).toBeInTheDocument()
  })

  it('badge variant column renders Badge component', () => {
    render(<BlockTable data={{ columns, rows }} />)
    // String badge value
    const activeBadge = screen.getByText('Active')
    expect(activeBadge.tagName).toBe('SPAN')
    expect(activeBadge.className).toContain('inline-flex')

    // Object badge value with label
    const pausedBadge = screen.getByText('Paused')
    expect(pausedBadge.tagName).toBe('SPAN')
    expect(pausedBadge.className).toContain('inline-flex')
  })

  it('number variant column has right-aligned text', () => {
    render(<BlockTable data={{ columns, rows }} />)
    const cell42 = screen.getByText('42')
    const td = cell42.closest('td')
    expect(td?.className).toContain('text-right')
    expect(td?.className).toContain('tabular-nums')
    expect(td?.className).toContain('font-medium')
  })

  it('sortable: clicking header sorts rows', async () => {
    const user = userEvent.setup()
    render(
      <BlockTable data={{ columns, rows, sortable: true }} />,
    )

    const table = screen.getByRole('table')
    const tbody = within(table).getAllByRole('rowgroup')[1]

    // Before sort: Alpha, Beta, Gamma
    let cells = within(tbody).getAllByRole('row')
    expect(within(cells[0]).getByText('Alpha')).toBeInTheDocument()
    expect(within(cells[1]).getByText('Beta')).toBeInTheDocument()
    expect(within(cells[2]).getByText('Gamma')).toBeInTheDocument()

    // Click Name header -> asc sort (already alphabetical)
    await user.click(screen.getByText('Name'))

    cells = within(tbody).getAllByRole('row')
    expect(within(cells[0]).getByText('Alpha')).toBeInTheDocument()
    expect(within(cells[2]).getByText('Gamma')).toBeInTheDocument()

    // Click again -> desc sort
    await user.click(screen.getByText('Name'))

    cells = within(tbody).getAllByRole('row')
    expect(within(cells[0]).getByText('Gamma')).toBeInTheDocument()
    expect(within(cells[2]).getByText('Alpha')).toBeInTheDocument()
  })

  it('has role="table"', () => {
    render(<BlockTable data={{ columns, rows }} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('does not crash with empty rows', () => {
    render(<BlockTable data={{ columns, rows: [] }} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('does not crash with empty columns', () => {
    render(<BlockTable data={{ columns: [], rows }} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
