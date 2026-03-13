import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Breaks } from '../breaks'
import type { BreakRequest } from '../../types'

// Mock Popover/Tooltip since they use Radix portals
vi.mock('@/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/ui', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

vi.mock('../edit-break', () => ({
  EditBreak: () => <div data-testid="edit-break" />,
}))

const mockBreak: BreakRequest = {
  id: 'b1',
  userId: 'u1',
  startDate: '2026-03-10',
  endDate: '2026-03-10',
  numberOfDays: 1,
  reason: 'Personal',
  status: 'APPROVED',
  user: { id: 'u1', name: 'Alice', firstName: 'Alice', image: null },
}

describe('Breaks', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Breaks breaks={[mockBreak]} userImages={{}} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Breaks breaks={[mockBreak]} userImages={{}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders column headers', () => {
    render(<Breaks breaks={[mockBreak]} userImages={{}} />)
    expect(screen.getByText('NAME')).toBeInTheDocument()
    expect(screen.getByText('DATE')).toBeInTheDocument()
    expect(screen.getByText('DAYS')).toBeInTheDocument()
    expect(screen.getByText('REASON')).toBeInTheDocument()
    expect(screen.getByText('STATUS')).toBeInTheDocument()
    expect(screen.getByText('COMMENT')).toBeInTheDocument()
  })

  it('renders break reason', () => {
    render(<Breaks breaks={[mockBreak]} userImages={{}} />)
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('renders number of days', () => {
    render(<Breaks breaks={[mockBreak]} userImages={{}} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders user name', () => {
    render(<Breaks breaks={[mockBreak]} userImages={{}} />)
    // Name appears in both visible text and tooltip — use getAllByText
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <Breaks ref={ref} className="custom" breaks={[]} userImages={{}} />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
