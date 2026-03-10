import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import React, { useRef } from 'react'

// jsdom doesn't implement scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})
import { BoardProvider } from '../board-context'
import { useBoardKeyboard } from '../use-board-keyboard'
import { useBoardContext } from '../board-context'
import type { BoardData } from '../board-types'

// ============================================================
// Fixtures
// ============================================================

const boardData: BoardData = {
  columns: [
    {
      id: 'col-1',
      name: 'To Do',
      tasks: [
        {
          id: 't1',
          taskId: 'KRM-1',
          title: 'Task one',
          priority: 'HIGH',
          labels: [],
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
          title: 'Task two',
          priority: 'LOW',
          labels: [],
          dueDate: null,
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: null,
          assignees: [],
          subtaskCount: 0,
          subtasksDone: 0,
        },
      ],
    },
    {
      id: 'col-2',
      name: 'In Progress',
      tasks: [
        {
          id: 't3',
          taskId: 'KRM-3',
          title: 'Task three',
          priority: 'MEDIUM',
          labels: [],
          dueDate: null,
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: null,
          assignees: [],
          subtaskCount: 0,
          subtasksDone: 0,
        },
      ],
    },
    {
      id: 'col-3',
      name: 'Done',
      tasks: [],
    },
  ],
}

// ============================================================
// Test harness
// ============================================================

/** Displays current focus/selection state and attaches keyboard handler */
function KeyboardHarness() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { focusedTaskId, selectedTaskIds } = useBoardContext()
  useBoardKeyboard(containerRef)

  return (
    <div ref={containerRef} tabIndex={0} data-testid="board-container">
      <div data-testid="focused">{focusedTaskId ?? 'none'}</div>
      <div data-testid="selected">{Array.from(selectedTaskIds).sort().join(',') || 'none'}</div>
      {/* Task elements for scrollIntoView targeting */}
      <div data-task-id="t1">Task one</div>
      <div data-task-id="t2">Task two</div>
      <div data-task-id="t3">Task three</div>
    </div>
  )
}

function renderKeyboard(
  callbacks: Record<string, ReturnType<typeof vi.fn>> = {},
  data: BoardData = boardData,
) {
  return render(
    <BoardProvider
      initialData={data}
      onClickTask={callbacks.onClickTask ?? vi.fn()}
    >
      <KeyboardHarness />
    </BoardProvider>,
  )
}

async function focusBoard(user: ReturnType<typeof userEvent.setup>) {
  const container = screen.getByTestId('board-container')
  await user.click(container)
}

function getFocused() {
  return screen.getByTestId('focused').textContent
}

function getSelected() {
  return screen.getByTestId('selected').textContent
}

// ============================================================
// Tests
// ============================================================

describe('useBoardKeyboard', () => {
  it('focuses first task in first non-empty column on ArrowDown with no focus', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    expect(getFocused()).toBe('none')
    await user.keyboard('{ArrowDown}')
    expect(getFocused()).toBe('t1')
  })

  it('moves focus down within a column', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard('{ArrowDown}') // → t2
    expect(getFocused()).toBe('t2')
  })

  it('moves focus up within a column', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard('{ArrowDown}') // → t2
    await user.keyboard('{ArrowUp}')   // → t1
    expect(getFocused()).toBe('t1')
  })

  it('does not move past top of column', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard('{ArrowUp}')   // stays t1 (can't go above 0)
    expect(getFocused()).toBe('t1')
  })

  it('does not move past bottom of column', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard('{ArrowDown}') // → t2
    await user.keyboard('{ArrowDown}') // stays t2 (no t3 in col-1)
    expect(getFocused()).toBe('t2')
  })

  it('moves focus right across columns', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}')  // → t1 (col-1)
    await user.keyboard('{ArrowRight}') // → t3 (col-2, first non-empty)
    expect(getFocused()).toBe('t3')
  })

  it('moves focus left across columns', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}')  // → t1
    await user.keyboard('{ArrowRight}') // → t3 (col-2)
    await user.keyboard('{ArrowLeft}')  // → t1 (col-1, same row index clamped)
    expect(getFocused()).toBe('t1')
  })

  it('skips empty columns when moving right', async () => {
    // col-3 is empty, so ArrowRight from col-2 should stay
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}')  // → t1
    await user.keyboard('{ArrowRight}') // → t3 (col-2)
    await user.keyboard('{ArrowRight}') // stays t3 (col-3 empty, no col-4)
    expect(getFocused()).toBe('t3')
  })

  it('calls onClickTask on Enter', async () => {
    const onClickTask = vi.fn()
    const user = userEvent.setup()
    renderKeyboard({ onClickTask })
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard('{Enter}')
    expect(onClickTask).toHaveBeenCalledWith('t1')
  })

  it('toggles selection on Space', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard(' ')
    expect(getSelected()).toBe('t1')

    // Toggle off
    await user.keyboard(' ')
    expect(getSelected()).toBe('none')
  })

  it('clears selection on Escape', async () => {
    const user = userEvent.setup()
    renderKeyboard()
    await focusBoard(user)

    await user.keyboard('{ArrowDown}') // → t1
    await user.keyboard(' ')           // select t1
    expect(getSelected()).toBe('t1')

    await user.keyboard('{Escape}')
    expect(getSelected()).toBe('none')
  })

  it('does not handle keys when focused on input', async () => {
    const onClickTask = vi.fn()
    const user = userEvent.setup()

    render(
      <BoardProvider initialData={boardData} onClickTask={onClickTask}>
        <KeyboardHarnessWithInput />
      </BoardProvider>,
    )

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Enter}')

    // onClickTask should NOT be called — input swallows the event
    expect(onClickTask).not.toHaveBeenCalled()
  })
})

/** Variant harness with an input inside the container */
function KeyboardHarnessWithInput() {
  const containerRef = useRef<HTMLDivElement>(null)
  useBoardKeyboard(containerRef)

  return (
    <div ref={containerRef} tabIndex={0} data-testid="board-container">
      <input type="text" />
    </div>
  )
}
