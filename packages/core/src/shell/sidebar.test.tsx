import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppSidebar } from './sidebar'
import { SidebarProvider } from '../ui/sidebar'
import type { NavGroup, NavItem } from './sidebar'

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
