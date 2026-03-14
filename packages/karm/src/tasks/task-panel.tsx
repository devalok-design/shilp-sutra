'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui'
import { Skeleton } from '@/ui/skeleton'

// ============================================================
// TaskPanelTab — Individual tab definition
// ============================================================

interface TaskPanelTabProps {
  /** Unique tab identifier */
  id: string
  /** Optional icon rendered in the tab trigger */
  icon?: React.ReactNode
  /** Tab trigger label */
  label: string
  /** Tab panel content */
  children: React.ReactNode
}

/**
 * Declarative tab definition for TaskPanel.Tabs.
 * Does not render anything on its own — TaskPanelTabs extracts props from these children.
 */
function TaskPanelTab(_props: TaskPanelTabProps): React.ReactElement | null {
  return null
}

TaskPanelTab.displayName = 'TaskPanelTab'

// Sentinel used by TaskPanelTabs to identify TaskPanelTab elements
const TAB_TYPE = TaskPanelTab

// ============================================================
// TaskPanelRoot — Root container
// ============================================================

interface TaskPanelRootProps {
  children: React.ReactNode
  className?: string
}

function TaskPanelRoot({ children, className }: TaskPanelRootProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden h-full', className)}>
      {children}
    </div>
  )
}

TaskPanelRoot.displayName = 'TaskPanelRoot'

// ============================================================
// TaskPanelHeader — Top section
// ============================================================

interface TaskPanelHeaderProps {
  children: React.ReactNode
  className?: string
}

function TaskPanelHeader({ children, className }: TaskPanelHeaderProps) {
  return (
    <div
      className={cn(
        'shrink-0 border-b border-surface-border-strong px-ds-06 pb-ds-05 pt-ds-06',
        className,
      )}
    >
      {children}
    </div>
  )
}

TaskPanelHeader.displayName = 'TaskPanelHeader'

// ============================================================
// TaskPanelTitle — Editable/read-only heading
// ============================================================

interface TaskPanelTitleProps {
  /** Current title value */
  value: string
  /** Whether the title can be edited inline */
  editable?: boolean
  /** Called when the user commits a title change */
  onUpdate?: (title: string) => void
  /** When true, shows a small "Subtask" label above the title */
  subtask?: boolean
  className?: string
}

function TaskPanelTitle({
  value,
  editable = false,
  onUpdate,
  subtask = false,
  className,
}: TaskPanelTitleProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync draft when value prop changes externally
  React.useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  // Auto-focus + select when entering edit mode
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onUpdate?.(trimmed)
    } else {
      setDraft(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Escape') {
      setEditing(false)
      setDraft(value)
    }
  }

  const activateEdit = () => {
    if (editable) setEditing(true)
  }

  return (
    <div className={className}>
      {subtask && (
        <p className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide mb-ds-01">
          Subtask
        </p>
      )}
      {editable && editing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-ds-lg font-semibold text-surface-fg outline-none"
        />
      ) : (
        <h2
          onClick={editable ? activateEdit : undefined}
          {...(editable && {
            role: 'button' as const,
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activateEdit()
              }
            },
          })}
          className={cn(
            'text-ds-lg font-semibold text-surface-fg',
            editable && 'cursor-text hover:text-accent-11 transition-colors',
          )}
        >
          {value}
        </h2>
      )}
    </div>
  )
}

TaskPanelTitle.displayName = 'TaskPanelTitle'

// ============================================================
// TaskPanelProperties — Property rows container
// ============================================================

interface TaskPanelPropertiesProps {
  children: React.ReactNode
  className?: string
}

