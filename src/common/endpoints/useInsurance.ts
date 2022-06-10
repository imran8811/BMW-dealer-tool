import useSWR from 'swr'
import fetcher, { ApiError } from '@common/utilities/fetcher'
import { IInsurance } from './typings.gen'

const getInsuranceEndpoint = '/insurance-management/get-insurance'
const useInsuranceByOrderId = (
  id: string,
): {
  data?: IInsurance
  error?: ApiError
  isLoading: boolean
} => {
  const { error, data } = useSWR<IInsurance, ApiError>(`${getInsuranceEndpoint}/${id}`, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export default useInsuranceByOrderId
