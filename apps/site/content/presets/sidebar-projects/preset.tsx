'use client'

/**
 * Projects sidebar — nav built around collapsible parents with children (the
 * most common app pattern: a section that is both a link and an expandable
 * container). Two collapsible groups (Projects, Teams), per-item count badges,
 * and a group "+" action. Composed from shilp-sutra `Sidebar` primitives.
 *
 * Prerequisites: `@devalok/shilp-sutra` installed + its CSS imported
 *   @import "tailwindcss";
 *   @import "@devalok/shilp-sutra/css";
 *
 * Wiring: swap <a> for your router Link; replace CURRENT_PATH with the live path;
 * put <SidebarProvider> at your layout root. `nav` is a plain array — drive it
 * from your own data.
 */

import {
  IconChevronRight,
  IconFolder,
  IconLayoutDashboard,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'
import {
  Sidebar,
  SidebarContent,
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
import { Text } from '@devalok/shilp-sutra/ui/text'

type Child = { title: string; href: string; badge?: string | number }
type Parent = { title: string; href: string; icon: React.ReactNode; children: Child[] }

const CURRENT_PATH: string = '/projects/karm/board'
const isActive = (href: string) => CURRENT_PATH.startsWith(href)

const nav: Parent[] = [
  {
    title: 'Projects',
    href: '/projects',
    icon: <IconFolder />,
    children: [
      { title: 'Karm V2', href: '/projects/karm', badge: 12 },
      { title: 'Website Redesign', href: '/projects/site', badge: 3 },
      { title: 'Brand System', href: '/projects/brand' },
    ],
  },
  {
    title: 'Teams',
    href: '/teams',
    icon: <IconUsers />,
    children: [
      { title: 'Design', href: '/teams/design' },
      { title: 'Engineering', href: '/teams/eng' },
    ],
  },
]

export function SidebarProjects() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="border-r border-surface-border-subtle bg-surface-raised">
        <SidebarHeader className="px-ds-05 py-ds-05">
          <Text variant="label-md" className="text-surface-fg">Karm Studio</Text>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={CURRENT_PATH === '/'} tooltip="Overview">
                    <a href="/">
                      <IconLayoutDashboard />
                      <span>Overview</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupAction aria-label="New project" title="New project">
              <IconPlus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((parent) => {
                  const parentActive = isActive(parent.href)
                  return (
                    <Collapsible key={parent.href} defaultOpen={parentActive} className="group/collapsible">
                      <SidebarMenuItem>
                        <div className="relative">
                          <SidebarMenuButton asChild isActive={parentActive} tooltip={parent.title}>
                            <a href={parent.href}>
                              {parent.icon}
                              <span>{parent.title}</span>
                            </a>
                          </SidebarMenuButton>
                          <CollapsibleTrigger asChild>
                            <button
                              aria-label={`Toggle ${parent.title}`}
                              className="absolute right-ds-02 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-control text-surface-fg-subtle transition-colors hover:bg-surface-raised-hover hover:text-surface-fg"
                            >
                              <IconChevronRight className="h-4 w-4 transition-transform duration-fast-02 ease-productive-standard group-data-[state=open]/collapsible:rotate-90" />
                            </button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {parent.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton asChild isActive={CURRENT_PATH.startsWith(child.href)}>
                                  <a href={child.href}>
                                    <span className="truncate">{child.title}</span>
                                    {child.badge != null && (
                                      <span className="ml-auto text-body-sm text-surface-fg-subtle">{child.badge}</span>
                                    )}
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
