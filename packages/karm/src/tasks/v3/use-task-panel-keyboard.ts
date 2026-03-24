'use client'

import { useEffect } from 'react'
import { useTaskPanel } from './task-panel-context'

/**
 * Keyboard shortcuts for TaskPanel (staff only).
 * S → status, A → assignee, P → priority, D → due date,
 * E → edit description, C → comment input, Escape → close.
 * J → prev task, K → next task.
 *
 * Dispatches custom events on document that individual pickers listen for.
 * Disabled when an input/textarea/contenteditable is focused.
 */
export function useTaskPanelKeyboard() {
  const { clientMode, onClose, onNavigatePrev, onNavigateNext } = useTaskPanel()

  useEffect(() => {
    if (clientMode) return

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return

      switch (e.key.toLowerCase()) {
        case 'escape':
          onClose()
          break
        case 's':
          document.dispatchEvent(new CustomEvent('taskpanel:focus', { detail: 'status' }))
          break
        case 'a':
          document.dispatchEvent(new CustomEvent('taskpanel:focus', { detail: 'assignee' }))
          break
        case 'p':
          document.dispatchEvent(new CustomEvent('taskpanel:focus', { detail: 'priority' }))
          break
        case 'd':
          document.dispatchEvent(new CustomEvent('taskpanel:focus', { detail: 'due-date' }))
          break
        case 'e':
          document.dispatchEvent(new CustomEvent('taskpanel:focus', { detail: 'description' }))
          break
        case 'c':
          document.dispatchEvent(new CustomEvent('taskpanel:focus', { detail: 'comment' }))
          break
        case 'j':
          onNavigatePrev?.()
          break
        case 'k':
          onNavigateNext?.()
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [clientMode, onClose, onNavigatePrev, onNavigateNext])
}
