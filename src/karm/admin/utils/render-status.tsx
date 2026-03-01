'use client'

import * as React from 'react'

// ============================================================
// Status Badge Renderer
// ============================================================

interface StatusConfig {
  text: string
  className: string
}

const CORRECTION_STATUS_MAP: Record<string, StatusConfig> = {
  APPROVED: {
    text: 'Corrected',
    className:
      'bg-[var(--color-accent-subtle,#f8f6fc)] text-[var(--color-accent,#7c3aed)]',
  },
  PENDING: {
    text: 'Pending',
    className:
      'bg-[var(--color-warning-surface,#fff585)] text-[var(--color-warning,#a36200)]',
  },
  REJECTED: {
    text: 'Denied',
    className:
      'bg-[var(--color-error-surface,#ffc5c1)] text-[var(--color-error,#e00e00)]',
  },
  MISSING: {
    text: 'Missed',
    className:
      'bg-[var(--color-error-surface,#ffc5c1)] text-[var(--color-error,#e00e00)]',
  },
}

const STATUS_MAP: Record<string, StatusConfig> = {
  APPROVED: {
    text: 'Approved',
    className:
      'bg-[var(--color-success-surface,#e1f8e0)] text-[var(--color-success,#007a14)]',
  },
  PENDING: {
    text: 'Pending',
    className:
      'bg-[var(--color-warning-surface,#fff585)] text-[var(--color-warning,#a36200)]',
  },
  REJECTED: {
    text: 'Denied',
    className:
      'bg-[var(--color-error-surface,#ffc5c1)] text-[var(--color-error,#e00e00)]',
  },
  CANCELLED: {
    text: 'Redacted',
    className:
      'bg-[var(--color-error-surface,#ffc5c1)] text-[var(--color-text-error,#e00e00)]',
  },
  MISSING: {
    text: 'Missed',
    className:
      'bg-[var(--color-error-surface,#ffc5c1)] text-[var(--color-error,#e00e00)]',
  },
}

export function renderStatus(
  status: string,
  correction?: boolean,
): React.ReactNode {
  const map = correction ? CORRECTION_STATUS_MAP : STATUS_MAP
  const fallback = correction
    ? CORRECTION_STATUS_MAP.REJECTED
    : STATUS_MAP.REJECTED
  const { text, className } = map[status] || fallback

  return (
    <div className={`B3-Reg w-fit rounded-[24px] px-[6px] py-[4px] ${className}`}>
      {text}
    </div>
  )
}
