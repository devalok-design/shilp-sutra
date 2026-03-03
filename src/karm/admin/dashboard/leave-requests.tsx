'use client'

// ============================================================
// LeaveRequests — Pending break request list with approve/reject
// ============================================================

import * as React from 'react'
import { useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../ui/tooltip'
import { CrossIcon, TickIcon, SendIcon } from '../icons'
import { useIsMobile } from '../../../hooks/use-mobile'
import { formatDate } from '../utils/date-utils'
import { removeAllEmojis } from '../utils/emoji-utils'
import { isSameDay as fnsIsSameDay } from 'date-fns'
import { useLeaveRequestInteraction } from './use-leave-request-interaction'
import type { BreakRequest } from '../types'

// ============================================================
// Props
// ============================================================

export interface LeaveRequestsProps {
  /** List of pending break requests */
  requests: BreakRequest[]
  /** Current user ID (used to prevent self-approval) */
  currentUserId: string
  /** User images map: userId -> image URL */
  userImages?: Record<string, string>
  /** Active time frame (weekly/monthly) — used for responsive styling */
  activeTimeFrame?: string
  /** Callback when a break is approved */
  onApproveBreak?: (params: {
    requestId: string
    adminComment: string
    userId: string
  }) => void | Promise<void>
  /** Callback when a break is rejected */
  onRejectBreak?: (params: {
    requestId: string
    adminComment: string
    userId: string
  }) => void | Promise<void>
}

// ============================================================
// Component
// ============================================================

export const LeaveRequests = React.forwardRef<HTMLDivElement, LeaveRequestsProps>(
  function LeaveRequests({
  requests,
  currentUserId,
  userImages = {},
  activeTimeFrame,
  onApproveBreak,
  onRejectBreak,
}, ref) {
  const interaction = useLeaveRequestInteraction()
  const isMobile = useIsMobile()

  // ============================================================
  // Ctrl+hover quick-comment shortcut
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        interaction.setIsCtrlPressed(true)
        if (interaction.hoveredRequest) {
          interaction.setActiveAction(interaction.hoverActionTemp)
          interaction.setOpenComment(true)
          interaction.setActiveRequest(interaction.hoveredRequest)
        } else {
          interaction.setOpenComment(false)
          interaction.setActiveAction(null)
          interaction.setActiveRequest(null)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        interaction.setIsCtrlPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction.hoveredRequest, interaction.isCtrlPressed, interaction.openComment, interaction.hoverActionTemp])

  // ============================================================
  // Handlers
  // ============================================================

  const handleMouseEnter = (request: BreakRequest, action: string) => {
    interaction.setHoverActionTemp(action)
    interaction.setHoveredRequest(request)
  }

  const handleRequestSubmit = async (
    request: BreakRequest,
    action: string | null,
  ) => {
    if (!request || !action) return
    interaction.setIsProcessing(true)
    interaction.setOpenComment(false)

    try {
      const params = {
        requestId: request.id,
        adminComment: interaction.message,
        userId: currentUserId,
      }

      if (action === 'approveBreak') {
        await onApproveBreak?.(params)
      } else if (action === 'rejectBreak') {
        await onRejectBreak?.(params)
      }

      interaction.setActiveRequest(null)
      interaction.setActiveAction(null)
      interaction.setMessage('')
    } catch (error) {
      console.error('Error processing break request:', error)
    } finally {
      interaction.setIsProcessing(false)
    }
  }

  // ============================================================
  // Date display helpers
  // ============================================================

  const isSingleDayRequest = (request: BreakRequest): boolean => {
    return fnsIsSameDay(new Date(request.startDate), new Date(request.endDate))
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div
      ref={ref}
      className={`no-scrollbar max-h-[230px] w-full overflow-y-auto px-0 md:px-ds-06 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[407.2px] ${activeTimeFrame === 'weekly1' ? 'max-md:h-[calc(100vh-824px)] max-md:max-h-[calc(100vh-824px)]' : ''}`}
    >
      <div className="flex h-full flex-col gap-ds-03 py-ds-03 max-md:h-[max-content] max-md:gap-ds-05 max-md:py-0 max-md:pb-ds-05">
        {requests?.map((request) => (
          <div
            key={request.id}
            className="flex flex-col justify-start rounded-ds-lg border-b border-border md:gap-ds-05 md:border-b-0 max-md:border-none"
          >
            <div className="flex flex-col justify-between rounded-t-ds-lg border border-border md:flex-row md:border-0 md:px-ds-03 md:py-ds-04 max-md:border-b-0">
              <div className="flex items-center gap-ds-04 border-b border-border p-ds-05 md:border-none md:p-0 max-md:items-start">
                <img
                  src={userImages[request.user?.id || '']}
                  className="h-ds-md w-ds-md overflow-hidden rounded-ds-full bg-interactive-subtle"
                  alt={request.user?.name?.[0] || 'U'}
                />
                <div className="flex max-w-[277px] flex-col items-start gap-ds-02 sm:max-w-none">
                  <div className="flex flex-row gap-ds-02b">
                    <div className="flex items-center gap-ds-03">
                      <p className="text-ds-sm text-text-secondary">
                        {request.user?.name}
                      </p>
                    </div>
                  </div>
                  {/* for one day leave, display one line message & date */}
                  {isSingleDayRequest(request) ? (
                    <div className="flex w-full flex-col items-center gap-ds-03 md:flex-row md:flex-wrap max-md:items-start">
                      <p className="text-ds-base font-semibold text-text-primary">
                        {removeAllEmojis(request.reason)}
                      </p>
                      <p className="text-ds-base hidden font-semibold text-text-tertiary md:block">
                        &bull;
                      </p>
                      <p className="text-ds-base text-text-tertiary">
                        {formatDate(new Date(request.startDate))}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-start gap-ds-03">
                      <p className="text-ds-base font-semibold text-text-primary">
                        {removeAllEmojis(request.reason)}
                      </p>
                      <p className="text-ds-base text-text-tertiary">
                        {formatDate(new Date(request.startDate))} to{' '}
                        {formatDate(new Date(request.endDate))}
                        <span className="text-interactive-hover">
                          {', '}
                          {request.numberOfDays} days
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex h-full w-full items-center justify-between self-stretch sm:w-auto sm:justify-start">
                <div className="flex w-1/2 justify-center border-r border-border p-ds-02 md:border-r-0">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onMouseEnter={() => {
                          handleMouseEnter(request, 'rejectBreak')
                        }}
                        onMouseLeave={() => {
                          interaction.setHoverActionTemp(null)
                          interaction.setHoveredRequest(null)
                        }}
                        onClick={() => {
                          if (request?.user?.id !== currentUserId) {
                            interaction.setActiveRequest(request)
                            interaction.setActiveAction('rejectBreak')
                            if (interaction.activeRequest?.id !== request.id) {
                              interaction.setMessage('')
                            }
                            handleRequestSubmit(request, 'rejectBreak')
                          }
                        }}
                        disabled={
                          interaction.isProcessing || request?.user?.id === currentUserId
                        }
                        className={`rounded-ds-full p-ds-03 ${
                          interaction.activeRequest?.id === request.id &&
                          interaction.activeAction === 'rejectBreak'
                            ? 'bg-error-surface'
                            : ''
                        } ${
                          request?.user?.id === currentUserId
                            ? 'cursor-not-allowed opacity-[0.38]'
                            : ''
                        } max-md:flex max-md:w-full max-md:justify-center`}
                      >
                        <CrossIcon
                          className={`h-ico-lg w-ico-lg ${
                            interaction.activeRequest?.id === request.id &&
                            interaction.activeAction === 'rejectBreak'
                              ? 'text-text-error'
                              : ''
                          }`}
                        />
                      </button>
                    </TooltipTrigger>
                    {request?.user?.id === currentUserId && (
                      <TooltipContent>
                        <p>You cannot approve/reject your own break request</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
                <div className="flex w-1/2 justify-center bg-success-surface p-ds-02 md:bg-transparent">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onMouseEnter={() => {
                          handleMouseEnter(request, 'approveBreak')
                        }}
                        onMouseLeave={() => {
                          interaction.setHoverActionTemp(null)
                          interaction.setHoveredRequest(null)
                        }}
                        onClick={() => {
                          if (request?.user?.id !== currentUserId) {
                            interaction.setActiveRequest(request)
                            interaction.setActiveAction('approveBreak')
                            if (interaction.activeRequest?.id !== request.id) {
                              interaction.setMessage('')
                            }
                            handleRequestSubmit(request, 'approveBreak')
                          }
                        }}
                        disabled={
                          interaction.isProcessing || request?.user?.id === currentUserId
                        }
                        className={`rounded-ds-full p-ds-03 ${
                          interaction.activeRequest?.id === request.id &&
                          interaction.activeAction === 'approveBreak'
                            ? 'bg-success-surface'
                            : ''
                        } ${
                          request?.user?.id === currentUserId
                            ? 'cursor-not-allowed opacity-[0.38]'
                            : ''
                        } max-md:flex max-md:w-full max-md:justify-center`}
                      >
                        <TickIcon className="h-ico-lg w-ico-lg" />
                      </button>
                    </TooltipTrigger>
                    {request?.user?.id === currentUserId && (
                      <TooltipContent>
                        <p>You cannot approve/reject your own break request</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </div>
            </div>
            {((interaction.openComment &&
              interaction.activeRequest &&
              interaction.activeRequest?.id === request.id) ||
              isMobile) && (
              <div className="flex flex-row items-start justify-between rounded-ds-lg border-[1px] border-border py-ds-02 max-md:rounded-t-none">
                <div className="flex w-full flex-col items-start justify-start gap-ds-02 px-ds-05 pb-ds-02 pt-[10px]">
                  <div className="text-ds-xs font-semibold uppercase tracking-wider text-text-placeholder">
                    comment
                  </div>
                  <input
                    type="text"
                    value={interaction.message}
                    onChange={(e) => interaction.setMessage(e?.target?.value)}
                    placeholder="Enter a Comment"
                    className="text-ds-md w-full text-text-primary outline-none"
                  />
                </div>
                <button
                  disabled={interaction.isProcessing}
                  onClick={() => handleRequestSubmit(request, interaction.activeAction)}
                  className="my-auto flex hidden items-center justify-center rounded-ds-full p-ds-03"
                >
                  <SendIcon className="h-ico-lg w-ico-lg" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
},
)

LeaveRequests.displayName = 'LeaveRequests'
