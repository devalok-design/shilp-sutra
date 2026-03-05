'use client'

import * as React from 'react'
import { useState, type MouseEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/dialog'
import { Textarea } from '@/ui/textarea'
import { CrossIcon, TickIcon } from '../icons'
import { formatDateWithWeekday } from '../utils/date-utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { isSameDay } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/ui/tooltip'
import type { BreakRequest } from '../types'

// ============================================================
// LeaveRequest — Single pending request row with approve/reject actions
// ============================================================

export interface LeaveRequestProps {
  request: BreakRequest
  userImages: Record<string, string>
  handleRejectRequest: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent> | undefined,
    id: string,
    comment?: string,
  ) => void
  handleApproveRequest: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent> | undefined,
    id: string,
    comment?: string,
  ) => void
  commentBoxOpen: boolean
  onCommentBoxClose: () => void
  clickedAction: 'approve' | 'reject' | null
  userId: string
}

export const LeaveRequest = React.forwardRef<HTMLDivElement, LeaveRequestProps>(function LeaveRequest({
  request,
  userImages,
  handleRejectRequest,
  handleApproveRequest,
  commentBoxOpen,
  onCommentBoxClose,
  clickedAction,
  userId,
}, ref) {
  const [comment, setComment] = useState('')

  const startDate = new Date(request.startDate)
  const endDate = new Date(request.endDate)
  const isSingleDay = isSameDay(startDate, endDate)

  return (
    <>
      <div
        ref={ref}
        key={request.id}
        className="flex justify-between border-b border-border px-ds-03 py-ds-04 last:border-b-0"
      >
        <div className="flex w-full items-center gap-ds-04">
          <Avatar className="h-ds-md w-ds-md">
            <AvatarImage src={userImages[request.user?.id || '']} alt={request.user?.name || ''} />
            <AvatarFallback>{(request.user?.name || '?')[0]}</AvatarFallback>
          </Avatar>
          <div className="flex w-auto max-w-[75%] flex-col items-start gap-ds-02b">
            <div className="flex flex-row gap-ds-02b">
              <div className="flex items-center gap-ds-03">
                <p className="text-ds-sm text-text-secondary">
                  {request.user?.name}
                </p>
                {request.correction && (
                  <>
                    <div className="block h-3 w-[1px] bg-border-subtle"></div>{' '}
                    <p className="text-ds-sm text-interactive">
                      Attendance Corrections
                    </p>{' '}
                  </>
                )}
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-ds-04">
              {isSingleDay ? (
                <div className="flex w-full flex-wrap items-center gap-ds-03">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-ds-base font-semibold line-clamp-2 cursor-default text-text-primary">
                        {request.reason}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{request.reason}</TooltipContent>
                  </Tooltip>
                  <p className="text-ds-base text-text-tertiary">
                    • {formatDateWithWeekday(startDate)}
                  </p>
                </div>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-ds-base font-semibold line-clamp-2 cursor-default text-text-primary">
                        {request.reason}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{request.reason}</TooltipContent>
                  </Tooltip>
                  <p className="text-ds-base text-text-tertiary">
                    {formatDateWithWeekday(startDate)} to{' '}
                    {formatDateWithWeekday(endDate)},
                    <span className="text-interactive-hover">
                      {' '}
                      {request.numberOfDays} days
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-ds-04">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) =>
                  request.user?.id !== userId &&
                  handleRejectRequest(e as unknown as MouseEvent<HTMLButtonElement>, request.id)
                }
                disabled={request.user?.id === userId}
                aria-label="Reject break request"
              >
                <CrossIcon className="h-ico-lg w-ico-lg" />
              </Button>
            </TooltipTrigger>
            {request.user?.id === userId && (
              <TooltipContent>
                <p>You cannot approve/reject your own break request</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) =>
                  request.user?.id !== userId &&
                  handleApproveRequest(e as unknown as MouseEvent<HTMLButtonElement>, request.id)
                }
                disabled={request.user?.id === userId}
                aria-label="Approve break request"
              >
                <TickIcon className="h-ico-lg w-ico-lg" />
              </Button>
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
            <DialogTitle className="text-ds-xl">{request.user?.name}</DialogTitle>
            <DialogDescription className="text-ds-lg">
              {request.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="text-ds-md flex flex-col items-start justify-center gap-ds-03 rounded-ds-lg border border-border-subtle bg-layer-01 shadow-01 px-ds-05 pb-ds-01 pt-ds-03 text-text-primary">
              <label className="text-ds-xs font-semibold uppercase tracking-wider text-text-helper" htmlFor="comment">
                Comment
              </label>
              <Textarea
                id="comment"
                defaultValue={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enjoy your break"
                className="resize-none border-none px-0 shadow-none placeholder:font-accent"
              />
            </div>
            <Button
              className="mt-ds-06"
              variant="primary"
              onClick={() => {
                if (clickedAction === 'approve') {
                  handleApproveRequest(undefined, request.id, comment)
                } else if (clickedAction === 'reject') {
                  handleRejectRequest(undefined, request.id, comment)
                }
              }}
            >{clickedAction === 'approve' ? 'Approve' : 'Reject'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})

LeaveRequest.displayName = 'LeaveRequest'
