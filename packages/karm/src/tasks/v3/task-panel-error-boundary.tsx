'use client'

import * as React from 'react'
import { Icon } from '@/ui/icon'
import { Button } from '@/ui/button'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'

interface State { hasError: boolean; error: Error | null }

export class TaskPanelErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose?: () => void },
  State
> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-ds-04 p-ds-08 text-center">
          <Icon icon={IconAlertTriangle} size="xl" className="text-warning-11" />
          <p className="text-ds-sm font-medium text-surface-fg">Something went wrong</p>
          <p className="text-ds-xs text-surface-fg-muted max-w-xs">
            This task panel encountered an error. Try refreshing or close and reopen the panel.
          </p>
          <div className="flex gap-ds-03">
            <Button
              variant="outline"
              size="sm"
              startIcon={<Icon icon={IconRefresh} />}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </Button>
            {this.props.onClose && (
              <Button variant="ghost" size="sm" onClick={this.props.onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
