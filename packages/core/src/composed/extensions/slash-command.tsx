'use client'

import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionKeyDownProps,type SuggestionProps } from '@tiptap/suggestion'
import { PluginKey } from 'prosemirror-state'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { cn } from '../../ui/lib/utils'

export interface SlashCommand {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action: (editor: Editor) => void
}

export interface SlashCommandGroup {
  label: string
  commands: SlashCommand[]
}

// ── Flat item used for keyboard navigation index ────────────────────
interface FlatItem {
  command: SlashCommand
  groupIndex: number
}

interface SlashCommandListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface SlashCommandListProps {
  groups: SlashCommandGroup[]
  query: string
  command: (item: SlashCommand) => void
}

const SlashCommandList = React.forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ groups, query, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    // Flatten filtered groups into a single list for keyboard navigation
    const filtered = React.useMemo(() => {
      const q = query.toLowerCase()
      const flat: FlatItem[] = []
      groups.forEach((group, gi) => {
        group.commands.forEach((cmd) => {
          if (
            !q ||
            cmd.label.toLowerCase().includes(q) ||
            cmd.description?.toLowerCase().includes(q)
          ) {
            flat.push({ command: cmd, groupIndex: gi })
          }
        })
      })
      return flat
    }, [groups, query])

    React.useEffect(() => setSelectedIndex(0), [filtered])

    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + filtered.length - 1) % filtered.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % filtered.length)
          return true
        }
        if (event.key === 'Enter') {
          if (filtered[selectedIndex]) command(filtered[selectedIndex].command)
          return true
        }
        return false
      },
    }))

    if (!filtered.length) return null

    // Re-group filtered items for rendering with group headers
    const renderedGroups: { label: string; items: { command: SlashCommand; flatIndex: number }[] }[] = []
    let flatIndex = 0
    for (const item of filtered) {
      const groupLabel = groups[item.groupIndex].label
      let last = renderedGroups[renderedGroups.length - 1]
      if (!last || last.label !== groupLabel) {
        last = { label: groupLabel, items: [] }
        renderedGroups.push(last)
      }
      last.items.push({ command: item.command, flatIndex })
      flatIndex++
    }

    return (
      <div
        role="listbox"
        aria-label="Slash commands"
        className="z-popover max-h-[320px] min-w-[220px] overflow-x-hidden overflow-y-auto rounded-surface bg-surface-overlay p-ds-02 shadow-floating"
      >
        {renderedGroups.map((group, gi) => (
          <div key={group.label} role="group" aria-label={group.label}>
            {gi > 0 && <div className="my-ds-01 border-t border-surface-border" />}
            <div className="px-ds-03 py-ds-01 text-caption font-medium text-surface-fg-subtle">
              {group.label}
            </div>
            {group.items.map(({ command: cmd, flatIndex: fi }) => {
              const IconComp = cmd.icon
              return (
                <button
                  key={cmd.id}
                  type="button"
                  role="option"
                  aria-selected={fi === selectedIndex}
                  onClick={() => command(cmd)}
                  className={cn(
                    'flex w-full items-center gap-ds-03 rounded-control px-ds-03 py-ds-02 text-left cursor-pointer',
                    fi === selectedIndex
                      ? 'bg-surface-raised-hover'
                      : 'hover:bg-surface-raised-hover',
                  )}
                >
                  {IconComp && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-surface-fg-muted">
                      <IconComp className="h-4 w-4" />
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className="text-body-sm text-surface-fg">{cmd.label}</span>
                    {cmd.description && (
                      <span className="text-caption text-surface-fg-subtle">{cmd.description}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  },
)
SlashCommandList.displayName = 'SlashCommandList'

function createSlashCommandRenderer(groups: SlashCommandGroup[]) {
  return () => {
    let root: Root | null = null
    let container: HTMLDivElement | null = null
    let componentRef: SlashCommandListRef | null = null

    return {
      onStart: (props: SuggestionProps<SlashCommand>) => {
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
          <SlashCommandList
            ref={(r) => { componentRef = r }}
            groups={groups}
            query={props.query}
            command={(cmd) => props.command(cmd as any)}
          />,
        )
      },

      onUpdate: (props: SuggestionProps<SlashCommand>) => {
        if (!root || !container) return

        const rect = props.clientRect?.()
        if (rect) {
          container.style.left = `${rect.left}px`
          container.style.top = `${rect.bottom + 4}px`
        }

        root.render(
          <SlashCommandList
            ref={(r) => { componentRef = r }}
            groups={groups}
            query={props.query}
            command={(cmd) => props.command(cmd as any)}
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

/**
 * Creates a configured TipTap Extension for slash commands.
 *
 * Triggers on `/` at the start of a line, shows a grouped command palette,
 * and executes the selected command's action on the editor.
 *
 * @example
 * const slashExt = createSlashCommandExtension([
 *   {
 *     label: 'Format',
 *     commands: [
 *       { id: 'h1', label: 'Heading 1', action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
 *       { id: 'bullet', label: 'Bullet List', action: (editor) => editor.chain().focus().toggleBulletList().run() },
 *     ],
 *   },
 * ])
 */
export function createSlashCommandExtension(groups: SlashCommandGroup[]) {
  // Flatten all commands for the items callback
  const allCommands = groups.flatMap((g) => g.commands)

  return Extension.create({
    name: 'slashCommand',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          pluginKey: new PluginKey('slashCommand'),
          editor: this.editor,
          char: '/',
          startOfLine: true,
          allowSpaces: false,
          items: ({ query }) => {
            if (!query) return allCommands.slice(0, 8)
            const q = query.toLowerCase()
            return allCommands
              .filter(
                (cmd) =>
                  cmd.label.toLowerCase().includes(q) ||
                  cmd.description?.toLowerCase().includes(q),
              )
              .slice(0, 8)
          },
          command: ({ editor, range, props: item }) => {
            // Delete the /query text, then execute the command action
            editor.chain().focus().deleteRange(range).run()
            ;(item as unknown as SlashCommand).action(editor)
          },
          render: createSlashCommandRenderer(groups),
        }),
      ]
    },
  })
}
