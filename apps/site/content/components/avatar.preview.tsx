'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@devalok/shilp-sutra/ui/avatar'

export function AvatarHero() {
  return (
    <div className="flex items-center gap-ds-03">
      <Avatar>
        <AvatarFallback>ML</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>DV</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>KM</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function AvatarVariants() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <div className="flex items-center gap-ds-03">
          <Avatar size="xs"><AvatarFallback>XS</AvatarFallback></Avatar>
          <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
          <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
          <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
        </div>
      </Block>

      <Block title="with image + fallback">
        <div className="flex items-center gap-ds-03">
          <Avatar>
            <AvatarImage src="https://devalok-public-assets.s3.ap-south-1.amazonaws.com/brand/devalok/logos/monogram-brand-1024.png" alt="Devalok" />
            <AvatarFallback>DV</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://invalid.example.com/missing.png" alt="Will fail" />
            <AvatarFallback>ML</AvatarFallback>
          </Avatar>
        </div>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      {children}
    </div>
  )
}
