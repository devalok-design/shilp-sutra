import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { SplitButton } from './split-button'

const noop = () => {}

describe('SplitButton', () => {
  it('renders primary button text', () => {
    render(<SplitButton onClick={noop}>Save</SplitButton>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('fires onClick when primary button is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<SplitButton onClick={onClick}>Save</SplitButton>)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('dropdown trigger opens menu (aria-expanded)', async () => {
    const user = userEvent.setup()
    render(
      <SplitButton onClick={noop} dropdownContent={<div>Menu</div>}>
        Save
      </SplitButton>,
    )
    const trigger = screen.getByRole('button', { name: 'More options' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // Panel is a Popover (dialog semantics), not a bare role="menu".
    expect(await screen.findByText('Menu')).toBeInTheDocument()
  })

  it('Escape closes dropdown', async () => {
    const user = userEvent.setup()
    render(
      <SplitButton onClick={noop} dropdownContent={<div>Menu</div>}>
        Save
      </SplitButton>,
    )
    const trigger = screen.getByRole('button', { name: 'More options' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('disabled state prevents interaction', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <SplitButton onClick={onClick} disabled dropdownContent={<div>Menu</div>}>
        Save
      </SplitButton>,
    )
    const primary = screen.getByRole('button', { name: 'Save' })
    const trigger = screen.getByRole('button', { name: 'More options' })

    expect(primary).toBeDisabled()
    expect(trigger).toBeDisabled()

    await user.click(primary)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('triggerSide="left" renders trigger before primary', () => {
    const { container } = render(
      <SplitButton onClick={noop} triggerSide="left" dropdownContent={<div>Menu</div>}>
        Save
      </SplitButton>,
    )
    const buttons = container.querySelectorAll('button')
    // First button should be the trigger (More options), second should be primary (Save)
    expect(buttons[0]).toHaveAttribute('aria-haspopup', 'dialog')
    expect(buttons[1].textContent).toBe('Save')
  })

  it('triggerSide="right" (default) renders trigger after primary', () => {
    const { container } = render(
      <SplitButton onClick={noop} dropdownContent={<div>Menu</div>}>
        Save
      </SplitButton>,
    )
    const buttons = container.querySelectorAll('button')
    // First button is primary, second is trigger
    expect(buttons[0].textContent).toBe('Save')
    expect(buttons[1]).toHaveAttribute('aria-haspopup', 'dialog')
  })

  it('variant="solid" with color="accent" applies solid accent classes', () => {
    render(
      <SplitButton onClick={noop} variant="solid" color="accent">
        Save
      </SplitButton>,
    )
    const primary = screen.getByRole('button', { name: 'Save' })
    expect(primary.className).toContain('bg-accent-9')
  })

  it('variant="soft" with color="error" applies soft error classes', () => {
    render(
      <SplitButton onClick={noop} variant="soft" color="error">
        Delete
      </SplitButton>,
    )
    const primary = screen.getByRole('button', { name: 'Delete' })
    expect(primary.className).toContain('bg-error-3')
    expect(primary.className).toContain('text-error-11')
  })

  it('variant="outline" with color="neutral" applies outline neutral classes', () => {
    render(
      <SplitButton onClick={noop} variant="outline" color="neutral">
        Cancel
      </SplitButton>,
    )
    const primary = screen.getByRole('button', { name: 'Cancel' })
    expect(primary.className).toContain('bg-transparent')
    expect(primary.className).toContain('text-surface-fg')
  })

  it('size="xs" applies correct height class', () => {
    render(
      <SplitButton onClick={noop} size="xs">
        Small
      </SplitButton>,
    )
    const primary = screen.getByRole('button', { name: 'Small' })
    expect(primary.className).toContain('h-ds-xs-plus')
  })

  it('size="sm" applies correct height class', () => {
    render(
      <SplitButton onClick={noop} size="sm">
        Medium
      </SplitButton>,
    )
    const primary = screen.getByRole('button', { name: 'Medium' })
    expect(primary.className).toContain('h-ds-sm')
  })

  it('renders with role="group"', () => {
    render(<SplitButton onClick={noop}>Save</SplitButton>)
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('custom dropdownLabel overrides default aria-label', () => {
    render(
      <SplitButton onClick={noop} dropdownLabel="Save options" dropdownContent={<div>Menu</div>}>
        Save
      </SplitButton>,
    )
    expect(screen.getByRole('button', { name: 'Save options' })).toBeInTheDocument()
  })

  it('has no accessibility violations (closed)', async () => {
    const { container } = render(
      <SplitButton onClick={noop} aria-label="Save actions" dropdownContent={<div>Menu item</div>}>
        Save
      </SplitButton>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations (open)', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <SplitButton onClick={noop} aria-label="Save actions" dropdownContent={<button type="button">Save as draft</button>}>
        Save
      </SplitButton>,
    )
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
