import type { Meta, StoryObj } from '@storybook/react'
import { ActivityTab, type AuditLogEntry } from './activity-tab'

// ============================================================
// Mock Data
// ============================================================

const now = new Date()
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

const baseEntry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'action' | 'metadata'> = {
  actorType: 'USER',
  actorId: 'user-1',
  entityType: 'V2Task',
  entityId: 'task-1',
  projectId: 'proj-1',
}

const sampleActivities: AuditLogEntry[] = [
  {
    ...baseEntry,
    id: 'log-1',
    timestamp: minutesAgo(2),
    action: 'task.moved',
    metadata: { actorName: 'Arjun Mehta', fromColumn: 'In Progress', toColumn: 'Review' },
  },
  {
    ...baseEntry,
    id: 'log-2',
    timestamp: minutesAgo(15),
    action: 'task.commented',
    metadata: { actorName: 'Priya Sharma' },
  },
  {
    ...baseEntry,
    id: 'log-3',
    timestamp: hoursAgo(1),
    action: 'task.assigned',
    metadata: { actorName: 'Kavita Reddy', assigneeName: 'Arjun Mehta' },
  },
  {
    ...baseEntry,
    id: 'log-4',
    timestamp: hoursAgo(2),
    action: 'task.file_uploaded',
    metadata: { actorName: 'Arjun Mehta', fileName: 'wireframe-v3.pdf' },
  },
  {
    ...baseEntry,
    id: 'log-5',
    timestamp: hoursAgo(4),
    action: 'task.updated',
    metadata: { actorName: 'Priya Sharma', field: 'priority', newValue: 'HIGH' },
  },
  {
    ...baseEntry,
    id: 'log-6',
    timestamp: daysAgo(1),
    action: 'task.review_requested',
    metadata: { actorName: 'Arjun Mehta', reviewerName: 'Kavita Reddy' },
  },
  {
    ...baseEntry,
    id: 'log-7',
    timestamp: daysAgo(1),
    action: 'task.visibility_changed',
    metadata: { actorName: 'Kavita Reddy', visibility: 'EVERYONE' },
  },
  {
    ...baseEntry,
    id: 'log-8',
    timestamp: daysAgo(2),
    action: 'task.created',
    metadata: { actorName: 'Priya Sharma' },
  },
]

const allActionTypes: AuditLogEntry[] = [
  {
    ...baseEntry,
    id: 'act-1',
    timestamp: minutesAgo(1),
    action: 'task.created',
    metadata: { actorName: 'Priya Sharma' },
  },
  {
    ...baseEntry,
    id: 'act-2',
    timestamp: minutesAgo(5),
    action: 'task.updated',
    metadata: { actorName: 'Arjun Mehta', field: 'title' },
  },
  {
    ...baseEntry,
    id: 'act-3',
    timestamp: minutesAgo(10),
    action: 'task.updated',
    metadata: { actorName: 'Arjun Mehta', field: 'description' },
  },
  {
    ...baseEntry,
    id: 'act-4',
    timestamp: minutesAgo(15),
    action: 'task.moved',
    metadata: { actorName: 'Kavita Reddy', fromColumn: 'Backlog', toColumn: 'In Progress' },
  },
  {
    ...baseEntry,
    id: 'act-5',
    timestamp: minutesAgo(20),
    action: 'task.assigned',
    metadata: { actorName: 'Priya Sharma', assigneeName: 'Arjun Mehta' },
  },
  {
    ...baseEntry,
    id: 'act-6',
    timestamp: minutesAgo(25),
    action: 'task.unassigned',
    metadata: { actorName: 'Priya Sharma', assigneeName: 'Rahul Verma' },
  },
  {
    ...baseEntry,
    id: 'act-7',
    timestamp: minutesAgo(30),
    action: 'task.commented',
    metadata: { actorName: 'Kavita Reddy' },
  },
  {
    ...baseEntry,
    id: 'act-8',
    timestamp: minutesAgo(35),
    action: 'task.file_uploaded',
    metadata: { actorName: 'Arjun Mehta', fileName: 'design-spec.pdf' },
  },
  {
    ...baseEntry,
    id: 'act-9',
    timestamp: minutesAgo(40),
    action: 'task.review_requested',
    metadata: { actorName: 'Arjun Mehta', reviewerName: 'Priya Sharma' },
  },
  {
    ...baseEntry,
    id: 'act-10',
    timestamp: minutesAgo(45),
    action: 'task.review_completed',
    metadata: { actorName: 'Priya Sharma', status: 'approved' },
  },
  {
    ...baseEntry,
    id: 'act-11',
    timestamp: minutesAgo(50),
    action: 'task.visibility_changed',
    metadata: { actorName: 'Kavita Reddy', visibility: 'EVERYONE' },
  },
  {
    ...baseEntry,
    id: 'act-12',
    timestamp: minutesAgo(55),
    action: 'task.priority_changed',
    metadata: { actorName: 'Priya Sharma', priority: 'URGENT' },
  },
  {
    ...baseEntry,
    id: 'act-13',
    timestamp: hoursAgo(1),
    action: 'task.labels_changed',
    metadata: { actorName: 'Arjun Mehta' },
  },
  {
    ...baseEntry,
    id: 'act-14',
    timestamp: hoursAgo(1),
    action: 'task.due_date_changed',
    metadata: { actorName: 'Kavita Reddy', dueDate: '15 Mar 2026' },
  },
]

const systemAndAgentActivities: AuditLogEntry[] = [
  {
    ...baseEntry,
    id: 'sys-1',
    timestamp: minutesAgo(5),
    actorType: 'SYSTEM',
    actorId: null,
    action: 'task.moved',
    metadata: { fromColumn: 'In Progress', toColumn: 'Done' },
  },
  {
    ...baseEntry,
    id: 'sys-2',
    timestamp: minutesAgo(30),
    actorType: 'AGENT',
    actorId: 'sutradhar',
    action: 'task.updated',
    metadata: { field: 'priority', newValue: 'HIGH' },
  },
  {
    ...baseEntry,
    id: 'sys-3',
    timestamp: hoursAgo(2),
    actorType: 'USER',
    actorId: 'user-1',
    action: 'task.created',
    metadata: { actorName: 'Arjun Mehta' },
  },
]

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof ActivityTab> = {
  title: 'Karm/Tasks/ActivityTab',
  component: ActivityTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ActivityTab>

// ============================================================
// Stories
// ============================================================

/** Realistic activity timeline showing a mix of recent actions */
export const Default: Story = {
  args: {
    activities: sampleActivities,
  },
}

/** Empty state when no activities exist yet */
export const Empty: Story = {
  args: {
    activities: [],
  },
}

/** Every supported action type displayed in the timeline */
export const AllActionTypes: Story = {
  args: {
    activities: allActionTypes,
  },
}

/** Activities from system automations and AI agents alongside users */
export const SystemAndAgentActors: Story = {
  args: {
    activities: systemAndAgentActivities,
  },
}

/** Single activity entry */
export const SingleEntry: Story = {
  args: {
    activities: [
      {
        ...baseEntry,
        id: 'single-1',
        timestamp: minutesAgo(3),
        action: 'task.created',
        metadata: { actorName: 'Priya Sharma' },
      },
    ],
  },
}
