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
    typeof selectedLeave?.cashout === 'number' ? selectedLeave.cashout : 0,
  )
  const [carryForward, setCarryForward] = useState(
    selectedLeave?.carryForward || 0,
  )
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setCashOutValue(
      typeof selectedLeave?.cashout === 'number' ? selectedLeave.cashout : 0,
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
          variant="secondary"
          className="P2 border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-ds-05 py-ds-04 pr-ds-06 text-[var(--color-text-secondary)] shadow-[0_4px_8px_0_var(--shadow-02)]"
        >
          <EditIcon />
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[308px] p-ds-06">
        <DialogHeader>
          <DialogDescription>
            <div className="flex flex-col items-center justify-start gap-[18px]">
              <p className="B2-Reg w-full text-left text-[var(--color-text-tertiary)]">
                Edit break balance conversion of <br className="mb-ds-02" />
                <span className="semibold text-[var(--color-interactive)]">
                  {selectedLeave?.user?.name}
                </span>
              </p>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                id="updatebreakbalanceform"
                className="flex w-full flex-col gap-ds-05"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="L3 uppercase text-[var(--color-text-placeholder)]">
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
                  <div className="L3 uppercase text-[var(--color-text-placeholder)]">
                    Carry forward
                  </div>
                  <div className="flex w-[100px] items-center justify-center">
                    <div className="B1-Reg semibold text-[var(--color-text-secondary)]">
                      {carryForward}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => formRef.current?.requestSubmit()}
                  disabled={isSubmitting}
                >Update</Button>
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

EditBreakBalance.displayName = 'EditBreakBalance'
