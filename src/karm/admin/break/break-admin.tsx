'use client'

// ============================================================
// BreakAdmin — Compound component (Radix/shadcn pattern)
//
// Refactored from a monolith into composable sub-components
// with shared React Context.
//
// Usage (composed):
//   <BreakAdmin.Root currentUser={user} breaks={b} ...>
//     <BreakAdmin.Header />
//     <BreakAdmin.TabBar />
//     <BreakAdmin.BreaksPanel />
//     <BreakAdmin.RequestsPanel />
//     <BreakAdmin.BalancePanel />
//   </BreakAdmin.Root>
//
// Usage (default — identical output to the original):
//   <BreakAdmin currentUser={user} breaks={b} ... />
// ============================================================

import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
} from 'react'
import { cn } from '../../../ui/lib/utils'
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
// Context
// ============================================================

type BreakAdminTab = 'breaks' | 'requests' | 'balance'

interface BreakAdminContextValue {
  /** Current admin user */
  currentUser: Pick<AdminUser, 'id' | 'name' | 'role'>
  /** Active tab */
  activeTab: BreakAdminTab
  /** Set the active tab */
  setActiveTab: (tab: BreakAdminTab) => void
  /** Whether a request action is processing */
  isProcessing: boolean
  /** All breaks data */
  breaks: BreakRequest[]
  /** Pending break requests */
  pendingRequests: BreakRequest[]
  /** Cashout requests */
  cashoutRequests: BreakRequest[]
  /** Break balance data for all users */
  breakBalanceData: BreakBalanceData[]
  /** Current selected user's break balance summary */
  breakBalance?: { remainingDays: number; breakBalance: number } | null
  /** User images map */
  userImages: Record<string, string>
  /** List of all users for the associate filter */
  users: AdminUser[]
  /** Existing breaks for overlap checking */
  existingBreaks?: BreakRequest[]
  /** Resolved filters */
  filters: BreakAdminFilters
  /** Filter change handler */
  handleFilterChange: (newFilters: BreakAdminFilters) => void
  /** Approve request handler */
  handleApproveRequest: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    requestId: string,
    comment?: string,
  ) => void
  /** Reject request handler */
  handleRejectRequest: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    requestId: string,
    comment?: string,
  ) => void
  /** Comment box state for accepted */
  acceptedCommentBox: string | null
  /** Comment box state for rejected */
  rejectedCommentBox: string | null
  /** Set accepted comment box */
  setAcceptedCommentBox: (id: string | null) => void
  /** Set rejected comment box */
  setRejectedCommentBox: (id: string | null) => void
  /** Mutation callbacks */
  onRefresh?: () => void
  onSaveBreak?: (data: {
    requestId: string
    userId: string
    status: string
    adminComment: string
    startDate: string
    endDate: string
    isEditing: boolean
  }) => void
  onDeleteBreak?: () => void
  onSaveBalance?: (data: {
    userId: string
    cashOutDays: number
    carryForward: number
    year: number
  }) => void
  onFetchMonthBreaks?: (month: number, year: number) => Promise<BreakRequest[]>
}

const BreakAdminContext = createContext<BreakAdminContextValue | null>(null)

/**
 * Hook to consume BreakAdmin compound context.
 * Throws if used outside BreakAdmin.
 */
function useBreakAdminContext(): BreakAdminContextValue {
  const ctx = useContext(BreakAdminContext)
  if (!ctx) {
    throw new Error(
      'BreakAdmin compound components must be used within <BreakAdmin>',
    )
  }
  return ctx
}

// ============================================================
// Root Props (same as the original BreakAdminProps)
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

  /** Children — when provided, renders compound sub-components instead of default layout */
  children?: React.ReactNode
}

// ============================================================
// Root Component
// ============================================================

