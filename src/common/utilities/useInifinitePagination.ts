import { useCallback, useState } from 'react'
import { useSWRInfinite, SWRInfiniteResponseInterface, SWRInfiniteConfigInterface } from 'swr'

import fetcher, { ApiError } from '@common/utilities/fetcher'
import query from '@common/utilities/query'
import { PaginatedResponse } from '@common/utilities/PaginationTypes'

const defaultPageSize = 10

export type InfinitePaginationQuery = { pageSize?: number; dealerCode?: string }

type AllowedQuery = InfinitePaginationQuery & Parameters<typeof query>[0]

/**
 * Encapsulate query string: pagination with additional optional parameters
 */
const generateKey = <DataType extends unknown, QueryParams extends AllowedQuery = InfinitePaginationQuery>(
  endpoint: string | null,
  params?: QueryParams,
) => (pageNo: number, previousPageData: PaginatedResponse<DataType[]> | null): string | null => {
  if (endpoint == null) return null
  if (previousPageData && previousPageData?.pages < pageNo) return null

  const makeQuery =
    params?.pageSize === -1 /**  if `pageSize` is set to `-1` then remove the pagination query */
      ? {
          ...(params || {}),
          pageSize: undefined,
        }
      : {
          pageSize: defaultPageSize,
          ...(params || {}),
          pageNo: pageNo + 1,
        }
  const url = `${endpoint}?${query(makeQuery)}`

  return url
}

export type UseInfinitePaginationReturn<DataType> = SWRInfiniteResponseInterface<PaginatedResponse<DataType[]>> &
  Omit<Partial<PaginatedResponse<DataType[]>>, 'page' | 'pageData'> & {
    pageData: DataType[]
    isExhausted: boolean
    isLoading: boolean
    loadMore: () => void
    error?: ApiError
  }

/**
 * `useSWRInfinite` enhanced with standardized API pagination
 */
const useInfinitePagination = <DataType extends unknown, QueryParams extends AllowedQuery = InfinitePaginationQuery>(
  endpoint: string | null,
  params?: QueryParams,
  config?: SWRInfiniteConfigInterface<PaginatedResponse<DataType[]>, ApiError>,
): UseInfinitePaginationReturn<DataType> => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetcherWithLoadingState = useCallback(async <T>(...props: Parameters<typeof fetcher>) => {
    setIsLoading(true)
    const response: T = await fetcher(...props)
    setIsLoading(false)

    return response
  }, [])

  const getKey = generateKey<DataType>(endpoint, params)

  const { data, error, size, setSize, ...result } = useSWRInfinite<PaginatedResponse<DataType[]>, ApiError>(
    getKey,
    fetcherWithLoadingState,
    {
      revalidateAll: true,
      persistSize: true,
      ...(config || {}),
    },
  )

  const computedData: { pageData: DataType[]; total?: number; isExhausted: boolean; pages?: number; limit?: number } = {
    pageData: [],
    isExhausted: false,
  }

  if (data && data?.length > 0) {
    // Reduce paginated responses
    computedData.pageData = data.reduce((prev, curr) => [...prev, ...curr.pageData], [] as DataType[])
    computedData.total = data[0].total
    computedData.pages = data[0].pages
    computedData.limit = data[0].limit
    computedData.isExhausted = size >= data[0].pages
  }

  const loadMore = () => {
    void setSize(size + 1)
  }

  return {
    ...result,
    ...computedData,
    data,
    error,
    isLoading,
    size,
    setSize,
    loadMore,
  }
}

export default useInfinitePagination
