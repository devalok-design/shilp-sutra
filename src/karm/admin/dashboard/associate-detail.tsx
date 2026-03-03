'use client'

// ============================================================
// AssociateDetail — Selected associate view with tasks,
// attendance status, break card, and edit dialog
// Extracted from admin-dashboard.tsx
// ============================================================

import * as React from 'react'
import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../../ui/dialog'
import { Button } from '../../../ui/button'
import { IconButton } from '../../../ui/icon-button'
import {
  EditIcon,
  SendIcon,
  AddIcon,
  DragIcon,
  DragActiveIcon,
  CheckboxIcon,
  CheckboxActiveIcon,
} from '../icons'
import { isSameDay } from '../utils/date-utils'
import { BreakRequestCard } from './break-request'
import { format, isBefore, startOfDay as fnsStartOfDay } from 'date-fns'
import type {
  AdminUser,
  AttendanceRecord,
  BreakRequest,
} from '../types'

// ============================================================
// Types
// ============================================================

export interface TaskItem {
  id: string
  title: string
  status: string
  assigneeIds?: string
  priority?: string
}

export interface AssociateDetailProps {
  selectedAssociate: AdminUser
  selectedDate: string
  selectedUserAttendance: AttendanceRecord | null
  userTasks: TaskItem[]
  selectedBreakRequest: BreakRequest | null
  isFutureDate: boolean
  assetsBaseUrl: string
  onUpdateAttendanceStatus?: (params: {
    userId: string
    date: string
    isPresent: boolean
  }) => void | Promise<void>
  onToggleTaskStatus?: (
    taskId: string,
    newStatus: string,
  ) => void | Promise<void>
  onAddTask?: (title: string, assigneeId: string) => void | Promise<void>
  onReorderTasks?: (
    draggedTaskId: string,
    targetTaskId: string,
  ) => void | Promise<void>
  onCancelBreak?: (params: {
    requestId: string
    deleteSingleDay: boolean
    dateToCancel: string | Date
    userId: string
  }) => void | Promise<void>
  onRefreshSelectedUserAttendance?: () => void | Promise<void>
  onRefreshAttendanceData?: () => void | Promise<void>
}

// ============================================================
// Sub-components
// ============================================================

function AttendanceStatus({
  selectedUserAttendance,
}: {
  selectedUserAttendance: AttendanceRecord | null
}) {
  const status = selectedUserAttendance?.status || 'ABSENT'
  const displayStatus = status === 'Not_Marked' ? 'ABSENT' : status
  const formattedStatus =
    displayStatus.charAt(0).toUpperCase() +
    displayStatus.slice(1).toLowerCase()

  const timeIn = selectedUserAttendance?.timeIn
    ? new Date(selectedUserAttendance.timeIn).toLocaleTimeString()
    : null

  return (
    <div className="flex w-full flex-col items-center justify-center px-ds-05 py-ds-07 sm:px-ds-05 sm:py-ds-06 md:px-ds-06 md:py-ds-05 md:pr-0">
      <p className="text-ds-sm font-semibold uppercase tracking-wider mb-ds-06  text-text-tertiary">
        Attendance status
      </p>
      <div className="mb-ds-04 flex w-full items-center justify-center gap-ds-03 rounded-3xl border border-border-subtle px-ds-05 py-3.5 text-center">
        <span className="font-semibold text-interactive">
          {formattedStatus}
        </span>
        {formattedStatus === 'Absent' && (
          <div
            style={{
              width: '1px',
              height: '20px',
              opacity: 0.5,
              background: 'var(--color-border-strong)',
            }}
          ></div>
        )}
        {!timeIn && status !== 'HOLIDAY' && status !== 'WEEKEND' && (
          <span className="text-ds-md text-text-tertiary">
            Not marked
          </span>
        )}
        {!!timeIn && status === 'ABSENT' && (
          <span className="text-ds-md text-text-tertiary">
            Removed
          </span>
        )}
      </div>

      {timeIn && (
        <p className="text-ds-md m-0 text-center text-text-disabled">
          Marked at {timeIn}
        </p>
      )}
    </div>
  )
}

