'use client'

import * as React from 'react'
import { formatDate } from '../utils/date-utils'
import type { Adjustment } from '../types'

// ============================================================
// Types
// ============================================================

export interface ApprovedAdjustmentsProps {
  adjustments: Adjustment[]
  /** Current admin user ID — used to show "You" for self-approved items */
  adminId: string
}

// ============================================================
// Component
// ============================================================

const ApprovedAdjustments = React.forwardRef<HTMLDivElement, ApprovedAdjustmentsProps>(
  function ApprovedAdjustments({
  adjustments,
  adminId,
}, ref) {
  return (
    <div ref={ref} className="no-scrollbar w-full overflow-auto border border-border-subtle sm:rounded-ds-lg max-md:rounded-ds-none max-md:border-0">
      <div className="bg-layer-02 pb-ds-06 pl-ds-05 pt-ds-03 md:p-ds-05">
        <div className="no-scrollbar w-full overflow-x-auto overflow-y-auto">
          {/* intentional: min-w-[800px] ensures table columns don't collapse */}
          <div className="min-w-[800px] max-md:w-[max-content]">
            <div className="text-ds-sm font-semibold uppercase tracking-wider sticky top-0 grid grid-cols-[200px_160px_80px_1fr_1fr_1fr] gap-ds-05 py-ds-03  text-text-placeholder sm:px-ds-06">
              <div className="p-ds-03 pl-ds-04">User</div>
              <div className="p-ds-03 pl-ds-04">Date</div>
              <div className="p-ds-03 text-center">Days</div>
              <div className="p-ds-03 pl-ds-04">Type</div>
              <div className="p-ds-03">Reason</div>
              <div className="p-ds-03">Approved By</div>
            </div>
            {/* intentional: mobile viewport scroll container — magic number accounts for admin shell chrome */}
            <div className="text-ds-md no-scrollbar overflow-y-auto md:max-h-[414px] max-md:h-[calc(100dvh-366px)] max-md:max-h-[calc(100dvh-366px)] max-md:overflow-visible max-md:overflow-y-auto max-md:overflow-x-visible">
              {adjustments.length === 0 ? (
                <div className="flex justify-center p-ds-05 text-text-tertiary">
                  No approved adjustments found
                </div>
              ) : (
                adjustments.map((adjustment) => (
                  <div
                    key={adjustment.id}
                    className="grid grid-cols-[200px_160px_80px_1fr_1fr_1fr] gap-ds-05 bg-layer-02 py-ds-03 sm:px-ds-06"
                  >
                    <div className="p-ds-03 pl-ds-04 text-text-secondary">
                      {adjustment.user?.name || 'Unknown User'}
                    </div>
                    <div className="w-[160px] p-ds-03 text-text-secondary">
                      {formatDate(new Date(adjustment.createdAt))}
                    </div>
                    <div className="w-[80px] p-ds-03 text-center text-text-secondary">
                      {adjustment.numberOfDays}
                    </div>
                    <div className="max-w-[350px] p-ds-03 pl-ds-04 text-text-tertiary">
                      {adjustment.type}
                    </div>
                    <div className="max-w-[350px] p-ds-03 text-text-secondary">
                      {adjustment.reason || '-'}
                    </div>
                    <div className="p-ds-03 text-text-secondary">
                      {adjustment.approver?.name ||
                        (adjustment.approvedBy === adminId ? 'You' : 'Unknown')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
},
)

ApprovedAdjustments.displayName = 'ApprovedAdjustments'

export { ApprovedAdjustments }
