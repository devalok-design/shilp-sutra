'use client'

import { EmojiPicker as Frimousse } from 'frimousse'
import * as React from 'react'

import { cn } from '../ui/lib/utils'
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

/**
 * @deprecated Emoji art styles (apple/google/twitter/facebook) were removed in
 * the frimousse migration — the picker is native-only. Retained for source
 * compatibility; the `set` prop is now a no-op.
 */
export type EmojiSet = 'native' | 'apple' | 'google' | 'twitter' | 'facebook'

export interface EmojiPickerProps {
  onSelect: (emoji: EmojiData) => void
  /** @deprecated no-op — the picker renders native emoji only. */
  set?: EmojiSet
  /** @deprecated no-op — theme follows the surrounding `.dark` class via tokens. */
  theme?: 'auto' | 'light' | 'dark'
  /** @deprecated no-op — removed with the emoji-mart → frimousse migration. */
  previewPosition?: 'top' | 'bottom' | 'none'
  /** @deprecated no-op — removed with the emoji-mart → frimousse migration. */
  skinTonePosition?: 'search' | 'preview' | 'none'
  /**
   * Base URL the emoji dataset is fetched from (`${emojibaseUrl}/${locale}/data.json`).
   * Defaults to frimousse's jsdelivr CDN. Point it at a self-hosted copy of the
   * `emojibase-data` package to remove the runtime CDN dependency (CSP / offline /
   * air-gapped) — e.g. copy `node_modules/emojibase-data` into `public/emojibase`
   * and pass `emojibaseUrl="/emojibase"`.
   */
  emojibaseUrl?: string
  className?: string
}

export interface EmojiPickerPopoverProps extends EmojiPickerProps {
  children: React.ReactNode
  /** @default 'start' */
  align?: 'start' | 'center' | 'end'
}

// frimousse emits `{ emoji: nativeChar, label }`. Map to the DS EmojiData shape;
// `id` is a kebab of the label (emojibase has no emoji-mart-style short id).
function toEmojiData(e: { emoji: string; label: string }): EmojiData {
  const id = e.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return { id, native: e.emoji }
}

// ============================================================
// EmojiPicker (frimousse, native-only)
// ============================================================

function EmojiPicker({ onSelect, emojibaseUrl, className }: EmojiPickerProps) {
  return (
    <Frimousse.Root
      onEmojiSelect={(e) => onSelect(toEmojiData(e))}
      emojibaseUrl={emojibaseUrl}
      className={cn(
        'isolate flex h-[435px] w-[352px] flex-col rounded-surface bg-surface-overlay text-surface-fg shadow-raised-hover',
        className,
      )}
    >
      <div className="p-ds-03">
        <Frimousse.Search
          placeholder="Search emoji…"
          className="w-full rounded-control bg-surface-panel px-ds-03 py-ds-02b text-body-sm text-surface-fg placeholder:text-surface-fg-subtle focus-ring"
        />
      </div>
      <Frimousse.Viewport className="relative flex-1 overflow-y-auto">
        <Frimousse.Loading className="absolute inset-0 flex items-center justify-center text-body-sm text-surface-fg-muted">
          Loading…
        </Frimousse.Loading>
        <Frimousse.Empty className="absolute inset-0 flex items-center justify-center text-body-sm text-surface-fg-muted">
          No emoji found.
        </Frimousse.Empty>
        <Frimousse.List
          className="select-none pb-ds-02"
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                className="bg-surface-overlay px-ds-03 pb-ds-01 pt-ds-03 text-caption font-medium text-surface-fg-muted"
                {...props}
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div className="flex" {...props}>
                {children}
              </div>
            ),
            // Width is the frimousse column width (viewport ÷ --frimousse-list-columns)
            // so a full row spans edge-to-edge — no fixed size, no right-hand gutter.
            Emoji: ({ emoji, ...props }) => (
              <button
                type="button"
                className={cn(
                  'flex aspect-square w-[calc(100%/var(--frimousse-list-columns))] items-center justify-center rounded-control text-[1.375rem] leading-none',
                  'hover:bg-surface-panel-hover',
                  emoji.isActive && 'bg-surface-panel',
                )}
                {...props}
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </Frimousse.Viewport>
      <div className="flex items-center justify-between gap-ds-02 border-t border-surface-border-subtle p-ds-02">
        <Frimousse.ActiveEmoji>
          {({ emoji }) =>
            emoji ? (
              <span className="flex min-w-0 items-center gap-ds-02 text-body-sm text-surface-fg-muted">
                <span className="text-[1.375rem] leading-none">{emoji.emoji}</span>
                <span className="truncate">{emoji.label}</span>
              </span>
            ) : (
              <span className="text-body-sm text-surface-fg-subtle">Pick an emoji…</span>
            )
          }
        </Frimousse.ActiveEmoji>
        <Frimousse.SkinToneSelector
          aria-label="Change skin tone"
          className="flex size-8 shrink-0 items-center justify-center rounded-control text-[1.25rem] leading-none hover:bg-surface-panel-hover focus-ring"
        />
      </div>
    </Frimousse.Root>
  )
}

// ============================================================
// EmojiPickerPopover
// ============================================================

function EmojiPickerPopover({
  children,
  align = 'start',
  onSelect,
  emojibaseUrl,
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
        <EmojiPicker onSelect={handleSelect} emojibaseUrl={emojibaseUrl} className={className} />
      </PopoverContent>
    </Popover>
  )
}

EmojiPicker.displayName = 'EmojiPicker'
EmojiPickerPopover.displayName = 'EmojiPickerPopover'

export { EmojiPicker, EmojiPickerPopover }
