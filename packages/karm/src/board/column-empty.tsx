'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Button } from '@/ui/button'
import { IconPlus } from '@tabler/icons-react'

// ============================================================
// Illustrations — 4 variants cycling by column index
// Each uses stroke only, currentColor resolves to text-text-quaternary
// ============================================================

function IllustrationClipboard() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="12" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="30" x2="28" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="36" x2="24" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IllustrationStackedCards() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="14" y="10" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="19" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="28" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="35" x2="26" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IllustrationCheckmarkCircle() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
      <polyline
        points="17,24 22,30 31,18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IllustrationInbox() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="26" width="32" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 26 L14 14 H34 L40 26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="24" y1="8" x2="24" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline
        points="19,17 24,22 29,17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const ILLUSTRATIONS = [
  IllustrationClipboard,
  IllustrationStackedCards,
  IllustrationCheckmarkCircle,
  IllustrationInbox,
] as const

// ============================================================
// Component
// ============================================================

export interface ColumnEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column index — used to cycle through illustrations */
  index: number
  /** Called when the user clicks "Add a task" */
  onAddTask?: () => void
  /** When true, renders a drop-target hint instead of the default empty state */
  isDropTarget?: boolean
}

export function ColumnEmpty({ index, onAddTask, isDropTarget = false, className, ...props }: ColumnEmptyProps) {
  const Illustration = ILLUSTRATIONS[index % ILLUSTRATIONS.length]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-ds-03 py-ds-07 text-center',
        className,
      )}
      {...props}
    >
      <span className="text-text-quaternary">
        <Illustration />
      </span>

      {isDropTarget ? (
        <p className="text-ds-sm text-text-tertiary">Drop tasks here</p>
      ) : (
        <>
          <p className="text-ds-sm text-text-tertiary">No tasks yet</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
          >
            <IconPlus className="h-ico-sm w-ico-sm" />
            Add a task
          </Button>
        </>
      )}
    </div>
  )
}

ColumnEmpty.displayName = 'ColumnEmpty'
