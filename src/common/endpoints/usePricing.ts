import useSWR from 'swr'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import useMutation from 'use-mutation'

import { GetPricingDetails, GetPricingDetailsResponse, Order, ProductCode } from './typings.gen'
import { TradeInStatus } from './useDealSummary'

const getPricingDetailsEndpoint = '/pricing-management/get-pricing-details'

type PricingReqType = { orderDetails?: Order; updatedTaxes?: boolean; tradeInStatus?: TradeInStatus }

export const DealType = {
  [ProductCode.Lease]: 1,
  [ProductCode.Finance]: 7,
  [ProductCode.EasyRide]: 10,
}

const prepareGetPricingDetailsPayload = ({ orderDetails, tradeInStatus, updatedTaxes }: PricingReqType) => {
  const withoutTradeIn = tradeInStatus && tradeInStatus === TradeInStatus.WithoutTradeIn
  const orderKey = withoutTradeIn ? 'updatedTaxesWithoutTradeIn' : 'updatedTaxesWithTradeIn'
  if (!orderDetails) return
  const dealerfee =
    orderDetails.order.fees?.length > 0
      ? orderDetails.order.fees
          .map(({ chargeCode, amount, isTaxable }) => ({
            item: chargeCode,
            price: amount,
            isTaxAble: isTaxable,
          }))
          ?.filter(f => f.item !== undefined) // filter only those fees object that are not empty
      : []
  const pricingObject: GetPricingDetails = {
    dealType: DealType[orderDetails.order.productCode as keyof typeof DealType],
    odometer: orderDetails.order.odometer,
    dealerCode: orderDetails.order.dealerCode,
    FnIProducts: orderDetails.order.fniProducts?.map(fni => ({ item: fni.name, price: fni.dealerCost })),
    isNew: orderDetails.order.IsNew,
    VIN: orderDetails.order.vin,
    totalScore: orderDetails.order.pricing.totalScore,
    sellingPrice: orderDetails.order.pricing.sellingPrice,
    term: orderDetails.order.pricing.term,
    downPayment: orderDetails.order.pricing.downPayment,
    annualMileage: orderDetails.order.mileage,
    fees: dealerfee || [],
    tradeIn:
      withoutTradeIn || !orderDetails.order?.tradeInVehicle
        ? undefined
        : {
            offerAmount: orderDetails.order?.tradeInVehicle?.offer,
            leaseBalance: orderDetails.order?.tradeInVehicle?.tradeInLeaseBalance?.leaseBalance,
            paymentType: orderDetails.order?.tradeInVehicle?.tradeInLeaseBalance?.paymentType,
          },
    residualValue: orderDetails.order.pricing.residualValue, // no idea
    APR: orderDetails.order.pricing.APR,
    rebateAndPromotions: orderDetails.order.pricing.rebateAndPromotions, // no idea
    taxes: {
      // no impact
      capitalCostReductionTax: orderDetails.order.pricing.taxes.capitalCostReductionTax,
      rebateTax: orderDetails.order.pricing.taxes.rebateTax,
      salesTax: orderDetails.order.pricing.taxes.salesTax,
      useTax: orderDetails.order.pricing.taxes.useTax,
      tradeInTax: orderDetails.order.pricing.taxes.tradeInTax,
    },
    addOns: orderDetails.order.accessories?.map(({ name, price, residualValueAdder }) => ({
      price,
      item: name,
      rv: residualValueAdder,
    })),
    ...(orderDetails.customer.parkingAddress && {
      customerAddress: orderDetails.customer.parkingAddress,
    }),
    updatedTaxes:
      updatedTaxes || orderDetails.order[orderKey]
        ? {
            taxOnSellingPrice: orderDetails.order[orderKey]?.taxOnSellingPrice,
            taxOnDealerFee: orderDetails.order[orderKey]?.taxOnDealerFee,
            taxOnFnIProducts: orderDetails.order[orderKey]?.taxOnFnIProducts,
            taxOnNegativeTradeIn: orderDetails.order[orderKey]?.taxOnNegativeTradeIn,
            taxOnCapitalizedCostReduction: orderDetails.order[orderKey]?.taxOnCapitalizedCostReduction,
          }
        : undefined,
  }

  return pricingObject
}

const usePricing = (
  orderDetails?: Order,
): {
  data?: GetPricingDetailsResponse
  error?: ApiError
  isLoading: boolean
  isValidating: boolean
  refetchPricingWithNewOrderDetails: (data: PricingReqType) => Promise<GetPricingDetailsResponse | undefined>
} => {
  const { mutate: refetchPricingWithNewOrderDetails, data: latestPricingData, status } = useLatestPricing()
  const pricingPayload = prepareGetPricingDetailsPayload({ orderDetails })
  const { error, data } = useSWR<GetPricingDetailsResponse, ApiError>(
    () => `order-pricing-${orderDetails!.order._id}-${JSON.stringify(orderDetails!.order.fees)}`,
    () => sendForm<GetPricingDetailsResponse>(getPricingDetailsEndpoint, pricingPayload),
  )

  return {
    data: latestPricingData || data,
    error,
    isLoading: !error && !data,
    isValidating: status === 'running',
    refetchPricingWithNewOrderDetails,
  }
}

type LatestPricingType = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: PricingReqType) => Promise<GetPricingDetailsResponse | undefined>
  data: GetPricingDetailsResponse | undefined
  error?: ApiError
  isLoading: boolean
}
export const useLatestPricing = (): LatestPricingType => {
  const [mutate, { data, status }] = useMutation<PricingReqType, GetPricingDetailsResponse, ApiError>(async input => {
    const pricingPayload = prepareGetPricingDetailsPayload(input)
    const response = await sendForm<GetPricingDetailsResponse>(getPricingDetailsEndpoint, pricingPayload)

    return response
  })

  return {
    mutate,
    data,
    status,
    isLoading: status === 'running',
  }
}

export default usePricing
