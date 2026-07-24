'use client'

import Link from 'next/link'
import * as React from 'react'

import {
  type ArchetypeName,
  type DensityName,
  type MotionName,
  type ShapeName,
} from '../../lib/archetype-presets'
import { PreviewFrame } from './PreviewFrame'

type QuestionId = 'feel' | 'density' | 'shape' | 'motion' | 'accent'

interface Choice<V extends string> {
  value: V
  label: string
  hint: string
}

const FEEL_CHOICES: Choice<ArchetypeName>[] = [
  { value: 'linear',   label: 'Sharp + focused',    hint: 'Engineering tool feel. Hairlines, dense, fast.' },
  { value: 'stripe',   label: 'Modern + balanced',  hint: 'SaaS baseline. Crisp borders, subtle shadows.' },
  { value: 'apple',    label: 'Soft + calm',        hint: 'Restrained, spacious, rounded corners.' },
  { value: 'notion',   label: 'Readable + writerly', hint: 'Editorial type, flat surfaces, lots of air.' },
  { value: 'devalok',  label: "I'll go with Devalok", hint: 'Warm grain on surfaces, halo focus, balanced rhythm.' },
]

const DENSITY_CHOICES: Choice<DensityName>[] = [
  { value: 'compact',     label: 'Compact',     hint: 'Dense screens, lots of data.' },
  { value: 'comfortable', label: 'Comfortable', hint: 'Default. Balanced for most apps.' },
  { value: 'spacious',    label: 'Spacious',    hint: 'Marketing-ish. Breathing room over density.' },
]

const SHAPE_CHOICES: Choice<ShapeName>[] = [
  { value: 'sharp',             label: 'Sharp',            hint: '2-4px corners. Editorial, technical.' },
  { value: 'slightly-rounded',  label: 'Slightly rounded', hint: '6-10px corners. Modern SaaS default.' },
  { value: 'rounded',           label: 'Rounded',          hint: '10-16px corners. Friendly, consumer.' },
]

const MOTION_CHOICES: Choice<MotionName>[] = [
  { value: 'off',    label: 'No motion',  hint: 'Instant transitions. Respects reduced-motion.' },
  { value: 'calm',   label: 'Calm',       hint: 'Default. Brief fades and slides.' },
  { value: 'lively', label: 'Lively',     hint: 'Springs, scale-on-tap, layered entrances.' },
]

const ACCENT_CHOICES: Choice<string>[] = [
  { value: '0,0.01',   label: 'Monochrome',   hint: 'Black/white. No accent hue.' },
  { value: '220,0.18', label: 'Cool blue',    hint: 'Stripe / Linear band.' },
  { value: '160,0.16', label: 'Forest green', hint: 'Trustworthy, finance-friendly.' },
  { value: '40,0.15',  label: 'Warm amber',   hint: 'Inviting, retail-friendly.' },
  { value: '340,0.19', label: 'Devalok pink', hint: 'Studio signature.' },
  { value: '270,0.21', label: 'Royal purple', hint: 'Creative, premium.' },
]

const QUESTIONS: { id: QuestionId; prompt: string; choices: Choice<string>[] }[] = [
  { id: 'feel',    prompt: 'What should it feel like?',         choices: FEEL_CHOICES },
  { id: 'density', prompt: 'How tight should layouts be?',      choices: DENSITY_CHOICES },
  { id: 'shape',   prompt: 'How rounded?',                       choices: SHAPE_CHOICES },
  { id: 'motion',  prompt: 'How animated?',                      choices: MOTION_CHOICES },
  { id: 'accent',  prompt: 'Pick an accent direction.',          choices: ACCENT_CHOICES },
]

export function WizardFlow() {
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Partial<Record<QuestionId, string>>>({})

  const current = QUESTIONS[step]
  const total = QUESTIONS.length

  const pick = (value: string) => {
    const next = { ...answers, [current.id]: value }
    setAnswers(next)
    if (step < total - 1) setStep(step + 1)
  }

  const goBack = () => setStep(Math.max(0, step - 1))

  // Live preview uses whatever's been picked so far.
  const archetype = (answers.feel as ArchetypeName) ?? 'stripe'
  const density = answers.density as DensityName | undefined
  const shape = answers.shape as ShapeName | undefined
  const accent = answers.accent ? answers.accent.split(',') : ['340', '0.19']
  const hue = Number(accent[0])
  const chroma = Number(accent[1])

  const isDone = step === total - 1 && answers.accent

  const params = new URLSearchParams()
  if (answers.feel) params.set('archetype', answers.feel)
  if (answers.density) params.set('density', answers.density)
  if (answers.shape) params.set('shape', answers.shape)
  if (answers.motion) params.set('motion', answers.motion)
  if (answers.accent) {
    params.set('hue', String(hue))
    params.set('chroma', String(chroma))
  }
  const resultHref = `/themer/result?${params.toString()}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-ds-06">
      <div className="flex flex-col gap-ds-05">
        <div
          aria-label={`Step ${step + 1} of ${total}`}
          className="flex items-center gap-ds-02 text-ds-xs text-surface-fg-subtle font-mono"
        >
          <span>
            {step + 1} / {total}
          </span>
          <div className="h-[2px] flex-1 bg-surface-raised-hover rounded-pill overflow-hidden">
            <div
              className="h-full bg-accent-9 transition-all duration-moderate-01"
              style={{ width: `${((step + (isDone ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-ds-2xl font-semibold text-surface-fg">{current.prompt}</h2>

        <div className="flex flex-col gap-ds-02">
          {current.choices.map((c) => {
            const isSelected = answers[current.id] === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => pick(c.value)}
                className={[
                  'group flex flex-col gap-ds-01 rounded-control border p-ds-04 text-left transition-colors duration-fast-01',
                  isSelected
                    ? 'border-accent-9 bg-accent-2'
                    : 'border-surface-border-subtle bg-surface-raised hover:border-surface-border-strong hover:bg-surface-raised-hover',
                ].join(' ')}
              >
                <span className="text-ds-md font-medium text-surface-fg">{c.label}</span>
                <span className="text-ds-sm text-surface-fg-muted">{c.hint}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-ds-03">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="text-ds-sm text-surface-fg-muted hover:text-surface-fg disabled:opacity-action-disabled disabled:hover:text-surface-fg-muted"
          >
            ← Back
          </button>
          {isDone && (
            <Link
              href={resultHref}
              className="inline-flex items-center gap-ds-02 rounded-control bg-accent-9 px-ds-05 py-ds-03 text-ds-sm font-medium text-accent-fg hover:bg-accent-10"
            >
              See result →
            </Link>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-ds-03 lg:w-[320px]">
        <span className="text-ds-xs text-surface-fg-subtle">
          Live preview
        </span>
        <PreviewFrame
          archetype={archetype}
          density={density}
          shape={shape}
          hue={hue}
          chroma={chroma}
          size="mini"
        />
        <p className="text-ds-xs text-surface-fg-subtle">
          Updates as you answer. The result page will have the install steps + CSS to paste.
        </p>
      </aside>
    </div>
  )
}
