'use client'

import * as React from "react"
import * as ContextMenuPrimitive from "@primitives/react-context-menu"
import { IconCheck, IconChevronRight, IconCircle } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from "./lib/utils"
import { springs, tweens } from './lib/motion'

// ── Internal contexts to thread open state ──

const ContextMenuOpenContext = React.createContext(false)
const ContextMenuSubOpenContext = React.createContext(false)

const ContextMenu: React.FC<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>> = ({
  onOpenChange,
  ...props
}) => {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      setOpen(value)
      onOpenChange?.(value)
    },
    [onOpenChange],
  )

  return (
    <ContextMenuOpenContext.Provider value={open}>
      <ContextMenuPrimitive.Root onOpenChange={handleOpenChange} {...props} />
    </ContextMenuOpenContext.Provider>
  )
}
ContextMenu.displayName = 'ContextMenu'

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub: React.FC<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Sub>> = ({
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
    <ContextMenuSubOpenContext.Provider value={open}>
      <ContextMenuPrimitive.Sub open={open} onOpenChange={handleOpenChange} {...props} />
    </ContextMenuSubOpenContext.Provider>
  )
}
ContextMenuSub.displayName = 'ContextMenuSub'

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-ds-md px-ds-03 py-ds-02b text-ds-md outline-none focus:bg-surface-2 focus:text-surface-fg data-[state=open]:bg-surface-2 data-[state=open]:text-surface-fg",
      inset && "pl-ds-07",
      className
    )}
    {...props}
  >
    {children}
    <IconChevronRight className="ml-auto h-ico-sm w-ico-sm" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, children, ...props }, ref) => {
  const open = React.useContext(ContextMenuSubOpenContext)

  return (
    <AnimatePresence>
      {open && (
        <ContextMenuPrimitive.SubContent
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
              "z-popover min-w-[8rem] overflow-hidden rounded-ds-lg border border-surface-border-strong bg-surface-1 p-ds-02 text-surface-fg shadow-03",
              className
            )}
          >
            {children}
          </motion.div>
        </ContextMenuPrimitive.SubContent>
      )}
    </AnimatePresence>
  )
})
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const open = React.useContext(ContextMenuOpenContext)

  return (
    <AnimatePresence>
      {open && (
        <ContextMenuPrimitive.Portal forceMount>
          <ContextMenuPrimitive.Content
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
                "z-popover rounded-ds-lg border border-surface-border-strong bg-surface-1 p-ds-02 text-surface-fg shadow-03",
                className
              )}
            >
              {children}
            </motion.div>
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  )
})
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-ds-md px-ds-03 py-ds-02b text-ds-md outline-none focus:bg-surface-2 focus:text-surface-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-action-disabled",
      inset && "pl-ds-07",
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-07 pr-ds-03 text-ds-md outline-none focus:bg-surface-2 focus:text-surface-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-action-disabled",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <IconCheck className="h-ico-sm w-ico-sm" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-07 pr-ds-03 text-ds-md outline-none focus:bg-surface-2 focus:text-surface-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-action-disabled",
      className
    )}
    {...props}
  >
    <span className="absolute left-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <IconCircle className="h-ico-sm w-ico-sm fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-ds-03 py-ds-02b text-ds-md font-semibold text-surface-fg",
      inset && "pl-ds-07",
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-ds-01 my-ds-02 h-px bg-surface-border", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-ds-sm text-surface-fg-subtle",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export type ContextMenuContentProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
export type ContextMenuItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
