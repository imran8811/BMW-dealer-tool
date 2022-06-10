import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import fetcher, { FetcherOptions } from '@common/utilities/fetcher'
import useMutation, { Options } from 'use-mutation'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import { mutateMany } from 'swr-mutate-many'
import useSWR from 'swr'
import type { Accessories } from './typings.gen'

const endpoint = '/dealer-management/dealer-config/get-accessories'
const updateEndPoint = '/dealer-management/dealer-config/update-accessory'
const masterGetEndpoint = '/dealer-management/accessories/get-all'

export type UseMutationStatusProps = Pick<ReturnType<typeof useMutation>[1], 'status'>

type UpdateAccessoryType = UseMutationStatusProps & {
  mutate: (data: UpdateAccessoryParamType) => Promise<null | undefined>
  error?: ApiError
}
type ResponseType = PaginatedResponse<AccessoryType[]>

export type UpdateAccessoryParamType = AccessoryType & {
  dealerCode?: string
}

export type AccessoryType = Accessories & {
  name: string
  _accessoryId?: string
}

export type IAccessoryFilter = AccessoryType & {
  sortBy?: string
  sortOrder?: number
}

const useAccessories = (
  dealerCode: string,
  params?: InfinitePaginationQuery | IAccessoryFilter,
): UseInfinitePaginationReturn<AccessoryType> =>
  useInfinitePagination<AccessoryType>(dealerCode && dealerCode !== '0' ? `${endpoint}/${dealerCode}` : null, params, {
    revalidateOnFocus: false,
    errorRetryInterval: 20000,
  })

export const useMasterOEM = (): {
  pageData?: AccessoryType[]
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<AccessoryType[], Error>(masterGetEndpoint, fetcher, { revalidateOnFocus: false })
  return {
    pageData: data,
    error,
    isLoading: !error && !data,
  }
}

export const useAllAccessory = (
  dealerCode: string,
): {
  pageData?: AccessoryType[]
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

export const useAccessoriesUpdate = (): UpdateAccessoryType => {
  const [mutate, { status }] = useMutation<UpdateAccessoryParamType, null>(
    (...props): Promise<null> => {
      return editCall(...props)
    },
    {
      onSuccess({ input }) {
        void invalidateAccessories(input)
      },
    },
  )
  return { mutate, status }
}

const editCall = (data: UpdateAccessoryParamType) => {
  const { _id: id, dealerCode } = data
  return sendForm<null>(`${updateEndPoint}/${dealerCode}/${id}`, data, {
    withAuthentication: true,
    method: 'PUT',
  })
}

export const invalidateAccessories = async (params?: UpdateAccessoryParamType): Promise<void> => {
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

export const deleteData = <U>(
  url: string,
  options?: FetcherOptions & { method?: RequestInit['method'] },
): Promise<U> | never =>
  fetcher<U>(
    url,
    {
      headers: {
        'content-type': 'application/json',
      },
      method: 'DELETE',
    },
    options,
  )

type Status = Pick<ReturnType<typeof useMutation>[1], 'status'>
type MutateInput = {
  id?: string
  dealerCode: string
  payload: UpdateAccessoryParamType
  isEdit: boolean
}
export type MutateAccessoyType = {
  mutate: (props: MutateInput, options?: Options<MutateInput, null, Error>) => Promise<null | undefined>
  status: Status
  isLoading: boolean
  error?: ApiError
}
export const useMutateAccessories = (): MutateAccessoyType => {
  const [mutate, { status, error }] = useMutation<MutateInput, null, ApiError>(
    (props): Promise<null> => {
      const { id, isEdit, dealerCode, payload } = props
      const url = isEdit
        ? `/dealer-management/dealer-config/update-accessory/${dealerCode}/${id || ''}`
        : `/dealer-management/dealer-config/add-accessory/${dealerCode}`
      return sendForm<null>(url, payload, {
        withAuthentication: true,
        method: isEdit ? 'PUT' : 'POST',
      })
    },
    {
      onSuccess({ data }) {
        void invalidateAccessories((data as unknown) as UpdateAccessoryParamType)
      },
    },
  )
  return {
    mutate,
    status: (status as unknown) as Status,
    error: error as ApiError,
    isLoading: status === 'running',
  }
}

export default useAccessories
