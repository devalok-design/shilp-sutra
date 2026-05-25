'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconAlertTriangle,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconBuildingBank,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconInfoCircle,
  IconShieldCheck,
  IconWorld,
} from '@tabler/icons-react'
import { Alert } from '@devalok/shilp-sutra/ui/alert'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Combobox } from '@devalok/shilp-sutra/ui/combobox'
import { DataTable } from '@devalok/shilp-sutra/ui/data-table'
import { FormField, FormHelperText } from '@devalok/shilp-sutra/ui/form'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Label } from '@devalok/shilp-sutra/ui/label'
import { Progress } from '@devalok/shilp-sutra/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@devalok/shilp-sutra/ui/select'
import { Step, Stepper } from '@devalok/shilp-sutra/ui/stepper'
import { Tabs, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@devalok/shilp-sutra/ui/tooltip'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type Rail = 'UPI' | 'IMPS' | 'NEFT' | 'SWIFT' | 'Card'
type Status = 'settled' | 'pending' | 'failed'
type Currency = 'INR' | 'USD'

type Txn = {
  id: string
  party: string
  rail: Rail
  ref: string
  amount: number
  currency: Currency
  date: string
  status: Status
  direction: 'credit' | 'debit'
  isNew?: boolean
}

const initialTxns: Txn[] = [
  { id: 'TX-90412', party: 'Lendis Capital · Drawdown', rail: 'NEFT', ref: 'HDFC0001234 / UTR 5512', amount: 452318, currency: 'INR', date: '25 May, 09:14', status: 'settled', direction: 'credit' },
  { id: 'TX-90411', party: 'Marigold Studios LLP', rail: 'IMPS', ref: 'IFSC ICIC0002211', amount: 84000, currency: 'INR', date: '24 May, 18:02', status: 'settled', direction: 'debit' },
  { id: 'TX-90410', party: 'Stripe payout · USD wallet', rail: 'SWIFT', ref: 'CHASUS33 / MT103', amount: 2140.5, currency: 'USD', date: '24 May, 11:48', status: 'pending', direction: 'credit' },
  { id: 'TX-90409', party: 'AWS Mumbai · ap-south-1', rail: 'Card', ref: '**** 4291', amount: 31240, currency: 'INR', date: '23 May, 22:31', status: 'settled', direction: 'debit' },
  { id: 'TX-90408', party: 'Goutham Reddy · payroll', rail: 'UPI', ref: 'goutham@axl', amount: 145000, currency: 'INR', date: '22 May, 10:00', status: 'settled', direction: 'debit' },
  { id: 'TX-90407', party: 'Beneficiary penny drop', rail: 'IMPS', ref: 'KKBK0001789', amount: 1, currency: 'INR', date: '22 May, 09:58', status: 'failed', direction: 'debit' },
  { id: 'TX-90406', party: 'Setu KYC · subscription', rail: 'Card', ref: '**** 4291', amount: 24999, currency: 'INR', date: '21 May, 14:12', status: 'settled', direction: 'debit' },
]

const beneficiaries = [
  { value: 'yogin', label: 'Yogin Sharma · UPI yogin@axl' },
  { value: 'marigold', label: 'Marigold Studios LLP · ICIC0002211' },
  { value: 'goutham', label: 'Goutham Reddy · HDFC0001234' },
  { value: 'amal', label: 'Amal Pradeep · KKBK0001789' },
  { value: 'stripe', label: 'Stripe Inc · CHASUS33 (USD)' },
]

const purposes = [
  { value: 'salary', label: 'Salary or payroll' },
  { value: 'vendor', label: 'Vendor invoice' },
  { value: 'reimb', label: 'Reimbursement' },
  { value: 'tax', label: 'Tax remittance' },
  { value: 'capex', label: 'Capex purchase' },
]

const kycSteps = [
  { label: 'PAN verified', description: 'AAACL1234E' },
  { label: 'Aadhaar e-KYC', description: 'XXXX-XXXX-7821' },
  { label: 'GSTIN active', description: '29AAACL1234E1Z5' },
  { label: 'Penny drop', description: '₹1 to HDFC0001234' },
  { label: 'Video KYC', description: 'Scheduled 28 May' },
]

function formatAmount(amount: number, currency: Currency, direction: 'credit' | 'debit') {
  const sign = direction === 'credit' ? '+' : '−'
  if (currency === 'INR') {
    const abs = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${sign}₹${abs}`
  }
  const abs = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${sign}$${abs}`
}

function MetricTile({
  label,
  value,
  hint,
  tooltip,
}: {
  label: string
  value: string
  hint?: string
  tooltip: string
}) {
  return (
    <div className="flex flex-col gap-ds-01 p-ds-04 rounded-ds-md bg-surface-2 border border-surface-border-subtle">
      <div className="flex items-center gap-ds-02">
        <Text variant="label-xs" className="text-surface-fg-subtle uppercase tracking-wide">
          {label}
        </Text>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`About ${label}`}
              className="text-surface-fg-subtle hover:text-surface-fg transition-colors duration-fast-01"
            >
              <IconInfoCircle size={12} aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <Text variant="heading-md" className="text-surface-fg">
        {value}
      </Text>
      {hint ? (
        <Text variant="body-xs" className="text-surface-fg-muted">
          {hint}
        </Text>
      ) : null}
    </div>
  )
}

export function LendisShowcase() {
  const [txns, setTxns] = useState<Txn[]>(initialTxns)
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit' | 'pending' | 'failed'>('all')

  const [beneficiary, setBeneficiary] = useState('yogin')
  const [purpose, setPurpose] = useState('salary')
  const [amountText, setAmountText] = useState('84000')
  const [reviewOpen, setReviewOpen] = useState(false)

  const amountNum = Number(amountText.replace(/[^0-9.]/g, '')) || 0

  const amountState: 'helper' | 'warning' | 'error' =
    amountNum === 0 ? 'helper' : amountNum > 500000 ? 'error' : amountNum > 200000 ? 'warning' : 'helper'

  const amountHelper =
    amountState === 'error'
      ? 'Exceeds single-transfer ceiling for IMPS. Split into two transfers or use NEFT.'
      : amountState === 'warning'
        ? 'Amounts above ₹2,00,000 trigger additional video-KYC review.'
        : 'IMPS settlement is near-instant during business hours.'

  const filteredTxns = useMemo(() => {
    if (filter === 'all') return txns
    if (filter === 'pending') return txns.filter((t) => t.status === 'pending')
    if (filter === 'failed') return txns.filter((t) => t.status === 'failed')
    return txns.filter((t) => t.direction === filter)
  }, [txns, filter])

  const confirmSend = async () => {
    await sleep(900)
    const beneficiaryLabel = beneficiaries.find((b) => b.value === beneficiary)?.label ?? 'Beneficiary'
    const next: Txn = {
      id: `TX-${Math.floor(90400 + Math.random() * 80)}`,
      party: `${beneficiaryLabel.split(' · ')[0]} · payout`,
      rail: amountNum > 200000 ? 'NEFT' : 'IMPS',
      ref: 'pending settlement',
      amount: amountNum,
      currency: 'INR',
      date: 'Just now',
      status: 'pending',
      direction: 'debit',
      isNew: true,
    }
    setTxns((t) => [next, ...t.map((x) => ({ ...x, isNew: false }))])
    setReviewOpen(false)
  }

  // Inline column typing — uses { row: { original: Txn } } pattern to avoid importing ColumnDef.
  // Cast to unknown[] for DataTable's generic — runtime shape matches TanStack's column-def contract.
  const columns = [
    {
      accessorKey: 'party',
      header: 'Party',
      cell: ({ row }: { row: { original: Txn } }) => {
        const t = row.original
        return (
          <div className="flex items-center gap-ds-03 min-w-0">
            <span
              className={[
                'w-8 h-8 rounded-ds-sm flex items-center justify-center shrink-0',
                t.direction === 'debit' ? 'bg-warning-3 text-warning-11' : 'bg-success-3 text-success-11',
              ].join(' ')}
              aria-hidden
            >
              {t.direction === 'debit' ? <IconArrowUpRight size={14} /> : <IconArrowDownLeft size={14} />}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-ds-sm text-surface-fg font-semibold truncate inline-flex items-center gap-ds-02">
                {t.party}
                {t.isNew ? (
                  <Badge variant="soft" color="accent" size="sm">
                    just now
                  </Badge>
                ) : null}
              </span>
              <span className="text-ds-xs text-surface-fg-subtle truncate">{t.ref}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'rail',
      header: 'Rail',
      cell: ({ row }: { row: { original: Txn } }) => (
        <Badge variant="soft" color="neutral" size="sm">
          {row.original.rail}
        </Badge>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Posted',
      cell: ({ row }: { row: { original: Txn } }) => (
        <span className="text-ds-xs text-surface-fg-muted whitespace-nowrap">{row.original.date}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Txn } }) => {
        const s = row.original.status
        const color = s === 'settled' ? 'success' : s === 'pending' ? 'warning' : 'error'
        const StatusIcon = s === 'settled' ? IconCircleCheck : s === 'pending' ? IconClock : IconAlertTriangle
        return (
          <Badge variant="soft" color={color} size="sm">
            <StatusIcon size={12} aria-hidden /> {s}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: () => <span className="block text-right">Amount</span>,
      cell: ({ row }: { row: { original: Txn } }) => {
        const t = row.original
        return (
          <div className="text-right">
            <Text
              variant="body-sm"
              className={[
                'font-semibold tabular-nums',
                t.direction === 'credit' ? 'text-success-11' : 'text-surface-fg',
              ].join(' ')}
            >
              {formatAmount(t.amount, t.currency, t.direction)}
            </Text>
          </div>
        )
      },
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-ds-05">
        <Alert variant="subtle" color="warning" title="Restricted corridor">
          USD wallet transfers to non-FATF jurisdictions are paused pending RBI A.P. (DIR) circular review. INR rails
          remain open.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-ds-05">
          <div className="flex flex-col gap-ds-05">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-ds-03">
                  <div className="flex flex-col gap-ds-01">
                    <CardDescription className="inline-flex items-center gap-ds-02">
                      <IconBuildingBank size={14} aria-hidden /> Operating account · IDFC First Bank
                    </CardDescription>
                    <CardTitle className="text-ds-2xl">Lendis · Series A working capital</CardTitle>
                  </div>
                  <div className="flex items-center gap-ds-02">
                    <Badge variant="soft" color="accent">
                      INR wallet
                    </Badge>
                    <Badge variant="soft" color="neutral">
                      <IconWorld size={12} aria-hidden /> USD wallet
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-ds-03">
                  <MetricTile
                    label="Credit line"
                    value="₹2,50,00,000"
                    hint="Sanctioned"
                    tooltip="Total sanctioned facility from Lendis Capital, drawable in tranches over 18 months."
                  />
                  <MetricTile
                    label="Outstanding"
                    value="₹84,21,450"
                    hint="33.7% utilised"
                    tooltip="Principal drawn minus repayments. Updates daily at 10:00 IST after BBPS reconciliation."
                  />
                  <MetricTile
                    label="Effective IRR"
                    value="14.2%"
                    hint="incl. processing"
                    tooltip="Annualised IRR including processing fee, stamp duty, and quarterly compounding."
                  />
                  <MetricTile
                    label="Next payment"
                    value="₹4,52,318"
                    hint="Due 5 June"
                    tooltip="EMI auto-debited from operating account on the 5th of each month via NACH mandate."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-ds-03">
                <div className="flex flex-wrap items-center justify-between gap-ds-02">
                  <div className="flex flex-col">
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>Last 30 days across INR and USD wallets</CardDescription>
                  </div>
                  <Button variant="soft" size="sm">
                    Export CSV
                  </Button>
                </div>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="credit">Credits</TabsTrigger>
                    <TabsTrigger value="debit">Debits</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <DataTable
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  columns={columns as any}
                  data={filteredTxns}
                  sortable
                  stickyHeader
                  getRowId={(row) => row.id}
                />
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-ds-05">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-ds-03">
                  <span className="w-9 h-9 rounded-full bg-success-3 text-success-11 flex items-center justify-center">
                    <IconShieldCheck size={16} aria-hidden />
                  </span>
                  <div className="flex flex-col">
                    <CardTitle className="text-ds-lg">Trust profile</CardTitle>
                    <CardDescription>80% complete · video KYC pending</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-ds-04">
                <div className="flex flex-col gap-ds-02">
                  <div className="flex items-center justify-between">
                    <Text variant="label-sm" className="text-surface-fg-muted">
                      Verification score
                    </Text>
                    <Text variant="label-sm" className="text-surface-fg font-semibold">
                      80%
                    </Text>
                  </div>
                  <Progress value={80} color="success" />
                </div>
                <Stepper activeStep={4} orientation="vertical">
                  {kycSteps.map((s) => (
                    <Step key={s.label} label={s.label} description={s.description} />
                  ))}
                </Stepper>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-ds-lg">Send to beneficiary</CardTitle>
                <CardDescription>IMPS or NEFT rails. Cut-off 6:00 PM IST.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-ds-04">
                <FormField>
                  <Label>Beneficiary</Label>
                  <Combobox
                    value={beneficiary}
                    onValueChange={setBeneficiary}
                    options={beneficiaries}
                    placeholder="Search beneficiaries"
                  />
                </FormField>

                <div className="flex items-center gap-ds-03 p-ds-03 rounded-ds-md bg-surface-2 border border-surface-border-subtle">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {beneficiaries.find((b) => b.value === beneficiary)?.label.slice(0, 2).toUpperCase() ?? 'YS'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <Text variant="body-sm" className="text-surface-fg font-medium truncate">
                      {beneficiaries.find((b) => b.value === beneficiary)?.label}
                    </Text>
                    <Text variant="body-xs" className="text-surface-fg-subtle">
                      Account verified via penny drop on 18 May.
                    </Text>
                  </div>
                </div>

                <FormField state={amountState}>
                  <Label>Amount (INR)</Label>
                  <Input
                    value={amountText}
                    onChange={(e) => setAmountText(e.target.value)}
                    inputMode="decimal"
                    placeholder="0"
                  />
                  <FormHelperText>{amountHelper}</FormHelperText>
                </FormField>

                <FormField>
                  <Label>Purpose code</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <Button
                  size="lg"
                  fullWidth
                  disabled={amountState === 'error' || amountNum === 0}
                  onClickAsync={async () => {
                    await sleep(1200)
                    setReviewOpen(true)
                  }}
                >
                  Verify and review <IconChevronRight size={16} aria-hidden />
                </Button>

                <AnimatePresence initial={false}>
                  {reviewOpen ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      className="flex flex-col gap-ds-03 p-ds-04 rounded-ds-md border border-accent-7 bg-accent-2"
                    >
                      <div className="flex items-center justify-between">
                        <Text variant="label-md" className="text-surface-fg font-semibold">
                          Confirm transfer
                        </Text>
                        <Badge variant="soft" color="accent" size="sm">
                          {amountNum > 200000 ? 'NEFT' : 'IMPS'}
                        </Badge>
                      </div>
                      <dl className="grid grid-cols-2 gap-ds-02 text-ds-xs">
                        <dt className="text-surface-fg-subtle">To</dt>
                        <dd className="text-surface-fg text-right truncate">
                          {beneficiaries.find((b) => b.value === beneficiary)?.label.split(' · ')[0]}
                        </dd>
                        <dt className="text-surface-fg-subtle">Amount</dt>
                        <dd className="text-surface-fg text-right font-semibold tabular-nums">
                          ₹{amountNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                        <dt className="text-surface-fg-subtle">Purpose</dt>
                        <dd className="text-surface-fg text-right">
                          {purposes.find((p) => p.value === purpose)?.label}
                        </dd>
                        <dt className="text-surface-fg-subtle">Settlement</dt>
                        <dd className="text-surface-fg text-right">
                          {amountNum > 200000 ? 'Within 2 banking hours' : 'Near-instant'}
                        </dd>
                      </dl>
                      <div className="flex items-center gap-ds-02">
                        <Button variant="ghost" size="sm" onClick={() => setReviewOpen(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" fullWidth onClickAsync={confirmSend}>
                          <IconCheck size={14} aria-hidden /> Confirm transfer
                        </Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  )
}
