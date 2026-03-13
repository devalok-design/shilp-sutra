'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { MenuDotsIcon } from '../icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui'
import { EditBreak } from './edit-break'
import { formatOptionalDate } from '../utils/date-utils'
import { renderStatus } from '../utils/render-status'
import { IconButton } from '@/ui/icon-button'
import { isSameDay } from 'date-fns'
import type { BreakRequest } from '../types'

// ============================================================
// Breaks — Break list table showing all breaks
// ============================================================

export interface BreaksProps extends React.HTMLAttributes<HTMLDivElement> {
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

export const Breaks = React.forwardRef<HTMLDivElement, BreaksProps>(
  function Breaks({
  breaks,
  userImages,
  existingBreaks,
  onFetchMonthBreaks,
  onSave,
  onDelete,
  onRefresh: _onRefresh,
  className,
  ...props
}, ref) {
  return (
    <div ref={ref} className={cn("m-0 flex h-[400px] w-full flex-col items-start justify-start p-0 max-md:h-auto", className)} {...props}>
      <div className="mx-auto mb-ds-05 mt-ds-04 flex w-[92%] items-center">
        <div className="w-[16%] min-w-[120px] overflow-hidden px-ds-04 py-ds-03">
          <div className="text-ds-sm font-semibold uppercase tracking-wider text-surface-fg-subtle">NAME</div>
        </div>
        <div className="w-[19%] overflow-hidden px-ds-04 py-ds-03">
          <div className="text-ds-sm font-semibold uppercase tracking-wider text-surface-fg-subtle">DATE</div>
        </div>
        <div className="w-[8%] overflow-hidden px-ds-04 py-ds-03">
          <div className="text-ds-sm font-semibold uppercase tracking-wider w-full text-center text-surface-fg-subtle">
            DAYS
          </div>
        </div>
        <div className="w-[22%] overflow-hidden px-ds-04 py-ds-03">
          <div className="text-ds-sm font-semibold uppercase tracking-wider text-surface-fg-subtle">REASON</div>
        </div>
        <div className="flex w-[14%] items-center justify-start overflow-hidden px-ds-04 py-ds-03">
          <div className="text-ds-sm font-semibold uppercase tracking-wider text-surface-fg-subtle">STATUS</div>
        </div>
        <div className="w-[24%] overflow-hidden px-ds-04 py-ds-03">
          <div className="text-ds-sm font-semibold uppercase tracking-wider text-surface-fg-subtle">COMMENT</div>
        </div>
        <div className="w-ds-lg overflow-hidden px-ds-04 py-ds-03"></div>
      </div>

      {/* intentional: mobile viewport scroll container — magic number accounts for admin shell chrome */}
      <div className="no-scrollbar mx-auto flex w-[92%] flex-col gap-ds-05 overflow-y-auto max-md:h-[calc(100dvh-373px)]">
        {breaks.map((breakItem) => {
          const startDate = new Date(breakItem.startDate)
          const endDate = new Date(breakItem.endDate)
          const isSingleDay_ = isSameDay(startDate, endDate)

          return (
            <div
              key={breakItem.id}
              className="flex w-full items-center hover:bg-surface-3"
            >
              <div className="flex w-[16%] min-w-[120px] items-center gap-ds-03 overflow-hidden px-ds-04 py-ds-03">
                {userImages[breakItem.userId] ? (
                  <img
                    src={userImages[breakItem.userId]}
                    alt={''}
                    className="h-ds-xs-plus w-full max-w-7 flex-shrink-0 rounded-ds-full object-cover"
                  />
                ) : (
                  <span className="flex h-ds-xs-plus w-full max-w-7 items-center justify-center rounded-ds-full bg-surface-2 text-ds-sm font-medium uppercase text-surface-fg">
                    {breakItem.user?.name?.[0] || 'U'}
                  </span>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-ds-md truncate text-surface-fg">
                      {breakItem.user?.name ||
                        breakItem.user?.name?.split(' ')[0]}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{breakItem.user?.name}</TooltipContent>
                </Tooltip>
              </div>

              <div className="w-[19%] overflow-hidden px-ds-04 py-ds-03">
                <span className="text-ds-md whitespace-nowrap text-surface-fg-muted">
                  {formatOptionalDate(startDate)}{' '}
                  {!isSingleDay_ && (
                    <>
                      <span>-</span> {formatOptionalDate(endDate)}
                    </>
                  )}
                </span>
              </div>

              <div className="flex w-[8%] items-center justify-center overflow-hidden px-ds-04 py-ds-03">
                <span className="text-ds-md text-center text-surface-fg-muted">
                  {breakItem.numberOfDays}
                </span>
              </div>

              <div className="w-[22%] overflow-hidden px-ds-04 py-ds-03">
                <span className="text-ds-md text-surface-fg-subtle">
                  {breakItem.reason}
                </span>
              </div>

              <div className="flex w-[14%] items-center justify-start overflow-hidden px-ds-04 py-ds-03">
                <span className="text-ds-md text-surface-fg-subtle">
                  {renderStatus(breakItem?.status, breakItem?.correction)}
                </span>
              </div>

              <div className="w-[24%] overflow-hidden px-ds-04 py-ds-03">
                <span className="text-ds-md text-surface-fg-subtle">
                  {breakItem.adminComment || ' '}
                </span>
              </div>

              <div className="flex w-ds-lg justify-center px-ds-04 py-ds-03">
                <Popover>
                  <PopoverTrigger>
                    <IconButton icon={<MenuDotsIcon />} size="md" aria-label="More options" />
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
},
)

Breaks.displayName = 'Breaks'
