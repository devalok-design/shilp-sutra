import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  IconCalendar,
  IconChecklist,
  IconFolder,
  IconLayoutDashboard,
  IconUsers,
} from '@tabler/icons-react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Icon } from '../ui/icon'
import {
  AppShell,
  AppShellBar,
  AppShellBody,
  AppShellCanvas,
  AppShellSidebar,
} from './app-shell'

const meta = {
  title: 'Shell/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The frame that lets a bar span above BOTH the sidebar and the content. ' +
          'SidebarProvider renders a single flex row, so a bar can otherwise only live ' +
          'inside the content pane. Compose TopBar and the Sidebar primitives into the slots.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

const NAV = [
  { label: 'Overview', icon: IconLayoutDashboard },
  { label: 'Projects', icon: IconFolder, active: true },
  { label: 'Tasks', icon: IconChecklist },
  { label: 'Calendar', icon: IconCalendar },
  { label: 'Team', icon: IconUsers },
]

function Bar() {
  return (
    <div className="flex w-full items-center gap-ds-03 px-ds-05">
      <div className="flex size-ds-xs items-center justify-center rounded-control bg-accent-9 text-body-xs font-semibold text-accent-fg">
        D
      </div>
      <span className="text-body-sm font-semibold text-surface-fg">Devalok Studio</span>
      <div className="flex-1" />
      <Button size="sm" variant="soft">
        Invite
      </Button>
      <Button size="sm">New task</Button>
    </div>
  )
}

function Nav() {
  return (
    <nav className="flex flex-col gap-ds-01 p-ds-03">
      {NAV.map(({ label, icon, active }) => (
        <a
          key={label}
          href="#"
          onClick={(e) => e.preventDefault()}
          className={[
            'flex items-center gap-ds-03 rounded-control px-ds-03 py-ds-02 text-body-sm',
            active
              ? 'bg-surface-panel-hover font-semibold text-surface-fg'
              : 'text-surface-fg-muted hover:bg-surface-panel-hover',
          ].join(' ')}
        >
          <Icon icon={icon} size="sm" />
          {label}
        </a>
      ))}
    </nav>
  )
}

function Content() {
  return (
    <div className="flex flex-col gap-ds-05 p-ds-06">
      <div className="flex items-center gap-ds-03">
        <h1 className="text-heading-sm font-semibold text-surface-fg">Waybill redesign</h1>
        <Badge color="warning" variant="subtle">
          In review
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-ds-04">
        {[
          ['Open tasks', '24'],
          ['In review', '7'],
          ['Shipped', '13'],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-body-sm text-surface-fg-muted">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-heading-sm font-semibold text-surface-fg">{value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {['Homepage hero direction', 'Brand guidelines v3', 'Waybill icon set'].map((t) => (
            <div
              key={t}
              className="border-b border-surface-border-subtle py-ds-03 text-body-sm text-surface-fg last:border-b-0"
            >
              {t}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Demo({ variant, chrome }: { variant?: 'flat' | 'inset'; chrome?: 'dim' | 'bright' }) {
  return (
    <AppShell variant={variant} chrome={chrome} className="min-h-[640px]">
      <AppShellBar>
        <Bar />
      </AppShellBar>
      <AppShellBody>
        <AppShellSidebar>
          <Nav />
        </AppShellSidebar>
        <AppShellCanvas className="overflow-auto">
          <Content />
        </AppShellCanvas>
      </AppShellBody>
    </AppShell>
  )
}

/**
 * Chrome and content share one surface. A hairline on the sidebar and under the
 * bar does all the separating. Widest content area of the three.
 */
export const Flat: Story = {
  args: {},
  render: () => <Demo variant="flat" />,
}

/**
 * The frame recedes and the work is the brightest thing on screen. With a brand
 * tint applied, the wash lands on the chrome and the canvas stays neutral —
 * useful when the content is imagery or charts that need a true surface.
 */
export const InsetDimChrome: Story = {
  args: {},
  render: () => <Demo variant="inset" chrome="dim" />,
}

/**
 * The reverse: the frame holds the light and the canvas sinks below it. Cards
 * genuinely lift off the canvas here, in both themes. Same two tokens as
 * `dim`, swapped — not a third tier.
 */
export const InsetBrightChrome: Story = {
  args: {},
  render: () => <Demo variant="inset" chrome="bright" />,
}

/**
 * The collapsed rail, at the same 3rem `Sidebar` uses for `collapsible="icon"`.
 */
export const CollapsedRail: Story = {
  args: {},
  render: () => (
    <AppShell variant="flat" className="min-h-[480px]">
      <AppShellBar>
        <Bar />
      </AppShellBar>
      <AppShellBody>
        <AppShellSidebar collapsed>
          <nav className="flex flex-col items-center gap-ds-02 py-ds-03">
            {NAV.map(({ label, icon, active }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className={[
                  'flex size-ds-sm items-center justify-center rounded-control',
                  active ? 'bg-surface-panel-hover text-surface-fg' : 'text-surface-fg-muted',
                ].join(' ')}
              >
                <Icon icon={icon} size="sm" />
              </a>
            ))}
          </nav>
        </AppShellSidebar>
        <AppShellCanvas className="overflow-auto">
          <Content />
        </AppShellCanvas>
      </AppShellBody>
    </AppShell>
  ),
}

/**
 * No bar at all. The account and workspace switcher move into the sidebar,
 * which is a different product decision rather than a styling one — it decides
 * whether the shell needs a bar in the first place.
 */
export const NoBar: Story = {
  args: {},
  render: () => (
    <AppShell variant="flat" className="min-h-[480px]">
      <AppShellBody>
        <AppShellSidebar>
          <div className="flex items-center gap-ds-03 p-ds-04">
            <div className="flex size-ds-xs items-center justify-center rounded-control bg-accent-9 text-body-xs font-semibold text-accent-fg">
              D
            </div>
            <span className="text-body-sm font-semibold text-surface-fg">Devalok Studio</span>
          </div>
          <Nav />
        </AppShellSidebar>
        <AppShellCanvas className="overflow-auto">
          <Content />
        </AppShellCanvas>
      </AppShellBody>
    </AppShell>
  ),
}
