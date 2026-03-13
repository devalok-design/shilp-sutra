'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '../ui/lib/motion'

// Components that use FM
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Toggle } from '../ui/toggle'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../ui/accordion'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Alert } from '../ui/alert'
import { Spinner } from '../ui/spinner'

// Motion primitives
import {
  MotionFade,
  MotionPop,
  MotionSlide,
  MotionCollapse,
  MotionStagger,
  MotionStaggerItem,
} from './primitives'

import { IconBold, IconItalic, IconStrikethrough, IconCheck } from '@tabler/icons-react'

// ── Meta ──

const meta: Meta = {
  title: 'Foundations/Motion Showcase',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}
export default meta

type Story = StoryObj

// ── Section wrapper ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-04">
      <h3 className="text-ds-lg font-semibold text-surface-fg border-b border-surface-border pb-ds-02">{title}</h3>
      {children}
    </div>
  )
}

// ── 1. Button Press & Gestures ──

function ButtonGesturesDemo() {
  return (
    <Section title="Button Press — whileTap spring">
      <p className="text-ds-sm text-surface-fg-muted">
        Every Button uses <code>motion.button</code> with <code>whileTap: scale 0.97</code>.
        Click and hold to feel the spring response.
      </p>
      <div className="flex flex-wrap gap-ds-03">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </Section>
  )
}

// ── 2. Interactive Card ──

