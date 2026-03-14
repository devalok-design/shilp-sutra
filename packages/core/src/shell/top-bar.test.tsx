import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
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

import { TopBar } from './top-bar'
import { SidebarTrigger } from '../ui/sidebar'

describe('TopBar', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')

    // jsdom does not provide matchMedia — supply a stub for useColorMode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('renders without crashing', () => {
    const { container } = render(
      <TopBar>
        <TopBar.Left>
          <TopBar.Title>Test</TopBar.Title>
        </TopBar.Left>
      </TopBar>,
    )
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TopBar>
        <TopBar.Left>
          <TopBar.Title>Dashboard</TopBar.Title>
        </TopBar.Left>
        <TopBar.Right>
          <TopBar.IconButton icon={<svg />} tooltip="Search" aria-label="Search" />
        </TopBar.Right>
      </TopBar>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('displays the page title via TopBar.Title', () => {
    render(
      <TopBar>
        <TopBar.Left>
          <TopBar.Title>Dashboard</TopBar.Title>
        </TopBar.Left>
      </TopBar>,
    )
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders user name when TopBar.UserMenu is provided', () => {
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.UserMenu
            user={{ name: 'Jane Doe', email: 'jane@example.com' }}
          />
        </TopBar.Right>
      </TopBar>,
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('calls onClick on TopBar.IconButton', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.IconButton icon={<svg />} tooltip="Search" aria-label="Search" onClick={onClick} />
        </TopBar.Right>
      </TopBar>,
    )
    await user.click(screen.getByLabelText('Search'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('merges custom className on root', () => {
    const { container } = render(
      <TopBar className="custom-topbar">
        <TopBar.Left><TopBar.Title>Test</TopBar.Title></TopBar.Left>
      </TopBar>,
    )
    expect(container.firstElementChild).toHaveClass('custom-topbar')
  })

  it('renders custom userMenuItems', () => {
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.UserMenu
            user={{ name: 'Test User' }}
            userMenuItems={[
              { label: 'Changelog', href: '/changelog' },
              { label: 'Shortcuts', onClick: vi.fn() },
            ]}
          />
        </TopBar.Right>
      </TopBar>,
    )
    expect(screen.getByText('Changelog')).toBeInTheDocument()
    expect(screen.getByText('Shortcuts')).toBeInTheDocument()
  })

  it('calls onNavigate when userMenuItem with href is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.UserMenu
            user={{ name: 'Test User' }}
            onNavigate={onNavigate}
            userMenuItems={[
              { label: 'Settings', href: '/settings' },
            ]}
          />
        </TopBar.Right>
      </TopBar>,
    )
    await user.click(screen.getByText('Settings'))
    expect(onNavigate).toHaveBeenCalledWith('/settings')
  })

  it('calls onClick when userMenuItem with onClick is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.UserMenu
            user={{ name: 'Test User' }}
            userMenuItems={[
              { label: 'Open Modal', onClick },
            ]}
          />
        </TopBar.Right>
      </TopBar>,
    )
    await user.click(screen.getByText('Open Modal'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders badge on userMenuItems', () => {
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.UserMenu
            user={{ name: 'Test User' }}
            userMenuItems={[
              { label: 'Updates', href: '/updates', badge: '3' },
              { label: 'New', href: '/new', badge: true },
            ]}
          />
        </TopBar.Right>
      </TopBar>,
    )
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Updates')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('uses grid layout when Center zone is present', () => {
    const { container } = render(
      <TopBar>
        <TopBar.Left><TopBar.Title>Left</TopBar.Title></TopBar.Left>
        <TopBar.Center><span>Center</span></TopBar.Center>
        <TopBar.Right><span>Right</span></TopBar.Right>
      </TopBar>,
    )
    expect(container.firstElementChild).toHaveClass('grid')
  })

  it('uses flex layout without Center zone', () => {
    const { container } = render(
      <TopBar>
        <TopBar.Left><TopBar.Title>Left</TopBar.Title></TopBar.Left>
        <TopBar.Right><span>Right</span></TopBar.Right>
      </TopBar>,
    )
    expect(container.firstElementChild).toHaveClass('flex')
    expect(container.firstElementChild).not.toHaveClass('grid')
  })

  it('renders multiple icon buttons in a section', () => {
    render(
      <TopBar>
        <TopBar.Right>
          <TopBar.Section gap="tight">
            <TopBar.IconButton icon={<svg />} tooltip="Search" aria-label="Search" />
            <TopBar.IconButton icon={<svg />} tooltip="Filter" aria-label="Filter" />
            <TopBar.IconButton icon={<svg />} tooltip="Export" aria-label="Export" />
          </TopBar.Section>
        </TopBar.Right>
      </TopBar>,
    )
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter')).toBeInTheDocument()
    expect(screen.getByLabelText('Export')).toBeInTheDocument()
  })

  it('applies correct gap class to TopBar.Section', () => {
    const { container } = render(
      <TopBar>
        <TopBar.Right>
          <TopBar.Section gap="tight" data-testid="section">
            <span>A</span>
          </TopBar.Section>
        </TopBar.Right>
      </TopBar>,
    )
    expect(screen.getByTestId('section')).toHaveClass('gap-ds-02')
  })
})
