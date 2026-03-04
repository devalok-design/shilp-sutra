import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SubtasksTab, type Subtask } from './subtasks-tab'

// ============================================================
// Mock Data
// ============================================================

const arjun = { id: 'user-1', name: 'Arjun Mehta', image: null }
const priya = { id: 'user-2', name: 'Priya Sharma', image: null }
const kavita = { id: 'user-3', name: 'Kavita Reddy', image: null }

const TERMINAL_COL = 'col-done'

const sampleSubtasks: Subtask[] = [
  {
    id: 'st-1',
    title: 'Set up database schema for user preferences',
    priority: 'HIGH',
    columnId: TERMINAL_COL,
    column: { id: TERMINAL_COL, name: 'Done', isTerminal: true },
    assignees: [{ user: arjun }],
  },
  {
    id: 'st-2',
    title: 'Implement REST API endpoints for CRUD operations',
    priority: 'HIGH',
    columnId: 'col-progress',
    column: { id: 'col-progress', name: 'In Progress' },
    assignees: [{ user: priya }],
  },
  {
    id: 'st-3',
    title: 'Write integration tests for the preferences API',
    priority: 'MEDIUM',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [{ user: kavita }],
  },
  {
    id: 'st-4',
    title: 'Design notification settings UI component',
    priority: 'LOW',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [],
  },
  {
    id: 'st-5',
    title: 'Add email preference validation rules',
    priority: 'URGENT',
    columnId: 'col-progress',
    column: { id: 'col-progress', name: 'In Progress' },
    assignees: [{ user: arjun }],
  },
]

const allCompleted: Subtask[] = sampleSubtasks.map((st) => ({
  ...st,
  columnId: TERMINAL_COL,
  column: { id: TERMINAL_COL, name: 'Done', isTerminal: true },
}))

const halfCompleted: Subtask[] = [
  sampleSubtasks[0], // done
  {
    ...sampleSubtasks[1],
    columnId: TERMINAL_COL,
    column: { id: TERMINAL_COL, name: 'Done', isTerminal: true },
  },
  sampleSubtasks[2],
  sampleSubtasks[3],
]

const unassignedSubtasks: Subtask[] = [
  {
    id: 'ua-1',
    title: 'Research competitor pricing pages',
    priority: 'LOW',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [],
  },
  {
    id: 'ua-2',
    title: 'Draft copy for landing page hero section',
    priority: 'MEDIUM',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [],
  },
  {
    id: 'ua-3',
    title: 'Create responsive mockups for mobile breakpoints',
    priority: 'HIGH',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [],
  },
]

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof SubtasksTab> = {
  title: 'Karm/Tasks/SubtasksTab',
  component: SubtasksTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    projectId: 'proj-1',
    parentTaskId: 'task-1',
    defaultColumnId: 'col-backlog',
    terminalColumnId: TERMINAL_COL,
    onCreateSubtask: fn(),
    onToggleSubtask: fn(),
    onClickSubtask: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SubtasksTab>

// ============================================================
// Stories
// ============================================================

/** Default subtask list with a mix of complete, in-progress, and backlog items */
export const Default: Story = {
  args: {
    subtasks: sampleSubtasks,
  },
}

/** Empty state with no subtasks and the "Add subtask" button */
export const Empty: Story = {
  args: {
    subtasks: [],
  },
}

/** All subtasks completed -- progress bar at 100% */
export const AllCompleted: Story = {
  args: {
    subtasks: allCompleted,
  },
}

/** Half completed -- progress bar at 50% */
export const HalfCompleted: Story = {
  args: {
    subtasks: halfCompleted,
  },
}

/** Single subtask in the list */
export const SingleSubtask: Story = {
  args: {
    subtasks: [sampleSubtasks[1]],
  },
}

/** Read-only mode hides create/toggle controls (client portal view) */
export const ReadOnly: Story = {
  args: {
    subtasks: sampleSubtasks,
    readOnly: true,
  },
}

/** All subtasks unassigned -- no avatar shown on any row */
export const Unassigned: Story = {
  args: {
    subtasks: unassignedSubtasks,
  },
}

/** All priority levels represented for visual comparison */
export const AllPriorities: Story = {
  args: {
    subtasks: [
      {
        id: 'p-low',
        title: 'Low priority subtask',
        priority: 'LOW',
        columnId: 'col-backlog',
        column: { id: 'col-backlog', name: 'Backlog' },
        assignees: [],
      },
      {
        id: 'p-medium',
        title: 'Medium priority subtask',
        priority: 'MEDIUM',
        columnId: 'col-backlog',
        column: { id: 'col-backlog', name: 'Backlog' },
        assignees: [],
      },
      {
        id: 'p-high',
        title: 'High priority subtask',
        priority: 'HIGH',
        columnId: 'col-backlog',
        column: { id: 'col-backlog', name: 'Backlog' },
        assignees: [],
      },
      {
        id: 'p-urgent',
        title: 'Urgent priority subtask',
        priority: 'URGENT',
        columnId: 'col-backlog',
        column: { id: 'col-backlog', name: 'Backlog' },
        assignees: [],
      },
    ],
  },
}