function AttendanceEditDialog({
  selectedAssociate,
  selectedDate,
  selectedUserAttendance,
  onUpdateAttendanceStatus,
}: {
  selectedAssociate: AdminUser
  selectedDate: string
  selectedUserAttendance: AttendanceRecord | null
  onUpdateAttendanceStatus?: AssociateDetailProps['onUpdateAttendanceStatus']
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="text-ds-md text-text-tertiary">
          Edit attendance of{' '}
          <span className="text-ds-md font-bold font-semibold text-interactive">
            {selectedAssociate.name}
          </span>
        </div>
      </DialogHeader>
      <div className="flex flex-col items-center justify-start">
        <div className="text-ds-lg mb-ds-05 text-interactive">
          {format(new Date(selectedDate), "dd MMMM ''yy")}
        </div>
        <div className="mb-ds-04 flex w-full items-center justify-center gap-ds-03 rounded-3xl border border-border-subtle px-ds-05 py-3.5 text-center font-semibold text-interactive">
          {selectedUserAttendance?.status === 'PRESENT'
            ? 'PRESENT '
            : 'ABSENT'}
        </div>
      </div>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              const isPresent = selectedUserAttendance?.status !== 'PRESENT'
              onUpdateAttendanceStatus?.({
                userId: selectedAssociate.id,
                date: selectedDate,
                isPresent,
              })
            }}
          >
            {`Mark as ${selectedUserAttendance?.status === 'PRESENT' ? 'absent' : 'present'}`}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

// ============================================================
// Component
// ============================================================

