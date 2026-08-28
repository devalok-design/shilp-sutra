'use client'

import { MotionConfig, MotionConfigContext } from 'framer-motion'
import * as React from 'react'

import { MotionContext } from './motion-provider'

type MotionPreferenceProps = {
  children: React.ReactNode
}

/**
 * Makes the OS `prefers-reduced-motion` setting the DEFAULT for a component's
 * animations, instead of something the consumer has to opt into.
 *
 * Framer Motion's `MotionConfigContext` defaults to `reducedMotion: "never"` —
 * meaning every `motion.*` element ignores the OS setting until some ancestor
 * says otherwise. Our only ancestor that says otherwise is `<MotionProvider>`,
 * which consumers are not required to mount, so out of the box the whole
 * library animated straight through a reduced-motion preference.
 *
 * Wrapping a component's root in this fixes that for the subtree. Under
 * `"user"`, Framer suppresses exactly the positional keys — width, height,
 * top/left/right/bottom and every transform — and leaves opacity, colour and
 * filter animating normally. That is the behaviour WCAG 2.3.3 asks for: kill
 * the movement, keep the fade.
 *
 * It renders no DOM, and defers to anything that has already made the call:
 *
 * - a mounted `<MotionProvider>` owns the decision, including the deliberate
 *   `reducedMotion={false}` "animate regardless" override;
 * - a bare `<MotionConfig>` that has moved off the default was set on purpose;
 * - nesting is self-cancelling — the outermost wrapper configures the context,
 *   and every one below it sees a non-default value and passes straight through.
 *
 * The one case it cannot read is a consumer who mounts `<MotionConfig
 * reducedMotion="never">` by hand to force animation on. That is
 * indistinguishable from the framework default, so this wrapper overrides it.
 * `<MotionProvider reducedMotion={false}>` is the supported way to express it.
 */
function MotionPreference({ children }: MotionPreferenceProps) {
  const provider = React.useContext(MotionContext)
  const framerConfig = React.useContext(MotionConfigContext)

  if (provider) return <>{children}</>
  if (framerConfig.reducedMotion !== 'never') return <>{children}</>

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

export { MotionPreference, type MotionPreferenceProps }
