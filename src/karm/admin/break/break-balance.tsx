'use client'

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

export function BreakBalance({
  breakBalanceData,
  userImages,
  onSaveBalance,
}: BreakBalanceProps) {
  return (
    <div className="m-0 flex h-[400px] flex-col items-start justify-start p-0 max-md:h-auto">
      <div className="m-0 mx-[4%] mb-4 mt-3 flex w-[92%] items-start justify-start gap-2 p-0 text-gray-500">
        <div className="L3 w-[16.4%] min-w-[120px] px-3 py-[10px] text-[var(--color-text-tertiary)]">
          NAME
        </div>
        <div className="L3 w-[16.4%] px-3 py-[10px] text-[var(--color-text-tertiary)]">
          Total Balance
        </div>
      </div>

      <div className="no-scrollbar mx-[4%] flex w-[92%] flex-col gap-4 overflow-y-auto max-md:h-[calc(100vh-373px)]">
        {breakBalanceData.map((breakItem) => (
          <div
            key={breakItem.id}
            className="flex w-full flex-row items-center justify-start gap-2 !border-0 text-left hover:bg-gray-50"
          >
            <div className="flex w-1/6 min-w-[120px] items-center gap-2 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-full)] bg-rose-100">
                {userImages[breakItem.userId] ? (
                  <img
                    src={userImages[breakItem.userId]}
                    alt={''}
                    className="h-7 w-7 flex-shrink-0 rounded-[var(--radius-full)] object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-full max-w-7 items-center justify-center rounded-[var(--radius-full)] bg-[var(--mapped-borders-margin-tertiary)] text-xs font-medium uppercase text-[--color-text-primary]">
                    {breakItem.user?.name?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="w-[calc(100%-36px)]">
                <span className="P3 block w-full cursor-default truncate text-[var(--color-text-primary)]">
                  {breakItem.user?.firstName ??
                    breakItem.user?.name?.split(' ')[0]}
                </span>
              </div>
            </div>
            <div className="P3 w-[16.4%] p-[14px] px-3 text-[var(--color-interactive)]">
              {breakItem.totalDays}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

BreakBalance.displayName = 'BreakBalance'
