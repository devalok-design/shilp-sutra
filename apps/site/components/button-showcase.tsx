'use client'

import { useEffect, useRef, useState } from 'react'
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
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconVolume,
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
      <header className="flex flex-col gap-ds-03 max-w-2xl mb-ds-08">
        <Text variant="heading-xl" className="text-surface-fg">
          We sweat the small stuff.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          A button is just a button. Until you click one and something feels wrong. The spinner
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

      <footer className="mt-ds-09 flex flex-col items-center gap-ds-02 max-w-2xl mx-auto text-center">
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
      <header className="flex flex-col gap-ds-02 max-w-2xl">
        <Text variant="heading-md" className="text-surface-fg">
          The same Button, across ten products.
        </Text>
        <Text variant="body-sm" className="text-surface-fg-muted">
          Email, music, banking, social, code, calendar, deploys. Each card lifts a real
          interaction shape. The variant, colour, size, and compound shape pick themselves
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
      <div className="rounded-control bg-surface-overlay border border-surface-border-subtle p-ds-04">
        {children}
      </div>
    </article>
  )
}

/* Email client — Send + Schedule */
function SceneEmail() {
  const [status, setStatus] = useState<
    | { kind: 'draft' }
    | { kind: 'sent' }
    | { kind: 'scheduled'; when: string }
    | { kind: 'saved' }
  >({ kind: 'draft' })

  const flash = (next: typeof status) => {
    setStatus(next)
    window.setTimeout(() => setStatus({ kind: 'draft' }), 1800)
  }

  const label =
    status.kind === 'draft'
      ? 'Draft to mridula@devalok.in'
      : status.kind === 'sent'
        ? 'Sent to mridula@devalok.in'
        : status.kind === 'scheduled'
          ? `Scheduled for ${status.when}`
          : 'Saved to drafts'

  return (
    <Scene
      product="Email · Gmail-shaped"
      why="Primary action with an attached alternative. SplitButton fuses the two visually so the user reads it as one decision."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex items-center gap-ds-02">
          <IconMail size={14} className="text-surface-fg-subtle" />
          <Text variant="body-xs" className="text-surface-fg-subtle">
            {label}
          </Text>
        </div>
        <SplitButton
          color="accent"
          size="sm"
          onClick={() => flash({ kind: 'sent' })}
          dropdownLabel="Send options"
          dropdownContent={
            <div className="flex flex-col gap-ds-01 p-ds-02 min-w-[12rem]">
              <DropdownLink
                icon={<IconSend size={14} />}
                label="Send now"
                hint="Default"
                onClick={() => flash({ kind: 'sent' })}
              />
              <DropdownLink
                icon={<IconClock size={14} />}
                label="Schedule send"
                hint="Tomorrow 9 am"
                onClick={() => flash({ kind: 'scheduled', when: 'tomorrow 9 am' })}
              />
              <DropdownLink
                icon={<IconBookmark size={14} />}
                label="Save as draft"
                hint=""
                onClick={() => flash({ kind: 'saved' })}
              />
            </div>
          }
        >
          Send
        </SplitButton>
      </div>
    </Scene>
  )
}

/* Music player — Jai Bhairav Deva. Real audio hot-linked from archive.org.
   The Spotify-styled chrome IS the player: Play toggles real playback,
   the progress strip reflects audio.currentTime, the audio element itself
   is hidden (no duplicate native controls). */
function SceneMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const [time, setTime] = useState<{ current: number; duration: number }>({
    current: 0,
    duration: 0,
  })

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onTime = () => {
      const cur = audio.currentTime
      const dur = audio.duration || 0
      setTime({ current: cur, duration: dur })
      setProgress(dur > 0 ? cur / dur : 0)
    }
    const onLoaded = () => setTime((t) => ({ ...t, duration: audio.duration || 0 }))
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play().catch(() => {
        /* autoplay/network errors swallowed; the UI keeps showing Play */
      })
    } else {
      audio.pause()
    }
  }

  const skip = (delta: number) => () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta))
  }

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const p = Number(e.target.value) / 1000
    audio.currentTime = p * (audio.duration || 0)
  }

  return (
    <Scene
      product="Music · Spotify-shaped"
      why="One Button row driving real audio. Play toggles playback, the progress strip tracks position, scrubbing seeks. No native browser chrome."
    >
      <div className="flex flex-col gap-ds-04">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
          <div className="flex items-center gap-ds-03 min-w-0">
            <span className="w-10 h-10 rounded-control-inner bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
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
          <div className="flex items-center gap-ds-01 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back 10 seconds"
              onClick={skip(-10)}
            >
              <IconPlayerSkipForward size={14} className="rotate-180" />
            </Button>
            <Button
              variant="solid"
              size="icon-lg"
              shape="pill"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              aria-pressed={isPlaying}
              onClick={toggle}
            >
              {isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Forward 10 seconds"
              onClick={skip(10)}
            >
              <IconPlayerSkipForward size={14} />
            </Button>
          </div>
        </div>

        {/* Progress strip — input range overlay on a styled track. The native
            input is invisible but accepts pointer + keyboard input; the
            visible track + fill mirrors audio.currentTime. */}
        <div className="relative flex items-center gap-ds-03 text-ds-xs text-surface-fg-subtle font-mono tabular-nums">
          <span className="shrink-0 w-9 text-right">{formatTime(time.current)}</span>
          <div className="relative flex-1 h-1.5 rounded-pill bg-surface-overlay overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-accent-9 rounded-pill"
              style={{ width: `${progress * 100}%` }}
              aria-hidden
            />
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(progress * 1000)}
              onChange={onScrub}
              aria-label="Seek"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="shrink-0 w-9">{formatTime(time.duration)}</span>
          <span className="hidden sm:inline-flex items-center text-surface-fg-subtle shrink-0 ml-ds-01">
            <IconVolume size={12} aria-hidden />
          </span>
        </div>

        <audio
          ref={audioRef}
          preload="metadata"
          src="https://archive.org/download/24SriBhairavarKavasam/27%20Jai%20Bhairav%20Deva.mp3"
          className="hidden"
        >
          Your browser does not support audio playback.
        </audio>
      </div>
    </Scene>
  )
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* Streaming subscribe */
function SceneStreaming() {
  const [subscribed, setSubscribed] = useState(false)
  return (
    <Scene
      product="Streaming · Netflix-shaped"
      why="High-emotion conversion. Pill shape + warning hue catches the eye without screaming red."
    >
      <div className="flex flex-wrap items-center justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            {subscribed ? 'Welcome to All-access' : '7-day free trial · ₹199 / month'}
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            {subscribed ? 'Trial started. Renews 1 June.' : 'All-access. Cancel any time.'}
          </Text>
        </div>
        <Button
          color={subscribed ? 'success' : 'warning'}
          size="md"
          shape="pill"
          onClickAsync={async () => {
            await sleep(900)
            setSubscribed(true)
          }}
        >
          {subscribed ? 'Trial started' : 'Subscribe'}
        </Button>
      </div>
    </Scene>
  )
}

/* Code editor — Run / Debug / Test */
type EditorMode = 'run' | 'debug' | 'test'
const EDITOR_STATUS: Record<EditorMode, string> = {
  run: 'main.ts · ↑ no errors',
  debug: 'main.ts · paused at line 42',
  test: 'main.ts · 12 passed, 0 failed',
}

function SceneCodeEditor() {
  const [mode, setMode] = useState<EditorMode>('run')
  return (
    <Scene
      product="Code editor · VS Code-shaped"
      why="ButtonGroup attached. Same context, three sibling actions, shared border radius. Reads as one toolbar."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex items-center gap-ds-02">
          <IconCode size={14} className="text-surface-fg-subtle" />
          <Text variant="body-xs" className="text-surface-fg-subtle font-mono">
            {EDITOR_STATUS[mode]}
          </Text>
        </div>
        <ButtonGroup variant="soft" size="sm" color="accent">
          <Button
            startIcon={<IconBolt size={12} />}
            variant={mode === 'run' ? 'solid' : 'soft'}
            aria-pressed={mode === 'run'}
            onClick={() => setMode('run')}
          >
            Run
          </Button>
          <Button
            startIcon={<IconBug size={12} />}
            variant={mode === 'debug' ? 'solid' : 'soft'}
            aria-pressed={mode === 'debug'}
            onClick={() => setMode('debug')}
          >
            Debug
          </Button>
          <Button
            startIcon={<IconShieldCheck size={12} />}
            variant={mode === 'test' ? 'solid' : 'soft'}
            aria-pressed={mode === 'test'}
            onClick={() => setMode('test')}
          >
            Test
          </Button>
        </ButtonGroup>
      </div>
    </Scene>
  )
}