const BreakAdminRoot = React.forwardRef<HTMLDivElement, BreakAdminProps>(
  function BreakAdminRoot(
    {
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
      children,
    },
    ref,
  ) {
    const [activeTab, setActiveTab] = useState<BreakAdminTab>('breaks')
    const [isProcessing, setIsProcessing] = useState(false)
    const [acceptedCommentBox, setAcceptedCommentBox] = useState<string | null>(
      null,
    )
    const [rejectedCommentBox, setRejectedCommentBox] = useState<
      string | null
    >(null)

    const { toast } = useToast()

    // ============================================================
    // Default filters (used when no filtersProp provided)
    // ============================================================

    const defaultFilters: BreakAdminFilters = useMemo(
      () => ({
        selectedAssociate: null,
        dateFilterStart: null,
        dateFilterEnd: null,
        currMonth: new Date().getMonth(),
        currYear: new Date().getFullYear(),
        isOpen: false,
      }),
      [],
    )

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
                <span style={{ color: 'var(--color-success-text)' }}>
                  approved successfully
                </span>
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
                <span style={{ color: 'var(--color-error-text)' }}>
                  rejected
                </span>
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
              error instanceof Error
                ? error.message
                : 'Failed to reject request',
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
    // Context value (memoized)
    // ============================================================

    const contextValue: BreakAdminContextValue = {
      currentUser,
      activeTab,
      setActiveTab,
      isProcessing,
      breaks,
      pendingRequests,
      cashoutRequests: _cashoutRequests,
      breakBalanceData,
      breakBalance,
      userImages,
      users,
      existingBreaks,
      filters,
      handleFilterChange,
      handleApproveRequest,
      handleRejectRequest,
      acceptedCommentBox,
      rejectedCommentBox,
      setAcceptedCommentBox,
      setRejectedCommentBox,
      onRefresh,
      onSaveBreak,
      onDeleteBreak,
      onSaveBalance,
      onFetchMonthBreaks,
    }

    // ============================================================
    // Render
    // ============================================================

    return (
      <BreakAdminContext.Provider value={contextValue}>
        <div
          ref={ref}
          className="z-base flex w-full max-w-layout flex-col items-center justify-center md:pt-0"
        >
          <div className="no-scrollbar w-full overflow-auto border border-border-subtle sm:rounded-ds-lg max-md:rounded-ds-none max-md:border-0">
            {children ?? (
              <>
                <Header />
                {/* intentional: min-w-[800px] ensures table columns don't collapse on medium screens */}
                <div className="no-scrollbar flex h-fit min-w-[800px] flex-col border-t-[1px] border-border-subtle bg-layer-02 shadow-transparent max-lg:min-w-[100%] max-lg:overflow-x-auto">
                  <TabBar />
                  <div className="w-full border-0 max-lg:min-w-[800px]">
                    <BreaksPanel />
                    <RequestsPanel />
                    <BalancePanel />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </BreakAdminContext.Provider>
    )
  },
)

BreakAdminRoot.displayName = 'BreakAdmin'

// ============================================================
// Header Sub-Component
// ============================================================

const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function BreakAdminHeaderSub({ className, ...props }, ref) {
  const {
    filters,
    handleFilterChange,
    breakBalance,
    userImages,
    users,
  } = useBreakAdminContext()

  return (
    <div ref={ref} className={cn(className)} {...props}>
      <BreakAdminHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        breakBalance={breakBalance}
        userImages={userImages}
        users={users}
      />
    </div>
  )
})

Header.displayName = 'BreakAdmin.Header'

// ============================================================
// TabBar Sub-Component
// ============================================================

const TabBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function BreakAdminTabBar({ className, ...props }, ref) {
  const { activeTab, setActiveTab, pendingRequests, breakBalanceData } =
    useBreakAdminContext()

  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full gap-ds-03 border-b-[1px] border-border px-ds-06 pt-ds-03 max-lg:min-w-[800px]',
        className,
      )}
      {...props}
    >
      <button
        className={`text-ds-sm font-semibold uppercase tracking-wider mb-[-1px] px-ds-03 py-ds-04 ${
          activeTab === 'breaks'
            ? 'text-text-primary border-b-[1px] border-interactive-hover'
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
  )
})

TabBar.displayName = 'BreakAdmin.TabBar'

// ============================================================
// BreaksPanel Sub-Component
// ============================================================

const BreaksPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function BreakAdminBreaksPanel({ className, ...props }, ref) {
  const {
    activeTab,
    breaks,
    userImages,
    existingBreaks,
    onFetchMonthBreaks,
    onSaveBreak,
    onDeleteBreak,
    onRefresh,
  } = useBreakAdminContext()

  if (activeTab !== 'breaks') return null

  return (
    <div ref={ref} className={cn(className)} {...props}>
      <Breaks
        breaks={breaks}
        userImages={userImages}
        existingBreaks={existingBreaks}
        onFetchMonthBreaks={onFetchMonthBreaks}
        onSave={onSaveBreak}
        onDelete={onDeleteBreak}
        onRefresh={onRefresh}
      />
    </div>
  )
})

BreaksPanel.displayName = 'BreakAdmin.BreaksPanel'

// ============================================================
// RequestsPanel Sub-Component
// ============================================================

const RequestsPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function BreakAdminRequestsPanel({ className, ...props }, ref) {
  const {
    activeTab,
    currentUser,
    pendingRequests,
    userImages,
    handleApproveRequest,
    handleRejectRequest,
    acceptedCommentBox,
    rejectedCommentBox,
    setAcceptedCommentBox,
    setRejectedCommentBox,
  } = useBreakAdminContext()

  if (activeTab !== 'requests') return null

  return (
    <div
      ref={ref}
      className={cn(
        /* intentional: h-[400px] is the fixed panel height for break tab content areas */
        'no-scrollbar flex h-[400px] flex-col gap-ds-02 overflow-y-auto border-t border-t-border px-ds-06 pb-ds-02 pt-ds-02 max-md:h-[calc(100vh-317px)] max-md:border-0',
        className,
      )}
      {...props}
    >
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
  )
})

RequestsPanel.displayName = 'BreakAdmin.RequestsPanel'

// ============================================================
// BalancePanel Sub-Component
// ============================================================

const BalancePanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function BreakAdminBalancePanel({ className, ...props }, ref) {
  const { activeTab, breakBalanceData, userImages, onSaveBalance } =
    useBreakAdminContext()

  if (activeTab !== 'balance') return null

  return (
    <div ref={ref} className={cn(className)} {...props}>
      <BreakBalance
        breakBalanceData={breakBalanceData}
        userImages={userImages}
        onSaveBalance={onSaveBalance}
      />
    </div>
  )
})

BalancePanel.displayName = 'BreakAdmin.BalancePanel'

// ============================================================
// Compound Component Assembly
// ============================================================

export const BreakAdmin = Object.assign(BreakAdminRoot, {
  Root: BreakAdminRoot,
  Header,
  TabBar,
  BreaksPanel,
  RequestsPanel,
  BalancePanel,
})
