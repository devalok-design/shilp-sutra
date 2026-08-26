'use client'

import * as React from 'react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { ConfirmDialog } from '@devalok/shilp-sutra/composed/confirm-dialog'

export function ConfirmDialogHero() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button variant="soft" color="error" onClick={() => setOpen(true)}>
        Delete workspace
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this workspace?"
        description="Everyone loses access and all boards are archived. This cannot be undone."
        confirmText="Delete workspace"
        cancelText="Keep it"
        color="error"
        onConfirm={() => setOpen(false)}
      />
    </>
  )
}

export function ConfirmDialogVariants() {
  const [accentOpen, setAccentOpen] = React.useState(false)
  const [loadingOpen, setLoadingOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const runPublish = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLoadingOpen(false)
    }, 1400)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title='color="accent"'>
        <Button variant="soft" onClick={() => setAccentOpen(true)}>Publish now</Button>
        <ConfirmDialog
          open={accentOpen}
          onOpenChange={setAccentOpen}
          title="Publish this release?"
          description="It becomes visible to everyone in the organization immediately."
          confirmText="Publish"
          color="accent"
          onConfirm={() => setAccentOpen(false)}
        />
      </Block>

      <Block title="async loading state">
        <Button variant="soft" onClick={() => setLoadingOpen(true)}>Deploy</Button>
        <ConfirmDialog
          open={loadingOpen}
          onOpenChange={(v) => !loading && setLoadingOpen(v)}
          title="Deploy to production?"
          description="The confirm button spins while the request is in flight."
          confirmText="Deploy"
          loading={loading}
          onConfirm={runPublish}
        />
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
