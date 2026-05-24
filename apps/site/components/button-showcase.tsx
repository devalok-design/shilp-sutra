'use client'

import { useState } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import {
  IconArrowRight,
  IconBolt,
  IconBookmark,
  IconBrandGithub,
  IconBrandSpotify,
  IconBug,
  IconCalendarPlus,
  IconChevronRight,
  IconClock,
  IconCloudUpload,
  IconCode,
  IconHeart,
  IconMail,
  IconMessageCircle,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconPlus,
  IconRepeat,
  IconRocket,
  IconSend,
  IconShare3,
  IconShieldCheck,
} from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { ButtonGroup } from '@devalok/shilp-sutra/ui/button-group'
import { SplitButton } from '@devalok/shilp-sutra/ui/split-button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CARD_EYEBROW, CARD_RESTING } from '@/lib/card-recipe'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * "Look closer" — three interactive live demos showing what a screenshot
 * can't, then ten scenes lifted from wildly different products to prove
 * the same Button component carries every job a real interface asks of it.
 */
export function ButtonShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-ds-05 mb-ds-12">
        <AsyncDemo />
        <ProcessingDemo />
        <LoadingDemo />
      </div>

      <ContextualScenes />

      <footer className="mt-ds-09 flex flex-col items-start gap-ds-02 max-w-2xl">
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
 * Three interactive demos
 * --------------------------------------------------------------------- */

