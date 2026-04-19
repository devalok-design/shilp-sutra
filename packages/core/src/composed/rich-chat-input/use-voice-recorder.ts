'use client'

import { useCallback, useEffect,useRef, useState } from 'react'

export interface UseVoiceRecorderOptions {
  maxDuration?: number
  onComplete: (blob: Blob, duration: number, waveformData: number[]) => void
}

export interface UseVoiceRecorderReturn {
  state: 'idle' | 'recording' | 'paused'
  duration: number
  analyserNode: AnalyserNode | null
  waveformData: number[]
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
  pause: () => void
  resume: () => void
}

function getSupportedMimeType(): string {
  if (
    typeof MediaRecorder !== 'undefined' &&
    MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
  ) {
    return 'audio/webm;codecs=opus'
  }
  if (
    typeof MediaRecorder !== 'undefined' &&
    MediaRecorder.isTypeSupported('audio/mp4')
  ) {
    return 'audio/mp4'
  }
  return ''
}

export function useVoiceRecorder(
  options: UseVoiceRecorderOptions
): UseVoiceRecorderReturn {
  const { maxDuration, onComplete } = options

  const [state, setState] = useState<'idle' | 'recording' | 'paused'>('idle')
  const [duration, setDuration] = useState(0)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const waveformTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const durationRef = useRef(0)
  const waveformRef = useRef<number[]>([])
  const cancelledRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref fresh without causing re-renders of callbacks
  onCompleteRef.current = onComplete

  const cleanup = useCallback(() => {
    if (durationTimerRef.current !== null) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
    if (waveformTimerRef.current !== null) {
      clearInterval(waveformTimerRef.current)
      waveformTimerRef.current = null
    }
    if (maxDurationTimerRef.current !== null) {
      clearTimeout(maxDurationTimerRef.current)
      maxDurationTimerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    analyserRef.current = null
    setAnalyserNode(null)
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  const start = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined') {
      throw new Error(
        'MediaRecorder is not supported in this browser. Voice recording requires a modern browser with MediaRecorder support.'
      )
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const mimeType = getSupportedMimeType()
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    chunksRef.current = []
    cancelledRef.current = false

    // Set up Web Audio API for analyser
    const audioContext = new AudioContext()
    audioContextRef.current = audioContext
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.7
    source.connect(analyser)
    analyserRef.current = analyser
    setAnalyserNode(analyser)

    // Collect chunks
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    // Handle stop
    recorder.onstop = () => {
      if (!cancelledRef.current) {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        // Capture current values before cleanup resets them
        const finalDuration = durationRef.current
        const finalWaveform = waveformRef.current
        cleanup()
        setState('idle')
        setDuration(0)
        setWaveformData([])
        onCompleteRef.current(blob, finalDuration, finalWaveform)
      } else {
        cleanup()
        setState('idle')
        setDuration(0)
        setWaveformData([])
      }
    }

    // Start recording
    recorder.start()

    // Duration timer
    setDuration(0)
    durationRef.current = 0
    durationTimerRef.current = setInterval(() => {
      durationRef.current += 1
      setDuration((prev) => prev + 1)
    }, 1000)

    // Waveform capture
    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    setWaveformData([])
    waveformRef.current = []
    waveformTimerRef.current = setInterval(() => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(frequencyData)
        let sum = 0
        for (let i = 0; i < frequencyData.length; i++) {
          sum += frequencyData[i]
        }
        const average = sum / frequencyData.length / 255
        waveformRef.current = [...waveformRef.current, average]
        setWaveformData((prev) => [...prev, average])
      }
    }, 100)

    // Max duration auto-stop
    if (maxDuration !== undefined && maxDuration > 0) {
      maxDurationTimerRef.current = setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== 'inactive'
        ) {
          mediaRecorderRef.current.stop()
        }
      }, maxDuration * 1000)
    }

    setState('recording')
  }, [maxDuration, cleanup])

  const stop = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      cancelledRef.current = false
      mediaRecorderRef.current.stop()
    }
  }, [])

  const cancel = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      cancelledRef.current = true
      mediaRecorderRef.current.stop()
    } else {
      // Already inactive, just reset
      cleanup()
      setState('idle')
      setDuration(0)
      setWaveformData([])
    }
  }, [cleanup])

  const pause = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.pause()
      if (durationTimerRef.current !== null) {
        clearInterval(durationTimerRef.current)
        durationTimerRef.current = null
      }
      if (waveformTimerRef.current !== null) {
        clearInterval(waveformTimerRef.current)
        waveformTimerRef.current = null
      }
      setState('paused')
    }
  }, [])

  const resume = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'paused'
    ) {
      mediaRecorderRef.current.resume()

      // Resume duration timer
      durationTimerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration((prev) => prev + 1)
      }, 1000)

      // Resume waveform capture
      const frequencyData = new Uint8Array(
        analyserRef.current?.frequencyBinCount ?? 128
      )
      waveformTimerRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(frequencyData)
          let sum = 0
          for (let i = 0; i < frequencyData.length; i++) {
            sum += frequencyData[i]
          }
          const average = sum / frequencyData.length / 255
          waveformRef.current = [...waveformRef.current, average]
          setWaveformData((prev) => [...prev, average])
        }
      }, 100)

      setState('recording')
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current !== null) {
        clearInterval(durationTimerRef.current)
      }
      if (waveformTimerRef.current !== null) {
        clearInterval(waveformTimerRef.current)
      }
      if (maxDurationTimerRef.current !== null) {
        clearTimeout(maxDurationTimerRef.current)
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [])

  return {
    state,
    duration,
    analyserNode,
    waveformData,
    start,
    stop,
    cancel,
    pause,
    resume,
  }
}
