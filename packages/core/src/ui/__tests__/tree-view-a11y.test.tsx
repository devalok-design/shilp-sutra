import { render, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { TreeView } from '../tree-view/tree-view'
import { TreeItem } from '../tree-view/tree-item'

function renderBasicTree() {
  return render(
    <TreeView>
      <TreeItem itemId="1" label="Documents">
        <TreeItem itemId="1-1" label="Resume.pdf" />
        <TreeItem itemId="1-2" label="Cover Letter.pdf" />
      </TreeItem>
      <TreeItem itemId="2" label="Photos">
        <TreeItem itemId="2-1" label="Vacation.jpg" />
      </TreeItem>
      <TreeItem itemId="3" label="Notes.txt" />
    </TreeView>,
  )
}

describe('TreeView a11y', () => {
  it('should have no vitest-axe violations', async () => {
    const { container } = renderBasicTree()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with expanded items', async () => {
    const { container } = render(
      <TreeView defaultExpanded={['1']}>
        <TreeItem itemId="1" label="Documents">
          <TreeItem itemId="1-1" label="Resume.pdf" />
        </TreeItem>
      </TreeView>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('TreeView ARIA roles', () => {
  it('root element has role="tree"', () => {
    const { container } = renderBasicTree()
    const tree = container.querySelector('[role="tree"]')
    expect(tree).toBeTruthy()
    expect(tree!.tagName).toBe('UL')
  })

  it('items have role="treeitem"', () => {
    const { container } = renderBasicTree()
    const treeItems = container.querySelectorAll('[role="treeitem"]')
    // 3 top-level + 3 nested = 6
    expect(treeItems.length).toBeGreaterThanOrEqual(5)
  })

  it('child containers have role="group"', () => {
    const { container } = renderBasicTree()
    const groups = container.querySelectorAll('[role="group"]')
    // "Documents" and "Photos" each have a group wrapper
    expect(groups.length).toBeGreaterThanOrEqual(2)
  })

  it('expandable items have aria-expanded', () => {
    const { container } = renderBasicTree()
    const expandableItems = container.querySelectorAll('[aria-expanded]')
    // "Documents" and "Photos" are expandable
    expect(expandableItems.length).toBe(2)
  })

  it('aria-expanded is false by default for expandable items', () => {
    const { container } = renderBasicTree()
    const expandableItems = container.querySelectorAll('[aria-expanded]')
    expandableItems.forEach((item) => {
      expect(item.getAttribute('aria-expanded')).toBe('false')
    })
  })

  it('aria-expanded is true for initially expanded items', () => {
    const { container } = render(
      <TreeView defaultExpanded={['1']}>
        <TreeItem itemId="1" label="Documents">
          <TreeItem itemId="1-1" label="Resume.pdf" />
        </TreeItem>
      </TreeView>,
    )
    const expandable = container.querySelector('[aria-expanded="true"]')
    expect(expandable).toBeTruthy()
  })

  it('leaf items do not have aria-expanded', () => {
    const { container } = renderBasicTree()
    // "Notes.txt" is a leaf
    const allTreeItems = container.querySelectorAll('[role="treeitem"]')
    const leafItems = Array.from(allTreeItems).filter(
      (el) => !el.hasAttribute('aria-expanded'),
    )
    expect(leafItems.length).toBeGreaterThan(0)
  })
})

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

    // Focus the first item
    ;(firstRow as HTMLElement).focus()
    expect(document.activeElement).toBe(firstRow)

    // ArrowDown should move to next visible item
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
    const tree = container.querySelector('[role="tree"]')!
    const firstRow = container.querySelector('[data-tree-item="1"]') as HTMLElement
    const treeItem = container.querySelector('[role="treeitem"]')!

    firstRow.focus()
    expect(treeItem.getAttribute('aria-expanded')).toBe('false')

    // ArrowRight should expand
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

    // ArrowLeft should collapse
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

// Need vi for the last test
import { vi } from 'vitest'
