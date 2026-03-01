'use client'

// ============================================================
// CorrectionList — Attendance correction requests tab content
// Extracted from admin-dashboard.tsx
// ============================================================

import { Fragment } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../ui/tooltip'
import { CrossIcon, TickIcon } from '../icons'
import { formatDateWithWeekday } from '../utils/date-utils'
import type { AdminUser, CorrectionStatus } from '../types'

// ============================================================
// Types
// ============================================================

export interface AttendanceCorrection {
  id: string
  date: string
  reason?: string
  requestedDate?: string
  correctionStatus: CorrectionStatus
  user?: AdminUser
}

export interface CorrectionListProps {
  corrections: AttendanceCorrection[]
  currentUserId: string
  userImages: Record<string, string>
  assetsBaseUrl: string
  activeTimeFrame: string
  onApproveCorrection?: (correctionId: string) => void | Promise<void>
  onRejectCorrection?: (correctionId: string) => void | Promise<void>
}

// ============================================================
// Component
// ============================================================

export function CorrectionList({
  corrections,
  currentUserId,
  userImages,
  assetsBaseUrl,
  activeTimeFrame,
  onApproveCorrection,
  onRejectCorrection,
}: CorrectionListProps) {
  const handleCorrectionAction = async (
    correction: AttendanceCorrection,
    status: CorrectionStatus,
  ) => {
    if (status === 'APPROVED') {
      await onApproveCorrection?.(correction.id)
    } else {
      await onRejectCorrection?.(correction.id)
    }
  }

  if (corrections.length === 0) {
    return (
      <div className="p-4 text-center">No pending corrections</div>
    )
  }

  return (
    <div
      className={`flex max-h-[200px] w-full flex-col overflow-y-auto bg-[var(--color-layer-01)] px-6 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[372px] max-md:p-0 ${activeTimeFrame === 'weekly1' ? 'max-md:h-[calc(100vh-824px)] max-md:max-h-[calc(100vh-824px)]' : ''}`}
    >
      {corrections.map((correction) => (
        <Fragment key={correction.id}>
          <div className="max-md:border-1 flex items-center justify-between px-2 py-3.5 max-md:rounded-[8px] max-md:border-[var(--color-border-default)]">
            <div className="flex items-center gap-3">
              <img
                className="h-10 w-10 rounded-[var(--radius-full)] border-2 max-md:mb-[auto]"
                src={
                  userImages[correction?.user?.id || ''] ||
                  (assetsBaseUrl
                    ? assetsBaseUrl + '/Goutham.png'
                    : '')
                }
                width={40}
                height={40}
                alt={`${correction?.user?.name}'s Icon`}
              />
              <div className="flex flex-col gap-1">
                <p className="B3-Reg text-[var(--color-text-secondary)]">
                  {correction?.user?.name}
                </p>
                <div className="flex w-full flex-wrap items-center gap-2">
                  <p className="B1 semibold text-[var(--color-text-primary)]">
                    {correction?.reason}
                  </p>
                  {correction?.reason ? (
                    <p className="B1 font-semibold text-[var(--color-text-tertiary)]">
                      &bull;
                    </p>
                  ) : null}
                  <p className="B1-Reg text-[var(--color-text-tertiary)]">
                    {formatDateWithWeekday(
                      new Date(correction?.date),
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 max-md:flex-col max-md:justify-center max-md:gap-0">
              <div className="p-1">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      className={`rounded-[var(--radius-full)] p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] ${
                        correction?.user?.id === currentUserId
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                      onClick={() =>
                        correction?.user?.id !==
                          currentUserId &&
                        handleCorrectionAction(
                          correction,
                          'REJECTED',
                        )
                      }
                      disabled={
                        correction?.user?.id === currentUserId
                      }
                    >
                      <CrossIcon className="h-6 w-6" />
                    </button>
                  </TooltipTrigger>
                  {correction?.user?.id === currentUserId && (
                    <TooltipContent>
                      <p>
                        You cannot approve/reject your own
                        correction request
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              <div className="p-1">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      className={`rounded-[var(--radius-full)] p-2 ${
                        correction?.user?.id === currentUserId
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                      onClick={() =>
                        correction?.user?.id !==
                          currentUserId &&
                        handleCorrectionAction(
                          correction,
                          'APPROVED',
                        )
                      }
                      disabled={
                        correction?.user?.id === currentUserId
                      }
                    >
                      <TickIcon className="h-6 w-6 text-[var(--color-text-success)]" />
                    </button>
                  </TooltipTrigger>
                  {correction?.user?.id === currentUserId && (
                    <TooltipContent>
                      <p>
                        You cannot approve/reject your own
                        correction request
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

CorrectionList.displayName = 'CorrectionList'
