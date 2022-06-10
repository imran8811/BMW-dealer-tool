import { useMemo } from 'react'
import useSWR from 'swr'
import { mutateMany } from 'swr-mutate-many'
import useMutation from 'use-mutation'
import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import sendForm from '@common/utilities/sendForm'
import { updateObjectCache } from '@common/utilities/swr-cache'
import { sendRequest } from '@common/utilities/http-api'
import { AddNewDealerFee, Charges, DealerFeesConfig } from './typings.gen'

type DealerCode = string

export type FeesFilterParams = Partial<{
  chargeDisplayName: string
  state: string
  financialProduct: string
  defaultAmount: string
  isActive: boolean
}>

type FeesQueryParams = InfinitePaginationQuery & {
  dealerCode: DealerCode
  sortBy?: string
  sortOrder?: number
} & FeesFilterParams

/**
 * Fetches and exposes dealer fees list.
 */
export const useDealershipFees = ({
  dealerCode,
  ...params
}: FeesQueryParams): UseInfinitePaginationReturn<DealerFeesConfig> => {
  const endpoint = `/dealer-management/dealer-config/get-dealer-fees/${dealerCode}`

  return useInfinitePagination<DealerFeesConfig>(dealerCode && dealerCode !== '0' ? endpoint : null, params, {
    revalidateOnFocus: false,
  })
}

/**
 * Charges are basically a master list of fee names. Fee's names are not
 * free form - they are a droplist of charges.
 */
export const useCharges = () => {
  const endpoint = '/dealer-management/charges/get-all'

  const result = useSWR<Charges[], Error>(endpoint)

  // we additionally return a list which can be used for multi select as options
  const options = useMemo(
    () => (result.data ?? []).map(item => ({ label: item.chargeDisplayName, value: item.chargeCode })),
    [result.data],
  )
  // and a mapping between code and whole charges
  const chargeMap = useMemo(() => new Map((result.data ?? []).map(charge => [charge.chargeCode, charge])), [
    result.data,
  ])

  return {
    options,
    chargeMap,
    ...result,
  }
}

type SaveFeeParams = {
  dealerCode: string
  item?: Pick<DealerFeesConfig, '_id'> | null
}

/**
 * Use this hook to create new fee or make changes to an existing one.
 *
 * It uses typical mutation interface.
 */
export const useSaveFee = ({ dealerCode, item }: SaveFeeParams) => {
  const add = item?._id == null

  const [mutate, result] = useMutation<AddNewDealerFee, DealerFeesConfig, Error>(async input => {
    const values = { _id: item?._id, ...input }
    const endpoint = add
      ? `/dealer-management/dealer-config/add-dealer-fee/${dealerCode}`
      : `/dealer-management/dealer-config/update-dealer-fee/${dealerCode}`
    const method = add ? 'POST' : 'PUT'

    const response = await sendForm<DealerFeesConfig>(endpoint, values, { method })
    await mutateMany('*/dealer-management/dealer-config/get-dealer-fees/*', undefined, true)
    return response
  })

  return {
    mutate,
    ...result,
  }
}

/**
 * Use this hook to update fee's status or taxability. It will also do an optimistic update so it can
 * be easily used in the UI.
 *
 * It uses typical mutation interface.
 */
export const useUpdateFee = ({ fee, dealerCode }: { fee: DealerFeesConfig; dealerCode: string }) => {
  // will optimistically update fee's active status so it's reflected in the UI right away
  const updateOptimistic = (props: Partial<DealerFeesConfig>) =>
    mutateMany(
      '*/dealer-management/dealer-config/get-dealer-fees/*',
      updateObjectCache(fee._id, row => ({ ...row, ...props })),
      false,
    )

  const [mutate, result] = useMutation<Partial<DealerFeesConfig>>(
    async updates => {
      const newData = { ...fee, ...updates }

      const result = await sendForm<DealerFeesConfig>(
        `/dealer-management/dealer-config/update-dealer-fee/${dealerCode}`,
        newData,
        { method: 'PUT' },
      )
      await updateOptimistic(result)
      return result
    },
    {
      onMutate: async ({ input }) => {
        const preserved = { ...fee }

        await updateOptimistic(input)
        return () => updateOptimistic(preserved)
      },
      onFailure: ({ rollback }) => {
        if (rollback != null) {
          rollback()
        }
      },
    },
  )

  return { mutate, ...result }
}

export const useDeleteFee = ({ dealerCode }: { dealerCode: string }) => {
  const [mutate, result] = useMutation<Pick<DealerFeesConfig, '_id'>>(
    fee =>
      sendRequest(
        `/dealer-management/dealer-config/delete-dealer-fee/${dealerCode}?_id=${fee._id}`,
        { method: 'DELETE' },
        { withAuthentication: true },
      ),
    {
      onSuccess: () => {
        void mutateMany('*/dealer-management/dealer-config/get-dealer-fees/*', undefined, true)
      },
    },
  )

  return {
    mutate,
    ...result,
  }
}
