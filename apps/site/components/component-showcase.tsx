'use client'

import { useEffect, useState } from 'react'
import {
  IconBellRinging,
  IconBriefcase,
  IconCircleCheck,
  IconExclamationCircle,
  IconKeyboard,
  IconLink,
  IconMoon,
  IconPalette,
  IconSparkles,
  IconSun,
} from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { LineChart } from '@devalok/shilp-sutra/ui/charts'
import { Combobox } from '@devalok/shilp-sutra/ui/combobox'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { toast } from '@devalok/shilp-sutra/ui/toast'
import { Toaster } from '@devalok/shilp-sutra/ui/toaster'
import { CommandPalette } from '@devalok/shilp-sutra/composed/command-palette'

/**
 * "Same care, every component" — five hand-picked components on the
 * landing, each in a real-use-case demo. Picked first-principles, not
 * by alphabet: every demo answers a specific "what does this component
 * unlock for a real product" question.
 *
 * - Command Palette: power-user shortcut, the keyboard moment
 * - Combobox: search-as-the-interface
 * - Toast: how the system answers back
 * - Chart: numbers that move
 * - Avatar stack: identity in dense lists
 */
export function ComponentShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-ds-page-x py-ds-12">
      <Toaster />

      <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-09">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Beyond Button
        </Text>
        <Text variant="heading-xl" className="text-surface-fg">
          Same care, every component.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          Five favourites from the 118 others. Each one picked because it changes the shape of
          what a real product can do, not because it ticks a box.
        </Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-ds-05">
        <CommandPaletteDemo />
        <ToastDemo />
        <ComboboxDemo />
        <ChartDemo />
      </div>
    </section>
  )
}

/* -----------------------------------------------------------------------
 * Card primitive — shared shell for component demos
 * --------------------------------------------------------------------- */

function DemoCard({
  eyebrow,
  title,
  caption,
  children,
}: {
  eyebrow: string
  title: string
  caption: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="flex flex-col gap-ds-05 p-ds-06 rounded-ds-lg border border-transparent bg-surface-raised shadow-raised">
      <header className="flex flex-col">
        <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">{eyebrow}</span>
        <h3 className="text-ds-md text-surface-fg font-semibold mt-ds-01">{title}</h3>
        <p className="text-ds-sm text-surface-fg-subtle mt-ds-02">{caption}</p>
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </article>
  )
}

/* -----------------------------------------------------------------------
 * 1. Command Palette — keyboard shortcut, ⌘K
 * --------------------------------------------------------------------- */

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const commands = [
    {
      label: 'Pages',
      items: [
        { id: 'p-comp', label: 'Go to components', icon: <IconBriefcase size={14} />, onSelect: () => (window.location.href = '/components') },
        { id: 'p-blocks', label: 'Go to blocks', icon: <IconBriefcase size={14} />, onSelect: () => (window.location.href = '/blocks') },
        { id: 'p-theme', label: 'Open theming editor', icon: <IconPalette size={14} />, onSelect: () => (window.location.href = '/theming') },
      ],
    },
    {
      label: 'Brand',
      items: [
        { id: 'b-mira', label: 'Switch to Mira (saffron)', icon: <IconSparkles size={14} />, onSelect: () => (window.location.href = '/theming?hue=55&chroma=0.18') },
        { id: 'b-atlas', label: 'Switch to Atlas (indigo)', icon: <IconSparkles size={14} />, onSelect: () => (window.location.href = '/theming?hue=245&chroma=0.19') },
      ],
    },
    {
      label: 'Theme',
      items: [
        { id: 't-light', label: 'Light mode', icon: <IconSun size={14} />, onSelect: () => document.documentElement.classList.remove('dark') },
        { id: 't-dark', label: 'Dark mode', icon: <IconMoon size={14} />, onSelect: () => document.documentElement.classList.add('dark') },
      ],
    },
  ]

  return (
    <DemoCard
      eyebrow="Command Palette"
      title="Press ⌘K from anywhere."
      caption="Power-user shortcut your team will type into muscle memory. Keyboard-first, search-driven, focus-trapped."
    >
      <div className="flex flex-col gap-ds-04 items-start">
        <Button
          startIcon={<IconKeyboard size={14} />}
          endIcon={
            <span className="inline-flex items-center gap-1 text-ds-xs font-mono px-1.5 py-0.5 rounded-ds-sm border border-surface-border-subtle">
              ⌘K
            </span>
          }
          onClick={() => setOpen(true)}
        >
          Open palette
        </Button>
        <div className="text-ds-xs text-surface-fg-subtle">
          Try the shortcut — works from anywhere on this page.
        </div>
      </div>

      <CommandPalette open={open} onOpenChange={setOpen} placeholder="Type to filter…" groups={commands} />
    </DemoCard>
  )
}

/* -----------------------------------------------------------------------
 * 2. Toast — system feedback
 * --------------------------------------------------------------------- */

