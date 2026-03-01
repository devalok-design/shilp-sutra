'use client'

import { Fragment } from 'react'
import {
  CrossIcon,
  PersonIcon,
  ArrowDropdownIcon,
  CalendarIcon,
  CalendarDateIcon,
  ArrowLeftIcon,
  ArrowForwardIcon,
} from '../icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu'
import { CustomButton } from '../../custom-buttons/CustomButton'
import { IconButton } from '../../custom-buttons/icon-button'
import type { AdminUser, BreakBalanceData } from '../types'

// ============================================================
// Header — Break admin header with associate and date filters
// ============================================================

const monthMap = [
  { id: 1, name: 'January' },
  { id: 2, name: 'February' },
  { id: 3, name: 'March' },
  { id: 4, name: 'April' },
  { id: 5, name: 'May' },
  { id: 6, name: 'June' },
  { id: 7, name: 'July' },
  { id: 8, name: 'August' },
  { id: 9, name: 'September' },
  { id: 10, name: 'October' },
  { id: 11, name: 'November' },
  { id: 12, name: 'December' },
]

export interface BreakAdminFilters {
  selectedAssociate: AdminUser | null
  dateFilterStart: string | Date | null
  dateFilterEnd: string | Date | null
  currMonth: number
  currYear: number
  isOpen: boolean
}

export interface BreakAdminHeaderProps {
  filters: BreakAdminFilters
  onFilterChange: (filters: BreakAdminFilters) => void
  breakBalance?: { remainingDays: number; breakBalance: number } | null
  userImages: Record<string, string>
  users: AdminUser[]
}

