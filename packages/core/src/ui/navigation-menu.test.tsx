import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from './navigation-menu'

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
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <p>Resource list content</p>
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
  it('renders triggers', () => {
    renderNavMenu()
    expect(screen.getByRole('button', { name: /Products/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Resources/i })).toBeInTheDocument()
  })

  it('renders navigation link', () => {
    renderNavMenu()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('does not show content initially', () => {
    renderNavMenu()
    expect(screen.queryByText('Product list content')).not.toBeInTheDocument()
  })

  it('opens content on trigger click', async () => {
    const user = userEvent.setup()
    renderNavMenu()
    await user.click(screen.getByRole('button', { name: /Products/i }))
    expect(await screen.findByText('Product list content')).toBeInTheDocument()
  })

  it('merges className on root', () => {
    render(
      <NavigationMenu className="custom-nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(document.querySelector('.custom-nav')).toBeInTheDocument()
  })

  it('forwards ref on root', () => {
    const ref = { current: null as HTMLElement | null }
    render(
      <NavigationMenu ref={ref as React.Ref<HTMLElement>}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('renders list with correct role', () => {
    renderNavMenu()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
