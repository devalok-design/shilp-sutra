'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconBell,
  IconCalendar,
  IconChartBar,
  IconChevronRight,
  IconCommand,
  IconFolderOpen,
  IconHash,
  IconInbox,
  IconPlus,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'

import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { AvatarGroup } from '@devalok/shilp-sutra/composed/avatar-group'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@devalok/shilp-sutra/ui/breadcrumb'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Combobox } from '@devalok/shilp-sutra/ui/combobox'
import { DataTable } from '@devalok/shilp-sutra/ui/data-table'
import { EmptyState } from '@devalok/shilp-sutra/composed/empty-state'
import { Progress } from '@devalok/shilp-sutra/ui/progress'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@devalok/shilp-sutra/ui/sheet'
import { StatusDot } from '@devalok/shilp-sutra/ui/status-dot'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@devalok/shilp-sutra/ui/tooltip'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type ProjectRow = {
  id: string
  name: string
  channel: string
  status: 'on-track' | 'at-risk' | 'shipped' | 'planning'
  progress: number
  due: string
  members: { initials: string; name: string }[]
}

const initialProjects: ProjectRow[] = [
  {
    id: 'p1',
    name: 'Q3 launch plan',
    channel: 'launch',
    status: 'on-track',
    progress: 67,
    due: 'Jun 14',
    members: [
      { initials: 'ML', name: 'Mudit Lal' },
      { initials: 'GP', name: 'Goutham Paneer' },
      { initials: 'YS', name: 'Yogin Sharma' },
      { initials: 'AM', name: 'Amal Krishnan' },
    ],
  },
  {
    id: 'p2',
    name: 'Brand refresh',
    channel: 'brand-2026',
    status: 'on-track',
    progress: 87,
    due: 'Jun 02',
    members: [
      { initials: 'ML', name: 'Mudit Lal' },
      { initials: 'AM', name: 'Amal Krishnan' },
      { initials: 'RM', name: 'Riya Menon' },
    ],
  },
  {
    id: 'p3',
    name: 'Customer pipeline',
    channel: 'sales',
    status: 'at-risk',
    progress: 33,
    due: 'May 28',
    members: [
      { initials: 'GP', name: 'Goutham Paneer' },
      { initials: 'AM', name: 'Amal Krishnan' },
    ],
  },
  {
    id: 'p4',
    name: 'Onboarding flows',
    channel: 'design',
    status: 'on-track',
    progress: 90,
    due: 'Jun 07',
    members: [
      { initials: 'ML', name: 'Mudit Lal' },
      { initials: 'AM', name: 'Amal Krishnan' },
      { initials: 'YS', name: 'Yogin Sharma' },
    ],
  },
  {
    id: 'p5',
    name: 'Pricing experiment',
    channel: 'pricing',
    status: 'planning',
    progress: 12,
    due: 'Jul 01',
    members: [
      { initials: 'ML', name: 'Mudit Lal' },
      { initials: 'GP', name: 'Goutham Paneer' },
    ],
  },
  {
    id: 'p6',
    name: 'Mobile shell rebuild',
    channel: 'eng',
    status: 'shipped',
    progress: 100,
    due: 'Apr 30',
    members: [
      { initials: 'YS', name: 'Yogin Sharma' },
      { initials: 'RM', name: 'Riya Menon' },
    ],
  },
]

const workspaces = [
  { value: 'devalok', label: 'Devalok' },
  { value: 'karm', label: 'Karm' },
  { value: 'shilp-sutra', label: 'Shilp Sutra' },
  { value: 'mira-internal', label: 'Mira internal' },
]

type Presence = 'healthy' | 'warning' | 'critical' | 'inactive'

const team: { name: string; initials: string; role: string; tz: string; presence: Presence; lastActive: string }[] = [
  { name: 'Mudit Lal', initials: 'ML', role: 'Founder', tz: 'IST', presence: 'healthy', lastActive: 'now' },
  { name: 'Goutham Paneer', initials: 'GP', role: 'Product design', tz: 'IST', presence: 'critical', lastActive: '3m ago' },
  { name: 'Yogin Sharma', initials: 'YS', role: 'Engineering', tz: 'IST', presence: 'healthy', lastActive: 'now' },
  { name: 'Amal Krishnan', initials: 'AM', role: 'Brand design', tz: 'IST', presence: 'warning', lastActive: '22m ago' },
  { name: 'Riya Menon', initials: 'RM', role: 'Content', tz: 'CET', presence: 'inactive', lastActive: '4h ago' },
]

