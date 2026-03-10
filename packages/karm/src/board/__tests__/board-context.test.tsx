// packages/karm/src/board/__tests__/board-context.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BoardProvider, useBoardContext } from '../board-context'
import type { BoardData } from '../board-types'

const mockData: BoardData = {
  columns: [
    {
      id: 'col-1',
      name: 'Todo',
      tasks: [
        {
          id: 't1',
          taskId: 'KRM-1',
          title: 'Task One',
          priority: 'HIGH',
          labels: ['frontend'],
          dueDate: null,
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: null,
          assignees: [],
          subtaskCount: 0,
          subtasksDone: 0,
        },
        {
          id: 't2',
          taskId: 'KRM-2',
          title: 'Task Two',
          priority: 'LOW',
          labels: [],
          dueDate: null,
          isBlocked: false,
          visibility: 'EVERYONE',
          owner: null,
          assignees: [],
          subtaskCount: 0,
          subtasksDone: 0,
        },
      ],
    },
    { id: 'col-2', name: 'Done', tasks: [] },
  ],
}

function TestConsumer() {
  const ctx = useBoardContext()
  return (
    <div>
      <span data-testid="column-count">{ctx.columns.length}</span>
      <span data-testid="view-mode">{ctx.viewMode}</span>
      <span data-testid="has-filters">{String(ctx.hasActiveFilters)}</span>
      <span data-testid="selected-count">{ctx.selectedTaskIds.size}</span>
    </div>
  )
}

describe('BoardProvider', () => {
  it('provides default context values', () => {
    render(
      <BoardProvider initialData={mockData}>
        <TestConsumer />
      </BoardProvider>,
    )
    expect(screen.getByTestId('column-count')).toHaveTextContent('2')
    expect(screen.getByTestId('view-mode')).toHaveTextContent('default')
    expect(screen.getByTestId('has-filters')).toHaveTextContent('false')
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0')
  })

  it('throws when useBoardContext used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useBoardContext must be used within <BoardProvider>',
    )
    spy.mockRestore()
  })
})
