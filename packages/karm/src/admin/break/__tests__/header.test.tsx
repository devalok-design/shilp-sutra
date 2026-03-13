import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { BreakAdminHeader } from '../header'
import type { BreakAdminFilters } from '../header'

// Mock DropdownMenu
vi.mock('@/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  DropdownMenuItem: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; disabled?: boolean; onSelect?: () => void }) => (
    <div {...props}>{children}</div>
  ),
}))

const defaultFilters: BreakAdminFilters = {
  selectedAssociate: null,
  dateFilterStart: null,
  dateFilterEnd: null,
  currMonth: 2, // March
  currYear: 2026,
  isOpen: false,
}

const mockUsers = [
  {
    id: 'u1',
    name: 'Alice',
    email: 'alice@test.com',
    designation: 'Developer',
    image: null,
    role: 'Associate' as const,
    isActive: true,
    createdAt: '2026-01-01',
  },
]

describe('BreakAdminHeader', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <BreakAdminHeader
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BreakAdminHeader
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders Associate dropdown trigger', () => {
    render(
      <BreakAdminHeader
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(screen.getByText('Associate')).toBeInTheDocument()
  })

  it('renders Date dropdown trigger', () => {
    render(
      <BreakAdminHeader
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('renders current month name', () => {
    render(
      <BreakAdminHeader
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(screen.getByText('March')).toBeInTheDocument()
  })

  it('renders selected associate name when filter is active', () => {
    const filtersWithAssociate: BreakAdminFilters = {
      ...defaultFilters,
      selectedAssociate: mockUsers[0],
    }
    render(
      <BreakAdminHeader
        filters={filtersWithAssociate}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <BreakAdminHeader
        ref={ref}
        className="custom"
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        userImages={{}}
        users={mockUsers}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