const activity = [
  { group: 'Today', items: [
    { who: 'Goutham', initials: 'GP', text: 'moved Pricing tiers to In review', when: '11:42' },
    { who: 'Yogin', initials: 'YS', text: 'merged ds-link-button into main', when: '10:18' },
    { who: 'Mudit', initials: 'ML', text: 'shared Q3 launch plan with the team', when: '09:30' },
  ] },
  { group: 'Yesterday', items: [
    { who: 'Amal', initials: 'AM', text: 'uploaded six new brand-refresh stills', when: '17:05' },
    { who: 'Riya', initials: 'RM', text: 'closed three onboarding copy threads', when: '14:11' },
    { who: 'Goutham', initials: 'GP', text: 'opened Customer pipeline retrospective', when: '11:50' },
  ] },
]

const channels = [
  { name: 'launch', unread: 4 },
  { name: 'brand-2026', unread: 1 },
  { name: 'design', unread: 0 },
  { name: 'sales', unread: 7 },
  { name: 'eng', unread: 2 },
]

const sparkline = [12, 18, 14, 22, 19, 28, 24, 32, 29, 34, 31, 38]

const statusMeta: Record<ProjectRow['status'], { label: string; color: 'success' | 'warning' | 'info' | 'accent' }> = {
  'on-track': { label: 'On track', color: 'success' },
  'at-risk': { label: 'At risk', color: 'warning' },
  shipped: { label: 'Shipped', color: 'info' },
  planning: { label: 'Planning', color: 'accent' },
}

