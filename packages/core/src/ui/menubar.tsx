'use client'

import * as React from 'react'
import * as MenubarPrimitive from '@primitives/react-menubar'
import { IconCheck, IconChevronRight, IconCircle } from '@tabler/icons-react'

import { cn } from './lib/utils'

const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu

const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group

const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal

const MenubarSub: typeof MenubarPrimitive.Sub = MenubarPrimitive.Sub

const MenubarRadioGroup: typeof MenubarPrimitive.RadioGroup =
  MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-ds-sm-plus items-center space-x-ds-02 rounded-ds-lg border border-border bg-layer-01 p-ds-02 shadow-01',
      className,
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-ds-sm px-ds-04 py-ds-02 text-ds-md font-medium outline-none transition-colors hover:bg-field focus-visible:bg-field data-[state=open]:bg-field',
      className,
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-md outline-none focus:bg-layer-02 data-[state=open]:bg-layer-02 [&_svg]:pointer-events-none [&_svg]:h-ico-sm [&_svg]:w-ico-sm [&_svg]:shrink-0',
      inset && 'pl-ds-07',
      className,
    )}
    {...props}
  >
    {children}
    <IconChevronRight className="ml-auto" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-dropdown min-w-[8rem] overflow-hidden rounded-ds-lg border border-border bg-layer-01 p-ds-02 text-text-primary shadow-03 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, ...props },
    ref,
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-dropdown min-w-[12rem] overflow-hidden rounded-ds-lg border border-border bg-layer-01 p-ds-02 text-text-primary shadow-03',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-md outline-none transition-colors focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38] [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0',
      inset && 'pl-ds-07',
      className,
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-07 pr-ds-03 text-ds-md outline-none transition-colors focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <IconCheck className="h-ico-sm w-ico-sm" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-07 pr-ds-03 text-ds-md outline-none transition-colors focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
      className,
    )}
    {...props}
  >
    <span className="absolute left-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <IconCircle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      'px-ds-03 py-ds-02b text-ds-md font-semibold',
      inset && 'pl-ds-07',
      className,
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn('-mx-ds-01 my-ds-02 h-px bg-border-subtle', className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-ds-sm text-text-placeholder',
        className,
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayName = 'MenubarShortcut'

export {
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
  MenubarPortal,
  MenubarGroup,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarShortcut,
}
