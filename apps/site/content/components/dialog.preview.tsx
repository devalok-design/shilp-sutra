'use client'

import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@devalok/shilp-sutra/ui/dialog'

export function DialogHero() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your account here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="soft">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DialogVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="destructive action">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="soft" color="error">Delete project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This permanently deletes the project and all of its data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="soft">Cancel</Button>
              </DialogClose>
              <Button color="error">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Block>

      <Block title="responsive={false} (always centered)">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open centered</Button>
          </DialogTrigger>
          <DialogContent responsive={false}>
            <DialogHeader>
              <DialogTitle>Centered on every viewport</DialogTitle>
              <DialogDescription>
                With responsive disabled the panel stays a centered modal instead of a full-screen takeover on mobile.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="soft">Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}
