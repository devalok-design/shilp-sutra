import * as TabsPrimitive from '@primitives/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      line: 'border-b border-[var(--color-border-default)] w-full gap-0',
      contained:
        'bg-[var(--color-layer-02)] p-1 rounded-[var(--radius-lg)] gap-1',
    },
  },
  defaultVariants: { variant: 'line' },
})

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-sans text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        line: [
          'px-4 py-2 -mb-px border-b-2 border-transparent',
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          'data-[state=active]:border-[var(--color-interactive)] data-[state=active]:text-[var(--color-interactive)]',
        ],
        contained: [
          'px-4 py-1.5 rounded-[var(--radius-md)]',
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          'data-[state=active]:bg-[var(--color-layer-01)] data-[state=active]:shadow-[var(--shadow-01)] data-[state=active]:text-[var(--color-text-primary)]',
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
      'mt-4 ring-offset-[var(--color-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
