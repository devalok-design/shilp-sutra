'use client'

import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  IconArrowRight,
  IconCloudUpload,
  IconDownload,
  IconHeart,
  IconPlus,
  IconSend,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * "Look closer" — single primitive (Button) shown across the surfaces a
 * screenshot can't capture. Three interactive demo cards above; full variant
 * gallery below mirroring Storybook's AllVariants story.
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
          A button is just a button — until you click one and something feels wrong. The spinner
          shifts the text. The check never comes. The loading bar lies. Ours don&apos;t do that.
          Click through.
        </Text>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-ds-05 mb-ds-09">
        <AsyncDemo />
        <ProcessingDemo />
        <LoadingDemo />
      </div>

      <ButtonGallery />

      <footer className="mt-ds-09 flex flex-col items-start gap-ds-02 max-w-2xl">
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

/* -----------------------------------------------------------------------
 * Interactive demos
 * --------------------------------------------------------------------- */

function AsyncDemo() {
  return (
    <DemoCard
      title="One prop. Three states."
      caption={
        <>
          <code className="font-mono">onClickAsync</code> handles loading →&nbsp;success
          →&nbsp;reset. Click it.
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

type ProcessingSpeed = 'ambient' | 'working' | 'urgent'

const PROCESSING_OPTIONS: { id: ProcessingSpeed; label: string; duration: string }[] = [
  { id: 'ambient', label: 'Calm', duration: '3s loop' },
  { id: 'working', label: 'Working', duration: '2s loop' },
  { id: 'urgent', label: 'Urgent', duration: '1s loop' },
]

function ProcessingDemo() {
  const [speed, setSpeed] = useState<ProcessingSpeed>('working')
  const active = PROCESSING_OPTIONS.find((o) => o.id === speed) ?? PROCESSING_OPTIONS[1]

  return (
    <DemoCard
      title="Patience, animated."
      caption={
        <>
          Long jobs need a different feel from short ones. Pick the energy — watch the marching
          border change pace.
        </>
      }
    >
      {/* key on speed remounts the Button so the marching-ants animation restarts cleanly. */}
      <Button
        key={speed}
        processing={speed}
        processingDisabled={false}
        variant="solid"
        size="lg"
      >
        Running pipeline
      </Button>
      <SegmentedSwitch
        options={PROCESSING_OPTIONS}
        value={speed}
        onChange={(v) => setSpeed(v as ProcessingSpeed)}
      />
      <Text variant="body-xs" className="text-surface-fg-subtle">
        {active.label} · <code className="font-mono">{active.duration}</code>
      </Text>
    </DemoCard>
  )
}

type LoadingPosition = 'start' | 'center' | 'end'

const LOADING_OPTIONS: { id: LoadingPosition; label: string }[] = [
  { id: 'start', label: 'Start' },
  { id: 'center', label: 'Center' },
  { id: 'end', label: 'End' },
]

function LoadingDemo() {
  const [pos, setPos] = useState<LoadingPosition>('start')

  return (
    <DemoCard
      title="The text stays still."
      caption="Spinners that replace the label feel broken. Pick a side; the label sticks."
    >
      <Button loading loadingPosition={pos} size="lg" variant="soft" startIcon={<IconSend size={16} />}>
        Confirming order
      </Button>
      <SegmentedSwitch options={LOADING_OPTIONS} value={pos} onChange={(v) => setPos(v as LoadingPosition)} />
    </DemoCard>
  )
}

/* -----------------------------------------------------------------------
 * Variant gallery — mirrors AllVariants story (15 combos × 3 sizes)
 * --------------------------------------------------------------------- */

const COMBOS = [
  { variant: 'solid', color: 'accent', label: 'solid · accent' },
  { variant: 'soft', color: 'accent', label: 'soft · accent' },
  { variant: 'outline', color: 'accent', label: 'outline · accent' },
  { variant: 'ghost', color: 'accent', label: 'ghost · accent' },
  { variant: 'solid', color: 'error', label: 'solid · error' },
  { variant: 'soft', color: 'error', label: 'soft · error' },
  { variant: 'outline', color: 'error', label: 'outline · error' },
  { variant: 'solid', color: 'success', label: 'solid · success' },
  { variant: 'soft', color: 'success', label: 'soft · success' },
  { variant: 'solid', color: 'warning', label: 'solid · warning' },
  { variant: 'soft', color: 'warning', label: 'soft · warning' },
  { variant: 'solid', color: 'neutral', label: 'solid · neutral' },
  { variant: 'soft', color: 'neutral', label: 'soft · neutral' },
  { variant: 'link', color: 'accent', label: 'link' },
] as const

type FilterTone = 'all' | 'solid' | 'soft' | 'outline' | 'ghost' | 'link'

const FILTERS: { id: FilterTone; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'solid', label: 'Solid' },
  { id: 'soft', label: 'Soft' },
  { id: 'outline', label: 'Outline' },
  { id: 'ghost', label: 'Ghost' },
  { id: 'link', label: 'Link' },
]

const SIZES = ['sm', 'md', 'lg'] as const

function ButtonGallery() {
  const [filter, setFilter] = useState<FilterTone>('all')
  const visible = filter === 'all' ? COMBOS : COMBOS.filter((c) => c.variant === filter)

  return (
    <div className="flex flex-col gap-ds-06">
      <header className="flex flex-col gap-ds-03 max-w-3xl">
        <Text variant="heading-md" className="text-surface-fg">
          Fourteen looks. One component.
        </Text>
        <Text variant="body-sm" className="text-surface-fg-muted">
          Every combination shilp-sutra ships. Five styles × five colours × three sizes, plus
          disabled and loading rows. Filter to focus.
        </Text>
      </header>

      <SegmentedSwitch
        options={FILTERS}
        value={filter}
        onChange={(v) => setFilter(v as FilterTone)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-04">
        <AnimatePresence mode="popLayout">
          {visible.map((combo) => (
            <motion.article
              key={combo.label}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised"
            >
              <span className="text-ds-xs font-mono text-surface-fg-subtle">{combo.label}</span>
              <div className="flex flex-wrap items-center gap-ds-02">
                {SIZES.map((size) => (
                  <Button key={size} variant={combo.variant} color={combo.color} size={size}>
                    {size}
                  </Button>
                ))}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-04">
        <article className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
          <span className="text-ds-xs font-mono text-surface-fg-subtle">with icons</span>
          <div className="flex flex-wrap items-center gap-ds-02">
            <Button startIcon={<IconPlus size={14} />}>Add</Button>
            <Button startIcon={<IconDownload size={14} />} variant="soft">
              Export
            </Button>
            <Button startIcon={<IconTrash size={14} />} variant="soft" color="error">
              Delete
            </Button>
            <Button endIcon={<IconArrowRight size={14} />}>Continue</Button>
            <Button startIcon={<IconSparkles size={14} />} variant="solid">
              Improve
            </Button>
          </div>
        </article>

        <article className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
          <span className="text-ds-xs font-mono text-surface-fg-subtle">shape · pill</span>
          <div className="flex flex-wrap items-center gap-ds-02">
            {(['accent', 'success', 'warning', 'error', 'neutral'] as const).map((c) => (
              <Button key={c} variant="soft" color={c} size="xs" shape="pill">
                {c}
              </Button>
            ))}
          </div>
        </article>

        <article className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
          <span className="text-ds-xs font-mono text-surface-fg-subtle">compact + icon sizes</span>
          <div className="flex flex-wrap items-center gap-ds-02">
            <Button size="compact-xs">c-xs</Button>
            <Button size="compact-sm">c-sm</Button>
            <Button size="compact-md">c-md</Button>
            <Button size="icon-sm" aria-label="Plus">
              <IconPlus size={14} />
            </Button>
            <Button size="icon-md" aria-label="Plus">
              <IconPlus size={16} />
            </Button>
            <Button size="icon-lg" aria-label="Plus">
              <IconPlus size={18} />
            </Button>
          </div>
        </article>

        <article className="flex flex-col gap-ds-03 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised">
          <span className="text-ds-xs font-mono text-surface-fg-subtle">states · disabled, loading, counter</span>
          <div className="flex flex-wrap items-center gap-ds-02">
            <Button loading>Saving…</Button>
            <Button loading loadingPosition="end" variant="soft">
              Sending
            </Button>
            <Button disabled>Disabled</Button>
            <Button startIcon={<IconHeart size={14} />} variant="soft">
              42
            </Button>
            <Button onClickAsync={async () => { await sleep(900) }}>Try me</Button>
          </div>
        </article>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------
 * Shared widgets
 * --------------------------------------------------------------------- */

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
      <div className="flex flex-col items-start gap-ds-03 min-h-[96px] justify-center pt-ds-02">
        {children}
      </div>
    </article>
  )
}

/**
 * Segmented switch — accessible tablist with a sliding accent pill behind
 * the active option. Used everywhere we have small option groups so state
 * changes feel like sliding doors, not flickering toggles.
 */
function SegmentedSwitch<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <LayoutGroup id={`switch-${value}`}>
      <div
        role="tablist"
        aria-label="Options"
        className="relative inline-flex items-center gap-ds-01 p-ds-01 rounded-ds-md bg-surface-overlay border border-surface-border-subtle"
      >
        {options.map((opt) => {
          const active = opt.id === value
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.id)}
              className={[
                'relative z-[1] px-ds-03 py-ds-02 rounded-ds-sm text-ds-xs font-medium transition-colors duration-fast-01',
                active ? 'text-accent-11' : 'text-surface-fg-muted hover:text-surface-fg',
              ].join(' ')}
            >
              {active && (
                <motion.span
                  layoutId={`switch-pill-${options.map((o) => o.id).join('-')}`}
                  className="absolute inset-0 rounded-ds-sm bg-accent-3"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-[1]">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
