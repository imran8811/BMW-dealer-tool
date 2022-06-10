import useSWR, { SWRInfiniteConfigInterface } from 'swr'
import { useState } from 'react'
import useMutation, { Options } from 'use-mutation'
import { mutateMany } from 'swr-mutate-many'

import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import {
  VehicleAccessories,
  InventoryManagement,
  InventoryManagementUpdateParams,
  UpdateParams,
  AccessoryRequest,
  Accessories,
  UpdateDailyParams,
  InventoryManagementUpdateDailyParams,
  UpdatePriceParams,
} from '@common/endpoints/typings.gen'
import query from '@common/utilities/query'
import sendForm, { ApiError } from '@common/utilities/sendForm'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import fetcher, { FetcherOptions } from '@common/utilities/fetcher'
import { UseMutationStatusProps } from './useAccessories'

export type VinAccessoryType = {
  vin: string
  accessories: VehicleAccessories[]
}
export type InventoryItem = InventoryManagement & {
  accessories: VehicleAccessories[]
}
export type IFilterInventory =
  | InventoryItem
  | {
      sortBy?: string
      sortOrder?: number
    }
export type BulkAccessoryType = {
  accessories: VehicleAccessories[]
  vin: string
  publish: boolean
}

type BulkUpdateInventoryType = {
  bulkUpdateInventory: BulkAccessoryType[]
}

export interface BulkAssociateAddonParams {
  vin: string
  associate?: VehicleAccessories[]
  remove?: string[]
}
export type AccessoryRequestType = AccessoryRequest & {
  _accessoryId?: string
}
export type AccessoryReqType = VehicleAccessories & {
  vin?: string
}

export type VehicalAccessoryNameType = Accessories

type BulkUpdateVehicalType = UseMutationStatusProps & {
  mutate: (data: BulkUpdateInventoryType) => Promise<null | undefined>
  error?: ApiError
}

type BulkAssociateAddonReturnType = UseMutationStatusProps & {
  mutate: (
    data: BulkAssociateAddonParams,
    options?: Options<BulkAssociateAddonParams, unknown, Error>,
  ) => Promise<null | undefined>
  error?: ApiError
}

export type UpdateVehicleParamUnion = UpdateParams[] | UpdateDailyParams[] | UpdatePriceParams[]

export enum UpdateVehicleEnum {
  publish = 'publish',
  dailyInventoryUpdate = 'dailyInventoryUpdate',
  internetPrice = 'internetPrice',
}

const allVehiclesEndpoint = '/inventory-management/get-all-dealer-vehicles'
const singleVehicleEndpoint = '/inventory-management/get-vehicle'
const updateVehiclesEndpoint = '/inventory-management/update-vehicle'
const updateDailyInfoEndpoint = '/inventory-management/vehical-daily-info'
const updateInternetPriceEndpoint = '/inventory-management/vehical-sale-price'

const useInventory = (
  dealerId: string,
  params?: InfinitePaginationQuery & IFilterInventory,
  config?: SWRInfiniteConfigInterface<PaginatedResponse<InventoryItem[]>, ApiError>,
): UseInfinitePaginationReturn<InventoryManagement> =>
  useInfinitePagination<InventoryManagement>(
    dealerId && dealerId !== '0' ? `${allVehiclesEndpoint}/${dealerId}` : null,
    params,
    config,
  )

const updateInventoryStatus = (data: UpdateVehicleParamUnion) => {
  const input = data as UpdateParams[]
  const params: InventoryManagementUpdateParams = { vehicleUpdateParams: input }
  return sendForm<null>(updateVehiclesEndpoint, params, { method: 'PUT' })
}

const updateInternetPrice = (data: UpdateVehicleParamUnion) => {
  const input = data[0] as UpdatePriceParams
  return sendForm<null>(updateInternetPriceEndpoint, input, { method: 'PUT' })
}

const updateInventoryDailyUpdate = (data: UpdateVehicleParamUnion) => {
  const input = data as UpdateDailyParams[]
  const params: InventoryManagementUpdateDailyParams = { vehicleUpdateParams: input }
  return sendForm<null>(updateDailyInfoEndpoint, params, { method: 'PUT' })
}

type ResponseType = PaginatedResponse<InventoryItem[]>
type ResponseTypeAccessory = PaginatedResponse<VehicalAccessoryNameType[]>

