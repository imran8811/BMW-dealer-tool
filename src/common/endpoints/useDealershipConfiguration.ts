import useSWR, { mutate as swrMutate } from 'swr'
import useMutation, { Options } from 'use-mutation'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import { clearCredentials } from '@common/utilities/credentialsStore'
import { useRouter } from 'next/router'
import routes from '@common/routes'
import { SpecificMinimumFinances, DealershipGeneralConfig } from './typings.gen'

const endpoint = '/dealer-management/dealer-config'
const getConfigEndpoint = `${endpoint}/get-general-config`
export const updatePenDealerEndpoint = '/pen/update-dealer/'
export const registerDealerEndpoint = '/pen/register-dealer/'
export const unregisterPenDealerEndpoint = '/pen/unregister-dealer/'

export type DealershipGeneralConfigType = DealershipGeneralConfig & {
  county: string
}

/**
 * Hard Coded Timezone Enum for PEN Registration
 */
export enum TimeZones {
  Eastern = 'Eastern',
  Central = 'Central',
  Mountain = 'Mountain',
  Pacific = 'Pacific',
  Hawaii = 'Hawaii',
  Alaska = 'Alaska',
  Atlantic = 'Atlantic',
  Samoa = 'Samoa',
  Chamorro = 'Chamorro',
}
/**
 * If `dealerCode` not provided, use dealership context
 */
const useDealershipConfiguration = (
  dealerCode?: string,
): {
  data?: DealershipGeneralConfig
  error?: Error
  isValidating: boolean
  isLoading: boolean
} => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const id = dealerCode || getCurrentDealershipCode()
  const { error, data, isValidating } = useSWR<DealershipGeneralConfig, Error>(
    id && id !== '0' ? `${getConfigEndpoint}/${id}` : null,
    undefined,
    { revalidateOnFocus: false },
  )

  return {
    data,
    error,
    isValidating,
    isLoading: !error && !data,
  }
}

type UseDealerConfigurationUpdateReturn = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: DealershipGeneralConfig) => Promise<DealershipGeneralConfig | undefined>
  data?: DealershipGeneralConfig
  error?: ApiError
  isLoading: boolean
}
export const invalidateGenConfig = (dealerCode: string) =>
  void swrMutate(`${getConfigEndpoint}/${dealerCode}`, undefined, true)

export const useDealershipGeneralConfigurationUpdate = (dealerCode: string): UseDealerConfigurationUpdateReturn => {
  const [mutate, { status, data, error }] = useMutation<DealershipGeneralConfig, DealershipGeneralConfig, ApiError>(
    props =>
      sendForm<DealershipGeneralConfig>(`${endpoint}/update-general-config/${dealerCode}`, props, {
        method: 'PATCH',
      }),
    {
      onSuccess: () => {
        invalidateGenConfig(dealerCode)
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

type UseLogoutType = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (e: null | undefined) => Promise<unknown>
  error?: ApiError
}

export const useLogoutDealerUser = (): UseLogoutType => {
  const { clearDealershipContext } = useDealershipContext()
  const router = useRouter()

  const [mutate, { status }] = useMutation<null | undefined, undefined, ApiError>(
    () =>
      sendForm('/dealer-management/revoke', undefined, {
        method: 'POST',
        withAuthentication: true,
      }),
    {
      onSuccess: () => {
        clearCredentials()
        window.sessionStorage.clear()
        clearDealershipContext()
        void router.push(routes.login)
      },
    },
  )
  return {
    mutate,
    status,
  }
}

type UseSaveFinnancedLimitConfigReturn = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (
    data: SpecificMinimumFinances[],
    options?: Options<SpecificMinimumFinances[], SpecificMinimumFinances[], ApiError>,
  ) => Promise<SpecificMinimumFinances[] | undefined>
  data?: SpecificMinimumFinances[]
  error?: ApiError
  isLoading: boolean
}

export const useSaveFinnancedLimitConfig = (dealerCode: string): UseSaveFinnancedLimitConfigReturn => {
  const [mutate, { status, data, error }] = useMutation<SpecificMinimumFinances[], SpecificMinimumFinances[], ApiError>(
    props =>
      sendForm<SpecificMinimumFinances[]>(`${endpoint}/minimum-finance-config/${dealerCode}`, props, {
        method: 'PUT',
      }),
    {
      onSuccess: () => {
        invalidateGenConfig(dealerCode)
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

export default useDealershipConfiguration
