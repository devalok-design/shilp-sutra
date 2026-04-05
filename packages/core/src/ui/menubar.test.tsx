import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './menubar'

function renderMenubar() {
  return render(
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>File actions</MenubarLabel>
          <MenubarItem>New</MenubarItem>
          <MenubarItem>Open</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Save</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  )
}

describe('Menubar', () => {
  it('renders menu triggers', () => {
    renderMenubar()
    expect(screen.getByRole('menuitem', { name: 'File' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  it('does not show content initially', () => {
    renderMenubar()
    expect(screen.queryByText('New')).not.toBeInTheDocument()
  })

  it('opens menu content on trigger click', async () => {
    const user = userEvent.setup()
    renderMenubar()
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    expect(await screen.findByText('New')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders label text in opened menu', async () => {
    const user = userEvent.setup()
    renderMenubar()
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    expect(await screen.findByText('File actions')).toBeInTheDocument()
  })

  it('renders disabled items', async () => {
    const user = userEvent.setup()
    renderMenubar()
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    const save = await screen.findByText('Save')
    expect(save.closest('[data-disabled]')).toBeInTheDocument()
  })

  it('fires onSelect when item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={onSelect}>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    await user.click(await screen.findByText('New'))
    expect(onSelect).toHaveBeenCalled()
  })

  it('renders shortcut text', async () => {
    const user = userEvent.setup()
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New <MenubarShortcut>Ctrl+N</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    expect(await screen.findByText('Ctrl+N')).toBeInTheDocument()
  })

  it('renders checkbox items', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
              Toolbar
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await user.click(screen.getByRole('menuitem', { name: 'View' }))
    await user.click(await screen.findByText('Toolbar'))
    expect(onCheckedChange).toHaveBeenCalled()
  })

  it('merges className on root', () => {
    render(
      <Menubar className="custom-menubar">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    expect(screen.getByRole('menubar')).toHaveClass('custom-menubar')
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