const invalidateInventory = async (params?: UpdateParams[]): Promise<void> => {
  const findByVin = (id: InventoryItem['vin']): UpdateParams | undefined =>
    params ? params.find(({ vin }) => vin === id) : undefined

  const modifyPageData = (data?: ResponseType): ResponseType | undefined => {
    if (!data || !data?.pageData || data?.pageData?.length === 0) return data
    let pageData = !data?.pageData || data?.pageData?.length > 0 ? [...data?.pageData] : []
    pageData = pageData.map(item => {
      const updated = findByVin(item.vin) || {}
      return { ...item, ...updated }
    })

    return { ...data, pageData }
  }

  await Promise.allSettled([
    mutateMany(`${singleVehicleEndpoint}*`, undefined, true),
    mutateMany(
      `*${allVehiclesEndpoint}*`,
      <T extends ResponseType | ResponseType[]>(data?: T): T | undefined =>
        (Array.isArray(data)
          ? (data as ResponseType[]).map(modifyPageData)
          : modifyPageData(data as ResponseType)) as T,
      true,
    ),
  ])
}

export const useInventoryUpdate = (item: keyof typeof UpdateVehicleEnum) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [mutate, result] = useMutation<UpdateVehicleParamUnion, null, ApiError>(
    (...props) => {
      setIsLoading(true)
      switch (item) {
        case 'dailyInventoryUpdate': {
          return updateInventoryDailyUpdate(...props)
        }
        case 'internetPrice': {
          return updateInternetPrice(...props)
        }
        default: {
          return updateInventoryStatus(...props)
        }
      }
    },
    {
      onSuccess: ({ input }) => {
        // invalidate cache only after successfully mutation -- I assume that otherwise transaction wasn't commited
        void invalidateInventory(input as UpdateParams[]).finally(() => {
          setIsLoading(false)
        })
        setIsLoading(false)
      },
      onFailure: () => {
        setIsLoading(false)
      },
    },
  )
  return { mutate, isLoading, ...result }
}

export const useVehicalAccessory = (
  vin: string,
): {
  pageData?: VehicleAccessories[]
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<VehicleAccessories[], Error>(`/inventory-management/get-accessories/${vin}`, fetcher, {
    revalidateOnFocus: false,
  })
  return {
    pageData: data,
    error,
    isLoading: !error && !data,
  }
}

export const invalidateVehicalAccessory = async (params?: AccessoryReqType): Promise<void> => {
  await Promise.allSettled([mutateMany(`/inventory-management/get-accessories/${params?.vin || ''}*`, undefined, true)])
  void invalidateInventory()
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

export const useInventoryBulkUpdate = (): BulkUpdateVehicalType => {
  const [mutate, { status, error }] = useMutation<BulkUpdateInventoryType, null, ApiError>(
    (...props): Promise<null> => {
      return bulkUpdateCall(...props)
    },
    {
      onSuccess() {
        void invalidateInventory()
      },
    },
  )
  return { mutate, status, error }
}

const bulkUpdateCall = (data: BulkUpdateInventoryType) => {
  return sendForm<null>('/inventory-management/bulk-update-inventory', data, {
    withAuthentication: true,
    method: 'PUT',
  })
}

export const useBulkAssociateAddons = (): BulkAssociateAddonReturnType => {
  const [mutate, { status, error }] = useMutation<BulkAssociateAddonParams, null, ApiError>(
    (props): Promise<null> => {
      return sendForm<null>('/inventory-management/associate-accessories', props, {
        withAuthentication: true,
        method: 'PUT',
      })
    },
    {
      async onSuccess({ input }) {
        await Promise.allSettled([
          mutateMany(`/inventory-management/get-accessories/${input?.vin || ''}*`, undefined, true),
        ])
        void invalidateInventory()
      },
    },
  )
  return { mutate, status, error }
}

export const useVehicalAccessoryList = (
  dealerCode: string,
  isActive: boolean,
): {
  pageData?: VehicalAccessoryNameType[]
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<ResponseTypeAccessory, Error>(
    dealerCode && dealerCode !== '0'
      ? `/dealer-management/dealer-config/get-accessories/${dealerCode}?${query({ isActive })}`
      : null,
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

type SendReferralEmailMutateInput = { firstName?: string; lastName?: string; email: string; vin: string }

type SendReferralEmailReturn = UseMutationStatusProps & {
  mutate: (
    data: SendReferralEmailMutateInput,
    options?: Options<SendReferralEmailMutateInput, null, Error>,
  ) => Promise<unknown>
  error?: ApiError
}

export const useSendReferralEmail = (): SendReferralEmailReturn => {
  const [mutate, result] = useMutation(values => {
    return sendForm('/dealer-management/send-refferal-invitation', values)
  })

  return { mutate, ...result }
}

export default useInventory
