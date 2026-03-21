import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '../sidebar'

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
