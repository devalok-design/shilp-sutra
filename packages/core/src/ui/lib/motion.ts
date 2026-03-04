export type MotionMode = 'productive' | 'expressive'
export type MotionCategory = 'standard' | 'entrance' | 'exit'
export type DurationToken =
  | 'instant'
  | 'fast-01'
  | 'fast-02'
  | 'moderate-01'
  | 'moderate-02'
  | 'slow-01'
  | 'slow-02'

export const easings: Record<MotionMode, Record<MotionCategory, string>> = {
  productive: {
    standard: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
    entrance: 'cubic-bezier(0, 0, 0.38, 0.9)',
    exit: 'cubic-bezier(0.2, 0, 1, 0.9)',
  },
  expressive: {
    standard: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
    entrance: 'cubic-bezier(0, 0, 0.3, 1)',
    exit: 'cubic-bezier(0.4, 0.14, 1, 1)',
  },
}

export const durations: Record<DurationToken, string> = {
  instant: '0ms',
  'fast-01': '70ms',
  'fast-02': '110ms',
  'moderate-01': '150ms',
  'moderate-02': '240ms',
  'slow-01': '400ms',
  'slow-02': '700ms',
}

/** Returns the CSS cubic-bezier string for a motion category and mode. */
export function motion(category: MotionCategory, mode: MotionMode): string {
  return easings[mode][category]
}

/** Returns the CSS duration string for a duration token. */
export function duration(token: DurationToken): string {
  return durations[token]
}
