import { useState } from 'react'

interface AccordionProps {
  label: string
  description?: string
  defaultOpen?: boolean
  hasChanges?: boolean
  children: React.ReactNode
}

export function Accordion({ label, description, defaultOpen = false, hasChanges, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-surface-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <div>
          <span className="text-sm font-medium text-surface-fg">{label}</span>
          {hasChanges && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-accent-9" />}
          {description && <p className="text-xs text-surface-fg-subtle">{description}</p>}
        </div>
        <span className="text-surface-fg-subtle text-xs">{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}
