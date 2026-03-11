import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { BottomNavbar } from '../bottom-navbar'

const HomeIcon = () => <svg data-testid="home-icon"><rect /></svg>
const ChatIcon = () => <svg data-testid="chat-icon"><rect /></svg>

const baseItems = [
  { title: 'Home', href: '/', icon: <HomeIcon />, exact: true },
  { title: 'Chat', href: '/chat', icon: <ChatIcon /> },
]

describe('BottomNavbar badge', () => {
  it('renders badge with count', () => {
    const items = [
      { ...baseItems[0], badge: 5 },
      baseItems[1],
    ]
    render(<BottomNavbar primaryItems={items} currentPath="/" />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByLabelText('5 notifications')).toBeInTheDocument()
  })

  it('shows 99+ for counts over 99', () => {
    const items = [
      { ...baseItems[0], badge: 150 },
      baseItems[1],
    ]
    render(<BottomNavbar primaryItems={items} currentPath="/" />)
    expect(screen.getByText('99+')).toBeInTheDocument()
    expect(screen.getByLabelText('150 notifications')).toBeInTheDocument()
  })

  it('shows 99+ for exactly 100', () => {
    const items = [
      { ...baseItems[0], badge: 100 },
      baseItems[1],
    ]
    render(<BottomNavbar primaryItems={items} currentPath="/" />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('shows exact count for 99', () => {
    const items = [
      { ...baseItems[0], badge: 99 },
      baseItems[1],
    ]
    render(<BottomNavbar primaryItems={items} currentPath="/" />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('does not render badge when count is 0', () => {
    const items = [
      { ...baseItems[0], badge: 0 },
      baseItems[1],
    ]
    render(<BottomNavbar primaryItems={items} currentPath="/" />)
    expect(screen.queryByLabelText(/notifications/)).not.toBeInTheDocument()
  })

  it('does not render badge when badge is undefined', () => {
    render(<BottomNavbar primaryItems={baseItems} currentPath="/" />)
    expect(screen.queryByLabelText(/notifications/)).not.toBeInTheDocument()
  })

  it('should have no a11y violations with badges', async () => {
    const items = [
      { ...baseItems[0], badge: 5 },
      { ...baseItems[1], badge: 120 },
    ]
    const { container } = render(
      <BottomNavbar primaryItems={items} currentPath="/" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
