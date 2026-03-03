import * as TabsPrimitive from '@primitives/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      line: 'border-b border-border w-full gap-0',
      contained:
        'bg-layer-02 p-ds-02 rounded-ds-lg gap-ds-02',
    },
  },
  defaultVariants: { variant: 'line' },
})

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-sans text-ds-md font-medium transition-[color,background-color,border-color,box-shadow] duration-fast-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[0.38]',
  {
    variants: {
      variant: {
        line: [
          'px-ds-05 py-ds-03 -mb-px border-b-2 border-transparent',
          'text-text-secondary hover:text-text-primary',
          'data-[state=active]:border-interactive data-[state=active]:text-interactive',
        ],
        contained: [
          'px-ds-05 py-ds-02b rounded-ds-md',
          'text-text-secondary hover:text-text-primary',
          'data-[state=active]:bg-layer-01 data-[state=active]:shadow-01 data-[state=active]:text-text-primary',
        ],
      },
    },
    defaultVariants: { variant: 'line' },
  },
)

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-ds-05 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
