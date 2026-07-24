'use client'

import * as React from 'react'
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNav,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from '@devalok/shilp-sutra/ui/pagination'

export function PaginationHero() {
  const [page, setPage] = React.useState(4)
  return (
    <div className="max-w-xl">
      <PaginationNav totalPages={24} currentPage={page} onPageChange={setPage} />
    </div>
  )
}

export function PaginationVariants() {
  const [wide, setWide] = React.useState(6)
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="siblingCount=2 (wider range)">
        <PaginationNav totalPages={100} currentPage={wide} onPageChange={setWide} siblingCount={2} />
      </Block>

      <Block title="composed (manual parts)">
        <PaginationRoot>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </PaginationRoot>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-04 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center">{children}</div>
    </div>
  )
}
