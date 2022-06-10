import fetcher from '@common/utilities/fetcher'
import { sendForm } from '@common/utilities/http-api'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'
import useInfinitePagination, {
  InfinitePaginationQuery,
  UseInfinitePaginationReturn,
} from '@common/utilities/useInifinitePagination'
import { PenAction } from '@containers/ConfigurationsContainer/components/General/General'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import useSWR from 'swr'
import { mutateMany } from 'swr-mutate-many'
import useMutation from 'use-mutation'
import type { FNIProductRate, FnIProducts, PenProduct, PenProvider, SetDealerProductRequest } from './typings.gen'

export const endpoint = '/dealer-management/fni-products'
export const endpointSaveProduct = '/pen/dealer-product'
export type DealerFnIProductType = SetDealerProductRequest & {
  _id: string
}

export type IFniFilters =
  | DealerFnIProductType
  | {
      sortBy?: string
      sortOrder?: number
    }
const useFnIProducts = (dealerCode: string, params?: IFniFilters): UseInfinitePaginationReturn<DealerFnIProductType> =>
  useInfinitePagination<DealerFnIProductType, InfinitePaginationQuery>(
    `${endpoint}`,
    { dealerCode, ...params },
    {
      revalidateOnFocus: false,
      errorRetryInterval: 20000,
    },
  )

type ProviderResponse = {
  data?: PenProvider[]
  error?: Error
}

export const usePenProviders = (): ProviderResponse => {
  const { data, error } = useSWR<PenProvider[], Error>('/pen/providers', fetcher, { revalidateOnFocus: false })
  return {
    data,
    error,
  }
}

type ProductPropsType = {
  providerId?: string
  productId?: number
  isActive?: boolean
  id?: string
}
type ReturnTypeProducts = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: ProductPropsType) => Promise<PenProduct[] | PenProduct | undefined>
  error?: ApiError
  data?: PenProduct[]
}
export const useProductByProvider = (): ReturnTypeProducts => {
  const [mutate, { status, data }] = useMutation<ProductPropsType, PenProduct[], null>(({ providerId }) =>
    fetcher(
      `/pen/products/${providerId || ''}`,
      {
        headers: {
          'content-type': 'application/json',
        },
        method: 'GET',
      },
      {
        withAuthentication: true,
      },
    ),
  )
  return { mutate, status, data }
}

export const useFnIStatusUpdate = (): ReturnTypeProducts => {
  const [mutate, { status }] = useMutation<ProductPropsType, PenProduct, null>(
    ({ id, isActive }): Promise<PenProduct> => {
      return sendForm<PenProduct>(
        `/dealer-management/fni-products/status/${id || ''}`,
        {
          isActive: !isActive,
        },
        {
          withAuthentication: true,
          method: 'PUT',
        },
      )
    },
    {
      onSuccess({ input }) {
        void invalidateProducts(input)
      },
    },
  )
  return { mutate, status }
}
type ResponseType = PaginatedResponse<PenProduct[]>

export const invalidateProducts = async (params?: ProductPropsType | PenProduct): Promise<void> => {
  const modifyPageData = (data?: ResponseType): ResponseType | undefined => {
    if (!data || !data?.pageData || data?.pageData?.length === 0) return data
    let pageData = !data?.pageData || data?.pageData?.length > 0 ? [...data?.pageData] : []
    pageData = pageData.map(item => {
      const updated = item.productId === params?.productId ? item : {}
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

type ReturnTypeUpdateProducts = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data?: DealerFnIProductType) => Promise<PenProduct[] | PenProduct | undefined>
  error?: ApiError
  data?: PenProduct[] | PenProduct
}

export const useDeletePenProduct = (): ReturnTypeUpdateProducts => {
  const [mutate, { status }] = useMutation<DealerFnIProductType | undefined, PenProduct, null>(
    (item): Promise<PenProduct> => {
      const newValues = {
        ...item,
        action: PenAction.Unregister,
        dealerFniProductId: item?._id,
      }
      return sendForm<PenProduct>(endpointSaveProduct, newValues, {
        withAuthentication: true,
        method: 'POST',
      })
    },
    {
      onSuccess(data): void {
        void invalidateProducts(data?.data)
      },
    },
  )
  return { mutate, status }
}

type PenRatesPropsType = {
  dealerCode: string
  vin: string
  mileage: number
  isNewVehicle: boolean
  msrp: number
  internetPrice: number
  productCode: string
  term: number
  financedTermMileage: number
  apr: number
  financedAmount?: number
  vehicleTrim: string
}
type ReturnTypePenRates = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: PenRatesPropsType) => Promise<FNIProductRate[] | FNIProductRate | undefined>
  error?: ApiError
  data?: FNIProductRate[]
  isLoading: boolean
}

export const usePenRates = (penRatesRequest: PenRatesPropsType): ReturnTypePenRates => {
  const [mutate, { status, data }] = useMutation<PenRatesPropsType, FNIProductRate[], null>(
    (): Promise<FNIProductRate[]> => {
      return sendForm<FNIProductRate[]>('/pen/rates', penRatesRequest, {
        withAuthentication: true,
        method: 'POST',
      })
    },
  )
  return { mutate, status, data, isLoading: status === 'running' }
}

type ReturnTypeMutateDealerFniProducts = Pick<ReturnType<typeof useMutation>[1], 'status'> & {
  mutate: (data: FnIProducts[]) => Promise<FnIProducts[] | undefined>
  error?: ApiError
  data?: FnIProducts[]
  isLoading: boolean
}

export const useMutateDealerFniProducts = (fniProducts: FnIProducts[]): ReturnTypeMutateDealerFniProducts => {
  const [mutate, { status, data }] = useMutation<FnIProducts[], FnIProducts[], null>(() => {
    return sendForm(
      '/dealer-management/fni-products',
      { dealerFniProducts: fniProducts },
      { method: 'POST', withAuthentication: true },
    )
  })
  return { mutate, status, data, isLoading: status === 'running' }
}

export default useFnIProducts
