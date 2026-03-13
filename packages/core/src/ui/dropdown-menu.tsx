'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@primitives/react-dropdown-menu'
import { IconCheck, IconChevronRight, IconCircle } from '@tabler/icons-react'

import { cn } from './lib/utils'

/**
 * DropdownMenu compound component — accessible floating menu triggered by a button, with full
 * keyboard navigation and focus management.
 *
 * **Parts (in composition order):**
 * - `DropdownMenu` — manages open/closed state (this root)
 * - `DropdownMenuTrigger` — element that opens the menu (use `asChild` to render your own button)
 * - `DropdownMenuContent` — the floating menu panel (renders in a portal automatically)
 * - `DropdownMenuItem` — clickable menu item (use `onSelect` for actions)
 * - `DropdownMenuCheckboxItem` — item with a checkbox indicator
 * - `DropdownMenuRadioGroup` — wraps radio items for exclusive selection
 * - `DropdownMenuRadioItem` — item with a radio indicator (must be inside `DropdownMenuRadioGroup`)
 * - `DropdownMenuSub` — root for a nested submenu
 * - `DropdownMenuSubTrigger` — item that reveals a submenu on hover/focus
 * - `DropdownMenuSubContent` — the nested submenu panel
 * - `DropdownMenuLabel` — non-interactive group label (not selectable)
 * - `DropdownMenuSeparator` — horizontal divider between sections
 * - `DropdownMenuShortcut` — right-aligned keyboard shortcut hint text (display only)
 * - `DropdownMenuGroup` — semantic grouping wrapper (no visual output)
 * - `DropdownMenuPortal` — low-level portal wrapper (exported for custom positioning; used internally by DropdownMenuContent)
 *
 * @compound
 * @example
 * // Standard action menu:
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="ghost" size="icon"><IconDotsVertical /></Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent align="end">
 *     <DropdownMenuLabel>My account</DropdownMenuLabel>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem>
 *       <IconUser className="mr-ds-03" />Profile
 *       <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
 *     </DropdownMenuItem>
 *     <DropdownMenuItem>Settings</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem className="text-error">Sign out</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 *
 * @example
 * // Menu with checkbox items and a nested submenu:
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild><Button>View options</Button></DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
 *       Show side panel
 *     </DropdownMenuCheckboxItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuSub>
 *       <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
 *       <DropdownMenuSubContent>
 *         <DropdownMenuItem>Export CSV</DropdownMenuItem>
 *         <DropdownMenuItem>Export PDF</DropdownMenuItem>
 *       </DropdownMenuSubContent>
 *     </DropdownMenuSub>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
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
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-popover min-w-[8rem] overflow-hidden rounded-ds-lg border border-border bg-layer-01 p-ds-02 text-text-primary shadow-03 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-popover min-w-[8rem] rounded-ds-lg border border-border bg-layer-01 p-ds-02 text-text-primary shadow-03',
        'duration-moderate-01 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-md outline-none transition-colors focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38] [&>svg]:h-ico-sm [&>svg]:w-ico-sm [&>svg]:shrink-0',
      inset && 'pl-ds-07',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-07 pr-ds-03 text-ds-md outline-none transition-colors focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck className="h-ico-sm w-ico-sm" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-07 pr-ds-03 text-ds-md outline-none transition-colors focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
      className,
    )}
    {...props}
  >
    <span className="absolute left-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCircle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-ds-03 py-ds-02b text-ds-md font-semibold',
      inset && 'pl-ds-07',
      className,
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-ds-01 my-ds-02 h-px bg-border-subtle', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-ds-sm text-text-placeholder', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
export type DropdownMenuItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
