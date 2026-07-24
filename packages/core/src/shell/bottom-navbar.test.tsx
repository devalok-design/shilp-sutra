import { IconBook, IconHome, IconSettings, IconShieldCheck } from '@tabler/icons-react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { BottomNavbar, type BottomNavbarUser,type BottomNavItem } from './bottom-navbar'

const primaryItems: BottomNavItem[] = [
  { title: 'Home', href: '/', icon: <IconHome />, exact: true },
  { title: 'Docs', href: '/docs', icon: <IconBook /> },
]

const moreItems: BottomNavItem[] = [
  { title: 'Settings', href: '/settings', icon: <IconSettings /> },
  { title: 'Admin', href: '/admin', icon: <IconShieldCheck />, roles: ['Admin'] },
]

const admin: BottomNavbarUser = { name: 'Aarav', role: 'Admin' }
const associate: BottomNavbarUser = { name: 'Priya', role: 'Associate' }

describeConformance('BottomNavbar', (props) => (
  <BottomNavbar primaryItems={primaryItems} {...props} />
))

describe('BottomNavbar', () => {
  it('renders primary items as links', () => {
    render(<BottomNavbar currentPath="/" primaryItems={primaryItems} />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument()
  })

  it('marks the active item with aria-current="page"', () => {
    render(<BottomNavbar currentPath="/docs" primaryItems={primaryItems} />)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('exact matching: "/" is only active on exact path', () => {
    render(<BottomNavbar currentPath="/docs" primaryItems={primaryItems} />)
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('renders a notification badge and caps at 99+', () => {
    render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[
          { title: 'Home', href: '/', icon: <IconHome />, badge: 3 },
          { title: 'Docs', href: '/docs', icon: <IconBook />, badge: 147 },
        ]}
      />,
    )
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('hides a zero/undefined badge', () => {
    render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[{ title: 'Home', href: '/', icon: <IconHome />, badge: 0 }]}
      />,
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  // ── Role gating ──────────────────────────────────────────────
  it('role-gated item is shown to a matching role', async () => {
    const user = userEvent.setup()
    render(<BottomNavbar currentPath="/" primaryItems={primaryItems} moreItems={moreItems} user={admin} />)
    await user.click(screen.getByRole('button', { name: 'More navigation options' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('link', { name: 'Admin' })).toBeInTheDocument()
  })

  it('role-gated item is hidden from a non-matching role', async () => {
    const user = userEvent.setup()
    render(<BottomNavbar currentPath="/" primaryItems={primaryItems} moreItems={moreItems} user={associate} />)
    await user.click(screen.getByRole('button', { name: 'More navigation options' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })

  it('role-gated item is hidden when there is no user', async () => {
    const user = userEvent.setup()
    render(<BottomNavbar currentPath="/" primaryItems={primaryItems} moreItems={moreItems} user={null} />)
    await user.click(screen.getByRole('button', { name: 'More navigation options' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
  })

  it('canView predicate overrides roles', () => {
    const canView = vi.fn(() => false)
    render(
      <BottomNavbar
        currentPath="/"
        primaryItems={[{ title: 'Secret', href: '/secret', icon: <IconShieldCheck />, canView }]}
        user={admin}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Secret' })).not.toBeInTheDocument()
    expect(canView).toHaveBeenCalledWith(admin)
  })

  // ── More sheet ───────────────────────────────────────────────
  it('opens the More sheet and closes it after selecting an item', async () => {
    const user = userEvent.setup()
    render(<BottomNavbar currentPath="/" primaryItems={primaryItems} moreItems={[moreItems[0]]} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'More navigation options' }))
    const dialog = await screen.findByRole('dialog')
    const settings = within(dialog).getByRole('link', { name: 'Settings' })
    await user.click(settings)
    // selecting an item requests close
    expect(await screen.findByRole('button', { name: 'More navigation options' })).toBeInTheDocument()
  })

  it('does not render a More button when there are no (visible) overflow items', () => {
    render(<BottomNavbar currentPath="/" primaryItems={primaryItems} moreItems={[]} />)
    expect(screen.queryByRole('button', { name: 'More navigation options' })).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BottomNavbar currentPath="/" primaryItems={primaryItems} moreItems={moreItems} user={admin} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
