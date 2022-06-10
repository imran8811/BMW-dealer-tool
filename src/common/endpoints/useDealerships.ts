import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import useMutation from 'use-mutation'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import { mutateMany } from 'swr-mutate-many'
import type { Dealerships } from './typings.gen'

const endpoint = '/dealer-management/dealership/get-all-dealerships'
const statusChangeEndpoint = '/dealer-management/dealership/enable-disable-dealership'
export type DealerShipFields = Dealerships & {
  county?: string
}
export type UpdateDealershipStatusReturnType = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: UpdateParamDealer, config?: Parameters<typeof useMutation>[1]) => Promise<null | undefined>
  error?: ApiError
}
export type UpdateDealershipRetailReturnType = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: Dealerships) => Promise<null | undefined>
  error?: ApiError
}
type ResponseType = PaginatedResponse<Dealerships[]>

export interface UpdateParamDealer {
  isActive?: boolean
  dealerCode: string
}

export type IFilterDealerShips =
  | Dealerships
  | {
      // sorting
      sortBy?: string
      sortOrder?: number
    }

const useDealerships = (
  params?: InfinitePaginationQuery & IFilterDealerShips,
): UseInfinitePaginationReturn<Dealerships> =>
  useInfinitePagination<Dealerships>(`${endpoint}`, params, {
    revalidateOnFocus: false,
    errorRetryInterval: 20000,
  })

export const useDealershipStatusUpdate = (): UpdateDealershipStatusReturnType => {
  const [mutate, { status }] = useMutation<UpdateParamDealer, null>(
    (...props): Promise<null> => {
      return apiCall(...props)
    },
    {
      onSuccess({ input }) {
        void invalidateDealership(input)
      },
    },
  )
  return { mutate, status }
}
export const useDealershipRetailUpdate = (): UpdateDealershipRetailReturnType => {
  const [mutate, { status }] = useMutation<Dealerships, null>(
    (...props): Promise<null> => {
      return digitalRetailCall(...props)
    },
    {
      onSuccess({ input }) {
        void invalidateDealership(input)
      },
    },
  )
  return { mutate, status }
}

const digitalRetailCall = (data: Dealerships) => {
  return sendForm<null>('/dealer-management/dealership/update-dealership', data, {
    withAuthentication: true,
    method: 'PUT',
  })
}

const apiCall = (data: UpdateParamDealer) => {
  const { isActive, dealerCode } = data
  const params = {
    isActive: !isActive,
  }
  return sendForm<null>(`${statusChangeEndpoint}/${dealerCode || ''}`, params, {
    withAuthentication: true,
    method: 'PATCH',
  })
}

export const invalidateDealership = async (params?: UpdateParamDealer | Dealerships): Promise<void> => {
  const modifyPageData = (data?: ResponseType): ResponseType | undefined => {
    if (!data || !data?.pageData || data?.pageData?.length === 0) return data
    let pageData = !data?.pageData || data?.pageData?.length > 0 ? [...data?.pageData] : []
    pageData = pageData.map(item => {
      const updated = item.dealerCode === params?.dealerCode ? item : {}
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

export default useDealerships
