'use client'

import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconBolt,
  IconCheck,
  IconStar,
} from '@tabler/icons-react'
import { AnimatePresence, motion, type Transition, useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { IconProvider } from './icon-context'
import type { IconInput } from './lib/icon-input'
import { springs, tweens } from './lib/motion'
import { normalizeIcon } from './lib/normalize-icon'
import { cn } from './lib/utils'

export type FlashTone = 'success' | 'error' | 'warning' | 'info' | 'accent'

/** Named entrance states. Each maps to a tone + glyph. */
export type FlashPreset = 'up' | 'down' | 'goal' | 'record' | 'alert' | 'live'

/** Explicit flash: any tone + any glyph. */
export interface FlashSpec {
  tone: FlashTone
  icon: IconInput
}

const FLASH_PRESETS: Record<FlashPreset, { tone: FlashTone; Glyph: React.ComponentType }> = {
  up: { tone: 'success', Glyph: IconArrowUp },
  down: { tone: 'error', Glyph: IconArrowDown },
  goal: { tone: 'success', Glyph: IconCheck },
  record: { tone: 'accent', Glyph: IconStar },
  alert: { tone: 'warning', Glyph: IconAlertTriangle },
  live: { tone: 'info', Glyph: IconBolt },
}

const toneBg: Record<FlashTone, string> = {
  success: 'bg-success-9',
  error: 'bg-error-9',
  warning: 'bg-warning-9',
  info: 'bg-info-9',
  accent: 'bg-accent-9',
}

const toneFg: Record<FlashTone, string> = {
  success: 'text-success-fg',
  error: 'text-error-fg',
  warning: 'text-warning-fg',
  info: 'text-info-fg',
  accent: 'text-accent-fg',
}

/** Composable speed — coarse presets built from the DS motion tokens. */
export type FlashSpeed = 'fast' | 'normal' | 'slow'

const SPEEDS: Record<FlashSpeed, { holdMs: number; settle: Transition; fade: Transition }> = {
  fast: { holdMs: 450, settle: springs.snappy, fade: tweens.fade },
  normal: { holdMs: 650, settle: springs.snappy, fade: tweens.fade },
  slow: { holdMs: 950, settle: springs.gentle, fade: tweens.elegant },
}

export interface StatFlashProps {
  /** Settled identity glyph, shown after the flash resolves. */
  icon: IconInput
  /** The entrance flash — a named preset or an explicit `{ tone, icon }`. */
  flash: FlashPreset | FlashSpec
  /** Resting chip style once settled. @default 'soft' */
  fill?: 'soft' | 'solid'
  /** Coarse speed preset (hold + settle + fade), built from DS motion tokens. @default 'normal' */
  speed?: FlashSpeed
  /** Override how long the flash holds before settling, in ms. Wins over `speed`. */
  holdMs?: number
  /** Override the settle (icon scale-in) transition. Wins over `speed`. */
  settleTransition?: Transition
  /** Override the flash enter/exit fade transition. Wins over `speed`. */
  flashTransition?: Transition
}

/**
 * StatFlash — a chip that mounts showing a transient **state** (a toned glyph: an up-arrow on
 * green, a check, an alert…) then settles into the metric's stable **identity** icon. The pattern
 * is *state → identity*: communicate what just happened, then resolve to what the metric is.
 *
 * Used by `StatCard` via its `flash` prop, but standalone too (list rows, badges, toasts).
 * Honors `prefers-reduced-motion` — renders the settled identity directly, no flash.
 *
 * @example
 * <StatFlash icon={<IconFolder />} flash="up" />          // green up-arrow → folder
 * <StatFlash icon={<IconBolt />} flash={{ tone: 'info', icon: <IconActivity /> }} />
 */
export function StatFlash({
  icon,
  flash,
  fill = 'soft',
  speed = 'normal',
  holdMs,
  settleTransition,
  flashTransition,
}: StatFlashProps) {
  const prefersReduced = useReducedMotion()
  const preset = SPEEDS[speed]
  const hold = holdMs ?? preset.holdMs
  const settleT = settleTransition ?? preset.settle
  const fadeT = flashTransition ?? preset.fade

  const resolved =
    typeof flash === 'string'
      ? { tone: FLASH_PRESETS[flash].tone, icon: <FlashPresetGlyph preset={flash} /> }
      : flash

  const [settled, setSettled] = React.useState(false)

  React.useEffect(() => {
    if (prefersReduced) {
      setSettled(true)
      return
    }
    const t = setTimeout(() => setSettled(true), hold)
    return () => clearTimeout(t)
  }, [prefersReduced, hold])

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-control p-ds-02',
        fill === 'solid' ? 'bg-accent-9 text-accent-fg' : 'bg-accent-3 text-accent-11',
      )}
      aria-hidden="true"
    >
      <motion.span
        className="inline-flex"
        initial={prefersReduced ? false : { opacity: 0, scale: 0.55 }}
        animate={{ opacity: settled ? 1 : 0, scale: settled ? 1 : 0.55 }}
        transition={settleT}
      >
        <IconProvider size="md">{normalizeIcon(icon, 'md')}</IconProvider>
      </motion.span>
      <AnimatePresence>
        {!settled && (
          <motion.span
            className={cn(
              'absolute inset-0 inline-flex items-center justify-center',
              toneBg[resolved.tone],
              toneFg[resolved.tone],
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeT}
          >
            <IconProvider size="md">{normalizeIcon(resolved.icon, 'md')}</IconProvider>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

function FlashPresetGlyph({ preset }: { preset: FlashPreset }) {
  const { Glyph } = FLASH_PRESETS[preset]
  return <Glyph />
}

StatFlash.displayName = 'StatFlash'
