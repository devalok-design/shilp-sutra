'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { EditIcon, ArrowRightIcon, ArrowDownIcon } from '../icons'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { DeleteBreak } from './delete-break'
import { removeAllEmojis } from '../utils/emoji-utils'
import { cn } from '@/ui/lib/utils'
import {
  isDateInRange,
  isDateSameOrAfter,
  isDateAfter,
  checkDateOverlap,
  isBreakDay,
} from '../utils/date-range-utils'
import { isSameDay } from '../utils/date-utils'
import { useBreakDatePicker } from './use-break-date-picker'
import {
  format,
  endOfMonth,
  getDay,
  getDaysInMonth,
  subDays,
  addDays,
} from 'date-fns'
import type { BreakRequest } from '../types'

// ============================================================
// EditBreak — Dialog for editing break details with inline calendar
// ============================================================

interface CalendarDay {
  date: number
  fullDate: string
  isPadding: boolean
  isToday: boolean
  isWeekend: boolean
}

export interface EditBreakProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedLeave: BreakRequest & { numberOfDays: number }
  existingBreaks?: BreakRequest[]
  onFetchMonthBreaks?: (month: number, year: number) => Promise<BreakRequest[]>
  onSave?: (data: {
    requestId: string
    userId: string
    status: string
    adminComment: string
    startDate: string
    endDate: string
    isEditing: boolean
  }) => void
  onDelete?: () => void
}

