# AppShell

- Import: @devalok/shilp-sutra/shell/app-shell
- Server-safe: No
- Category: shell

## Overview

The frame that lets a bar span above **both** the sidebar and the content.

`SidebarProvider` renders a single flex row, so a bar can only live *inside* the
content pane — which is why every shadcn example puts its `<header>` inside
`SidebarInset`. AppShell is the other arrangement: the bar is a sibling above the
row, the way Carbon's `Header` sits above its `SideNav`.

It provides layout and surfaces only. Put `TopBar` in the bar slot and compose
the `Sidebar` primitives in the sidebar slot — AppShell does not replace either.

## Subcomponents

| Component | Purpose |
|-----------|---------|
| `AppShell` | Root — owns the chrome surface and the arrangement |
| `AppShellBar` | Full-width bar above everything. Minimum height, never fixed. |
| `AppShellBody` | The row beneath the bar: sidebar alongside canvas |
| `AppShellSidebar` | Fixed-width slot, 16rem or 3rem collapsed |
| `AppShellCanvas` | The content pane; becomes an inset panel when `variant="inset"` |

## Props

### AppShell
    variant?: 'flat' | 'inset'    // default 'flat'
    chrome?: 'dim' | 'bright'     // default 'dim'; only applies when inset
    className?: string

### AppShellBar
    bordered?: boolean   // default: true when flat, false when inset
    className?: string

### AppShellSidebar
    collapsed?: boolean  // default false — 3rem instead of 16rem
    className?: string

### AppShellBody / AppShellCanvas
    className?: string

## Example

```tsx
import {
  AppShell, AppShellBar, AppShellBody, AppShellCanvas, AppShellSidebar,
} from '@devalok/shilp-sutra/shell/app-shell'
import { TopBar } from '@devalok/shilp-sutra/shell/top-bar'

export function Layout({ children }) {
  return (
    <AppShell variant="inset" chrome="dim">
      <AppShellBar>
        <TopBar>
          <TopBar.Left><TopBar.Title>Projects</TopBar.Title></TopBar.Left>
          <TopBar.Right><TopBar.UserMenu user={user} /></TopBar.Right>
        </TopBar>
      </AppShellBar>

      <AppShellBody>
        <AppShellSidebar>
          <Nav />
        </AppShellSidebar>
        <AppShellCanvas className="overflow-auto">
          {children}
        </AppShellCanvas>
      </AppShellBody>
    </AppShell>
  )
}
```

## The three arrangements

**`variant="flat"`** — chrome and content share one surface; a hairline on the
sidebar and under the bar does the separating. Widest content area.

**`variant="inset"`** — the content sits in a rounded panel inside the chrome.
`chrome` then decides which plane the frame takes and which the work takes:

| | light chrome | light canvas | dark chrome | dark canvas |
|---|---|---|---|---|
| `chrome="dim"` | `#eeeeee` | `#ffffff` | `#0a0a0a` | `#171717` |
| `chrome="bright"` | `#ffffff` | `#eeeeee` | `#171717` | `#0a0a0a` |

Both come from the same two tokens — `surface-sunken` and `surface-panel` —
swapped. There is no third tier and no per-theme special case.

The choice is not really about lightness. With `dim` a brand tint lands on the
frame and the work area stays neutral; with `bright` it is the reverse. That
decides whether your brand colour surrounds the work or sits underneath it.

## Composability

Layout only. It sets surfaces, widths and the inset geometry; everything inside
each slot is yours. Any component can go in any slot.

`AppShellSidebar` uses the same widths as `Sidebar` (16rem, 3rem collapsed), so
the two agree whether or not you nest one inside the other.

## Gotchas

**The bar height is a minimum, not a fixed value.** `TopBar` sizes to its
content, and a two-line workspace switcher legitimately needs more room than a
one-line one. Setting a fixed height clips it.

**The inset canvas is flush to the bar and the sidebar** and floats only off the
bottom-right. That is deliberate: it reads as the frame opening up rather than a
card dropped into the middle. A symmetric gap fights that.

**No shadow on the inset canvas.** It is a frame, not a floating thing — shadows
are reserved for what genuinely floats (menus, dialogs, popovers).

**A bar is optional, and dropping it is a product decision.** Without one, the
account and workspace switcher move into the sidebar footer. That changes what
the shell is for, not just how it looks.

## Changes

- 0.57.0 — added
