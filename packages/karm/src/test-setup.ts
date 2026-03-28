import React from 'react'
import { vi } from 'vitest'

// ── Global framer-motion mock ────────────────────────────────────────────────
// framer-motion v12 is ESM-only and pulls in motion-dom + motion-utils.
// Mocking globally avoids re-transforming the full graph in every test file.

const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
  'layout', 'layoutId', 'layoutDependency', 'layoutScroll',
  'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
  'onAnimationStart', 'onAnimationComplete', 'onDragStart', 'onDragEnd',
  'onLayoutAnimationStart', 'onLayoutAnimationComplete',
])

const HTML_TAGS = new Set([
  'a', 'article', 'aside', 'blockquote', 'button', 'caption', 'code', 'col',
  'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'em', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr',
  'img', 'input', 'label', 'li', 'main', 'mark', 'nav', 'ol', 'option', 'output',
  'p', 'pre', 'progress', 'section', 'select', 'small', 'span', 'strong', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead',
  'tr', 'ul', 'video',
])

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

vi.mock('framer-motion', () => {
  const motionHandler = {
    get(_: any, prop: string | symbol) {
      if (typeof prop === 'symbol') return undefined
      if (prop === 'create') return (Component: any) => Component
      if (HTML_TAGS.has(prop)) return makeMotionComponent(prop)
      return undefined
    },
  }
  return {
    motion: new Proxy({}, motionHandler),
    AnimatePresence: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
    useInView: () => true,
    useAnimation: () => ({ start: () => Promise.resolve(), stop: () => {} }),
    useMotionValue: (initial: any) => ({
      get: () => initial,
      set: () => {},
      onChange: () => () => {},
    }),
    useTransform: (value: any) => value,
    useSpring: (value: any) => value,
  }
})

// ── Global react-markdown mock ────────────────────────────────────────────────
// react-markdown v10 pulls in the entire unified/micromark/remark/rehype ecosystem
// (~285 ESM-only packages). Mock it globally to avoid transforming all of that.
vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'markdown' }, children),
}))

// ── Global scrollTo polyfill ─────────────────────────────────────────────────
// MessageList and other scroll-heavy components call scrollTo.
if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = (() => {}) as any
}
