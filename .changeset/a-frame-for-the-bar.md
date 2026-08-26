---
"@devalok/shilp-sutra": minor
---

add AppShell — the frame that lets a bar span above both the sidebar and the content

`SidebarProvider` renders a single flex row, so a bar could only ever live
*inside* the content pane. That is why every shadcn example puts its `<header>`
inside `SidebarInset`, and it is why two of the shell arrangements we designed
had no code equivalent. `AppShell` is the other shape: the bar is a sibling
above the row, the way Carbon's `Header` sits above its `SideNav`.

It is layout and surfaces only — put `TopBar` in the bar slot and compose the
`Sidebar` primitives in the sidebar slot. It replaces neither.

```tsx
<AppShell variant="inset" chrome="dim">
  <AppShellBar><TopBar … /></AppShellBar>
  <AppShellBody>
    <AppShellSidebar><Nav /></AppShellSidebar>
    <AppShellCanvas>{children}</AppShellCanvas>
  </AppShellBody>
</AppShell>
```

**Three arrangements.** `flat` shares one surface and separates with a hairline.
`inset` puts the content in a rounded panel, and `chrome` then decides which
plane the frame takes:

| | light chrome | light canvas | dark chrome | dark canvas |
|---|---|---|---|---|
| `dim` | `#eeeeee` | `#ffffff` | `#0a0a0a` | `#171717` |
| `bright` | `#ffffff` | `#eeeeee` | `#171717` | `#0a0a0a` |

Both are the same two tokens — `surface-sunken` and `surface-panel` — swapped.
No third tier, no per-theme special case. The real difference is which part
carries a brand tint: with `dim` the wash lands on the frame and the work area
stays neutral; with `bright` it is the reverse.

The bar height is a **minimum**, not a fixed value, so `TopBar` still sizes to
its content. The inset canvas is flush to the bar and sidebar and floats only
off the bottom-right, and carries no shadow — it is a frame, not a floating
thing.
