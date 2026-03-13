import type * as React from 'react'

/* ---------------------------------------------------------------------------
 * Upload file types (migrated from composed/upload-progress)
 * ------------------------------------------------------------------------ */

export interface UploadFile {
  id: string
  name: string
  /** File size in bytes */
  size: number
  /** 0-100 progress percentage. undefined = indeterminate */
  progress?: number
  /** Upload state */
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  /** Error message if status is 'error' */
  error?: string
  /** Optional preview URL (for images) */
  previewUrl?: string
}

/* ---------------------------------------------------------------------------
 * Toast option types
 * ------------------------------------------------------------------------ */

export interface ToastActionOptions {
  label: string
  onClick: () => void
}

export interface ToastUndoOptions {
  onUndo: () => void
  /** Auto-dismiss duration in ms. Default: 8000 */
  duration?: number
  description?: string
}

export interface ToastUploadOptions {
  /** Pass an existing toast id to update it */
  id?: string
  files: UploadFile[]
  onRetry?: (fileId: string) => void
  onRemove?: (fileId: string) => void
}

export interface ToastOptions {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionOptions
  cancel?: ToastActionOptions
  duration?: number
}

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'message'
