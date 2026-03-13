import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { EditBreakBalance } from '../edit-break-balance'
import type { BreakBalanceData } from '../../types'

// Mock Dialog primitives
vi.mock('@/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const mockBalance: BreakBalanceData = {
  id: 'bb1',
  userId: 'u1',
  totalDays: 20,
  carryForward: 3,
  cashout: 2,
  createdAt: '2026-01-01',
  updatedAt: '2026-03-01',
  user: { id: 'u1', name: 'Alice', firstName: 'Alice', image: null },
}

describe('EditBreakBalance', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <EditBreakBalance selectedLeave={mockBalance} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EditBreakBalance selectedLeave={mockBalance} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders Edit trigger button', () => {
    render(<EditBreakBalance selectedLeave={mockBalance} />)
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('renders user name in dialog', () => {
    render(<EditBreakBalance selectedLeave={mockBalance} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders Cash out label', () => {
    render(<EditBreakBalance selectedLeave={mockBalance} />)
    expect(screen.getByText('Cash out')).toBeInTheDocument()
  })

  it('renders Carry forward label', () => {
    render(<EditBreakBalance selectedLeave={mockBalance} />)
    expect(screen.getByText('Carry forward')).toBeInTheDocument()
  })

  it('renders Update button', () => {
    render(<EditBreakBalance selectedLeave={mockBalance} />)
    expect(screen.getByText('Update')).toBeInTheDocument()
  })
})
