import { render, screen } from '@testing-library/react'
import { beforeAll,describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

// Mock Radix Select which needs pointer events
vi.mock('../../ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}))

// Mock Dialog
vi.mock('../../ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

import { type NotificationPreference,NotificationPreferences } from '../notification-preferences'

describe('NotificationPreferences', () => {
  it('renders without crashing', () => {
    const { container } = render(<NotificationPreferences />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<NotificationPreferences />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('merges className', () => {
    const { container } = render(<NotificationPreferences className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<NotificationPreferences data-testid="np" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'np')
  })

  it('calls onSave with the default new-rule shape when Save Rule is clicked', () => {
    const onSave = vi.fn()
    render(<NotificationPreferences onSave={onSave} />)
    screen.getByRole('button', { name: 'Save Rule' }).click()
    expect(onSave).toHaveBeenCalledWith({
      projectId: null,
      channel: 'IN_APP',
      minTier: 'INFO',
      muted: false,
    })
  })

  it('calls onDelete with the preference id', () => {
    const onDelete = vi.fn()
    const preferences: NotificationPreference[] = [
      { id: 'pref-1', projectId: null, channel: 'IN_APP', minTier: 'INFO', muted: false },
    ]
    render(<NotificationPreferences preferences={preferences} onDelete={onDelete} />)
    screen.getByRole('button', { name: 'Delete In-App notification rule' }).click()
    expect(onDelete).toHaveBeenCalledWith('pref-1')
  })

  it('calls onToggleMute with the preference', () => {
    const onToggleMute = vi.fn()
    const preferences: NotificationPreference[] = [
      { id: 'pref-1', projectId: null, channel: 'IN_APP', minTier: 'INFO', muted: false },
    ]
    render(<NotificationPreferences preferences={preferences} onToggleMute={onToggleMute} />)
    screen.getByRole('switch', { name: 'Mute In-App for Global (all projects)' }).click()
    expect(onToggleMute).toHaveBeenCalledWith(preferences[0])
  })

  it('shows a loading spinner and hides the list when isLoading', () => {
    const preferences: NotificationPreference[] = [
      { id: 'pref-1', projectId: null, channel: 'IN_APP', minTier: 'INFO', muted: false },
    ]
    render(<NotificationPreferences preferences={preferences} isLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument()
  })

  it('shows the empty-state message when there are no preferences', () => {
    render(<NotificationPreferences preferences={[]} />)
    expect(
      screen.getByText('No custom preferences set. All notifications are delivered by default.'),
    ).toBeInTheDocument()
  })
})
