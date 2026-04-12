'use client'

import * as TabsPrimitive from '@primitives/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, LayoutGroup } from 'framer-motion'
import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

/* ── Active-value context (drives layoutId indicator) ────── */
type TabsOrientation = 'horizontal' | 'vertical'
const TabsValueContext = React.createContext<string | undefined>(undefined)
const TabsOrientationContext = React.createContext<TabsOrientation>('horizontal')

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
>(({ value: valueProp, defaultValue, onValueChange, orientation, ...props }, ref) => {
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

  const resolvedOrientation: TabsOrientation = orientation ?? 'horizontal'

  return (
    <TabsValueContext.Provider value={activeValue}>
      <TabsOrientationContext.Provider value={resolvedOrientation}>
        <TabsPrimitive.Root
          ref={ref}
          value={valueProp}
          defaultValue={valueProp === undefined ? defaultValue : undefined}
          onValueChange={handleValueChange}
          orientation={orientation}
          {...props}
          className={cn(
            resolvedOrientation === 'vertical' && 'flex flex-row gap-ds-05',
            props.className,
          )}
        />
      </TabsOrientationContext.Provider>
    </TabsValueContext.Provider>
  )
})
Tabs.displayName = 'Tabs'

/** Props for the Tabs root (defaultValue, value, onValueChange, etc.). */
export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>

type TabsVariant = 'line' | 'contained'
type TabsSize = 'sm' | 'md' | 'lg'
type TabsColor = 'accent' | 'neutral'

interface TabsListContextValue {
  variant: TabsVariant
  size: TabsSize
  color: TabsColor
  layoutId: string
}

const TabsListContext = React.createContext<TabsListContextValue>({
  variant: 'line',
  size: 'md',
  color: 'accent',
  layoutId: 'tab-indicator',
})

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      line: 'border-b border-surface-border-strong w-full gap-0',
      contained:
        'bg-surface-raised p-ds-02 rounded-ds-lg gap-ds-02',
    },
    size: {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    },
    orientation: {
      horizontal: '',
      vertical: 'flex-col',
    },
  },
  compoundVariants: [
    // Vertical line: left border instead of bottom, fixed width, auto height
    { variant: 'line', orientation: 'vertical', class: 'border-b-0 border-l border-surface-border-strong w-48 shrink-0 h-auto gap-0' },
    // Vertical contained: column layout, fixed width, auto height
    { variant: 'contained', orientation: 'vertical', class: 'h-auto w-48 shrink-0' },
  ],
  defaultVariants: { variant: 'line', size: 'md', orientation: 'horizontal' },
})

const tabsTriggerVariants = cva(
  'relative inline-flex items-center justify-center gap-ds-02 whitespace-nowrap font-sans font-medium transition-colors duration-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-action-disabled',
  {
    variants: {
      variant: {
        line: [
          '-mb-px',
          'text-surface-fg-muted hover:text-surface-fg',
        ],
        contained: [
          'rounded-ds-md',
          'text-surface-fg-muted hover:text-surface-fg',
          'data-[state=active]:text-surface-fg',
        ],
      },
      size: {
        sm: 'px-ds-03 py-ds-02 text-ds-xs',
        md: 'px-ds-05 py-ds-03 text-ds-sm',
        lg: 'px-ds-06 py-ds-04 text-ds-md',
      },
    },
    defaultVariants: { variant: 'line', size: 'md' },
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
    VariantProps<typeof tabsListVariants> {
  /** Color axis — affects active tab indicator and text color. @default "accent" */
  color?: TabsColor
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, color, ...props }, ref) => {
  const orientation = React.useContext(TabsOrientationContext)
  const resolvedVariant: TabsVariant = variant ?? 'line'
  const resolvedSize: TabsSize = size ?? 'md'
  const resolvedColor: TabsColor = color ?? 'accent'
  const layoutId = React.useId()
  const contextValue = React.useMemo(
    () => ({
      variant: resolvedVariant,
      size: resolvedSize,
      color: resolvedColor,
      layoutId: `tab-indicator-${layoutId}`,
    }),
    [resolvedVariant, resolvedSize, resolvedColor, layoutId],
  )
  return (
    <TabsListContext.Provider value={contextValue}>
      <LayoutGroup>
        <TabsPrimitive.List
          ref={ref}
          className={cn(tabsListVariants({ variant: resolvedVariant, size: resolvedSize, orientation }), className)}
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

/* ── Color classes for active state ────── */
const lineActiveColorMap: Record<TabsColor, string> = {
  accent: 'data-[state=active]:text-accent-11',
  neutral: 'data-[state=active]:text-surface-fg',
}

const lineIndicatorColorMap: Record<TabsColor, string> = {
  accent: 'bg-accent-9',
  neutral: 'bg-surface-fg',
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant: variantProp, children, ...props }, ref) => {
  const listContext = React.useContext(TabsListContext)
  const activeValue = React.useContext(TabsValueContext)
  const orientation = React.useContext(TabsOrientationContext)
  const variant = variantProp ?? listContext.variant
  const size = listContext.size
  const color = listContext.color
  const isActive = props.value === activeValue
  const isVertical = orientation === 'vertical'

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({ variant, size }),
        variant === 'line' && lineActiveColorMap[color],
        // Vertical: full width triggers, left margin instead of bottom
        isVertical && 'w-full justify-start',
        variant === 'line' && isVertical && '-ml-px -mb-0',
        className,
      )}
      {...props}
    >
      {/* Contained variant: sliding pill background */}
      {variant === 'contained' && isActive && (
        <motion.span
          layoutId={`${listContext.layoutId}-contained`}
          className="absolute inset-0 rounded-ds-md bg-surface-overlay shadow-raised"
          transition={springs.smooth}
        />
      )}
      {/* Content sits above the indicator */}
      <span className="relative z-[1] inline-flex items-center gap-ds-02">{children}</span>
      {/* Line variant: sliding indicator -- bottom underline (horizontal) or left bar (vertical) */}
      {variant === 'line' && isActive && (
        <motion.span
          layoutId={`${listContext.layoutId}-line`}
          className={cn(
            'absolute',
            isVertical
              ? 'left-0 top-0 bottom-0 w-0.5'
              : 'bottom-0 left-0 right-0 h-0.5',
            lineIndicatorColorMap[color],
          )}
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
>(({ className, children, ...props }, ref) => {
  const orientation = React.useContext(TabsOrientationContext)
  const isVertical = orientation === 'vertical'

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2',
        isVertical ? 'mt-0 flex-1 min-w-0' : 'mt-ds-05',
        className,
      )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={tweens.fade}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

/** Props for TabsContent. The `value` prop must match a TabsTrigger's `value`. */
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsSize, TabsColor, TabsOrientation }
