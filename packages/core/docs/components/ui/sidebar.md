# Sidebar

- Import: @devalok/shilp-sutra/ui/sidebar
- Server-safe: No
- Category: ui

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

## Gotchas
- SidebarProvider MUST wrap both Sidebar and SidebarInset
- Use SidebarMenuButton for nav items (supports tooltip in collapsed state)

## Changes
### v0.18.0
- **Fixed** `bg-interactive-subtle` changed to `bg-accent-2` (OKLCH migration)
- **Added** `SidebarProps` type export

### v0.1.0
- **Added** Initial release
