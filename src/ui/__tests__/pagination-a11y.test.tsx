import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import {
  PaginationNav,
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../pagination'

describe('PaginationNav accessibility', () => {
  it('should have no violations with PaginationNav wrapper', async () => {
    const { container } = render(
      <PaginationNav
        totalPages={10}
        currentPage={5}
        onPageChange={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations on first page', async () => {
    const { container } = render(
      <PaginationNav
        totalPages={10}
        currentPage={1}
        onPageChange={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations on last page', async () => {
    const { container } = render(
      <PaginationNav
        totalPages={10}
        currentPage={10}
        onPageChange={() => {}}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('Pagination primitives accessibility', () => {
  it('should have no violations with manual composition', async () => {
    const { container } = render(
      <PaginationRoot>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => {}} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>10</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
