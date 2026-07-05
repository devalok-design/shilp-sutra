import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

describe('Table', () => {
  const renderTable = () =>
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

  it('renders a table element', () => {
    renderTable()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders column headers with scope="col"', () => {
    renderTable()
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(2)
    headers.forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col')
    })
  })

  it('renders table cells with correct content', () => {
    renderTable()
    expect(screen.getByRole('cell', { name: 'Alice' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'alice@example.com' })).toBeInTheDocument()
  })

  it('renders rows in header and body', () => {
    renderTable()
    const rows = screen.getAllByRole('row')
    // 1 header row + 1 body row
    expect(rows).toHaveLength(2)
  })

  it('merges custom className on Table', () => {
    render(
      <Table className="my-custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveClass('my-custom-table')
  })

  it('has no a11y violations', async () => {
    const { container } = renderTable()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('rows carry a hairline border and a visible (raised-hover) hover wash', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const row = screen.getAllByRole('row')[0]
    expect(row).toHaveClass('border-b', 'border-surface-border-subtle', 'hover:bg-surface-raised-hover')
  })

  it('density defaults to standard and sets --table-py; cells read it', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveClass('[--table-py:var(--spacing-ds-03)]')
    expect(screen.getByRole('cell')).toHaveClass('py-(--table-py)', 'px-ds-04')
  })

  it('density="compact" and "comfortable" reassign the variable', () => {
    const { rerender } = render(<Table density="compact"><TableBody><TableRow><TableCell>C</TableCell></TableRow></TableBody></Table>)
    expect(screen.getByRole('table')).toHaveClass('[--table-py:var(--spacing-ds-02)]')
    rerender(<Table density="comfortable"><TableBody><TableRow><TableCell>C</TableCell></TableRow></TableBody></Table>)
    expect(screen.getByRole('table')).toHaveClass('[--table-py:var(--spacing-ds-04)]')
  })

  it('edge cells read --table-edge so tables align with card slots', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveClass('[--table-edge:var(--card-spacing,var(--spacing-ds-04))]')
    expect(screen.getByRole('cell')).toHaveClass('first:pl-(--table-edge)', 'last:pr-(--table-edge)')
  })

  it('striped is opt-in — zebra class only when set', () => {
    const { rerender } = render(<Table><TableBody><TableRow><TableCell>C</TableCell></TableRow></TableBody></Table>)
    expect(screen.getByRole('table')).not.toHaveClass('[&_tbody_tr:nth-child(even)]:bg-surface-base')
    rerender(<Table striped><TableBody><TableRow><TableCell>C</TableCell></TableRow></TableBody></Table>)
    expect(screen.getByRole('table')).toHaveClass('[&_tbody_tr:nth-child(even)]:bg-surface-base')
  })

  it('header cells are quieter than data — text-ds-sm muted, density-tracked padding', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    expect(screen.getByRole('columnheader')).toHaveClass('text-ds-sm', 'font-medium', 'text-surface-fg-muted', 'py-(--table-py)')
  })
})
