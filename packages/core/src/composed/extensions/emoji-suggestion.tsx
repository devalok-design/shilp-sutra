import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { cn } from '../../ui/lib/utils'

// emoji-mart data shape (only what we need)
interface EmojiMartData {
  emojis: Record<string, {
    id: string
    name: string
    skins: Array<{ native: string }>
  }>
}

export interface EmojiSuggestionItem {
  id: string
  name: string
  native: string
}

let emojiList: EmojiSuggestionItem[] | null = null

async function getEmojiList(): Promise<EmojiSuggestionItem[]> {
  if (emojiList) return emojiList
  // Dynamic import to avoid bundling emoji data when not used
  const mod = await import('@emoji-mart/data')
  const data: EmojiMartData = mod.default ?? mod
  emojiList = Object.values(data.emojis).map((e) => ({
    id: e.id,
    name: e.name,
    native: e.skins[0]?.native ?? '',
  }))
  return emojiList
}

interface EmojiListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface EmojiListProps {
  items: EmojiSuggestionItem[]
  command: (item: EmojiSuggestionItem) => void
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
      <div role="listbox" aria-label="Emoji suggestions" className="z-popover max-h-[200px] overflow-x-hidden overflow-y-auto rounded-ds-md border border-border bg-layer-01 shadow-02">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-ds-03 px-ds-04 py-ds-02b text-left text-ds-sm',
              index === selectedIndex ? 'bg-layer-02 text-text-primary' : 'text-text-secondary hover:bg-layer-02',
            )}
          >
            <span className="text-ds-base">{item.native}</span>
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
      onStart: (props: SuggestionProps<EmojiSuggestionItem>) => {
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
            items={props.items as EmojiSuggestionItem[]}
            command={(item) => props.command(item)}
          />,
        )
      },

      onUpdate: (props: SuggestionProps<EmojiSuggestionItem>) => {
        if (!root || !container) return

        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }

        root.render(
          <EmojiList
            ref={(r) => { componentRef = r }}
            items={props.items as EmojiSuggestionItem[]}
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

export const EmojiSuggestion = Extension.create({
  name: 'emojiSuggestion',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: ':',
        items: async ({ query }) => {
          const list = await getEmojiList()
          if (!query) return list.slice(0, 8)
          return list
            .filter((e) =>
              e.id.includes(query.toLowerCase()) ||
              e.name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 8)
        },
        command: ({ editor, range, props: item }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent((item as EmojiSuggestionItem).native)
            .run()
        },
        render: createEmojiSuggestionRenderer(),
      }),
    ]
  },
})
