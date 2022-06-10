import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import sendForm from '@common/utilities/sendForm'
import fetcher from '@common/utilities/fetcher'
import useMutation from 'use-mutation'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import { mutateMany } from 'swr-mutate-many'
import useSWR from 'swr'
import type { Accessories } from './typings.gen'

const endpoint = '/dealer-management/accessories'

export type UseMutationStatusProps = Pick<ReturnType<typeof useMutation>[1], 'status'>
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

export const useMasterAccessories = (
  params?: InfinitePaginationQuery | IAccessoryFilter,
): UseInfinitePaginationReturn<AccessoryType> =>
  useInfinitePagination<AccessoryType>(`${endpoint}`, params, {
    revalidateOnFocus: false,
    errorRetryInterval: 20000,
  })

export const useAllMasterAccessory = (
  dealerCode: string | null,
): {
  pageData?: AccessoryType[]
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<ResponseType, Error>(
    dealerCode && dealerCode !== '0' ? `${endpoint}` : null,
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

export const mutateMasterAccessory = (values?: UpdateAccessoryParamType, id?: string) => {
  const url = id ? `${endpoint}/update-accessory/${id}` : `${endpoint}/add-accessory`
  return sendForm<UpdateAccessoryParamType>(url, values, {
    withAuthentication: true,
    method: id ? 'PUT' : 'POST',
  })
}

export const useMasterAccessoryMutation = (id?: string) => {
  const [mutate, { error, status }] = useMutation<UpdateAccessoryParamType, UpdateAccessoryParamType, Error>(
    (values): Promise<UpdateAccessoryParamType> => {
      return mutateMasterAccessory(values, id)
    },
    {
      onSuccess(data): void {
        void invalidateMasterAccessories(data?.data)
      },
    },
  )

  return { mutate, error, status, isLoading: status === 'running' }
}

export const invalidateMasterAccessories = async (params?: UpdateAccessoryParamType): Promise<void> => {
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

export const deleteMasterAccessory = <U>(id: string): Promise<U> | never =>
  fetcher<U>(
    `${endpoint}/${id}`,
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

export const useDeleteMasterAccessory = () => {
  const [mutate, { status, error }] = useMutation<UpdateAccessoryParamType, unknown, Error>(
    values => {
      return deleteMasterAccessory<Accessories>(values._id)
    },
    {
      onSuccess(data): void {
        void invalidateMasterAccessories(data?.input)
      },
    },
  )
  return { mutate, status, error, isLoading: status === 'running' }
}

export default useMasterAccessories
