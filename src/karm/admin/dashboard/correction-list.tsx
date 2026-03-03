'use client'

// ============================================================
// CorrectionList — Attendance correction requests tab content
// Extracted from admin-dashboard.tsx
// ============================================================

import * as React from 'react'
import { Fragment } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '../../../ui/avatar'
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

export const CorrectionList = React.forwardRef<HTMLDivElement, CorrectionListProps>(
  function CorrectionList({
  corrections,
  currentUserId,
  userImages,
  assetsBaseUrl,
  activeTimeFrame,
  onApproveCorrection,
  onRejectCorrection,
}, ref) {
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
      <div ref={ref} className="p-ds-05 text-center">No pending corrections</div>
    )
  }

  return (
    <div
      ref={ref}
      className={`flex max-h-[200px] w-full flex-col overflow-y-auto bg-layer-01 px-ds-06 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[372px] max-md:p-0 ${activeTimeFrame === 'weekly1' ? 'max-md:h-[calc(100vh-824px)] max-md:max-h-[calc(100vh-824px)]' : ''}`}
    >
      {corrections.map((correction) => (
        <Fragment key={correction.id}>
          <div className="max-md:border-1 flex items-center justify-between px-ds-03 py-3.5 max-md:rounded-ds-lg max-md:border-border">
            <div className="flex items-center gap-ds-04">
              <Avatar className="h-10 w-10 border-2 max-md:mb-[auto]">
                <AvatarImage
                  src={
                    userImages[correction?.user?.id || ''] ||
                    (assetsBaseUrl
                      ? assetsBaseUrl + '/Goutham.png'
                      : '')
                  }
                  alt={`${correction?.user?.name}'s Icon`}
                />
                <AvatarFallback>{correction?.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-ds-02">
                <p className="text-ds-sm text-text-secondary">
                  {correction?.user?.name}
                </p>
                <div className="flex w-full flex-wrap items-center gap-ds-03">
                  <p className="text-ds-base font-semibold text-text-primary">
                    {correction?.reason}
                  </p>
                  {correction?.reason ? (
                    <p className="text-ds-base font-semibold text-text-tertiary">
                      &bull;
                    </p>
                  ) : null}
                  <p className="text-ds-base text-text-tertiary">
                    {formatDateWithWeekday(
                      new Date(correction?.date),
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-ds-04 max-md:flex-col max-md:justify-center max-md:gap-0">
              <div className="p-ds-02">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      className={`rounded-ds-full p-ds-03 text-text-tertiary hover:text-text-secondary ${
                        correction?.user?.id === currentUserId
                          ? 'cursor-not-allowed opacity-[0.38]'
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
              <div className="p-ds-02">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      className={`rounded-ds-full p-ds-03 ${
                        correction?.user?.id === currentUserId
                          ? 'cursor-not-allowed opacity-[0.38]'
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
                      <TickIcon className="h-6 w-6 text-text-success" />
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
},
)

CorrectionList.displayName = 'CorrectionList'
