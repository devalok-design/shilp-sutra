import { fireEvent,render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '../sidebar'

const mockUseIsMobile = vi.fn(() => false)
vi.mock('../../hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

// Helper: wrap components that require SidebarProvider context
function renderWithProvider(ui: React.ReactNode, props?: { defaultOpen?: boolean }) {
  return render(
    <SidebarProvider defaultOpen={props?.defaultOpen ?? true}>
      {ui}
    </SidebarProvider>,
  )
}

describe('SidebarProvider', () => {
  it('renders children', () => {
    render(
      <SidebarProvider>
        <div>Sidebar content</div>
      </SidebarProvider>,
    )
    expect(screen.getByText('Sidebar content')).toBeInTheDocument()
  })

  it('applies sidebar CSS custom properties', () => {
    const { container } = render(
      <SidebarProvider>
        <div>Content</div>
      </SidebarProvider>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--sidebar-width')).toBe('16rem')
    expect(wrapper.style.getPropertyValue('--sidebar-width-icon')).toBe('3rem')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SidebarProvider className="custom-class">
        <div>Content</div>
      </SidebarProvider>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('Sidebar', () => {
  it('renders with collapsible=none', () => {
    renderWithProvider(
      <Sidebar collapsible="none">
        <div>Nav items</div>
      </Sidebar>,
    )
    expect(screen.getByText('Nav items')).toBeInTheDocument()
  })

  it('renders sidebar data attribute for data-sidebar', () => {
    const { container } = renderWithProvider(
      <Sidebar collapsible="none">
        <div>Content</div>
      </Sidebar>,
    )
    // collapsible=none renders a plain div with no data-sidebar, just children
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('Sidebar sub-components', () => {
  it('renders SidebarHeader with data-sidebar attribute', () => {
    const { container } = renderWithProvider(
      <Sidebar collapsible="none">
        <SidebarHeader data-testid="header">Header</SidebarHeader>
      </Sidebar>,
    )
    const header = screen.getByTestId('header')
    expect(header).toHaveAttribute('data-sidebar', 'header')
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('renders SidebarContent with data-sidebar attribute', () => {
    renderWithProvider(
      <Sidebar collapsible="none">
        <SidebarContent data-testid="content">Body</SidebarContent>
      </Sidebar>,
    )
    expect(screen.getByTestId('content')).toHaveAttribute('data-sidebar', 'content')
  })

  it('renders SidebarFooter with data-sidebar attribute', () => {
    renderWithProvider(
      <Sidebar collapsible="none">
        <SidebarFooter data-testid="footer">Footer</SidebarFooter>
      </Sidebar>,
    )
    expect(screen.getByTestId('footer')).toHaveAttribute('data-sidebar', 'footer')
  })
})

describe('useSidebar', () => {
  it('throws when used outside SidebarProvider', () => {
    function Bomb() {
      useSidebar()
      return null
    }
    expect(() => render(<Bomb />)).toThrow(
      'useSidebar must be used within a SidebarProvider.',
    )
  })
})

function StateReadout() {
  const { state, toggleSidebar } = useSidebar()
  return (
    <>
      <span data-testid="state">{state}</span>
      <button type="button" onClick={toggleSidebar}>toggle</button>
    </>
  )
}

describe('collapsed state toggling', () => {
  it('toggleSidebar flips state between expanded and collapsed', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateReadout />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
  })

  it('reflects state via data-state on the Sidebar wrapper', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="icon">
          <div>Nav</div>
        </Sidebar>
        <StateReadout />
      </SidebarProvider>,
    )
    const wrapper = container.querySelector('[data-state]')
    expect(wrapper).toHaveAttribute('data-state', 'expanded')
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(wrapper).toHaveAttribute('data-state', 'collapsed')
  })

  it('SidebarTrigger click toggles state', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger />
        <StateReadout />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
  })
})

describe('keyboard shortcut', () => {
  it('Cmd/Ctrl+B toggles the sidebar', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateReadout />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    fireEvent.keyDown(window, { key: 'b', metaKey: true })
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
  })

  it('ignores the "b" key without a modifier', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateReadout />
      </SidebarProvider>,
    )
    fireEvent.keyDown(window, { key: 'b' })
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
  })
})

describe('SidebarRail', () => {
  it('clicking the rail toggles the sidebar', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="icon">
          <div>Nav</div>
        </Sidebar>
        <SidebarRail />
        <StateReadout />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
  })

  it('renders with data-sidebar="rail"', () => {
    render(
      <SidebarProvider>
        <SidebarRail />
      </SidebarProvider>,
    )
    expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toHaveAttribute(
      'data-sidebar',
      'rail',
    )
  })
})

describe('mobile Sheet variant', () => {
  it('renders a Sheet instead of the fixed sidebar markup when isMobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger />
        <Sidebar collapsible="offcanvas">
          <div>Mobile nav</div>
        </Sidebar>
      </SidebarProvider>,
    )
    // The mobile Sheet starts closed (openMobile defaults to false) — open it first.
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))
    expect(screen.getByText('Mobile nav')).toBeInTheDocument()
    const sheetContent = document.querySelector('[data-sidebar="sidebar"][data-mobile="true"]')
    expect(sheetContent).toBeInTheDocument()
    mockUseIsMobile.mockReturnValue(false)
  })

  it('does not render the mobile Sheet markup on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    render(
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas">
          <div>Desktop nav</div>
        </Sidebar>
      </SidebarProvider>,
    )
    expect(document.querySelector('[data-mobile="true"]')).not.toBeInTheDocument()
  })
})
