import fetcher from '@common/utilities/fetcher'
import useSWR from 'swr'
import type { DealershipTradeinConfig, PaymentsAccount } from './typings.gen'

export type StripeLinkType = {
  _id: string
  refreshUrl: string
  returnUrl: string
}

export type StripePaymentUrlType = {
  object: string
  created: number
  expires_at: number
  url: string
}

const useGetPaymentInfo = (
  dealerCode: string,
): {
  data?: PaymentsAccount
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<PaymentsAccount, Error>(
    dealerCode && dealerCode !== '0' ? `/payment-management/payments-account/get-by-dealerCode/${dealerCode}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )
  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export const useTradeInConfiguration = (
  dealerCode: string,
): {
  data?: DealershipTradeinConfig
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<DealershipTradeinConfig, Error>(
    dealerCode && dealerCode !== '0' ? `/dealer-management/dealer-config/get-tradein-config/${dealerCode}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )
  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export default useGetPaymentInfo
