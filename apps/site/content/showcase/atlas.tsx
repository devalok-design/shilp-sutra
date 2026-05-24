'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconFolderOpen,
  IconHash,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type Project = { name: string; channel: string; tasks: number; done: number; members: string[]; isNew?: boolean }

const initialProjects: Project[] = [
  { name: 'Q3 launch plan', channel: 'launch', tasks: 24, done: 16, members: ['ML', 'GP', 'YS', 'AM'] },
  { name: 'Brand refresh', channel: 'brand-2026', tasks: 47, done: 41, members: ['ML', 'YS'] },
  { name: 'Customer pipeline', channel: 'sales', tasks: 12, done: 4, members: ['GP', 'AM'] },
  { name: 'Onboarding flows', channel: 'design', tasks: 31, done: 28, members: ['ML', 'AM', 'YS'] },
]

const team = [
  { name: 'Mudit Lal', initials: 'ML', role: 'Founder', status: 'In a meeting' },
  { name: 'Goutham Paneer', initials: 'GP', role: 'Product design', status: 'Available' },
  { name: 'Yogin Sharma', initials: 'YS', role: 'Engineering', status: 'Heads-down' },
  { name: 'Amal Krishnan', initials: 'AM', role: 'Brand design', status: 'Available' },
]

export function AtlasShowcase() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  const addProject = async () => {
    await sleep(1200)
    const names = ['Discovery sprint', 'Customer interviews', 'Pricing experiment', 'Q4 retreat']
    const channels = ['research', 'discovery', 'pricing', 'team']
    const i = projects.length % names.length
    setProjects((p) => [
      { name: names[i], channel: channels[i], tasks: 8, done: 0, members: ['ML'], isNew: true },
      ...p.map((x) => ({ ...x, isNew: false })),
    ])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-ds-05">
      {/* Main content */}
      <div className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-ds-03">
            <div className="flex flex-col gap-ds-01">
              <CardDescription>This week</CardDescription>
              <CardTitle>Welcome back, Mudit.</CardTitle>
              <Text variant="body-sm" className="text-surface-fg-muted mt-ds-02">
                Four projects active, 88 tasks moving. The team is mostly in heads-down mode today.
              </Text>
            </div>
            <Button startIcon={<IconPlus size={14} />} onClickAsync={addProject}>
              New project
            </Button>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-3 gap-ds-04">
          <StatTile label="Active projects" value="4" hint="2 launching this month" />
          <StatTile label="Tasks in motion" value="88" hint="61 done · 27 open" />
          <StatTile label="On-time delivery" value="94%" hint="rolling 30 days" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workspaces</CardTitle>
            <Badge variant="soft" color="accent">Live</Badge>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              <AnimatePresence initial={false}>
                {projects.map((p) => (
                  <motion.li
                    key={p.name}
                    layout
                    initial={p.isNew ? { opacity: 0, y: -8, height: 0 } : false}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className={[
                      'group/row flex items-center justify-between gap-ds-04 px-ds-03 -mx-ds-03 py-ds-03 rounded-ds-md border-b border-surface-border-subtle last:border-b-0',
                      'hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer',
                      p.isNew && 'bg-accent-2',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex items-center gap-ds-03 min-w-0 flex-1">
                      <span className="w-9 h-9 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
                        <IconFolderOpen size={16} />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-ds-md text-surface-fg font-semibold line-clamp-1 inline-flex items-center gap-ds-02">
                          {p.name}
                          {p.isNew && (
                            <Badge variant="soft" color="accent" size="sm">
                              new
                            </Badge>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-ds-01 text-ds-xs text-surface-fg-subtle mt-ds-01">
                          <IconHash size={10} />
                          {p.channel}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-ds-04 text-ds-xs text-surface-fg-subtle">
                      <span>
                        {p.done}/{p.tasks} done
                      </span>
                      <div className="flex -space-x-2">
                        {p.members.map((m) => (
                          <Avatar key={m} size="xs" className="border-2 border-surface-raised">
                            <AvatarFallback>{m}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover/row:opacity-100 transition-opacity duration-fast-02 ease-productive-standard"
                    >
                      Open
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Your team</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {team.map((m) => (
                <li
                  key={m.name}
                  className="group/row flex items-center gap-ds-03 px-ds-02 -mx-ds-02 py-ds-02 rounded-ds-md hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer"
                >
                  <Avatar size="sm">
                    <AvatarFallback>{m.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">{m.name}</span>
                    <span className="text-ds-xs text-surface-fg-subtle mt-ds-01 line-clamp-1">{m.status}</span>
                  </div>
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
          <CardContent className="flex flex-col gap-ds-03">
            <NextItem icon={IconUsers} title="Brand review · Mira" when="Today, 4:30 pm" />
            <NextItem icon={IconChartBar} title="Weekly metrics" when="Tomorrow, 11:00 am" />
            <NextItem icon={IconCalendar} title="Quarterly planning" when="Fri, all day" />
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-ds-06 flex flex-col">
      <span className="text-ds-xs text-surface-fg-subtle">{label}</span>
      <span className="text-ds-2xl text-surface-fg font-semibold leading-none mt-ds-02">{value}</span>
      <span className="inline-flex items-center gap-ds-02 text-ds-xs text-success-11 mt-ds-02">
        <IconCheck size={10} />
        {hint}
      </span>
    </Card>
  )
}

function NextItem({
  icon: Icon,
  title,
  when,
}: {
  icon: typeof IconUsers
  title: string
  when: string
}) {
  return (
    <div className="group/row flex items-start gap-ds-03 px-ds-02 -mx-ds-02 py-ds-02 rounded-ds-md hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer">
      <span className="w-8 h-8 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">{title}</span>
        <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">{when}</span>
      </div>
    </div>
  )
}