function ToastDemo() {
  return (
    <DemoCard
      eyebrow="Toast"
      title="The system answers back."
      caption="Success. Warning. Error. They stack, they breathe, they dismiss when you're done. Fire a few — watch them queue."
    >
      <div className="flex flex-wrap items-center gap-ds-02">
        <Button
          variant="soft"
          color="success"
          size="sm"
          startIcon={<IconCircleCheck size={14} />}
          onClick={() => toast.success('Saved to drafts', { description: 'Two minutes ago' })}
        >
          Fire success
        </Button>
        <Button
          variant="soft"
          color="warning"
          size="sm"
          startIcon={<IconBellRinging size={14} />}
          onClick={() =>
            toast.warning('Unsaved changes', {
              description: 'Hit ⌘S before you close.',
              action: { label: 'Save', onClick: () => toast.success('Saved.') },
            })
          }
        >
          Fire warning
        </Button>
        <Button
          variant="soft"
          color="error"
          size="sm"
          startIcon={<IconExclamationCircle size={14} />}
          onClick={() => toast.error('Upload failed', { description: 'File exceeded 25MB limit.' })}
        >
          Fire error
        </Button>
      </div>
      <div className="mt-auto pt-ds-04 text-ds-xs text-surface-fg-subtle">
        Built on sonner. role=&quot;alert&quot; for assertive errors, role=&quot;status&quot; for the rest.
      </div>
    </DemoCard>
  )
}

/* -----------------------------------------------------------------------
 * 3. Combobox — search-as-you-type
 * --------------------------------------------------------------------- */

function ComboboxDemo() {
  const [selected, setSelected] = useState<string | undefined>('ayesha')

  const options = [
    { value: 'ayesha', label: 'Ayesha Mehra', description: 'Bengaluru · Atelier plan', icon: <IconLink size={14} /> },
    { value: 'karan', label: 'Karan Singh', description: 'Delhi · Studio plan' },
    { value: 'priya', label: 'Priya Iyer', description: 'Chennai · Bespoke' },
    { value: 'arjun', label: 'Arjun Bose', description: 'Kolkata · Studio plan' },
    { value: 'meera', label: 'Meera Nair', description: 'Kochi · Atelier plan' },
    { value: 'rohan', label: 'Rohan Suri', description: 'Mumbai · Bespoke' },
    { value: 'sneha', label: 'Sneha Joshi', description: 'Pune · Studio plan' },
    { value: 'aditya', label: 'Aditya Rao', description: 'Hyderabad · Atelier plan' },
    { value: 'kavya', label: 'Kavya Reddy', description: 'Bengaluru · Studio plan' },
    { value: 'vikram', label: 'Vikram Shah', description: 'Ahmedabad · Bespoke' },
  ]

  return (
    <DemoCard
      eyebrow="Combobox"
      title="Search becomes the interface."
      caption="Filter as you type. Keyboard-navigable. Built on Radix Popover + a focus-trapped command list. Plays well with virtualization for big lists."
    >
      <div className="flex flex-col gap-ds-03 items-start w-full max-w-sm">
        <Combobox
          options={options}
          value={selected ?? ''}
          onValueChange={(v) => setSelected(v)}
          placeholder="Search customers…"
          searchPlaceholder="Type a name or city…"
          emptyMessage="No customers match."
          triggerClassName="w-full"
        />
        <div className="text-ds-xs text-surface-fg-subtle">
          Try typing &quot;ko&quot; or &quot;bes&quot; — results filter live.
        </div>
      </div>
    </DemoCard>
  )
}

/* -----------------------------------------------------------------------
 * 4. Chart — data that moves
 * --------------------------------------------------------------------- */

const chartData = [
  { day: 'Mon', value: 4200 },
  { day: 'Tue', value: 4850 },
  { day: 'Wed', value: 5100 },
  { day: 'Thu', value: 4920 },
  { day: 'Fri', value: 5640 },
  { day: 'Sat', value: 6180 },
  { day: 'Sun', value: 6740 },
]

function ChartDemo() {
  return (
    <DemoCard
      eyebrow="Charts"
      title="Numbers that move."
      caption="Built on d3-scale + framer-motion. Animate-in on mount, hover for tooltip, keyboard-accessible focus rings on data points."
    >
      <div className="flex items-baseline justify-between gap-ds-03 mb-ds-04">
        <div className="flex flex-col">
          <span className="text-ds-xs text-surface-fg-subtle">Active users · last 7 days</span>
          <span className="text-ds-2xl font-semibold text-surface-fg leading-none mt-ds-02">6,740</span>
        </div>
        <Badge variant="soft" color="success" size="sm">
          +18% w/w
        </Badge>
      </div>
      <div className="-mx-ds-03 h-[180px]">
        <LineChart
          data={chartData}
          xKey="day"
          series={[{ key: 'value', label: 'Users', color: 'var(--color-accent-9)' }]}
          showGrid
          showTooltip
          curved
          height={180}
          ariaLabel="Active users over the last seven days"
        />
      </div>
    </DemoCard>
  )
}
