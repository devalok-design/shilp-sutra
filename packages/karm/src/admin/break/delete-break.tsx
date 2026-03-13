'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import { cn } from '@/ui/lib/utils'
import { BreakDeleteIcon } from '../icons'
import { toast } from '@/ui/toast'
import { Dialog, DialogContent, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { IconButton } from '@/ui/icon-button'

// ============================================================
// DeleteBreak — Confirmation dialog for deleting a break request
// ============================================================

export interface DeleteBreakProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  userId: string
  onDelete?: () => void
}

export const DeleteBreak = React.forwardRef<HTMLDivElement, DeleteBreakProps>(function DeleteBreak({ id: _id, userId: _userId, onDelete, className, ...props }, _ref) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleDeleteLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    ;(e as React.SyntheticEvent).stopPropagation?.()
    setIsSubmitting(true)

    try {
      if (onDelete) {
        onDelete()
      }

      toast.success('Break request deleted successfully')

      setOpen(false)
    } catch (error) {
      console.error('Error deleting break request:', error)
      toast.error('Failed to delete break request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconButton icon={<BreakDeleteIcon />} size="md" aria-label="Delete break" />
      </DialogTrigger>
      {/* intentional: dialog fixed width — compact confirmation dialog */}
      <DialogContent className={cn("flex w-[335px] flex-col items-center gap-ds-06 p-ds-06 max-md:w-[90%] max-md:rounded-ds-lg", className)} {...props}>
        <div className="flex w-full max-w-[240px] flex-col items-center gap-ds-04 text-center">
          <p className="text-ds-lg font-semibold text-center text-surface-fg">
            Delete this break?
          </p>
          <p className="text-ds-base text-surface-fg-subtle">
            This will be permanently deleted and can not undo
          </p>
        </div>
        <form ref={formRef} onSubmit={handleDeleteLeave} className="w-full">
          <Button
            className="w-full"
            variant="solid"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
          >Yes, Delete</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
})

DeleteBreak.displayName = 'DeleteBreak'
