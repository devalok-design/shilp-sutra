import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
} from './table'
import { TableRowLink } from './table-row-link'

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
    expect(row).toHaveClass('border-b', 'border-surface-border-subtle', 'hover:bg-surface-panel-hover')
  })

  it('selected rows have an explicit selected+hover step (accent-4)', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const row = screen.getAllByRole('row')[0]
    expect(row).toHaveClass('data-[state=selected]:bg-accent-3', 'data-[state=selected]:hover:bg-accent-4')
  })

  it('footer is a surface-base band, not a translucent raised wash', () => {
    render(
      <Table>
        <TableFooter data-testid="tfoot">
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    const tfoot = screen.getByTestId('tfoot')
    expect(tfoot).toHaveClass('bg-surface-base', 'border-t', 'border-surface-border-subtle')
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

  it('header cells are quieter than data — text-body-sm muted, density-tracked padding', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    expect(screen.getByRole('columnheader')).toHaveClass('text-body-sm', 'font-medium', 'text-surface-fg-muted', 'py-(--table-py)')
  })

  describe('numeric', () => {
    it('right-aligns cells with tabular figures; header follows', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead numeric>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell numeric>₹80,000</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      expect(screen.getByRole('columnheader')).toHaveClass('text-right')
      expect(screen.getByRole('cell')).toHaveClass('text-right', 'tabular-nums')
    })
  })

  describe('TableRowActions', () => {
    it('is hidden until row hover/focus but stays permanently in the tab order (opacity reveal)', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <TableRowActions data-testid="actions">
                  <button type="button">Delete</button>
                </TableRowActions>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const actions = screen.getByTestId('actions')
      expect(actions).toHaveClass(
        'opacity-0',
        'group-hover/row:opacity-100',
        'group-focus-within/row:opacity-100',
        'pointer-coarse:opacity-100',
      )
      // reveal is opacity-based — the button must be focusable at all times
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('persist keeps actions always visible', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <TableRowActions data-testid="actions" persist>
                  <button type="button">Delete</button>
                </TableRowActions>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      expect(screen.getByTestId('actions')).toHaveClass('opacity-100')
      expect(screen.getByTestId('actions')).not.toHaveClass('opacity-0')
    })
  })

  describe('TableRowLink', () => {
    it('renders a real anchor with the row-link slot marker and full-row stretch', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="relative">
                <TableRowLink href="/projects/1">Karm v2</TableRowLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const link = screen.getByRole('link', { name: 'Karm v2' })
      expect(link).toHaveAttribute('href', '/projects/1')
      expect(link).toHaveAttribute('data-slot', 'row-link')
      expect(link).toHaveClass('after:absolute', 'after:w-[100vw]')
      // row draws the focus ring; the anchor suppresses its own
      expect(link).toHaveClass('focus-visible:outline-hidden')
    })

    it('stretch={false} renders a plain title link with its own focus ring', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <TableRowLink href="/projects/1" stretch={false}>Karm v2</TableRowLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const link = screen.getByRole('link', { name: 'Karm v2' })
      expect(link).not.toHaveClass('after:absolute')
      expect(link).toHaveClass('focus-visible:outline-2')
    })
  })
})
