import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../navigation-menu'

function renderNavMenu() {
  return render(
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <p>Product list content</p>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  )
}

describe('NavigationMenu', () => {
  it('renders the navigation element', () => {
    renderNavMenu()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders menu trigger text', () => {
    renderNavMenu()
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderNavMenu()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('does not show content initially', () => {
    renderNavMenu()
    expect(screen.queryByText('Product list content')).not.toBeInTheDocument()
  })

  it('forwards ref on NavigationMenu root', () => {
    const ref = vi.fn()
    render(
      <NavigationMenu ref={ref}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(ref).toHaveBeenCalled()
  })

  it('merges custom className on NavigationMenu', () => {
    const { container } = render(
      <NavigationMenu className="my-nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelector('.my-nav')).toBeInTheDocument()
  })
})
