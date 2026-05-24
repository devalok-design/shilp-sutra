'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconArrowUpRight,
  IconBell,
  IconCheck,
  IconDots,
  IconFileText,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type Activity = {
  who: string
  initials: string
  what: string
  when: string
  tag: 'release' | 'review' | 'fix' | 'design'
  isNew?: boolean
}

const initialActivity: Activity[] = [
  { who: 'Mudit', initials: 'ML', what: 'shipped v0.39 — Agent Skill + site v1', when: '14 min ago', tag: 'release' },
  { who: 'Goutham', initials: 'GP', what: 'pushed Button accessibility audit fixes', when: '38 min ago', tag: 'fix' },
  { who: 'Yogin', initials: 'YS', what: 'reviewed the Atlas showcase composition', when: '1 hr ago', tag: 'review' },
  { who: 'Amal', initials: 'AM', what: 'opened a PR for Skeleton variants', when: '3 hr ago', tag: 'design' },
]

const tagColor: Record<Activity['tag'], 'accent' | 'success' | 'warning' | 'neutral'> = {
  release: 'accent',
  review: 'neutral',
  fix: 'warning',
  design: 'success',
}

/**
 * Embedded live preview frame for the landing page.
 *
 * Proves shilp-sutra composes at scale without sending the visitor away.
 * Stat tiles + activity feed + one async action — every piece responds
 * live. Uses chrome's active brand (whatever's in the BrandSwitcher).
 */
export function LandingSurface() {
  const [activity, setActivity] = useState<Activity[]>(initialActivity)

  const post = async () => {
    await sleep(1100)
    setActivity((a) => [
      {
        who: 'You',
        initials: 'YY',
        what: 'just dropped a comment on the design review',
        when: 'Just now',
        tag: 'review',
        isNew: true,
      },
      ...a.map((x) => ({ ...x, isNew: false })),
    ])
  }

  return (
    <section className="mx-auto max-w-6xl px-ds-page-x py-ds-12">
      <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-06">
        <Text variant="label-md" className="text-surface-fg-subtle">
          See it run
        </Text>
        <Text variant="heading-xl" className="text-surface-fg">
          Not a screenshot. A surface.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          Every piece on this page is shilp-sutra rendering live. Click the activity button —
          watch a real onClickAsync run, watch a real entry animate in. Switch the brand from the
          header — watch the colours follow. No demo videos. No marketing stills.
        </Text>
      </header>

      <div className="rounded-ds-md border border-surface-border bg-surface-base overflow-hidden">
        <div className="flex items-center justify-between gap-ds-03 px-ds-05 py-ds-03 bg-surface-raised border-b border-surface-border-subtle">
          <div className="flex items-center gap-ds-02">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-error-9" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning-9" />
              <span className="w-2.5 h-2.5 rounded-full bg-success-9" />
            </span>
            <Text variant="label-sm" className="text-surface-fg-subtle ml-ds-02">
              shilp-sutra · live
            </Text>
          </div>
          <Badge variant="soft" color="success" size="sm">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-9 animate-pulse" />
              streaming
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-ds-05 p-ds-06 lg:p-ds-08">
          <div className="flex flex-col gap-ds-05">
            <header className="flex items-end justify-between gap-ds-03">
              <div className="flex flex-col gap-ds-01">
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  This week · Devalok studio
                </Text>
                <Text variant="heading-lg" className="text-surface-fg">
                  Good morning. Five things moved.
                </Text>
              </div>
              <Button variant="soft" size="sm" startIcon={<IconPlus size={14} />} onClickAsync={post}>
                Comment
              </Button>
            </header>

            <div className="grid grid-cols-3 gap-ds-03">
              <Stat label="Components" value="119" hint="3 added in v0.39" />
              <Stat label="Showcases live" value="6" hint="industries covered" />
              <Stat label="Tests passing" value="2,107" hint="100% on main" />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-ds-01">
                  <CardTitle className="text-[length:var(--typo-heading-sm-size)]">
                    What changed
                  </CardTitle>
                  <CardDescription>Activity from the team · last 24 hours</CardDescription>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="More">
                  <IconDots size={14} />
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {activity.map((a, i) => (
                      <motion.li
                        key={`${a.who}-${a.what}-${i}`}
                        layout
                        initial={a.isNew ? { opacity: 0, y: -6, height: 0 } : false}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className={[
                          'flex items-start gap-ds-03 px-ds-03 -mx-ds-03 py-ds-03 rounded-ds-md border-b border-surface-border-subtle last:border-b-0',
                          'hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard',
                          a.isNew && 'border-l-2 border-l-accent-9 pl-ds-03 bg-accent-2',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Avatar size="sm" className="border-2 border-surface-raised">
                          <AvatarFallback>{a.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-ds-md text-surface-fg font-semibold line-clamp-2">
                            <span>{a.who}</span>{' '}
                            <span className="text-surface-fg-muted font-normal">{a.what}</span>
                          </span>
                          <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">{a.when}</span>
                        </div>
                        <Badge variant="soft" color={tagColor[a.tag]} size="sm">
                          {a.tag}
                        </Badge>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-ds-04">
            <Card>
              <CardHeader>
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Online</CardTitle>
                <CardDescription>4 in the workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-ds-03">
                  {[
                    { name: 'Mudit Lal', initials: 'ML', status: 'reviewing PR' },
                    { name: 'Goutham', initials: 'GP', status: 'in a meeting' },
                    { name: 'Yogin', initials: 'YS', status: 'heads-down' },
                    { name: 'Amal', initials: 'AM', status: 'on Sahayak' },
                  ].map((m) => (
                    <li key={m.name} className="flex items-center gap-ds-03">
                      <span className="relative">
                        <Avatar size="sm">
                          <AvatarFallback>{m.initials}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success-9 border-2 border-surface-base" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <Text variant="body-sm" className="text-surface-fg truncate">
                          {m.name}
                        </Text>
                        <Text variant="body-xs" className="text-surface-fg-subtle truncate">
                          {m.status}
                        </Text>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Up next</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-ds-03">
                  <Tick icon={IconFileText} text="0.40 release notes" hint="Tomorrow" />
                  <Tick icon={IconUsers} text="Brand review · Mira" hint="Today 4:30" />
                  <Tick icon={IconBell} text="Onboarding sync" hint="Fri 11:00" />
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <footer className="mt-ds-05 flex items-center justify-between gap-ds-03">
        <Text variant="body-sm" className="text-surface-fg-muted">
          Built with twelve components. Recoloured by your accent. No CSS overrides.
        </Text>
        <a
          href="/showcase/atlas"
          className="inline-flex items-center gap-ds-02 text-ds-sm text-accent-11 hover:underline underline-offset-2"
        >
          See more surfaces
          <IconArrowUpRight size={14} />
        </a>
      </footer>
    </section>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-ds-01 pt-ds-04">
        <span className="text-ds-xs text-surface-fg-subtle">{label}</span>
        <span className="text-ds-2xl text-surface-fg font-semibold leading-none mt-ds-02">{value}</span>
        <span className="inline-flex items-center gap-ds-02 text-ds-xs text-success-11 mt-ds-02">
          <IconCheck size={10} />
          {hint}
        </span>
      </CardContent>
    </Card>
  )
}

function Tick({
  icon: Icon,
  text,
  hint,
}: {
  icon: typeof IconUsers
  text: string
  hint: string
}) {
  return (
    <li className="group/row flex items-start gap-ds-03 px-ds-02 -mx-ds-02 py-ds-02 rounded-ds-md hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer">
      <span className="w-8 h-8 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">{text}</span>
        <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">{hint}</span>
      </div>
    </li>
  )
}
