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
      <div className="z-raised flex w-full flex-col items-start justify-start rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-layer-02)] p-[16px] shadow-[var(--shadow-05)] max-md:h-[calc(100vh-201px)] max-md:max-h-[calc(100vh-201px)] max-md:overflow-y-auto max-md:border-0 max-md:px-ds-05 max-md:pb-[0px] max-md:pt-[24px]">
        {/* Header Section */}
        <div className="mb-ds-06 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="T6-Reg flex items-center gap-ds-03 text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-ds-03">
                <Skeleton className="h-[25px] w-[50px] rounded-[var(--radius-md)] bg-[var(--color-field)]" />
                <Skeleton className="h-[25px] w-[50px] rounded-[var(--radius-md)] bg-[var(--color-field)]" />
              </div>
              <FilledArrowIcon />
            </DropdownMenuTrigger>
          </DropdownMenu>
          <div className="flex w-full items-center justify-between gap-ds-05 md:mt-0 md:w-auto md:justify-start max-md:mt-[17px] max-lg:gap-[0.5rem]">
            <div className="hidden md:flex">
              <Skeleton className="h-[32px] w-[180px] rounded-[var(--radius-md)]" />
            </div>
            <div className="flex w-[200px] items-center justify-between overflow-clip rounded-[var(--radius-full)] border border-[var(--color-layer-03)]">
              <div className="flex h-[32px] w-[100px] items-center justify-center rounded-r-none bg-[var(--color-field)]">
                <Skeleton className="h-[20px] w-[40px] rounded-r-none bg-[var(--color-layer-03)]" />
              </div>
              <div className="flex h-[32px] w-[100px] items-center justify-center">
                <Skeleton className="h-[20px] w-[40px] bg-[var(--color-layer-03)]" />
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
              className="flex w-full flex-col items-center rounded-t-[var(--radius-lg)] pb-3.5 pt-ds-05 max-md:rounded-[var(--radius-lg)]"
            >
              <Skeleton className="mb-ds-03 h-[10px] w-[10px] rounded-[var(--radius-lg)] bg-[var(--color-field)]" />
              <div className="mx-ds-02 my-ds-02 flex items-center justify-center">
                <Skeleton className="h-[40px] w-[40px] rounded-[var(--radius-full)] bg-[var(--color-field)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="flex w-full flex-col rounded-[8px] bg-[var(--color-layer-02)] md:p-0 md:p-ds-06 max-md:bg-transparent">
          {/* User Groups Section */}
          <div className="no-scrollbar w-full cursor-grab overflow-x-auto active:cursor-grabbing max-md:pb-[16px]">
            <div
              className="items-flex-start flex flex-row justify-start gap-ds-04 px-0 pt-ds-03 md:gap-0 md:px-ds-06"
              style={{ minWidth: 'max-content' }}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex w-full flex-col gap-ds-04 rounded-[var(--radius-md)] bg-[var(--color-layer-02)] p-ds-06 md:rounded-[var(--radius-lg)] md:p-ds-05 ${
                    index !== 2 ? 'border-r border-[var(--color-border-default)]' : ''
                  } max-md:border-0 max-md:p-[16px]`}
                  style={{ minWidth: '200px' }}
                >
                  <Skeleton className="h-[20px] w-[120px] rounded-[var(--radius-md)] bg-[var(--color-field)]" />
                  <div className="flex flex-wrap items-center gap-ds-03">
                    {Array.from({ length: 4 }).map((_, imgIndex) => (
                      <Skeleton
                        key={imgIndex}
                        className={`h-10 w-10 rounded-[var(--radius-full)] bg-[var(--color-field)] ${
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
          <div className="w-full p-0 md:p-ds-06">
            <div className="max-md:pt[16px] flex flex-col items-start overflow-hidden rounded-[8px] border-0 border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] pt-ds-03 md:border max-md:pb-0">
              {/* Tab headers skeleton */}
              <div className="flex w-full items-start border-b-[1px] border-b-[var(--color-border-default)] px-ds-06 md:border-b max-md:border-0 max-md:px-[0px]">
                <div className="L3 cursor-pointer border-b-[1.5px] border-b-[var(--color-interactive-hover)] px-ds-03 py-ds-04 font-semibold uppercase text-[var(--color-text-primary)]">
                  REQUESTS(1)
                </div>
                <div className="L3 cursor-pointer px-ds-03 py-ds-04 uppercase text-[var(--color-text-tertiary)]">
                  ATTENDANCE CORRECTION(1)
                </div>
              </div>
              <div className="flex max-h-[200px] w-full flex-col overflow-y-auto bg-[var(--color-layer-01)] px-ds-06 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[372px] max-md:p-0">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-ds-03 py-3.5"
                  >
                    <div className="flex items-center gap-ds-04">
                      <Skeleton className="h-10 w-10 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                      <div className="flex flex-col gap-ds-02">
                        <Skeleton className="h-[20px] w-[120px] rounded-[var(--radius-md)] bg-[var(--color-field)]" />
                        <Skeleton className="h-[20px] w-[200px] rounded-[var(--radius-md)] bg-[var(--color-field)]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-ds-04">
                      <Skeleton className="h-[32px] w-[32px] rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                      <Skeleton className="h-[32px] w-[32px] rounded-[var(--radius-full)] bg-[var(--color-field)]" />
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
