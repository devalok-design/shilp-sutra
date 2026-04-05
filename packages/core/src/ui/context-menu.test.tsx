import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from './context-menu'

function renderContextMenu() {
  return render(
    <ContextMenu>
      <ContextMenuTrigger>Right click me</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  )
}

describe('ContextMenu', () => {
  it('renders trigger', () => {
    renderContextMenu()
    expect(screen.getByText('Right click me')).toBeInTheDocument()
  })

  it('does not show menu content initially', () => {
    renderContextMenu()
    expect(screen.queryByText('Cut')).not.toBeInTheDocument()
  })

  it('opens menu on contextmenu event', async () => {
    renderContextMenu()
    fireEvent.contextMenu(screen.getByText('Right click me'))
    expect(await screen.findByText('Cut')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('renders label text', async () => {
    renderContextMenu()
    fireEvent.contextMenu(screen.getByText('Right click me'))
    expect(await screen.findByText('Actions')).toBeInTheDocument()
  })

  it('renders disabled items', async () => {
    renderContextMenu()
    fireEvent.contextMenu(screen.getByText('Right click me'))
    const paste = await screen.findByText('Paste')
    expect(paste.closest('[data-disabled]')).toBeInTheDocument()
  })

  it('fires onSelect when item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Action</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Trigger'))
    await user.click(await screen.findByText('Action'))
    expect(onSelect).toHaveBeenCalled()
  })

  it('renders shortcut text', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            Cut <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Trigger'))
    expect(await screen.findByText('Ctrl+X')).toBeInTheDocument()
  })

  it('renders checkbox items', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Show toolbar
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Trigger'))
    await user.click(await screen.findByText('Show toolbar'))
    expect(onCheckedChange).toHaveBeenCalled()
  })

  it('renders radio group items', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="a">
            <ContextMenuRadioItem value="a">Option A</ContextMenuRadioItem>
            <ContextMenuRadioItem value="b">Option B</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Trigger'))
    expect(await screen.findByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('renders sub menu', async () => {
    const user = userEvent.setup()
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Sub item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Trigger'))
    const subTrigger = await screen.findByText('More')
    await user.click(subTrigger)
    expect(await screen.findByText('Sub item')).toBeInTheDocument()
  })

  it('has no a11y violations when open', async () => {
    const { container } = renderContextMenu()
    fireEvent.contextMenu(screen.getByText('Right click me'))
    await screen.findByText('Cut')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
