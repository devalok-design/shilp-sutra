'use client'

import { useState, useRef } from 'react'
import { BreakDeleteIcon } from '../icons'
import { useToast } from '../../../hooks/use-toast'
import { Dialog, DialogContent, DialogTrigger } from '../../../ui/dialog'
import { CustomButton } from '../../custom-buttons/CustomButton'
import { IconButton } from '../../custom-buttons/icon-button'

// ============================================================
// DeleteBreak — Confirmation dialog for deleting a break request
// ============================================================

export interface DeleteBreakProps {
  id: string
  userId: string
  onDelete?: () => void
}

export function DeleteBreak({ id: _id, userId: _userId, onDelete }: DeleteBreakProps) {
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
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconButton icon={<BreakDeleteIcon />} size="medium" />
      </DialogTrigger>
      <DialogContent className="flex w-[335px] flex-col items-center gap-ds-06 p-ds-06 max-md:w-[90%] max-md:rounded-[8px]">
        <div className="flex w-full max-w-[240px] flex-col items-center gap-ds-04 text-center">
          <p className="P6 text-center text-[var(--color-text-primary)]">
            Delete this break?
          </p>
          <p className="P2 text-[var(--color-text-tertiary)]">
            This will be permanently deleted and can not undo
          </p>
        </div>
        <form ref={formRef} onSubmit={handleDeleteLeave} className="w-full">
          <CustomButton
            className="w-full"
            type="filled"
            text="Yes, Delete"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

DeleteBreak.displayName = 'DeleteBreak'
