import useSWR, { ConfigInterface } from 'swr'
import { mutateMany } from 'swr-mutate-many'
import { ApiError } from '@common/utilities/fetcher'
import useMutation from 'use-mutation'
import sendForm from '@common/utilities/sendForm'
import { IndividualizedAgreement } from './typings.gen'

const updateEndPoint = 'dealer-management/dealer-config/individualized-agreements'

export const useIndividualizedAgreement = (
  dealerCode: string,
  options?: ConfigInterface<{ individualizedAgreement: IndividualizedAgreement[] }, ApiError>,
): {
  data?: { individualizedAgreement: IndividualizedAgreement[] }
  error?: ApiError
  isLoading: boolean
  isValidating: boolean
  mutate: () => Promise<{ individualizedAgreement: IndividualizedAgreement[] } | undefined>
} => {
  const { error, data, isValidating, mutate } = useSWR<
    { individualizedAgreement: IndividualizedAgreement[] },
    ApiError
  >(`/dealer-management/dealer-config/individualized-agreements/${dealerCode}`, {
    revalidateOnFocus: false,
    ...options,
  })
  return {
    data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate,
  }
}

type MutateIndividuzlizedAgreement = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (
    data: MutateIndividuzlizedAgreementParam,
    config?: Parameters<typeof useMutation>[1],
  ) => Promise<null | undefined>
  error?: ApiError
} & { isLoading: boolean; error?: ApiError }

export interface MutateIndividuzlizedAgreementParam {
  _id: string
  isDefault?: boolean
  agreement?: string
  method: 'POST' | 'PUT' | 'DELETE'
}

export const useMutateIndividualizedAgreement = (dealerCode: string): MutateIndividuzlizedAgreement => {
  const [mutate, { status, error }] = useMutation<MutateIndividuzlizedAgreementParam, null, ApiError | undefined>(
    (input): Promise<null> => {
      let url = `${updateEndPoint}/${dealerCode}`
      if (input.method === 'DELETE') url += `?_id=${input._id}`
      return sendForm<null>(
        url,
        { ...input, method: undefined },
        {
          withAuthentication: true,
          method: input.method,
        },
      )
    },
    {
      onSuccess() {
        void mutateMany(`*${updateEndPoint}/${dealerCode}*`, undefined, true)
      },
    },
  )
  return { mutate, status, isLoading: status === 'running', error }
}

export default useIndividualizedAgreement
