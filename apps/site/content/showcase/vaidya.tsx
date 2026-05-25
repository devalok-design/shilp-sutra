'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconActivity,
  IconAlertTriangle,
  IconCalendarPlus,
  IconClockHour4,
  IconDroplet,
  IconHeartbeat,
  IconLungs,
  IconPhoneCall,
  IconPill,
  IconStethoscope,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@devalok/shilp-sutra/ui/accordion'
import { Alert } from '@devalok/shilp-sutra/ui/alert'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Combobox } from '@devalok/shilp-sutra/ui/combobox'
import { DataTable } from '@devalok/shilp-sutra/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@devalok/shilp-sutra/ui/tooltip'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type VitalStatus = 'normal' | 'watch' | 'critical'
type Trend = 'up' | 'down' | 'flat'

type Vital = {
  icon: typeof IconHeartbeat
  label: string
  value: string
  unit: string
  measuredAt: string
  range: string
  trend: Trend
  status: VitalStatus
  sparkline: number[]
}

const vitals: Vital[] = [
  {
    icon: IconActivity,
    label: 'Blood pressure',
    value: '136/88',
    unit: 'mmHg',
    measuredAt: 'today, 8:12 am',
    range: 'Normal: <130/80',
    trend: 'up',
    status: 'watch',
    sparkline: [122, 124, 128, 126, 132, 130, 136],
  },
  {
    icon: IconHeartbeat,
    label: 'Resting heart rate',
    value: '74',
    unit: 'bpm',
    measuredAt: 'today, 8:12 am',
    range: 'Normal: 60-90 bpm',
    trend: 'flat',
    status: 'normal',
    sparkline: [72, 74, 73, 75, 72, 74, 74],
  },
  {
    icon: IconLungs,
    label: 'SpO2',
    value: '97',
    unit: '%',
    measuredAt: 'today, 8:12 am',
    range: 'Normal: 95-100%',
    trend: 'flat',
    status: 'normal',
    sparkline: [97, 98, 97, 96, 97, 98, 97],
  },
]

type LabRow = {
  test: string
  value: string
  unit: string
  range: string
  flag: 'normal' | 'high' | 'low' | 'critical'
  drawnOn: string
}

const labRows: LabRow[] = [
  { test: 'HbA1c', value: '6.4', unit: '%', range: '4.0 - 5.6', flag: 'high', drawnOn: '20 May 2026' },
  { test: 'eGFR', value: '88', unit: 'mL/min/1.73m²', range: '>= 90', flag: 'low', drawnOn: '20 May 2026' },
  { test: 'LDL cholesterol', value: '128', unit: 'mg/dL', range: '<100', flag: 'high', drawnOn: '20 May 2026' },
  { test: 'TSH', value: '2.1', unit: 'mIU/L', range: '0.4 - 4.0', flag: 'normal', drawnOn: '20 May 2026' },
  { test: 'Potassium', value: '3.2', unit: 'mmol/L', range: '3.5 - 5.0', flag: 'critical', drawnOn: '20 May 2026' },
  { test: 'Haemoglobin', value: '14.6', unit: 'g/dL', range: '13.0 - 17.0', flag: 'normal', drawnOn: '20 May 2026' },
]

const medications = [
  { name: 'Telmisartan', strength: '40 mg', schedule: '1-0-0, after breakfast', startedOn: '12 Mar 2026', adherence: 'adherent' as const },
  { name: 'Metformin', strength: '500 mg', schedule: '1-0-1, with meals', startedOn: '08 Jan 2026', adherence: 'missed' as const },
  { name: 'Atorvastatin', strength: '10 mg', schedule: '0-0-1, after dinner', startedOn: '02 Apr 2026', adherence: 'adherent' as const },
  { name: 'Levothyroxine', strength: '50 mcg', schedule: '1-0-0, empty stomach', startedOn: '15 Nov 2025', adherence: 'stopped' as const },
]

const visits = [
  {
    id: 'visit-1',
    date: '18 May 2026',
    title: 'Follow-up, hypertension',
    clinician: 'Dr. Anjali Rao, MD',
    complaint: 'Mild morning headaches for two weeks. No chest pain or visual disturbance.',
    plan: 'Continue Telmisartan 40 mg. Add home BP log, twice daily for 14 days. Repeat lipid panel in 6 weeks.',
    prescription: 'Telmisartan 40 mg, Atorvastatin 10 mg',
  },
  {
    id: 'visit-2',
    date: '02 Apr 2026',
    title: 'Lipid review',
    clinician: 'Dr. Anjali Rao, MD',
    complaint: 'Routine review. LDL 142 on prior panel. Asymptomatic.',
    plan: 'Initiate Atorvastatin 10 mg at bedtime. Diet counselling shared. Recheck LDL in 8 weeks.',
    prescription: 'Atorvastatin 10 mg',
  },
  {
    id: 'visit-3',
    date: '14 Feb 2026',
    title: 'Diabetes screening',
    clinician: 'Dr. Krishna Iyer, MBBS',
    complaint: 'Family history of type 2 diabetes. Fasting plasma glucose 112 mg/dL.',
    plan: 'Initiate Metformin 500 mg BD. Refer to dietician. HbA1c in 12 weeks.',
    prescription: 'Metformin 500 mg',
  },
]

