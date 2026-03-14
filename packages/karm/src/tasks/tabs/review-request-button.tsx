'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { MemberPicker } from '@/composed/member-picker'
import { IconPlus } from '@tabler/icons-react'
import type { Member } from '../task-types'

// ============================================================
// Types
// ============================================================

export interface ReviewRequestButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  members: Member[]
  onRequest: (reviewerId: string) => void
}

// ============================================================
// ReviewRequestButton
// ============================================================

const ReviewRequestButton = React.forwardRef<HTMLDivElement, ReviewRequestButtonProps>(
  function ReviewRequestButton({ members, onRequest, className, ...props }, ref) {
    const pickerMembers = React.useMemo(
      () => members.map((m) => ({ id: m.id, name: m.name, avatar: m.image ?? undefined })),
      [members],
    )

    return (
      <div ref={ref} className={cn(className)} {...props}>
        <MemberPicker
          members={pickerMembers}
          selectedIds={[]}
          onSelect={(memberId) => onRequest(memberId)}
        >
          <button
            type="button"
            className="mt-ds-04 inline-flex items-center gap-ds-02b rounded-ds-lg px-ds-03 py-ds-02b text-ds-md text-surface-fg-subtle transition-colors hover:bg-surface-3 hover:text-surface-fg-muted"
          >
            <IconPlus className="h-ico-sm w-ico-sm" stroke={1.5} />
            Request Review
          </button>
        </MemberPicker>
      </div>
    )
  },
)

ReviewRequestButton.displayName = 'ReviewRequestButton'

export { ReviewRequestButton }
