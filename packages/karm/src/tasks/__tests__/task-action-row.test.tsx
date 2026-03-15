import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { TaskActionRow } from '../task-action-row'
import type { TaskActionRowTask } from '../task-action-row'

// ============================================================
// Test data
// ============================================================

const baseTask: TaskActionRowTask = {
  id: 'task-1',
  title: 'Implement dashboard layout',
  priority: 'HIGH',
  dueDate: '2026-03-18',
  projectName: 'Project Alpha',
  projectId: 'proj-1',
  stage: 'active',
  isOverdue: false,
  labels: ['frontend', 'urgent', 'design'],
}

const _overdueTask: TaskActionRowTask = {
  ...baseTask,
  id: 'task-2',
  title: 'Fix critical bug',
  isOverdue: true,
  dueDate: '2026-03-10',
}

const minimalTask: TaskActionRowTask = {
  id: 'task-3',
  title: 'Simple task',
  priority: 'LOW',
}

// ============================================================
// A11y
// ============================================================

describe('TaskActionRow a11y', () => {
  // nested-interactive is disabled because row (role="button") intentionally contains
  // interactive children (checkbox, navigate button) with stopPropagation isolation.
  // This matches the existing codebase pattern for Radix compound triggers.
  const axeOpts = { rules: { 'nested-interactive': { enabled: false } } }

  it('has no accessibility violations (composable)', async () => {
    const { container } = render(
      <TaskActionRow.Root task={baseTask} onClick={vi.fn()}>
        <TaskActionRow.Checkbox onComplete={vi.fn()} />
        <TaskActionRow.Priority />
        <TaskActionRow.Title />
        <TaskActionRow.Labels max={2} />
        <TaskActionRow.ProjectBadge />
        <TaskActionRow.DueDate />
        <TaskActionRow.StatusBadge />
        <TaskActionRow.Navigate href="/test" />
      </TaskActionRow.Root>,
    )
    const results = await axe(container, axeOpts)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations (props shorthand)', async () => {
    const { container } = render(
      <TaskActionRow
        task={baseTask}
        onClick={vi.fn()}
        onComplete={vi.fn()}
        showCheckbox
        showPriority
        showLabels
        showProject
        showDueDate
        showNavigate
        truncateTitle
      />,
    )
    const results = await axe(container, axeOpts)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Rendering
// ============================================================

describe('TaskActionRow rendering', () => {
  it('renders task title', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    expect(screen.getByText('Implement dashboard layout')).toBeInTheDocument()
  })

  it('shows priority indicator', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.Priority />
      </TaskActionRow.Root>,
    )
    expect(screen.getByTitle('High')).toBeInTheDocument()
  })

  it('renders due date formatted', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.DueDate />
      </TaskActionRow.Root>,
    )
    expect(screen.getByText('Mar 18')).toBeInTheDocument()
  })

  it('renders status badge with stage', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.StatusBadge />
      </TaskActionRow.Root>,
    )
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders project badge with projectName', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.ProjectBadge />
      </TaskActionRow.Root>,
    )
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
  })

  it('returns null for DueDate when no dueDate', () => {
    const { container } = render(
      <TaskActionRow.Root task={minimalTask}>
        <TaskActionRow.DueDate />
      </TaskActionRow.Root>,
    )
    // Only the root div should be rendered, no date text
    expect(container.textContent).toBe('')
  })

  it('returns null for StatusBadge when no stage', () => {
    const { container } = render(
      <TaskActionRow.Root task={minimalTask}>
        <TaskActionRow.StatusBadge />
      </TaskActionRow.Root>,
    )
    expect(container.textContent).toBe('')
  })

  it('returns null for ProjectBadge when no projectName', () => {
    const { container } = render(
      <TaskActionRow.Root task={minimalTask}>
        <TaskActionRow.ProjectBadge />
      </TaskActionRow.Root>,
    )
    expect(container.textContent).toBe('')
  })
})

// ============================================================
// Interactions
// ============================================================

describe('TaskActionRow interactions', () => {
  it('fires onClick on row click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <TaskActionRow.Root task={baseTask} onClick={onClick}>
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    await user.click(screen.getByText('Implement dashboard layout'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('fires onComplete on checkbox click without triggering row onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onComplete = vi.fn()
    render(
      <TaskActionRow.Root task={baseTask} onClick={onClick}>
        <TaskActionRow.Checkbox onComplete={onComplete} />
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(onComplete).toHaveBeenCalledWith('task-1')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('activates with Enter key', async () => {
    const onClick = vi.fn()
    render(
      <TaskActionRow.Root task={baseTask} onClick={onClick}>
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    const row = screen.getByRole('button')
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates with Space key', async () => {
    const onClick = vi.fn()
    render(
      <TaskActionRow.Root task={baseTask} onClick={onClick}>
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    const row = screen.getByRole('button')
    fireEvent.keyDown(row, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// ============================================================
// Labels
// ============================================================

describe('TaskActionRow.Labels', () => {
  it('renders labels with max truncation', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.Labels max={2} />
      </TaskActionRow.Root>,
    )
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.queryByText('design')).not.toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('renders all labels when max is not exceeded', () => {
    const task: TaskActionRowTask = {
      ...baseTask,
      labels: ['frontend', 'urgent'],
    }
    render(
      <TaskActionRow.Root task={task}>
        <TaskActionRow.Labels max={3} />
      </TaskActionRow.Root>,
    )
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('returns null when no labels', () => {
    const { container } = render(
      <TaskActionRow.Root task={minimalTask}>
        <TaskActionRow.Labels />
      </TaskActionRow.Root>,
    )
    expect(container.textContent).toBe('')
  })
})

// ============================================================
// Navigate
// ============================================================

describe('TaskActionRow.Navigate', () => {
  it('has correct aria-label', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.Navigate href="/test" />
      </TaskActionRow.Root>,
    )
    expect(
      screen.getByRole('button', { name: 'Open task in project board' }),
    ).toBeInTheDocument()
  })
})

// ============================================================
// Separator
// ============================================================

describe('TaskActionRow separator', () => {
  it('shows separator by default', () => {
    render(
      <TaskActionRow.Root task={baseTask}>
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    const row = screen.getByText(baseTask.title).parentElement!
    expect(row.className).toContain('border-b')
  })

  it('hides separator when showSeparator is false', () => {
    render(
      <TaskActionRow.Root task={baseTask} showSeparator={false}>
        <TaskActionRow.Title />
      </TaskActionRow.Root>,
    )
    const row = screen.getByText(baseTask.title).parentElement!
    expect(row.className).not.toContain('border-b')
  })
})

// ============================================================
// Props shorthand
// ============================================================

describe('TaskActionRow props shorthand', () => {
  it('renders all sub-components via props', () => {
    render(
      <TaskActionRow
        task={baseTask}
        onClick={vi.fn()}
        onComplete={vi.fn()}
        showCheckbox
        showPriority
        showLabels
        showProject
        showDueDate
        showNavigate
        truncateTitle
      />,
    )
    expect(screen.getByText('Implement dashboard layout')).toBeInTheDocument()
    expect(screen.getByTitle('High')).toBeInTheDocument()
    expect(screen.getByText('Mar 18')).toBeInTheDocument()
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open task in project board' }),
    ).toBeInTheDocument()
  })
})
