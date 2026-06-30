'use client'

import { useState } from 'react'
import { IconBolt, IconLink, IconLockOpen, IconSettings, IconShieldCheck } from '@tabler/icons-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@devalok/shilp-sutra/ui/accordion'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Skeleton, SkeletonText } from '@devalok/shilp-sutra/ui/skeleton'
import { Switch } from '@devalok/shilp-sutra/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@devalok/shilp-sutra/ui/tooltip'

/**
 * Featured component demos for /components. First-principles selection:
 * each one is a primitive that shapes how a real product flows — and
 * each demo is interactive, not a screenshot.
 *
 * Different from the homepage ComponentShowcase (which leads with
 * Command Palette / Toast / Combobox / Chart). These six fill in the
 * everyday primitives: Tabs / Accordion / Avatar stack / Switch + form
 * controls / Tooltip / Skeleton loading.
 */
export function FeaturedComponents() {
  return (
    <TooltipProvider delayDuration={200}>
      <section className="mb-ds-12">
        <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-08">
          <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
            Featured · live demos
          </span>
          <h2 className="text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] tracking-[var(--typo-heading-xl-tracking)] text-surface-fg">
            Try them before you click.
          </h2>
          <p className="text-ds-md text-surface-fg-muted">
            Six primitives that shape a product&apos;s rhythm. Every one rendered live below.
            Scroll past for the full 119-component browse.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-04">
          <TabsDemo />
          <AccordionDemo />
          <AvatarStackDemo />
          <FormControlsDemo />
          <TooltipDemo />
          <SkeletonDemo />
        </div>
      </section>
    </TooltipProvider>
  )
}

/* -----------------------------------------------------------------------
 * Card shell
 * --------------------------------------------------------------------- */

function FeatureCard({
  slug,
  title,
  caption,
  children,
}: {
  slug: string
  title: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <article className="group flex flex-col gap-ds-04 p-ds-05b rounded-surface bg-surface-raised shadow-raised transition-[box-shadow,translate] duration-fast-02 ease-productive-standard hover:shadow-raised-hover hover:-translate-y-px">
      <header className="flex flex-col">
        <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">{slug}</span>
        <h3 className="text-ds-md text-surface-fg font-semibold mt-ds-01">{title}</h3>
        <p className="text-ds-sm text-surface-fg-subtle mt-ds-02">{caption}</p>
      </header>
      <div className="flex-1 rounded-control bg-surface-base border border-surface-border-subtle p-ds-04 flex items-center justify-center min-h-[180px]">
        {children}
      </div>
    </article>
  )
}

/* -----------------------------------------------------------------------
 * 1. Tabs — settings panes
 * --------------------------------------------------------------------- */

function TabsDemo() {
  return (
    <FeatureCard
      slug="Tabs"
      title="Switching panes."
      caption="Settings, profiles, dashboards. Anywhere one view holds several."
    >
      <div className="w-full">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="pt-ds-04">
            <Text variant="body-xs" className="text-surface-fg-subtle">
              Name, email, locale. The parts of you the app shows.
            </Text>
          </TabsContent>
          <TabsContent value="security" className="pt-ds-04">
            <Text variant="body-xs" className="text-surface-fg-subtle">
              Password, two-factor, active sessions, danger zone.
            </Text>
          </TabsContent>
          <TabsContent value="billing" className="pt-ds-04">
            <Text variant="body-xs" className="text-surface-fg-subtle">
              Studio plan · ₹0/mo · upgrade any time.
            </Text>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureCard>
  )
}

/* -----------------------------------------------------------------------
 * 2. Accordion — disclosure
 * --------------------------------------------------------------------- */

function AccordionDemo() {
  return (
    <FeatureCard
      slug="Accordion"
      title="Quiet by default."
      caption="FAQs, settings groups, dense docs. Disclose only what's asked for."
    >
      <div className="w-full">
        <Accordion type="single" collapsible defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>How does the brand swap work?</AccordionTrigger>
            <AccordionContent>
              <Text variant="body-xs" className="text-surface-fg-subtle">
                One CSS-var override at the root recolours every component. No re-render.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Is it free forever?</AccordionTrigger>
            <AccordionContent>
              <Text variant="body-xs" className="text-surface-fg-subtle">
                The Studio tier is. MIT licensed. Atelier adds team workflows.
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </FeatureCard>
  )
}

/* -----------------------------------------------------------------------
 * 3. Avatar stack — identity in dense lists
 * --------------------------------------------------------------------- */

