import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { SidebarScratchpad } from '../sidebar-scratchpad'
import type { ScratchpadItem } from '../scratchpad-widget'

const items: ScratchpadItem[] = [
  { id: '1', text: 'Write tests', done: false },
  { id: '2', text: 'Review PR', done: true },
  { id: '3', text: 'Deploy app', done: false },
]

const noop = vi.fn()

function renderScratchpad(props: Partial<React.ComponentProps<typeof SidebarScratchpad>> = {}) {
  return render(
    <SidebarScratchpad items={items} onToggle={noop} {...props} />,
  )
}

describe('SidebarScratchpad', () => {
  it('has no a11y violations', async () => {
    const { container } = renderScratchpad()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders items in expanded state by default', () => {
    renderScratchpad()
    expect(screen.getByText('Write tests')).toBeVisible()
    expect(screen.getByText('Review PR')).toBeVisible()
    expect(screen.getByText('Deploy app')).toBeVisible()
  })

  it('collapses and hides items when header clicked', async () => {
    renderScratchpad()
    const toggle = screen.getByRole('button', { name: /scratchpad/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows badge count when provided', () => {
    renderScratchpad({ badgeCount: 2 })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge when badgeCount is 0', () => {
    renderScratchpad({ badgeCount: 0 })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    renderScratchpad({ onToggle })
    const checkbox = screen.getByRole('checkbox', { name: /Toggle Write tests/ })
    await userEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('starts collapsed when defaultOpen=false', () => {
    renderScratchpad({ defaultOpen: false })
    const toggle = screen.getByRole('button', { name: /scratchpad/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
