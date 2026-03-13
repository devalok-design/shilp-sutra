import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  MotionFade,
  MotionScale,
  MotionPop,
  MotionSlide,
  MotionCollapse,
  MotionStagger,
  MotionStaggerItem,
} from './primitives'
import { MotionProvider } from './motion-provider'
import { springs } from '../ui/lib/motion'

// ── Helpers ──

const Box = ({ children, color = 'bg-accent-9' }: { children?: React.ReactNode; color?: string }) => (
  <div className={`${color} rounded-ds-md p-ds-06 text-accent-fg text-ds-sm font-medium`}>
    {children ?? 'Animated content'}
  </div>
)

const ToggleButton = ({ on, onClick, label }: { on: boolean; onClick: () => void; label?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-ds-md bg-surface-2 px-ds-04 py-ds-02 text-ds-sm font-medium text-surface-fg hover:bg-surface-3 transition-colors"
  >
    {label ?? (on ? 'Hide' : 'Show')}
  </button>
)

// ── Meta ──

const meta: Meta = {
  title: 'Foundations/Motion Primitives',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj

// ── 1. MotionFade ──

function FadeDemo() {
  const [show, setShow] = React.useState(true)
  return (
    <div className="flex flex-col items-start gap-ds-05">
      <ToggleButton on={show} onClick={() => setShow((s) => !s)} />
      <MotionFade show={show}>
        <Box>Fade in / out</Box>
      </MotionFade>
    </div>
  )
}

export const Fade: Story = {
  name: 'MotionFade',
  render: () => <FadeDemo />,
}

// ── 2. MotionScale ──

function ScaleDemo() {
  const [show, setShow] = React.useState(true)
  return (
    <div className="flex flex-col items-start gap-ds-05">
      <ToggleButton on={show} onClick={() => setShow((s) => !s)} />
      <MotionScale show={show}>
        <Box color="bg-success">Scale + Fade</Box>
      </MotionScale>
    </div>
  )
}

export const Scale: Story = {
  name: 'MotionScale',
  render: () => <ScaleDemo />,
}

// ── 3. MotionPop ──

function PopDemo() {
  const [show, setShow] = React.useState(true)
  return (
    <div className="flex flex-col items-start gap-ds-05">
      <ToggleButton on={show} onClick={() => setShow((s) => !s)} />
      <MotionPop show={show}>
        <Box color="bg-warning">Bouncy Pop!</Box>
      </MotionPop>
      <p className="text-ds-xs text-surface-fg-muted">
        Uses the <code>bouncy</code> spring preset — watch for the overshoot.
      </p>
    </div>
  )
}

export const Pop: Story = {
  name: 'MotionPop',
  render: () => <PopDemo />,
}

// ── 4. MotionSlide ──

function SlideDemo() {
  const [show, setShow] = React.useState(true)
  const [direction, setDirection] = React.useState<'up' | 'down' | 'left' | 'right'>('up')

  return (
    <div className="flex flex-col items-start gap-ds-05">
      <div className="flex items-center gap-ds-04">
        <ToggleButton on={show} onClick={() => setShow((s) => !s)} />
        <div className="flex gap-ds-02" role="radiogroup" aria-label="Slide direction">
          {(['up', 'down', 'left', 'right'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              role="radio"
              aria-checked={direction === dir}
              onClick={() => setDirection(dir)}
              className={`rounded-ds-sm px-ds-03 py-ds-01 text-ds-xs font-medium transition-colors ${
                direction === dir
                  ? 'bg-accent-9 text-accent-fg'
                  : 'bg-surface-2 text-surface-fg hover:bg-surface-3'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
      <MotionSlide show={show} direction={direction}>
        <Box color="bg-error">Slide from {direction}</Box>
      </MotionSlide>
    </div>
  )
}

export const Slide: Story = {
  name: 'MotionSlide',
  render: () => <SlideDemo />,
}

// ── 5. MotionCollapse ──

function CollapseDemo() {
  const [show, setShow] = React.useState(true)
  return (
    <div className="flex flex-col items-start gap-ds-05" style={{ maxWidth: 400 }}>
      <ToggleButton on={show} onClick={() => setShow((s) => !s)} label={show ? 'Collapse' : 'Expand'} />
      <MotionCollapse show={show}>
        <div className="rounded-ds-md border border-surface-border-strong p-ds-05">
          <p className="text-ds-sm text-surface-fg">
            This content smoothly expands and collapses using Framer Motion&apos;s native{' '}
            <code>height: &quot;auto&quot;</code> animation. The <code>gentle</code> spring preset is used by
            default, giving the height change a natural, organic feel without any harsh jumps.
          </p>
        </div>
      </MotionCollapse>
    </div>
  )
}

export const Collapse: Story = {
  name: 'MotionCollapse',
  render: () => <CollapseDemo />,
}

// ── 6. MotionStagger + MotionStaggerItem ──

function StaggerDemo() {
  const [key, setKey] = React.useState(0)
  const items = ['Design tokens defined', 'Components built', 'Stories written', 'Tests passing', 'Docs shipped']

  return (
    <div className="flex flex-col items-start gap-ds-05">
      <ToggleButton on={false} onClick={() => setKey((k) => k + 1)} label="Replay stagger" />
      <MotionStagger key={key} className="flex flex-col gap-ds-03" style={{ maxWidth: 300 }}>
        {items.map((item, i) => (
          <MotionStaggerItem key={i}>
            <div className="rounded-ds-md bg-surface-2 p-ds-04 text-ds-sm text-surface-fg">
              {i + 1}. {item}
            </div>
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </div>
  )
}

export const Stagger: Story = {
  name: 'MotionStagger + MotionStaggerItem',
  render: () => <StaggerDemo />,
}

// ── 7. SpringPresets ──

function SpringPresetsDemo() {
  const [key, setKey] = React.useState(0)
  const presets = Object.keys(springs) as Array<keyof typeof springs>

  return (
    <div className="flex flex-col items-start gap-ds-06">
      <ToggleButton on={false} onClick={() => setKey((k) => k + 1)} label="Replay all" />
      <div className="grid grid-cols-4 gap-ds-05" style={{ width: '100%', maxWidth: 600 }}>
        {presets.map((preset) => (
          <div key={preset} className="flex flex-col items-center gap-ds-03">
            <span className="text-ds-xs font-semibold text-surface-fg-muted">{preset}</span>
            <MotionScale key={`${preset}-${key}`} show preset={preset}>
              <div className="h-16 w-16 rounded-ds-md bg-accent-9" />
            </MotionScale>
          </div>
        ))}
      </div>
      <p className="text-ds-xs text-surface-fg-muted">
        All four spring presets animating simultaneously. Click &quot;Replay all&quot; to re-trigger.
      </p>
    </div>
  )
}

export const SpringPresets: Story = {
  name: 'Spring Presets Comparison',
  render: () => <SpringPresetsDemo />,
}

// ── 8. ReducedMotion ──

function ReducedMotionDemo() {
  const [show, setShow] = React.useState(true)

  return (
    <MotionProvider reducedMotion={true}>
      <div className="flex flex-col items-start gap-ds-05">
        <div className="rounded-ds-md border border-warning-7 bg-warning-3 px-ds-04 py-ds-02 text-ds-xs text-surface-fg">
          <code>reducedMotion=true</code> — all animations are instant
        </div>
        <ToggleButton on={show} onClick={() => setShow((s) => !s)} />
        <div className="flex gap-ds-05">
          <MotionPop show={show}>
            <Box>Pop</Box>
          </MotionPop>
          <MotionSlide show={show} direction="left">
            <Box color="bg-success">Slide</Box>
          </MotionSlide>
          <MotionScale show={show}>
            <Box color="bg-warning">Scale</Box>
          </MotionScale>
        </div>
        <p className="text-ds-xs text-surface-fg-muted" style={{ maxWidth: 400 }}>
          Wrapped in <code>&lt;MotionProvider reducedMotion=&#123;true&#125;&gt;</code>.
          Framer Motion&apos;s <code>MotionConfig</code> disables all spring/tween transitions,
          making enter/exit appear instantly.
        </p>
      </div>
    </MotionProvider>
  )
}

export const ReducedMotion: Story = {
  name: 'Reduced Motion',
  render: () => <ReducedMotionDemo />,
}
