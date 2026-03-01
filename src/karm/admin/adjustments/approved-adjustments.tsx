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

function ApprovedAdjustments({
  adjustments,
  adminId,
}: ApprovedAdjustmentsProps) {
  return (
    <div className="no-scrollbar w-full overflow-auto border border-[var(--color-border-subtle)] sm:rounded-[8px] max-md:rounded-none max-md:border-0">
      <div className="bg-[var(--color-layer-02)] pb-[24px] pl-[16px] pt-[8px] md:p-[16px]">
        <div className="no-scrollbar w-full overflow-x-auto overflow-y-auto">
          <div className="min-w-[800px] max-md:w-[max-content]">
            <div className="L3 sticky top-0 grid grid-cols-[200px_160px_80px_1fr_1fr_1fr] gap-4 py-2 uppercase text-[var(--color-text-placeholder)] sm:px-6">
              <div className="p-[10px] pl-3">User</div>
              <div className="p-[10px] pl-3">Date</div>
              <div className="p-[10px] text-center">Days</div>
              <div className="p-[10px] pl-3">Type</div>
              <div className="p-[10px]">Reason</div>
              <div className="p-[10px]">Approved By</div>
            </div>
            <div className="P3 no-scrollbar overflow-y-auto md:max-h-[414px] max-md:h-[calc(100vh-366px)] max-md:max-h-[calc(100vh-366px)] max-md:overflow-visible max-md:overflow-y-auto max-md:overflow-x-visible">
              {adjustments.length === 0 ? (
                <div className="flex justify-center p-4 text-[var(--color-text-tertiary)]">
                  No approved adjustments found
                </div>
              ) : (
                adjustments.map((adjustment) => (
                  <div
                    key={adjustment.id}
                    className="grid grid-cols-[200px_160px_80px_1fr_1fr_1fr] gap-4 bg-[var(--color-layer-02)] py-2 sm:px-6"
                  >
                    <div className="p-[10px] pl-3 text-[var(--color-text-secondary)]">
                      {adjustment.user?.name || 'Unknown User'}
                    </div>
                    <div className="w-[160px] p-[10px] text-[var(--color-text-secondary)]">
                      {formatDate(new Date(adjustment.createdAt))}
                    </div>
                    <div className="w-[80px] p-[10px] text-center text-[var(--color-text-secondary)]">
                      {adjustment.numberOfDays}
                    </div>
                    <div className="max-w-[350px] p-[10px] pl-3 text-[var(--color-text-tertiary)]">
                      {adjustment.type}
                    </div>
                    <div className="max-w-[350px] p-[10px] text-[var(--color-text-secondary)]">
                      {adjustment.reason || '-'}
                    </div>
                    <div className="p-[10px] text-[var(--color-text-secondary)]">
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
}

ApprovedAdjustments.displayName = 'ApprovedAdjustments'

export { ApprovedAdjustments }
