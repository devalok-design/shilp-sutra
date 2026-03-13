'use client'

import * as React from 'react'
import * as NavigationMenuPrimitive from '@primitives/react-navigation-menu'
import { IconChevronDown } from '@tabler/icons-react'
import { motion } from 'framer-motion'

import { cn } from './lib/utils'
import { springs, tweens } from './lib/motion'

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      'relative z-raised flex max-w-max flex-1 items-center justify-center',
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      'group flex flex-1 list-none items-center justify-center space-x-ds-02',
      className,
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      'group inline-flex h-ds-sm-plus w-max items-center justify-center rounded-ds-md bg-transparent px-ds-05 py-ds-03 text-ds-md font-medium transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 disabled:pointer-events-none disabled:opacity-action-disabled',
      className,
    )}
    {...props}
  >
    {children}{' '}
    <IconChevronDown
      className="relative top-[1px] ml-ds-02 h-ico-sm w-ico-sm transition-transform duration-moderate-02 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

// ── NavigationMenuContent — directional slide using data-motion ──

const contentSlideVariants = {
  'from-start': { x: '-13rem', opacity: 0 },
  'from-end': { x: '13rem', opacity: 0 },
  'to-start': { x: '-13rem', opacity: 0 },
  'to-end': { x: '13rem', opacity: 0 },
  center: { x: 0, opacity: 1 },
} as const

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement>(null)
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  const [motionDir, setMotionDir] = React.useState<string | null>(null)

  // Observe data-motion attribute changes from Radix
  React.useEffect(() => {
    const el = innerRef.current
    if (!el) return

    // Read initial value
    const initial = el.getAttribute('data-motion')
    if (initial) setMotionDir(initial)

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-motion') {
          const val = el.getAttribute('data-motion')
          setMotionDir(val)
        }
      }
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-motion'] })
    return () => observer.disconnect()
  }, [])

  const initial = motionDir && motionDir.startsWith('from-')
    ? contentSlideVariants[motionDir as keyof typeof contentSlideVariants]
    : motionDir && motionDir.startsWith('to-')
      ? contentSlideVariants.center
      : { x: 0, opacity: 0 }

  const animate = motionDir && motionDir.startsWith('from-')
    ? contentSlideVariants.center
    : motionDir && motionDir.startsWith('to-')
      ? contentSlideVariants[motionDir as keyof typeof contentSlideVariants]
      : contentSlideVariants.center

  return (
    <NavigationMenuPrimitive.Content
      ref={composedRef}
      className={cn(
        'left-0 top-0 w-full md:absolute md:w-auto',
        className,
      )}
      {...props}
    >
      <motion.div
        key={motionDir}
        initial={initial}
        animate={animate}
        transition={{ ...springs.smooth, opacity: tweens.fade }}
        style={{ width: '100%' }}
      >
        {props.children}
      </motion.div>
    </NavigationMenuPrimitive.Content>
  )
})
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

// ── NavigationMenuViewport — scale + fade with layout for size changes ──

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement>(null)
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const el = innerRef.current
    if (!el) return

    const initial = el.getAttribute('data-state')
    setIsOpen(initial === 'open')

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-state') {
          setIsOpen(el.getAttribute('data-state') === 'open')
        }
      }
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className={cn('absolute left-0 top-full flex justify-center')}>
      <NavigationMenuPrimitive.Viewport
        className={cn(
          'origin-top-center relative mt-ds-02b h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-ds-lg border border-surface-border-strong bg-surface-1 shadow-03 md:w-[var(--radix-navigation-menu-viewport-width)]',
          className,
        )}
        ref={composedRef}
        {...props}
      />
      {/* Overlay motion element for scale+fade animation */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
        initial={false}
        animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ ...springs.smooth, opacity: tweens.fade }}
      />
    </div>
  )
})
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

// ── NavigationMenuIndicator — fade + layout position sliding ──

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement>(null)
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const el = innerRef.current
    if (!el) return

    const initial = el.getAttribute('data-state')
    setIsVisible(initial === 'visible')

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-state') {
          setIsVisible(el.getAttribute('data-state') === 'visible')
        }
      }
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] })
    return () => observer.disconnect()
  }, [])

  return (
    <NavigationMenuPrimitive.Indicator
      ref={composedRef}
      className={cn(
        'top-full z-base flex h-ds-02b items-end justify-center overflow-hidden',
        className,
      )}
      {...props}
    >
      <motion.div
        layout
        initial={false}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={tweens.fade}
        className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-surface-border shadow-02"
      />
    </NavigationMenuPrimitive.Indicator>
  )
})
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export type NavigationMenuProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
export type NavigationMenuContentProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
