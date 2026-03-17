import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InfoBlock } from '../../blocks/info'

describe('InfoBlock', () => {
  it('renders with role="alert"', () => {
    render(<InfoBlock data={{ message: 'Info message' }} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays the message text', () => {
    render(<InfoBlock data={{ message: 'Please check your settings' }} />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please check your settings',
    )
  })

  it('renders as info-colored alert', () => {
    const { container } = render(
      <InfoBlock data={{ message: 'Info note' }} />,
    )
    const alert = container.querySelector('[role="alert"]') as HTMLElement
    expect(alert.className).toContain('bg-info-3')
  })
})
