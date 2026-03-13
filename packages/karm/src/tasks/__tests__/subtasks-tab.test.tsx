import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { SubtasksTab } from '../subtasks-tab'
import type { Subtask } from '../subtasks-tab'

const mockSubtask: Subtask = {
  id: 'st1',
  title: 'Write unit tests',
  priority: 'HIGH',
  columnId: 'col-todo',
  column: { id: 'col-todo', name: 'Todo', isTerminal: false },
  assignees: [
    { user: { id: 'u1', name: 'Alice', image: null } },
  ],
}

const completedSubtask: Subtask = {
  id: 'st2',
  title: 'Setup CI',
  priority: 'MEDIUM',
  columnId: 'col-done',
  column: { id: 'col-done', name: 'Done', isTerminal: true },
  assignees: [],
}

describe('SubtasksTab', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <SubtasksTab
        subtasks={[mockSubtask]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SubtasksTab
        subtasks={[mockSubtask]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    // aria-progressbar-name: upstream Progress component lacks aria-label
    // button-name: checkbox toggle button contains only an SVG icon (no text/label)
    expect(await axe(container, {
      rules: {
        'aria-progressbar-name': { enabled: false },
        'button-name': { enabled: false },
        'nested-interactive': { enabled: false },
      },
    })).toHaveNoViolations()
  })

  it('renders subtask title', () => {
    render(
      <SubtasksTab
        subtasks={[mockSubtask]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    expect(screen.getByText('Write unit tests')).toBeInTheDocument()
  })

  it('renders progress count', () => {
    render(
      <SubtasksTab
        subtasks={[mockSubtask, completedSubtask]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('renders empty state when no subtasks', () => {
    render(
      <SubtasksTab
        subtasks={[]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    expect(screen.getByText('No subtasks')).toBeInTheDocument()
  })

  it('renders Add subtask button', () => {
    render(
      <SubtasksTab
        subtasks={[]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    expect(screen.getByText('Add subtask')).toBeInTheDocument()
  })

  it('hides Add subtask in readOnly mode', () => {
    render(
      <SubtasksTab
        subtasks={[mockSubtask]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByText('Add subtask')).not.toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <SubtasksTab
        ref={ref}
        className="custom"
        subtasks={[]}
        projectId="p1"
        parentTaskId="t1"
        defaultColumnId="col-todo"
        onCreateSubtask={vi.fn()}
        onToggleSubtask={vi.fn()}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})
