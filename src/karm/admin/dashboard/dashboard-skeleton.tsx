'use client'

// ============================================================
// Dashboard Skeleton — Loading placeholder for AdminDashboard
// ============================================================

import * as React from 'react'
import { Skeleton } from '../../../ui/skeleton'
import { DropdownMenu, DropdownMenuTrigger } from '../../../ui/dropdown-menu'
import { FilledArrowIcon, ArrowLeftIcon, ArrowForwardIcon } from '../icons'
import { IconButton } from '../../custom-buttons/icon-button'

// ============================================================
// Component
// ============================================================

export function DashboardSkeleton() {
  return (
    <div className="flex w-full max-w-[var(--max-width)] flex-col items-center justify-center max-md:h-[100%] max-md:justify-start">
      <div className="z-[1] flex w-full flex-col items-start justify-start rounded-[8px] border border-[var(--border-primary,#F7E9E9)] bg-[var(--Mapped-Surface-Tertiary)] p-[16px] shadow-[0px_25px_40px_0px_var(--Elevation-1,#E6E4E5)] max-md:h-[calc(100vh-201px)] max-md:max-h-[calc(100vh-201px)] max-md:overflow-y-auto max-md:border-0 max-md:px-4 max-md:pb-[0px] max-md:pt-[24px]">
        {/* Header Section */}
        <div className="mb-6 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="T6-Reg flex items-center gap-2 text-[var(--Mapped-Text-Secondary)]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-[25px] w-[50px] rounded-md bg-[var(--Mapped-Surface-Dark)]" />
                <Skeleton className="h-[25px] w-[50px] rounded-md bg-[var(--Mapped-Surface-Dark)]" />
              </div>
              <FilledArrowIcon />
            </DropdownMenuTrigger>
          </DropdownMenu>
          <div className="flex w-full items-center justify-between gap-4 md:mt-0 md:w-auto md:justify-start max-md:mt-[17px] max-lg:gap-[0.5rem]">
            <div className="hidden md:flex">
              <Skeleton className="h-[32px] w-[180px] rounded-md" />
            </div>
            <div className="flex w-[200px] items-center justify-between overflow-clip rounded-full border border-[var(--Mapped-Surface-Darker)]">
              <div className="flex h-[32px] w-[100px] items-center justify-center rounded-r-none bg-[var(--Mapped-Surface-Dark)]">
                <Skeleton className="h-[20px] w-[40px] rounded-r-none bg-[var(--Mapped-Surface-Darker)]" />
              </div>
              <div className="flex h-[32px] w-[100px] items-center justify-center">
                <Skeleton className="h-[20px] w-[40px] bg-[var(--Mapped-Surface-Darker)]" />
              </div>
            </div>
            <div className="flex gap-0">
              <IconButton icon={<ArrowLeftIcon />} size="small" />
              <IconButton
                icon={<ArrowForwardIcon />}
                size="small"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="flex w-full items-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex w-full flex-col items-center rounded-t-lg pb-3.5 pt-4 max-md:rounded-lg"
            >
              <Skeleton className="mb-2 h-[10px] w-[10px] rounded-lg bg-[var(--Mapped-Surface-Dark)]" />
              <div className="mx-1 my-1 flex items-center justify-center">
                <Skeleton className="h-[40px] w-[40px] rounded-full bg-[var(--Mapped-Surface-Dark)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="flex w-full flex-col rounded-[8px] bg-[var(--Mapped-Surface-Secondary)] md:p-0 md:p-6 max-md:bg-transparent">
          {/* User Groups Section */}
          <div className="no-scrollbar w-full cursor-grab overflow-x-auto active:cursor-grabbing max-md:pb-[16px]">
            <div
              className="items-flex-start flex flex-row justify-start gap-3 px-0 pt-2 md:gap-0 md:px-6"
              style={{ minWidth: 'max-content' }}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex w-full flex-col gap-3 rounded-md bg-[var(--Mapped-Surface-Secondary)] p-6 md:rounded-lg md:p-4 ${
                    index !== 2 ? 'border-r border-[var(--border-primary)]' : ''
                  } max-md:border-0 max-md:p-[16px]`}
                  style={{ minWidth: '200px' }}
                >
                  <Skeleton className="h-[20px] w-[120px] rounded-md bg-[var(--Mapped-Surface-Dark)]" />
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from({ length: 4 }).map((_, imgIndex) => (
                      <Skeleton
                        key={imgIndex}
                        className={`h-10 w-10 rounded-full bg-[var(--Mapped-Surface-Dark)] ${
                          imgIndex > 0 ? 'ml-[-5px]' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests Section */}
          <div className="w-full p-0 md:p-6">
            <div className="max-md:pt[16px] flex flex-col items-start overflow-hidden rounded-[var(--Number-4x,8px)] border-0 border-[var(--border-secondary)] bg-[var(--Mapped-Surface-Primary)] pt-2 md:border max-md:pb-0">
              {/* Tab headers skeleton */}
              <div className="flex w-full items-start border-b-[1px] border-b-[var(--border-primary)] px-6 md:border-b max-md:border-0 max-md:px-[0px]">
                <div className="L3 cursor-pointer border-b-[1.5px] border-b-[var(--Mapped-Surface-Button-Secondary)] px-2 py-3 font-semibold uppercase text-[var(--Mapped-Text-Primary)]">
                  REQUESTS(1)
                </div>
                <div className="L3 cursor-pointer px-2 py-3 uppercase text-[var(--Mapped-Text-Tertiary)]">
                  ATTENDANCE CORRECTION(1)
                </div>
              </div>
              <div className="flex max-h-[200px] w-full flex-col overflow-y-auto bg-[var(--Mapped-Surface-Primary)] px-6 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[372px] max-md:p-0">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-[var(--Mapped-Surface-Dark)]" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-[20px] w-[120px] rounded-md bg-[var(--Mapped-Surface-Dark)]" />
                        <Skeleton className="h-[20px] w-[200px] rounded-md bg-[var(--Mapped-Surface-Dark)]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-[32px] w-[32px] rounded-full bg-[var(--Mapped-Surface-Dark)]" />
                      <Skeleton className="h-[32px] w-[32px] rounded-full bg-[var(--Mapped-Surface-Dark)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

DashboardSkeleton.displayName = 'DashboardSkeleton'
