'use client'

import { useState, useCallback, type MouseEvent } from 'react'
import { useToast } from '../../../hooks/use-toast'
import { BreakBalance } from './break-balance'
import { LeaveRequest } from './leave-request'
import { Breaks } from './breaks'
import { BreakAdminHeader, type BreakAdminFilters } from './header'
import { BreakAdminSkeleton } from './break-admin-skeleton'
import type {
  AdminUser,
  BreakRequest,
  BreakBalanceData,
  RealtimeCallbacks,
} from '../types'

// ============================================================
// BreakAdmin — Main break management page with 3 tabs
// ============================================================

export interface BreakAdminProps {
  /** Current admin user */
  currentUser: Pick<AdminUser, 'id' | 'name' | 'role'>
  /** All breaks data */
  breaks: BreakRequest[]
  /** Pending break requests */
  pendingRequests: BreakRequest[]
  /** Pending cashout requests */
  cashoutRequests?: BreakRequest[]
  /** Break balance data for all users */
  breakBalanceData: BreakBalanceData[]
  /** Current selected user's break balance summary */
  breakBalance?: { remainingDays: number; breakBalance: number } | null
  /** User images map */
  userImages: Record<string, string>
  /** List of all users for the associate filter */
  users: AdminUser[]
  /** Whether data is still loading */
  isLoading?: boolean
  /** Loading states for individual sections */
  isLoadingBreaks?: boolean
  isLoadingRequests?: boolean
  isLoadingBalance?: boolean
  /** Existing breaks for overlap checking in edit dialog */
  existingBreaks?: BreakRequest[]

  // ============================================================
  // Filter state (replaces nuqs useQueryState)
  // ============================================================
  /** Current filter values */
  filters?: BreakAdminFilters
  /** Callback when filters change */
  onFilterChange?: (filters: BreakAdminFilters) => void

  // ============================================================
  // Mutation callbacks (replace fetch calls)
  // ============================================================
  /** Called when admin approves a break/correction request */
  onApproveRequest?: (
    requestId: string,
    comment?: string,
    isCorrection?: boolean,
    request?: BreakRequest,
  ) => void
  /** Called when admin rejects a break/correction request */
  onRejectRequest?: (
    requestId: string,
    comment?: string,
    isCorrection?: boolean,
    request?: BreakRequest,
  ) => void
  /** Called when admin approves a cashout request */
  onApproveCashout?: (requestId: string) => void
  /** Called when admin rejects a cashout request */
  onRejectCashout?: (requestId: string) => void
  /** Called when refreshing all data */
  onRefresh?: () => void
  /** Called to save edited break details */
  onSaveBreak?: (data: {
    requestId: string
    userId: string
    status: string
    adminComment: string
    startDate: string
    endDate: string
    isEditing: boolean
  }) => void
  /** Called to delete a break */
  onDeleteBreak?: () => void
  /** Called to save edited break balance */
  onSaveBalance?: (data: {
    userId: string
    cashOutDays: number
    carryForward: number
    year: number
  }) => void
  /** Called to fetch month breaks for overlap checking */
  onFetchMonthBreaks?: (month: number, year: number) => Promise<BreakRequest[]>

  // ============================================================
  // Realtime callbacks (replace useBreakRequestUpdates)
  // ============================================================
  realtimeCallbacks?: RealtimeCallbacks
}

