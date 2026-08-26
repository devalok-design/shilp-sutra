'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@devalok/shilp-sutra/ui/sheet'

export function SheetHero() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Account settings</SheetTitle>
          <SheetDescription>Manage your profile and workspace preferences.</SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-ds-06">
          <SheetClose asChild>
            <Button variant="soft">Cancel</Button>
          </SheetClose>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function SheetVariants() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-ds-06">
      {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
        <Block key={side} title={`side="${side}"`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="soft" size="sm">{side}</Button>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <SheetTitle>From the {side}</SheetTitle>
                <SheetDescription>The panel slides in from the {side} edge of the screen.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Block>
      ))}
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
