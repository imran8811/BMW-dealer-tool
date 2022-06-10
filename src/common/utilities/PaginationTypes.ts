export type PaginatedResponse<T> = {
  pageData: T
  page: number
  total: number
  limit: number
  pages: number
}

export type PaginatedQuery = {
  pageNo?: number
  pageSize?: number
}
