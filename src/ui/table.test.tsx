import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
})
