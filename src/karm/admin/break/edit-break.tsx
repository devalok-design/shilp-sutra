'use client'

import { useState, useEffect, useRef } from 'react'
import { EditIcon, ArrowRightIcon, ArrowDownIcon } from '../icons'
import { useToast } from '../../../hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../ui/dialog'
import { Button } from '../../../ui/button'
import { DeleteBreak } from './delete-break'
import { removeAllEmojis } from '../utils/emoji-utils'
import { CustomButton } from '../../custom-buttons/CustomButton'
import { isSameDay } from '../utils/date-utils'
import {
  format,
  startOfMonth,
  endOfMonth,
  getDay,
  getDaysInMonth,
  subDays,
  addDays,
  isBefore,
  isAfter,
  isEqual,
  parseISO,
  isWithinInterval,
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

export interface EditBreakProps {
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

export function EditBreak({
  selectedLeave,
  existingBreaks: existingBreaksProp,
  onFetchMonthBreaks,
  onSave,
  onDelete,
}: EditBreakProps) {
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeDate, setActiveDate] = useState<'start' | 'end' | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    null,
  )
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)
  const [existingBreaks, setExistingBreaks] = useState<BreakRequest[]>(
    existingBreaksProp || [],
  )
  const formRef = useRef<HTMLFormElement>(null)
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
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      setSelectedStartDate(formatDateStr(selectedLeave?.startDate))
      setSelectedEndDate(formatDateStr(selectedLeave?.endDate))
    }
  }, [selectedLeave])

  useEffect(() => {
    if (existingBreaksProp) {
      setExistingBreaks(existingBreaksProp)
      return
    }

    if (onFetchMonthBreaks) {
      onFetchMonthBreaks(currentMonth, currentYear)
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
  }, [currentMonth, currentYear, existingBreaksProp, onFetchMonthBreaks])

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
    setActiveDate(dateType)

    if (dateType === 'start' && formData.startDate) {
      const startDate = new Date(formData.startDate)
      setCurrentMonth(startDate.getMonth())
      setCurrentYear(startDate.getFullYear())
    } else if (dateType === 'end' && formData.endDate) {
      const endDate = new Date(formData.endDate)
      setCurrentMonth(endDate.getMonth())
      setCurrentYear(endDate.getFullYear())
    }

    setShowCalendar(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.status === 'PENDING') {
      toast({
        title: 'Action Required',
        description: 'Please update the status',
        variant: 'default',
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
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating break request:', error)
      toast({
        title: 'Error',
        description: 'Failed to update break request',
        variant: 'destructive',
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
          'bg-[var(--approved-bg)] text-[var(--Mapped-Text-Success-On-Light)]',
      },
      PENDING: {
        text: 'Pending',
        className: 'bg-[var(--pending-bg)] text-[var(--Mapped-Text-Warning)]',
      },
      REJECTED: {
        text: 'Deny',
        className: 'bg-[var(--denied-bg)] text-[var(--Mapped-Text-Error)]',
      },
      CANCELLED: {
        text: 'Redacted',
        className: 'bg-[var(--denied-bg)] text-[var(--Mapped-Text-Error)]',
      },
    }

    const { text, className } = statusMap[status] || statusMap['REJECTED']
    return (
      <div
        className={`B3-Reg w-fit rounded-[24px] px-[6px] py-[4px] capitalize ${className}`}
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

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // ============================================================
  // Date range / overlap helpers
  // ============================================================

  const isDateBetween = (
    dateStr: string,
    startStr: string,
    endStr: string,
  ): boolean => {
    const date = parseISO(dateStr)
    const start = parseISO(startStr)
    const end = parseISO(endStr)
    return isWithinInterval(date, { start, end })
  }

  const isDateSameOrBefore = (dateStr1: string, dateStr2: string): boolean => {
    const d1 = parseISO(dateStr1)
    const d2 = parseISO(dateStr2)
    return isBefore(d1, d2) || isEqual(d1, d2)
  }

  const isDateSameOrAfter = (dateStr1: string, dateStr2: string): boolean => {
    const d1 = parseISO(dateStr1)
    const d2 = parseISO(dateStr2)
    return isAfter(d1, d2) || isEqual(d1, d2)
  }

  const isDateAfter = (dateStr1: string, dateStr2: string): boolean => {
    return isAfter(parseISO(dateStr1), parseISO(dateStr2))
  }

  const checkOverlap = (newStartDate: string, newEndDate: string): boolean => {
    return existingBreaks.some((breakRequest) => {
      const brStart = format(new Date(breakRequest.startDate), 'yyyy-MM-dd')
      const brEnd = format(new Date(breakRequest.endDate), 'yyyy-MM-dd')

      const startOverlap = isDateBetween(newStartDate, brStart, brEnd)
      const endOverlap = isDateBetween(newEndDate, brStart, brEnd)
      const enclosingOverlap =
        isDateSameOrBefore(newStartDate, brStart) &&
        isDateSameOrAfter(newEndDate, brEnd)

      return (
        breakRequest.id !== selectedLeave.id &&
        (startOverlap || endOverlap || enclosingOverlap)
      )
    })
  }

  const handleDayClick = (day: CalendarDay) => {
    if (isBreakDay(day.fullDate)) {
      toast({
        title: 'Error',
        description: 'This date is already part of another break request.',
        variant: 'destructive',
      })
      return
    }

    if (!day.isPadding) {
      if (activeDate === 'start') {
        const newStartDate = day.fullDate
        const newEndDate = selectedEndDate || newStartDate

        if (checkOverlap(newStartDate, newEndDate)) {
          toast({
            title: 'Error',
            description:
              'The selected date range overlaps with an existing break request.',
            variant: 'destructive',
          })
          return
        }

        setSelectedStartDate(newStartDate)
        setFormData((prev) => ({
          ...prev,
          startDate: newStartDate,
        }))

        if (selectedEndDate && isDateAfter(newStartDate, selectedEndDate)) {
          setSelectedEndDate(newStartDate)
          setFormData((prev) => ({
            ...prev,
            endDate: newStartDate,
          }))
        }
      } else if (activeDate === 'end') {
        const newEndDate = day.fullDate
        const newStartDate = selectedStartDate || newEndDate

        if (checkOverlap(newStartDate, newEndDate)) {
          toast({
            title: 'Error',
            description:
              'The selected date range overlaps with an existing break request.',
            variant: 'destructive',
          })
          return
        }

        if (
          selectedStartDate &&
          isDateSameOrAfter(newEndDate, selectedStartDate)
        ) {
          setSelectedEndDate(newEndDate)
          setFormData((prev) => ({
            ...prev,
            endDate: newEndDate,
          }))
        } else if (!selectedStartDate) {
          setSelectedStartDate(newEndDate)
          setSelectedEndDate(newEndDate)
          setFormData((prev) => ({
            ...prev,
            startDate: newEndDate,
            endDate: newEndDate,
          }))
        }
      }

      setShowCalendar(false)
    }
  }

  const isInSelectedRange = (date: string): boolean => {
    if (!selectedStartDate || !selectedEndDate) {
      if (showCalendar) {
        if (activeDate === 'start' && formData.startDate === date) return true
        if (activeDate === 'end' && formData.endDate === date) return true
      }
      return false
    }
    return isDateBetween(date, selectedStartDate, selectedEndDate)
  }

  const isBreakDay = (date: string): boolean => {
    return existingBreaks.some((breakRequest) => {
      const brStart = format(new Date(breakRequest.startDate), 'yyyy-MM-dd')
      const brEnd = format(new Date(breakRequest.endDate), 'yyyy-MM-dd')
      return (
        breakRequest.id !== selectedLeave.id &&
        isDateBetween(date, brStart, brEnd)
      )
    })
  }

  const days = getDaysInMonthGrid(currentMonth, currentYear)

  // ============================================================
  // Render
  // ============================================================

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
      <DialogContent className="w-[440px] p-6 max-md:w-[90%] max-md:rounded-[8px]">
        <DialogHeader>
          <DialogDescription>
            <div className="flex w-full flex-col items-center gap-[18px]">
              <p className="B2-Reg w-full text-left text-[var(--Mapped-Text-Tertiary)]">
                Edit break details of{' '}
                <span className="semibold text-[var(--Mapped-Text-Highlight)]">
                  {selectedLeave?.user?.name}
                </span>
              </p>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                id="updateleaveform"
                className="flex w-full flex-col gap-4"
              >
                <div className="flex w-full flex-col gap-1 rounded-[8px] border border-[var(--border-secondary)] px-4 pb-2 pt-3.5">
                  <h2 className="L4 uppercase text-[var(--Text-Quaternary)]">
                    Reason
                  </h2>
                  <p className="P3 text-[var(--Mapped-Text-Primary)]">
                    {removeAllEmojis(selectedLeave?.reason)}
                  </p>
                </div>

                <div className="flex w-full items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar('start')}
                    className={`P3 flex w-full items-center justify-center gap-[10px] rounded-[48px] border ${
                      showCalendar && activeDate === 'start'
                        ? 'border-[var(--border-tertiary)]'
                        : 'border-[var(--border-primary)]'
                    } bg-[var(--Mapped-Surface-Tertiary)] px-[10px] py-[10px] text-[var(--Mapped-Text-Secondary)] max-md:text-[12px]`}
                  >
                    {formatDateToLongForm(formData.startDate)}
                  </button>
                  <div className="flex h-4 w-4 items-center">
                    <ArrowRightIcon className="h-4 w-4 text-[var(--border-tertiary)]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar('end')}
                    className={`P3 flex w-full items-center justify-center gap-[10px] rounded-[48px] border ${
                      showCalendar && activeDate === 'end'
                        ? 'border-[var(--border-tertiary)]'
                        : 'border-[var(--border-primary)]'
                    } bg-[var(--Mapped-Surface-Tertiary)] px-[10px] py-[10px] text-[var(--Mapped-Text-Secondary)] max-md:text-[12px]`}
                  >
                    {formatDateToLongForm(formData.endDate)}
                  </button>
                </div>

                {/* Calendar overlay */}
                {showCalendar && (
                  <div className="">
                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="rounded-full p-2 hover:bg-gray-100"
                        onClick={goToPreviousMonth}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <div className="B6-Reg uppercase">
                        {new Date(currentYear, currentMonth).toLocaleString(
                          'default',
                          {
                            month: 'long',
                          },
                        )}{' '}
                        {currentYear}
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-2 hover:bg-gray-100"
                        onClick={goToNextMonth}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="calender grid w-full grid-cols-7 items-center gap-0 overflow-hidden">
                      {/* Render week day headers for monthly view */}
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(
                        (weekDay) => (
                          <div key={weekDay} className="pb-2 pt-4 text-center">
                            <span className="L3 uppercase text-[var(--Mapped-Text-Tertiary)]">
                              {weekDay}
                            </span>
                          </div>
                        ),
                      )}

                      {/* Render calendar days */}
                      {days.map((day, index) => (
                        <div
                          key={index}
                          role="button"
                          tabIndex={0}
                          className={`
                            ${
                              isInSelectedRange(day.fullDate) &&
                              (day.fullDate === selectedStartDate ||
                                day.fullDate === selectedEndDate)
                                ? 'pb-0 pt-0'
                                : isInSelectedRange(day.fullDate)
                                  ? 'bg-[var(--Surface-Purple-button-tertiary)] pb-0 pt-0'
                                  : 'pb-0 pt-0'
                            }
                            flex cursor-pointer flex-col items-center text-center
                            ${day.isPadding ? 'opacity-50' : ''}
                            ${
                              day.fullDate === selectedStartDate &&
                              isInSelectedRange(day.fullDate)
                                ? 'start-date mini'
                                : day.fullDate === selectedEndDate &&
                                    isInSelectedRange(day.fullDate)
                                  ? 'end-date mini'
                                  : isInSelectedRange(day.fullDate) &&
                                      !(day.fullDate === selectedStartDate) &&
                                      !(day.fullDate === selectedEndDate)
                                    ? 'in-range-date'
                                    : ''
                            }
                            ${selectedStartDate === selectedEndDate ? 'same-date' : ''}
                          `}
                          onClick={() => handleDayClick(day)}
                        >
                          <div
                            className={`mx-1 my-1 ${
                              day.isPadding ? 'opacity-50' : ''
                            }`}
                          >
                            <span
                              className={`B1-Reg flex h-10 w-10 items-center justify-center rounded-full
                                ${
                                  day.fullDate === selectedStartDate ||
                                  day.fullDate === selectedEndDate ||
                                  isBreakDay(day.fullDate)
                                    ? 'rounded-full bg-[var(--Surface-Purple-button-secondary)] shadow-[0px_4px_4px_0px_rgba(255,255,255,0.25)_inset,0px_0px_4px_0px_var(--purple-400,#AB9DED)_inset]'
                                    : 'flex h-10 w-10 items-center justify-center'
                                }
                                ${
                                  day.isToday
                                    ? 'bg-[var(--Mapped-Text-Highlight2)] p-2 text-[var(--neutrals-lightest)]'
                                    : 'text-[var(--Mapped-Text-Secondary)]'
                                }
                              `}
                            >
                              {day.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex w-full items-center justify-between rounded-[8px] border border-[var(--border-primary)] px-4 py-3">
                  <p className="L4 uppercase text-[var(--Text-Quaternary)]">
                    No of Days
                  </p>
                  <p className="text-xl font-semibold text-[var(--Mapped-Text-Primary)]">
                    {selectedLeave.numberOfDays}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between rounded-[8px] border border-[var(--border-primary)] px-4 py-3">
                  <p className="L4 uppercase text-[var(--Text-Quaternary)]">
                    Status
                  </p>
                  <div
                    className="relative flex cursor-pointer items-center gap-1"
                    onClick={() => setShowStatusOptions(!showStatusOptions)}
                  >
                    {renderStatus(formData.status)}
                    <ArrowDownIcon />
                    {showStatusOptions && (
                      <div className="P2 absolute left-[10px] top-[25px] z-[4] flex flex-col overflow-hidden rounded-[7px] border border-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] shadow-[0px_4px_8px_0px_var(--Elevation-2)]">
                        <div
                          className="cursor-pointer border-b border-b-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] px-3 py-2"
                          onClick={() => handleStatusSelect('APPROVED')}
                        >
                          {renderStatus('APPROVED')}
                        </div>
                        <div
                          className="cursor-pointer bg-[var(--Mapped-Surface-Primary)] px-3 py-2"
                          onClick={() => handleStatusSelect('REJECTED')}
                        >
                          {renderStatus('REJECTED')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-1 rounded-[8px] border border-[var(--border-secondary)] px-4 pb-2 pt-3.5">
                  <h2 className="L4 uppercase text-[var(--Text-Quaternary)]">
                    Comment
                  </h2>
                  <input
                    type="text"
                    name="comment"
                    className="P3 text-[var(--Text-Primary)] outline-none"
                    placeholder="Enjoy your break, TC"
                    value={formData.comment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex w-full justify-between">
                  <div className="flex h-10 w-10 items-center justify-center">
                    <DeleteBreak
                      id={selectedLeave.id}
                      userId={selectedLeave.userId}
                      onDelete={onDelete}
                    />
                  </div>
                  <CustomButton
                    className="w-fit"
                    type="outline"
                    text="Update"
                    disabled={isSubmitting}
                    onClick={() => formRef.current?.requestSubmit()}
                  />
                </div>
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

EditBreak.displayName = 'EditBreak'
