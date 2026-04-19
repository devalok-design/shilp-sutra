import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'

import { Collapsible, CollapsibleContent,CollapsibleTrigger } from '../collapsible'

function renderCollapsible({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  return render(
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>
        <p>Hidden content</p>
      </CollapsibleContent>
    </Collapsible>,
  )
}

describe('Collapsible', () => {
  it('renders the trigger', () => {
    renderCollapsible()
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument()
  })

  it('hides content by default', () => {
    renderCollapsible()
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('shows content when defaultOpen is true', () => {
    renderCollapsible({ defaultOpen: true })
    expect(screen.getByText('Hidden content')).toBeInTheDocument()
  })

  it('toggles content on trigger click', async () => {
    const user = userEvent.setup()
    renderCollapsible()

    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByText('Hidden content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('merges custom className on CollapsibleContent', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent className="my-content">
          <p>Content</p>
        </CollapsibleContent>
      </Collapsible>,
    )
    const content = container.querySelector('.my-content')
    expect(content).toBeInTheDocument()
  })
})
