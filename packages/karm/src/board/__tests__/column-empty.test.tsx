import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ColumnEmpty } from '../column-empty'

describe('ColumnEmpty', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <ColumnEmpty index={0} onAddTask={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders an SVG illustration', () => {
    const { container } = render(
      <ColumnEmpty index={0} onAddTask={vi.fn()} />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders "No tasks yet" text by default', () => {
    render(<ColumnEmpty index={0} onAddTask={vi.fn()} />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('renders "Add a task" button by default', () => {
    render(<ColumnEmpty index={0} onAddTask={vi.fn()} />)
    expect(screen.getByRole('button', { name: /add a task/i })).toBeInTheDocument()
  })

  it('calls onAddTask when button is clicked', async () => {
    const onAddTask = vi.fn()
    render(<ColumnEmpty index={0} onAddTask={onAddTask} />)
    await userEvent.click(screen.getByRole('button', { name: /add a task/i }))
    expect(onAddTask).toHaveBeenCalledTimes(1)
  })

  it('renders "Drop tasks here" text in drop-target mode', () => {
    render(<ColumnEmpty index={0} onAddTask={vi.fn()} isDropTarget />)
    expect(screen.getByText('Drop tasks here')).toBeInTheDocument()
  })

  it('does not render "Add a task" button in drop-target mode', () => {
    render(<ColumnEmpty index={0} onAddTask={vi.fn()} isDropTarget />)
    expect(screen.queryByRole('button', { name: /add a task/i })).not.toBeInTheDocument()
  })

  it('cycles through all 4 illustrations without error', () => {
    for (let i = 0; i < 4; i++) {
      const { container, unmount } = render(
        <ColumnEmpty index={i} onAddTask={vi.fn()} />,
      )
      expect(container.querySelector('svg')).toBeInTheDocument()
      unmount()
    }
  })

  it('wraps back to illustration 0 when index exceeds 3', () => {
    const { container: c0 } = render(<ColumnEmpty index={0} onAddTask={vi.fn()} />)
    const { container: c4 } = render(<ColumnEmpty index={4} onAddTask={vi.fn()} />)
    const svg0 = c0.querySelector('svg')?.outerHTML
    const svg4 = c4.querySelector('svg')?.outerHTML
    expect(svg0).toBe(svg4)
  })
})
