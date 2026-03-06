'use client'

import * as React from 'react'
import { Badge } from '@/ui'
import type { BadgeProps } from '@/ui/badge'

// ============================================================
// Status Badge Renderer
// ============================================================

interface StatusConfig {
  text: string
  color: NonNullable<BadgeProps['color']>
}

const CORRECTION_STATUS_MAP: Record<string, StatusConfig> = {
  APPROVED: { text: 'Corrected', color: 'accent' },
  PENDING: { text: 'Pending', color: 'warning' },
  REJECTED: { text: 'Denied', color: 'error' },
  MISSING: { text: 'Missed', color: 'error' },
}

const STATUS_MAP: Record<string, StatusConfig> = {
  APPROVED: { text: 'Approved', color: 'success' },
  PENDING: { text: 'Pending', color: 'warning' },
  REJECTED: { text: 'Denied', color: 'error' },
  CANCELLED: { text: 'Redacted', color: 'error' },
  MISSING: { text: 'Missed', color: 'error' },
}

export function renderStatus(
  status: string,
  correction?: boolean,
): React.ReactNode {
  const map = correction ? CORRECTION_STATUS_MAP : STATUS_MAP
  const fallback = correction
    ? CORRECTION_STATUS_MAP.REJECTED
    : STATUS_MAP.REJECTED
  const { text, color } = map[status] || fallback

  return (
    <Badge color={color} size="sm">
      {text}
    </Badge>
  )
}
