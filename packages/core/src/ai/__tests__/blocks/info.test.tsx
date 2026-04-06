import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InfoBlock } from '../../blocks/info'

describe('InfoBlock', () => {
  it('renders with role="status"', () => {
    render(<InfoBlock data={{ message: 'Info message' }} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays the message text', () => {
    render(<InfoBlock data={{ message: 'Please check your settings' }} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Please check your settings',
    )
  })

  it('renders as info-colored alert', () => {
    const { container } = render(
      <InfoBlock data={{ message: 'Info note' }} />,
    )
    const alert = container.querySelector('[role="status"]') as HTMLElement
    expect(alert.className).toContain('bg-info-3')
  })
})
