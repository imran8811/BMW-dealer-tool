import { OrderDetails } from '@common/endpoints/typings.gen'
import { calculateTradeInBalance, formatNum } from '../formulae'

describe('Test formulae', () => {
  test('Calculate tradein balance with no parameters', () => {
    const calculatedTradeInBalance = calculateTradeInBalance({} as OrderDetails)
    expect(calculatedTradeInBalance).toBeFalsy()
  })
  test('Calculate tradein balance with orderDetails containing same offer and lease balance', () => {
    const calculatedTradeInBalance = calculateTradeInBalance({
      tradeInVehicle: { offer: 5000, tradeInLeaseBalance: { leaseBalance: 5000 } },
    } as OrderDetails)
    expect(calculatedTradeInBalance).toEqual({ previousTradeInBalance: 0, tradeInBalance: 0 })
  })
  test('Calculate tradein balance with orderDetails containing different offer and lease balance', () => {
    const calculatedTradeInBalance = calculateTradeInBalance({
      tradeInVehicle: { offer: 4000, tradeInLeaseBalance: { leaseBalance: 2000 } },
    } as OrderDetails)
    expect(calculatedTradeInBalance).toEqual({ previousTradeInBalance: 0, tradeInBalance: 2000 })
  })
  test('test fromat number', () => {
    const formatedNumber = formatNum(0)
    expect(formatedNumber).toEqual(0)
  })
})
