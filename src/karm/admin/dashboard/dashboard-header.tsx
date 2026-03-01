'use client'

// ============================================================
// DashboardHeader — Month selector, associate filter, toggle, arrows
// Extracted from admin-dashboard.tsx
// ============================================================

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu'
import { CustomButton } from '../../custom-buttons/CustomButton'
import { IconButton } from '../../custom-buttons/icon-button'
import { Toggle } from '../../custom-buttons/Toggle'
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

export function DashboardHeader({
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
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
      <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-start">
        <DropdownMenu>
          <DropdownMenuTrigger className="T6-Reg flex items-center gap-2 text-[var(--color-text-secondary)]">
            {selectedMonth}
            <FilledArrowIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="custom-scrollbar absolute ml-10 max-h-[300px] overflow-y-auto rounded-[7px] border border-0 border-[var(--color-border-default)] p-0 shadow-md shadow-[rgba(77,10,28,0.2)]">
            {yearsList.map((year, index) => (
              <DropdownMenuItem
                key={year}
                onSelect={() => {
                  onMonthSelection(year)
                }}
                className={`p-0 ${index !== yearsList.length - 1 ? 'border-b border-b-[var(--color-border-default)]' : ''}`}
              >
                <span
                  className={`w-full py-3 pl-4 pr-6 ${selectedMonth === year ? 'B2-Semibold bg-[var(--color-interactive)] font-semibold text-[var(--color-text-on-color)]' : 'B2-Reg text-[var(--color-text-secondary)] hover:bg-[var(--color-layer-02)]'} ${index === 0 ? 'rounded-t-[7px]' : index === yearsList.length - 1 ? 'rounded-b-[7px]' : ''} `}
                >
                  {year.split(' ')[1]}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {!isTodaySelected && (
          <CustomButton
            type="outline"
            text="Today"
            onClick={onTodayClick}
          />
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-4 md:mt-0 md:w-auto md:justify-start max-md:mt-[17px] max-lg:gap-[0.5rem]">
        <div className="hidden md:flex">
          {selectedAssociate ? (
            <div className="B2-Reg flex-direction-row flex items-center justify-start rounded-[6px] bg-[var(--Alias-Semantics-Highlight-darkest,#1E1429)] px-[8px] py-[6px] text-[var(--color-text-on-color)]">
              <div className="flex items-center justify-start gap-0">
                {userImages[selectedAssociate.id] ? (
                  <img
                    src={userImages[selectedAssociate.id]}
                    alt={`${selectedAssociate.name}'s avatar`}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-[var(--color-interactive)]">
                      {selectedAssociate.name.charAt(0)}
                    </span>
                  </div>
                )}

                <span className="B2-Reg ml-[2px] mr-[4px] text-[var(--color-text-on-color)]">
                  {selectedAssociate.name}
                </span>
              </div>
              <button
                onClick={() => onSelectAssociate(null)}
                className="border-0 bg-transparent p-0"
              >
                <CrossIcon className="h-4 w-4 text-[var(--color-text-on-color)]" />
              </button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="B2-Reg flex-direction-row hidden items-center justify-between rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] px-2 py-1.5 md:flex">
                <div className="flex items-center">
                  <PersonIcon className="h-5 w-5" />
                  <span className="B2-Reg ml-[2px] mr-[4px] text-[var(--color-text-secondary)] max-lg:mx-0 max-lg:text-[12px]">
                    Associate
                  </span>
                </div>
                <ArrowDropdownIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="custom-scrollbar max-h-[400px] w-64 overflow-y-auto p-2">
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
                      className="flex items-center gap-2 p-2"
                    >
                      {userImages[user.id] ? (
                        <img
                          src={userImages[user.id]}
                          alt={`${user.name}'s avatar`}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-sm text-[var(--color-interactive)]">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="B2-Reg text-[var(--color-text-secondary)]">
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
          size="medium"
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
            size="small"
            onClick={() => onDateChange('prev')}
          />
          <IconButton
            icon={<ArrowForwardIcon />}
            size="small"
            onClick={() => onDateChange('next')}
          />
        </div>
      </div>
    </div>
  )
}

DashboardHeader.displayName = 'DashboardHeader'
