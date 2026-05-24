'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconArrowDownLeft, IconArrowUpRight, IconShieldCheck } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type Txn = { who: string; amount: number; date: string; type: string; tag: string; isNew?: boolean }

const initialTxns: Txn[] = [
  { who: 'Karm subscription', amount: -49, date: 'Today, 9:14 am', type: 'card', tag: 'tools' },
  { who: 'Studio Hospitality Pvt Ltd', amount: 24000, date: 'Yesterday', type: 'transfer', tag: 'invoice paid' },
  { who: 'AWS · ap-south-1', amount: -312.4, date: '21 May', type: 'card', tag: 'hosting' },
  { who: 'Goutham · payout', amount: -84000, date: '20 May', type: 'transfer', tag: 'salary' },
  { who: 'Chennai Co-op Bank · interest', amount: 1248, date: '18 May', type: 'transfer', tag: 'savings' },
]

function inr(n: number) {
  const abs = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
  return `${n < 0 ? '−' : '+'}₹${abs}`
}

export function LendisShowcase() {
  const [txns, setTxns] = useState<Txn[]>(initialTxns)
  const [balance, setBalance] = useState(1842310.4)

  const sendMoney = async () => {
    await sleep(1500)
    const amount = 84000
    setTxns((t) => [
      {
        who: 'Yogin Sharma · payout',
        amount: -amount,
        date: 'Just now',
        type: 'transfer',
        tag: 'salary',
        isNew: true,
      },
      ...t.map((x) => ({ ...x, isNew: false })),
    ])
    setBalance((b) => b - amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-ds-05">
      {/* Account + transactions */}
      <div className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <CardDescription>Operating account · IDFC First Bank</CardDescription>
            <div className="flex items-baseline gap-ds-03 mt-ds-02">
              <motion.div
                key={balance}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <Text variant="heading-2xl" className="text-surface-fg">
                  ₹
                  {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </motion.div>
              <Badge variant="soft" color="success">
                +4.2% this month
              </Badge>
            </div>
            <Text variant="body-sm" className="text-surface-fg-muted mt-ds-02">
              Available balance. Updated 14 minutes ago.
            </Text>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-ds-02">
            <Button size="lg" onClickAsync={sendMoney}>
              Send money
            </Button>
            <Button variant="soft" size="lg">
              Request payment
            </Button>
            <Button variant="ghost" size="lg">
              Move to savings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              <AnimatePresence initial={false}>
                {txns.map((t, i) => (
                  <motion.li
                    key={`${t.who}-${t.date}-${i}`}
                    layout
                    initial={t.isNew ? { opacity: 0, y: -8, height: 0 } : false}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className={[
                      'group/row flex items-center justify-between gap-ds-04 px-ds-03 -mx-ds-03 py-ds-03 rounded-ds-md border-b border-surface-border-subtle last:border-b-0',
                      'hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer',
                      t.isNew && 'bg-accent-2',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex items-center gap-ds-03 min-w-0 flex-1">
                      <span
                        className={[
                          'w-9 h-9 rounded-ds-sm flex items-center justify-center shrink-0',
                          t.amount < 0 ? 'bg-warning-3 text-warning-11' : 'bg-success-3 text-success-11',
                        ].join(' ')}
                      >
                        {t.amount < 0 ? <IconArrowUpRight size={16} /> : <IconArrowDownLeft size={16} />}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-ds-md text-surface-fg font-semibold line-clamp-1 inline-flex items-center gap-ds-02">
                          {t.who}
                          {t.isNew && (
                            <Badge variant="soft" color="accent" size="sm">
                              just now
                            </Badge>
                          )}
                        </span>
                        <span className="text-ds-xs text-surface-fg-subtle mt-ds-01">
                          {t.date} · {t.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-ds-01">
                      <Text
                        variant="body-sm"
                        className={t.amount < 0 ? 'text-surface-fg font-medium' : 'text-success-11 font-medium'}
                      >
                        {inr(t.amount)}
                      </Text>
                      <Badge size="sm" variant="soft" color="neutral">
                        {t.tag}
                      </Badge>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* KYC + send-money form */}
      <aside className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-ds-03">
              <span className="w-9 h-9 rounded-full bg-success-3 text-success-11 flex items-center justify-center">
                <IconShieldCheck size={16} />
              </span>
              <div className="flex flex-col">
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">KYC verified</CardTitle>
                <CardDescription>PAN + Aadhaar on file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Text variant="body-xs" className="text-surface-fg-muted">
              Verified 12 March 2026. Next review due in 11 months.
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Send to a beneficiary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-04">
            <label className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-muted">
                Beneficiary
              </Text>
              <div className="flex items-center gap-ds-02 p-ds-02 rounded-ds-md border border-surface-border bg-surface-overlay">
                <Avatar size="sm">
                  <AvatarFallback>YS</AvatarFallback>
                </Avatar>
                <Text variant="body-sm" className="text-surface-fg flex-1">
                  Yogin Sharma · UPI yogin@axl
                </Text>
              </div>
            </label>

            <label className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-muted">
                Amount (INR)
              </Text>
              <input
                type="text"
                defaultValue="84,000"
                className="h-ds-md px-ds-04 rounded-ds-md border border-surface-border bg-surface-overlay text-ds-md text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
              />
            </label>

            <Button size="lg" fullWidth onClickAsync={async () => { await sleep(1800) }}>
              Verify with face ID
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
