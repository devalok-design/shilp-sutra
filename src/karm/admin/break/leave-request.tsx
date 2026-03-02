'use client'

import { useState, type MouseEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../ui/dialog'
import { Textarea } from '../../../ui/textarea'
import { CrossIcon, TickIcon } from '../icons'
import { formatDateWithWeekday } from '../utils/date-utils'
import { CustomButton } from '../../custom-buttons/CustomButton'
import { isSameDay } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../ui/tooltip'
import type { BreakRequest } from '../types'

// ============================================================
// LeaveRequest — Single pending request row with approve/reject actions
// ============================================================

export interface LeaveRequestProps {
  request: BreakRequest
  userImages: Record<string, string>
  handleRejectRequest: (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    id: string,
    comment?: string,
  ) => void
  handleApproveRequest: (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    id: string,
    comment?: string,
  ) => void
  commentBoxOpen: boolean
  onCommentBoxClose: () => void
  clickedAction: 'approve' | 'reject' | null
  userId: string
}

export function LeaveRequest({
  request,
  userImages,
  handleRejectRequest,
  handleApproveRequest,
  commentBoxOpen,
  onCommentBoxClose,
  clickedAction,
  userId,
}: LeaveRequestProps) {
  const [comment, setComment] = useState('')

  const startDate = new Date(request.startDate)
  const endDate = new Date(request.endDate)
  const isSingleDay = isSameDay(startDate, endDate)

  return (
    <>
      <div
        key={request.id}
        className="flex justify-between border-b border-[var(--color-border-default)] px-2 py-[14px] last:border-b-0"
      >
        <div className="flex w-full items-center gap-3">
          {userImages[request.user?.id || ''] ? (
            <img
              className="bg-red h-10 w-10 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-layer-02)]"
              src={userImages[request.user?.id || '']}
              alt={''}
            />
          ) : (
            <span className="flex h-7 w-full max-w-7 items-center justify-center rounded-[var(--radius-full)] bg-[var(--mapped-borders-margin-tertiary)] text-xs font-medium uppercase text-[--color-text-primary]">
              {request.user?.name?.[0] || 'U'}
            </span>
          )}
          <div className="flex w-auto max-w-[75%] flex-col items-start gap-[6px]">
            <div className="flex flex-row gap-1.5">
              <div className="flex items-center gap-2">
                <p className="B3-Reg text-[var(--color-text-secondary)]">
                  {request.user?.name}
                </p>
                {request.correction && (
                  <>
                    <div className="block h-3 w-[1px] bg-[var(--color-border-subtle)]"></div>{' '}
                    <p className="B3-Reg text-[var(--color-text-accent)]">
                      Attendance Corrections
                    </p>{' '}
                  </>
                )}
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3">
              {isSingleDay ? (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="B1-Reg semibold line-clamp-2 cursor-default text-[var(--color-text-primary)]">
                        {request.reason}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{request.reason}</TooltipContent>
                  </Tooltip>
                  <p className="B1-Reg text-[var(--color-text-tertiary)]">
                    • {formatDateWithWeekday(startDate)}
                  </p>
                </div>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="B1-Reg semibold line-clamp-2 cursor-default text-[var(--color-text-primary)]">
                        {request.reason}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{request.reason}</TooltipContent>
                  </Tooltip>
                  <p className="B1-Reg text-[var(--color-text-tertiary)]">
                    {formatDateWithWeekday(startDate)} to{' '}
                    {formatDateWithWeekday(endDate)},
                    <span className="text-[var(--color-interactive-hover)]">
                      {' '}
                      {request.numberOfDays} days
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                onClick={(e: MouseEvent<HTMLDivElement>) =>
                  request.user?.id !== userId &&
                  handleRejectRequest(e, request.id)
                }
                className={`cursor-pointer p-2 ${request.user?.id === userId ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <CrossIcon className="h-6 w-6" />
              </div>
            </TooltipTrigger>
            {request.user?.id === userId && (
              <TooltipContent>
                <p>You cannot approve/reject your own break request</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                onClick={(e: MouseEvent<HTMLDivElement>) =>
                  request.user?.id !== userId &&
                  handleApproveRequest(e, request.id)
                }
                className={`cursor-pointer ${request.user?.id === userId ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <TickIcon className="h-6 w-6" />
              </div>
            </TooltipTrigger>
            {request.user?.id === userId && (
              <TooltipContent>
                <p>You cannot approve/reject your own break request</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
      <Dialog
        open={commentBoxOpen}
        onOpenChange={() => {
          onCommentBoxClose()
          setComment('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="T6-Reg">{request.user?.name}</DialogTitle>
            <DialogDescription className="T7-Reg">
              {request.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="B2-Reg flex flex-col items-start justify-center gap-2 rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] p-[10px_16px_4px_16px] text-[var(--color-text-primary)]">
              <label className="L4 text-[#8C8084]" htmlFor="comment">
                Comment
              </label>
              <Textarea
                id="comment"
                defaultValue={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enjoy your break"
                className={`resize-none border-none px-0 shadow-none placeholder:font-["Bricolage_Grotesque"]`}
              />
            </div>
            <CustomButton
              className="mt-6"
              text={clickedAction === 'approve' ? 'Approve' : 'Reject'}
              type="filled"
              onClick={() => {
                // Create a synthetic mouse event for the callback signature
                const syntheticEvent = new window.MouseEvent(
                  'click',
                ) as unknown as MouseEvent<HTMLDivElement>
                if (clickedAction === 'approve') {
                  handleApproveRequest(syntheticEvent, request.id, comment)
                } else if (clickedAction === 'reject') {
                  handleRejectRequest(syntheticEvent, request.id, comment)
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

LeaveRequest.displayName = 'LeaveRequest'
