import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axe } from 'vitest-axe'
import { AppSidebar } from './sidebar'
import { SidebarProvider } from '../ui/sidebar'
import type { NavGroup, NavItem, NavSubItem } from './sidebar'

// jsdom does not provide matchMedia — supply a stub for useMobile / useColorMode
beforeEach(() => {
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

// AppSidebar must be wrapped in SidebarProvider
function renderSidebar(props: React.ComponentProps<typeof AppSidebar>) {
  return render(
    <SidebarProvider defaultOpen>
      <AppSidebar {...props} />
    </SidebarProvider>,
  )
}

// Minimal icon stub
const TestIcon = () => <svg data-testid="icon" />

describe('AppSidebar', () => {
  it('renders nav groups', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

describe('S13 — content slots', () => {
  const baseProps = {
    navGroups: [
      {
        label: 'Main',
        items: [{ title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true }],
      },
    ],
  }

  it('renders headerSlot between user info and navigation', () => {
    renderSidebar({
      ...baseProps,
      user: { name: 'Test User' },
      headerSlot: <div data-testid="header-slot">Widget</div>,
    })
    expect(screen.getByTestId('header-slot')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  it('renders preFooterSlot between navigation and footer', () => {
    renderSidebar({
      ...baseProps,
      preFooterSlot: <div data-testid="pre-footer-slot">Banner</div>,
      footerLinks: [{ label: 'Terms', href: '/terms' }],
    })
    expect(screen.getByTestId('pre-footer-slot')).toBeInTheDocument()
    expect(screen.getByText('Banner')).toBeInTheDocument()
  })

  it('does not render extra DOM when slots are not provided', () => {
    const { container } = renderSidebar(baseProps)
    expect(container.querySelector('[data-testid="header-slot"]')).toBeNull()
    expect(container.querySelector('[data-testid="pre-footer-slot"]')).toBeNull()
  })
})

describe('S10 — badge', () => {
  it('renders a numeric badge on a nav item', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'My Tasks', href: '/tasks', icon: <TestIcon />, badge: 5 },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders a string badge on a nav item', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Messages', href: '/messages', icon: <TestIcon />, badge: 'New' },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('caps numeric badges at 99+', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Inbox', href: '/inbox', icon: <TestIcon />, badge: 150 },
        ],
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not render badge when not provided', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
      },
    ]
    const { container } = renderSidebar({ navGroups: groups })
    expect(container.querySelector('[data-sidebar="menu-badge"]')).toBeNull()
  })
})

describe('S11 — group action', () => {
  it('renders an action button next to the group label', () => {
    const groups: NavGroup[] = [
      {
        label: 'Projects',
        items: [{ title: 'All', href: '/projects', icon: <TestIcon /> }],
        action: <button aria-label="New project" data-testid="group-action">+</button>,
      },
    ]
    renderSidebar({ navGroups: groups })
    expect(screen.getByTestId('group-action')).toBeInTheDocument()
  })

  it('does not render group action when not provided', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
      },
    ]
    const { container } = renderSidebar({ navGroups: groups })
    expect(container.querySelector('[data-sidebar="group-action"]')).toBeNull()
  })
})

describe('S12 — structured footer', () => {
  const baseGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
    },
  ]

  it('renders footer with links separated by dividers', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: {
        links: [
          { label: 'Terms', href: '/terms' },
          { label: 'Privacy', href: '/privacy' },
        ],
      },
    })
    expect(screen.getByText('Terms')).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
  })

  it('renders footer version text', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: { version: 'v2.4.1' },
    })
    expect(screen.getByText('v2.4.1')).toBeInTheDocument()
  })

  it('renders footer slot content', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: {
        slot: <div data-testid="footer-slot">What's new?</div>,
        links: [{ label: 'Terms', href: '/terms' }],
      },
    })
    expect(screen.getByTestId('footer-slot')).toBeInTheDocument()
  })

  it('prefers footer over footerLinks when both provided', () => {
    renderSidebar({
      navGroups: baseGroups,
      footer: { version: 'v1.0' },
      footerLinks: [{ label: 'Old', href: '/old' }],
    })
    expect(screen.getByText('v1.0')).toBeInTheDocument()
    expect(screen.queryByText('Old')).toBeNull()
  })

  it('falls back to footerLinks when footer is not provided', () => {
    renderSidebar({
      navGroups: baseGroups,
      footerLinks: [{ label: 'Help', href: '/help' }],
    })
    expect(screen.getByText('Help')).toBeInTheDocument()
  })
})

