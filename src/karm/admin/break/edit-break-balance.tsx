'use client'

import { useState, useEffect, useRef } from 'react'
import { EditIcon } from '../icons'
import { useToast } from '../../../hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../ui/dialog'
import { Button } from '../../../ui/button'
import NumberInput from '../../../ui/number-input'
import { CustomButton } from '../../custom-buttons/CustomButton'
import type { BreakBalanceData } from '../types'

// ============================================================
// EditBreakBalance — Dialog for editing break balance (cashout / carry forward)
// ============================================================

export interface EditBreakBalanceProps {
  selectedLeave: BreakBalanceData
  onSave?: (data: {
    userId: string
    cashOutDays: number
    carryForward: number
    year: number
  }) => void
}

export function EditBreakBalance({
  selectedLeave,
  onSave,
}: EditBreakBalanceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cashOutValue, setCashOutValue] = useState(
    selectedLeave?.cashout === ('-' as unknown as number)
      ? 0
      : selectedLeave?.cashout || 0,
  )
  const [carryForward, setCarryForward] = useState(
    selectedLeave?.carryForward || 0,
  )
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setCashOutValue(
      selectedLeave?.cashout === ('-' as unknown as number)
        ? 0
        : selectedLeave?.cashout || 0,
    )
    setCarryForward(selectedLeave?.carryForward || 0)
  }, [selectedLeave])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (onSave) {
        onSave({
          userId: selectedLeave.userId,
          cashOutDays: cashOutValue,
          carryForward,
          year: new Date().getFullYear(),
        })
      }

      toast({
        description: 'Break balance updated successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating break balance:', error)
      toast({
        title: 'Error',
        description: 'Failed to update break balance',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="P2 border-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] px-4 py-3 pr-6 text-[var(--Mapped-Text-Secondary)] shadow-[0_4px_8px_0_var(--Elevation-2)]"
        >
          <EditIcon />
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[308px] p-6">
        <DialogHeader>
          <DialogDescription>
            <div className="flex flex-col items-center justify-start gap-[18px]">
              <p className="B2-Reg w-full text-left text-[var(--Mapped-Text-Tertiary)]">
                Edit break balance conversion of <br className="mb-1" />
                <span className="semibold text-[var(--Mapped-Text-Highlight)]">
                  {selectedLeave?.user?.name}
                </span>
              </p>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                id="updatebreakbalanceform"
                className="flex w-full flex-col gap-4"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="L3 uppercase text-[var(--Mapped-Text-Quaternary)]">
                    Cash out
                  </div>
                  <NumberInput
                    value={cashOutValue}
                    onChange={setCashOutValue}
                    min={0}
                    max={100}
                    step={1}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex w-full items-center justify-between">
                  <div className="L3 uppercase text-[var(--Mapped-Text-Quaternary)]">
                    Carry forward
                  </div>
                  <div className="flex w-[100px] items-center justify-center">
                    <div className="B1-Reg semibold text-[var(--Mapped-Text-Secondary)]">
                      {carryForward}
                    </div>
                  </div>
                </div>

                <CustomButton
                  className="w-full"
                  type="outline"
                  text="Update"
                  onClick={() => formRef.current?.requestSubmit()}
                  disabled={isSubmitting}
                />
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

EditBreakBalance.displayName = 'EditBreakBalance'
