'use client'

// ============================================================
// BreakRequest — Displays break details for a selected date
// ============================================================

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '../../../ui/button'
import { Checkbox } from '../../../ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../../ui/dialog'
import { CloseIcon } from '../icons'
import { formatDate, getDaySuffix } from '../utils/date-utils'
import { removeAllEmojis } from '../utils/emoji-utils'
import { renderStatus } from '../utils/render-status'
import {
  format,
  startOfDay,
  isAfter,
  isSameDay as fnsIsSameDay,
} from 'date-fns'
import type { BreakRequest as BreakRequestType } from '../types'

// ============================================================
// Props
// ============================================================

export interface BreakRequestProps {
  /** The currently selected date */
  selectedDate: string | Date
  /** The user ID whose break is displayed */
  userId: string
  /** The break request data to display (pre-fetched) */
  breakRequest?: BreakRequestType | null
  /** Optional base URL for static assets */
  assetsBaseUrl?: string
  /** Callback to cancel a break */
  onCancelBreak?: (params: {
    requestId: string
    deleteSingleDay: boolean
    dateToCancel: string | Date
    userId: string
  }) => void | Promise<void>
  /** Callback invoked after a successful cancel to refresh the selected user's attendance */
  onRefreshAttendance?: () => void | Promise<void>
  /** Callback invoked after a successful cancel to refresh grouped attendance data */
  onRefreshGroupedAttendance?: () => void | Promise<void>
}

// ============================================================
// Component
// ============================================================

