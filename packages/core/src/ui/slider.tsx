'use client'

import * as SliderPrimitive from '@primitives/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { useFormField } from './form'
import { cn } from './lib/utils'

const sliderTrackVariants = cva(
  'relative w-full grow overflow-hidden rounded-pill bg-surface-panel-hover',
  {
    variants: {
      size: {
        sm: 'h-ds-02',
        md: 'h-ds-02b',
        lg: 'h-[10px]',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const sliderThumbVariants = cva(
  'touch-target block rounded-pill bg-surface-overlay shadow-raised transition-[color,transform,box-shadow] duration-fast-02 ease-productive-standard hover:shadow-raised-hover active:scale-[1.15] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
      },
      // NOTE: the thumb's edge follows the `border` role, which moved to step 4
      // with the rest of the system. A thumb is a draggable affordance rather
      // than a container edge, so this is the place where the lighter edge is
      // felt most — the thumb is defined mostly by its fill against the track.
      // Reversing just this one is a single-line change if it reads too faint.
      color: {
        accent: 'border-palette-border focus-visible:ring-palette-solid',
        success: 'border-palette-border focus-visible:ring-palette-solid',
        warning: 'border-palette-border focus-visible:ring-palette-solid',
        error: 'border-palette-border focus-visible:ring-palette-solid',
      },
    },
    defaultVariants: { size: 'md', color: 'accent' },
  },
)

/** The filled portion of the track — one role for every colour. */
const SLIDER_RANGE_FILL = 'bg-palette-solid'

export type SliderSize = NonNullable<VariantProps<typeof sliderTrackVariants>['size']>
export type SliderColor = NonNullable<VariantProps<typeof sliderThumbVariants>['color']>

/** One tick on the scale. A bare number is shorthand for `{ value: n, label: n }`. */
export interface SliderMark {
  /** Position on the scale, in the slider's own units (between `min` and `max`). */
  value: number
  /**
   * What to print under the tick. Defaults to the value itself. Pass `null`
   * for a tick with no caption.
   */
  label?: React.ReactNode
}

export interface SliderMarkProps extends SliderMark {
  /** Caption for this tick. Overrides `label`. */
  children?: React.ReactNode
}

/**
 * A single tick, as a child of `Slider`.
 *
 * ```tsx
 * <Slider>
 *   <Slider.Mark value={30}>Launch</Slider.Mark>
 * </Slider>
 * ```
 *
 * Never rendered directly — `Slider` reads the props off it and draws the tick
 * itself, because a tick has to be positioned against the track. Returning
 * `null` keeps it out of the DOM if someone renders one outside a Slider.
 */
function SliderMarkComponent(_props: SliderMarkProps): React.ReactElement | null {
  return null
}
SliderMarkComponent.displayName = 'Slider.Mark'

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'color'> {
  /** Size of the slider. Controls track height and thumb diameter. */
  size?: SliderSize
  /** Color of the range fill and thumb border. */
  color?: SliderColor
  /**
   * Tick marks along the scale. Numbers are shorthand, so
   * `marks={[0, 50, 100]}` is the common case in one line. For custom captions
   * use objects, or the `Slider.Mark` children form.
   */
  marks?: Array<number | SliderMark>
  /**
   * Show the current value in a bubble above the thumb.
   *
   * - `false` (default) — no bubble.
   * - `'always'` — always visible.
   * - `'interact'` — only while the thumb is focused or being dragged, which
   *   keeps a dense form quiet until someone is actually using the control.
   *
   * `true` is accepted as an alias for `'always'`.
   */
  showValue?: boolean | 'always' | 'interact'
  /** Format the bubble's text. Defaults to the raw number. */
  formatValue?: (value: number) => React.ReactNode
}

/** Normalise the two authoring forms into one list, sorted by position. */
function collectMarks(
  marks: SliderProps['marks'],
  children: React.ReactNode,
): SliderMark[] {
  const out: SliderMark[] = []
  for (const m of marks ?? []) {
    out.push(typeof m === 'number' ? { value: m } : m)
  }
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== SliderMarkComponent) return
    const p = child.props as SliderMarkProps
    out.push({ value: p.value, label: p.children ?? p.label })
  })
  return out.sort((a, b) => a.value - b.value)
}

/**
 * A Radix-powered slider supporting single or multiple thumbs.
 *
 * Pass `defaultValue={[50]}` for a single thumb, or `defaultValue={[25, 75]}`
 * for a range slider with two thumbs. One `<Thumb>` is rendered per value entry.
 *
 * When using multiple thumbs, provide per-thumb labels via the `aria-label` array
 * on the `value`/`defaultValue` entries, or wrap each in a labelled form field.
 *
 * **Sizes:** `sm` | `md` (default) | `lg`
 *
 * **Colors:** `accent` (default) | `success` | `warning` | `error`
 */