export const EditBreak = React.forwardRef<HTMLDivElement, EditBreakProps>(function EditBreak({
  selectedLeave,
  existingBreaks: existingBreaksProp,
  onFetchMonthBreaks,
  onSave,
  onDelete,
  className,
  ...props
}, _ref) {
  // ============================================================
  // Local UI state (not calendar-related)
  // ============================================================

  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [existingBreaks, setExistingBreaks] = useState<BreakRequest[]>(
    existingBreaksProp || [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    status: string
    comment: string
    startDate: string
    endDate: string
  }>({
    status: selectedLeave?.status || '',
    comment: selectedLeave?.adminComment || '',
    startDate: selectedLeave?.startDate || '',
    endDate: selectedLeave?.endDate || '',
  })

  // ============================================================
  // Calendar date picker (extracted hook)
  // ============================================================

  const picker = useBreakDatePicker()

  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    if (selectedLeave) {
      const formatDateStr = (dateString?: string) => {
        if (!dateString) return ''
        return format(new Date(dateString), 'yyyy-MM-dd')
      }

      setFormData({
        status: selectedLeave?.status || '',
        comment: selectedLeave?.adminComment || '',
        startDate: formatDateStr(selectedLeave?.startDate),
        endDate: formatDateStr(selectedLeave?.endDate),
      })
      picker.setSelectedStartDate(formatDateStr(selectedLeave?.startDate))
      picker.setSelectedEndDate(formatDateStr(selectedLeave?.endDate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeave])

  useEffect(() => {
    if (existingBreaksProp) {
      setExistingBreaks(existingBreaksProp)
      return
    }

    if (onFetchMonthBreaks) {
      onFetchMonthBreaks(picker.currentMonth, picker.currentYear)
        .then((breaks) => {
          if (breaks) {
            setExistingBreaks(
              breaks.map((br) => ({
                ...br,
                startDate: new Date(br.startDate).toISOString(),
                endDate: new Date(br.endDate).toISOString(),
              })),
            )
          }
        })
        .catch((error) => {
          console.error('Error fetching breaks:', error)
        })
    }
  }, [picker.currentMonth, picker.currentYear, existingBreaksProp, onFetchMonthBreaks])

  // ============================================================
  // Handlers
  // ============================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleStatusSelect = (status: string) => {
    setFormData((prevState) => ({
      ...prevState,
      status,
    }))
    setShowStatusOptions(false)
  }

  const handleOpenCalendar = (dateType: 'start' | 'end') => {
    picker.setActiveDate(dateType)

    if (dateType === 'start' && formData.startDate) {
      const startDate = new Date(formData.startDate)
      picker.setCurrentMonth(startDate.getMonth())
      picker.setCurrentYear(startDate.getFullYear())
    } else if (dateType === 'end' && formData.endDate) {
      const endDate = new Date(formData.endDate)
      picker.setCurrentMonth(endDate.getMonth())
      picker.setCurrentYear(endDate.getFullYear())
    }

    picker.setShowCalendar(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.status === 'PENDING') {
      toast({
        title: 'Action Required',
        description: 'Please update the status',
        color: 'neutral',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (onSave) {
        onSave({
          requestId: selectedLeave.id,
          userId: selectedLeave.userId,
          status: formData.status,
          adminComment: formData.comment,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          isEditing: true,
        })
      }

      toast({
        description: 'Break request updated successfully',
        color: 'neutral',
      })
    } catch (error) {
      console.error('Error updating break request:', error)
      toast({
        title: 'Error',
        description: 'Failed to update break request',
        color: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================
  // Status rendering
  // ============================================================

  const renderStatus = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      APPROVED: {
        text: 'Approved',
        className:
          'bg-success-surface text-text-success',
      },
      PENDING: {
        text: 'Pending',
        className: 'bg-warning-surface text-text-warning',
      },
      REJECTED: {
        text: 'Deny',
        className: 'bg-error-surface text-text-error',
      },
      CANCELLED: {
        text: 'Redacted',
        className: 'bg-error-surface text-text-error',
      },
    }

    const { text, className } = statusMap[status] || statusMap['REJECTED']
    return (
      <div
        className={cn('text-ds-sm w-fit rounded-ds-2xl px-ds-02b py-ds-02 capitalize', className)}
      >
        {text}
      </div>
    )
  }

  // ============================================================
  // Date helpers (date-fns)
  // ============================================================

  const formatDateToLongForm = (dateString: string) => {
    if (!dateString) return ''
    return format(new Date(dateString), 'EEEE, MMMM d')
  }

  const getDaysInMonthGrid = (month: number, year: number): CalendarDay[] => {
    const daysInMonth: CalendarDay[] = []
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = endOfMonth(firstDayOfMonth)
    const startPadding = getDay(firstDayOfMonth) // 0=Sunday
    const endPaddingCount = 6 - getDay(lastDayOfMonth)
    const today = new Date()

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = subDays(firstDayOfMonth, i + 1)
      daysInMonth.push({
        date: date.getDate(),
        fullDate: format(date, 'yyyy-MM-dd'),
        isPadding: true,
        isToday: isSameDay(date, today),
        isWeekend: false,
      })
    }

    // Current month days
    const totalDays = getDaysInMonth(firstDayOfMonth)
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i)
      daysInMonth.push({
        date: i,
        fullDate: format(date, 'yyyy-MM-dd'),
        isPadding: false,
        isToday: isSameDay(date, today),
        isWeekend: false,
      })
    }

    // Next month padding
    for (let i = 1; i <= endPaddingCount; i++) {
      const date = addDays(lastDayOfMonth, i)
      daysInMonth.push({
        date: date.getDate(),
        fullDate: format(date, 'yyyy-MM-dd'),
        isPadding: true,
        isToday: isSameDay(date, today),
        isWeekend: false,
      })
    }

    return daysInMonth
  }

  const handleDayClick = (day: CalendarDay) => {
    if (isBreakDay(day.fullDate, existingBreaks, selectedLeave.id)) {
      toast({
        title: 'Error',
        description: 'This date is already part of another break request.',
        color: 'error',
      })
      return
    }

    if (!day.isPadding) {
      if (picker.activeDate === 'start') {
        const newStartDate = day.fullDate
        const newEndDate = picker.selectedEndDate || newStartDate

        if (checkDateOverlap(newStartDate, newEndDate, existingBreaks, selectedLeave.id)) {
          toast({
            title: 'Error',
            description:
              'The selected date range overlaps with an existing break request.',
            color: 'error',
          })
          return
        }

        picker.setSelectedStartDate(newStartDate)
        setFormData((prev) => ({
          ...prev,
          startDate: newStartDate,
        }))

        if (picker.selectedEndDate && isDateAfter(newStartDate, picker.selectedEndDate)) {
          picker.setSelectedEndDate(newStartDate)
          setFormData((prev) => ({
            ...prev,
            endDate: newStartDate,
          }))
        }
      } else if (picker.activeDate === 'end') {
        const newEndDate = day.fullDate
        const newStartDate = picker.selectedStartDate || newEndDate

        if (checkDateOverlap(newStartDate, newEndDate, existingBreaks, selectedLeave.id)) {
          toast({
            title: 'Error',
            description:
              'The selected date range overlaps with an existing break request.',
            color: 'error',
          })
          return
        }

        if (
          picker.selectedStartDate &&
          isDateSameOrAfter(newEndDate, picker.selectedStartDate)
        ) {
          picker.setSelectedEndDate(newEndDate)
          setFormData((prev) => ({
            ...prev,
            endDate: newEndDate,
          }))
        } else if (!picker.selectedStartDate) {
          picker.setSelectedStartDate(newEndDate)
          picker.setSelectedEndDate(newEndDate)
          setFormData((prev) => ({
            ...prev,
            startDate: newEndDate,
            endDate: newEndDate,
          }))
        }
      }

      picker.setShowCalendar(false)
    }
  }

  const isInSelectedRange = (date: string): boolean => {
    if (!picker.selectedStartDate || !picker.selectedEndDate) {
      if (picker.showCalendar) {
        if (picker.activeDate === 'start' && formData.startDate === date) return true
        if (picker.activeDate === 'end' && formData.endDate === date) return true
      }
      return false
    }
    return isDateInRange(date, picker.selectedStartDate, picker.selectedEndDate)
  }

  const days = getDaysInMonthGrid(picker.currentMonth, picker.currentYear)

  // ============================================================
  // Render
  // ============================================================

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-ds-base border-border bg-layer-01 px-ds-05 py-ds-04 pr-ds-06 text-text-secondary shadow-02"
        >
          <EditIcon />
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      {/* intentional: dialog fixed width — edit-break form layout */}
      <DialogContent className={cn("w-[440px] p-ds-06 max-md:w-[90%] max-md:rounded-ds-lg", className)} {...props}>
        <DialogHeader>
          <DialogDescription>
            <div className="flex w-full flex-col items-center gap-ds-05">
              <p className="text-ds-md w-full text-left text-text-tertiary">
                Edit break details of{' '}
                <span className="font-semibold text-interactive">
                  {selectedLeave?.user?.name}
                </span>
              </p>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                id="updateleaveform"
                className="flex w-full flex-col gap-ds-05"
              >
                <div className="flex w-full flex-col gap-ds-02 rounded-ds-lg border border-border-subtle px-ds-05 pb-ds-03 pt-ds-04">
                  <h2 className="text-ds-xs font-semibold uppercase tracking-wider  text-text-placeholder">
                    Reason
                  </h2>
                  <p className="text-ds-md text-text-primary">
                    {removeAllEmojis(selectedLeave?.reason)}
                  </p>
                </div>

                <div className="flex w-full items-center justify-center gap-ds-02">
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar('start')}
                    className={cn(
                      'text-ds-md flex w-full items-center justify-center gap-ds-03 rounded-ds-full border bg-layer-02 px-ds-03 py-ds-03 text-text-secondary max-md:text-ds-sm',
                      picker.showCalendar && picker.activeDate === 'start' ? 'border-border-strong' : 'border-border',
                    )}
                  >
                    {formatDateToLongForm(formData.startDate)}
                  </button>
                  <div className="flex h-ico-sm w-ico-sm items-center">
                    <ArrowRightIcon className="h-ico-sm w-ico-sm text-icon-secondary" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar('end')}
                    className={cn(
                      'text-ds-md flex w-full items-center justify-center gap-ds-03 rounded-ds-full border bg-layer-02 px-ds-03 py-ds-03 text-text-secondary max-md:text-ds-sm',
                      picker.showCalendar && picker.activeDate === 'end' ? 'border-border-strong' : 'border-border',
                    )}
                  >
                    {formatDateToLongForm(formData.endDate)}
                  </button>
                </div>

                {/* Calendar overlay */}
                {picker.showCalendar && (
                  <div className="">
                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="rounded-ds-full p-ds-03 hover:bg-field-hover"
                        onClick={() => picker.navigateMonth('prev')}
                      >
                        <IconChevronLeft className="h-ico-md w-ico-md" />
                      </button>
                      <div className="text-ds-md font-semibold uppercase">
                        {new Date(picker.currentYear, picker.currentMonth).toLocaleString(
                          'default',
                          {
                            month: 'long',
                          },
                        )}{' '}
                        {picker.currentYear}
                      </div>
                      <button
                        type="button"
                        className="rounded-ds-full p-ds-03 hover:bg-field-hover"
                        onClick={() => picker.navigateMonth('next')}
                      >
                        <IconChevronRight className="h-ico-md w-ico-md" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="calendar grid w-full grid-cols-7 items-center gap-0 overflow-hidden">
                      {/* Render week day headers for monthly view */}
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(
                        (weekDay) => (
                          <div key={weekDay} className="pb-ds-03 pt-ds-05 text-center">
                            <span className="text-ds-sm font-semibold uppercase tracking-wider  text-text-tertiary">
                              {weekDay}
                            </span>
                          </div>
                        ),
                      )}

                      {/* Render calendar days */}
                      {days.map((day, index) => (
                        <button
                          type="button"
                          key={index}
                          tabIndex={day.isPadding ? -1 : 0}
                          aria-label={day.isPadding ? undefined : format(new Date(day.fullDate), 'MMMM d, yyyy')}
                          className={cn(
                            'flex cursor-pointer flex-col items-center pb-0 pt-0 text-center',
                            isInSelectedRange(day.fullDate) &&
                              !(day.fullDate === picker.selectedStartDate) &&
                              !(day.fullDate === picker.selectedEndDate) &&
                              'bg-layer-accent-subtle',
                            day.isPadding && 'opacity-[0.5]',
                            day.fullDate === picker.selectedStartDate &&
                              isInSelectedRange(day.fullDate) &&
                              'start-date mini',
                            day.fullDate === picker.selectedEndDate &&
                              isInSelectedRange(day.fullDate) &&
                              'end-date mini',
                            isInSelectedRange(day.fullDate) &&
                              !(day.fullDate === picker.selectedStartDate) &&
                              !(day.fullDate === picker.selectedEndDate) &&
                              'in-range-date',
                            picker.selectedStartDate === picker.selectedEndDate && 'same-date',
                          )}
                          onClick={() => handleDayClick(day)}
                        >
                          <div
                            className={cn(
                              'mx-ds-02 my-ds-02',
                              day.isPadding && 'opacity-[0.5]',
                            )}
                          >
                            <span
                              className={cn(
                                'text-ds-base flex h-ds-md w-ds-md items-center justify-center rounded-ds-full',
                                (day.fullDate === picker.selectedStartDate ||
                                  day.fullDate === picker.selectedEndDate ||
                                  isBreakDay(day.fullDate, existingBreaks, selectedLeave.id)) &&
                                  'bg-accent ring-2 ring-inset ring-accent',
                                day.isToday
                                  ? 'bg-interactive-hover p-ds-03 text-text-on-color'
                                  : 'text-text-secondary',
                              )}
                            >
                              {day.date}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex w-full items-center justify-between rounded-ds-lg border border-border px-ds-05 py-ds-04">
                  <p className="text-ds-xs font-semibold uppercase tracking-wider  text-text-placeholder">
                    No of Days
                  </p>
                  <p className="text-ds-xl font-semibold text-text-primary">
                    {selectedLeave.numberOfDays}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between rounded-ds-lg border border-border px-ds-05 py-ds-04">
                  <p className="text-ds-xs font-semibold uppercase tracking-wider  text-text-placeholder">
                    Status
                  </p>
                  <div className="relative flex items-center gap-ds-02">
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-ds-02"
                      aria-label="Change status"
                      aria-haspopup="listbox"
                      aria-expanded={showStatusOptions}
                      onClick={() => setShowStatusOptions(!showStatusOptions)}
                    >
                      {renderStatus(formData.status)}
                      <ArrowDownIcon />
                    </button>
                    {showStatusOptions && (
                      <div className="text-ds-base absolute left-[10px] top-[25px] z-raised flex flex-col overflow-hidden rounded-ds-md border border-border bg-layer-01 shadow-02" role="listbox">
                        <div
                          className="cursor-pointer border-b border-b-border bg-layer-01 px-ds-04 py-ds-03 text-left"
                          role="option"
                          tabIndex={0}
                          aria-selected={formData.status === 'APPROVED'}
                          onClick={() => handleStatusSelect('APPROVED')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusSelect('APPROVED') } }}
                        >
                          {renderStatus('APPROVED')}
                        </div>
                        <div
                          className="cursor-pointer bg-layer-01 px-ds-04 py-ds-03 text-left"
                          role="option"
                          tabIndex={0}
                          aria-selected={formData.status === 'REJECTED'}
                          onClick={() => handleStatusSelect('REJECTED')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusSelect('REJECTED') } }}
                        >
                          {renderStatus('REJECTED')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-ds-02 rounded-ds-lg border border-border-subtle px-ds-05 pb-ds-03 pt-ds-04">
                  <h2 className="text-ds-xs font-semibold uppercase tracking-wider  text-text-placeholder">
                    Comment
                  </h2>
                  <input
                    type="text"
                    name="comment"
                    className="text-ds-md text-text-primary outline-none"
                    placeholder="Enjoy your break, TC"
                    value={formData.comment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <div className="flex h-ds-md w-ds-md items-center justify-center">
                    <DeleteBreak
                      id={selectedLeave.id}
                      userId={selectedLeave.userId}
                      onDelete={onDelete}
                    />
                  </div>
                  <Button
                    className="w-fit"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => formRef.current?.requestSubmit()}
                  >Update</Button>
                </div>
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
})

EditBreak.displayName = 'EditBreak'
