'use client'

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBell,
  IconDots,
  IconFolderOpen,
  IconHome,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { SHILP_SUTRA_MINOR } from '@/lib/version'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

type Stat = { label: string; value: string; trend: 'up' | 'down'; delta: string }
const stats: Stat[] = [
  { label: 'Active projects', value: '12', trend: 'up', delta: '+2 this week' },
  { label: 'Open tasks', value: '47', trend: 'up', delta: '+8 this week' },
  { label: 'Hours logged', value: '184', trend: 'down', delta: '−12 vs last week' },
  { label: 'Client invoices', value: '8', trend: 'up', delta: '+3 this month' },
]

type Activity = { who: string; initials: string; what: string; when: string; tag?: string }
const activity: Activity[] = [
  { who: 'Goutham', initials: 'GP', what: 'pushed 4 component fixes to Padmavarna v2 audit', when: '12 min ago', tag: 'fix' },
  { who: 'Yogin', initials: 'YS', what: 'opened a PR adding Skeleton variants for charts', when: '38 min ago', tag: 'feat' },
  { who: 'Amal', initials: 'AM', what: 'reviewed Karm onboarding flow, left 6 comments', when: '1 hr ago', tag: 'review' },
  { who: 'Mudit', initials: 'ML', what: `cut v${SHILP_SUTRA_MINOR} with the BREAKING.json manifest and recipe polish`, when: '3 hr ago', tag: 'release' },
]

type NavItem = { icon: typeof IconHome; label: string; active?: boolean }
const navItems: NavItem[] = [
  { icon: IconHome, label: 'Overview', active: true },
  { icon: IconFolderOpen, label: 'Projects' },
  { icon: IconUsers, label: 'Team' },
  { icon: IconBell, label: 'Notifications' },
  { icon: IconSettings, label: 'Settings' },
]

export function DashboardBlock() {
  return (
    <div className="rounded-ds-md border border-surface-border overflow-hidden grid grid-cols-1 lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-ds-04 p-ds-05 bg-surface-sunken border-r border-surface-border-subtle min-h-[640px]">
        <div className="flex items-center gap-ds-02">
          <span className="w-7 h-7 rounded-md bg-accent-9 text-accent-fg flex items-center justify-center text-ds-sm font-bold">
            D
          </span>
          <Text variant="label-md" className="text-surface-fg">
            Devalok Studio
          </Text>
        </div>
        <nav aria-label="Main" className="flex flex-col gap-ds-01">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={[
                'flex items-center gap-ds-03 px-ds-03 py-ds-02 rounded-ds-sm text-ds-sm text-left transition-colors duration-fast-01',
                item.active
                  ? 'bg-accent-3 text-accent-11 font-medium'
                  : 'text-surface-fg-muted hover:bg-surface-panel-hover hover:text-surface-fg',
              ].join(' ')}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-ds-sm border border-surface-border-subtle bg-surface-panel p-ds-03 flex items-center gap-ds-03">
          <Avatar size="sm">
            <AvatarFallback>ML</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <Text variant="body-sm" className="text-surface-fg truncate">
              Mudit Lal
            </Text>
            <Text variant="body-xs" className="text-surface-fg-subtle truncate">
              mudit@devalok.in
            </Text>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-col bg-surface-base">
        <header className="flex items-center justify-between px-ds-06 py-ds-04 border-b border-surface-border-subtle">
          <div className="flex flex-col">
            <Text variant="label-sm" className="text-surface-fg-subtle">
              Overview
            </Text>
            <Text variant="heading-md" className="text-surface-fg">
              Good morning, Mudit.
            </Text>
          </div>
          <div className="flex items-center gap-ds-02">
            <Button variant="ghost" size="icon-md" aria-label="Notifications">
              <IconBell size={18} />
            </Button>
            <Button>New project</Button>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-ds-04 p-ds-06">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-[length:var(--typo-heading-xl-size)]">{s.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className={[
                    'inline-flex items-center gap-ds-02 text-ds-xs',
                    s.trend === 'up' ? 'text-success-11' : 'text-warning-11',
                  ].join(' ')}
                >
                  {s.trend === 'up' ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                  {s.delta}
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="px-ds-06 pb-ds-06">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-ds-01">
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Last 24 hours across all projects.</CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="More">
                <IconDots size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {activity.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-ds-03 py-ds-03 border-b border-surface-border-subtle last:border-b-0"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{a.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <Text variant="body-sm" className="text-surface-fg">
                        <span className="font-medium">{a.who}</span>{' '}
                        <span className="text-surface-fg-muted">{a.what}</span>
                      </Text>
                      <Text variant="body-xs" className="text-surface-fg-subtle">
                        {a.when}
                      </Text>
                    </div>
                    {a.tag && (
                      <Badge variant="soft" size="sm" color={a.tag === 'release' ? 'accent' : 'neutral'}>
                        {a.tag}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
