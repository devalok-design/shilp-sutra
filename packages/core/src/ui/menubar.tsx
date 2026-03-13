'use client'

import * as React from 'react'
import * as MenubarPrimitive from '@primitives/react-menubar'
import { IconCheck, IconChevronRight, IconCircle } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

// ── Internal contexts to thread open state ──

const MenubarMenuOpenContext = React.createContext(false)
const MenubarSubOpenContext = React.createContext(false)

const MenubarMenu: React.FC<React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Menu>> = (props) => {
  // MenubarPrimitive.Menu doesn't expose open/onOpenChange directly.
  // We derive open from data-state on the trigger via a callback ref approach,
  // but the cleanest way is to use the Menubar root's value prop.
  // Since MenubarMenu doesn't have open/onOpenChange, we track via a wrapper
  // that observes the trigger's data-state.
  //
  // Alternative: MenubarPrimitive.Menu has a `value` that the root uses.
  // We'll use a simpler approach: track open via content mount state.
  return <MenubarPrimitive.Menu {...props} />
}
MenubarMenu.displayName = 'MenubarMenu'

// For Menubar, the Menu doesn't expose open/onOpenChange. Instead, we'll use a
// different approach: wrap Content to use a local presence state based on data-state.
// We create a wrapper component that tracks whether content should be shown.

const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group

const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal

const MenubarSub: React.FC<React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Sub>> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  return (
    <MenubarSubOpenContext.Provider value={open}>
      <MenubarPrimitive.Sub open={open} onOpenChange={handleOpenChange} {...props} />
    </MenubarSubOpenContext.Provider>
  )
}
MenubarSub.displayName = 'MenubarSub'

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
>(({ className, children, ...props }, ref) => {
  const open = React.useContext(MenubarSubOpenContext)

  return (
    <AnimatePresence>
      {open && (
        <MenubarPrimitive.SubContent
          ref={ref}
          forceMount
          asChild
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ...springs.snappy, opacity: tweens.fade }}
            className={cn(
              'z-popover min-w-[8rem] overflow-hidden rounded-ds-lg border border-border bg-layer-01 p-ds-02 text-text-primary shadow-03',
              className,
            )}
          >
            {children}
          </motion.div>
        </MenubarPrimitive.SubContent>
      )}
    </AnimatePresence>
  )
})
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

// For MenubarContent, since MenubarMenu doesn't expose open/onOpenChange,
// we use a wrapper that reads presence from a callback approach.
// The cleanest solution: use a local state tracker via onCloseAutoFocus/onOpenAutoFocus
// or simply keep CSS-free and let Radix handle mount/unmount naturally.
//
// Since Menubar menus are opened by the Menubar root (which tracks which menu value is open),
// and MenubarPrimitive.Content already handles mount/unmount, we can use a ref-based approach
// to detect the data-state attribute. However, the simplest reliable approach is to use
// a wrapper that detects mount via useEffect.

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, children, ...props },
    ref,
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ ...springs.snappy, opacity: tweens.fade }}
          className={cn(
            'z-popover min-w-[12rem] rounded-ds-lg border border-border bg-layer-01 p-ds-02 text-text-primary shadow-03',
            className,
          )}
        >
          {children}
        </motion.div>
      </MenubarPrimitive.Content>
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

export type MenubarContentProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
export type MenubarItemProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>

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