function TaskPanelProperties({ children, className }: TaskPanelPropertiesProps) {
  return (
    <div
      className={cn(
        'border-b border-surface-border-strong px-ds-06 py-ds-05 space-y-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

TaskPanelProperties.displayName = 'TaskPanelProperties'

// ============================================================
// TaskPanelProperty — Generic property row
// ============================================================

interface TaskPanelPropertyProps {
  /** Icon element rendered at the start of the label area */
  icon: React.ReactNode
  /** Human-readable property label */
  label: string
  /** Property value / control */
  children: React.ReactNode
  className?: string
}

function TaskPanelProperty({ icon, label, children, className }: TaskPanelPropertyProps) {
  return (
    <div className={cn('flex items-center gap-ds-04 py-ds-03', className)}>
      <div className="flex items-center gap-ds-03 w-[120px] shrink-0 text-ds-sm text-surface-fg-muted [&>svg]:h-ico-sm [&>svg]:w-ico-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

TaskPanelProperty.displayName = 'TaskPanelProperty'

// ============================================================
// TaskPanelTabs — Tab system
// ============================================================

interface TaskPanelTabsProps {
  /** Default active tab id */
  defaultTab: string
  /** Called when the active tab changes */
  onTabChange?: (tab: string) => void
  /** Must contain TaskPanel.Tab children */
  children: React.ReactNode
  className?: string
}

function TaskPanelTabs({
  defaultTab,
  onTabChange,
  children,
  className,
}: TaskPanelTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab)

  const handleTabChange = React.useCallback(
    (tab: string) => {
      setActiveTab(tab)
      onTabChange?.(tab)
    },
    [onTabChange],
  )

  // Extract TaskPanelTab children
  const tabs: TaskPanelTabProps[] = []
  React.Children.toArray(children).forEach((child) => {
    if (React.isValidElement(child) && child.type === TAB_TYPE) {
      tabs.push(child.props as TaskPanelTabProps)
    }
  })

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn('flex flex-col flex-1 min-h-0', className)}
    >
      {/* Sticky tab bar */}
      <div className="sticky top-0 bg-surface-2 z-raised px-ds-06">
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.icon && (
                <span className="[&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:stroke-[1.5] shrink-0">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab content area */}
      <div className="flex-1 overflow-y-auto px-ds-06 py-ds-05">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {tab.children}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

TaskPanelTabs.displayName = 'TaskPanelTabs'

// ============================================================
// TaskPanelLoading — Skeleton placeholder
// ============================================================

interface TaskPanelLoadingProps {
  className?: string
}

function TaskPanelLoading({ className }: TaskPanelLoadingProps) {
  return (
    <div className={cn('space-y-ds-06 p-ds-06', className)}>
      <Skeleton className="h-ds-xs-plus w-3/4 bg-surface-3" />
      <div className="space-y-ds-04">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-ds-04">
            <Skeleton className="h-[16px] w-[120px] bg-surface-3" />
            <Skeleton className="h-[16px] flex-1 bg-surface-3" />
          </div>
        ))}
      </div>
      <div className="flex gap-ds-05 border-b border-surface-border-strong pb-ds-03">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[12px] w-[64px] bg-surface-3" />
        ))}
      </div>
      <div className="space-y-ds-04">
        <Skeleton className="h-ds-md w-full bg-surface-3" />
        <Skeleton className="h-ds-md w-full bg-surface-3" />
        <Skeleton className="h-ds-md w-4/5 bg-surface-3" />
      </div>
    </div>
  )
}

TaskPanelLoading.displayName = 'TaskPanelLoading'

// ============================================================
// Compound export
// ============================================================

const TaskPanel = Object.assign(TaskPanelRoot, {
  Header: TaskPanelHeader,
  Title: TaskPanelTitle,
  Properties: TaskPanelProperties,
  Property: TaskPanelProperty,
  Tabs: TaskPanelTabs,
  Tab: TaskPanelTab,
  Loading: TaskPanelLoading,
})

export { TaskPanel }
export type {
  TaskPanelRootProps,
  TaskPanelHeaderProps,
  TaskPanelTitleProps,
  TaskPanelPropertiesProps,
  TaskPanelPropertyProps,
  TaskPanelTabsProps,
  TaskPanelTabProps,
  TaskPanelLoadingProps,
}
