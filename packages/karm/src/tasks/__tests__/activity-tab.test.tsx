import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { ActivityTab } from '../activity-tab'
import type { AuditLogEntry } from '../activity-tab'

const mockActivity: AuditLogEntry = {
  id: 'log1',
  timestamp: new Date().toISOString(),
  actorType: 'USER',
  actorId: 'u1',
  action: 'task.created',
  entityType: 'TASK',
  entityId: 't1',
  projectId: 'p1',
  metadata: { actorName: 'Alice' },
}

describe('ActivityTab', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ActivityTab activities={[mockActivity]} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ActivityTab activities={[mockActivity]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders activity entry with actor name', () => {
    render(<ActivityTab activities={[mockActivity]} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders action description', () => {
    render(<ActivityTab activities={[mockActivity]} />)
    expect(screen.getByText('created this task')).toBeInTheDocument()
  })

  it('renders empty state when no activities', () => {
    render(<ActivityTab activities={[]} />)
    expect(screen.getByText('No activity yet')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <ActivityTab ref={ref} className="custom" activities={[mockActivity]} />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