/* Social post — Like / Comment / Share */
function SceneSocial() {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(312)
  const [reposted, setReposted] = useState(false)
  const [reposts, setReposts] = useState(18)
  const [shared, setShared] = useState(false)
  return (
    <Scene
      product="Social · X-shaped"
      why="Ghost variant + icon + counter. Three sibling actions stay quiet until tapped. Content does the work."
    >
      <div className="flex flex-col gap-ds-03">
        <div className="flex items-center gap-ds-03 min-w-0">
          <Text variant="body-xs" className="text-surface-fg-muted line-clamp-2">
            {shared
              ? 'Link copied. Share away.'
              : '“The slow web is finally winning…”'}
          </Text>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-ds-01">
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
          <Button
            variant="ghost"
            size="sm"
            color={reposted ? 'success' : 'neutral'}
            startIcon={<IconRepeat size={14} />}
            aria-pressed={reposted}
            onClick={() => {
              setReposted((r) => !r)
              setReposts((c) => (reposted ? c - 1 : c + 1))
            }}
          >
            <motion.span
              key={reposts}
              initial={{ y: -3, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {reposts}
            </motion.span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Share"
            aria-pressed={shared}
            onClick={() => {
              setShared(true)
              window.setTimeout(() => setShared(false), 1600)
            }}
          >
            <IconShare3 size={14} />
          </Button>
        </div>
      </div>
    </Scene>
  )
}

/* Calendar — Add event with split for Task / Reminder */
type CalendarKind = 'event' | 'task' | 'reminder' | 'ooo'
const CALENDAR_NEXT: Record<CalendarKind, string> = {
  event: 'Next · Standup with the studio, 10:30',
  task: 'Next · Ship the audit doc, due 5 pm',
  reminder: 'Next · Water the tulsi at 6 pm',
  ooo: 'Next · Out of office Mon to Wed',
}

function SceneCalendar() {
  const [kind, setKind] = useState<CalendarKind>('event')
  return (
    <Scene
      product="Calendar · Google Calendar-shaped"
      why="Top-level create with three flavours. SplitButton reveals the alternatives without cluttering the toolbar."
    >
      <div className="flex flex-wrap items-center justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Thursday, 26 May
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            {CALENDAR_NEXT[kind]}
          </Text>
        </div>
        <SplitButton
          color="accent"
          variant="solid"
          size="sm"
          onClick={() => setKind('event')}
          dropdownLabel="Event types"
          dropdownContent={
            <div className="flex flex-col gap-ds-01 p-ds-02 min-w-[12rem]">
              <DropdownLink
                icon={<IconCalendarPlus size={14} />}
                label="Event"
                hint="With time + place"
                onClick={() => setKind('event')}
              />
              <DropdownLink
                icon={<IconCalendarPlus size={14} />}
                label="Task"
                hint="Owned, dated, done-able"
                onClick={() => setKind('task')}
              />
              <DropdownLink
                icon={<IconCalendarPlus size={14} />}
                label="Reminder"
                hint="Quiet ping"
                onClick={() => setKind('reminder')}
              />
              <DropdownLink
                icon={<IconCalendarPlus size={14} />}
                label="Out of office"
                hint="Auto-declines"
                onClick={() => setKind('ooo')}
              />
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
  const [sent, setSent] = useState(false)
  return (
    <Scene
      product="Banking · Wise-shaped"
      why="Irreversible + sensitive. Solid + lg + onClickAsync. The user sees the confirm cycle, then it rests."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            {sent
              ? 'Sent · ref UPI-7K2F · yogin@axl'
              : 'To: Yogin Sharma · UPI yogin@axl'}
          </Text>
          <Text variant="heading-sm" className="text-surface-fg">
            ₹84,000
          </Text>
        </div>
        <Button
          size="lg"
          color={sent ? 'success' : 'accent'}
          onClickAsync={async () => {
            await sleep(1600)
            setSent(true)
            window.setTimeout(() => setSent(false), 2400)
          }}
        >
          {sent ? 'Sent' : 'Verify + send'}
        </Button>
      </div>
    </Scene>
  )
}

/* DevOps — Deploy with urgent processing */
type DeployState = 'idle' | 'deploying' | 'ready'

function SceneDeploy() {
  const [state, setState] = useState<DeployState>('deploying')
  const [showLogs, setShowLogs] = useState(false)
  const status =
    state === 'idle'
      ? 'Idle · last deploy 4h ago'
      : state === 'deploying'
        ? 'Building · 1m 14s'
        : 'Ready · deploy live'

  const onDeployClick = () => {
    if (state === 'deploying') {
      setState('idle')
      return
    }
    setState('deploying')
    window.setTimeout(() => setState('ready'), 1800)
  }

  return (
    <Scene
      product="DevOps · Vercel-shaped"
      why="Long-running with high stakes. Processing='urgent' keeps the dotted border alive; processingDisabled=false lets the user roll back."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01 min-w-0">
          <Text variant="body-xs" className="text-surface-fg-subtle font-mono">
            {showLogs ? '> build complete in 74.2s · 0 errors' : 'shilp-sutra-site@b8eb960'}
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            {status}
          </Text>
        </div>
        <ButtonGroup size="sm">
          <Button
            variant="outline"
            aria-pressed={showLogs}
            onClick={() => setShowLogs((s) => !s)}
          >
            {showLogs ? 'Hide logs' : 'Logs'}
          </Button>
          <Button
            processing={state === 'deploying' ? 'urgent' : undefined}
            processingDisabled={false}
            color={state === 'ready' ? 'success' : 'accent'}
            startIcon={<IconRocket size={12} />}
            onClick={onDeployClick}
          >
            {state === 'deploying' ? 'Deploying' : state === 'ready' ? 'Deployed' : 'Deploy'}
          </Button>
        </ButtonGroup>
      </div>
    </Scene>
  )
}

/* Notes — New page with templates */
type NoteTemplate = 'blank' | 'meeting' | 'brief' | 'readme'
const NOTE_PREVIEW: Record<NoteTemplate, string> = {
  blank: 'Recent · 12 pages',
  meeting: 'Drafting · Untitled meeting notes',
  brief: 'Drafting · Project brief (Devalok)',
  readme: 'Importing · README from GitHub',
}

function SceneNotes() {
  const [template, setTemplate] = useState<NoteTemplate>('blank')
  return (
    <Scene
      product="Notes · Notion-shaped"
      why="One primary, many cousins. SplitButton again. This time the dropdown is content variety, not delivery options."
    >
      <div className="flex flex-wrap items-center justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Workspace · Devalok
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            {NOTE_PREVIEW[template]}
          </Text>
        </div>
        <SplitButton
          variant="soft"
          color="accent"
          size="sm"
          onClick={() => setTemplate('blank')}
          dropdownLabel="Page templates"
          dropdownContent={
            <div className="flex flex-col gap-ds-01 p-ds-02 min-w-[12rem]">
              <DropdownLink
                icon={<IconPlus size={14} />}
                label="Blank page"
                hint=""
                onClick={() => setTemplate('blank')}
              />
              <DropdownLink
                icon={<IconPlus size={14} />}
                label="Meeting notes"
                hint="Agenda + decisions"
                onClick={() => setTemplate('meeting')}
              />
              <DropdownLink
                icon={<IconPlus size={14} />}
                label="Project brief"
                hint="Devalok template"
                onClick={() => setTemplate('brief')}
              />
              <DropdownLink
                icon={<IconBrandGithub size={14} />}
                label="From GitHub README"
                hint=""
                onClick={() => setTemplate('readme')}
              />
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
  const [bag, setBag] = useState(0)
  const [buying, setBuying] = useState(false)
  return (
    <Scene
      product="Commerce · Stripe Checkout-shaped"
      why="Two-emphasis row. Soft + outline pair: equal weight, different priority signalled by tone alone."
    >
      <div className="flex flex-wrap items-center justify-between gap-ds-03">
        <div className="flex flex-col gap-ds-01">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            {bag > 0
              ? `Linen kurta · Tulsi · size M · bag (${bag})`
              : 'Linen kurta · Tulsi · size M'}
          </Text>
          <Text variant="body-sm" className="text-surface-fg">
            {buying ? 'Checkout opened in a new tab' : '₹5,200'}
          </Text>
        </div>
        <div className="flex items-center gap-ds-02 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBag((c) => c + 1)}
          >
            {bag > 0 ? 'Added' : 'Add to bag'}
          </Button>
          <Button
            size="sm"
            endIcon={<IconArrowRight size={14} />}
            onClickAsync={async () => {
              await sleep(900)
              setBuying(true)
              window.setTimeout(() => setBuying(false), 2000)
            }}
          >
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
  onClick,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-ds-03 px-ds-03 py-ds-02 rounded-control-inner text-left hover:bg-surface-raised-hover transition-colors duration-fast-01"
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
        className="relative inline-flex items-center gap-ds-01 p-ds-01 rounded-control bg-surface-overlay border border-surface-border-subtle"
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
                'relative z-[1] px-ds-03 py-ds-02 rounded-control-inner text-ds-xs font-medium transition-colors duration-fast-01',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                active ? 'text-accent-11' : 'text-surface-fg-muted hover:text-surface-fg',
              ].join(' ')}
            >
              {active && (
                <motion.span
                  layoutId={`switch-pill-${options.map((o) => o.id).join('-')}`}
                  className="absolute inset-0 rounded-control-inner bg-accent-3"
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
