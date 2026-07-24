'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  IconBolt,
  IconLink,
  IconLockOpen,
  IconSettings,
  IconShield,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

/**
 * Decorative brand flourish: real shilp-sutra components (Switch, Avatar) plus a
 * few dark icon tiles, spaced evenly around a ring that orbits slowly and
 * continuously. Each item counter-rotates so it stays upright while the cluster
 * turns — the components orbit, they don't spin. A few of the switches quietly
 * flip off-and-back on a stagger, for a "someone's tuning settings" feel.
 *
 * Purely decorative — the whole thing is aria-hidden and non-interactive.
 * Recreates Figma 56-25874 (Shilp Sutra | Visual Identity).
 *
 * Reduced motion: rotation is frozen and the switch-flipping stops.
 */

type TablerIcon = ComponentType<{ size?: number | string; stroke?: number | string; className?: string }>

type OrbitItem =
  | { kind: 'switch'; id: string; tint: string }
  | { kind: 'avatar'; id: string; initials: string; face: string }
  | { kind: 'tile'; id: string; icon: TablerIcon }

// Soft pastel avatar faces, matching the Figma palette.
const FACE_BLUE = 'bg-info-3 text-info-11'
const FACE_MINT = 'bg-category-teal-3 text-category-teal-11'

// ON-track tints per switch. `Switch` defaults to accent; className wins via
// tailwind-merge, so these override the checked-track background.
const TINT_BLUE = 'data-[state=checked]:bg-info-9'
const TINT_TEAL = 'data-[state=checked]:bg-category-teal-9'
const TINT_AMBER = 'data-[state=checked]:bg-category-amber-9'
const TINT_BRAND = 'data-[state=checked]:bg-accent-9'

// Clockwise from 12 o'clock. 14 items → evenly spaced ~25.7° apart.
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

// Ring geometry + timing.
const RADIUS = 43 // % of half-container, from center
const SPIN_SECONDS = 52 // full 360° revolution
const FLIP_EVERY = 2600 // ms between staggered switch flips
const FLIP_HOLD = 1300 // ms a flipped switch stays off before flipping back

const spin = {
  duration: SPIN_SECONDS,
  ease: 'linear' as const,
  repeat: Infinity,
}

export function BrandOrbit() {
  const reduce = useReducedMotion()
  // flipped[id] === true → that switch is momentarily OFF. Default: all ON.
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (reduce) return
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const interval = setInterval(() => {
      const id = SWITCH_IDS[Math.floor(Math.random() * SWITCH_IDS.length)]
      setFlipped((prev) => ({ ...prev, [id]: true }))
      const restore = setTimeout(() => {
        setFlipped((prev) => ({ ...prev, [id]: false }))
      }, FLIP_HOLD)
      timeouts.push(restore)
    }, FLIP_EVERY)
    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [reduce])

  return (
    <div
      aria-hidden
      className="pointer-events-none relative mx-auto aspect-square w-full max-w-[540px] select-none"
    >
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : spin}
      >
        {ITEMS.map((item, i) => {
          const angle = (i / ITEMS.length) * Math.PI * 2 - Math.PI / 2
          const left = 50 + RADIUS * Math.cos(angle)
          const top = 50 + RADIUS * Math.sin(angle)
          return (
            <motion.div
              key={item.id}
              className="absolute"
              // x/y centre the item on its orbit point; framer owns the
              // transform, so rotate composes with the -50% offset rather than
              // clobbering a Tailwind translate class.
              style={{ left: `${left}%`, top: `${top}%`, x: '-50%', y: '-50%' }}
              animate={reduce ? undefined : { rotate: -360 }}
              transition={reduce ? undefined : spin}
            >
              {renderItem(item, !flipped[item.id])}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

function renderItem(item: OrbitItem, checked: boolean) {
  if (item.kind === 'switch') {
    return (
      <Switch
        size="lg"
        checked={checked}
        onCheckedChange={() => {}}
        tabIndex={-1}
        className={item.tint}
      />
    )
  }
  if (item.kind === 'avatar') {
    return (
      <Avatar size="lg" className="shadow-raised">
        <AvatarFallback className={item.face}>{item.initials}</AvatarFallback>
      </Avatar>
    )
  }
  const Glyph = item.icon
  // Ink chip — DS tokens, theme-aware. `surface-fg` is near-black in light /
  // near-white in dark; `surface-1` is its inverse, so the glyph always reads.
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-surface bg-surface-fg text-surface-1 shadow-overlay ring-1 ring-surface-1/10">
      <Glyph size={24} stroke={2} />
    </div>
  )
}
