'use client'

import * as React from 'react'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@devalok/shilp-sutra/ui/context-menu'

export function ContextMenuHero() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-full max-w-md items-center justify-center rounded-control border border-dashed border-surface-border-strong text-body-sm text-surface-fg-muted select-none">
        Right-click anywhere here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Save as…</ContextMenuItem>
        <ContextMenuItem className="text-error-11">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function ContextMenuVariants() {
  const [bookmarks, setBookmarks] = React.useState(true)

  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="label · checkbox · submenu">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-control border border-dashed border-surface-border-strong text-body-sm text-surface-fg-muted select-none">
            Right-click target
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuCheckboxItem
              checked={bookmarks}
              onCheckedChange={setBookmarks}
            >
              Show bookmarks bar
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Copy link</ContextMenuItem>
                <ContextMenuItem>Email</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
