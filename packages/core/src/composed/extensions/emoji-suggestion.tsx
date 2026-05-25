import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionKeyDownProps,type SuggestionProps } from '@tiptap/suggestion'
import { PluginKey } from 'prosemirror-state'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { cn } from '../../ui/lib/utils'
import { loadEmojiData, type ResolvedEmoji, searchEmoji, SHEET_COLS, SHEET_ROWS,SPRITESHEET_URL } from './emoji-data'

// Re-export for external consumers
export type { ResolvedEmoji as EmojiSuggestionItem }

function EmojiImage({ emoji, set, size = '1.2em' }: { emoji: ResolvedEmoji; set: string; size?: string }) {
  if (set === 'native') {
    return <span style={{ fontSize: size }}>{emoji.native}</span>
  }
  return (
    <span
      role="img"
      aria-label={emoji.native}
      className="inline-block"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${SPRITESHEET_URL(set)})`,
        backgroundSize: `${100 * SHEET_COLS}% ${100 * SHEET_ROWS}%`,
        backgroundPosition: `${(100 / (SHEET_COLS - 1)) * emoji.x}% ${(100 / (SHEET_ROWS - 1)) * emoji.y}%`,
      }}
    />
  )
}

interface EmojiListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface EmojiListProps {
  items: ResolvedEmoji[]
  set: string
  command: (item: ResolvedEmoji) => void
}

const EmojiList = React.forwardRef<EmojiListRef, EmojiListProps>(
  ({ items, set, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    React.useEffect(() => setSelectedIndex(0), [items])

    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          if (items[selectedIndex]) command(items[selectedIndex])
          return true
        }
        return false
      },
    }))

    if (!items.length) return null

    return (
      <div role="listbox" aria-label="Emoji suggestions" className="z-popover max-h-[200px] overflow-x-hidden overflow-y-auto rounded-control border border-surface-border-strong bg-surface-overlay shadow-raised-hover">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left text-ds-sm',
              index === selectedIndex ? 'bg-surface-raised text-surface-fg' : 'text-surface-fg-muted hover:bg-surface-raised',
            )}
          >
            <EmojiImage emoji={item} set={set} size="1.25em" />
            <span className="truncate">:{item.id}:</span>
          </button>
        ))}
      </div>
    )
  },
)
EmojiList.displayName = 'EmojiList'

function createEmojiSuggestionRenderer(set: string) {
  return () => {
    let root: Root | null = null
    let container: HTMLDivElement | null = null
    let componentRef: EmojiListRef | null = null

    return {
      onStart: (props: SuggestionProps<ResolvedEmoji>) => {
        container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.zIndex = '1400'
        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }
        document.body.appendChild(container)
        root = createRoot(container)
        root.render(
          <EmojiList
            ref={(r) => { componentRef = r }}
            items={props.items as ResolvedEmoji[]}
            set={set}
            command={(item) => props.command(item)}
          />,
        )
      },

      onUpdate: (props: SuggestionProps<ResolvedEmoji>) => {
        if (!root || !container) return
        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }
        root.render(
          <EmojiList
            ref={(r) => { componentRef = r }}
            items={props.items as ResolvedEmoji[]}
            set={set}
            command={(item) => props.command(item)}
          />,
        )
      },

      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          if (container) {
            root?.unmount()
            container.remove()
            container = null
            root = null
          }
          return true
        }
        return componentRef?.onKeyDown(props) ?? false
      },

      onExit: () => {
        if (container) {
          root?.unmount()
          container.remove()
          container = null
          root = null
        }
      },
    }
  }
}

/** Factory: call with the emoji set to get a configured extension. */
export function createEmojiSuggestion(set = 'native') {
  return Extension.create({
    name: 'emojiSuggestion',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          pluginKey: new PluginKey('emojiSuggestion'),
          editor: this.editor,
          char: ':',
          items: async ({ query }) => {
            const data = await loadEmojiData(set)
            return searchEmoji(data, query, 8)
          },
          command: ({ editor, range, props: item }) => {
            const emoji = item as ResolvedEmoji
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: 'emojiNode',
                attrs: { id: emoji.id, native: emoji.native, set, x: emoji.x, y: emoji.y },
              })
              .run()
          },
          render: createEmojiSuggestionRenderer(set),
        }),
      ]
    },
  })
}
