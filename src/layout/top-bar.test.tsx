import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the sidebar module to avoid SidebarContext dependency
vi.mock('../ui/sidebar', () => ({
  SidebarTrigger: ({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
    <button className={className} {...props} data-testid="sidebar-trigger">
      Toggle Sidebar
    </button>
  ),
}))

// Mock the tooltip to avoid Radix portal/provider issues in tests
vi.mock('../ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & Record<string, unknown>) => (
    asChild ? <>{children}</> : <span {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span role="tooltip">{children}</span>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock the dropdown menu to simplify testing
vi.mock('../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & Record<string, unknown>) => (
    asChild ? <>{children}</> : <span {...props}>{children}</span>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void } & Record<string, unknown>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}))

import TopBar from './top-bar'

describe('TopBar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders without crashing', () => {
    const { container } = render(<TopBar />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('displays the page title', () => {
    render(<TopBar pageTitle="Dashboard" />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders user name when user is provided', () => {
    render(
      <TopBar
        user={{ name: 'Jane Doe', email: 'jane@example.com' }}
      />,
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('calls onSearchClick when search button is clicked', async () => {
    const user = userEvent.setup()
    const onSearchClick = vi.fn()
    render(<TopBar onSearchClick={onSearchClick} />)

    // The search button renders a Search icon inside a <button>
    const searchButtons = screen.getAllByRole('button')
    // The first visible button after sidebar trigger is the search button
    const searchBtn = searchButtons.find(
      (btn) => !btn.getAttribute('data-testid'),
    )
    expect(searchBtn).toBeDefined()
    await user.click(searchBtn!)
    expect(onSearchClick).toHaveBeenCalledOnce()
  })

  it('merges custom className', () => {
    const { container } = render(<TopBar className="custom-topbar" />)
    expect(container.firstElementChild).toHaveClass('custom-topbar')
  })
})
