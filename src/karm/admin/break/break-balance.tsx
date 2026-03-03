'use client'

import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '../../../ui/avatar'
import type { BreakBalanceData } from '../types'

// ============================================================
// BreakBalance — Balance table showing each user's break totals
// ============================================================

export interface BreakBalanceProps {
  breakBalanceData: BreakBalanceData[]
  userImages: Record<string, string>
  onSaveBalance?: (data: {
    userId: string
    cashOutDays: number
    carryForward: number
    year: number
  }) => void
}

export const BreakBalance = React.forwardRef<HTMLDivElement, BreakBalanceProps>(
  function BreakBalance({
  breakBalanceData,
  userImages,
  onSaveBalance: _onSaveBalance,
}, ref) {
  return (
    <div ref={ref} className="m-0 flex h-[400px] flex-col items-start justify-start p-0 max-md:h-auto">
      <div className="m-0 mx-[4%] mb-ds-05 mt-ds-04 flex w-[92%] items-start justify-start gap-ds-03 p-0 text-text-placeholder">
        <div className="text-ds-sm font-semibold uppercase tracking-wider w-[16.4%] min-w-[120px] px-ds-04 py-[10px] text-text-tertiary">
          NAME
        </div>
        <div className="text-ds-sm font-semibold uppercase tracking-wider w-[16.4%] px-ds-04 py-[10px] text-text-tertiary">
          Total Balance
        </div>
      </div>

      <div className="no-scrollbar mx-[4%] flex w-[92%] flex-col gap-ds-05 overflow-y-auto max-md:h-[calc(100vh-373px)]">
        {breakBalanceData.map((breakItem) => (
          <div
            key={breakItem.id}
            className="flex w-full flex-row items-center justify-start gap-ds-03 !border-0 text-left hover:bg-field"
          >
            <div className="flex w-1/6 min-w-[120px] items-center gap-ds-03 p-ds-04">
              <Avatar className="h-ds-xs-plus w-ds-xs-plus">
                <AvatarImage src={userImages[breakItem.userId]} alt={breakItem.user?.name || ''} />
                <AvatarFallback>{breakItem.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="w-[calc(100%-36px)]">
                <span className="text-ds-md block w-full cursor-default truncate text-text-primary">
                  {breakItem.user?.firstName ??
                    breakItem.user?.name?.split(' ')[0]}
                </span>
              </div>
            </div>
            <div className="text-ds-md w-[16.4%] p-ds-04 px-ds-04 text-interactive">
              {breakItem.totalDays}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
},
)

BreakBalance.displayName = 'BreakBalance'