function AsyncDemo() {
  return (
    <DemoCard
      title="One prop. Three states."
      caption={
        <>
          <code className="font-mono">onClickAsync</code> runs loading →&nbsp;success
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
      caption="Long jobs need a different feel from short ones. Watch the marching border change pace."
    >
      <Button key={speed} processing={speed} processingDisabled={false} variant="solid" size="lg">
        Running pipeline
      </Button>
      <SegmentedSwitch options={PROCESSING_OPTIONS} value={speed} onChange={(v) => setSpeed(v as ProcessingSpeed)} />
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
 * Ten contextual scenes — wildly different products, one component
 * --------------------------------------------------------------------- */

function ContextualScenes() {
  return (
    <div className="flex flex-col gap-ds-06">
      <header className="flex flex-col gap-ds-03 max-w-3xl">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Wherever you ship, it fits
        </Text>
        <Text variant="heading-md" className="text-surface-fg">
          The same Button, across ten products.
        </Text>
        <Text variant="body-sm" className="text-surface-fg-muted">
          Email, music, banking, social, code, calendar, deploys. Each card lifts a real
          interaction shape — the variant, colour, size, and compound shape pick themselves
          from what the user is being asked to do.
        </Text>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-04">
        <SceneEmail />
        <SceneMusic />
        <SceneStreaming />
        <SceneCodeEditor />
        <SceneSocial />
        <SceneCalendar />
        <SceneBanking />
        <SceneDeploy />
        <SceneNotes />
        <SceneCommerce />
      </div>
    </div>
  )
}

function Scene({
  product,
  why,
  children,
}: {
  product: string
  why: string
  children: React.ReactNode
}) {
  return (
    <article className={CARD_RESTING + ' flex flex-col gap-ds-04'}>
      <header className="flex flex-col gap-ds-02">
        <span className={CARD_EYEBROW + ' mb-0'}>{product}</span>
        <p className="text-ds-sm text-surface-fg-subtle line-clamp-2">{why}</p>
      </header>
      <div className="rounded-ds-md bg-surface-overlay border border-surface-border-subtle p-ds-04">
        {children}
      </div>
    </article>
  )
}

/* Email client — Send + Schedule */
function SceneEmail() {
  return (
    <Scene
      product="Email · Gmail-shaped"
      why="Primary action with an attached alternative. SplitButton fuses the two visually so the user reads it as one decision."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex items-center gap-ds-02">
          <IconMail size={14} className="text-surface-fg-subtle" />
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Draft to mridula@devalok.in
          </Text>
        </div>
        <SplitButton
          color="accent"
          size="sm"
          onClick={() => {}}
          dropdownLabel="Send options"
          dropdownContent={
            <div className="flex flex-col gap-ds-01 p-ds-02 min-w-[12rem]">
              <DropdownLink icon={<IconSend size={14} />} label="Send now" hint="Default" />
              <DropdownLink icon={<IconClock size={14} />} label="Schedule send" hint="Tomorrow 9 am" />
              <DropdownLink icon={<IconBookmark size={14} />} label="Save as draft" hint="" />
            </div>
          }
        >
          Send
        </SplitButton>
      </div>
    </Scene>
  )
}

/* Music player — Jai Bhairav Deva. Real audio, hot-linked from archive.org. */
function SceneMusic() {
  return (
    <Scene
      product="Music · Spotify-shaped"
      why="Single icon button as the centre of gravity. Real audio below — press play, hear the actual bhajan. The Button row sits where a real product's custom chrome would."
    >
      <div className="flex flex-col gap-ds-03">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
          <div className="flex items-center gap-ds-03 min-w-0">
            <span className="w-10 h-10 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
              <IconBrandSpotify size={18} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">
                Jai Bhairav Deva
              </span>
              <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">
                Glory to Lord Bhairav · bhajan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-ds-01">
            <Button variant="ghost" size="icon-sm" aria-label="Previous">
              <IconPlayerSkipForward size={14} className="rotate-180" />
            </Button>
            <Button variant="solid" size="icon-lg" shape="pill" aria-label="Play">
              <IconPlayerPlay size={16} />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Next">
              <IconPlayerSkipForward size={14} />
            </Button>
          </div>
        </div>
        <audio
          controls
          preload="metadata"
          src="https://archive.org/download/24SriBhairavarKavasam/27%20Jai%20Bhairav%20Deva.mp3"
          className="w-full rounded-ds-md"
        >
          Your browser does not support audio playback.
        </audio>
      </div>
    </Scene>
  )
}

/* Streaming subscribe */
function SceneStreaming() {
  return (
    <Scene
      product="Streaming · Netflix-shaped"
      why="High-emotion conversion. Pill shape + warning hue catches the eye without screaming red."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            7-day free trial · ₹199 / month
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            All-access. Cancel any time.
          </Text>
        </div>
        <Button color="warning" size="md" shape="pill">
          Subscribe
        </Button>
      </div>
    </Scene>
  )
}

/* Code editor — Run / Debug / Test */
function SceneCodeEditor() {
  return (
    <Scene
      product="Code editor · VS Code-shaped"
      why="ButtonGroup attached. Same context, three sibling actions, shared border radius — reads as one toolbar."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex items-center gap-ds-02">
          <IconCode size={14} className="text-surface-fg-subtle" />
          <Text variant="body-xs" className="text-surface-fg-subtle font-mono">
            main.ts · ↑ no errors
          </Text>
        </div>
        <ButtonGroup variant="soft" size="sm" color="accent">
          <Button startIcon={<IconBolt size={12} />}>Run</Button>
          <Button startIcon={<IconBug size={12} />}>Debug</Button>
          <Button startIcon={<IconShieldCheck size={12} />}>Test</Button>
        </ButtonGroup>
      </div>
    </Scene>
  )
}

/* Social post — Like / Comment / Share */
function SceneSocial() {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(312)
  return (
    <Scene
      product="Social · X-shaped"
      why="Ghost variant + icon + counter. Three sibling actions stay quiet until tapped — content does the work."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex items-center gap-ds-03 min-w-0">
          <Text variant="body-xs" className="text-surface-fg-muted truncate max-w-[18rem]">
            &ldquo;The slow web is finally winning…&rdquo;
          </Text>
        </div>
        <div className="flex items-center gap-ds-01">
          <Button
            variant="ghost"
            size="sm"
            color={liked ? 'error' : 'neutral'}
            startIcon={
              <IconHeart
                size={14}
                className={liked ? 'fill-error-9 text-error-9' : ''}
              />
            }
            onClick={() => {
              setLiked((l) => !l)
              setLikes((c) => (liked ? c - 1 : c + 1))
            }}
          >
            <motion.span
              key={likes}
              initial={{ y: -3, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {likes}
            </motion.span>
          </Button>
          <Button variant="ghost" size="sm" startIcon={<IconMessageCircle size={14} />}>
            41
          </Button>
          <Button variant="ghost" size="sm" startIcon={<IconRepeat size={14} />}>
            18
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Share">
            <IconShare3 size={14} />
          </Button>
        </div>
      </div>
    </Scene>
  )
}

/* Calendar — Add event with split for Task / Reminder */
function SceneCalendar() {
  return (
    <Scene
      product="Calendar · Google Calendar-shaped"
      why="Top-level create with three flavours. SplitButton reveals the alternatives without cluttering the toolbar."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Thursday, 26 May
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            6 events · 2 tasks open
          </Text>
        </div>
        <SplitButton
          color="accent"
          variant="solid"
          size="sm"
          onClick={() => {}}
          dropdownLabel="Event types"
          dropdownContent={
            <div className="flex flex-col gap-ds-01 p-ds-02 min-w-[12rem]">
              <DropdownLink icon={<IconCalendarPlus size={14} />} label="Event" hint="With time + place" />
              <DropdownLink icon={<IconCalendarPlus size={14} />} label="Task" hint="Owned, dated, done-able" />
              <DropdownLink icon={<IconCalendarPlus size={14} />} label="Reminder" hint="Quiet ping" />
              <DropdownLink icon={<IconCalendarPlus size={14} />} label="Out of office" hint="Auto-declines" />
            </div>
          }
        >
          Create
        </SplitButton>
      </div>
    </Scene>
  )
}

/* Banking — Send money with async verify */
function SceneBanking() {
  return (
    <Scene
      product="Banking · Wise-shaped"
      why="Irreversible + sensitive. Solid + lg + onClickAsync. The user sees the confirm cycle, then it rests."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            To: Yogin Sharma · UPI yogin@axl
          </Text>
          <Text variant="heading-sm" className="text-surface-fg">
            ₹84,000
          </Text>
        </div>
        <Button
          size="lg"
          onClickAsync={async () => {
            await sleep(1600)
          }}
        >
          Verify + send
        </Button>
      </div>
    </Scene>
  )
}

/* DevOps — Deploy with urgent processing */
function SceneDeploy() {
  return (
    <Scene
      product="DevOps · Vercel-shaped"
      why="Long-running with high stakes. Processing='urgent' keeps the dotted border alive; processingDisabled=false lets the user roll back."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01 min-w-0">
          <Text variant="body-xs" className="text-surface-fg-subtle font-mono">
            shilp-sutra-site@b8eb960
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            Building · 1m 14s
          </Text>
        </div>
        <ButtonGroup size="sm">
          <Button variant="outline">Logs</Button>
          <Button processing="urgent" processingDisabled={false} startIcon={<IconRocket size={12} />}>
            Deploying
          </Button>
        </ButtonGroup>
      </div>
    </Scene>
  )
}

/* Notes — New page with templates */
function SceneNotes() {
  return (
    <Scene
      product="Notes · Notion-shaped"
      why="One primary, many cousins. SplitButton again — but this time the dropdown is content variety, not delivery options."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Workspace · Devalok
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            Recent · 12 pages
          </Text>
        </div>
        <SplitButton
          variant="soft"
          color="accent"
          size="sm"
          onClick={() => {}}
          dropdownLabel="Page templates"
          dropdownContent={
            <div className="flex flex-col gap-ds-01 p-ds-02 min-w-[12rem]">
              <DropdownLink icon={<IconPlus size={14} />} label="Blank page" hint="" />
              <DropdownLink icon={<IconPlus size={14} />} label="Meeting notes" hint="Agenda + decisions" />
              <DropdownLink icon={<IconPlus size={14} />} label="Project brief" hint="Devalok template" />
              <DropdownLink icon={<IconBrandGithub size={14} />} label="From GitHub README" hint="" />
            </div>
          }
        >
          New page
        </SplitButton>
      </div>
    </Scene>
  )
}

/* Commerce — Add to cart with quick-buy */
function SceneCommerce() {
  return (
    <Scene
      product="Commerce · Stripe Checkout-shaped"
      why="Two-emphasis row. Soft + outline pair: equal weight, different priority signalled by tone alone."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Linen kurta · Tulsi · size M
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            ₹5,200
          </Text>
        </div>
        <div className="flex items-center gap-ds-02">
          <Button variant="outline" size="sm">
            Add to bag
          </Button>
          <Button size="sm" endIcon={<IconArrowRight size={14} />}>
            Buy now
          </Button>
        </div>
      </div>
    </Scene>
  )
}

/* -----------------------------------------------------------------------
 * Shared widgets
 * --------------------------------------------------------------------- */

function DropdownLink({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-ds-03 px-ds-03 py-ds-02 rounded-ds-sm text-left hover:bg-surface-raised-hover transition-colors duration-fast-01"
    >
      <span className="text-surface-fg-subtle shrink-0">{icon}</span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className="text-ds-sm text-surface-fg">{label}</span>
        {hint && <span className="text-ds-xs text-surface-fg-subtle">{hint}</span>}
      </span>
      <IconChevronRight size={12} className="text-surface-fg-subtle" />
    </button>
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
    <article className={CARD_RESTING + ' flex flex-col gap-ds-04'}>
      <header className="flex flex-col gap-ds-02">
        <h3 className="text-ds-md text-surface-fg font-semibold">{title}</h3>
        <p className="text-ds-sm text-surface-fg-subtle">{caption}</p>
      </header>
      <div className="flex flex-col items-start gap-ds-03 min-h-[96px] justify-center pt-ds-02">
        {children}
      </div>
    </article>
  )
}

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
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
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
