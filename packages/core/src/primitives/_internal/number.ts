/**
 * Vendored from @radix-ui/number
 * @see ../LICENSE
 */

function clamp(value: number, [min, max]: [number, number]): number {
  return Math.min(max, Math.max(min, value));
}

export { clamp };
