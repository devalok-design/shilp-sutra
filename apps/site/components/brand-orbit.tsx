'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IconBolt, IconLink, IconLockOpen, IconSettings, IconShield } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

/**
 * "120+ components" flourish. Three layers:
 *   1. A background conveyor — faded component-name chips scrolling like a belt,
 *      to show the breadth of the library.
 *   2. A slow orbit of real DS components (Switch, Avatar) + ink tiles that
 *      counter-rotate to stay upright. Switches flip and items pulse on a slow,
 *      randomised cadence (not a metronome).
 *   3. A centred "120+ / components" plate.
 *
 * Decorative: aria-hidden, non-interactive. Reduced motion freezes everything.
 */

type TablerIcon = ComponentType<{ size?: number | string; stroke?: number | string; className?: string }>

type OrbitItem =
  | { kind: 'switch'; id: string; tint: string }
  | { kind: 'avatar'; id: string; initials: string; face: string }
  | { kind: 'tile'; id: string; icon: TablerIcon }

const FACE_BLUE = 'bg-info-3 text-info-11'
const FACE_MINT = 'bg-category-teal-3 text-category-teal-11'
const TINT_BLUE = 'data-[state=checked]:bg-info-9'
const TINT_TEAL = 'data-[state=checked]:bg-category-teal-9'
const TINT_AMBER = 'data-[state=checked]:bg-category-amber-9'
const TINT_BRAND = 'data-[state=checked]:bg-accent-9'

const ITEMS: OrbitItem[] = [
  { kind: 'switch', id: 'sw-blue-1', tint: TINT_BLUE },
  { kind: 'avatar', id: 'av-gp', initials: 'GP', face: FACE_BLUE },
  { kind: 'tile', id: 'ti-bolt', icon: IconBolt },
  { kind: 'switch', id: 'sw-amber', tint: TINT_AMBER },
  { kind: 'tile', id: 'ti-shield', icon: IconShield },
  { kind: 'switch', id: 'sw-teal-1', tint: TINT_TEAL },
  { kind: 'avatar', id: 'av-ki', initials: 'KI', face: FACE_MINT },
  { kind: 'tile', id: 'ti-lock', icon: IconLockOpen },
  { kind: 'switch', id: 'sw-blue-2', tint: TINT_BLUE },
  { kind: 'avatar', id: 'av-am', initials: 'AM', face: FACE_BLUE },
  { kind: 'tile', id: 'ti-link', icon: IconLink },
  { kind: 'switch', id: 'sw-brand', tint: TINT_BRAND },
  { kind: 'avatar', id: 'av-ml', initials: 'ML', face: FACE_MINT },
  { kind: 'tile', id: 'ti-gear', icon: IconSettings },
]

const SWITCH_IDS = ITEMS.filter((i) => i.kind === 'switch').map((i) => i.id)
const ALL_IDS = ITEMS.map((i) => i.id)

// Ring geometry + timing (slow + calm).
const RADIUS = 43
const SPIN_SECONDS = 66
const spin = { duration: SPIN_SECONDS, ease: 'linear' as const, repeat: Infinity }

// Background conveyor — a spread of real component names, three rows.
const COMPONENT_ROWS = [
  ['Button', 'Card', 'Input', 'Select', 'Combobox', 'Dialog', 'Sheet', 'Drawer', 'Tabs', 'Accordion', 'Table', 'DataTable', 'Toast', 'Tooltip', 'Popover'],
  ['Badge', 'Avatar', 'Switch', 'Slider', 'Checkbox', 'Radio', 'Progress', 'Skeleton', 'Breadcrumb', 'Pagination', 'Stepper', 'Calendar', 'Command', 'Menu', 'Alert'],
  ['Chip', 'Rating', 'Timeline', 'Color Input', 'File Upload', 'Empty State', 'Code Block', 'Kbd', 'Separator', 'Hover Card', 'Tree View', 'Segmented', 'Stat Card', 'Textarea', 'Toggle'],
]

