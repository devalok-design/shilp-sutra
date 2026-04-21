import { fireEvent,render, screen } from '@testing-library/react'
import { act,renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { axe } from 'vitest-axe'

import { TreeItem } from '../tree-item'
import { TreeView } from '../tree-view'
import { type TreeNode,useTree } from '../use-tree'

// ────────────────────────────────────────────────────────────────────────────
// useTree hook
// ────────────────────────────────────────────────────────────────────────────

describe('useTree hook', () => {
  it('initialises with empty expanded and selected sets', () => {
    const { result } = renderHook(() => useTree())
    expect(result.current.expanded.size).toBe(0)
    expect(result.current.selected.size).toBe(0)
  })

  it('initialises with defaultExpanded', () => {
    const { result } = renderHook(() =>
      useTree({ defaultExpanded: ['a', 'b'] }),
    )
    expect(result.current.isExpanded('a')).toBe(true)
    expect(result.current.isExpanded('b')).toBe(true)
    expect(result.current.isExpanded('c')).toBe(false)
  })

  it('initialises with defaultSelected', () => {
    const { result } = renderHook(() =>
      useTree({ defaultSelected: ['x'] }),
    )
    expect(result.current.isSelected('x')).toBe(true)
    expect(result.current.isSelected('y')).toBe(false)
  })

  it('toggle expands and collapses', () => {
    const { result } = renderHook(() => useTree())

    act(() => result.current.toggle('node1'))
    expect(result.current.isExpanded('node1')).toBe(true)

    act(() => result.current.toggle('node1'))
    expect(result.current.isExpanded('node1')).toBe(false)
  })

  it('toggle fires onExpand callback', () => {
    const onExpand = vi.fn()
    const { result } = renderHook(() => useTree({ onExpand }))

    act(() => result.current.toggle('a'))
    expect(onExpand).toHaveBeenCalledWith(['a'])

    act(() => result.current.toggle('a'))
    expect(onExpand).toHaveBeenCalledWith([])
  })

  it('select replaces selection in single-select mode', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() => useTree({ onSelect }))

    act(() => result.current.select('a'))
    expect(result.current.isSelected('a')).toBe(true)

    act(() => result.current.select('b'))
    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.isSelected('b')).toBe(true)
    expect(onSelect).toHaveBeenLastCalledWith(['b'])
  })

  it('select toggles in multi-select mode with ctrlKey', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTree({ multiSelect: true, onSelect }),
    )

    const ctrlEvent = { ctrlKey: true } as unknown as React.MouseEvent

    act(() => result.current.select('a', ctrlEvent))
    act(() => result.current.select('b', ctrlEvent))

    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.isSelected('b')).toBe(true)

    // Ctrl+click again deselects
    act(() => result.current.select('a', ctrlEvent))
    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.isSelected('b')).toBe(true)
  })

  it('expandAll sets all IDs, collapseAll clears', () => {
    const { result } = renderHook(() => useTree())

    act(() => result.current.expandAll(['a', 'b', 'c']))
    expect(result.current.isExpanded('a')).toBe(true)
    expect(result.current.isExpanded('b')).toBe(true)
    expect(result.current.isExpanded('c')).toBe(true)

    act(() => result.current.collapseAll())
    expect(result.current.isExpanded('a')).toBe(false)
    expect(result.current.isExpanded('b')).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// TreeView — data-driven mode (items prop)
// ────────────────────────────────────────────────────────────────────────────

describe('TreeView data-driven mode', () => {
  const flatItems: TreeNode[] = [
    { id: 'f1', label: 'File A' },
    { id: 'f2', label: 'File B' },
    { id: 'f3', label: 'File C' },
  ]

  const nestedItems: TreeNode[] = [
    {
      id: 'dir1',
      label: 'Documents',
      children: [
        { id: 'doc1', label: 'Resume.pdf' },
        { id: 'doc2', label: 'Cover.pdf' },
      ],
    },
    {
      id: 'dir2',
      label: 'Photos',
      children: [{ id: 'pic1', label: 'Vacation.jpg' }],
    },
  ]

  it('renders flat items', () => {
    render(<TreeView items={flatItems} />)
    expect(screen.getByText('File A')).toBeInTheDocument()
    expect(screen.getByText('File B')).toBeInTheDocument()
    expect(screen.getByText('File C')).toBeInTheDocument()
  })

  it('renders nested items', () => {
    render(<TreeView items={nestedItems} />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Resume.pdf')).toBeInTheDocument()
    expect(screen.getByText('Photos')).toBeInTheDocument()
  })

  it('has tree role on root', () => {
    const { container } = render(<TreeView items={flatItems} />)
    expect(container.querySelector('[role="tree"]')).toBeTruthy()
  })

  it('assigns treeitem role to each item', () => {
    const { container } = render(<TreeView items={flatItems} />)
    const items = container.querySelectorAll('[role="treeitem"]')
    expect(items).toHaveLength(3)
  })

  it('nested items are all rendered as treeitems', () => {
    const { container } = render(<TreeView items={nestedItems} />)
    const items = container.querySelectorAll('[role="treeitem"]')
    // dir1, doc1, doc2, dir2, pic1 = 5
    expect(items).toHaveLength(5)
  })

  it('parent nodes start collapsed (aria-expanded=false)', () => {
    const { container } = render(<TreeView items={nestedItems} />)
    const expandable = container.querySelectorAll('[aria-expanded="false"]')
    // dir1 and dir2 are expandable
    expect(expandable).toHaveLength(2)
  })

  it('defaultExpanded opens specified nodes', () => {
    const { container } = render(
      <TreeView items={nestedItems} defaultExpanded={['dir1']} />,
    )
    const dir1 = container.querySelector('[aria-expanded="true"]')
    expect(dir1).toBeTruthy()
  })

  it('has no axe violations with flat items', async () => {
    const { container } = render(<TreeView items={flatItems} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no axe violations with nested items', async () => {
    const { container } = render(
      <TreeView items={nestedItems} defaultExpanded={['dir1']} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ────────────────────────────────────────────────────────────────────────────
// TreeView — declarative mode (children)
// ────────────────────────────────────────────────────────────────────────────

describe('TreeView declarative mode', () => {
  function renderTree(props: { defaultExpanded?: string[]; onSelect?: (ids: string[]) => void } = {}) {
    return render(
      <TreeView {...props}>
        <TreeItem itemId="root" label="Root">
          <TreeItem itemId="child1" label="Child 1" />
          <TreeItem itemId="child2" label="Child 2" />
        </TreeItem>
        <TreeItem itemId="leaf" label="Leaf" />
      </TreeView>,
    )
  }

  it('renders all declared items', () => {
    renderTree()
    expect(screen.getByText('Root')).toBeInTheDocument()
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Leaf')).toBeInTheDocument()
  })

  it('clicking an item selects it', () => {
    const onSelect = vi.fn()
    const { container } = renderTree({ onSelect })

    const leafRow = container.querySelector('[data-tree-item="leaf"]') as HTMLElement
    fireEvent.click(leafRow)

    expect(onSelect).toHaveBeenCalledWith(['leaf'])
  })

  it('selected item has aria-selected=true', () => {
    const { container } = renderTree()

    const leafRow = container.querySelector('[data-tree-item="leaf"]') as HTMLElement
    fireEvent.click(leafRow)

    const leafItem = leafRow.closest('[role="treeitem"]')!
    expect(leafItem.getAttribute('aria-selected')).toBe('true')
  })

  it('clicking expand chevron toggles children visibility', () => {
    const { container } = renderTree()

    const rootItem = container.querySelector('[role="treeitem"]')!
    expect(rootItem.getAttribute('aria-expanded')).toBe('false')

    // Click the chevron button
    const chevron = rootItem.querySelector('button')!
    fireEvent.click(chevron)
    expect(rootItem.getAttribute('aria-expanded')).toBe('true')

    // Click again to collapse
    fireEvent.click(chevron)
    expect(rootItem.getAttribute('aria-expanded')).toBe('false')
  })

  it('defaultExpanded opens nodes on initial render', () => {
    const { container } = renderTree({ defaultExpanded: ['root'] })
    const rootItem = container.querySelector('[role="treeitem"]')!
    expect(rootItem.getAttribute('aria-expanded')).toBe('true')
  })

  it('disabled item is not interactive', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <TreeView onSelect={onSelect}>
        <TreeItem itemId="d1" label="Disabled" disabled />
      </TreeView>,
    )

    const row = container.querySelector('[data-tree-item="d1"]') as HTMLElement
    fireEvent.click(row)
    expect(onSelect).not.toHaveBeenCalled()

    const treeItem = container.querySelector('[role="treeitem"]')!
    expect(treeItem.getAttribute('aria-disabled')).toBe('true')
  })

  it('sets aria-multiselectable when multiSelect is true', () => {
    const { container } = render(
      <TreeView multiSelect>
        <TreeItem itemId="a" label="A" />
      </TreeView>,
    )
    const tree = container.querySelector('[role="tree"]')!
    expect(tree.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('does not set aria-multiselectable by default', () => {
    const { container } = render(
      <TreeView>
        <TreeItem itemId="a" label="A" />
      </TreeView>,
    )
    const tree = container.querySelector('[role="tree"]')!
    expect(tree.hasAttribute('aria-multiselectable')).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// TreeItem features
// ────────────────────────────────────────────────────────────────────────────

describe('TreeItem features', () => {
  it('renders icon when provided', () => {
    render(
      <TreeView>
        <TreeItem
          itemId="i1"
          label="With icon"
          icon={<span data-testid="custom-icon">IC</span>}
        />
      </TreeView>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders secondary label', () => {
    render(
      <TreeView>
        <TreeItem itemId="s1" label="Main" secondaryLabel="2 items" />
      </TreeView>,
    )
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('renders actions slot', () => {
    render(
      <TreeView>
        <TreeItem
          itemId="a1"
          label="With actions"
          actions={<button>Delete</button>}
        />
      </TreeView>,
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('leaf node does not have aria-expanded', () => {
    const { container } = render(
      <TreeView>
        <TreeItem itemId="leaf" label="Leaf" />
      </TreeView>,
    )
    const treeItem = container.querySelector('[role="treeitem"]')!
    expect(treeItem.hasAttribute('aria-expanded')).toBe(false)
  })

  it('sets correct aria-level on nested items', () => {
    const { container } = render(
      <TreeView defaultExpanded={['p']}>
        <TreeItem itemId="p" label="Parent">
          <TreeItem itemId="c" label="Child" />
        </TreeItem>
      </TreeView>,
    )
    const items = container.querySelectorAll('[role="treeitem"]')
    // Parent = level 1, Child = level 2
    expect(items[0].getAttribute('aria-level')).toBe('1')
    expect(items[1].getAttribute('aria-level')).toBe('2')
  })
})

// ────────────────────────────────────────────────────────────────────────────
// TreeView — keyboard navigation
// ────────────────────────────────────────────────────────────────────────────

describe('TreeView keyboard navigation', () => {
  it('ArrowDown moves focus to next visible item', () => {
    const { container } = render(
      <TreeView defaultExpanded={['1']}>
        <TreeItem itemId="1" label="Documents">
          <TreeItem itemId="1-1" label="Resume.pdf" />
        </TreeItem>
        <TreeItem itemId="2" label="Photos">
          <TreeItem itemId="2-1" label="Vacation.jpg" />
        </TreeItem>
      </TreeView>,
    )
    const tree = container.querySelector('[role="tree"]')!
    const firstRow = container.querySelector('[data-tree-item="1"]')!
    ;(firstRow as HTMLElement).focus()
    expect(document.activeElement).toBe(firstRow)
    fireEvent.keyDown(tree, { key: 'ArrowDown' })
    const secondRow = container.querySelector('[data-tree-item="1-1"]')
    expect(document.activeElement).toBe(secondRow)
  })

  it('ArrowUp moves focus to previous visible item', () => {
    const { container } = render(
      <TreeView defaultExpanded={['1']}>
        <TreeItem itemId="1" label="Documents">
          <TreeItem itemId="1-1" label="Resume.pdf" />
        </TreeItem>
      </TreeView>,
    )
    const tree = container.querySelector('[role="tree"]')!
    const secondRow = container.querySelector('[data-tree-item="1-1"]') as HTMLElement
    secondRow.focus()
    fireEvent.keyDown(tree, { key: 'ArrowUp' })
    const firstRow = container.querySelector('[data-tree-item="1"]')
    expect(document.activeElement).toBe(firstRow)
  })

  it('ArrowRight on collapsed item expands it', () => {
    const { container } = render(
      <TreeView>
        <TreeItem itemId="1" label="Documents">
          <TreeItem itemId="1-1" label="Resume.pdf" />
        </TreeItem>
      </TreeView>,
    )
    const firstRow = container.querySelector('[data-tree-item="1"]') as HTMLElement
    const treeItem = container.querySelector('[role="treeitem"]')!
    firstRow.focus()
    expect(treeItem.getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(firstRow, { key: 'ArrowRight' })
    expect(treeItem.getAttribute('aria-expanded')).toBe('true')
  })

  it('ArrowLeft on expanded item collapses it', () => {
    const { container } = render(
      <TreeView defaultExpanded={['1']}>
        <TreeItem itemId="1" label="Documents">
          <TreeItem itemId="1-1" label="Resume.pdf" />
        </TreeItem>
      </TreeView>,
    )
    const firstRow = container.querySelector('[data-tree-item="1"]') as HTMLElement
    const treeItem = container.querySelector('[role="treeitem"]')!
    firstRow.focus()
    expect(treeItem.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(firstRow, { key: 'ArrowLeft' })
    expect(treeItem.getAttribute('aria-expanded')).toBe('false')
  })

  it('Enter selects an item', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <TreeView onSelect={onSelect}>
        <TreeItem itemId="1" label="Documents" />
      </TreeView>,
    )
    const firstRow = container.querySelector('[data-tree-item="1"]') as HTMLElement
    firstRow.focus()
    fireEvent.keyDown(firstRow, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalled()
  })
})
