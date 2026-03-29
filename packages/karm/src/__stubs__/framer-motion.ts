/**
 * Vite-level stub for framer-motion.
 *
 * Aliased in vitest.config.ts so Vite never resolves the real
 * framer-motion → motion-dom → motion-utils ESM graph (~200+ modules).
 * This is a build-time replacement, not a runtime vi.mock().
 */
import React from 'react'

const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
  'layout', 'layoutId', 'layoutDependency', 'layoutScroll',
  'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
  'onAnimationStart', 'onAnimationComplete', 'onDragStart', 'onDragEnd',
  'onLayoutAnimationStart', 'onLayoutAnimationComplete',
])

// Non-element properties on the motion proxy — everything else is treated as a tag name.
const MOTION_META = new Set(['create', '$$typeof', '__esModule', 'default', 'then'])

function makeMotionComponent(tag: string) {
  const Comp = React.forwardRef(({ children, ...props }: any, ref: any) => {
    const filtered: Record<string, any> = {}
    for (const [k, v] of Object.entries(props)) {
      if (!MOTION_PROPS.has(k)) filtered[k] = v
    }
    return React.createElement(tag, { ...filtered, ref }, children)
  })
  Comp.displayName = `motion.${tag}`
  return Comp
}

// Cache motion components — React needs stable component references.
// Without caching, each Proxy `get` returns a new forwardRef component,
// causing React to unmount/remount the subtree on every render.
const motionCache = new Map<string, React.ForwardRefExoticComponent<any>>()

const motionHandler = {
  get(_: any, prop: string | symbol) {
    if (typeof prop === 'symbol') return undefined
    if (prop === 'create') return (Component: any) => Component
    if (MOTION_META.has(prop as string)) return undefined
    // Treat any other string as an HTML/SVG tag name (div, span, path, line, circle, etc.)
    let comp = motionCache.get(prop as string)
    if (!comp) {
      comp = makeMotionComponent(prop as string)
      motionCache.set(prop as string, comp)
    }
    return comp
  },
}

export const motion = new Proxy({}, motionHandler)

export const AnimatePresence = ({ children }: any) =>
  React.createElement(React.Fragment, null, children)

// ── Components ──────────────────────────────────────────────────────────────

/** LayoutGroup — groups layout animations. Stub renders children directly. */
export const LayoutGroup = ({ children }: any) =>
  React.createElement(React.Fragment, null, children)

/** MotionConfig — provides animation config context. Stub renders children. */
export const MotionConfig = ({ children }: any) =>
  React.createElement(React.Fragment, null, children)

// ── Hooks ───────────────────────────────────────────────────────────────────

export const useReducedMotion = () => false
export const useInView = () => true
export const useAnimation = () => ({ start: () => Promise.resolve(), stop: () => {} })
export const useMotionValue = (initial: any) => ({
  get: () => initial,
  set: () => {},
  onChange: () => () => {},
})
export const useTransform = (value: any) => value
export const useSpring = (value: any) => value

// ── Imperative API ──────────────────────────────────────────────────────────

/** animate() — imperative animation. Stub returns a no-op control. */
export const animate = (_target: any, _keyframes?: any, _options?: any) => ({
  stop: () => {},
  then: (resolve: any) => { resolve?.(); return Promise.resolve() },
})

// ── Types (re-exported as empty interfaces for TS consumers) ────────────────

export type Transition = Record<string, any>
export type Variants = Record<string, any>
export type HTMLMotionProps<_T extends string = 'div'> = Record<string, any>
