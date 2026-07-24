'use client'

import { TruncatedText } from '@devalok/shilp-sutra/ui/truncated-text'

export function TruncatedTextHero() {
  return (
    <div className="w-full max-w-xs">
      <TruncatedText>
        This is a long project title that will not fit on a single line and gets clipped with an ellipsis.
      </TruncatedText>
    </div>
  )
}

export function TruncatedTextVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title='mode="end" (default)'>
        <div className="w-full max-w-[240px]">
          <TruncatedText>
            A single-line label that trails off at the end when it overflows.
          </TruncatedText>
        </div>
      </Block>

      <Block title='mode="middle" (filenames)'>
        <div className="w-full max-w-[240px]">
          <TruncatedText mode="middle">quarterly-financial-report-2026-final-v2.pdf</TruncatedText>
        </div>
      </Block>

      <Block title='mode="clamp" lines={2}'>
        <div className="w-full max-w-[240px]">
          <TruncatedText mode="clamp" lines={2}>
            A longer description that wraps across multiple lines and is clamped to two lines before it is cut off with an ellipsis at the end.
          </TruncatedText>
        </div>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col text-body-md text-surface-fg">{children}</div>
    </div>
  )
}
