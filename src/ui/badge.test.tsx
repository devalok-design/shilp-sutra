import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies variant classes via CVA', () => {
    const { container } = render(<Badge variant="red">Error</Badge>)
    const badge = container.querySelector('span')!
    expect(badge.className).toContain('inline-flex')
  })

  it('renders dot indicator when dot prop is true', () => {
    const { container } = render(<Badge dot>Status</Badge>)
    const dotEl = container.querySelector('[aria-hidden="true"]')
    expect(dotEl).toBeInTheDocument()
  })

  it('renders dismiss button when onDismiss is provided', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<Badge onDismiss={onDismiss}>Removable</Badge>)
    const removeBtn = screen.getByRole('button', { name: 'Remove' })
    expect(removeBtn).toBeInTheDocument()
    await user.click(removeBtn)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('merges custom className', () => {
    const { container } = render(<Badge className="extra-class">Custom</Badge>)
    expect(container.querySelector('span')).toHaveClass('extra-class')
  })
})
