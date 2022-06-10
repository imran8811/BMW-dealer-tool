import useSWR, { ConfigInterface } from 'swr'
import { ApiError } from '@common/utilities/fetcher'

export interface DealerStipulation {
  Description: string
}
export interface StipulationResponse {
  orderId: number
  dealerStipulations: DealerStipulation[]
  creditAppId: string
  conditionedTerm: number
  conditionedAmount: number
  conditionedMonthlyPaymentAmount: number
  contractingAllowed: boolean
}

const useStipulations = (
  id: number,
  options?: ConfigInterface<StipulationResponse, ApiError>,
): {
  data?: StipulationResponse
  error?: ApiError
  isLoading: boolean
} => {
  const { error, data } = useSWR<StipulationResponse, ApiError>(
    `/credit-application-management/get-stipulations/${id}`,
    { ...options, revalidateOnFocus: false, refreshInterval: 600000 }, // 10 minutes
  )

  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export default useStipulations