export function AtlasShowcase() {
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects)
  const [workspace, setWorkspace] = useState<string>('devalok')
  const [sheetOpen, setSheetOpen] = useState(false)

  const stats = useMemo(() => ({
    active: projects.filter((p) => p.status !== 'shipped').length,
    shipped: projects.filter((p) => p.status === 'shipped').length,
    onTime: 94,
    capacity: 72,
  }), [projects])

  const createProject = async () => {
    await sleep(900)
    const drafts = [
      { name: 'Discovery sprint', channel: 'research' },
      { name: 'Customer interviews', channel: 'discovery' },
      { name: 'Q4 retreat', channel: 'team' },
      { name: 'Activation push', channel: 'growth' },
    ]
    const i = projects.length % drafts.length
    const next: ProjectRow = {
      id: `p${projects.length + 1}`,
      name: drafts[i].name,
      channel: drafts[i].channel,
      status: 'planning',
      progress: 5,
      due: 'Jul 15',
      members: [{ initials: 'ML', name: 'Mudit Lal' }],
    }
    setProjects((p) => [next, ...p])
    setSheetOpen(false)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-ds-05">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Workspaces</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Devalok</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-ds-05">
          <div className="flex flex-col gap-ds-05">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-ds-04">
                <div className="flex flex-col gap-ds-02 min-w-0">
                  <CardDescription>Friday, May 24</CardDescription>
                  <CardTitle>Welcome back, Mudit.</CardTitle>
                  <Text variant="body-sm" className="text-surface-fg-muted mt-ds-01">
                    Four projects active, 88 tasks moving. The team is mostly heads-down today.
                  </Text>
                  <div className="mt-ds-03 w-full max-w-xs">
                    <Combobox
                      options={workspaces}
                      value={workspace}
                      onValueChange={(v) => setWorkspace(v ?? 'devalok')}
                      placeholder="Switch workspace"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-ds-02 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Notifications">
                        <IconBell size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Command menu">
                        <IconCommand size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Command menu (Ctrl K)</TooltipContent>
                  </Tooltip>
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button startIcon={<IconPlus size={14} />}>New project</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Start a new project</SheetTitle>
                        <SheetDescription>
                          Drop in a name and a channel. You can wire up members and milestones once it lands.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="flex flex-col gap-ds-03 py-ds-04">
                        <div className="flex flex-col gap-ds-02 rounded-ds-md border border-surface-border-subtle bg-surface-2 p-ds-04">
                          <Text variant="body-sm" className="text-surface-fg-subtle">Suggested name</Text>
                          <span className="text-ds-md font-semibold text-surface-fg">Discovery sprint</span>
                          <span className="inline-flex items-center gap-ds-01 text-ds-xs text-surface-fg-subtle">
                            <IconHash size={10} /> research
                          </span>
                        </div>
                        <Text variant="body-sm" className="text-surface-fg-muted">
                          We will copy your team defaults and notify the workspace.
                        </Text>
                      </div>
                      <SheetFooter>
                        <Button variant="soft" onClick={() => setSheetOpen(false)}>Cancel</Button>
                        <Button onClickAsync={createProject} startIcon={<IconSparkles size={14} />}>
                          Create project
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-ds-03 sm:gap-ds-04">
              <StatTile label="Active projects" value={String(stats.active)} hint={`${stats.shipped} shipped this quarter`} />
              <SparklineTile label="Tasks shipped" value="312" series={sparkline} />
              <StatTile label="On-time delivery" value={`${stats.onTime}%`} hint="rolling 30 days" trend="up" />
              <CapacityTile label="Capacity used" value={stats.capacity} />
            </div>

            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="overview">
                  <div className="px-ds-04 pt-ds-04">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="px-ds-04 pb-ds-04 pt-ds-03">
                    <DataTable
                      data={projects}
                      columns={[
                        {
                          accessorKey: 'name',
                          header: 'Project',
                          cell: ({ row }: { row: { original: ProjectRow } }) => (
                            <div className="flex items-center gap-ds-03 min-w-0">
                              <span className="w-8 h-8 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
                                <IconFolderOpen size={14} />
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-ds-sm font-semibold text-surface-fg line-clamp-1">{row.original.name}</span>
                                <span className="inline-flex items-center gap-ds-01 text-ds-xs text-surface-fg-subtle mt-ds-01">
                                  <IconHash size={10} /> {row.original.channel}
                                </span>
                              </div>
                            </div>
                          ),
                          enableSorting: true,
                        },
                        {
                          accessorKey: 'status',
                          header: 'Status',
                          cell: ({ row }: { row: { original: ProjectRow } }) => {
                            const meta = statusMeta[row.original.status]
                            return (
                              <Badge variant="soft" color={meta.color} size="sm">
                                {meta.label}
                              </Badge>
                            )
                          },
                          enableSorting: true,
                        },
                        {
                          accessorKey: 'progress',
                          header: 'Progress',
                          cell: ({ row }: { row: { original: ProjectRow } }) => (
                            <div className="flex items-center gap-ds-03 min-w-[10rem]">
                              <Progress value={row.original.progress} autoColor className="flex-1" />
                              <span className="text-ds-xs text-surface-fg-subtle tabular-nums w-9 text-right">
                                {row.original.progress}%
                              </span>
                            </div>
                          ),
                          enableSorting: true,
                        },
                        {
                          accessorKey: 'due',
                          header: 'Due',
                          cell: ({ row }: { row: { original: ProjectRow } }) => (
                            <span className="text-ds-sm text-surface-fg-muted tabular-nums">{row.original.due}</span>
                          ),
                          enableSorting: true,
                        },
                        {
                          accessorKey: 'members',
                          header: 'Team',
                          cell: ({ row }: { row: { original: ProjectRow } }) => (
                            <AvatarGroup
                              size="xs"
                              max={3}
                              users={row.original.members.map((m) => ({ name: m.name }))}
                            />
                          ),
                        },
                      ]}
                    />
                  </TabsContent>

                  <TabsContent value="activity" className="px-ds-04 pb-ds-04 pt-ds-03">
                    <ul className="flex flex-col gap-ds-04">
                      <AnimatePresence initial={false}>
                        {activity.map((group) => (
                          <motion.li
                            key={group.group}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-ds-02"
                          >
                            <span className="text-ds-xs uppercase tracking-wide text-surface-fg-subtle">
                              {group.group}
                            </span>
                            <ul className="flex flex-col">
                              {group.items.map((item) => (
                                <li
                                  key={`${group.group}-${item.when}-${item.who}`}
                                  className="flex items-start gap-ds-03 py-ds-02 border-b border-surface-border-subtle last:border-b-0"
                                >
                                  <Avatar size="xs">
                                    <AvatarFallback>{item.initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-ds-sm text-surface-fg">
                                      <span className="font-semibold">{item.who}</span>{' '}
                                      <span className="text-surface-fg-muted">{item.text}</span>
                                    </span>
                                    <span className="text-ds-xs text-surface-fg-subtle mt-ds-01 tabular-nums">{item.when}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </TabsContent>

                  <TabsContent value="members" className="px-ds-04 pb-ds-04 pt-ds-03">
                    <ul className="flex flex-col">
                      {team.map((m) => (
                        <li
                          key={m.name}
                          className="flex items-center gap-ds-03 py-ds-03 border-b border-surface-border-subtle last:border-b-0"
                        >
                          <div className="relative">
                            <Avatar size="sm">
                              <AvatarFallback>{m.initials}</AvatarFallback>
                            </Avatar>
                            <StatusDot
                              status={m.presence}
                              className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-2"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-ds-sm font-semibold text-surface-fg line-clamp-1">{m.name}</span>
                            <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">{m.role}</span>
                          </div>
                          <Badge variant="soft" color="neutral" size="sm">{m.tz}</Badge>
                          <span className="text-ds-xs text-surface-fg-subtle tabular-nums w-16 text-right">
                            {m.lastActive}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="settings" className="px-ds-04 pb-ds-04 pt-ds-03">
                    <EmptyState
                      icon={<IconSettings size={20} />}
                      title="Workspace settings live elsewhere"
                      description="Permissions, billing, and integrations sit in the workspace admin. Open it in a new tab when you need to."
                      action={<Button variant="soft" endIcon={<IconChevronRight size={14} />}>Open admin</Button>}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-ds-05">
            <Card>
              <CardHeader>
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Team presence</CardTitle>
                <CardDescription>Five people, two timezones</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col">
                  {team.map((m) => (
                    <li
                      key={m.name}
                      className="flex items-center gap-ds-03 px-ds-02 -mx-ds-02 py-ds-02 rounded-ds-md hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard"
                    >
                      <div className="relative">
                        <Avatar size="sm">
                          <AvatarFallback>{m.initials}</AvatarFallback>
                        </Avatar>
                        <StatusDot
                          status={m.presence}
                          className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-2"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-ds-sm font-semibold text-surface-fg line-clamp-1">{m.name}</span>
                        <span className="text-ds-xs text-surface-fg-subtle mt-ds-01 line-clamp-1">{m.role}</span>
                      </div>
                      <span className="text-ds-xs text-surface-fg-subtle tabular-nums">{m.tz}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Up next</CardTitle>
                <CardDescription>From your calendar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-ds-02">
                <CalendarItem icon={IconUsers} title="Brand review with Mira" when="Today, 4:30 pm" />
                <CalendarItem icon={IconChartBar} title="Weekly metrics" when="Tomorrow, 11:00 am" />
                <CalendarItem icon={IconCalendar} title="Quarterly planning" when="Fri, all day" />
                <CalendarItem icon={IconInbox} title="Inbox zero block" when="Mon, 9:00 am" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Pinned channels</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col">
                  {channels.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center gap-ds-02 px-ds-02 -mx-ds-02 py-ds-02 rounded-ds-md hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer"
                    >
                      <IconHash size={12} className="text-surface-fg-subtle" />
                      <span className="text-ds-sm text-surface-fg flex-1 line-clamp-1">{c.name}</span>
                      {c.unread > 0 && (
                        <Badge variant="soft" color="accent" size="sm">
                          {c.unread}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  )
}

function StatTile({ label, value, hint, trend }: { label: string; value: string; hint: string; trend?: 'up' | 'down' }) {
  return (
    <Card className="p-ds-04 flex flex-col">
      <span className="text-ds-xs text-surface-fg-subtle">{label}</span>
      <span className="text-ds-xl text-surface-fg font-semibold leading-none mt-ds-02 tabular-nums">{value}</span>
      <span className="inline-flex items-center gap-ds-01 text-ds-xs text-surface-fg-muted mt-ds-02">
        {trend === 'up' && <IconTrendingUp size={10} className="text-success-11" />}
        {hint}
      </span>
    </Card>
  )
}

function SparklineTile({ label, value, series }: { label: string; value: string; series: number[] }) {
  const max = Math.max(...series)
  const min = Math.min(...series)
  const range = max - min || 1
  const w = 100
  const h = 28
  const step = w / (series.length - 1)
  const points = series
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Card className="p-ds-04 flex flex-col">
      <span className="text-ds-xs text-surface-fg-subtle">{label}</span>
      <span className="text-ds-xl text-surface-fg font-semibold leading-none mt-ds-02 tabular-nums">{value}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-ds-02 w-full h-7" preserveAspectRatio="none" aria-hidden>
        <polyline
          fill="none"
          stroke="var(--accent-9)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </Card>
  )
}

function CapacityTile({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-ds-04 flex flex-col">
      <span className="text-ds-xs text-surface-fg-subtle">{label}</span>
      <span className="text-ds-xl text-surface-fg font-semibold leading-none mt-ds-02 tabular-nums">{value}%</span>
      <div className="mt-ds-03">
        <Progress value={value} autoColor />
      </div>
    </Card>
  )
}

function CalendarItem({
  icon: Icon,
  title,
  when,
}: {
  icon: typeof IconUsers
  title: string
  when: string
}) {
  return (
    <div className="flex items-start gap-ds-03 px-ds-02 -mx-ds-02 py-ds-02 rounded-ds-md hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer">
      <span className="w-8 h-8 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-ds-sm text-surface-fg font-semibold line-clamp-1">{title}</span>
        <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">{when}</span>
      </div>
    </div>
  )
}
