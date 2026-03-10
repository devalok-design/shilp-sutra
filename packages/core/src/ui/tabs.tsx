'use client'

import * as TabsPrimitive from '@primitives/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Tabs compound component — accessible tabbed navigation with keyboard support and two visual
 * variants (line underline and contained pill styles).
 *
 * **Parts (in composition order):**
 * - `Tabs` — manages active tab state (this root; takes `defaultValue`, `value`, `onValueChange`)
 * - `TabsList` — tab bar container (takes `variant="line"|"contained"`, default `"line"`)
 * - `TabsTrigger` — individual tab button (requires `value`; inherits `variant` from TabsList via context)
 * - `TabsContent` — the panel shown when its tab is active (requires `value` matching a TabsTrigger)
 *
 * **Critical behavior:** `variant` set on `TabsList` propagates automatically via React context to
 * all `TabsTrigger` children. You do NOT need to repeat `variant` on each trigger — but you CAN
 * override it per-trigger if needed.
 *
 * @compound
 * @example
 * // Default line variant:
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="activity">Activity</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">Overview content</TabsContent>
 *   <TabsContent value="activity">Activity content</TabsContent>
 *   <TabsContent value="settings">Settings content</TabsContent>
 * </Tabs>
 *
 * @example
 * // Contained pill variant (controlled):
 * const [tab, setTab] = useState('members')
 * <Tabs value={tab} onValueChange={setTab}>
 *   <TabsList variant="contained">
 *     <TabsTrigger value="members">Members</TabsTrigger>
 *     <TabsTrigger value="roles">Roles</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="members">Members list here.</TabsContent>
 *   <TabsContent value="roles">Roles list here.</TabsContent>
 * </Tabs>
 */
const Tabs = TabsPrimitive.Root

/** Props for the Tabs root (defaultValue, value, onValueChange, etc.). */
export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>

type TabsVariant = 'line' | 'contained'
const TabsListContext = React.createContext<{ variant: TabsVariant }>({ variant: 'line' })

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
          'data-[state=active]:border-interactive data-[state=active]:text-interactive data-[state=active]:animate-tab-indicator',
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

/**
 * TabsList — container for tab triggers. Sets `variant` for all child TabsTriggers via context.
 *
 * **Compound structure — variant propagates automatically:**
 * ```tsx
 * <Tabs defaultValue="overview">
 *   <TabsList variant="contained">
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="activity">Activity</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">Overview content</TabsContent>
 *   <TabsContent value="activity">Activity content</TabsContent>
 * </Tabs>
 * ```
 *
 * `variant` on `TabsList` flows to all `TabsTrigger` children via React context.
 * You do NOT need to repeat `variant` on each `TabsTrigger`.
 */
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => {
  const resolved: TabsVariant = variant ?? 'line'
  return (
    <TabsListContext.Provider value={{ variant: resolved }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(tabsListVariants({ variant: resolved }), className)}
        {...props}
      />
    </TabsListContext.Provider>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant: variantProp, ...props }, ref) => {
  const context = React.useContext(TabsListContext)
  const variant = variantProp ?? context.variant

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
})
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

/** Props for TabsContent. The `value` prop must match a TabsTrigger's `value`. */
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

export { Tabs, TabsList, TabsTrigger, TabsContent }
