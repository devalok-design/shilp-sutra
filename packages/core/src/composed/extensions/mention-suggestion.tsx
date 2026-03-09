import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { cn } from '../../ui/lib/utils'
import type { MentionItem } from '../rich-text-editor'

interface MentionListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface MentionListProps {
  items: MentionItem[]
  command: (item: MentionItem) => void
}

const MentionList = React.forwardRef<MentionListRef, MentionListProps>(
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
      <div role="listbox" aria-label="Mention suggestions" className="z-popover overflow-hidden rounded-ds-md border border-border bg-layer-01 shadow-02">
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
            {item.avatar ? (
              <img src={item.avatar} alt="" className="h-ico-md w-ico-md rounded-ds-full object-cover" />
            ) : (
              <span className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-interactive/10 text-[10px] font-semibold text-interactive">
                {item.label.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    )
  },
)
MentionList.displayName = 'MentionList'

export function createSuggestionRenderer() {
  return () => {
    let root: Root | null = null
    let container: HTMLDivElement | null = null
    let componentRef: MentionListRef | null = null

    return {
      onStart: (props: SuggestionProps<MentionItem>) => {
        container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.zIndex = '1400' // z-popover

        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }
        document.body.appendChild(container)

        root = createRoot(container)
        root.render(
          <MentionList
            ref={(r) => { componentRef = r }}
            items={props.items as MentionItem[]}
            command={(item) => props.command({ id: item.id, label: item.label })}
          />,
        )
      },

      onUpdate: (props: SuggestionProps<MentionItem>) => {
        if (!root || !container) return

        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }

        root.render(
          <MentionList
            ref={(r) => { componentRef = r }}
            items={props.items as MentionItem[]}
            command={(item) => props.command({ id: item.id, label: item.label })}
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
