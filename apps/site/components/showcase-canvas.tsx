'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

type CanvasMode = 'light' | 'dark'

/**
 * Showcase canvas — wraps the industry example in a brand-scoped, mode-
 * scoped panel. Always opens in light mode. The toggle button lives in the
 * canvas chrome and flips the local mode regardless of the page-level
 * theme (so a dark-mode visitor still sees light by default and can pick).
 *
 * Mechanism: the wrapper carries `.canvas-light` (or `.canvas-dark` + `.dark`)
 * which re-declares the ~180 design-system primitives at the subtree root,
 * overriding any inherited `.dark` ancestor.
 */
export function ShowcaseCanvas({
  brandStyle,
  productName,
  children,
}: {
  brandStyle: CSSProperties
  productName: string
  children: ReactNode
}) {
  const [mode, setMode] = useState<CanvasMode>('light')
  const next: CanvasMode = mode === 'light' ? 'dark' : 'light'

  return (
    <motion.div
      animate={{
        backgroundColor: 'var(--color-surface-raised)',
        borderColor: 'var(--color-surface-border)',
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={[
        mode === 'dark' ? 'canvas-dark dark' : 'canvas-light',
        'rounded-control border overflow-hidden',
      ].join(' ')}
      style={brandStyle}
    >
      <div className="flex items-center justify-between gap-ds-03 px-ds-05 py-ds-03 bg-surface-raised border-b border-surface-border-subtle">
        <Text variant="label-sm" className="text-surface-fg-subtle">
          {productName} · live preview
        </Text>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Switch canvas to ${next} mode`}
          onClick={() => setMode(next)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mode}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              {mode === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
            </motion.span>
          </AnimatePresence>
        </Button>
      </div>
      <motion.div
        animate={{ backgroundColor: 'var(--color-surface-base)' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="p-ds-06 lg:p-ds-08"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
