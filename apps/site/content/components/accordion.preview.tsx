'use client'

import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@devalok/shilp-sutra/ui/accordion'

export function AccordionHero() {
  return (
    <div className="w-full max-w-md">
      <Accordion type="single" defaultValue="item-1" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Shilp Sutra?</AccordionTrigger>
          <AccordionContent>
            A React design system built for Next.js App Router, with accessibility
            baked into every component.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is dark mode supported?</AccordionTrigger>
          <AccordionContent>
            Yes — add the <code>.dark</code> class to the root element to activate it.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Can I use it with Tailwind 4?</AccordionTrigger>
          <AccordionContent>
            It is built CSS-first on Tailwind 4 — import the stylesheet and you are set.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function AccordionVariants() {
  return (
    <div className="grid grid-cols-1 gap-ds-06">
      <Block title='type="single" collapsible'>
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger>Billing</AccordionTrigger>
            <AccordionContent>Manage your plan and payment methods.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Security</AccordionTrigger>
            <AccordionContent>Configure two-factor authentication and sessions.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Block>

      <Block title='type="multiple"'>
        <Accordion type="multiple" defaultValue={['x']}>
          <AccordionItem value="x">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>Delivery estimates and carrier options.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="y">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>Our 30-day return and refund policy.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
