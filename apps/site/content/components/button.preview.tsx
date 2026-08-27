'use client'

import { IconArrowRight, IconTrash } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'

/**
 * Hero: the default render that anchors the page.
 * Keep it minimal — three buttons showing the soft-default convention.
 */
export function ButtonHero() {
  return (
    <div className="flex flex-wrap items-center gap-ds-03">
      <Button>Continue</Button>
      <Button variant="soft">Cancel</Button>
      <Button variant="ghost">Skip</Button>
    </div>
  )
}

export function ButtonVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <PreviewBlock title="variant">
        <div className="flex flex-wrap gap-ds-02">
          <Button>Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="color">
        <div className="flex flex-wrap gap-ds-02">
          <Button color="accent">Accent</Button>
          <Button color="success">Success</Button>
          <Button color="warning">Warning</Button>
          <Button color="error">Error</Button>
          <Button color="neutral">Neutral</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="size">
        <div className="flex flex-wrap items-center gap-ds-02">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="md">MD</Button>
          <Button size="lg">LG</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="shape">
        <div className="flex flex-wrap items-center gap-ds-02">
          <Button>Default</Button>
          <Button shape="pill">Pill</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="with icons">
        <div className="flex flex-wrap items-center gap-ds-02">
          <Button startIcon={<IconTrash size={14} />} variant="soft" color="error">
            Delete
          </Button>
          <Button endIcon={<IconArrowRight size={14} />}>Continue</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="loading + disabled">
        <div className="flex flex-wrap items-center gap-ds-02">
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
      </PreviewBlock>
    </div>
  )
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      {children}
    </div>
  )
}
