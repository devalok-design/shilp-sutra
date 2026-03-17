'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { IconChevronDown } from '@tabler/icons-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

// ============================================================
// Types
// ============================================================

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  collapsible?: boolean
  /** @default true */
  defaultOpen?: boolean
}

// ============================================================
// FormSection
// ============================================================

function FormSection({
  title,
  description,
  collapsible = false,
  defaultOpen = true,
  children,
  className,
  ...props
}: FormSectionProps) {
  const header = (
    <div className="flex flex-col gap-ds-01">
      <span className="text-ds-md font-semibold text-surface-fg font-sans">
        {title}
      </span>
      {description && (
        <span className="text-ds-sm text-surface-fg-muted font-sans">
          {description}
        </span>
      )}
    </div>
  )

  if (collapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className={cn('space-y-ds-04', className)} {...props}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-ds-02 group">
          {header}
          <IconChevronDown className="h-ico-sm w-ico-sm text-surface-fg-muted transition-transform duration-fast-02 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <div className="border-b border-surface-border-subtle" />
        <CollapsibleContent>
          <div className="space-y-ds-04 pt-ds-02">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={cn('space-y-ds-04', className)} {...props}>
      {header}
      <div className="border-b border-surface-border-subtle" />
      <div className="space-y-ds-04">
        {children}
      </div>
    </div>
  )
}

export { FormSection }
