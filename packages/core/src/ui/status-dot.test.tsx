import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { StatusDot } from './status-dot'

describe('StatusDot', () => {
  it('renders with healthy status', () => {
    render(<StatusDot status="healthy" data-testid="dot" />)
    expect(screen.getByTestId('dot')).toBeInTheDocument()
  })

  it('renders label text when provided', () => {
    render(<StatusDot status="warning" label="Degraded" />)
    expect(screen.getByText('Degraded')).toBeInTheDocument()
  })

  it('has pulse animation for healthy status by default', () => {
    render(<StatusDot status="healthy" data-testid="dot" />)
    expect(screen.getByTestId('dot').querySelector('[data-pulse]')).toBeInTheDocument()
  })

  it('does not pulse for non-healthy statuses by default', () => {
    render(<StatusDot status="critical" data-testid="dot" />)
    expect(screen.getByTestId('dot').querySelector('[data-pulse]')).not.toBeInTheDocument()
  })

  it('pulses when pulse prop is explicitly set', () => {
    render(<StatusDot status="critical" pulse data-testid="dot" />)
    expect(screen.getByTestId('dot').querySelector('[data-pulse]')).toBeInTheDocument()
  })

  it('supports all status values', () => {
    const statuses = ['healthy', 'warning', 'critical', 'neutral', 'inactive'] as const
    statuses.forEach(s => {
      const { unmount } = render(<StatusDot status={s} data-testid="dot" />)
      expect(screen.getByTestId('dot')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders correct color classes per status', () => {
    const { container } = render(<StatusDot status="critical" data-testid="dot" />)
    const dotEl = container.querySelector('.bg-error-9')
    expect(dotEl).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<StatusDot status="healthy" ref={ref as React.Ref<HTMLSpanElement>} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })
})
