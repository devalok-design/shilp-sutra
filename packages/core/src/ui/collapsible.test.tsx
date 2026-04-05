import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible'

function renderCollapsible(props?: { defaultOpen?: boolean; className?: string }) {
  return render(
    <Collapsible defaultOpen={props?.defaultOpen}>
      <CollapsibleTrigger>Toggle section</CollapsibleTrigger>
      <CollapsibleContent className={props?.className}>
        <p>Collapsible content here</p>
      </CollapsibleContent>
    </Collapsible>,
  )
}

describe('Collapsible', () => {
  it('renders the trigger', () => {
    renderCollapsible()
    expect(screen.getByRole('button', { name: 'Toggle section' })).toBeInTheDocument()
  })

  it('hides content by default', () => {
    renderCollapsible()
    expect(screen.queryByText('Collapsible content here')).not.toBeInTheDocument()
  })

  it('shows content when defaultOpen is true', () => {
    renderCollapsible({ defaultOpen: true })
    expect(screen.getByText('Collapsible content here')).toBeVisible()
  })

  it('expands content on trigger click', async () => {
    const user = userEvent.setup()
    renderCollapsible()
    await user.click(screen.getByRole('button', { name: 'Toggle section' }))
    expect(screen.getByText('Collapsible content here')).toBeVisible()
  })

  it('collapses content on second trigger click', async () => {
    const user = userEvent.setup()
    renderCollapsible()
    const trigger = screen.getByRole('button', { name: 'Toggle section' })
    await user.click(trigger)
    expect(screen.getByText('Collapsible content here')).toBeVisible()
    await user.click(trigger)
    expect(screen.queryByText('Collapsible content here')).not.toBeInTheDocument()
  })

  it('supports controlled open state', () => {
    render(
      <Collapsible open>
        <CollapsibleTrigger>Open</CollapsibleTrigger>
        <CollapsibleContent>Controlled</CollapsibleContent>
      </Collapsible>,
    )
    expect(screen.getByText('Controlled')).toBeVisible()
  })

  it('calls onOpenChange when toggled', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Inner</CollapsibleContent>
      </Collapsible>,
    )
    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('merges className on content', () => {
    renderCollapsible({ defaultOpen: true, className: 'custom-collapsible' })
    const content = screen.getByText('Collapsible content here').closest('[class*="custom-collapsible"]')
    expect(content).toBeInTheDocument()
  })

  it('has no axe violations when expanded', async () => {
    const { container } = renderCollapsible({ defaultOpen: true })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
