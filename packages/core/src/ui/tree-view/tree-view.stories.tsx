import type { Meta, StoryObj } from '@storybook/react'
import { IconFile, IconFolder, IconFolderOpen } from '@tabler/icons-react'
import { useState } from 'react'

import { TreeView, TreeItem, useTree, type TreeNode } from '.'

const meta: Meta<typeof TreeView> = {
  title: 'UI/TreeView',
  component: TreeView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TreeView>

// ─── Sample data ────────────────────────────────────────────────────
const fileTree: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
          { id: 'dialog', label: 'Dialog.tsx' },
        ],
      },
      {
        id: 'hooks',
        label: 'hooks',
        children: [
          { id: 'use-state', label: 'useState.ts' },
          { id: 'use-effect', label: 'useEffect.ts' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [{ id: 'favicon', label: 'favicon.ico' }],
  },
  { id: 'readme', label: 'README.md' },
  { id: 'package', label: 'package.json' },
]

// ─── Default (data-driven) ──────────────────────────────────────────
export const Default: Story = {
  args: {
    items: fileTree,
    defaultExpanded: ['src', 'components'],
  },
}

// ─── With Checkboxes ────────────────────────────────────────────────
export const WithCheckboxes: Story = {
  args: {
    items: fileTree,
    checkboxes: true,
    multiSelect: true,
    defaultExpanded: ['src', 'components'],
  },
}

// ─── Controlled ─────────────────────────────────────────────────────
function ControlledExample() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<string[]>(['src'])

  return (
    <div className="flex gap-ds-06">
      <TreeView
        items={fileTree}
        defaultExpanded={expandedIds}
        defaultSelected={selectedIds}
        onSelect={setSelectedIds}
        onExpand={setExpandedIds}
      />
      <div className="text-ds-sm">
        <p>
          <strong>Selected:</strong> {selectedIds.join(', ') || 'none'}
        </p>
        <p>
          <strong>Expanded:</strong> {expandedIds.join(', ') || 'none'}
        </p>
      </div>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
}

// ─── Custom Icons (declarative mode) ────────────────────────────────
function CustomIconsExample() {
  const folderIcon = <IconFolder size={16} />
  const folderOpenIcon = <IconFolderOpen size={16} />
  const fileIcon = <IconFile size={16} />

  return (
    <TreeView defaultExpanded={['src', 'components']}>
      <TreeItem itemId="src" label="src" icon={folderIcon}>
        <TreeItem itemId="components" label="components" icon={folderOpenIcon}>
          <TreeItem itemId="button" label="Button.tsx" icon={fileIcon} />
          <TreeItem itemId="input" label="Input.tsx" icon={fileIcon} />
          <TreeItem itemId="dialog" label="Dialog.tsx" icon={fileIcon} />
        </TreeItem>
        <TreeItem itemId="hooks" label="hooks" icon={folderIcon}>
          <TreeItem itemId="use-state" label="useState.ts" icon={fileIcon} />
          <TreeItem itemId="use-effect" label="useEffect.ts" icon={fileIcon} />
        </TreeItem>
        <TreeItem itemId="index" label="index.ts" icon={fileIcon} />
      </TreeItem>
      <TreeItem itemId="public" label="public" icon={folderIcon}>
        <TreeItem itemId="favicon" label="favicon.ico" icon={fileIcon} />
      </TreeItem>
      <TreeItem itemId="readme" label="README.md" icon={fileIcon} />
      <TreeItem itemId="package" label="package.json" icon={fileIcon} />
    </TreeView>
  )
}

export const CustomIcons: Story = {
  render: () => <CustomIconsExample />,
}

// ─── Deeply Nested ──────────────────────────────────────────────────
const deepTree: TreeNode[] = [
  {
    id: 'l1',
    label: 'Level 1',
    children: [
      {
        id: 'l2',
        label: 'Level 2',
        children: [
          {
            id: 'l3',
            label: 'Level 3',
            children: [
              {
                id: 'l4',
                label: 'Level 4',
                children: [
                  {
                    id: 'l5',
                    label: 'Level 5',
                    children: [
                      { id: 'l6a', label: 'Leaf A' },
                      { id: 'l6b', label: 'Leaf B' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

export const Nested: Story = {
  args: {
    items: deepTree,
    defaultExpanded: ['l1', 'l2', 'l3', 'l4', 'l5'],
  },
}