export function BrandOrbit() {
  const reduce = useReducedMotion()
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [pulsed, setPulsed] = useState<Record<string, boolean>>({})

  // Slow, randomised switch flips.
  useEffect(() => {
    if (reduce) return
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const tick = () => {
      const id = SWITCH_IDS[Math.floor(Math.random() * SWITCH_IDS.length)]
      setFlipped((p) => ({ ...p, [id]: true }))
      timeouts.push(setTimeout(() => setFlipped((p) => ({ ...p, [id]: false })), 900 + Math.random() * 1600))
      timeouts.push(setTimeout(tick, 3200 + Math.random() * 3600))
    }
    const start = setTimeout(tick, 1500)
    return () => {
      clearTimeout(start)
      timeouts.forEach(clearTimeout)
    }
  }, [reduce])

  // Occasional pulse on any item (avatars/tiles animate too, not just switches).
  useEffect(() => {
    if (reduce) return
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const tick = () => {
      const id = ALL_IDS[Math.floor(Math.random() * ALL_IDS.length)]
      setPulsed((p) => ({ ...p, [id]: true }))
      timeouts.push(setTimeout(() => setPulsed((p) => ({ ...p, [id]: false })), 520))
      timeouts.push(setTimeout(tick, 2600 + Math.random() * 3200))
    }
    const start = setTimeout(tick, 2600)
    return () => {
      clearTimeout(start)
      timeouts.forEach(clearTimeout)
    }
  }, [reduce])

  return (
    <div aria-hidden className="pointer-events-none relative isolate select-none overflow-hidden py-ds-06">
      {/* Layer 1 — conveyor. overflow-hidden on BOTH this root and the row
          container so the w-max belts never widen the page (mobile h-scroll). */}
      <div className="absolute inset-0 flex flex-col justify-center gap-ds-05 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
        {COMPONENT_ROWS.map((row, i) => (
          <ConveyorRow key={i} items={row} duration={54 + i * 12} reverse={i % 2 === 1} reduce={!!reduce} />
        ))}
      </div>

      {/* Layer 2 + 3 — orbit + centre plate */}
      <div className="relative mx-auto aspect-square w-full max-w-[520px]">
        <motion.div className="absolute inset-0" animate={reduce ? undefined : { rotate: 360 }} transition={reduce ? undefined : spin}>
          {ITEMS.map((item, i) => {
            const angle = (i / ITEMS.length) * Math.PI * 2 - Math.PI / 2
            const left = 50 + RADIUS * Math.cos(angle)
            const top = 50 + RADIUS * Math.sin(angle)
            return (
              <motion.div
                key={item.id}
                className="absolute"
                style={{ left: `${left}%`, top: `${top}%`, x: '-50%', y: '-50%' }}
                animate={reduce ? undefined : { rotate: -360 }}
                transition={reduce ? undefined : spin}
              >
                <motion.div
                  animate={{ scale: pulsed[item.id] ? 1.14 : 1 }}
                  transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
                >
                  {renderItem(item, !flipped[item.id])}
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Centre plate */}
        <div className="absolute left-1/2 top-1/2 flex h-[9.5rem] w-[9.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-surface-border-subtle bg-surface-base/85 text-center shadow-raised backdrop-blur-sm">
          <span className="font-display text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-none text-surface-fg">
            120+
          </span>
          <span className="mt-ds-01 text-ds-sm text-surface-fg-muted">components</span>
        </div>
      </div>
    </div>
  )
}

function ConveyorRow({
  items,
  duration,
  reverse,
  reduce,
}: {
  items: string[]
  duration: number
  reverse: boolean
  reduce: boolean
}) {
  const doubled = useMemo(() => [...items, ...items], [items])
  return (
    <div className="flex w-max opacity-[0.55]">
      <motion.div
        className="flex gap-ds-03 pr-ds-03"
        animate={reduce ? undefined : { x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={reduce ? undefined : { duration, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap rounded-pill border border-surface-border-subtle bg-surface-raised px-ds-04 py-ds-02 text-ds-xs text-surface-fg-subtle"
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function renderItem(item: OrbitItem, checked: boolean) {
  if (item.kind === 'switch') {
    return <Switch size="lg" checked={checked} onCheckedChange={() => {}} tabIndex={-1} className={item.tint} />
  }
  if (item.kind === 'avatar') {
    return (
      <Avatar size="lg" className="shadow-raised">
        <AvatarFallback className={item.face}>{item.initials}</AvatarFallback>
      </Avatar>
    )
  }
  const Glyph = item.icon
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-surface bg-surface-fg text-surface-base shadow-overlay ring-1 ring-surface-base/10">
      <Glyph size={24} stroke={2} />
    </div>
  )
}
