'use client'

// ============================================================
// DashboardHeader — Month selector, associate filter, toggle, arrows
// Extracted from admin-dashboard.tsx
// ============================================================

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu'
import { Button } from '../../../ui/button'
import { IconButton } from '../../../ui/icon-button'
import { Toggle } from '../../custom-buttons'
import {
  FilledArrowIcon,
  ArrowLeftIcon,
  ArrowForwardIcon,
  ArrowDropdownIcon,
  CrossIcon,
  PersonIcon,
} from '../icons'
import type { AdminUser } from '../types'

// ============================================================
// Types
// ============================================================

export interface DashboardHeaderProps {
  selectedMonth: string
  yearsList: string[]
  isTodaySelected: boolean
  selectedAssociate: AdminUser | null
  users: AdminUser[]
  userImages: Record<string, string>
  activeTimeFrame: string
  onMonthSelection: (monthYear: string) => void
  onTodayClick: () => void
  onSelectAssociate: (user: AdminUser | null) => void
  onTimeFrameChange: (id: string) => void
  onDateChange: (direction: 'prev' | 'next') => void
}

// ============================================================
// Component
// ============================================================

export const DashboardHeader = React.forwardRef<HTMLDivElement, DashboardHeaderProps>(
  function DashboardHeader({
  selectedMonth,
  yearsList,
  isTodaySelected,
  selectedAssociate,
  users,
  userImages,
  activeTimeFrame,
  onMonthSelection,
  onTodayClick,
  onSelectAssociate,
  onTimeFrameChange,
  onDateChange,
}, ref) {
  return (
    <div ref={ref} className="mb-ds-06 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
      <div className="flex w-full items-center justify-between gap-ds-05 md:w-auto md:justify-start">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-ds-xl flex items-center gap-ds-03 text-text-secondary">
            {selectedMonth}
            <FilledArrowIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="custom-scrollbar absolute ml-ds-08 max-h-[300px] overflow-y-auto rounded-ds-md border border-0 border-border p-0 shadow-brand">
            {yearsList.map((year, index) => (
              <DropdownMenuItem
                key={year}
                onSelect={() => {
                  onMonthSelection(year)
                }}
                className={`p-0 ${index !== yearsList.length - 1 ? 'border-b border-b-border' : ''}`}
              >
                <span
                  className={`w-full py-ds-04 pl-ds-05 pr-ds-06 ${selectedMonth === year ? 'text-ds-md font-semibold bg-interactive text-text-on-color' : 'text-ds-md text-text-secondary hover:bg-layer-02'} ${index === 0 ? 'rounded-t-[7px]' : index === yearsList.length - 1 ? 'rounded-b-[7px]' : ''} `}
                >
                  {year.split(' ')[1]}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {!isTodaySelected && (
          <Button
            variant="secondary"
            onClick={onTodayClick}
          >
            Today
          </Button>
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-ds-05 md:mt-0 md:w-auto md:justify-start max-md:mt-[17px] max-lg:gap-[0.5rem]">
        <div className="hidden md:flex">
          {selectedAssociate ? (
            <div className="text-ds-md flex items-center justify-start rounded-ds-md bg-interactive px-ds-03 py-ds-02b text-text-on-color">
              <div className="flex items-center justify-start gap-0">
                {userImages[selectedAssociate.id] ? (
                  <img
                    src={userImages[selectedAssociate.id]}
                    alt={`${selectedAssociate.name}'s avatar`}
                    className="h-ico-md w-ico-md rounded-ds-full"
                  />
                ) : (
                  <div className="flex h-ico-md w-ico-md flex-shrink-0 items-center justify-center rounded-ds-full bg-layer-03">
                    <span className="text-interactive">
                      {selectedAssociate.name.charAt(0)}
                    </span>
                  </div>
                )}

                <span className="text-ds-md ml-ds-01 mr-ds-02 text-text-on-color">
                  {selectedAssociate.name}
                </span>
              </div>
              <button
                onClick={() => onSelectAssociate(null)}
                className="border-0 bg-transparent p-0"
              >
                <CrossIcon className="h-ico-sm w-ico-sm text-text-on-color" />
              </button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="text-ds-md hidden items-center justify-between rounded-ds-md border border-border-subtle bg-layer-01 px-ds-03 py-ds-02b md:flex">
                <div className="flex items-center">
                  <PersonIcon className="h-ico-md w-ico-md" />
                  <span className="text-ds-md ml-ds-01 mr-ds-02 text-text-secondary max-lg:mx-0 max-lg:text-ds-sm">
                    Associate
                  </span>
                </div>
                <ArrowDropdownIcon className="h-ico-sm w-ico-sm" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="custom-scrollbar max-h-[400px] w-64 overflow-y-auto p-ds-03">
                {users?.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No users available
                  </DropdownMenuItem>
                ) : (
                  users?.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onSelect={() => {
                        const selectedUser: AdminUser = {
                          ...user,
                          createdAt: new Date(user.createdAt),
                        }
                        onSelectAssociate(selectedUser)
                      }}
                      className="flex items-center gap-ds-03 p-ds-03"
                    >
                      {userImages[user.id] ? (
                        <img
                          src={userImages[user.id]}
                          alt={`${user.name}'s avatar`}
                          className="h-6 w-6 rounded-ds-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-ds-full bg-layer-03">
                          <span className="text-ds-md text-interactive">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-ds-md text-text-secondary">
                        {user.name}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Toggle
          size="md"
          color="tonal"
          options={[
            { id: 'weekly', text: 'Weekly' },
            { id: 'monthly', text: 'Monthly' },
          ]}
          selectedId={activeTimeFrame}
          onSelect={onTimeFrameChange}
        />
        <div className="flex gap-0">
          <IconButton
            icon={<ArrowLeftIcon />}
            size="sm"
            aria-label="Previous"
            onClick={() => onDateChange('prev')}
          />
          <IconButton
            icon={<ArrowForwardIcon />}
            size="sm"
            aria-label="Next"
            onClick={() => onDateChange('next')}
          />
        </div>
      </div>
    </div>
  )
},
)

DashboardHeader.displayName = 'DashboardHeader'
