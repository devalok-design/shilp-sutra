import type { Meta, StoryObj } from '@storybook/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu'

const meta: Meta<typeof NavigationMenu> = {
  title: 'UI/Navigation/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof NavigationMenu>

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="#"
                    className="block select-none space-y-1 rounded-ds-md p-3 leading-none no-underline outline-none transition-colors hover:bg-field"
                  >
                    <div className="text-sm font-medium leading-none">
                      Introduction
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-text-secondary">
                      Re-usable components built with Radix UI and Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="#"
                    className="block select-none space-y-1 rounded-ds-md p-3 leading-none no-underline outline-none transition-colors hover:bg-field"
                  >
                    <div className="text-sm font-medium leading-none">
                      Installation
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-text-secondary">
                      How to install dependencies and structure your app.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="#"
                    className="block select-none space-y-1 rounded-ds-md p-3 leading-none no-underline outline-none transition-colors hover:bg-field"
                  >
                    <div className="text-sm font-medium leading-none">
                      Alert Dialog
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-text-secondary">
                      A modal dialog that interrupts the user.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="#"
                    className="block select-none space-y-1 rounded-ds-md p-3 leading-none no-underline outline-none transition-colors hover:bg-field"
                  >
                    <div className="text-sm font-medium leading-none">
                      Hover Card
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-text-secondary">
                      For sighted users to preview content behind a link.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
