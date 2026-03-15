'use client'

import * as React from 'react'
import type { Priority } from '../task-types'

export interface TaskActionRowTask {
  id: string
  title: string
  priority: Priority
  dueDate?: string | null
  projectName?: string
  projectId?: string
  stage?: string
  isOverdue?: boolean
  labels?: string[]
}

export interface TaskActionRowContextValue {
  task: TaskActionRowTask
}

const TaskActionRowContext = React.createContext<TaskActionRowContextValue | null>(null)

export function useTaskActionRow(): TaskActionRowContextValue {
  const ctx = React.useContext(TaskActionRowContext)
  if (!ctx) {
    throw new Error('useTaskActionRow must be used within a TaskActionRow.Root')
  }
  return ctx
}

export { TaskActionRowContext }
