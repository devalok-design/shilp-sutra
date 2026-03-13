import type { Meta, StoryObj } from '@storybook/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from './sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'UI/Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof Sidebar>

const navItems = [
  { label: 'Dashboard', emoji: 'D' },
  { label: 'Projects', emoji: 'P' },
  { label: 'Tasks', emoji: 'T' },
  { label: 'Team', emoji: 'U' },
  { label: 'Calendar', emoji: 'C' },
]

const settingsItems = [
  { label: 'General', emoji: 'G' },
  { label: 'Permissions', emoji: 'S' },
  { label: 'Integrations', emoji: 'I' },
]

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-ds-04">
          <h2 className="text-ds-lg font-semibold">Karm</h2>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton>
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton>
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-ds-04">
          <p className="text-ds-xs text-surface-fg-muted">Karm v2.0</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-ds-02 p-ds-04 border-b border-surface-border">
          <SidebarTrigger />
          <h1 className="text-ds-sm font-medium">Dashboard</h1>
        </header>
        <div className="p-ds-06">
          <p className="text-ds-sm text-surface-fg-muted">
            Main content area. Toggle the sidebar with the button or Ctrl+B.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const WithActiveItem: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-ds-04">
          <h2 className="text-ds-lg font-semibold">Karm</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item, i) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={i === 1}>
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-ds-02 p-ds-04 border-b border-surface-border">
          <SidebarTrigger />
          <h1 className="text-ds-sm font-medium">Projects</h1>
        </header>
        <div className="p-ds-06">
          <p className="text-ds-sm text-surface-fg-muted">
            "Projects" is the active navigation item.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const CollapsedByDefault: Story = {
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-ds-04">
          <h2 className="text-ds-lg font-semibold">K</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton tooltip={item.label}>
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-ds-02 p-ds-04 border-b border-surface-border">
          <SidebarTrigger />
          <h1 className="text-ds-sm font-medium">Dashboard</h1>
        </header>
        <div className="p-ds-06">
          <p className="text-ds-sm text-surface-fg-muted">
            Sidebar starts collapsed. Hover over icons to see tooltips.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}
