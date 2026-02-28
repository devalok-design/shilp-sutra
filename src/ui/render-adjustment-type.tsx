export const AdjustmentType = {
  YEARLY_BALANCE: 'YEARLY_BALANCE',
  CARRY_FORWARD: 'CARRY_FORWARD',
  CASHOUT: 'CASHOUT',
  OTHER: 'OTHER',
}

const renderAdjustmentType = (type: keyof typeof AdjustmentType) => {
  const typeMap = {
    [AdjustmentType.YEARLY_BALANCE]: 'Yearly Balance',
    [AdjustmentType.CARRY_FORWARD]: 'Carry Forward',
    [AdjustmentType.CASHOUT]: 'Cashout',
    [AdjustmentType.OTHER]: 'Other',
  }
  return <div>{typeMap[type]}</div>
}

export default renderAdjustmentType
