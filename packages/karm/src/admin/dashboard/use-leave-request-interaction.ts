'use client'

// ============================================================
// useLeaveRequestInteraction — Grouped interaction state for LeaveRequests
// Extracts all 8 useState calls from leave-requests.tsx into a
// single hook with a reset() helper.
// ============================================================

import { useState, useCallback } from 'react'
import type { BreakRequest } from '../types'

// ============================================================
// Hook
// ============================================================

export function useLeaveRequestInteraction() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeRequest, setActiveRequest] = useState<BreakRequest | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [openComment, setOpenComment] = useState(false)
  const [hoveredRequest, setHoveredRequest] = useState<BreakRequest | null>(
    null,
  )
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [hoverActionTemp, setHoverActionTemp] = useState<string | null>(null)

  // ============================================================
  // reset — clear all interaction state after a request completes
  // ============================================================

  const reset = useCallback(() => {
    setIsProcessing(false)
    setActiveRequest(null)
    setActiveAction(null)
    setMessage('')
    setOpenComment(false)
    setHoveredRequest(null)
    setIsCtrlPressed(false)
    setHoverActionTemp(null)
  }, [])

  return {
    // State
    isProcessing,
    activeRequest,
    activeAction,
    message,
    openComment,
    hoveredRequest,
    isCtrlPressed,
    hoverActionTemp,

    // Setters
    setIsProcessing,
    setActiveRequest,
    setActiveAction,
    setMessage,
    setOpenComment,
    setHoveredRequest,
    setIsCtrlPressed,
    setHoverActionTemp,

    // Helpers
    reset,
  }
}