const specialists = [
  { value: 'cardio', label: 'Cardiologist' },
  { value: 'endo', label: 'Endocrinologist' },
  { value: 'nephro', label: 'Nephrologist' },
  { value: 'gp', label: 'General medicine' },
  { value: 'ophthal', label: 'Ophthalmologist' },
  { value: 'derm', label: 'Dermatologist' },
]

const careTeam = [
  { initials: 'AR', name: 'Dr. Anjali Rao', role: 'General medicine, Belur Clinic', active: true },
  { initials: 'KI', name: 'Dr. Krishna Iyer', role: 'Endocrinology, Apollo Sarjapur', active: false },
  { initials: 'SN', name: 'Dr. Shreya Nambiar', role: 'Cardiology, Manipal Hospital', active: true },
]

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

const flagBadge: Record<LabRow['flag'], { color: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  normal: { color: 'success', label: 'Within range' },
  high: { color: 'warning', label: 'High' },
  low: { color: 'warning', label: 'Low' },
  critical: { color: 'error', label: 'Critical' },
}

const adherenceBadge: Record<'adherent' | 'missed' | 'stopped', { color: 'success' | 'warning' | 'neutral'; label: string }> = {
  adherent: { color: 'success', label: 'Adherent' },
  missed: { color: 'warning', label: 'Missed today' },
  stopped: { color: 'neutral', label: 'Stopped' },
}

function Sparkline({ data, status }: { data: number[]; status: VitalStatus }) {
  const w = 64
  const h = 20
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / span) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const stroke =
    status === 'critical' ? 'stroke-error-9' : status === 'watch' ? 'stroke-warning-9' : 'stroke-success-9'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="overflow-visible">
      <polyline points={points} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={stroke} />
    </svg>
  )
}

type LabCell = { row: { original: LabRow } }

