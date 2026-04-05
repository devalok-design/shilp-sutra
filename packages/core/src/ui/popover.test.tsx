import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Popover, PopoverTrigger, PopoverContent } from './popover'

function renderPopover(props?: { className?: string }) {
  return render(
    <Popover>
      <PopoverTrigger asChild>
        <button>Open popover</button>
      </PopoverTrigger>
      <PopoverContent className={props?.className}>
        <p>Popover body</p>
      </PopoverContent>
    </Popover>,
  )
}

describe('Popover', () => {
  it('renders the trigger', () => {
    renderPopover()
    expect(screen.getByRole('button', { name: 'Open popover' })).toBeInTheDocument()
  })

  it('does not show content when closed', () => {
    renderPopover()
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument()
  })

  it('opens on trigger click and shows content', async () => {
    const user = userEvent.setup()
    renderPopover()
    await user.click(screen.getByRole('button', { name: 'Open popover' }))
    expect(screen.getByText('Popover body')).toBeInTheDocument()
  })

  it('calls onOpenChange(false) on second trigger click', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button>Toggle</button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: 'Toggle' })
    await user.click(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    await user.click(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('supports controlled open state', () => {
    render(
      <Popover open>
        <PopoverTrigger asChild>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>Controlled content</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Controlled content')).toBeInTheDocument()
  })

  it('calls onOpenChange when toggled', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button>Toggle</button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    )
    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('merges className on content', async () => {
    const user = userEvent.setup()
    renderPopover({ className: 'custom-popover' })
    await user.click(screen.getByRole('button', { name: 'Open popover' }))
    expect(screen.getByText('Popover body').closest('[class*="custom-popover"]')).toBeInTheDocument()
  })

  it('has no axe violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderPopover()
    await user.click(screen.getByRole('button', { name: 'Open popover' }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
