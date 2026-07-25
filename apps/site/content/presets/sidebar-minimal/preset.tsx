'use client'

/**
 * Minimal icon rail — a compact, label-free sidebar where each item is an icon
 * with a tooltip. Good for tool-dense apps or a secondary rail. Composed from
 * shilp-sutra `Sidebar` primitives.
 *
 * Prerequisites: `@devalok/shilp-sutra` installed + its CSS imported
 *   @import "tailwindcss";
 *   @import "@devalok/shilp-sutra/css";
 *
 * Wiring: swap <a> for your router Link; replace CURRENT_PATH with the live path;
 * put <SidebarProvider> at your layout root. Rail width is set via the
 * `--sidebar-width` CSS var below.
 */

import {
  IconCalendar,
  IconInbox,
  IconLayoutDashboard,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import type { CSSProperties } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@devalok/shilp-sutra/ui/sidebar'

type Item = { title: string; href: string; icon: React.ReactNode }

const CURRENT_PATH = '/inbox'
const isActive = (href: string, exact = false) =>
  exact || href === '/' ? CURRENT_PATH === href : CURRENT_PATH.startsWith(href)

const items: Item[] = [
  { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard /> },
  { title: 'Inbox', href: '/inbox', icon: <IconInbox /> },
  { title: 'Calendar', href: '/calendar', icon: <IconCalendar /> },
  { title: 'Team', href: '/team', icon: <IconUsers /> },
]

export function SidebarMinimal() {
  return (
    // Narrow rail: override the sidebar width var.
    <SidebarProvider className="min-h-0" style={{ '--sidebar-width': '3.75rem' } as CSSProperties}>
      <Sidebar collapsible="none" className="border-r border-surface-border-subtle bg-surface-raised">
        <SidebarContent className="items-center pt-ds-04">
          <SidebarGroup className="w-full">
            <SidebarGroupContent>
              <SidebarMenu className="items-center gap-ds-01">
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href, item.href === '/')}
                      tooltip={item.title}
                      className="size-9 justify-center p-0"
                    >
                      <a href={item.href} aria-label={item.title}>
                        {item.icon}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="items-center pb-ds-04">
          <SidebarMenu className="items-center">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" className="size-9 justify-center p-0">
                <a href="/settings" aria-label="Settings">
                  <IconSettings />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
