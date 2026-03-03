/**
 * renderAdjustmentType is a pure render utility function, not a React component.
 * It maps an AdjustmentType key to a human-readable label wrapped in a <div>.
 *
 * This intentionally does not follow the component checklist (forwardRef,
 * displayName, props interface) because it is invoked as a function
 * — e.g. renderAdjustmentType('CASHOUT') — not rendered as JSX.
 */

export const AdjustmentType = {
  YEARLY_BALANCE: 'YEARLY_BALANCE',
  CARRY_FORWARD: 'CARRY_FORWARD',
  CASHOUT: 'CASHOUT',
  OTHER: 'OTHER',
} as const

const ADJUSTMENT_TYPE_LABELS: Record<keyof typeof AdjustmentType, string> = {
  YEARLY_BALANCE: 'Yearly Balance',
  CARRY_FORWARD: 'Carry Forward',
  CASHOUT: 'Cashout',
  OTHER: 'Other',
}

function renderAdjustmentType(type: keyof typeof AdjustmentType): JSX.Element {
  return <div>{ADJUSTMENT_TYPE_LABELS[type]}</div>
}

export default renderAdjustmentType