function AvatarStackDemo() {
  const members = [
    { initials: 'ML', name: 'Mudit' },
    { initials: 'GP', name: 'Goutham' },
    { initials: 'YS', name: 'Yogin' },
    { initials: 'AM', name: 'Amal' },
    { initials: 'KI', name: 'Krishna' },
  ]
  return (
    <FeatureCard
      slug="Avatar"
      title="Identity, stacked."
      caption="Team rows, comment threads, attendee lists. Initials fall back when photos miss."
    >
      <div className="flex flex-col items-center gap-ds-04">
        <div className="flex -space-x-2">
          {members.map((m) => (
            <Tooltip key={m.initials}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-surface-base">
                  <AvatarFallback>{m.initials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{m.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Text variant="body-xs" className="text-surface-fg-subtle">
          Hover any avatar. Tooltip names the person.
        </Text>
      </div>
    </FeatureCard>
  )
}

/* -----------------------------------------------------------------------
 * 4. Form controls — Switch / Checkbox / Radio without the boilerplate
 * --------------------------------------------------------------------- */

function FormControlsDemo() {
  const [push, setPush] = useState(true)
  const [digest, setDigest] = useState(false)
  return (
    <FeatureCard
      slug="Switch · Form controls"
      title="Settings, instantly."
      caption="Switches, checkboxes, radios. Same data attributes, same focus rings, same dark-mode behaviour."
    >
      <div className="flex flex-col gap-ds-04 w-full max-w-[16rem]">
        <Row label="Push notifications" hint="Mobile + desktop">
          <Switch checked={push} onCheckedChange={setPush} />
        </Row>
        <Row label="Weekly digest" hint="Mondays 8am">
          <Switch checked={digest} onCheckedChange={setDigest} />
        </Row>
        <Row label="Beta features" hint="Opt-in">
          <Switch defaultChecked />
        </Row>
      </div>
    </FeatureCard>
  )
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-ds-03">
      <div className="flex flex-col min-w-0">
        <Text variant="body-sm" className="text-surface-fg font-medium">
          {label}
        </Text>
        <Text variant="body-xs" className="text-surface-fg-subtle">
          {hint}
        </Text>
      </div>
      {children}
    </div>
  )
}

/* -----------------------------------------------------------------------
 * 5. Tooltip — hover-reveal explanation
 * --------------------------------------------------------------------- */

function TooltipDemo() {
  return (
    <FeatureCard
      slug="Tooltip"
      title="Help that hides."
      caption="Sits next to icons until needed. Keyboard-accessible. Focus reveals it the same way hover does."
    >
      <div className="flex flex-col items-center gap-ds-04">
        <div className="flex items-center gap-ds-04">
          {[
            { icon: IconSettings, label: 'Settings · ⌘,' },
            { icon: IconBolt, label: 'Run command · ⌘.' },
            { icon: IconShieldCheck, label: 'Audit log' },
            { icon: IconLockOpen, label: 'Permissions' },
            { icon: IconLink, label: 'Copy link · ⌘L' },
          ].map(({ icon: Icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-control-inner bg-surface-overlay border border-surface-border-subtle text-surface-fg-muted hover:text-surface-fg hover:border-surface-border-strong transition-colors duration-fast-02 ease-productive-standard flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
                  aria-label={label}
                >
                  <Icon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Text variant="body-xs" className="text-surface-fg-subtle">
          Hover or tab through. Labels surface with their shortcuts.
        </Text>
      </div>
    </FeatureCard>
  )
}

/* -----------------------------------------------------------------------
 * 6. Skeleton — loading shimmer
 * --------------------------------------------------------------------- */

function SkeletonDemo() {
  return (
    <FeatureCard
      slug="Skeleton"
      title="Loading, not lying."
      caption="Shapes that match the eventual content. Shimmer animation tells the eye 'something is coming', not 'something is broken'."
    >
      <div className="w-full flex flex-col gap-ds-03">
        <div className="flex items-center gap-ds-03">
          <Skeleton className="w-10 h-10 rounded-pill" />
          <div className="flex flex-col gap-ds-01 flex-1">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2 w-1/3" />
          </div>
        </div>
        <SkeletonText lines={3} />
        <div className="flex items-center gap-ds-02 mt-ds-02">
          <Skeleton className="h-8 w-24 rounded-control" />
          <Skeleton className="h-8 w-16 rounded-control" />
        </div>
      </div>
    </FeatureCard>
  )
}
