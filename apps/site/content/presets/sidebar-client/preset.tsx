'use client'

/**
 * Client-portal sidebar — a leaner, flat navigation for a customer-facing
 * portal (no nested sections): dashboard, deliverables, invoices, messages,
 * support, plus a footer help card. Composed from shilp-sutra `Sidebar` primitives.
 *
 * Prerequisites: `@devalok/shilp-sutra` installed + its CSS imported
 *   @import "tailwindcss";
 *   @import "@devalok/shilp-sutra/css";
 *
 * Wiring: swap <a> for your router Link; replace CURRENT_PATH with the live path;
 * put <SidebarProvider> at your layout root.
 */

import {
  IconFileInvoice,
  IconLayoutDashboard,
  IconLifebuoy,
  IconMessage,
  IconPackage,
} from '@tabler/icons-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@devalok/shilp-sutra/ui/sidebar'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

type Item = { title: string; href: string; icon: React.ReactNode; badge?: string | number }

const CURRENT_PATH = '/deliverables'
const isActive = (href: string, exact = false) =>
  exact || href === '/' ? CURRENT_PATH === href : CURRENT_PATH.startsWith(href)

const items: Item[] = [
  { title: 'Dashboard', href: '/', icon: <IconLayoutDashboard /> },
  { title: 'Deliverables', href: '/deliverables', icon: <IconPackage />, badge: 2 },
  { title: 'Invoices', href: '/invoices', icon: <IconFileInvoice /> },
  { title: 'Messages', href: '/messages', icon: <IconMessage />, badge: 'New' },
  { title: 'Support', href: '/support', icon: <IconLifebuoy /> },
]

export function SidebarClient() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="border-r border-surface-border-subtle bg-surface-panel">
        <SidebarHeader className="px-ds-05 py-ds-05">
          <div className="flex flex-col leading-tight">
            <Text variant="label-md" className="text-surface-fg">Acme Co.</Text>
            <Text variant="label-sm" className="text-surface-fg-subtle">Client portal</Text>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href, item.href === '/')} tooltip={item.title}>
                      <a href={item.href}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.badge != null && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-ds-04 py-ds-04">
          <div className="flex flex-col gap-ds-02 rounded-control border border-surface-border-subtle bg-surface-base p-ds-04">
            <Text variant="label-sm" className="text-surface-fg">Need a hand?</Text>
            <Text variant="body-sm" className="text-surface-fg-muted">Your project lead replies within a day.</Text>
            <Button size="sm" variant="soft" className="mt-ds-01 w-full">Contact us</Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
