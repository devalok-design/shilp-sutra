'use client'

import * as React from 'react'
import { Badge } from '@/ui'
import type { BadgeProps } from '@/ui/badge'

// ============================================================
// Status Badge Renderer
// ============================================================

interface StatusConfig {
  text: string
  variant: NonNullable<BadgeProps['variant']>
}

const CORRECTION_STATUS_MAP: Record<string, StatusConfig> = {
  APPROVED: { text: 'Corrected', variant: 'accent' },
  PENDING: { text: 'Pending', variant: 'warning' },
  REJECTED: { text: 'Denied', variant: 'error' },
  MISSING: { text: 'Missed', variant: 'error' },
}

const STATUS_MAP: Record<string, StatusConfig> = {
  APPROVED: { text: 'Approved', variant: 'success' },
  PENDING: { text: 'Pending', variant: 'warning' },
  REJECTED: { text: 'Denied', variant: 'error' },
  CANCELLED: { text: 'Redacted', variant: 'error' },
  MISSING: { text: 'Missed', variant: 'error' },
}

export function renderStatus(
  status: string,
  correction?: boolean,
): React.ReactNode {
  const map = correction ? CORRECTION_STATUS_MAP : STATUS_MAP
  const fallback = correction
    ? CORRECTION_STATUS_MAP.REJECTED
    : STATUS_MAP.REJECTED
  const { text, variant } = map[status] || fallback

  return (
    <Badge variant={variant} size="sm">
      {text}
    </Badge>
  )
}
