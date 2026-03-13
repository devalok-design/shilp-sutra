'use client'

import * as React from 'react'
import { motion, AnimatePresence, type Transition, type Variants, type HTMLMotionProps } from 'framer-motion'
import { springs, tweens } from '../ui/lib/motion'
import type { SpringPreset } from '../ui/lib/motion'
import { cn } from '../ui/lib/utils'

// ── Shared types ──

type MotionDivProps = Omit<HTMLMotionProps<'div'>, 'ref'>

type MotionPrimitiveProps = {
  show: boolean
  children: React.ReactNode
  className?: string
  preset?: SpringPreset
  layout?: boolean | 'position' | 'size' | 'preserve-aspect'
  layoutId?: string
  whileInView?: boolean
  viewportOnce?: boolean
  viewportMargin?: string
}

// ── MotionFade ──
// Default: fade tween only (no spring needed for pure opacity)

const MotionFade = React.forwardRef<HTMLDivElement, MotionPrimitiveProps & MotionDivProps>(
  ({ show, children, className, layout, layoutId, whileInView, viewportOnce = true, viewportMargin = '-50px', ...rest }, ref) => {
    const inViewProps = whileInView ? {
      initial: 'hidden',
      whileInView: 'visible',
      viewport: { once: viewportOnce, margin: viewportMargin },
    } : {}

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={tweens.fade}
            className={cn(className)}
            layout={layout}
            layoutId={layoutId}
            {...inViewProps}
            {...rest}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
MotionFade.displayName = 'MotionFade'

// ── MotionScale ──
// Default: snappy spring for scale + fade tween for opacity

const MotionScale = React.forwardRef<HTMLDivElement, MotionPrimitiveProps & MotionDivProps>(
  ({ show, children, className, preset = 'snappy', layout, layoutId, whileInView, viewportOnce = true, viewportMargin = '-50px', ...rest }, ref) => {
    const spring = springs[preset]
    const inViewProps = whileInView ? {
      initial: 'hidden',
      whileInView: 'visible',
      viewport: { once: viewportOnce, margin: viewportMargin },
    } : {}

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ ...spring, opacity: tweens.fade }}
            className={cn(className)}
            layout={layout}
            layoutId={layoutId}
            {...inViewProps}
            {...rest}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
MotionScale.displayName = 'MotionScale'

// ── MotionPop ──
// Default: bouncy spring with overshoot for scale + fade

const MotionPop = React.forwardRef<HTMLDivElement, MotionPrimitiveProps & MotionDivProps>(
  ({ show, children, className, preset = 'bouncy', layout, layoutId, whileInView, viewportOnce = true, viewportMargin = '-50px', ...rest }, ref) => {
    const spring = springs[preset]
    const inViewProps = whileInView ? {
      initial: 'hidden',
      whileInView: 'visible',
      viewport: { once: viewportOnce, margin: viewportMargin },
    } : {}

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ ...spring, opacity: tweens.fade }}
            className={cn(className)}
            layout={layout}
            layoutId={layoutId}
            {...inViewProps}
            {...rest}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
MotionPop.displayName = 'MotionPop'

// ── MotionSlide ──
// Default: smooth spring for translate + fade

const MotionSlide = React.forwardRef<
  HTMLDivElement,
  MotionPrimitiveProps & { direction?: 'up' | 'down' | 'left' | 'right' } & MotionDivProps
>(
  ({ show, children, className, preset = 'smooth', direction = 'up', layout, layoutId, whileInView, viewportOnce = true, viewportMargin = '-50px', ...rest }, ref) => {
    const spring = springs[preset]
    const offsets = {
      up: { y: 16 },
      down: { y: -16 },
      left: { x: 16 },
      right: { x: -16 },
    }
    const offset = offsets[direction]
    const inViewProps = whileInView ? {
      initial: 'hidden',
      whileInView: 'visible',
      viewport: { once: viewportOnce, margin: viewportMargin },
    } : {}

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, ...offset }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...offset }}
            transition={{ ...spring, opacity: tweens.fade }}
            className={cn(className)}
            layout={layout}
            layoutId={layoutId}
            {...inViewProps}
            {...rest}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
MotionSlide.displayName = 'MotionSlide'

// ── MotionCollapse ──
// Default: gentle spring for height + fade
// Uses height: "auto" — Framer Motion handles this natively

const MotionCollapse = React.forwardRef<HTMLDivElement, MotionPrimitiveProps & MotionDivProps>(
  ({ show, children, className, preset = 'gentle', layout, layoutId, ...rest }, ref) => {
    const spring = springs[preset]

    return (
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            ref={ref}
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'hidden' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ ...spring, opacity: tweens.fade }}
            className={cn(className)}
            layout={layout}
            layoutId={layoutId}
            {...rest}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
MotionCollapse.displayName = 'MotionCollapse'

// ── MotionStagger + MotionStaggerItem ──
// Parent orchestrates children with staggerChildren

type MotionStaggerProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  whileInView?: boolean
  viewportOnce?: boolean
  viewportMargin?: string
}

const MotionStagger = React.forwardRef<HTMLDivElement, MotionStaggerProps & MotionDivProps>(
  ({ children, className, delay = 0.04, whileInView, viewportOnce = true, viewportMargin = '-50px', ...rest }, ref) => {
    const variants: Variants = {
      hidden: {},
      visible: {
        transition: { staggerChildren: delay },
      },
    }

    const viewProps = whileInView
      ? { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: viewportOnce, margin: viewportMargin } }
      : { initial: 'hidden' as const, animate: 'visible' as const }

    return (
      <motion.div
        ref={ref}
        variants={variants}
        className={cn(className)}
        {...viewProps}
        {...rest}
      >
        {children}
      </motion.div>
    )
  },
)
MotionStagger.displayName = 'MotionStagger'

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springs.smooth, opacity: tweens.fade },
  },
}

const MotionStaggerItem = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string } & MotionDivProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={itemVariants}
        className={cn(className)}
        {...rest}
      >
        {children}
      </motion.div>
    )
  },
)
MotionStaggerItem.displayName = 'MotionStaggerItem'

export {
  MotionFade,
  MotionScale,
  MotionPop,
  MotionSlide,
  MotionCollapse,
  MotionStagger,
  MotionStaggerItem,
  type MotionPrimitiveProps,
  type MotionStaggerProps,
}
