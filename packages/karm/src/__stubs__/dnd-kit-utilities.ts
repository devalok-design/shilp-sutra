/**
 * Vite-level stub for @dnd-kit/utilities.
 *
 * Aliased in vitest.config.ts so Vite never resolves the real
 * @dnd-kit/utilities dependency tree. Only `CSS` is used in karm.
 */

export const CSS = {
  Transform: {
    toString(transform: any) {
      if (!transform) return ''
      const { x = 0, y = 0, scaleX = 1, scaleY = 1 } = transform
      return `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`
    },
  },
  Transition: {
    toString({ property = 'transform', duration = 200, easing = 'ease' } = {} as any) {
      return `${property} ${duration}ms ${easing}`
    },
  },
}
