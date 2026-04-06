'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { springs } from '../ui/lib/motion'
import { Skeleton } from '../ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'

// ============================================================
// Types
// ============================================================

export interface EmojiData {
  id: string
  native: string
  shortcodes?: string
}

export interface EmojiPickerProps {
  onSelect: (emoji: EmojiData) => void
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
  theme = 'auto',
  previewPosition = 'none',
  skinTonePosition = 'search',
  className,
}: EmojiPickerProps) {
  const [mounted, setMounted] = React.useState(false)
  const [data, setData] = React.useState<unknown>(null)

  React.useEffect(() => {
    setMounted(true)
    import('@emoji-mart/data').then((mod) => {
      setData(mod.default)
    })
  }, [])

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
          className={cn('rounded-ds-lg', className)}
        >
          <Skeleton className="h-[435px] w-[352px] rounded-ds-lg" />
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
              <div className={cn('rounded-ds-lg', className)}>
                <Skeleton className="h-[435px] w-[352px] rounded-ds-lg" />
              </div>
            }
          >
            <LazyPicker
              data={data}
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
