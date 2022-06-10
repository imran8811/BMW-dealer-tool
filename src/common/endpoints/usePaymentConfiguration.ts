import useSWR, { mutate as swrMutate } from 'swr'
import useMutation from 'use-mutation'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import { DealershipPaymentConfig } from './typings.gen'

const endpoint = '/dealer-management/dealer-config'
const getPaymentConfigEndpoint = `${endpoint}/get-payment-config`

const usePaymentConfiguration = (
  dealerCode: string,
): {
  data?: DealershipPaymentConfig
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<DealershipPaymentConfig, Error>(`${getPaymentConfigEndpoint}/${dealerCode}`)

  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

type UsePaymentConfigurationUpdateReturn = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: DealershipPaymentConfig) => Promise<DealershipPaymentConfig | undefined>
  data?: DealershipPaymentConfig
  error?: ApiError
  isLoading: boolean
}

export const usePaymentConfigurationUpdate = (dealerCode: string): UsePaymentConfigurationUpdateReturn => {
  const [mutate, { status, data, error }] = useMutation<DealershipPaymentConfig, DealershipPaymentConfig, ApiError>(
    props =>
      sendForm<DealershipPaymentConfig>(`${endpoint}/update-payment-config/${dealerCode}`, props, {
        method: 'PATCH',
      }),
    {
      onSuccess: () => {
        void swrMutate(`${getPaymentConfigEndpoint}/${dealerCode}`, undefined, true)
      },
    },
  )

  return {
    mutate,
    status,
    data,
    error,
    isLoading: status === 'running',
  }
}

export default usePaymentConfiguration
