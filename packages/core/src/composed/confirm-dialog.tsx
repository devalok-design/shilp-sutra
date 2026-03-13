'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { cn } from '../ui/lib/utils'

export interface ConfirmDialogProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /** Whether the dialog is open */
  open: boolean
  /** Called when the dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Dialog description */
  description: string
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Color of the confirm button */
  color?: 'default' | 'error'
  /** Whether the dialog is in a loading state */
  loading?: boolean
  /** Called when the user confirms. Dialog stays open — consumer controls closing via onOpenChange. */
  onConfirm: () => void | Promise<void>
}

const ConfirmDialog = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      color = 'default',
      loading = false,
      onConfirm,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent ref={ref} className={className} {...props}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
            <Button
              variant="solid"
              color={color}
              disabled={loading}
              onClick={() => onConfirm()}
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
)
ConfirmDialog.displayName = 'ConfirmDialog'

export { ConfirmDialog }
