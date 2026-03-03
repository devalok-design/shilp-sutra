'use client'

import * as React from 'react'
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
import { Button } from '../../../ui/button'
import { IconButton } from '../../../ui/icon-button'
import type { AdminUser } from '../types'

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

export const BreakAdminHeader = React.forwardRef<HTMLDivElement, BreakAdminHeaderProps>(
  function BreakAdminHeader({
  filters,
  onFilterChange,
  breakBalance,
  userImages,
  users,
}, ref) {
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
    <div ref={ref} className="flex min-w-[800px] items-center justify-between bg-field px-ds-06 py-ds-05b max-md:justify-start max-md:gap-ds-05b max-lg:min-w-[100%]">
      <div className="flex flex-col gap-ds-05">
        {filters.selectedAssociate && (
          <>
            <p className="text-ds-sm font-semibold uppercase tracking-wider text-text-tertiary">
              Break Balance
            </p>
            <div className="flex items-end">
              <p className="text-ds-5xl font-semibold mr-ds-02 text-interactive">
                {breakBalance?.remainingDays || 0}
              </p>

              <p className="text-ds-2xl translate-y-[-5px] text-text-placeholder">
                / {breakBalance?.breakBalance || 0}
              </p>
            </div>
          </>
        )}
      </div>

      <header className="flex items-center gap-ds-04">
        {filters.selectedAssociate ? (
          <div className="text-ds-md flex flex-row items-center justify-start gap-ds-02 rounded-ds-md bg-interactive p-ds-02b text-text-on-color">
            <div className="flex items-center justify-start gap-ds-01">
              {userImages[filters.selectedAssociate.id] ? (
                <img
                  src={userImages[filters.selectedAssociate.id]}
                  alt={`${filters.selectedAssociate.name}'s avatar`}
                  className="h-ico-md w-ico-md rounded-ds-full"
                />
              ) : (
                <div className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-layer-02">
                  <span className="text-interactive">
                    {filters.selectedAssociate.name.charAt(0)}
                  </span>
                </div>
              )}

              <span className="text-ds-md mx-ds-01 text-text-on-color">
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
              <CrossIcon className="h-ico-sm w-ico-sm text-text-on-color" />
            </button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-ds-md flex flex-row items-center justify-between rounded-ds-md border border-border-subtle bg-layer-01 px-ds-03 py-ds-02b">
              <div className="flex items-center">
                <PersonIcon className="h-ico-sm w-ico-sm" />
                <span className="text-ds-md mx-ds-03 text-text-secondary max-lg:mx-0 max-lg:text-ds-sm">
                  Associate
                </span>
              </div>
              <ArrowDropdownIcon className="h-ico-sm w-ico-sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="custom-scrollbar max-h-[400px] w-64 overflow-y-auto p-ds-03">
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
                      className="flex items-center gap-ds-03 p-ds-03"
                    >
                      {userImages[user.id] ? (
                        <img
                          src={userImages[user.id]}
                          alt={`${user.name}'s avatar`}
                          className="h-ds-xs w-ds-xs rounded-ds-full"
                        />
                      ) : (
                        <div className="flex h-ds-xs w-ds-xs items-center justify-center rounded-ds-full bg-layer-03">
                          <span className="text-ds-md text-interactive">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-ds-md text-text-secondary">
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
          <div className="text-ds-md flex items-center justify-between rounded-ds-md bg-interactive px-ds-03 py-ds-02b text-text-on-color">
            <div className="flex items-center">
              <CalendarIcon />
              <span className="ml-ds-01 mr-ds-02">
                {monthMap[new Date(filters.dateFilterStart!).getMonth()].name},
              </span>
              <span className="mr-ds-02">
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
              <CrossIcon className="h-ico-sm w-ico-sm" />
            </button>
          </div>
        )}

        <DropdownMenu
          open={filters.isOpen}
          onOpenChange={(open) => {
            setFilters((prev) => ({ ...prev, isOpen: open }))
          }}
        >
          <DropdownMenuTrigger className="text-ds-md flex items-center justify-between rounded-ds-md border border-border-subtle bg-layer-01 p-ds-02b">
            <div className="flex items-center">
              <CalendarDateIcon />
              <span className="mx-ds-03 text-text-secondary">
                Date
              </span>
            </div>
            <ArrowDropdownIcon className="h-ico-sm w-ico-sm" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-32 p-ds-04">
            <div className="flex w-[140px] flex-col items-center justify-start">
              <div className="flex w-full items-center justify-between">
                <IconButton
                  size="sm"
                  icon={<ArrowLeftIcon />}
                  aria-label="Previous month"
                  onClick={handlePrev}
                />
                <span className="text-ds-md text-text-secondary">
                  {monthMap[filters.currMonth].name}
                </span>
                <IconButton
                  size="sm"
                  icon={<ArrowForwardIcon />}
                  aria-label="Next month"
                  onClick={handleNext}
                />
              </div>
              <div className="mt-ds-04 flex w-full items-center justify-between">
                <IconButton
                  size="sm"
                  icon={<ArrowLeftIcon />}
                  aria-label="Previous year"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      currYear: prev.currYear - 1,
                    }))
                  }}
                />
                <span className="text-ds-md text-text-secondary">
                  {filters.currYear}
                </span>
                <IconButton
                  size="sm"
                  icon={<ArrowForwardIcon />}
                  aria-label="Next year"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      currYear: prev.currYear + 1,
                    }))
                  }}
                />
              </div>
              <Button
                className="mt-ds-05"
                variant="secondary"
                fullWidth
                onClick={handleDateFilter}
              >Filter</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </div>
  )
},
)

BreakAdminHeader.displayName = 'BreakAdminHeader'
