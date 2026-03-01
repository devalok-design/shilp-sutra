'use client'

// ============================================================
// BreakRequest — Displays break details for a selected date
// ============================================================

import * as React from 'react'
import { useEffect, useState } from 'react'
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

export function BreakRequestCard({
  selectedDate,
  userId,
  breakRequest,
  assetsBaseUrl = '',
  onCancelBreak,
  onRefreshAttendance,
  onRefreshGroupedAttendance,
}: BreakRequestProps) {
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
    <div className="relative flex w-full flex-col gap-6 rounded-[8px] bg-[var(--Surface-Purple-button-tertiary)]">
      {assetsBaseUrl && (
        <img
          src={`${assetsBaseUrl}/break-background.svg`}
          alt="Break Background"
          className="absolute bottom-0 z-0 h-full min-h-[236px] rounded-[8px] object-cover"
        />
      )}
      <div className="relative flex min-h-[236px] flex-col items-center justify-between rounded-[8px] md:flex-row">
        {/* Left section - Break information or mobile cancel form */}
        {showMobileCancelForm && isSingleDayBreak ? (
          <div className="flex h-full w-full flex-col items-center justify-center px-[13px] pt-[17px]">
            <div className="w-full gap-4 rounded-md bg-[var(--Mapped-Surface-Primary)] px-6 py-8 md:hidden">
              <div className="flex flex-col items-center gap-[12px]">
                <div className="T7-Reg semibold text-center text-[var(--Mapped-Text-Primary)]">
                  Cancel this break?
                </div>
                <div className="B1-Reg max-w-[240px] text-center text-[var(--Mapped-Text-Tertiary)] max-md:leading-[100%]">
                  You&apos;re about to cancel the break scheduled for{' '}
                  <span className="semibold text-[var(--Mapped-Text-Secondary)]">
                    {formatBreakDate(breakRequest.startDate)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex w-full flex-col gap-3">
                <button
                  className="B2 semibold w-full rounded-[88px] border border-[var(--Mapped-Surface-Button-Primary)] bg-[var(--Mapped-Surface-Button-Primary)] px-[20px] py-[12px] text-center text-[var(--Mapped-Text-On-Dark-Primary)]"
                  style={{
                    boxShadow:
                      '0px 1px 3px 0.05px rgba(24, 24, 27, 0.24), 0px 8px 16px 0px rgba(255, 255, 255, 0.16) inset, 0px 2px 0px 0px rgba(255, 255, 255, 0.10) inset',
                  }}
                  onClick={handleCancelBreak}
                >
                  Yes, cancel
                </button>
              </div>
              <button
                className="absolute right-4 top-4 rounded-sm p-3 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => setShowMobileCancelForm(false)}
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 px-6 py-8 md:w-1/2 md:p-8">
            <div className="flex flex-col items-center justify-end gap-4">
              <div className="L3 text-[var(--Mapped-Text-Tertiary)]">
                Reason
              </div>
              <div className="T7-Reg semibold text-[var(--Mapped-Text-Primary)]">
                {removeAllEmojis(breakRequest?.reason || ' ')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-end gap-4">
              <div className="L3 text-[var(--Mapped-Text-Tertiary)]">
                Break Period
              </div>
              <div className="T7-Reg semibold text-[var(--Mapped-Text-Primary)]">
                {formatDate(new Date(breakRequest.startDate))}{' '}
                {breakRequest.numberOfDays > 1 && (
                  <>- {formatDate(new Date(breakRequest.endDate))} </>
                )}
                <span className="T7-Reg text-[var(--Mapped-Text-Secondary)] opacity-60">
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
            <div className="h-[1px] w-[329px] bg-[var(--border-secondary)] md:hidden max-md:w-[90%]"></div>
            <div className="hidden h-[170px] w-[2px] bg-[var(--border-secondary)] md:block"></div>
          </>
        )}
        <div
          className={`flex w-full flex-col items-center justify-center px-4 ${
            showMobileCancelForm ||
            breakRequest.status === 'APPROVED' ||
            breakRequest.status === 'REJECTED'
              ? 'pb-6 pt-[9px]'
              : 'py-6'
          } md:w-1/2 md:px-6 md:py-4 max-md:pt-[34px]`}
        >
          <p className="L3 mb-6 uppercase text-[var(--Mapped-Text-Tertiary)] max-md:mb-[16px]">
            Break Status
          </p>
          <div className="mb-3 flex w-full flex-col items-center justify-start gap-[14px] rounded-3xl border border-[var(--border-secondary)] bg-[var(--Mapped-Surface-Primary)] px-4 py-3.5 text-center font-semibold text-[var(--Mapped-Text-Primary)]">
            {renderStatus(breakRequest.status, false)}
            {breakRequest.status === 'APPROVED' && breakRequest.adminComment}
            {breakRequest.status === 'REJECTED' && breakRequest.adminComment}
          </div>

          {isSingleDayBreak ? (
            <>
              {isBreakCancellable() && onCancelBreak && (
                <button
                  className="P4 cursor-pointer border-none bg-transparent text-[var(--Mapped-Text-Highlight2)] underline md:hidden"
                  onClick={() => setShowMobileCancelForm(!showMobileCancelForm)}
                >
                  Want to cancel this break?
                </button>
              )}

              {/* Desktop: Show dialog for single day */}
              <Dialog>
                {isBreakCancellable() && onCancelBreak && (
                  <DialogTrigger asChild>
                    <button className="P4 hidden cursor-pointer border-none bg-transparent text-[var(--Mapped-Text-Highlight2)] underline md:block">
                      Want to cancel this break?
                    </button>
                  </DialogTrigger>
                )}
                <DialogContent className="max-w-[329px] gap-3 rounded-[16px]">
                  <DialogHeader>
                    <div className="T7-Reg semibold text-center text-[var(--Mapped-Text-Primary)]">
                      Cancel this break?
                    </div>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-start">
                    <div className="B1-Reg max-w-[241px] text-center text-[var(--Mapped-Text-Tertiary)]">
                      You&apos;re about to cancel the break scheduled for{' '}
                      <span className="semibold text-[var(--Mapped-Text-Secondary)]">
                        {formatBreakDate(breakRequest.startDate)}
                      </span>
                    </div>
                  </div>
                  <DialogFooter className="mt-3 sm:justify-start">
                    <DialogClose asChild>
                      <button
                        className="B2 semibold w-full rounded-[88px] border border-[var(--Mapped-Surface-Button-Primary)] bg-[var(--Mapped-Surface-Button-Primary)] px-[20px] py-[12px] text-center text-[var(--Mapped-Text-On-Dark-Primary)]"
                        style={{
                          boxShadow:
                            '0px 1px 3px 0.05px rgba(24, 24, 27, 0.24), 0px 8px 16px 0px rgba(255, 255, 255, 0.16) inset, 0px 2px 0px 0px rgba(255, 255, 255, 0.10) inset',
                        }}
                        onClick={handleCancelBreak}
                      >
                        Yes, cancel
                      </button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Dialog>
              {isBreakCancellable() && onCancelBreak && (
                <DialogTrigger asChild>
                  <button className="P4 cursor-pointer border-none bg-transparent text-[var(--Mapped-Text-Highlight2)] underline">
                    Want to cancel this break?
                  </button>
                </DialogTrigger>
              )}
              <DialogContent className="max-w-[329px] gap-3 rounded-[16px]">
                <DialogHeader>
                  <div className="T7-Reg semibold flex text-center text-[var(--Mapped-Text-Primary)]">
                    Cancel your break
                  </div>
                </DialogHeader>
                <div className="flex flex-col items-center justify-start">
                  <div className="flex w-full flex-col items-start">
                    <label className="breakRequest-checkbox flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={deleteSingleDay}
                        onChange={(e) => setDeleteSingleDay(e.target.checked)}
                        className="roundec-full"
                      />
                      <span className="text-[var(--Mapped-Text-Secondary)]">
                        {getDaySuffix(new Date(selectedDate).getDate())} break
                        only
                      </span>
                    </label>
                    <label className="breakRequest-checkbox mt-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!deleteSingleDay}
                        onChange={(e) => setDeleteSingleDay(!e.target.checked)}
                        className="rounded-full"
                      />
                      <span className="text-[var(--Mapped-Text-Secondary)]">
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
                <DialogFooter className="mt-3 sm:justify-start">
                  <DialogClose asChild>
                    <button
                      className="B2 semibold w-full rounded-[88px] border border-[var(--Mapped-Surface-Button-Primary)] bg-[var(--Mapped-Surface-Button-Primary)] px-[20px] py-[12px] text-center text-[var(--Mapped-Text-On-Dark-Primary)]"
                      style={{
                        boxShadow:
                          '0px 1px 3px 0.05px rgba(24, 24, 27, 0.24), 0px 8px 16px 0px rgba(255, 255, 255, 0.16) inset, 0px 2px 0px 0px rgba(255, 255, 255, 0.10) inset',
                      }}
                      onClick={handleCancelBreak}
                    >
                      Yes, cancel
                    </button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}

BreakRequestCard.displayName = 'BreakRequestCard'
