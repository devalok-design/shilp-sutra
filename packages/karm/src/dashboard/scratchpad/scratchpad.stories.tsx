import React, { useState, useCallback } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { IconClipboardList } from '@tabler/icons-react'
import { Scratchpad } from './scratchpad'
import type { ScratchpadItem } from './scratchpad-context'

const meta: Meta = {
  title: 'Karm/Dashboard/Scratchpad (Composable)',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { Scratchpad } from "@devalok/shilp-sutra-karm/dashboard"`\n\nCompound component for building scratchpad UIs. Compose `Scratchpad.Root`, `.Header`, `.List`, `.AddInput`, `.EmptyState`, `.ProgressRing`, `.FilterToggle`, and `.Collapse` to create any arrangement.',
      },
    },
  },
}
export default meta

// ── Mock data ──────────────────────────────────────────────

const SAMPLE_ITEMS: ScratchpadItem[] = [
  { id: 's1', text: 'Review PR #142 — auth middleware', done: false },
  { id: 's2', text: 'Reply to Priya about design tokens', done: true },
  { id: 's3', text: 'Push hotfix for payment timeout', done: false },
]

// ── Interactive helper ─────────────────────────────────────

function useInteractiveItems(initial: ScratchpadItem[]) {
  const [items, setItems] = useState(initial)

  const onToggle = useCallback((id: string, done: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done } : item)))
  }, [])

  const onAdd = useCallback((text: string) => {
    setItems((prev) => [...prev, { id: `new-${Date.now()}`, text, done: false }])
  }, [])

  const onDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const onEdit = useCallback((id: string, text: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)))
  }, [])

  const onReorder = useCallback((newItems: ScratchpadItem[]) => {
    setItems(newItems)
  }, [])

  return { items, onToggle, onAdd, onDelete, onEdit, onReorder }
}

// ── Stories ─────────────────────────────────────────────────

export const FullCard: StoryObj = {
  name: 'Full Card',
  render: () => {
    const { items, onToggle, onAdd, onDelete, onEdit } = useInteractiveItems(SAMPLE_ITEMS)
    return (
      <div style={{ maxWidth: 380 }}>
        <Scratchpad.Root
          items={items}
          maxItems={5}
          onToggle={onToggle}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
          className="rounded-ds-2xl border border-surface-border-strong bg-surface-2 shadow-01"
        >
          <Scratchpad.Header title="My Scratchpad">
            <Scratchpad.FilterToggle />
            <Scratchpad.ProgressRing />
          </Scratchpad.Header>
          <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
            <Scratchpad.EmptyState icon={IconClipboardList} />
            <Scratchpad.List />
            <Scratchpad.AddInput />
          </div>
        </Scratchpad.Root>
      </div>
    )
  },
}

export const SidebarCompact: StoryObj = {
  name: 'Sidebar Compact',
  render: () => {
    const { items, onToggle, onAdd, onDelete } = useInteractiveItems(SAMPLE_ITEMS)
    return (
      <div style={{ maxWidth: 260, border: '1px solid var(--color-surface-border)', borderRadius: 8 }}>
        <Scratchpad.Root items={items} maxItems={10} onToggle={onToggle} onAdd={onAdd} onDelete={onDelete}>
          <Scratchpad.Collapse badgeCount={items.filter((i) => !i.done).length}>
            <div className="flex flex-col gap-0.5 px-ds-03 pb-ds-02">
              <Scratchpad.List compact />
              <Scratchpad.AddInput placeholder="Quick add..." triggerLabel="+ Add..." />
            </div>
          </Scratchpad.Collapse>
        </Scratchpad.Root>
      </div>
    )
  },
}

export const WithDragReorder: StoryObj = {
  name: 'With Drag Reorder',
  render: () => {
    const { items, onToggle, onAdd, onDelete, onReorder } = useInteractiveItems([
      { id: '1', text: 'First item — drag me!', done: false },
      { id: '2', text: 'Second item', done: false },
      { id: '3', text: 'Third item', done: true },
      { id: '4', text: 'Fourth item', done: false },
    ])
    return (
      <div style={{ maxWidth: 380 }}>
        <Scratchpad.Root
          items={items}
          maxItems={8}
          onToggle={onToggle}
          onAdd={onAdd}
          onDelete={onDelete}
          onReorder={onReorder}
          className="rounded-ds-2xl border border-surface-border-strong bg-surface-2 shadow-01"
        >
          <Scratchpad.Header title="Reorderable">
            <Scratchpad.ProgressRing />
          </Scratchpad.Header>
          <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
            <Scratchpad.List />
            <Scratchpad.AddInput />
          </div>
        </Scratchpad.Root>
      </div>
    )
  },
}

export const MinimalReadOnly: StoryObj = {
  name: 'Minimal Read-Only',
  render: () => (
    <div style={{ maxWidth: 300 }}>
      <Scratchpad.Root items={SAMPLE_ITEMS} onToggle={fn()}>
        <Scratchpad.Header title="Read-Only List" />
        <Scratchpad.List />
      </Scratchpad.Root>
    </div>
  ),
}

export const WithPromote: StoryObj = {
  name: 'With Promote Action',
  render: () => {
    const { items, onToggle, onAdd, onDelete } = useInteractiveItems(SAMPLE_ITEMS)
    return (
      <div style={{ maxWidth: 380 }}>
        <Scratchpad.Root
          items={items}
          maxItems={5}
          onToggle={onToggle}
          onAdd={onAdd}
          onDelete={onDelete}
          onPromote={fn()}
          className="rounded-ds-2xl border border-surface-border-strong bg-surface-2 shadow-01"
        >
          <Scratchpad.Header title="With Promote">
            <Scratchpad.ProgressRing />
          </Scratchpad.Header>
          <div className="flex flex-col border-t border-surface-border-strong px-ds-05b pb-ds-04 pt-ds-04">
            <Scratchpad.EmptyState />
            <Scratchpad.List />
            <Scratchpad.AddInput />
          </div>
        </Scratchpad.Root>
      </div>
    )
  },
}
