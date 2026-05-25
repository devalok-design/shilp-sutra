import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { BoardSkeleton, CardSkeleton, ListSkeleton,TableSkeleton } from './loading-skeleton'

describeConformance('CardSkeleton', (props) => <CardSkeleton {...props} />)
describeConformance('TableSkeleton', (props) => <TableSkeleton {...props} />)
describeConformance('ListSkeleton', (props) => <ListSkeleton {...props} />)
describeConformance('BoardSkeleton', (props) => <BoardSkeleton {...props} />)

describe('TableSkeleton', () => {
  it('renders default 5 rows and 4 columns', () => {
    const { container } = render(<TableSkeleton />)
    // Header row + 5 data rows = 6 child divs
    const rows = container.querySelectorAll('[class*="flex items-center gap"]')
    expect(rows.length).toBe(6) // 1 header + 5 body rows
  })

  it('respects custom rows and columns', () => {
    const { container } = render(<TableSkeleton rows={3} columns={2} />)
    // Header + 3 body rows = 4 rows total, each with 2 skeleton cells
    const rows = container.querySelectorAll('[class*="flex items-center gap"]')
    expect(rows.length).toBe(4)
  })

  it('merges custom className', () => {
    const { container } = render(<TableSkeleton className="my-table" />)
    expect(container.firstElementChild).toHaveClass('my-table')
  })
})

describe('BoardSkeleton', () => {
  it('renders default 4 columns', () => {
    const { container } = render(<BoardSkeleton />)
    const columns = container.querySelectorAll('[class*="w-[272px]"]')
    expect(columns.length).toBe(4)
  })

  it('respects custom columns and cardsPerColumn', () => {
    const { container } = render(<BoardSkeleton columns={2} cardsPerColumn={2} />)
    const columns = container.querySelectorAll('[class*="w-[272px]"]')
    expect(columns.length).toBe(2)
  })

  it('merges custom className', () => {
    const { container } = render(<BoardSkeleton className="my-board" />)
    expect(container.firstElementChild).toHaveClass('my-board')
  })
})

describe('ListSkeleton', () => {
  it('renders default 6 rows', () => {
    const { container } = render(<ListSkeleton />)
    // Each row has a border-b except the last
    const rows = container.querySelectorAll('[class*="flex items-center gap-ds-04"]')
    expect(rows.length).toBe(6)
  })

  it('renders avatars by default (shrink-0 rounded circles)', () => {
    const { container } = render(<ListSkeleton rows={2} />)
    const avatars = container.querySelectorAll('[class*="shrink-0"][class*="rounded-pill"]')
    expect(avatars.length).toBe(2)
  })

  it('hides avatars when showAvatar is false', () => {
    const { container } = render(<ListSkeleton showAvatar={false} rows={2} />)
    const avatars = container.querySelectorAll('[class*="shrink-0"][class*="rounded-pill"]')
    expect(avatars.length).toBe(0)
  })

  it('respects custom rows', () => {
    const { container } = render(<ListSkeleton rows={3} />)
    const rows = container.querySelectorAll('[class*="flex items-center gap-ds-04"]')
    expect(rows.length).toBe(3)
  })

  it('merges custom className', () => {
    const { container } = render(<ListSkeleton className="my-list" />)
    expect(container.firstElementChild).toHaveClass('my-list')
  })
})
