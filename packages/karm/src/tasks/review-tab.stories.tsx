import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ReviewTab, type ReviewRequest } from './review-tab'

// ============================================================
// Mock Data
// ============================================================

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()

const arjun = { id: 'user-1', name: 'Arjun Mehta', image: null }
const priya = { id: 'user-2', name: 'Priya Sharma', image: null }
const kavita = { id: 'user-3', name: 'Kavita Reddy', image: null }
const rahul = { id: 'user-4', name: 'Rahul Verma', image: null }

const members = [arjun, priya, kavita, rahul]

const pendingReview: ReviewRequest = {
  id: 'rev-1',
  taskId: 'task-1',
  status: 'PENDING',
  feedback: null,
  requestedBy: priya,
  reviewer: kavita,
  createdAt: hoursAgo(3),
  updatedAt: hoursAgo(3),
}

const approvedReview: ReviewRequest = {
  id: 'rev-2',
  taskId: 'task-1',
  status: 'APPROVED',
  feedback: 'The implementation is solid. Good test coverage and clean API design. Merging.',
  requestedBy: arjun,
  reviewer: priya,
  createdAt: daysAgo(2),
  updatedAt: daysAgo(1),
}

const changesRequestedReview: ReviewRequest = {
  id: 'rev-3',
  taskId: 'task-1',
  status: 'CHANGES_REQUESTED',
  feedback: 'The error handling in the file upload service needs to be more granular. Currently, all S3 errors return a generic 500. Please add specific error types for: quota exceeded, invalid file type, and network timeout.',
  requestedBy: priya,
  reviewer: rahul,
  createdAt: daysAgo(3),
  updatedAt: daysAgo(2),
}

const rejectedReview: ReviewRequest = {
  id: 'rev-4',
  taskId: 'task-1',
  status: 'REJECTED',
  feedback: 'This approach introduces a circular dependency between the auth and notification modules. We need to refactor the event system first. Closing this for now.',
  requestedBy: kavita,
  reviewer: arjun,
  createdAt: daysAgo(5),
  updatedAt: daysAgo(4),
}

const mixedReviews: ReviewRequest[] = [
  pendingReview,
  approvedReview,
  changesRequestedReview,
]

const allStatuses: ReviewRequest[] = [
  pendingReview,
  approvedReview,
  changesRequestedReview,
  rejectedReview,
]

const multiplePending: ReviewRequest[] = [
  pendingReview,
  {
    id: 'rev-5',
    taskId: 'task-1',
    status: 'PENDING',
    feedback: null,
    requestedBy: arjun,
    reviewer: rahul,
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
]

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof ReviewTab> = {
  title: 'Karm/Tasks/ReviewTab',
  component: ReviewTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ReviewTab } from "@devalok/shilp-sutra-karm/tasks"`',
      },
    },
  },
  args: {
    onRequestReview: fn(),
    onUpdateStatus: fn(),
    members,
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
type Story = StoryObj<typeof ReviewTab>

// ============================================================
// Stories
// ============================================================

/** Mix of pending, approved, and changes requested reviews */
export const Default: Story = {
  args: {
    reviews: mixedReviews,
  },
}

/** Empty state with no reviews yet and the "Request Review" button */
export const Empty: Story = {
  args: {
    reviews: [],
  },
}

/** Single pending review with the "Respond" action available */
export const PendingReview: Story = {
  args: {
    reviews: [pendingReview],
  },
}

/** Approved review with positive feedback displayed */
export const ApprovedReview: Story = {
  args: {
    reviews: [approvedReview],
  },
}

/** Review with changes requested and detailed feedback */
export const ChangesRequested: Story = {
  args: {
    reviews: [changesRequestedReview],
  },
}

/** Rejected review with explanation feedback */
export const Rejected: Story = {
  args: {
    reviews: [rejectedReview],
  },
}

/** All four review statuses displayed together */
export const AllStatuses: Story = {
  args: {
    reviews: allStatuses,
  },
}

/** Multiple pending reviews awaiting response */
export const MultiplePending: Story = {
  args: {
    reviews: multiplePending,
  },
}
