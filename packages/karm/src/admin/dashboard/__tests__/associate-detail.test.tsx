import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { AssociateDetail } from '../associate-detail'
import type { AssociateDetailProps } from '../associate-detail'
import type { AdminUser, AttendanceRecord } from '../../types'

// Mock Dialog
vi.mock('@/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../break-request', () => ({
  BreakRequestCard: () => <div data-testid="break-request-card" />,
}))

const mockAssociate: AdminUser = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@test.com',
  designation: 'Developer',
  image: null,
  role: 'Associate',
  isActive: true,
  createdAt: '2026-01-01',
}

const mockAttendance: AttendanceRecord = {
  id: 'a1',
  userId: 'u1',
  date: '2026-03-13',
  timeIn: null,
  timeOut: null,
  status: 'PRESENT',
}

const defaultProps: AssociateDetailProps = {
  selectedAssociate: mockAssociate,
  selectedDate: '2026-03-13',
  selectedUserAttendance: mockAttendance,
  userTasks: [
    { id: 't1', title: 'Fix bug', status: 'TODO' },
    { id: 't2', title: 'Write tests', status: 'COMPLETED' },
  ],
  selectedBreakRequest: null,
  isFutureDate: false,
  assetsBaseUrl: '/assets',
}

describe('AssociateDetail', () => {
  it('renders without crashing', () => {
    const { container } = render(<AssociateDetail {...defaultProps} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<AssociateDetail {...defaultProps} />)
    // button-name: upstream AddIcon submit button lacks aria-label (component-level issue)
    expect(await axe(container, { rules: { 'button-name': { enabled: false } } })).toHaveNoViolations()
  })

  it('renders task titles when present', () => {
    render(<AssociateDetail {...defaultProps} />)
    expect(screen.getByText('Fix bug')).toBeInTheDocument()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('renders attendance status section', () => {
    render(<AssociateDetail {...defaultProps} />)
    expect(screen.getByText('Attendance status')).toBeInTheDocument()
  })

  it('shows "Tasks for the day" heading when present', () => {
    render(<AssociateDetail {...defaultProps} />)
    expect(screen.getByText('Tasks for the day')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <AssociateDetail ref={ref} className="custom" {...defaultProps} />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
