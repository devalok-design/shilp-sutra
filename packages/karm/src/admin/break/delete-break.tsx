'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import { BreakDeleteIcon } from '../icons'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { IconButton } from '@/ui/icon-button'

// ============================================================
// DeleteBreak — Confirmation dialog for deleting a break request
// ============================================================

export interface DeleteBreakProps {
  id: string
  userId: string
  onDelete?: () => void
}

export const DeleteBreak = React.forwardRef<HTMLDivElement, DeleteBreakProps>(function DeleteBreak({ id: _id, userId: _userId, onDelete }, _ref) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
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

      toast({
        description: 'Break request deleted successfully',
        variant: 'default',
      })

      setOpen(false)
    } catch (error) {
      console.error('Error deleting break request:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete break request',
        variant: 'error',
      })
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
      <DialogContent className="flex w-[335px] flex-col items-center gap-ds-06 p-ds-06 max-md:w-[90%] max-md:rounded-ds-lg">
        <div className="flex w-full max-w-[240px] flex-col items-center gap-ds-04 text-center">
          <p className="text-ds-lg font-semibold text-center text-text-primary">
            Delete this break?
          </p>
          <p className="text-ds-base text-text-tertiary">
            This will be permanently deleted and can not undo
          </p>
        </div>
        <form ref={formRef} onSubmit={handleDeleteLeave} className="w-full">
          <Button
            className="w-full"
            variant="primary"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
          >Yes, Delete</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
})

DeleteBreak.displayName = 'DeleteBreak'