export function BreakAdminHeader({
  filters,
  onFilterChange,
  breakBalance,
  userImages,
  users,
}: BreakAdminHeaderProps) {
  const setFilters = (
    updater: (prev: BreakAdminFilters) => BreakAdminFilters,
  ) => {
    onFilterChange(updater(filters))
  }

  const handlePrev = () => {
    setFilters((prev) => ({
      ...prev,
      currMonth: prev.currMonth === 0 ? 11 : prev.currMonth - 1,
    }))
  }

  const handleNext = () => {
    setFilters((prev) => ({
      ...prev,
      currMonth: prev.currMonth === 11 ? 0 : prev.currMonth + 1,
    }))
  }

  const handleDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      dateFilterStart: new Date(prev.currYear, prev.currMonth, 1),
      dateFilterEnd: new Date(prev.currYear, prev.currMonth + 1, 0),
      isOpen: false,
    }))
  }

  return (
    <div className="flex min-w-[800px] items-center justify-between bg-[var(--color-field)] px-6 py-5 max-md:justify-start max-md:gap-[20px] max-lg:min-w-[100%]">
      <div className="flex flex-col gap-4">
        {filters.selectedAssociate && (
          <>
            <p className="L3 text-[var(--color-text-tertiary)]">
              Break Balance
            </p>
            <div className="flex items-end">
              <p className="T2-Reg semibold mr-1 text-[var(--color-interactive)]">
                {breakBalance?.remainingDays || 0}
              </p>

              <p className="T5-Reg translate-y-[-5px] text-[var(--color-text-placeholder)]">
                / {breakBalance?.breakBalance || 0}
              </p>
            </div>
          </>
        )}
      </div>

      <header className="flex items-center gap-3">
        {filters.selectedAssociate ? (
          <div className="B2-Reg flex flex-row items-center justify-start gap-1 rounded-[6px] bg-[var(--Alias-Semantics-Highlight-darkest)] p-1.5 text-[var(--color-text-on-color)]">
            <div className="flex items-center justify-start gap-0.5">
              {userImages[filters.selectedAssociate.id] ? (
                <img
                  src={userImages[filters.selectedAssociate.id]}
                  alt={`${filters.selectedAssociate.name}'s avatar`}
                  className="h-5 w-5 rounded-[var(--radius-full)]"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-layer-02)]">
                  <span className="text-[var(--color-interactive)]">
                    {filters.selectedAssociate.name.charAt(0)}
                  </span>
                </div>
              )}

              <span className="B2-Reg mx-0.5 text-[var(--color-text-on-color)]">
                {filters.selectedAssociate.name}
              </span>
            </div>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  selectedAssociate: null,
                }))
              }
              className="border-0 p-0"
            >
              <CrossIcon className="h-4 w-4 text-[var(--color-text-on-color)]" />
            </button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="B2-Reg flex flex-row items-center justify-between rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] px-2 py-1.5">
              <div className="flex items-center">
                <PersonIcon className="h-4 w-4" />
                <span className="B2-Reg mx-2 text-[var(--color-text-secondary)] max-lg:mx-0 max-lg:text-[12px]">
                  Associate
                </span>
              </div>
              <ArrowDropdownIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="custom-scrollbar max-h-[400px] w-64 overflow-y-auto p-2">
              {users?.length === 0 ? (
                <DropdownMenuItem disabled>No users available</DropdownMenuItem>
              ) : (
                users?.map((user) => (
                  <Fragment key={user.id}>
                    <DropdownMenuItem
                      key={user.id}
                      onSelect={() =>
                        setFilters((prev) => ({
                          ...prev,
                          selectedAssociate: user,
                        }))
                      }
                      className="flex items-center gap-2 p-2"
                    >
                      {userImages[user.id] ? (
                        <img
                          src={userImages[user.id]}
                          alt={`${user.name}'s avatar`}
                          className="h-6 w-6 rounded-[var(--radius-full)]"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-full)] bg-gray-200">
                          <span className="text-sm text-[var(--color-interactive)]">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="B2-Reg text-[var(--color-text-secondary)]">
                        {user.name}
                      </span>
                    </DropdownMenuItem>
                  </Fragment>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Date Filter */}
        {filters.dateFilterEnd && (
          <div className="B2-Reg flex-direction-row flex items-center justify-between rounded-[6px] bg-[var(--Alias-Semantics-Highlight-darkest)] px-2 py-[6px] text-[var(--color-text-on-color)]">
            <div className="flex items-center">
              <CalendarIcon />
              <span className="ml-[2px] mr-1">
                {monthMap[new Date(filters.dateFilterStart!).getMonth()].name},
              </span>
              <span className="mr-1">
                {new Date(filters.dateFilterStart!).getFullYear()}
              </span>
            </div>

            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  dateFilterStart: null,
                  dateFilterEnd: null,
                }))
              }}
              className="border-0 bg-transparent p-0"
            >
              <CrossIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        )}

        <DropdownMenu
          open={filters.isOpen}
          onOpenChange={(open) => {
            setFilters((prev) => ({ ...prev, isOpen: open }))
          }}
        >
          <DropdownMenuTrigger className="B2-Reg flex-direction-row flex items-center justify-between rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] p-1.5">
            <div className="flex items-center">
              <CalendarDateIcon />
              <span className="mx-2 text-[var(--color-text-secondary)]">
                Date
              </span>
            </div>
            <ArrowDropdownIcon className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-32 p-3">
            <div className="flex w-[140px] flex-col items-center justify-start">
              <div className="flex w-full items-center justify-between">
                <IconButton
                  size="small"
                  icon={<ArrowLeftIcon />}
                  onClick={handlePrev}
                />
                <span className="B2-Reg text-[var(--color-text-secondary)]">
                  {monthMap[filters.currMonth].name}
                </span>
                <IconButton
                  size="small"
                  icon={<ArrowForwardIcon />}
                  onClick={handleNext}
                />
              </div>
              <div className="mt-3 flex w-full items-center justify-between">
                <IconButton
                  size="small"
                  icon={<ArrowLeftIcon />}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      currYear: prev.currYear - 1,
                    }))
                  }}
                />
                <span className="B2-Reg text-[var(--color-text-secondary)]">
                  {filters.currYear}
                </span>
                <IconButton
                  size="small"
                  icon={<ArrowForwardIcon />}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      currYear: prev.currYear + 1,
                    }))
                  }}
                />
              </div>
              <CustomButton
                className="mt-4 w-full"
                type="outline"
                text="Filter"
                onClick={handleDateFilter}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </div>
  )
}

BreakAdminHeader.displayName = 'BreakAdminHeader'