describe('S14 — renderItem', () => {
  it('uses custom render when renderItem returns a ReactNode', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true },
          { title: 'Tasks', href: '/tasks', icon: <TestIcon /> },
        ],
      },
    ]
    renderSidebar({
      navGroups: groups,
      renderItem: (item, defaultRender) => {
        if (item.href === '/tasks') {
          return <div data-testid="custom-tasks">Custom: {item.title}</div>
        }
        return null
      },
    })
    expect(screen.getByTestId('custom-tasks')).toBeInTheDocument()
    expect(screen.getByText('Custom: Tasks')).toBeInTheDocument()
    // Dashboard should render with default
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('uses default render when renderItem returns null', () => {
    const groups: NavGroup[] = [
      {
        label: 'Main',
        items: [
          { title: 'Home', href: '/', icon: <TestIcon />, exact: true },
        ],
      },
    ]
    renderSidebar({
      navGroups: groups,
      renderItem: () => null,
    })
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})

describe('S9 — collapsible nav items', () => {
  const makeGroups = (items: NavItem[]): NavGroup[] => [
    { label: 'Work', items },
  ]

  it('renders child items when parent has children and is active', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
          { title: 'Website', href: '/projects/def/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/projects' })
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Karm V2')).toBeVisible()
    expect(screen.getByText('Website')).toBeVisible()
  })

  it('auto-expands when a child href matches currentPath', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
          { title: 'Website', href: '/projects/def/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/projects/abc/board' })
    expect(screen.getByText('Karm V2')).toBeVisible()
  })

  it('renders a chevron toggle button', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/projects' })
    const chevron = screen.getByRole('button', { name: /toggle projects/i })
    expect(chevron).toBeInTheDocument()
  })

  it('toggles children visibility on chevron click', async () => {
    const user = userEvent.setup()
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        defaultOpen: false,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
        ],
      },
    ])
    // currentPath does NOT match parent or child, so auto-expand won't kick in
    renderSidebar({ navGroups: groups, currentPath: '/' })
    const chevron = screen.getByRole('button', { name: /toggle projects/i })

    // Click to open
    await user.click(chevron)
    expect(screen.getByText('Karm V2')).toBeVisible()
  })

  it('parent link still navigates to href', () => {
    const groups = makeGroups([
      {
        title: 'Projects',
        href: '/projects',
        icon: <TestIcon />,
        children: [
          { title: 'Karm V2', href: '/projects/abc/board' },
        ],
      },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/' })
    const link = screen.getByRole('link', { name: /projects/i })
    expect(link).toHaveAttribute('href', '/projects')
  })

  it('renders nav items without children normally', () => {
    const groups = makeGroups([
      { title: 'Dashboard', href: '/', icon: <TestIcon />, exact: true },
    ])
    renderSidebar({ navGroups: groups, currentPath: '/' })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

describe('F1 — preFooterClassName', () => {
  const baseGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [{ title: 'Home', href: '/', icon: <TestIcon />, exact: true }],
    },
  ]

  it('applies preFooterClassName to the wrapper div around preFooterSlot', () => {
    renderSidebar({
      navGroups: baseGroups,
      preFooterSlot: <div data-testid="pre-footer-content">Content</div>,
      preFooterClassName: 'overflow-y-auto max-h-[200px]',
    })
    const content = screen.getByTestId('pre-footer-content')
    const wrapper = content.parentElement!
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.className).toBe('overflow-y-auto max-h-[200px]')
  })

  it('renders preFooterSlot in a wrapper div without className when preFooterClassName is omitted', () => {
    renderSidebar({
      navGroups: baseGroups,
      preFooterSlot: <div data-testid="pre-footer-content">Content</div>,
    })
    const content = screen.getByTestId('pre-footer-content')
    const wrapper = content.parentElement!
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.className).toBe('')
  })

  it('has no accessibility violations with preFooterClassName', async () => {
    const { container } = renderSidebar({
      navGroups: baseGroups,
      preFooterSlot: <div>Promo banner</div>,
      preFooterClassName: 'overflow-y-auto max-h-[200px]',
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
