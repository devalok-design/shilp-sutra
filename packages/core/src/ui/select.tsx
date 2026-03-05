'use client'

import * as React from 'react'
import * as SelectPrimitive from '@primitives/react-select'
import { IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'

/**
 * Select root — manages open/close state and selected value.
 *
 * **Important:** `size` is NOT a prop on `Select`. Set it on `SelectTrigger` instead.
 * Passing `size` directly to `Select` produces no TypeScript error but has no effect.
 *
 * @example
 * // CORRECT — size goes on SelectTrigger:
 * <Select onValueChange={setValue}>
 *   <SelectTrigger size="lg">
 *     <SelectValue placeholder="Choose..." />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="a">Option A</SelectItem>
 *     <SelectItem value="b">Option B</SelectItem>
 *   </SelectContent>
 * </Select>
 *
 * // WRONG — size on Select root is silently ignored (no TypeScript error):
 * // <Select size="lg">...</Select>
 */
const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

export const selectTriggerVariants = cva(
  'flex w-full items-center justify-between whitespace-nowrap rounded-ds-md border border-border bg-field placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:border-border-interactive disabled:cursor-not-allowed disabled:opacity-[0.38] [&>span]:line-clamp-1',
  {
    variants: {
      size: {
        sm: 'h-ds-sm text-ds-sm px-ds-03',
        md: 'h-ds-md text-ds-md px-ds-04',
        lg: 'h-ds-lg text-ds-lg px-ds-05',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

/**
 * Props for SelectTrigger. Use `size` here (not on the `Select` root).
 *
 * @example
 * <SelectTrigger size="lg" className="w-[200px]">
 *   <SelectValue placeholder="Select an option" />
 * </SelectTrigger>
 */
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, size, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ size }), className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <IconChevronDown className="h-ico-sm w-ico-sm opacity-[0.5]" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-ds-02',
      className,
    )}
    {...props}
  >
    <IconChevronUp className="h-ico-sm w-ico-sm" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-ds-02',
      className,
    )}
    {...props}
  >
    <IconChevronDown className="h-ico-sm w-ico-sm" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-dropdown max-h-96 min-w-[8rem] overflow-hidden rounded-ds-lg border border-border bg-layer-01 text-text-primary shadow-03 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-ds-02',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-ds-03 py-ds-02b text-ds-md font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-ds-md py-ds-02b pl-ds-03 pr-ds-07 text-ds-md outline-none focus:bg-layer-02 focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-[0.38]',
      className,
    )}
    {...props}
  >
    <span className="absolute right-ds-03 flex h-ico-sm w-ico-sm items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <IconCheck className="h-ico-sm w-ico-sm" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-ds-01 my-ds-02 h-px bg-border-subtle', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
