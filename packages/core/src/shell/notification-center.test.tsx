import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
})
