'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconActivity,
  IconCalendarPlus,
  IconClockHour4,
  IconHeartbeat,
  IconPhoneCall,
  IconTemperature,
} from '@tabler/icons-react'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const slots = [
  { time: '9:00 am', available: true },
  { time: '9:30 am', available: false },
  { time: '10:00 am', available: true },
  { time: '10:30 am', available: true },
  { time: '11:00 am', available: false },
  { time: '11:30 am', available: true },
  { time: '12:00 pm', available: true },
  { time: '12:30 pm', available: false },
]

const history = [
  { date: '18 May', what: 'Annual check-up', doctor: 'Dr. Anjali Rao', tag: 'general' },
  { date: '02 Apr', what: 'Lipid profile · LDL borderline', doctor: 'Dr. Anjali Rao', tag: 'lab' },
  { date: '14 Feb', what: 'Vaccination · Tdap booster', doctor: 'Dr. Krishna Iyer', tag: 'vaccine' },
]

export function VaidyaShowcase() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>('10:00 am')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-ds-05">
      {/* Patient overview */}
      <div className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-ds-04">
              <Avatar size="lg">
                <AvatarFallback>RS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-ds-01">
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  Patient · MRN 4382-019
                </Text>
                <Text variant="heading-md" className="text-surface-fg">
                  Rohan Suri
                </Text>
                <div className="flex items-center gap-ds-02">
                  <Badge variant="soft" color="accent">
                    34 years
                  </Badge>
                  <Badge variant="soft" color="neutral">
                    Male
                  </Badge>
                  <Badge variant="soft" color="success">
                    Active care
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Mild hypertension, well-controlled on lifestyle changes. No known drug allergies.
              Last reviewed 18 May 2026 by Dr. Anjali Rao.
            </Text>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-ds-04">
          <Vital icon={IconHeartbeat} label="Resting HR" value="72" unit="bpm" status="normal" />
          <Vital icon={IconActivity} label="Blood pressure" value="128/82" unit="mmHg" status="watch" />
          <Vital icon={IconTemperature} label="Temperature" value="36.6" unit="°C" status="normal" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent history</CardTitle>
            <Button variant="ghost" size="sm">
              Full timeline
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="group/row flex items-start gap-ds-04 px-ds-03 -mx-ds-03 py-ds-03 rounded-ds-md border-b border-surface-border-subtle last:border-b-0 hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center min-w-[3rem]">
                    <span className="text-ds-xs text-surface-fg-subtle">{h.date.split(' ')[1]}</span>
                    <span className="text-ds-md text-surface-fg font-semibold">{h.date.split(' ')[0]}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">{h.what}</span>
                    <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">{h.doctor}</span>
                  </div>
                  <Badge variant="soft" color="neutral" size="sm">
                    {h.tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Appointment booking */}
      <aside className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Book a follow-up</CardTitle>
            <CardDescription>Tomorrow · Wed, 25 May</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-04">
            <div className="grid grid-cols-2 gap-ds-02">
              {slots.map((s) => {
                const active = selectedSlot === s.time
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    className={[
                      'relative flex items-center justify-center gap-ds-02 h-10 rounded-ds-md border text-ds-sm transition-colors duration-fast-01',
                      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                      !s.available && 'border-surface-border-subtle text-surface-fg-subtle line-through cursor-not-allowed',
                      s.available && 'border-surface-border-subtle text-surface-fg hover:border-accent-9 hover:bg-accent-2',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {active && (
                      <motion.span
                        layoutId="vaidya-slot-pill"
                        className="absolute inset-0 -m-px rounded-ds-md border-2 border-accent-9 bg-accent-3"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <IconClockHour4 size={12} className={active ? 'relative z-[1] text-accent-11' : 'relative z-[1]'} />
                    <span className={active ? 'relative z-[1] text-accent-11' : 'relative z-[1]'}>{s.time}</span>
                  </button>
                )
              })}
            </div>
            <Button
              size="lg"
              startIcon={<IconCalendarPlus size={16} />}
              fullWidth
              onClickAsync={async () => {
                await sleep(1300)
              }}
            >
              {selectedSlot ? `Book ${selectedSlot}` : 'Pick a slot'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Care team</CardTitle>
            <Button variant="ghost" size="icon-sm" aria-label="Call">
              <IconPhoneCall size={14} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-ds-03">
              <Avatar size="sm">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <Text variant="body-sm" className="text-surface-fg truncate">
                  Dr. Anjali Rao
                </Text>
                <Text variant="body-xs" className="text-surface-fg-subtle truncate">
                  General medicine · Belur Clinic
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function Vital({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: typeof IconHeartbeat
  label: string
  value: string
  unit: string
  status: 'normal' | 'watch'
}) {
  return (
    <Card className="p-ds-06 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">{label}</span>
        <span
          className={[
            'w-7 h-7 rounded-ds-sm flex items-center justify-center',
            status === 'normal' ? 'bg-success-3 text-success-11' : 'bg-warning-3 text-warning-11',
          ].join(' ')}
        >
          <Icon size={14} />
        </span>
      </div>
      <div className="mt-ds-03">
        <span className="text-ds-2xl text-surface-fg font-semibold leading-none">{value}</span>
        <span className="text-ds-sm font-normal text-surface-fg-subtle ml-ds-01">{unit}</span>
      </div>
      <Badge size="sm" variant="soft" color={status === 'normal' ? 'success' : 'warning'} className="mt-ds-03 self-start">
        {status === 'normal' ? 'Normal range' : 'Watch'}
      </Badge>
    </Card>
  )
}
