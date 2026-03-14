# ReviewTab

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    reviews: ReviewRequest[] (REQUIRED)
    members: Member[] (REQUIRED)
    onRequestReview: (reviewerId: string) => void (REQUIRED)
    onUpdateStatus: (reviewId: string, status: ReviewRequest['status'], feedback?: string) => void (REQUIRED)
    ...HTMLAttributes<HTMLDivElement>

## ReviewRequest Shape
    id: string
    taskId: string
    status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
    feedback: string | null
    requestedBy: { id: string; name: string; image: string | null }
    reviewer: { id: string; name: string; image: string | null }
    createdAt: string
    updatedAt: string

## Member Shape
    id: string
    name: string
    image: string | null (optional)

## Example
```jsx
<ReviewTab
  reviews={task.reviewRequests}
  members={teamMembers}
  onRequestReview={(reviewerId) => requestReview(reviewerId)}
  onUpdateStatus={(id, status, feedback) => updateReview(id, status, feedback)}
/>
```

## Gotchas
- Each review card shows reviewer avatar, name, requested-by name, and status badge.
- PENDING reviews have a "Respond" button that expands to show feedback textarea and three response buttons: Approve (success), Request Changes (warning), Reject (error).
- "Request Review" button at the bottom uses MemberPicker from core.
- Status badge colors are defined in task-constants.ts via REVIEW_STATUS_MAP.
- Empty state: "No reviews yet".
- Forwards ref to outer div.

## Changes
### v0.18.0
- **Added** Initial release