export const BreakRequestCard = React.forwardRef<HTMLDivElement, BreakRequestProps>(
  function BreakRequestCard({
  selectedDate,
  userId,
  breakRequest,
  assetsBaseUrl = '',
  onCancelBreak,
  onRefreshAttendance,
  onRefreshGroupedAttendance,
}, ref) {
  const [deleteSingleDay, setDeleteSingleDay] = useState(true)
  const [showMobileCancelForm, setShowMobileCancelForm] = useState(false)

  useEffect(() => {
    setShowMobileCancelForm(false)
  }, [selectedDate])

  // ============================================================
  // Helpers
  // ============================================================

  const isSingleDayBreak = breakRequest && breakRequest.numberOfDays === 1

  const isBreakCancellable = () => {
    if (!breakRequest) return false

    const today = startOfDay(new Date())
    const breakEndDay = startOfDay(new Date(breakRequest.endDate))

    return fnsIsSameDay(breakEndDay, today) || isAfter(breakEndDay, today)
  }

  const handleCancelBreak = async () => {
    if (!breakRequest || !onCancelBreak) return

    await onCancelBreak({
      requestId: breakRequest.id,
      deleteSingleDay,
      dateToCancel: selectedDate,
      userId,
    })

    setShowMobileCancelForm(false)
    onRefreshAttendance?.()
    onRefreshGroupedAttendance?.()
  }

  const formatBreakDate = (date: string | Date): string => {
    return format(new Date(date), 'dd/MM/yyyy')
  }

  // ============================================================
  // Render
  // ============================================================

  if (!breakRequest || breakRequest.status === 'CANCELLED') {
    return null
  }

  return (
    <div ref={ref} className="relative flex w-full flex-col gap-ds-06 rounded-ds-lg bg-layer-accent-subtle">
      {assetsBaseUrl && (
        <img
          src={`${assetsBaseUrl}/break-background.svg`}
          alt="Break Background"
          className="absolute bottom-0 z-0 h-full min-h-[236px] rounded-ds-lg object-cover"
        />
      )}
      <div className="relative flex min-h-[236px] flex-col items-center justify-between rounded-ds-lg md:flex-row">
        {/* Left section - Break information or mobile cancel form */}
        {showMobileCancelForm && isSingleDayBreak ? (
          <div className="flex h-full w-full flex-col items-center justify-center px-ds-04 pt-[17px]">
            <div className="w-full gap-ds-05 rounded-ds-md bg-layer-01 shadow-01 px-ds-06 py-ds-07 md:hidden">
              <div className="flex flex-col items-center gap-ds-04">
                <div className="text-ds-lg font-semibold text-center text-text-primary">
                  Cancel this break?
                </div>
                <div className="text-ds-base max-w-[240px] text-center text-text-tertiary max-md:leading-[100%]">
                  You&apos;re about to cancel the break scheduled for{' '}
                  <span className="font-semibold text-text-secondary">
                    {formatBreakDate(breakRequest.startDate)}
                  </span>
                </div>
              </div>
              <div className="mt-ds-05 flex w-full flex-col gap-ds-04">
                <Button variant="primary" className="w-full rounded-ds-full" onClick={handleCancelBreak}>
                  Yes, cancel
                </Button>
              </div>
              <button
                className="absolute right-ds-05 top-ds-05 rounded-ds-sm p-ds-04 text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none"
                onClick={() => setShowMobileCancelForm(false)}
              >
                <CloseIcon className="h-ico-lg w-ico-lg" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-ds-06 p-ds-06 px-ds-06 py-ds-07 md:w-1/2 md:p-ds-07">
            <div className="flex flex-col items-center justify-end gap-ds-05">
              <div className="text-ds-sm font-semibold uppercase tracking-wider text-text-tertiary">
                Reason
              </div>
              <div className="text-ds-lg font-semibold text-text-primary">
                {removeAllEmojis(breakRequest?.reason || ' ')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-end gap-ds-05">
              <div className="text-ds-sm font-semibold uppercase tracking-wider text-text-tertiary">
                Break Period
              </div>
              <div className="text-ds-lg font-semibold text-text-primary">
                {formatDate(new Date(breakRequest.startDate))}{' '}
                {breakRequest.numberOfDays > 1 && (
                  <>- {formatDate(new Date(breakRequest.endDate))} </>
                )}
                <span className="text-ds-lg text-text-placeholder">
                  {`(${breakRequest.numberOfDays} day${
                    breakRequest.numberOfDays > 1 ? 's' : ''
                  })`}
                </span>
              </div>
            </div>
          </div>
        )}
        {!showMobileCancelForm && (
          <>
            <div className="h-[1px] w-[329px] bg-border-subtle md:hidden max-md:w-[90%]"></div>
            <div className="hidden h-[170px] w-[2px] bg-border-subtle md:block"></div>
          </>
        )}
        <div
          className={`flex w-full flex-col items-center justify-center px-ds-05 ${
            showMobileCancelForm ||
            breakRequest.status === 'APPROVED' ||
            breakRequest.status === 'REJECTED'
              ? 'pb-ds-06 pt-[9px]'
              : 'py-ds-06'
          } md:w-1/2 md:px-ds-06 md:py-ds-05 max-md:pt-[34px]`}
        >
          <p className="text-ds-sm font-semibold uppercase tracking-wider mb-ds-06  text-text-tertiary max-md:mb-ds-05">
            Break Status
          </p>
          <div className="mb-ds-04 flex w-full flex-col items-center justify-start gap-ds-04 rounded-ds-2xl border border-border-subtle bg-layer-01 shadow-01 px-ds-05 py-ds-04 text-center font-semibold text-text-primary">
            {renderStatus(breakRequest.status, false)}
            {breakRequest.status === 'APPROVED' && breakRequest.adminComment}
            {breakRequest.status === 'REJECTED' && breakRequest.adminComment}
          </div>

          {isSingleDayBreak ? (
            <>
              {isBreakCancellable() && onCancelBreak && (
                <button
                  className="text-ds-sm cursor-pointer border-none bg-transparent text-interactive-hover underline md:hidden"
                  onClick={() => setShowMobileCancelForm(!showMobileCancelForm)}
                >
                  Want to cancel this break?
                </button>
              )}

              {/* Desktop: Show dialog for single day */}
              <Dialog>
                {isBreakCancellable() && onCancelBreak && (
                  <DialogTrigger asChild>
                    <button className="text-ds-sm hidden cursor-pointer border-none bg-transparent text-interactive-hover underline md:block">
                      Want to cancel this break?
                    </button>
                  </DialogTrigger>
                )}
                <DialogContent className="max-w-[329px] gap-ds-04 rounded-ds-xl">
                  <DialogHeader>
                    <div className="text-ds-lg font-semibold text-center text-text-primary">
                      Cancel this break?
                    </div>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-start">
                    <div className="text-ds-base max-w-[241px] text-center text-text-tertiary">
                      You&apos;re about to cancel the break scheduled for{' '}
                      <span className="font-semibold text-text-secondary">
                        {formatBreakDate(breakRequest.startDate)}
                      </span>
                    </div>
                  </div>
                  <DialogFooter className="mt-ds-04 sm:justify-start">
                    <DialogClose asChild>
                      <Button variant="primary" className="w-full rounded-ds-full" onClick={handleCancelBreak}>
                        Yes, cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Dialog>
              {isBreakCancellable() && onCancelBreak && (
                <DialogTrigger asChild>
                  <button className="text-ds-sm cursor-pointer border-none bg-transparent text-interactive-hover underline">
                    Want to cancel this break?
                  </button>
                </DialogTrigger>
              )}
              <DialogContent className="max-w-[329px] gap-ds-04 rounded-ds-xl">
                <DialogHeader>
                  <div className="text-ds-lg font-semibold flex text-center text-text-primary">
                    Cancel your break
                  </div>
                </DialogHeader>
                <div className="flex flex-col items-center justify-start">
                  <div className="flex w-full flex-col items-start">
                    <label className="breakRequest-checkbox flex items-center space-x-ds-03">
                      <Checkbox
                        checked={deleteSingleDay}
                        onCheckedChange={(checked) => setDeleteSingleDay(checked === true)}
                      />
                      <span className="text-text-secondary">
                        {getDaySuffix(new Date(selectedDate).getDate())} break
                        only
                      </span>
                    </label>
                    <label className="breakRequest-checkbox mt-ds-03 flex items-center space-x-ds-03">
                      <Checkbox
                        checked={!deleteSingleDay}
                        onCheckedChange={(checked) => setDeleteSingleDay(checked !== true)}
                      />
                      <span className="text-text-secondary">
                        {getDaySuffix(
                          new Date(breakRequest.startDate).getDate(),
                        )}{' '}
                        to{' '}
                        {getDaySuffix(new Date(breakRequest.endDate).getDate())}{' '}
                        breaks
                      </span>
                    </label>
                  </div>
                </div>
                <DialogFooter className="mt-ds-04 sm:justify-start">
                  <DialogClose asChild>
                    <Button variant="primary" className="w-full rounded-ds-full" onClick={handleCancelBreak}>
                      Yes, cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
},
)

BreakRequestCard.displayName = 'BreakRequestCard'
