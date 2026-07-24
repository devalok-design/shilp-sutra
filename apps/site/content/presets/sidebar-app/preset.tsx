'use client'

/**
 * App sidebar — batteries-included navigation shell, composed from shilp-sutra's
 * `Sidebar` primitives. Copy-and-own replacement for the deprecated `AppSidebar`
 * config component: same shape (logo, grouped nav, collapsible sub-items, badges,
 * a group "+" action, user footer), but it's YOUR file — edit the markup directly.
 *
 * Prerequisites: `@devalok/shilp-sutra` installed and its CSS imported
 *   @import "tailwindcss";
 *   @import "@devalok/shilp-sutra/css";
 * (framer-motion ^12 is a required peer of the package.)
 *
 * Wiring for a real app:
 *  - Swap each <a> for your router's Link (next/link, react-router, …).
 *  - Replace CURRENT_PATH with your live path (usePathname / useLocation).
 *  - Put <SidebarProvider> at your layout root. For a full-page shell that
 *    collapses to an icon rail, use <Sidebar collapsible="icon"> and render the
 *    page body inside <SidebarInset> with a <SidebarTrigger /> in your top bar.
 */

import {
  IconChevronRight,
  IconFolder,
  IconLayoutDashboard,
  IconListCheck,
  IconMessage,
  IconPlus,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from '@devalok/shilp-sutra/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@devalok/shilp-sutra/ui/collapsible'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Text } from '@devalok/shilp-sutra/ui/text'

// In a real app this comes from the router (usePathname / useLocation).
const CURRENT_PATH = '/projects/karm'
const isActive = (href: string, exact = false) =>
  exact || href === '/' ? CURRENT_PATH === href : CURRENT_PATH.startsWith(href)

export function SidebarApp() {
  const projectsActive = CURRENT_PATH.startsWith('/projects')

  return (
    // Put SidebarProvider at your layout root. `collapsible="none"` renders a
    // persistent sidebar; switch to "icon" + <SidebarInset> for a collapsing shell.
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="border-r border-surface-border-subtle bg-surface-raised">
        <SidebarHeader className="px-ds-05 py-ds-05">
          <div className="flex items-center gap-ds-03">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-accent-9 font-semibold text-accent-contrast">
              K
            </div>
            <div className="flex flex-col leading-tight">
              <Text variant="label-md" className="text-surface-fg">Karm Studio</Text>
              <Text variant="label-sm" className="text-surface-fg-subtle">Workspace</Text>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/', true)} tooltip="Dashboard">
                    <a href="/">
                      <IconLayoutDashboard />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/tasks')} tooltip="My Tasks">
                    <a href="/tasks">
                      <IconListCheck />
                      <span>My Tasks</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>5</SidebarMenuBadge>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/messages')} tooltip="Messages">
                    <a href="/messages">
                      <IconMessage />
                      <span>Messages</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>New</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction aria-label="New project" title="New project">
              <IconPlus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen={projectsActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <div className="relative">
                      <SidebarMenuButton asChild isActive={projectsActive} tooltip="Projects">
                        <a href="/projects">
                          <IconFolder />
                          <span>Projects</span>
                        </a>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <button
                          aria-label="Toggle Projects"
                          className="absolute right-ds-02 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-control text-surface-fg-subtle transition-colors hover:bg-surface-raised-hover hover:text-surface-fg"
                        >
                          <IconChevronRight className="h-4 w-4 transition-transform duration-fast-02 ease-productive-standard group-data-[state=open]/collapsible:rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive('/projects/karm')}>
                            <a href="/projects/karm">Karm V2</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive('/projects/site')}>
                            <a href="/projects/site">Website Redesign</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/team')} tooltip="Team">
                    <a href="/team">
                      <IconUsers />
                      <span>Team</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-ds-04 py-ds-04">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Account" className="h-auto py-ds-02">
                <a href="/settings">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>ML</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-body-md">Mudit Lal</span>
                    <span className="truncate text-body-sm text-surface-fg-subtle">mudit@devalok.in</span>
                  </div>
                  <IconSettings className="ml-auto text-surface-fg-subtle" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
