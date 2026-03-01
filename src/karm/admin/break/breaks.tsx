'use client'

import { MenuDotsIcon } from '../icons'
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover'
import { EditBreak } from './edit-break'
import { formatOptionalDate } from '../utils/date-utils'
import { renderStatus } from '../utils/render-status'
import { IconButton } from '../../custom-buttons/icon-button'
import { isSameDay } from 'date-fns'
import type { BreakRequest } from '../types'

// ============================================================
// Breaks — Break list table showing all breaks
// ============================================================

export interface BreaksProps {
  breaks: BreakRequest[]
  userImages: Record<string, string>
  existingBreaks?: BreakRequest[]
  onFetchMonthBreaks?: (month: number, year: number) => Promise<BreakRequest[]>
  onSave?: (data: {
    requestId: string
    userId: string
    status: string
    adminComment: string
    startDate: string
    endDate: string
    isEditing: boolean
  }) => void
  onDelete?: () => void
  onRefresh?: () => void
}

export function Breaks({
  breaks,
  userImages,
  existingBreaks,
  onFetchMonthBreaks,
  onSave,
  onDelete,
  onRefresh: _onRefresh,
}: BreaksProps) {
  return (
    <div className="m-0 flex h-[400px] w-full flex-col items-start justify-start p-0 max-md:h-auto">
      <div className="mx-auto mb-4 mt-3 flex w-[92%] items-center">
        <div className="w-[16%] min-w-[120px] overflow-hidden px-3 py-2">
          <div className="L3 text-[var(--color-text-tertiary)]">NAME</div>
        </div>
        <div className="w-[19%] overflow-hidden px-3 py-2">
          <div className="L3 text-[var(--color-text-tertiary)]">DATE</div>
        </div>
        <div className="w-[8%] overflow-hidden px-3 py-2">
          <div className="L3 w-full text-center text-[var(--color-text-tertiary)]">
            DAYS
          </div>
        </div>
        <div className="w-[22%] overflow-hidden px-3 py-2">
          <div className="L3 text-[var(--color-text-tertiary)]">REASON</div>
        </div>
        <div className="flex w-[14%] items-center justify-start overflow-hidden px-3 py-2">
          <div className="L3 text-[var(--color-text-tertiary)]">STATUS</div>
        </div>
        <div className="w-[24%] overflow-hidden px-3 py-2">
          <div className="L3 text-[var(--color-text-tertiary)]">COMMENT</div>
        </div>
        <div className="w-12 overflow-hidden px-3 py-2"></div>
      </div>

      <div className="no-scrollbar mx-auto flex w-[92%] flex-col gap-4 overflow-y-auto max-md:h-[calc(100vh-373px)]">
        {breaks.map((breakItem) => {
          const startDate = new Date(breakItem.startDate)
          const endDate = new Date(breakItem.endDate)
          const isSingleDay_ = isSameDay(startDate, endDate)

          return (
            <div
              key={breakItem.id}
              className="flex w-full items-center hover:bg-gray-50"
            >
              <div className="flex w-[16%] min-w-[120px] items-center gap-2 overflow-hidden px-3 py-2">
                {userImages[breakItem.userId] ? (
                  <img
                    src={userImages[breakItem.userId]}
                    alt={''}
                    className="h-7 w-full max-w-7 flex-shrink-0 rounded-[var(--radius-full)] object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-full max-w-7 items-center justify-center rounded-[var(--radius-full)] bg-[var(--mapped-borders-margin-tertiary)] text-xs font-medium uppercase text-[--color-text-primary]">
                    {breakItem.user?.name?.[0] || 'U'}
                  </span>
                )}
                <div className="group relative truncate">
                  <span className="P3 text-[var(--color-text-primary)]">
                    {breakItem.user?.name ||
                      breakItem.user?.name?.split(' ')[0]}
                  </span>
                  <div className="P3 invisible absolute left-0 top-full z-10 mt-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-sm text-[var(--color-text-on-color)] shadow-lg group-hover:visible">
                    {breakItem.user?.name}
                  </div>
                </div>
              </div>

              <div className="w-[19%] overflow-hidden px-3 py-2">
                <span className="P3 whitespace-nowrap text-[var(--color-text-secondary)]">
                  {formatOptionalDate(startDate)}{' '}
                  {!isSingleDay_ && (
                    <>
                      <span>-</span> {formatOptionalDate(endDate)}
                    </>
                  )}
                </span>
              </div>

              <div className="flex w-[8%] items-center justify-center overflow-hidden px-3 py-2">
                <span className="P3 text-center text-[var(--color-text-secondary)]">
                  {breakItem.numberOfDays}
                </span>
              </div>

              <div className="w-[22%] overflow-hidden px-3 py-2">
                <span className="P3 text-[var(--color-text-tertiary)]">
                  {breakItem.reason}
                </span>
              </div>

              <div className="flex w-[14%] items-center justify-start overflow-hidden px-3 py-2">
                <span className="P3 text-[var(--color-text-tertiary)]">
                  {renderStatus(breakItem?.status, breakItem?.correction)}
                </span>
              </div>

              <div className="w-[24%] overflow-hidden px-3 py-2">
                <span className="P3 text-[var(--color-text-tertiary)]">
                  {breakItem.adminComment || ' '}
                </span>
              </div>

              <div className="flex w-12 justify-center px-3 py-2">
                <Popover>
                  <PopoverTrigger>
                    <IconButton icon={<MenuDotsIcon />} size="medium" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <EditBreak
                      selectedLeave={breakItem}
                      existingBreaks={existingBreaks}
                      onFetchMonthBreaks={onFetchMonthBreaks}
                      onSave={onSave}
                      onDelete={onDelete}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

Breaks.displayName = 'Breaks'
