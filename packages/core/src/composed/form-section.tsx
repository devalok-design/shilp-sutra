'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { springs } from '../ui/lib/motion'
import { IconChevronDown } from '@tabler/icons-react'
import { Icon } from '../ui/icon'
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

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(({
  title,
  description,
  collapsible = false,
  defaultOpen = true,
  children,
  className,
  ...props
}, ref) => {
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

  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  if (collapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} onOpenChange={setIsOpen} className={cn('space-y-ds-04', className)} {...props}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-ds-02 group">
          {header}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={springs.snappy}
            className="inline-flex"
          >
            <Icon icon={IconChevronDown} size="sm" className="text-surface-fg-muted" />
          </motion.span>
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
    <div ref={ref} className={cn('space-y-ds-04', className)} {...props}>
      {header}
      <div className="border-b border-surface-border-subtle" />
      <div className="space-y-ds-04">
        {children}
      </div>
    </div>
  )
})
FormSection.displayName = 'FormSection'

export { FormSection }
