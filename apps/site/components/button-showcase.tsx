'use client'

import { useState } from 'react'
import {
  IconArrowRight,
  IconCloudUpload,
  IconHeart,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

/**
 * "Look closer" section — picks a single primitive (Button) and shows
 * the things a static screenshot can't: async state machine, processing
 * animation, full variant matrix. The point is to make the consumer
 * feel "oh — they actually thought about this."
 */

export function ButtonShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-ds-page-x py-ds-12">
      <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-09">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Look closer
        </Text>
        <Text variant="heading-xl" className="text-surface-fg">
          We sweat the small stuff.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          A button is just a button — until you click one and something feels wrong. Loading
          state lags. The spinner moves the text. The success tick never comes. Ours doesn&apos;t
          do that. Try them.
        </Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-ds-05 mb-ds-09">
        <AsyncDemo />
        <ProcessingDemo />
        <LoadingDemo />
      </div>

      <div className="flex flex-col gap-ds-05">
        <header className="flex flex-col gap-ds-02 max-w-3xl">
          <Text variant="heading-md" className="text-surface-fg">
            One button, every shape.
          </Text>
          <Text variant="body-sm" className="text-surface-fg-muted">
            Five styles. Five colours. Five sizes. Pills, icons, full-width, loading — all from
            the same component. Use the brand switcher above the fold to recolour the lot.
          </Text>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-04">
          <VariantBlock title="Styles">
            <Button>Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </VariantBlock>

          <VariantBlock title="Colours">
            <Button>Accent</Button>
            <Button color="success">Success</Button>
            <Button color="warning">Warning</Button>
            <Button color="error">Error</Button>
            <Button color="neutral">Neutral</Button>
          </VariantBlock>

          <VariantBlock title="Sizes">
            <Button size="xs">XS</Button>
            <Button size="sm">SM</Button>
            <Button size="md">MD</Button>
            <Button size="lg">LG</Button>
          </VariantBlock>

          <VariantBlock title="Shapes &amp; icons">
            <Button shape="pill">Pill</Button>
            <Button startIcon={<IconCloudUpload size={14} />}>Upload</Button>
            <Button endIcon={<IconArrowRight size={14} />}>Continue</Button>
            <Button variant="soft" color="error" startIcon={<IconTrash size={14} />}>
              Delete
            </Button>
          </VariantBlock>

          <VariantBlock title="States">
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
            <Button startIcon={<IconHeart size={14} />} variant="soft">
              42
            </Button>
          </VariantBlock>

          <VariantBlock title="Composed">
            <Button startIcon={<IconSparkles size={14} />}>Improve with AI</Button>
            <Button variant="soft" endIcon={<IconArrowRight size={14} />}>
              Skip
            </Button>
          </VariantBlock>
        </div>
      </div>

      <footer className="mt-ds-08 flex flex-col items-start gap-ds-02 max-w-2xl">
        <Text variant="body-sm" className="text-surface-fg-muted">
          That&apos;s the Button. There are 118 others. Each one made with the same care.
        </Text>
        <a
          href="/components/button"
          className="text-ds-sm text-accent-11 underline underline-offset-2 hover:text-accent-12"
        >
          Read the Button reference →
        </a>
      </footer>
    </section>
  )
}

function VariantBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
      <Text variant="label-sm" className="text-surface-fg-subtle">
        {title}
      </Text>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}

/**
 * onClickAsync — Button's built-in async state machine. Cycles
 * idle → loading (spinner + marching ants) → success (check) → idle.
 * Real demo: each click sleeps 1.4s then resolves.
 */
function AsyncDemo() {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  return (
    <DemoCard
      title="One prop. Three states."
      caption={
        <>
          <code className="font-mono">onClickAsync</code> handles the whole loading →&nbsp;success
          →&nbsp;reset loop. Click it.
        </>
      }
    >
      <Button
        size="lg"
        startIcon={<IconCloudUpload size={16} />}
        onClickAsync={async () => {
          await sleep(1400)
        }}
      >
        Save changes
      </Button>
    </DemoCard>
  )
}

/**
 * processing — marching-ants border. Three speeds for three emotions:
 *   ambient (3s) — "I'm working, no rush"
 *   working (2s) — "I'm working, please wait"
 *   urgent  (1s) — "I'm working, pay attention"
 */
function ProcessingDemo() {
  const [speed, setSpeed] = useState<'ambient' | 'working' | 'urgent'>('working')

  const speeds: { id: 'ambient' | 'working' | 'urgent'; label: string }[] = [
    { id: 'ambient', label: 'Calm' },
    { id: 'working', label: 'Working' },
    { id: 'urgent', label: 'Urgent' },
  ]

  return (
    <DemoCard
      title="Patience, animated."
      caption="Long jobs need a different feel from short ones. Pick the energy."
    >
      <Button processing={speed} processingDisabled={false} variant="solid" size="lg">
        Running pipeline
      </Button>
      <div className="flex flex-wrap items-center gap-ds-01 mt-ds-03">
        {speeds.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSpeed(s.id)}
            className={[
              'px-ds-03 py-[3px] rounded-ds-sm text-ds-xs transition-colors duration-fast-01',
              speed === s.id
                ? 'bg-accent-3 text-accent-11'
                : 'text-surface-fg-muted hover:bg-surface-raised-hover',
            ].join(' ')}
          >
            {s.label}
          </button>
        ))}
      </div>
    </DemoCard>
  )
}

/**
 * loading + loadingPosition — spinner placement choice.
 * Most libraries center the spinner. shilp-sutra lets you keep the label visible.
 */
function LoadingDemo() {
  const [pos, setPos] = useState<'start' | 'end' | 'center'>('start')

  return (
    <DemoCard
      title="The text stays still."
      caption="Spinners that replace the label feel broken. Pick a side; the label sticks."
    >
      <Button loading loadingPosition={pos} size="lg" variant="soft">
        Confirming order
      </Button>
      <div className="flex flex-wrap items-center gap-ds-01 mt-ds-03">
        {(['start', 'center', 'end'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPos(p)}
            className={[
              'px-ds-03 py-[3px] rounded-ds-sm text-ds-xs transition-colors duration-fast-01',
              pos === p
                ? 'bg-accent-3 text-accent-11'
                : 'text-surface-fg-muted hover:bg-surface-raised-hover',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
      </div>
    </DemoCard>
  )
}

function DemoCard({
  title,
  caption,
  children,
}: {
  title: string
  caption: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="flex flex-col gap-ds-04 p-ds-06 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
      <header className="flex flex-col gap-ds-01">
        <Text variant="heading-sm" className="text-surface-fg">
          {title}
        </Text>
        <Text variant="body-sm" className="text-surface-fg-muted">
          {caption}
        </Text>
      </header>
      <div className="flex flex-col items-start gap-ds-02 min-h-[88px] justify-center pt-ds-03">
        {children}
      </div>
    </article>
  )
}
