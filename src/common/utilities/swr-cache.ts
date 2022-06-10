import { PaginatedResponse } from './PaginationTypes'

type MutateCallback<Data = any> = (currentValue: Data) => Data

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data != null
}

function isArray(data: unknown): data is unknown[] {
  return Array.isArray(data)
}

function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T[]> {
  return (
    isRecord(data) &&
    typeof data.page === 'number' &&
    typeof data.total === 'number' &&
    typeof data.limit === 'number' &&
    typeof data.pages === 'number' &&
    typeof data.pageData != null &&
    Array.isArray(data.pageData)
  )
}

/**
 * You can use this to update paginated response in SWR cache (optimistic update).
 *
 * You'll need to pass a callback which will modify the list.
 * Example of an optimistic update that adds new item to the list:
 *
 *   mutateMany(
 *    `* /dealer-management/dealer-config/get-dealer-fees`,
 *    updatePageData(items => [newItem, ...items]),
 *    false,
 *   )
 */

export function updatePageData<T>(callback: (rows: T[]) => T[]): MutateCallback<unknown> {
  const update = (input: unknown) =>
    !isPaginatedResponse<T>(input)
      ? input
      : {
          ...input,
          pageData: callback(input.pageData),
        }
  return (input: unknown) => (isArray(input) ? input.map(update) : update(input))
}

/**
 * You can use this function to update one item in SWR cache (optimistic update).
 *
 * You'll need to pass a callback which will modify the item with  given ID.
 * Example of updating "isActive" property of a single item:
 *
 *   mutateMany(
 *    `*  /dealer-management/dealer-config/get-dealer-fees
/*`,
 *    updateObjectCache(item => ({ ...item, isActive })),
 *    false,
 *   )
 */
export function updateObjectCache<T extends { _id: string }>(
  id: string,
  callback: (item: T) => T,
): MutateCallback<unknown> {
  // TODO for now this only supports list, we should also support object endpoints
  return updatePageData<T>((rows: T[]) => rows.map(row => (row._id === id ? callback(row) : row)))
}
