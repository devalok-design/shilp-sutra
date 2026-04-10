'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'

interface AudioWaveformProps extends React.SVGAttributes<SVGSVGElement> {
  /** 'live' reads from AnalyserNode in real-time. 'static' renders pre-computed data. */
  mode: 'live' | 'static'
  /** Web Audio API analyser node — required for live mode */
  analyserNode?: AnalyserNode | null
  /** Pre-computed amplitude data (0-1 normalized) — required for static mode */
  data?: number[]
  /** Playback progress 0-1 — static mode only, controls fill coloring */
  progress?: number
  /** Bar width in pixels @default 3 */
  barWidth?: number
  /** Gap between bars in pixels @default 2 */
  barGap?: number
  /** Number of bars to render @default 40 */
  barCount?: number
  /** Height in pixels @default 32 */
  height?: number
}

const AudioWaveform = React.forwardRef<SVGSVGElement, AudioWaveformProps>(
  function AudioWaveform(
    {
      mode,
      analyserNode,
      data,
      progress = 0,
      barWidth = 3,
      barGap = 2,
      barCount = 40,
      height = 32,
      className,
      ...props
    },
    ref
  ) {
    const [bars, setBars] = React.useState<number[]>(() =>
      new Array(barCount).fill(0.05)
    )
    const animFrameRef = React.useRef<number>(0)
    const prevBarsRef = React.useRef<number[]>(bars)

    // Live mode — read from AnalyserNode on each animation frame
    React.useEffect(() => {
      if (mode !== 'live' || !analyserNode) return

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
      const smoothingFactor = 0.3

      const tick = () => {
        analyserNode.getByteFrequencyData(dataArray)

        const barsPerBin = Math.floor(dataArray.length / barCount)
        const newBars = new Array(barCount)

        for (let i = 0; i < barCount; i++) {
          let sum = 0
          for (let j = 0; j < barsPerBin; j++) {
            sum += dataArray[i * barsPerBin + j]
          }
          const target = sum / (barsPerBin * 255)
          newBars[i] =
            prevBarsRef.current[i] +
            (target - prevBarsRef.current[i]) * smoothingFactor
        }

        prevBarsRef.current = newBars
        setBars(newBars)
        animFrameRef.current = requestAnimationFrame(tick)
      }

      animFrameRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(animFrameRef.current)
    }, [mode, analyserNode, barCount])

    // Static mode — resample pre-computed data to barCount bars
    React.useEffect(() => {
      if (mode !== 'static' || !data) return

      if (data.length === barCount) {
        setBars(data)
      } else {
        const resampled = new Array(barCount)
        const ratio = data.length / barCount
        for (let i = 0; i < barCount; i++) {
          const index = Math.floor(i * ratio)
          resampled[i] = data[Math.min(index, data.length - 1)]
        }
        setBars(resampled)
      }
    }, [mode, data, barCount])

    const svgWidth = barCount * (barWidth + barGap) - barGap

    const renderedBars = React.useMemo(
      () =>
        bars.map((amplitude, i) => {
          const barHeight = Math.max(2, amplitude * height)
          const x = i * (barWidth + barGap)
          const y = (height - barHeight) / 2
          const isFilled =
            mode === 'static' && progress > 0 && i / barCount <= progress

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={
                isFilled
                  ? 'var(--color-accent-9)'
                  : 'var(--color-surface-border)'
              }
            />
          )
        }),
      [bars, progress, mode, barWidth, barGap, barCount, height]
    )

    return (
      <svg
        ref={ref}
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cn('shrink-0', className)}
        {...props}
      >
        {renderedBars}
      </svg>
    )
  }
)
AudioWaveform.displayName = 'AudioWaveform'

export { AudioWaveform }
export type { AudioWaveformProps }
