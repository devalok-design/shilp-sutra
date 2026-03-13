import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { RenderDate } from '../render-date'
import type { DayInfo } from '../../types'

const today = new Date()

const mockDay: DayInfo = {
  day: 'Thu',
  date: 13,
  fullDate: today,
  isToday: true,
  isActive: false,
  isDisabled: false,
}

const defaultProps = {
  day: mockDay,
  isAdmin: true,
  selectedDate: today.toISOString(),
  dateAttendanceMap: new Map(),
  activeTimeFrame: 'weekly',
}

describe('RenderDate', () => {
  it('renders without crashing', () => {
    const { container } = render(<RenderDate {...defaultProps} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<RenderDate {...defaultProps} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the date number', () => {
    render(<RenderDate {...defaultProps} />)
    expect(screen.getByText('13')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <RenderDate ref={ref} className="custom" {...defaultProps} />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('renders a disabled date', () => {
    const disabledDay: DayInfo = {
      ...mockDay,
      isToday: false,
      isDisabled: true,
    }
    const { container } = render(
      <RenderDate {...defaultProps} day={disabledDay} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