export const AssociateDetail = React.forwardRef<HTMLDivElement, AssociateDetailProps>(
  function AssociateDetail({
  selectedAssociate,
  selectedDate,
  selectedUserAttendance,
  userTasks,
  selectedBreakRequest,
  isFutureDate,
  assetsBaseUrl,
  onUpdateAttendanceStatus,
  onToggleTaskStatus,
  onAddTask,
  onReorderTasks,
  onCancelBreak,
  onRefreshSelectedUserAttendance,
  onRefreshAttendanceData,
}, ref) {
  const [newTaskName, setNewTaskName] = useState('')
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null)
  const [hoveredTaskIndex, setHoveredTaskIndex] = useState<number | null>(null)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim() || !selectedAssociate) return

    await onAddTask?.(newTaskName, selectedAssociate.id)
    setNewTaskName('')
  }

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedTaskIndex(idx)
    ;(e.target as HTMLElement).classList.add('dragging')
  }

  const handleDrop = async (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (draggedTaskIndex !== null && draggedTaskIndex !== idx) {
      const draggedTask = userTasks[draggedTaskIndex]
      const targetTask = userTasks[idx]

      await onReorderTasks?.(draggedTask.id, targetTask.id)
    }
    setDraggedTaskIndex(null)
    setHoveredTaskIndex(null)
  }

  return (
    <div ref={ref} className="relative flex items-center justify-between md:items-stretch">
      {!isFutureDate && selectedUserAttendance?.status !== 'BREAK' && (
        <Dialog>
          <DialogTrigger asChild>
            <IconButton
              icon={<EditIcon />}
              size="sm"
              aria-label="Edit"
              className="absolute right-2 top-2"
            />
          </DialogTrigger>
          <AttendanceEditDialog
            selectedAssociate={selectedAssociate}
            selectedDate={selectedDate}
            selectedUserAttendance={selectedUserAttendance}
            onUpdateAttendanceStatus={onUpdateAttendanceStatus}
          />
        </Dialog>
      )}
      {isFutureDate ? (
        <>
          {selectedUserAttendance?.status === 'BREAK' ? (
            <BreakRequestCard
              selectedDate={selectedDate}
              userId={selectedAssociate.id}
              breakRequest={selectedBreakRequest}
              assetsBaseUrl={assetsBaseUrl}
              onCancelBreak={onCancelBreak}
              onRefreshAttendance={onRefreshSelectedUserAttendance}
              onRefreshGroupedAttendance={onRefreshAttendanceData}
            />
          ) : (
            <div className="min-h-28"></div>
          )}
        </>
      ) : selectedUserAttendance?.status === 'BREAK' ? (
        <BreakRequestCard
          selectedDate={selectedDate}
          userId={selectedAssociate.id}
          breakRequest={selectedBreakRequest}
          assetsBaseUrl={assetsBaseUrl}
          onCancelBreak={onCancelBreak}
          onRefreshAttendance={onRefreshSelectedUserAttendance}
          onRefreshGroupedAttendance={onRefreshAttendanceData}
        />
      ) : selectedUserAttendance?.status === 'ABSENT' ||
        (selectedUserAttendance?.status === 'Not_Marked' &&
          isBefore(
            new Date(selectedDate),
            fnsStartOfDay(new Date()),
          )) ? (
        <div className="flex w-full flex-col items-center justify-center p-ds-06">
          <p className="text-ds-sm font-semibold uppercase tracking-wider mb-ds-05  text-text-tertiary">
            COMMENT
          </p>
          <div className="flex w-full items-center justify-between rounded-ds-lg border border-border bg-layer-01 px-ds-05 max-md:h-ds-lg">
            <input
              className="text-ds-md flex-1 border-none py-ds-03 text-text-primary outline-none"
              defaultValue="Don't miss next time :)"
            />
            <IconButton
              icon={<SendIcon />}
              size="sm"
              aria-label="Update status"
              onClick={() => {
                const isPresent =
                  selectedUserAttendance?.status !== 'PRESENT'
                onUpdateAttendanceStatus?.({
                  userId: selectedAssociate.id,
                  date: selectedDate,
                  isPresent,
                })
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-auto flex w-full flex-col md:pr-ds-06">
          <p className="text-ds-sm font-semibold uppercase tracking-wider mb-ds-06  text-interactive">
            Tasks for the day
          </p>

          {userTasks && (
            <>
              <div className="no-scrollbar mb-ds-03 flex max-h-[250px] flex-col gap-ds-03 overflow-y-auto">
                {userTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`task-item mb-ds-03 flex items-center gap-ds-02 ${
                      draggedTaskIndex === idx ? 'dragging' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnter={() => setHoveredTaskIndex(idx)}
                    onDragLeave={() => setHoveredTaskIndex(null)}
                    onDragEnd={(e) => {
                      if (e.target instanceof HTMLElement) {
                        e.target.classList.remove('dragging')
                      }
                    }}
                  >
                    {hoveredTaskIndex === idx && (
                      <div className="drop-indicator"></div>
                    )}
                    {task.status === 'COMPLETED' ? (
                      <DragActiveIcon className="" />
                    ) : (
                      <DragIcon />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTaskStatus?.(
                          task.id,
                          task.status === 'COMPLETED'
                            ? 'TODO'
                            : 'COMPLETED',
                        )
                      }}
                      aria-label={task.status === 'COMPLETED' ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
                      className="cursor-pointer"
                    >
                      {task.status === 'COMPLETED' ? (
                        <CheckboxActiveIcon className="text-interactive-hover" />
                      ) : (
                        <CheckboxIcon />
                      )}
                    </button>
                    <p
                      className={`text-ds-md flex-1 overflow-hidden hyphens-auto break-all pr-ds-05 ${
                        task.status === 'COMPLETED'
                          ? 'text-text-disabled line-through'
                          : 'text-text-secondary'
                      }`}
                      style={{ wordBreak: 'break-word', minWidth: 0 }}
                    >
                      {task.title}
                    </p>
                  </div>
                ))}
              </div>
              {isSameDay(new Date(selectedDate), new Date()) && (
                <form
                  className="flex items-center gap-ds-02 pb-ds-05"
                  onSubmit={handleAddTask}
                >
                  <div className="w-ds-06"></div>
                  <button type="submit" className="appearance-none">
                    <AddIcon />
                  </button>
                  <textarea
                    className="text-ds-md flex w-full resize-none items-center border-none bg-transparent !leading-6 text-text-secondary outline-none placeholder:leading-6"
                    placeholder="Add a task"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddTask(e)
                      }
                    }}
                    rows={1}
                    style={{
                      minHeight: '24px',
                      height: 'auto',
                      overflow: 'hidden',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = target.scrollHeight + 'px'
                    }}
                  />
                </form>
              )}
            </>
          )}
        </div>
      )}
      {!isFutureDate && selectedUserAttendance?.status !== 'BREAK' && (
        <>
          <div className="block h-[auto] w-[2px] bg-border-subtle"></div>
          <AttendanceStatus selectedUserAttendance={selectedUserAttendance} />
        </>
      )}
    </div>
  )
},
)

AssociateDetail.displayName = 'AssociateDetail'
