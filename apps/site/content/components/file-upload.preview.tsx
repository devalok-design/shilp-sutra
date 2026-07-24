'use client'

import * as React from 'react'
import { FileUpload } from '@devalok/shilp-sutra/ui/file-upload'

export function FileUploadHero() {
  const [names, setNames] = React.useState<string[]>([])
  return (
    <div className="w-full max-w-md">
      <FileUpload
        onFiles={(files) => setNames(files.map((f) => f.name))}
        label="Drop files here or click to browse"
        sublabel="PNG, JPG, PDF up to 10MB"
      />
      {names.length > 0 && (
        <p className="mt-ds-03 text-body-sm text-surface-fg-subtle">
          Selected: {names.join(', ')}
        </p>
      )}
    </div>
  )
}

export function FileUploadVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="drop zone">
        <FileUpload onFiles={() => {}} />
      </Block>

      <Block title="compact (inline button)">
        <FileUpload compact onFiles={() => {}} label="Attach files" />
      </Block>

      <Block title="uploading with progress">
        <FileUpload onFiles={() => {}} uploading progress={64} />
      </Block>

      <Block title="error">
        <FileUpload onFiles={() => {}} error="File type is not accepted" />
      </Block>

      <Block title="disabled">
        <FileUpload onFiles={() => {}} disabled />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
