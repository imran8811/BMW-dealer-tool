import useSWR, { ConfigInterface } from 'swr'
import { ApiError } from '@common/utilities/fetcher'
import { Order } from './typings.gen'

const useOrder = (
  id: string,
  options?: ConfigInterface<Order, ApiError>,
): {
  data?: Order
  error?: ApiError
  isLoading: boolean
  mutate: () => Promise<Order | undefined>
  isValidating: boolean
} => {
  const { error, data, mutate, isValidating } = useSWR<Order, ApiError>(
    `/order-management/get-order-details/${id}`,
    options,
  )

  return {
    data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  }
}

export default useOrder
