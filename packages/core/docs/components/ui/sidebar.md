# Sidebar

- Import: @devalok/shilp-sutra/ui/sidebar
- Server-safe: No
- Category: ui

## Props
### SidebarMenuButton
    variant: "default" | "outline"
    size: "sm" | "md" | "lg"
    isActive: boolean (highlights as current nav item)
    tooltip: ReactNode | string (shown when sidebar is collapsed)
    asChild: boolean (render as Slot — common with next/link)

## Compound Components
    SidebarProvider (context provider — must wrap everything)
      Sidebar (root panel)
        SidebarHeader
        SidebarContent
          SidebarGroup
            SidebarGroupLabel
            SidebarGroupAction
            SidebarGroupContent
              SidebarMenu
                SidebarMenuItem
                  SidebarMenuButton (tooltip, isActive)
                  SidebarMenuAction
                  SidebarMenuBadge
                  SidebarMenuSub
                    SidebarMenuSubItem
                      SidebarMenuSubButton (isActive)
        SidebarFooter
        SidebarSeparator
        SidebarRail
      SidebarInset (main content area)
      SidebarTrigger (hamburger button)
      SidebarInput (search input in sidebar)
      SidebarMenuSkeleton (loading placeholder)

## Hook
    useSidebar() => { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }

## Defaults
    SidebarMenuButton variant="default", size="md"

## Example
```jsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader>Logo</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <IconHome /> Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    <main>Page content</main>
  </SidebarInset>
</SidebarProvider>
```

## Composability
The whole Sidebar ecosystem is driven by `SidebarContext` — the Provider owns the expand/collapse state and every descendant reads from it.

**Who reads the context:**
- `Sidebar` — applies collapsed / expanded / off-canvas styles based on `state`
- `SidebarTrigger` — calls `toggleSidebar()` on click; reflects aria-expanded
- `SidebarMenuButton` — uses `state === 'collapsed'` to show its `tooltip` (hidden label appears only when sidebar is icon-width)
- `SidebarInset` — main content area adjusts its left offset based on sidebar width + state
- `SidebarRail` — invisible hit target on the outer edge for click-to-toggle
- Any user component that calls `useSidebar()` — full access to open/isMobile/toggle

**Desktop vs mobile:** Context tracks `isMobile` via the `use-mobile` hook and branches behavior: on desktop the sidebar collapses to an icon rail; on mobile it becomes an off-canvas drawer controlled by `openMobile`.

**Controlled or uncontrolled:** `SidebarProvider` accepts `open` + `onOpenChange` (controlled) or `defaultOpen` (uncontrolled). State is synced to a cookie for cross-route persistence.

**Next.js / router integration:** `SidebarMenuButton` with `asChild` wraps any link element (`next/link`, `react-router Link`, plain `<a>`) — it transfers its styling + isActive state to the child while preserving the link's navigation semantics.

## Gotchas
- SidebarProvider MUST wrap both Sidebar and SidebarInset
- Use SidebarMenuButton for nav items (supports tooltip in collapsed state)
- `tooltip` is only visible when sidebar is collapsed — providing one doesn't duplicate the visible label
- Cookie-based state persistence means the sidebar defaults to its prior state on page reload — use `defaultOpen` to override if needed

## Changes
### v0.18.0
- **Fixed** `bg-interactive-subtle` changed to `bg-accent-2` (OKLCH migration)
- **Added** `SidebarProps` type export

### v0.1.0
- **Added** Initial release
