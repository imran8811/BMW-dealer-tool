import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import fetcher from '@common/utilities/fetcher'
import useMutation from 'use-mutation'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import { mutateMany } from 'swr-mutate-many'
import useSWR from 'swr'
import { FeeTag, ReferenceDataTypes } from './typings.gen'
import useReferenceData, { referenceDataToOptions } from './useReferenceData'

const endpoint = '/dealer-management/charges-mapping'
const updateEndPoint = '/dealer-management/charges-mapping'

export type UseMutationStatusProps = Pick<ReturnType<typeof useMutation>[1], 'status'>

type UpdateFeeTagType = UseMutationStatusProps & {
  mutate: (data: UpdateFeeTagParamType) => Promise<null | undefined>
  error?: ApiError
}
type ResponseType = PaginatedResponse<FeeTagType[]>

export type UpdateFeeTagParamType = FeeTagType

export type FeeTagType = FeeTag

export type IFeeTagFilter = FeeTagType & {
  sortBy?: string
  sortOrder?: number
}

export const invalidateFeeTag = async (params?: UpdateFeeTagParamType): Promise<void> => {
  const modifyPageData = (data?: ResponseType): ResponseType | undefined => {
    if (!data || !data?.pageData || data?.pageData?.length === 0) return data
    let pageData = !data?.pageData || data?.pageData?.length > 0 ? [...data?.pageData] : []
    pageData = pageData.map(item => {
      const updated = item._id === params?._id ? item : {}
      return { ...item, ...updated }
    })
    return { ...data, pageData }
  }

  await Promise.allSettled([
    mutateMany(
      `*${endpoint}*`,
      <T extends ResponseType | ResponseType[]>(data?: T): T | undefined =>
        (Array.isArray(data)
          ? (data as ResponseType[]).map(modifyPageData)
          : modifyPageData(data as ResponseType)) as T,
      true,
    ),
  ])
}

const useFeeTag = (params?: InfinitePaginationQuery | IFeeTagFilter): UseInfinitePaginationReturn<FeeTagType> =>
  useInfinitePagination<FeeTagType>(`${endpoint}`, params as InfinitePaginationQuery, {
    revalidateOnFocus: false,
    errorRetryInterval: 20000,
  })

export const useAllFeeTag = (
  dealerCode: string,
): {
  pageData?: FeeTagType[]
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<ResponseType, Error>(
    dealerCode && dealerCode !== '0' ? `${endpoint}/${dealerCode}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )
  return {
    pageData: data?.pageData,
    error,
    isLoading: !error && !data,
  }
}

export const useFeeTagUpdate = (): UpdateFeeTagType => {
  const [mutate, { status }] = useMutation<UpdateFeeTagParamType, null>(
    (...props): Promise<null> => {
      return editCall(...props)
    },
    {
      onSuccess({ input }) {
        void invalidateFeeTag(input)
      },
    },
  )
  return { mutate, status }
}

const editCall = (data: UpdateFeeTagParamType) => {
  const { _id: id } = data
  return sendForm<null>(`${updateEndPoint}/${id}`, data, {
    withAuthentication: true,
    method: 'PUT',
  })
}

export const mutateFeeTag = (values?: UpdateFeeTagParamType, id?: string) => {
  const url = id ? `/dealer-management/charges-mapping/${id}` : '/dealer-management/charges-mapping'
  return sendForm<UpdateFeeTagParamType>(url, values, {
    withAuthentication: true,
    method: id ? 'PUT' : 'POST',
  })
}

export const deleteFeeTagData = <U>(id: string): Promise<U> | never =>
  fetcher<U>(
    `/dealer-management/charges-mapping/${id}`,
    {
      headers: {
        'content-type': 'application/json',
      },
      method: 'DELETE',
    },
    {
      withAuthentication: true,
    },
  )

export const useMutationFeeTag = (id?: string) => {
  const [mutate, { error, status }] = useMutation<FeeTag, UpdateFeeTagParamType, Error>(
    (values): Promise<UpdateFeeTagParamType> => {
      return mutateFeeTag(values, id)
    },
    {
      onSuccess(data): void {
        void invalidateFeeTag(data?.data)
      },
    },
  )

  return { mutate, error, status, isLoading: status === 'running' }
}

export const useDeleteFeeTag = () => {
  const [mutate, { status, error }] = useMutation<UpdateFeeTagParamType, unknown, Error>(
    values => {
      return deleteFeeTagData<FeeTag>(values._id)
    },
    {
      onSuccess(data): void {
        void invalidateFeeTag(data?.input)
      },
    },
  )
  return { mutate, status, error, isLoading: status === 'running' }
}

export const useOptions = () => {
  const { data: referenceData = [[], []] } = useReferenceData([
    ReferenceDataTypes.USAState,
    ReferenceDataTypes.FinancialProduct,
  ])
  const states = referenceDataToOptions(referenceData[0])
  const financialProducts = referenceDataToOptions(referenceData[1])

  const statesMap = new Map(states.map(({ value, label }) => [value, label]))
  const financialProductsMap = new Map(financialProducts.map(({ value, label }) => [value, label]))

  return { states, financialProducts, statesMap, financialProductsMap }
}

export default useFeeTag
