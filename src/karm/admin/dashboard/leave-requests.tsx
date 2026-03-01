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

export function LeaveRequests({
  requests,
  currentUserId,
  userImages = {},
  activeTimeFrame,
  onApproveBreak,
  onRejectBreak,
}: LeaveRequestsProps) {
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
      className={`no-scrollbar max-h-[230px] w-full overflow-y-auto px-0 md:px-6 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[407.2px] ${activeTimeFrame === 'weekly1' ? 'max-md:h-[calc(100vh-824px)] max-md:max-h-[calc(100vh-824px)]' : ''}`}
    >
      <div className="flex h-full flex-col gap-[8px] py-2 max-md:h-[max-content] max-md:gap-[16px] max-md:py-0 max-md:pb-[16px]">
        {requests?.map((request) => (
          <div
            key={request.id}
            className="flex flex-col justify-start rounded-[8px] border-b border-[var(--color-border-default)] md:gap-4 md:border-b-0 max-md:border-none"
          >
            <div className="flex flex-col justify-between rounded-t-[8px] border border-[var(--color-border-default)] md:flex-row md:border-0 md:px-2 md:py-3.5 max-md:border-b-0">
              <div className="flex items-center gap-3 border-b border-[var(--color-border-default)] p-4 md:border-none md:p-0 max-md:items-start">
                <img
                  src={userImages[request.user?.id || '']}
                  className="h-10 w-10 overflow-hidden rounded-[var(--radius-full)] bg-[#FCF7F7]"
                  alt={request.user?.name?.[0] || 'U'}
                />
                <div className="flex max-w-[277px] flex-col items-start gap-1 sm:max-w-none">
                  <div className="flex flex-row gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="B3-Reg text-[var(--color-text-secondary)]">
                        {request.user?.name}
                      </p>
                    </div>
                  </div>
                  {/* for one day leave, display one line message & date */}
                  {isSingleDayRequest(request) ? (
                    <div className="flex w-full flex-col items-center gap-2 md:flex-row md:flex-wrap max-md:items-start">
                      <p className="B1 semibold text-[var(--color-text-primary)]">
                        {removeAllEmojis(request.reason)}
                      </p>
                      <p className="B1 hidden font-semibold text-[var(--color-text-tertiary)] md:block">
                        &bull;
                      </p>
                      <p className="B1-Reg text-[var(--color-text-tertiary)]">
                        {formatDate(new Date(request.startDate))}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-start gap-2">
                      <p className="B1 semibold text-[var(--color-text-primary)]">
                        {removeAllEmojis(request.reason)}
                      </p>
                      <p className="B1-Reg text-[var(--color-text-tertiary)]">
                        {formatDate(new Date(request.startDate))} to{' '}
                        {formatDate(new Date(request.endDate))}
                        <span className="text-[var(--color-interactive-hover)]">
                          {', '}
                          {request.numberOfDays} days
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex h-full w-full items-center justify-between self-stretch sm:w-auto sm:justify-start">
                <div className="flex w-1/2 justify-center border-r border-[var(--color-border-default)] p-1 md:border-r-0">
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
                        className={`rounded-[128px] p-2 ${
                          interaction.activeRequest?.id === request.id &&
                          interaction.activeAction === 'rejectBreak'
                            ? 'bg-[var(--color-error-surface)]'
                            : ''
                        } ${
                          request?.user?.id === currentUserId
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        } max-md:flex max-md:w-full max-md:justify-center`}
                      >
                        <CrossIcon
                          className={`h-6 w-6 ${
                            interaction.activeRequest?.id === request.id &&
                            interaction.activeAction === 'rejectBreak'
                              ? 'text-[var(--color-text-error)]'
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
                <div className="flex w-1/2 justify-center bg-[var(--color-success-surface)] p-1 md:bg-transparent">
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
                        className={`rounded-[128px] p-2 ${
                          interaction.activeRequest?.id === request.id &&
                          interaction.activeAction === 'approveBreak'
                            ? 'bg-[var(--color-success-surface)]'
                            : ''
                        } ${
                          request?.user?.id === currentUserId
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        } max-md:flex max-md:w-full max-md:justify-center`}
                      >
                        <TickIcon className="h-6 w-6" />
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
              <div className="flex flex-row items-start justify-between rounded-[8px] border-[1px] border-[var(--color-border-default)] py-1 max-md:rounded-t-none">
                <div className="flex w-full flex-col items-start justify-start gap-1 px-4 pb-1 pt-[10px]">
                  <div className="L4 text-[var(--color-text-placeholder)]">
                    comment
                  </div>
                  <input
                    type="text"
                    value={interaction.message}
                    onChange={(e) => interaction.setMessage(e?.target?.value)}
                    placeholder="Enter a Comment"
                    className="P3 w-full text-[var(--color-text-primary)] outline-none"
                  />
                </div>
                <button
                  disabled={interaction.isProcessing}
                  onClick={() => handleRequestSubmit(request, interaction.activeAction)}
                  className="my-auto flex hidden items-center justify-center rounded-[128px] p-2"
                >
                  <SendIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

LeaveRequests.displayName = 'LeaveRequests'