const SliderRoot = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, 'aria-label': ariaLabel, value, defaultValue, size: sizeProp = 'md', color: colorProp = 'accent', marks, showValue = false, formatValue, children, ...props }, ref) => {
  const size = sizeProp ?? 'md'
  const color = colorProp ?? 'accent'
  const fieldCtx = useFormField()
  const isError = fieldCtx.state === 'error'
  const ariaDescribedBy = props['aria-describedby'] ?? fieldCtx.helperTextId
  const ariaRequired = props['aria-required'] ?? fieldCtx.required

  // Determine how many thumbs to render from controlled or default value
  const resolvedValue = value ?? defaultValue ?? [0]
  const thumbCount = resolvedValue.length

  const min = props.min ?? 0
  const max = props.max ?? 100
  const span = max - min || 1

  const allMarks = collectMarks(marks, children)
  const hasMarks = allMarks.length > 0
  const bubble = showValue === true ? 'always' : showValue || undefined

  // Uncontrolled sliders move without re-rendering us, so the bubble has to
  // track the primitive's own state rather than the `value` prop.
  const [liveValues, setLiveValues] = React.useState<number[]>(resolvedValue)
  const shownValues = value ?? liveValues
  const handleValueChange = React.useCallback(
    (next: number[]) => {
      setLiveValues(next)
      props.onValueChange?.(next)
    },
    [props],
  )
  const [interacting, setInteracting] = React.useState(false)
  const bubbleVisible = bubble === 'always' || (bubble === 'interact' && interacting)

  return (
    <SliderPrimitive.Root
      ref={ref}
      // One palette for the whole control, so the track fill and the thumb
      // edge can never disagree.
      data-palette={color}
      value={value}
      defaultValue={defaultValue}
      aria-invalid={isError || undefined}
      aria-describedby={ariaDescribedBy}
      aria-required={ariaRequired || undefined}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        // Ticks sit under the track, so the control needs room for them or the
        // captions collide with whatever follows in the form.
        hasMarks && 'mb-ds-05',
        className,
      )}
      {...props}
      onValueChange={handleValueChange}
    >
      <SliderPrimitive.Track className={sliderTrackVariants({ size })}>
        <SliderPrimitive.Range className={cn('absolute h-full', SLIDER_RANGE_FILL)} />
      </SliderPrimitive.Track>

      {/* Ticks. Decorative — the value is already announced by the thumb's
          role="slider", so a screen reader reading these too would just be
          noise. */}
      {hasMarks && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full">
          {allMarks.map((m) => (
            <div
              key={m.value}
              className="absolute flex -translate-x-1/2 flex-col items-center gap-ds-01"
              style={{ insetInlineStart: `${((m.value - min) / span) * 100}%` }}
            >
              <span className="h-ds-02 w-px bg-surface-border-strong" />
              {m.label !== null && (
                <span className="text-label-xs text-surface-fg-subtle tabular-nums">
                  {m.label ?? m.value}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          onPointerDown={() => setInteracting(true)}
          onPointerUp={() => setInteracting(false)}
          onFocus={() => setInteracting(true)}
          onBlur={() => setInteracting(false)}
          aria-label={thumbCount === 1 ? (ariaLabel as string | undefined) : undefined}
          // `role="slider"` lives on the THUMB, and Radix renders Root as a
          // <span> — not a labellable element — so `<Label htmlFor>` cannot name
          // this control the way it names Input/Select. Without an explicit
          // aria-label the thumb had NO accessible name even inside
          // FormField + Label. Point it at the field's label instead.
          //
          // Single-thumb only: with a range, one label cannot disambiguate the
          // two thumbs, so the consumer must name each (`aria-label` per thumb).
          aria-labelledby={
            thumbCount === 1 && !ariaLabel ? fieldCtx.labelId : undefined
          }
          className={sliderThumbVariants({ size, color })}
        >
          {/* Rendered INSIDE the thumb so it tracks the handle for free —
              positioning a sibling would mean duplicating Radix's own maths and
              re-deriving it on every drag. */}
          {bubble && (
            <span
              aria-hidden="true"
              data-visible={bubbleVisible || undefined}
              className={cn(
                'pointer-events-none absolute bottom-full left-1/2 mb-ds-02 -translate-x-1/2',
                'rounded-control-inner bg-palette-solid px-ds-02 py-ds-01',
                'text-label-xs tabular-nums text-palette-fg',
                'transition-opacity duration-fast-02 ease-productive-standard',
                'opacity-0 data-[visible]:opacity-100',
              )}
            >
              {formatValue ? formatValue(shownValues[i]) : shownValues[i]}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
})
SliderRoot.displayName = SliderPrimitive.Root.displayName

/**
 * Slider with an optional scale.
 *
 * Two ways to declare ticks, because the common case should be one line and the
 * custom case should still be possible:
 *
 * ```tsx
 * <Slider marks={[0, 25, 50, 75, 100]} />
 *
 * <Slider showValue="interact">
 *   <Slider.Mark value={0}>Off</Slider.Mark>
 *   <Slider.Mark value={80}>Recommended</Slider.Mark>
 * </Slider>
 * ```
 */
const Slider = Object.assign(SliderRoot, { Mark: SliderMarkComponent })

// The Mark component is reached as `Slider.Mark`, not exported standalone — a
// second export named SliderMark would collide with the SliderMark interface,
// which is the more useful public name (it types the `marks` prop).
export { Slider, sliderThumbVariants,sliderTrackVariants }