export function BreakAdmin({
  currentUser,
  breaks,
  pendingRequests,
  cashoutRequests: _cashoutRequests = [],
  breakBalanceData,
  breakBalance,
  userImages,
  users,
  isLoading = false,
  isLoadingBreaks: _isLoadingBreaks = false,
  isLoadingRequests: _isLoadingRequests = false,
  isLoadingBalance: _isLoadingBalance = false,
  existingBreaks,
  filters: filtersProp,
  onFilterChange,
  onApproveRequest,
  onRejectRequest,
  onApproveCashout: _onApproveCashout,
  onRejectCashout: _onRejectCashout,
  onRefresh,
  onSaveBreak,
  onDeleteBreak,
  onSaveBalance,
  onFetchMonthBreaks,
  realtimeCallbacks: _realtimeCallbacks,
}: BreakAdminProps) {
  const [activeTab, setActiveTab] = useState<'breaks' | 'requests' | 'balance'>(
    'breaks',
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptedCommentBox, setAcceptedCommentBox] = useState<string | null>(
    null,
  )
  const [rejectedCommentBox, setRejectedCommentBox] = useState<string | null>(
    null,
  )

  const { toast } = useToast()

  // ============================================================
  // Default filters (used when no filtersProp provided)
  // ============================================================

  const defaultFilters: BreakAdminFilters = {
    selectedAssociate: null,
    dateFilterStart: null,
    dateFilterEnd: null,
    currMonth: new Date().getMonth(),
    currYear: new Date().getFullYear(),
    isOpen: false,
  }

  const filters = filtersProp || defaultFilters

  const handleFilterChange = useCallback(
    (newFilters: BreakAdminFilters) => {
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
    },
    [onFilterChange],
  )

  // ============================================================
  // Request handlers
  // ============================================================

  const handleApproveRequest = useCallback(
    async (
      event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
      requestId: string,
      comment?: string,
    ) => {
      if (isProcessing) return
      if (!comment) {
        const isModKeyPressed = event.metaKey || event.ctrlKey
        if (isModKeyPressed) {
          setAcceptedCommentBox(requestId)
          return
        }
      }

      try {
        setIsProcessing(true)

        const request = pendingRequests.find((req) => req.id === requestId)
        if (!request) {
          throw new Error('Request not found')
        }

        if (onApproveRequest) {
          onApproveRequest(requestId, comment, request.correction, request)
        }

        toast({
          description: (
            <>
              <span>
                {request.correction
                  ? 'Attendance correction'
                  : 'Break request'}{' '}
              </span>
              <span style={{ color: 'var(--color-success-text)' }}>approved successfully</span>
            </>
          ),
          variant: 'default',
          style: { marginBottom: '16px', border: 'None' },
        })
      } catch (error) {
        console.error('Error approving request:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to approve request',
          variant: 'destructive',
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [isProcessing, pendingRequests, onApproveRequest, toast],
  )

  const handleRejectRequest = useCallback(
    async (
      event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
      requestId: string,
      comment?: string,
    ) => {
      if (isProcessing) return
      if (!comment) {
        const isModKeyPressed = event.metaKey || event.ctrlKey
        if (isModKeyPressed) {
          setRejectedCommentBox(requestId)
          return
        }
      }

      try {
        setIsProcessing(true)

        const request = pendingRequests.find((req) => req.id === requestId)
        if (!request) {
          throw new Error('Request not found')
        }

        if (onRejectRequest) {
          onRejectRequest(requestId, comment, request.correction, request)
        }

        toast({
          description: (
            <>
              <span>
                {request.correction
                  ? 'Attendance correction'
                  : 'Break request'}{' '}
              </span>
              <span style={{ color: 'var(--color-error-text)' }}>rejected</span>
            </>
          ),
          variant: 'default',
          style: { marginBottom: '16px', border: 'None' },
        })
      } catch (error) {
        console.error('Error rejecting request:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to reject request',
          variant: 'destructive',
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [isProcessing, pendingRequests, onRejectRequest, toast],
  )

  // ============================================================
  // Loading state
  // ============================================================

  if (isLoading) {
    return <BreakAdminSkeleton />
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="z-[1] flex w-full max-w-layout flex-col items-center justify-center md:pt-0">
      <div className="no-scrollbar w-full overflow-auto border border-border-subtle sm:rounded-[8px] max-md:rounded-none max-md:border-0">
        {/* Header */}
        <BreakAdminHeader
          filters={filters}
          onFilterChange={handleFilterChange}
          breakBalance={breakBalance}
          userImages={userImages}
          users={users}
        />

        {/* Body */}
        <div className="no-scrollbar flex h-fit min-w-[800px] flex-col border-t-[1px] border-border-subtle bg-layer-02 shadow-transparent max-lg:min-w-[100%] max-lg:overflow-x-auto">
          <div className="flex w-full gap-ds-03 border-b-[1px] border-border px-ds-06 pt-ds-03 max-lg:min-w-[800px]">
            <button
              className={`text-ds-sm font-semibold uppercase tracking-wider mb-[-1px] px-ds-03 py-ds-04 ${
                activeTab === 'breaks'
                  ? 'text-var(--color-text-primary) border-b-[1px] border-interactive-hover'
                  : 'text-text-tertiary'
              }`}
              onClick={() => setActiveTab('breaks')}
            >
              BREAKS
            </button>
            <button
              className={`text-ds-sm font-semibold uppercase tracking-wider mb-[-1px] flex items-center gap-ds-02 px-ds-03 py-ds-04 ${
                activeTab === 'requests'
                  ? 'border-b-[1px] border-interactive-hover text-text-primary'
                  : 'text-text-tertiary'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              REQUESTS{' '}
              <span className="text-interactive-hover">{`(${pendingRequests.length})`}</span>
            </button>
            <button
              className={`text-ds-sm font-semibold uppercase tracking-wider mb-[-1px] flex items-center gap-ds-02 px-ds-03 py-ds-04 ${
                activeTab === 'balance'
                  ? 'border-b-[1px] border-interactive-hover text-text-primary'
                  : 'text-text-tertiary'
              }`}
              onClick={() => setActiveTab('balance')}
            >
              BALANCE{' '}
              <span className="text-interactive-hover">{`(${breakBalanceData.length})`}</span>
            </button>
          </div>

          <div className="w-full border-0 max-lg:min-w-[800px]">
            {activeTab === 'breaks' ? (
              <Breaks
                breaks={breaks}
                userImages={userImages}
                existingBreaks={existingBreaks}
                onFetchMonthBreaks={onFetchMonthBreaks}
                onSave={onSaveBreak}
                onDelete={onDeleteBreak}
                onRefresh={onRefresh}
              />
            ) : activeTab === 'requests' ? (
              <div className="no-scrollbar flex h-[400px] flex-col gap-ds-02 overflow-y-auto border-t border-t-border px-ds-06 pb-ds-02 pt-ds-02 max-md:h-[calc(100vh-317px)] max-md:border-0">
                {pendingRequests.map((request) => (
                  <LeaveRequest
                    key={request.id}
                    request={request}
                    userImages={userImages}
                    handleRejectRequest={handleRejectRequest}
                    handleApproveRequest={handleApproveRequest}
                    commentBoxOpen={
                      acceptedCommentBox === request.id ||
                      rejectedCommentBox === request.id
                    }
                    onCommentBoxClose={() => {
                      setAcceptedCommentBox(null)
                      setRejectedCommentBox(null)
                    }}
                    clickedAction={
                      acceptedCommentBox === request.id
                        ? 'approve'
                        : rejectedCommentBox === request.id
                          ? 'reject'
                          : null
                    }
                    userId={currentUser.id}
                  />
                ))}
              </div>
            ) : (
              <BreakBalance
                breakBalanceData={breakBalanceData}
                userImages={userImages}
                onSaveBalance={onSaveBalance}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

BreakAdmin.displayName = 'BreakAdmin'
