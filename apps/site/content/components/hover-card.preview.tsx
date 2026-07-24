'use client'

import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Link } from '@devalok/shilp-sutra/ui/link'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@devalok/shilp-sutra/ui/hover-card'

export function HoverCardHero() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href="#">@aisha</Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex items-center gap-ds-03">
          <Avatar>
            <AvatarFallback colorSeed="Aisha Kapoor">AK</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-body-md font-semibold text-surface-fg">Aisha Kapoor</span>
            <span className="text-body-sm text-surface-fg-subtle">Design Lead · joined 2024</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function HoverCardVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="align + side">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link href="#">Hover for details</Link>
          </HoverCardTrigger>
          <HoverCardContent align="start" side="bottom">
            <p className="text-body-sm text-surface-fg-subtle">
              HoverCard is pointer-only — use Popover for keyboard-essential content.
            </p>
          </HoverCardContent>
        </HoverCard>
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
