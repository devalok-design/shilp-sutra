import '@testing-library/jest-dom/vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import { expect } from 'vitest'

expect.extend(axeMatchers)

// ── Global jsdom mocks ──────────────────────────────────────────────────────
// These are needed by Radix primitives and various components that rely on
// browser APIs not provided by jsdom.

// ResizeObserver — used by Radix Select, Slider, input-otp, recharts
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}

// window.matchMedia — used by use-mobile, useColorMode, recharts ResponsiveContainer
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// Element.prototype.hasPointerCapture — used by Radix popover/select
if (typeof Element !== 'undefined' && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}

// Element.prototype.releasePointerCapture — used by Radix popover/select
if (typeof Element !== 'undefined' && !Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}

// Element.prototype.setPointerCapture — used by Radix popover/select
if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}

// Element.prototype.scrollIntoView — used by Radix select, keyboard navigation
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
