import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { PaginationNav, generatePagination } from './pagination'

describe('generatePagination', () => {
  it('returns all pages when total is small', () => {
    expect(generatePagination(1, 5, 1)).toEqual([1, 2, 3, 4, 5])
  })

  it('returns all pages when total equals totalSlots', () => {
    // siblingCount=1 => totalSlots = 1*2+5 = 7
    expect(generatePagination(4, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('shows right ellipsis when current is near the start', () => {
    const result = generatePagination(2, 10, 1)
    // leftCount = 1*2+3 = 5, so [1,2,3,4,5,'ellipsis',10]
    expect(result).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
  })

  it('shows left ellipsis when current is near the end', () => {
    const result = generatePagination(9, 10, 1)
    // rightCount = 1*2+3 = 5, so [1,'ellipsis',6,7,8,9,10]
    expect(result).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10])
  })

  it('shows both ellipses when current is in the middle', () => {
    const result = generatePagination(5, 10, 1)
    // [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
    expect(result).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
  })

  it('respects siblingCount=2', () => {
    const result = generatePagination(10, 20, 2)
    // [1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20]
    expect(result).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20])
  })

  it('handles single page', () => {
    expect(generatePagination(1, 1, 1)).toEqual([1])
  })

  it('handles two pages', () => {
    expect(generatePagination(1, 2, 1)).toEqual([1, 2])
  })
})

describe('PaginationNav', () => {
  it('renders correct page numbers', () => {
    render(
      <PaginationNav
        totalPages={5}
        currentPage={3}
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('marks current page as active with aria-current', () => {
    render(
      <PaginationNav
        totalPages={5}
        currentPage={3}
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByText('3').closest('button')).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('1').closest('button')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('calls onPageChange when a page number is clicked', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PaginationNav
        totalPages={5}
        currentPage={1}
        onPageChange={onPageChange}
      />,
    )

    await user.click(screen.getByText('3'))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange with next page on Next click', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PaginationNav
        totalPages={5}
        currentPage={2}
        onPageChange={onPageChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Go to next page' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange with previous page on Previous click', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PaginationNav
        totalPages={5}
        currentPage={3}
        onPageChange={onPageChange}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' }),
    )

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Previous button on first page', () => {
    render(
      <PaginationNav
        totalPages={5}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(
      <PaginationNav
        totalPages={5}
        currentPage={5}
        onPageChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toBeDisabled()
  })

  it('does not go below page 1 when Previous is clicked on page 1', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PaginationNav
        totalPages={5}
        currentPage={1}
        onPageChange={onPageChange}
      />,
    )

    // The button is disabled, so click will not fire
    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' }),
    )

    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('does not go above totalPages when Next is clicked on last page', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PaginationNav
        totalPages={5}
        currentPage={5}
        onPageChange={onPageChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Go to next page' }))

    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('renders ellipsis for large page counts', () => {
    render(
      <PaginationNav
        totalPages={20}
        currentPage={10}
        onPageChange={vi.fn()}
      />,
    )

    // Should show "More pages" sr-only text for ellipsis elements
    const ellipses = screen.getAllByText('More pages')
    expect(ellipses.length).toBeGreaterThanOrEqual(1)
  })

  it('renders navigation landmark with aria-label', () => {
    render(
      <PaginationNav
        totalPages={5}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null }
    render(
      <PaginationNav
        ref={ref as React.Ref<HTMLElement>}
        totalPages={5}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('NAV')
  })

  it('merges custom className', () => {
    render(
      <PaginationNav
        totalPages={5}
        currentPage={1}
        onPageChange={vi.fn()}
        className="my-pagination"
      />,
    )

    expect(
      screen.getByRole('navigation').classList.contains('my-pagination'),
    ).toBe(true)
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <PaginationNav
        totalPages={10}
        currentPage={5}
        onPageChange={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