function InteractiveCardDemo() {
  return (
    <Section title="Interactive Card — whileHover + whileTap springs">
      <p className="text-ds-sm text-surface-fg-muted">
        Cards with <code>interactive</code> variant lift on hover and compress on tap.
      </p>
      <div className="grid grid-cols-3 gap-ds-04" style={{ maxWidth: 600 }}>
        {['Analytics', 'Reports', 'Settings'].map((title) => (
          <Card key={title} interactive>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ds-sm text-surface-fg-muted">Hover me, click me.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}

// ── 3. Checkbox + Switch ──

function ToggleControlsDemo() {
  const [checked, setChecked] = React.useState(false)
  const [switchOn, setSwitchOn] = React.useState(false)

  return (
    <Section title="Checkbox & Switch — AnimatePresence + spring physics">
      <p className="text-ds-sm text-surface-fg-muted">
        Checkbox indicator uses <code>springs.bouncy</code> for pop-in.
        Switch thumb animates x-position with <code>springs.snappy</code>.
      </p>
      <div className="flex items-center gap-ds-06">
        <label className="flex items-center gap-ds-03 text-ds-sm text-surface-fg cursor-pointer">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
          Bouncy checkbox
        </label>
        <label className="flex items-center gap-ds-03 text-ds-sm text-surface-fg cursor-pointer">
          <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
          Snappy switch
        </label>
      </div>
    </Section>
  )
}

// ── 4. Toggle Toolbar ──

function ToggleToolbarDemo() {
  return (
    <Section title="Toggle — motion.create() wrapping Radix primitive">
      <p className="text-ds-sm text-surface-fg-muted">
        Toggle buttons use <code>motion.create(TogglePrimitive.Root)</code> for whileTap press animation.
      </p>
      <div className="flex gap-ds-02">
        <Toggle aria-label="Bold"><IconBold className="h-ico-sm w-ico-sm" /></Toggle>
        <Toggle aria-label="Italic"><IconItalic className="h-ico-sm w-ico-sm" /></Toggle>
        <Toggle aria-label="Strikethrough"><IconStrikethrough className="h-ico-sm w-ico-sm" /></Toggle>
      </div>
    </Section>
  )
}

// ── 5. Accordion with height animation ──

function AccordionDemo() {
  return (
    <Section title="Accordion — Radix height CSS + FM content fade">
      <p className="text-ds-sm text-surface-fg-muted">
        Height animation uses Radix CSS variables. Inner content fades with <code>tweens.fade</code>.
      </p>
      <div style={{ maxWidth: 500 }}>
        <Accordion type="single" defaultValue="item-1" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>What powers the animations?</AccordionTrigger>
            <AccordionContent>
              Framer Motion v12 with physics-based spring presets. Every animation in
              the design system has been migrated from CSS keyframes to FM springs and tweens.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does reduced motion work?</AccordionTrigger>
            <AccordionContent>
              Wrap your app in <code>&lt;MotionProvider reducedMotion=&quot;user&quot;&gt;</code>.
              FM automatically respects the OS <code>prefers-reduced-motion</code> setting.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I customize spring physics?</AccordionTrigger>
            <AccordionContent>
              Yes — import <code>springs</code> from <code>@devalok/shilp-sutra/motion</code> and
              pass any preset (snappy, smooth, bouncy, gentle) to your motion components.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Section>
  )
}

// ── 6. Dialog overlay animation ──

function DialogDemo() {
  return (
    <Section title="Dialog — forceMount + AnimatePresence overlay">
      <p className="text-ds-sm text-surface-fg-muted">
        Dialog uses <code>forceMount</code> on overlay and content with <code>AnimatePresence</code>
        for real exit animations — smooth scale + fade with <code>springs.smooth</code>.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motion-powered Dialog</DialogTitle>
            <DialogDescription>
              This dialog fades and scales in/out using Framer Motion springs.
              The overlay backdrop-blur also animates opacity.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-ds-03 pt-ds-04">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Confirm</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  )
}

// ── 7. Alert dismiss ──

function AlertDismissDemo() {
  const [show, setShow] = React.useState(true)
  return (
    <Section title="Alert dismiss — AnimatePresence exit animation">
      <p className="text-ds-sm text-surface-fg-muted">
        Dismissing an Alert triggers <code>exit: opacity 0, y -8</code> with spring physics.
      </p>
      {!show && (
        <Button size="sm" variant="outline" onClick={() => setShow(true)}>Reset</Button>
      )}
      {show && (
        <Alert
          variant="filled"
          color="info"
          title="FM-powered dismiss"
          onDismiss={() => setShow(false)}
        >
          Click the X to see the exit animation.
        </Alert>
      )}
    </Section>
  )
}

// ── 8. Stagger list ──

function StaggerListDemo() {
  const [key, setKey] = React.useState(0)
  const items = [
    'Design tokens',
    'Spring presets',
    'Motion primitives',
    'Component migrations',
    'Storybook showcase',
  ]

  return (
    <Section title="Stagger — orchestrated entrance">
      <p className="text-ds-sm text-surface-fg-muted">
        <code>MotionStagger</code> uses <code>staggerChildren</code> variants for cascading entrance.
      </p>
      <Button size="sm" variant="outline" onClick={() => setKey((k) => k + 1)}>Replay</Button>
      <MotionStagger key={key} className="flex flex-col gap-ds-02" style={{ maxWidth: 300 }}>
        {items.map((item, i) => (
          <MotionStaggerItem key={i}>
            <div className="flex items-center gap-ds-03 rounded-ds-md bg-surface-2 p-ds-03">
              <IconCheck className="h-ico-sm w-ico-sm text-success" />
              <span className="text-ds-sm text-surface-fg">{item}</span>
            </div>
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </Section>
  )
}

// ── 9. Badge pulse ──

function BadgePulseDemo() {
  return (
    <Section title="Badge — FM pulse-ring animation">
      <p className="text-ds-sm text-surface-fg-muted">
        Badge with <code>dot</code> prop uses <code>motion.span</code> for an infinite pulse-ring effect.
      </p>
      <div className="flex gap-ds-03">
        <Badge dot color="success">Online</Badge>
        <Badge dot color="error">Recording</Badge>
        <Badge dot color="warning">Away</Badge>
      </div>
    </Section>
  )
}

// ── 10. Spring Physics Playground ──

function SpringPlaygroundDemo() {
  const [active, setActive] = React.useState<string | null>(null)

  return (
    <Section title="Spring Physics — feel the difference">
      <p className="text-ds-sm text-surface-fg-muted">
        Click a preset to see its spring characteristics. Each box animates from scale 0 → 1.
      </p>
      <div className="grid grid-cols-4 gap-ds-04" style={{ maxWidth: 500 }}>
        {(Object.entries(springs) as [string, object][]).map(([name, config]) => (
          <button
            key={name}
            type="button"
            onClick={() => setActive((a) => a === name ? null : name)}
            className="flex flex-col items-center gap-ds-03"
          >
            <span className="text-ds-xs font-semibold text-surface-fg-muted">{name}</span>
            <AnimatePresence mode="wait">
              {active === name && (
                <motion.div
                  key={name}
                  initial={{ scale: 0, borderRadius: 8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={config}
                  className="h-16 w-16 rounded-ds-md bg-accent-9"
                />
              )}
            </AnimatePresence>
            {active !== name && (
              <div className="h-16 w-16 rounded-ds-md border-2 border-dashed border-surface-border" />
            )}
          </button>
        ))}
      </div>
    </Section>
  )
}

// ── 11. Spinner (FM-powered) ──

function SpinnerDemo() {
  return (
    <Section title="Spinner — Framer Motion arc rotation">
      <p className="text-ds-sm text-surface-fg-muted">
        The v2 Spinner uses FM for smooth arc rotation with state transitions.
      </p>
      <div className="flex items-center gap-ds-05">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </div>
    </Section>
  )
}

// ══════════════════════════════════════════
// Full Showcase
// ══════════════════════════════════════════

function FullShowcase() {
  return (
    <div className="flex flex-col gap-ds-08 p-ds-06" style={{ maxWidth: 800 }}>
      <div>
        <h1 className="text-ds-2xl font-bold text-surface-fg">Framer Motion Showcase</h1>
        <p className="mt-ds-02 text-ds-md text-surface-fg-muted">
          Every animation in Shilp Sutra is now powered by Framer Motion — physics-based springs
          for spatial motion, tweens for opacity and color. Zero CSS keyframe animations remain
          for interactive components.
        </p>
      </div>

      <ButtonGesturesDemo />
      <InteractiveCardDemo />
      <ToggleControlsDemo />
      <ToggleToolbarDemo />
      <AccordionDemo />
      <DialogDemo />
      <AlertDismissDemo />
      <StaggerListDemo />
      <BadgePulseDemo />
      <SpringPlaygroundDemo />
      <SpinnerDemo />
    </div>
  )
}

export const Showcase: Story = {
  name: 'Full Showcase',
  render: () => <FullShowcase />,
}

// ── Individual stories for each section ──

export const ButtonGestures: Story = {
  name: 'Button Gestures',
  render: () => (
    <div className="p-ds-06"><ButtonGesturesDemo /></div>
  ),
}

export const InteractiveCards: Story = {
  name: 'Interactive Cards',
  render: () => (
    <div className="p-ds-06"><InteractiveCardDemo /></div>
  ),
}

export const CheckboxSwitch: Story = {
  name: 'Checkbox & Switch',
  render: () => (
    <div className="p-ds-06"><ToggleControlsDemo /></div>
  ),
}

export const AccordionHeight: Story = {
  name: 'Accordion Height',
  render: () => (
    <div className="p-ds-06"><AccordionDemo /></div>
  ),
}

export const DialogOverlay: Story = {
  name: 'Dialog Overlay',
  render: () => (
    <div className="p-ds-06"><DialogDemo /></div>
  ),
}

export const AlertDismiss: Story = {
  name: 'Alert Dismiss',
  render: () => (
    <div className="p-ds-06"><AlertDismissDemo /></div>
  ),
}

export const StaggeredList: Story = {
  name: 'Staggered List',
  render: () => (
    <div className="p-ds-06"><StaggerListDemo /></div>
  ),
}

export const SpringPhysics: Story = {
  name: 'Spring Physics',
  render: () => (
    <div className="p-ds-06"><SpringPlaygroundDemo /></div>
  ),
}
