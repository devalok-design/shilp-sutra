import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '../menubar'

function renderMenubar() {
  return render(
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Print <MenubarShortcut>Ctrl+P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  )
}

describe('Menubar', () => {
  it('renders all menu triggers', () => {
    renderMenubar()
    expect(screen.getByRole('menuitem', { name: 'File' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  it('renders within a menubar role', () => {
    renderMenubar()
    expect(screen.getByRole('menubar')).toBeInTheDocument()
  })

  it('does not show menu content initially', () => {
    renderMenubar()
    expect(screen.queryByText('New Tab')).not.toBeInTheDocument()
  })

  it('opens menu on trigger click', async () => {
    const user = userEvent.setup()
    renderMenubar()

    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    expect(screen.getByText('New Tab')).toBeInTheDocument()
  })

  it('forwards ref on Menubar root', () => {
    const ref = vi.fn()
    render(
      <Menubar ref={ref}>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    expect(ref).toHaveBeenCalled()
  })

  it('merges custom className on Menubar', () => {
    const { container } = render(
      <Menubar className="my-menubar">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    expect(container.querySelector('.my-menubar')).toBeInTheDocument()
  })
})
