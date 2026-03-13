import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <span>{children}</span>,
  PopoverContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="popover-content" className={className}>{children}</div>
  ),
}))

vi.mock('../ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <span>{children}</span>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span role="tooltip">{children}</span>
  ),
}))

import { NotificationCenter, type Notification } from './notification-center'

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n1',
  title: 'Test notification',
  body: 'Test body',
  tier: 'INFO',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('NotificationCenter', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <NotificationCenter notifications={[makeNotification()]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('does not call onNavigate when getNotificationRoute is not provided', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(
      <NotificationCenter
        notifications={[
          makeNotification({
            entityType: 'TASK',
            projectId: 'proj-1',
          }),
        ]}
        onNavigate={onNavigate}
      />,
    )

    await user.click(screen.getByText('Test notification'))
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('calls onNavigate with the path returned by getNotificationRoute', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const getNotificationRoute = vi.fn().mockReturnValue('/custom/route')

    render(
      <NotificationCenter
        notifications={[makeNotification()]}
        onNavigate={onNavigate}
        getNotificationRoute={getNotificationRoute}
      />,
    )

    await user.click(screen.getByText('Test notification'))
    expect(getNotificationRoute).toHaveBeenCalledOnce()
    expect(onNavigate).toHaveBeenCalledWith('/custom/route')
  })

  describe('footerSlot', () => {
    it('renders footer content when footerSlot is provided', () => {
      render(
        <NotificationCenter
          notifications={[]}
          footerSlot={<a href="/notifications">View all</a>}
        />,
      )
      expect(screen.getByText('View all')).toBeInTheDocument()
    })

    it('does not render footer when footerSlot is not provided', () => {
      render(<NotificationCenter notifications={[]} />)
      expect(screen.queryByText('View all')).not.toBeInTheDocument()
    })
  })

  describe('emptyState', () => {
    it('renders custom empty state when provided and notifications are empty', () => {
      render(
        <NotificationCenter
          notifications={[]}
          emptyState={<p>No unread notifications</p>}
        />,
      )
      expect(screen.getByText('No unread notifications')).toBeInTheDocument()
      expect(screen.queryByText('No notifications yet')).not.toBeInTheDocument()
    })

    it('renders default empty state when emptyState is not provided', () => {
      render(<NotificationCenter notifications={[]} />)
      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
    })
  })

  describe('headerActions', () => {
    it('renders header actions alongside mark-all-read', () => {
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
          onMarkAllRead={vi.fn()}
          headerActions={<button>Settings</button>}
        />,
      )
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Mark all read')).toBeInTheDocument()
    })

    it('renders header actions even when no unread notifications', () => {
      render(
        <NotificationCenter
          notifications={[makeNotification({ isRead: true })]}
          headerActions={<button>Settings</button>}
        />,
      )
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('popoverClassName', () => {
    it('merges custom className into popover content', () => {
      render(
        <NotificationCenter
          notifications={[]}
          popoverClassName="w-[500px] max-h-[600px]"
        />,
      )
      const popover = screen.getByTestId('popover-content')
      expect(popover).toHaveClass('w-[500px]')
      expect(popover).toHaveClass('max-h-[600px]')
    })
  })

  describe('onDismiss', () => {
    it('renders dismiss button when onDismiss is provided', () => {
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
          onDismiss={vi.fn()}
        />,
      )
      expect(screen.getByLabelText(/dismiss notification/i)).toBeInTheDocument()
    })

    it('does not render dismiss button when onDismiss is not provided', () => {
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
        />,
      )
      expect(screen.queryByLabelText(/dismiss notification/i)).not.toBeInTheDocument()
    })

    it('calls onDismiss with notification id when dismiss is clicked', async () => {
      const user = userEvent.setup()
      const onDismiss = vi.fn()
      render(
        <NotificationCenter
          notifications={[makeNotification({ id: 'n42' })]}
          onDismiss={onDismiss}
        />,
      )
      await user.click(screen.getByLabelText(/dismiss notification/i))
      expect(onDismiss).toHaveBeenCalledWith('n42')
    })

    it('does not trigger navigation when dismiss is clicked', async () => {
      const user = userEvent.setup()
      const onNavigate = vi.fn()
      const onDismiss = vi.fn()
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
          onNavigate={onNavigate}
          onDismiss={onDismiss}
          getNotificationRoute={() => '/some-route'}
        />,
      )
      await user.click(screen.getByLabelText(/dismiss notification/i))
      expect(onDismiss).toHaveBeenCalled()
      expect(onNavigate).not.toHaveBeenCalled()
    })

    it('activates notification via Enter key', async () => {
      const user = userEvent.setup()
      const onNavigate = vi.fn()
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
          onNavigate={onNavigate}
          getNotificationRoute={() => '/route'}
        />,
      )
      screen.getByText('Test notification').closest('[role="button"]')!.focus()
      await user.keyboard('{Enter}')
      expect(onNavigate).toHaveBeenCalledWith('/route')
    })

    it('notification row still navigates when clicked (not on dismiss)', async () => {
      const user = userEvent.setup()
      const onNavigate = vi.fn()
      render(
        <NotificationCenter
          notifications={[makeNotification()]}
          onNavigate={onNavigate}
          onDismiss={vi.fn()}
          getNotificationRoute={() => '/route'}
        />,
      )
      await user.click(screen.getByText('Test notification'))
      expect(onNavigate).toHaveBeenCalledWith('/route')
    })
  })
})