export function VaidyaShowcase() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>('10:00 am')
  const [specialist, setSpecialist] = useState<string>('cardio')

  const labColumns = useMemo(
    () => [
      {
        accessorKey: 'test',
        header: 'Test',
        cell: ({ row }: LabCell) => (
          <div className="flex flex-col">
            <span className="text-ds-sm font-semibold text-surface-fg">{row.original.test}</span>
            <span className="text-ds-xs text-surface-fg-subtle">{row.original.drawnOn}</span>
          </div>
        ),
      },
      {
        accessorKey: 'value',
        header: 'Result',
        cell: ({ row }: LabCell) => {
          const r = row.original
          const tone: string =
            r.flag === 'critical'
              ? 'text-error-11'
              : r.flag === 'high' || r.flag === 'low'
                ? 'text-warning-11'
                : 'text-surface-fg'
          return (
            <span className={`tabular-nums font-semibold ${tone}`}>
              {r.value} <span className="text-surface-fg-subtle font-normal">{r.unit}</span>
            </span>
          )
        },
      },
      {
        accessorKey: 'range',
        header: 'Reference',
        cell: ({ row }: LabCell) => (
          <span className="text-ds-xs text-surface-fg-muted tabular-nums">{row.original.range}</span>
        ),
      },
      {
        accessorKey: 'flag',
        header: 'Flag',
        cell: ({ row }: LabCell) => {
          const b = flagBadge[row.original.flag]
          return (
            <Badge variant="soft" color={b.color} size="sm">
              {b.label}
            </Badge>
          )
        },
      },
    ],
    [],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-ds-05">
      <div className="flex flex-col gap-ds-05">
        {/* Identity card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-ds-04">
              <Avatar size="lg">
                <AvatarFallback>RS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-ds-02 flex-1 min-w-0">
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  Patient, MRN 4382-019
                </Text>
                <Text variant="heading-md" className="text-surface-fg">
                  Rohan Suri
                </Text>
                <div className="flex flex-wrap items-center gap-ds-02">
                  <Badge variant="soft" color="accent" size="sm">
                    34 y
                  </Badge>
                  <Badge variant="soft" color="neutral" size="sm">
                    Male
                  </Badge>
                  <Badge variant="soft" color="error" size="sm" startIcon={<IconDroplet size={10} />}>
                    O+ blood group
                  </Badge>
                  <Badge variant="soft" color="warning" size="sm">
                    Allergy: Sulfa drugs
                  </Badge>
                  <Badge variant="soft" color="warning" size="sm">
                    Allergy: Penicillin
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Type 2 diabetes and stage-1 hypertension, both on first-line therapy. Last reviewed 18 May 2026
              by Dr. Anjali Rao. Next scheduled review in 6 weeks.
            </Text>
          </CardContent>
        </Card>

        {/* Critical lab alert */}
        <Alert variant="subtle" color="error" size="md" title="Potassium below range. Review.">
          Serum potassium 3.2 mmol/L on the 20 May panel, reference 3.5 to 5.0. Recommend repeat in 48 hours and a
          review of Telmisartan dose before the next prescription.
        </Alert>

        {/* Vital tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-ds-03 sm:gap-ds-04">
          {vitals.map((v) => (
            <VitalTile key={v.label} vital={v} />
          ))}
        </div>

        {/* Tabbed clinical view */}
        <Card>
          <CardContent className="pt-ds-05">
            <Tabs defaultValue="summary">
              <TabsList variant="line" size="md">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="labs">Labs</TabsTrigger>
                <TabsTrigger value="imaging">Imaging</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-ds-04">
                <div className="flex flex-col gap-ds-03">
                  <Text variant="body-sm" className="text-surface-fg">
                    Active problems: type 2 diabetes (E11.9), essential hypertension (I10), mild hypothyroidism on
                    replacement (E03.9).
                  </Text>
                  <Text variant="body-sm" className="text-surface-fg-muted">
                    Most recent BP trend is upward over the last seven readings. HbA1c is just above target. LDL
                    remains above 100 mg/dL on Atorvastatin 10 mg. Potassium dropped into the critical range on
                    the 20 May panel and warrants a repeat before the next refill.
                  </Text>
                </div>
              </TabsContent>

              <TabsContent value="medications" className="mt-ds-04">
                <ul className="flex flex-col">
                  {medications.map((m) => {
                    const a = adherenceBadge[m.adherence]
                    return (
                      <li
                        key={m.name}
                        className="flex items-start gap-ds-04 px-ds-03 -mx-ds-03 py-ds-03 rounded-ds-md border-b border-surface-border-subtle last:border-b-0 hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard"
                      >
                        <span className="w-9 h-9 rounded-ds-sm bg-accent-3 text-accent-11 flex items-center justify-center shrink-0">
                          <IconPill size={16} />
                        </span>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-ds-md text-surface-fg font-semibold">
                            {m.name} <span className="text-surface-fg-muted font-normal">{m.strength}</span>
                          </span>
                          <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">
                            {m.schedule}, since {m.startedOn}
                          </span>
                        </div>
                        <Badge variant="soft" color={a.color} size="sm">
                          {a.label}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              </TabsContent>

              <TabsContent value="labs" className="mt-ds-04">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <DataTable columns={labColumns as any} data={labRows} density="compact" />
              </TabsContent>

              <TabsContent value="imaging" className="mt-ds-04">
                <div className="flex flex-col gap-ds-03 py-ds-04">
                  <Text variant="body-sm" className="text-surface-fg">
                    Echocardiogram, 04 Apr 2026. LVEF 58%, normal chamber dimensions, no regional wall motion
                    abnormality.
                  </Text>
                  <Text variant="body-sm" className="text-surface-fg-muted">
                    Chest X-ray, 14 Feb 2026. Clear lung fields, normal cardiac silhouette.
                  </Text>
                </div>
              </TabsContent>

              <TabsContent value="visits" className="mt-ds-04">
                <Accordion type="single" collapsible defaultValue="visit-1">
                  {visits.map((v) => (
                    <AccordionItem key={v.id} value={v.id}>
                      <AccordionTrigger>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-ds-md text-surface-fg font-semibold">{v.title}</span>
                          <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">
                            {v.date}, {v.clinician}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-ds-03 pt-ds-02">
                          <div>
                            <Text variant="label-sm" className="text-surface-fg-subtle">
                              Chief complaint
                            </Text>
                            <Text variant="body-sm" className="text-surface-fg mt-ds-01">
                              {v.complaint}
                            </Text>
                          </div>
                          <div>
                            <Text variant="label-sm" className="text-surface-fg-subtle">
                              Plan
                            </Text>
                            <Text variant="body-sm" className="text-surface-fg mt-ds-01">
                              {v.plan}
                            </Text>
                          </div>
                          <div>
                            <Text variant="label-sm" className="text-surface-fg-subtle">
                              Prescription
                            </Text>
                            <Text variant="body-sm" className="text-surface-fg mt-ds-01">
                              {v.prescription}
                            </Text>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Appointment booker + care team */}
      <aside className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Book a follow-up</CardTitle>
            <CardDescription>Tomorrow, Tue 26 May 2026</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-04">
            <label className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-muted">
                Specialty
              </Text>
              <Combobox
                options={specialists}
                value={specialist}
                onValueChange={(v) => setSpecialist(v)}
                placeholder="Search for a specialist"
                searchPlaceholder="Type to filter"
                size="md"
              />
            </label>

            <div className="grid grid-cols-2 gap-ds-02">
              {slots.map((s) => {
                const active = selectedSlot === s.time
                const stateLabel = !s.available ? 'booked' : active ? 'selected' : 'available'
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    aria-label={`${s.time}, ${stateLabel}`}
                    aria-pressed={active}
                    onClick={() => setSelectedSlot(s.time)}
                    className={[
                      'relative flex items-center justify-center gap-ds-02 h-10 rounded-ds-md border text-ds-sm transition-colors duration-fast-01',
                      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                      !s.available && 'border-surface-border-subtle text-surface-fg-subtle line-through cursor-not-allowed',
                      s.available && !active && 'border-surface-border-subtle text-surface-fg hover:border-accent-9 hover:bg-accent-2',
                      s.available && active && 'border-accent-9 text-accent-12',
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
                    <IconClockHour4 size={12} className="relative z-[1]" />
                    <span className="relative z-[1]">{s.time}</span>
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
              {selectedSlot ? `Confirm ${selectedSlot}` : 'Pick a slot'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Care team</CardTitle>
            <Button variant="ghost" size="icon-sm" aria-label="Call primary clinician">
              <IconPhoneCall size={14} />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-03">
            {careTeam.map((c) => (
              <div key={c.name} className="flex items-center gap-ds-03">
                <span className="relative">
                  <Avatar size="sm">
                    <AvatarFallback>{c.initials}</AvatarFallback>
                  </Avatar>
                  <span
                    aria-label={c.active ? 'Active now' : 'Offline'}
                    className={[
                      'absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface-raised',
                      c.active ? 'bg-success-9' : 'bg-surface-fg-subtle',
                    ].join(' ')}
                  />
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <Text variant="body-sm" className="text-surface-fg truncate">
                    {c.name}
                  </Text>
                  <Text variant="body-xs" className="text-surface-fg-subtle truncate">
                    {c.role}
                  </Text>
                </div>
                <IconStethoscope size={14} className="text-surface-fg-subtle" />
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function VitalTile({ vital }: { vital: Vital }) {
  const Icon = vital.icon
  const TrendIcon = vital.trend === 'up' ? IconTrendingUp : vital.trend === 'down' ? IconTrendingDown : IconActivity
  const chipColor: 'success' | 'warning' | 'error' =
    vital.status === 'normal' ? 'success' : vital.status === 'watch' ? 'warning' : 'error'
  const chipLabel = vital.status === 'normal' ? 'Within range' : vital.status === 'watch' ? 'Watch' : 'Critical'
  const trendTone =
    vital.status === 'normal' ? 'text-success-11' : vital.status === 'watch' ? 'text-warning-11' : 'text-error-11'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="p-ds-04 sm:p-ds-05 flex flex-col gap-ds-03 cursor-help">
          <div className="flex items-center justify-between">
            <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">{vital.label}</span>
            <span
              className={[
                'w-7 h-7 rounded-ds-sm flex items-center justify-center',
                vital.status === 'normal'
                  ? 'bg-success-3 text-success-11'
                  : vital.status === 'watch'
                    ? 'bg-warning-3 text-warning-11'
                    : 'bg-error-3 text-error-11',
              ].join(' ')}
            >
              <Icon size={14} />
            </span>
          </div>
          <div className="flex items-end justify-between gap-ds-03">
            <div>
              <span className="text-ds-2xl text-surface-fg font-semibold leading-none tabular-nums">
                {vital.value}
              </span>
              <span className="text-ds-sm font-normal text-surface-fg-subtle ml-ds-01">{vital.unit}</span>
            </div>
            <Sparkline data={vital.sparkline} status={vital.status} />
          </div>
          <div className="flex items-center justify-between">
            <Badge size="sm" variant="soft" color={chipColor}>
              {vital.status === 'critical' && <IconAlertTriangle size={10} />}
              {chipLabel}
            </Badge>
            <span className={`inline-flex items-center gap-ds-01 text-ds-xs ${trendTone}`}>
              <TrendIcon size={12} />
              {vital.measuredAt}
            </span>
          </div>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-ds-xs">{vital.range}</span>
      </TooltipContent>
    </Tooltip>
  )
}
