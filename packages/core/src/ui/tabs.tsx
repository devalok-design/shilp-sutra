'use client'

import * as TabsPrimitive from '@primitives/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, LayoutGroup } from 'framer-motion'
import { cn } from './lib/utils'
import { springs } from './lib/motion'

/* ── Active-value context (drives layoutId indicator) ────── */
const TabsValueContext = React.createContext<string | undefined>(undefined)

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
 * The active tab indicator animates between tabs using Framer Motion `layoutId`. Line variant
 * shows a sliding underline; contained variant shows a sliding pill background.
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
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
  // Track the active value so TabsTrigger can conditionally render the motion indicator.
  // For controlled usage, mirror the prop; for uncontrolled, manage internal state.
  const [activeValue, setActiveValue] = React.useState(valueProp ?? defaultValue ?? '')

  // Sync controlled value
  React.useEffect(() => {
    if (valueProp !== undefined) setActiveValue(valueProp)
  }, [valueProp])

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setActiveValue(newValue)
      onValueChange?.(newValue)
    },
    [onValueChange],
  )

  return (
    <TabsValueContext.Provider value={activeValue}>
      <TabsPrimitive.Root
        ref={ref}
        value={valueProp}
        defaultValue={valueProp === undefined ? defaultValue : undefined}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsValueContext.Provider>
  )
})
Tabs.displayName = 'Tabs'

/** Props for the Tabs root (defaultValue, value, onValueChange, etc.). */
export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>

type TabsVariant = 'line' | 'contained'
const TabsListContext = React.createContext<{ variant: TabsVariant; layoutId: string }>({
  variant: 'line',
  layoutId: 'tab-indicator',
})

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      line: 'border-b border-surface-border-strong w-full gap-0',
      contained:
        'bg-surface-2 p-ds-02 rounded-ds-lg gap-ds-02',
    },
  },
  defaultVariants: { variant: 'line' },
})

const tabsTriggerVariants = cva(
  'relative inline-flex items-center justify-center gap-ds-02 whitespace-nowrap font-sans text-ds-md font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-action-disabled',
  {
    variants: {
      variant: {
        line: [
          'px-ds-05 py-ds-03 -mb-px',
          'text-surface-fg-muted hover:text-surface-fg',
          'data-[state=active]:text-accent-11',
        ],
        contained: [
          'px-ds-05 py-ds-02b rounded-ds-md',
          'text-surface-fg-muted hover:text-surface-fg',
          'data-[state=active]:text-surface-fg',
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
  const layoutId = React.useId()
  const contextValue = React.useMemo(
    () => ({ variant: resolved, layoutId: `tab-indicator-${layoutId}` }),
    [resolved, layoutId],
  )
  return (
    <TabsListContext.Provider value={contextValue}>
      <LayoutGroup>
        <TabsPrimitive.List
          ref={ref}
          className={cn(tabsListVariants({ variant: resolved }), className)}
          {...props}
        />
      </LayoutGroup>
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
>(({ className, variant: variantProp, children, ...props }, ref) => {
  const listContext = React.useContext(TabsListContext)
  const activeValue = React.useContext(TabsValueContext)
  const variant = variantProp ?? listContext.variant
  const isActive = props.value === activeValue

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    >
      {/* Contained variant: sliding pill background */}
      {variant === 'contained' && isActive && (
        <motion.span
          layoutId={`${listContext.layoutId}-contained`}
          className="absolute inset-0 rounded-ds-md bg-surface-1 shadow-01"
          transition={springs.smooth}
        />
      )}
      {/* Content sits above the indicator */}
      <span className="relative z-[1] inline-flex items-center gap-ds-02">{children}</span>
      {/* Line variant: sliding underline */}
      {variant === 'line' && isActive && (
        <motion.span
          layoutId={`${listContext.layoutId}-line`}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-9"
          transition={springs.smooth}
        />
      )}
    </TabsPrimitive.Trigger>
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
      'mt-ds-05 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

/** Props for TabsContent. The `value` prop must match a TabsTrigger's `value`. */
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

export { Tabs, TabsList, TabsTrigger, TabsContent }
