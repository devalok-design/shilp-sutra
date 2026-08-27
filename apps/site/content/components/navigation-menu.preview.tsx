'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@devalok/shilp-sutra/ui/navigation-menu'

export function NavigationMenuHero() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-ds-01 p-ds-03">
              <MenuLink title="Analytics" href="#analytics">
                Dashboards, funnels, and retention out of the box.
              </MenuLink>
              <MenuLink title="Automations" href="#automations">
                Trigger workflows from any event in your product.
              </MenuLink>
              <MenuLink title="Data pipeline" href="#pipeline">
                Stream clean events to your warehouse.
              </MenuLink>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-ds-01 p-ds-03">
              <MenuLink title="Documentation" href="#docs">
                Guides, recipes, and the full API reference.
              </MenuLink>
              <MenuLink title="Changelog" href="#changelog">
                Everything we shipped, release by release.
              </MenuLink>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#pricing"
            className="inline-flex h-ds-sm-plus w-max items-center rounded-control px-ds-05 py-ds-03 text-body-md font-medium transition-colors hover:bg-surface-panel-hover"
          >
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function NavigationMenuVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title="single trigger with rich content">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-64 gap-ds-01 p-ds-03">
                  <MenuLink title="About" href="#about">
                    Who we are and what we are building.
                  </MenuLink>
                  <MenuLink title="Careers" href="#careers">
                    Open roles across design and engineering.
                  </MenuLink>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Block>
    </div>
  )
}

function MenuLink({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <li>
      <NavigationMenuLink
        href={href}
        className="block rounded-control p-ds-03 transition-colors hover:bg-surface-panel-hover"
      >
        <span className="block text-body-md font-medium text-surface-fg">{title}</span>
        <span className="block text-body-sm text-surface-fg-muted">{children}</span>
      </NavigationMenuLink>
    </li>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-wrap items-center gap-ds-02">{children}</div>
    </div>
  )
}
