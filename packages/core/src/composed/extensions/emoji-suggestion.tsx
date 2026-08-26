import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionKeyDownProps,type SuggestionProps } from '@tiptap/suggestion'
import { PluginKey } from '@tiptap/pm/state'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { cn } from '../../ui/lib/utils'
import { loadEmojiData, type ResolvedEmoji, searchEmoji } from './emoji-data'

// Re-export for external consumers
export type { ResolvedEmoji as EmojiSuggestionItem }

// Native-only since the frimousse migration.
function EmojiImage({ emoji, size = '1.2em' }: { emoji: ResolvedEmoji; size?: string }) {
  return <span style={{ fontSize: size }}>{emoji.native}</span>
}

interface EmojiListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface EmojiListProps {
  items: ResolvedEmoji[]
  command: (item: ResolvedEmoji) => void
}

const EmojiList = React.forwardRef<EmojiListRef, EmojiListProps>(
  ({ items, command }, ref) => {
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
      <div role="listbox" aria-label="Emoji suggestions" className="z-popover max-h-[200px] overflow-x-hidden overflow-y-auto rounded-control bg-surface-overlay shadow-raised-hover">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left text-body-sm',
              index === selectedIndex ? 'bg-surface-panel text-surface-fg' : 'text-surface-fg-muted hover:bg-surface-panel-hover',
            )}
          >
            <EmojiImage emoji={item} size="1.25em" />
            <span className="truncate">:{item.id}:</span>
          </button>
        ))}
      </div>
    )
  },
)
EmojiList.displayName = 'EmojiList'

function createEmojiSuggestionRenderer() {
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

/** Factory: returns the configured `:shortcode:` emoji suggestion extension. */
export function createEmojiSuggestion() {
  return Extension.create({
    name: 'emojiSuggestion',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          pluginKey: new PluginKey('emojiSuggestion'),
          editor: this.editor,
          char: ':',
          items: async ({ query }) => {
            const data = await loadEmojiData()
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
                attrs: { id: emoji.id, native: emoji.native },
              })
              .run()
          },
          render: createEmojiSuggestionRenderer(),
        }),
      ]
    },
  })
}
