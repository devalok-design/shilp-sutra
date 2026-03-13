'use client'

/**
 * @deprecated Use `toast` directly from `@devalok/shilp-sutra/ui/toast` or `@devalok/shilp-sutra`.
 * This module is provided for back-compatibility during migration.
 *
 * @example
 * // New API (recommended):
 * import { toast } from '@devalok/shilp-sutra'
 * toast.success('Saved!')
 *
 * // Old API (deprecated):
 * import { toast } from '@devalok/shilp-sutra/hooks/use-toast'
 * toast('Something happened')
 */
export { toast } from '../ui/toast'
export type {
  UploadFile,
  ToastActionOptions,
  ToastUndoOptions,
  ToastUploadOptions,
  ToastOptions,
  ToastType,
} from '../ui/toast-types'
