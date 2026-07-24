'use client'

import * as React from 'react'
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
} from '@devalok/shilp-sutra/ui/skeleton'

export function SkeletonHero() {
  return (
    <div className="flex w-full max-w-sm items-center gap-ds-04">
      <SkeletonAvatar size="lg" />
      <div className="flex flex-1 flex-col gap-ds-03">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  )
}

export function SkeletonVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="variant">
        <Skeleton variant="rectangle" className="h-10 w-full" />
        <Skeleton variant="circle" className="h-10 w-10" />
        <Skeleton variant="text" />
      </Block>

      <Block title="animation">
        <Skeleton variant="rectangle" animation="pulse" className="h-10 w-full" />
        <Skeleton variant="rectangle" animation="shimmer" className="h-10 w-full" />
        <Skeleton variant="rectangle" animation="none" className="h-10 w-full" />
      </Block>

      <Block title="SkeletonText (paragraph)">
        <SkeletonText lines={3} />
      </Block>

      <Block title="SkeletonAvatar">
        <div className="flex items-center gap-ds-04">
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
          <SkeletonAvatar size="xl" />
        </div>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-04">{children}</div>
    </div>
  )
}
