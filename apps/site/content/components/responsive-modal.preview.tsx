'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from '@devalok/shilp-sutra/composed/responsive-modal'

export function ResponsiveModalHero() {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button>Filter results</Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Filters</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Narrow the result set. Centered dialog on desktop, bottom sheet on mobile.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="flex flex-col gap-ds-03 text-body-sm text-surface-fg-muted">
            <p>Status, owner, and date range controls would live in this scrollable body.</p>
            <p>Resize the window below 768px to see it become a drag-to-dismiss bottom sheet.</p>
          </div>
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          <ResponsiveModalClose asChild>
            <Button variant="soft">Cancel</Button>
          </ResponsiveModalClose>
          <Button>Apply filters</Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

export function ResponsiveModalVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="snapPoints={[0.5, 0.9]} (mobile rest heights)">
        <ResponsiveModal>
          <ResponsiveModalTrigger asChild>
            <Button variant="outline">Open with snap points</Button>
          </ResponsiveModalTrigger>
          <ResponsiveModalContent snapPoints={[0.5, 0.9]}>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Snap-point sheet</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                On mobile the sheet rests at 50% and 90% of the viewport and can be dragged between them.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <ResponsiveModalBody>
              <p className="text-body-sm text-surface-fg-muted">
                Snap points are ignored on desktop, where this stays a centered dialog.
              </p>
            </ResponsiveModalBody>
            <ResponsiveModalFooter>
              <ResponsiveModalClose asChild>
                <Button variant="soft">Done</Button>
              </ResponsiveModalClose>
            </ResponsiveModalFooter>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}
