import { OrderDetails } from '@common/endpoints/typings.gen'

/*
 ** Format Number Function to avoid undefined values and fixing to 2 decimal points
 */
export const formatNum = (num: number) => (num % 1 !== 0 ? num?.toFixed(2) || 0 : num)

export const calculateTradeInBalance = (
  order: OrderDetails,
): { tradeInBalance: number; previousTradeInBalance: number } | undefined => {
  if (!order.tradeInVehicle) return
  const tradeInBalance = formatNum(
    (order.tradeInVehicle.offer || 0) - (order.tradeInVehicle.tradeInLeaseBalance?.leaseBalance || 0),
  )
  const previousTradeInBalance = formatNum(
    (order.tradeInVehicle.previousOffer || 0) - (order.tradeInVehicle.tradeInLeaseBalance?.previousLeaseBalance || 0),
  )
  return {
    tradeInBalance: Number(tradeInBalance),
    previousTradeInBalance: Number(previousTradeInBalance),
  }
}
