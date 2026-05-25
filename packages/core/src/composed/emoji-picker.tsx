'use client'

import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { springs } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Skeleton } from '../ui/skeleton'

// ============================================================
// Types
// ============================================================

export interface EmojiData {
  id: string
  native: string
  shortcodes?: string
}

export type EmojiSet = 'native' | 'apple' | 'google' | 'twitter' | 'facebook'

export interface EmojiPickerProps {
  onSelect: (emoji: EmojiData) => void
  /** Emoji art style. Set once — dynamic switching is not supported (emoji-mart limitation). @default 'native' */
  set?: EmojiSet
  /** @default 'auto' */
  theme?: 'auto' | 'light' | 'dark'
  /** @default 'none' */
  previewPosition?: 'top' | 'bottom' | 'none'
  /** @default 'search' */
  skinTonePosition?: 'search' | 'preview' | 'none'
  className?: string
}

export interface EmojiPickerPopoverProps extends EmojiPickerProps {
  children: React.ReactNode
  /** @default 'start' */
  align?: 'start' | 'center' | 'end'
}

// ============================================================
// Lazy-loaded picker
// ============================================================

const LazyPicker = React.lazy(() =>
  import('@emoji-mart/react').then((mod) => ({
    default: mod.default,
  })),
)

// emoji-mart caches data in a module-level singleton that is set once and never
// replaced.  Each set (apple, google, etc.) needs its own data file with
// spritesheet x/y coordinates.  The `set` prop should be treated as immutable
// configuration — dynamic switching within a single page is NOT supported.
export const emojiDataLoaders: Record<string, () => Promise<{ default: unknown }>> = {
  native: () => import('@emoji-mart/data'),
  apple: () => import('@emoji-mart/data/sets/15/apple.json'),
  google: () => import('@emoji-mart/data/sets/15/google.json'),
  twitter: () => import('@emoji-mart/data/sets/15/twitter.json'),
  facebook: () => import('@emoji-mart/data/sets/15/facebook.json'),
}

function resolveTheme(theme: 'auto' | 'light' | 'dark'): 'light' | 'dark' {
  if (theme !== 'auto') return theme
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

// ============================================================
// EmojiPicker
// ============================================================

function EmojiPicker({
  onSelect,
  set = 'native',
  theme = 'auto',
  previewPosition = 'none',
  skinTonePosition = 'search',
  className,
}: EmojiPickerProps) {
  const [mounted, setMounted] = React.useState(false)
  const [data, setData] = React.useState<unknown>(null)

  React.useEffect(() => {
    setMounted(true)
    const loader = emojiDataLoaders[set] ?? emojiDataLoaders.native
    loader().then((mod) => setData(mod.default))
  }, [set])

  const isReady = mounted && !!data

  return (
    <AnimatePresence mode="wait">
      {!isReady ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={springs.snappy}
          className={cn('rounded-surface', className)}
        >
          <Skeleton className="h-[435px] w-[352px] rounded-surface" />
        </motion.div>
      ) : (
        <motion.div
          key="picker"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.snappy}
          className={className}
        >
          <React.Suspense
            fallback={
              <div className={cn('rounded-surface', className)}>
                <Skeleton className="h-[435px] w-[352px] rounded-surface" />
              </div>
            }
          >
            <LazyPicker
              data={data}
              set={set}
              onEmojiSelect={onSelect}
              theme={resolveTheme(theme)}
              previewPosition={previewPosition}
              skinTonePosition={skinTonePosition}
            />
          </React.Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// EmojiPickerPopover
// ============================================================

function EmojiPickerPopover({
  children,
  align = 'start',
  onSelect,
  set,
  theme,
  previewPosition,
  skinTonePosition,
  className,
}: EmojiPickerPopoverProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (emoji: EmojiData) => {
    onSelect(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto border-none bg-transparent p-0 shadow-none"
        sideOffset={8}
      >
        <EmojiPicker
          onSelect={handleSelect}
          set={set}
          theme={theme}
          previewPosition={previewPosition}
          skinTonePosition={skinTonePosition}
          className={className}
        />
      </PopoverContent>
    </Popover>
  )
}

EmojiPicker.displayName = 'EmojiPicker'
EmojiPickerPopover.displayName = 'EmojiPickerPopover'

export { EmojiPicker, EmojiPickerPopover }
