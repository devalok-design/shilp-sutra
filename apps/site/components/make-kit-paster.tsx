'use client'

import { useState } from 'react'
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconExternalLink,
} from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Badge } from '@devalok/shilp-sutra/ui/badge'

type Item = {
  path: string
  label: string
  content: string
  sizeKB: number
}

type Props = {
  /** Display name shown in the group header (e.g. "Foundations") */
  title: string
  /** Short prescriptive sentence describing what to paste */
  description: string
  /** Files in the group */
  files: Item[]
  /** Concatenated content for the "Copy all" button */
  concat: string
  /** Package version used to build unpkg "View" links */
  version: string
}

export function MakeKitPaster({ title, description, files, concat, version }: Props) {
  const [allCopied, setAllCopied] = useState(false)

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(concat)
      setAllCopied(true)
      setTimeout(() => setAllCopied(false), 1800)
    } catch {
      // older browsers without clipboard permission — silent
    }
  }

  return (
    <section className="flex flex-col gap-ds-05">
      <header className="flex flex-col gap-ds-03 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-ds-02">
          <div className="flex items-center gap-ds-03">
            <h3 className="text-ds-xl font-medium text-fg">{title}</h3>
            <Badge variant="soft" size="sm">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </Badge>
          </div>
          <p className="text-ds-md text-fg-muted max-w-prose">{description}</p>
        </div>
        <Button
          variant="soft"
          size="sm"
          startIcon={allCopied ? IconCheck : IconCopy}
          onClick={copyAll}
        >
          {allCopied ? 'Copied all' : `Copy all ${files.length} files`}
        </Button>
      </header>
      <ul className="flex flex-col gap-ds-02">
        {files.map((file) => (
          <FileRow key={file.path} file={file} version={version} />
        ))}
      </ul>
    </section>
  )
}

function FileRow({ file, version }: { file: Item; version: string }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // silent
    }
  }

  const viewUrl = `https://unpkg.com/@devalok/shilp-sutra@${version}/make-kit/${file.path}`

  return (
    <li className="rounded-control border border-surface-border bg-surface-raised overflow-hidden">
      <div className="flex items-center justify-between px-ds-04 py-ds-03 gap-ds-03">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-ds-03 text-left flex-1 min-w-0"
          aria-expanded={expanded}
          aria-controls={`preview-${file.path}`}
        >
          {expanded ? (
            <IconChevronUp size={14} className="text-fg-muted shrink-0" />
          ) : (
            <IconChevronDown size={14} className="text-fg-muted shrink-0" />
          )}
          <code className="text-ds-sm font-mono text-fg truncate">{file.path}</code>
          <span className="text-ds-xs text-fg-subtle shrink-0">{file.sizeKB} KB</span>
        </button>
        <div className="flex items-center gap-ds-02 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View ${file.path} on unpkg`}
            asChild
          >
            <a href={viewUrl} target="_blank" rel="noreferrer">
              <IconExternalLink size={14} />
            </a>
          </Button>
          <Button
            variant={copied ? 'soft' : 'ghost'}
            color={copied ? 'success' : 'accent'}
            size="icon-sm"
            aria-label={copied ? `${file.path} copied` : `Copy ${file.path}`}
            onClick={copy}
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </Button>
        </div>
      </div>
      {expanded && (
        <pre
          id={`preview-${file.path}`}
          className="px-ds-04 py-ds-04 border-t border-surface-border-subtle bg-surface-overlay text-ds-xs font-mono leading-relaxed text-fg-muted overflow-x-auto max-h-80 whitespace-pre-wrap"
        >
          {file.content}
        </pre>
      )}
    </li>
  )
}
