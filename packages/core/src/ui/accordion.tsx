'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@primitives/react-accordion'
import { IconChevronDown } from '@tabler/icons-react'

import { cn } from './lib/utils'

/**
 * Accordion compound component — vertically stacked, collapsible content sections.
 *
 * **Parts (in composition order):**
 * - `Accordion` — root; controls single vs. multiple open panels (this root)
 * - `AccordionItem` — individual collapsible section (requires `value` prop)
 * - `AccordionTrigger` — the clickable header row (chevron icon auto-renders and rotates)
 * - `AccordionContent` — the collapsible body revealed when the item is open
 *
 * **`type` prop (required on root):**
 * - `"single"` — only one panel open at a time; supports `collapsible` prop to re-close the active item
 * - `"multiple"` — multiple panels open simultaneously (value is `string[]`); `collapsible` is NOT valid here
 *
 * @compound
 * @example
 * // Single-open FAQ accordion:
 * <Accordion type="single" defaultValue="item-1" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>What is Shilp Sutra?</AccordionTrigger>
 *     <AccordionContent>
 *       A React design system built for Next.js App Router, with full accessibility baked in.
 *     </AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item-2">
 *     <AccordionTrigger>Is dark mode supported?</AccordionTrigger>
 *     <AccordionContent>
 *       Yes — add the <code>.dark</code> class to the root element to activate it.
 *     </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 *
 * @example
 * // Multiple-open controlled accordion:
 * const [open, setOpen] = useState<string[]>(['billing'])
 * <Accordion type="multiple" value={open} onValueChange={setOpen}>
 *   <AccordionItem value="billing">
 *     <AccordionTrigger>Billing</AccordionTrigger>
 *     <AccordionContent>Your billing details here.</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="security">
 *     <AccordionTrigger>Security</AccordionTrigger>
 *     <AccordionContent>Security settings here.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border-subtle', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-ds-05 text-left text-ds-md font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <IconChevronDown className="h-ico-sm w-ico-sm shrink-0 text-text-secondary transition-transform duration-moderate-02" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="transition-all duration-moderate-02 ease-productive-standard data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down w-full overflow-hidden text-ds-md"
    {...props}
  >
    <div className={cn('pb-ds-05 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export type AccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
export type AccordionTriggerProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
export type AccordionContentProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
