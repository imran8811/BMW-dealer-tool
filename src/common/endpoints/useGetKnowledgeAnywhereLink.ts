import { isTokenValid } from '@common/utilities/credentialsStore'
import { fetcher } from '@common/utilities/http-api'
import useSWR from 'swr'

const endpoint = '/tenant-management/page-data/knowledge-anywhere-link'

const useGetKnowledgeAnywhereLink = (): {
  url?: string
  error?: Error
  isLoading?: boolean
} => {
  const { error, data } = useSWR<{ url: string }, Error>(!isTokenValid() ? null : endpoint, fetcher, {
    revalidateOnFocus: false,
  })
  return {
    url: data?.url as string,
    error,
    isLoading: !error && !data,
  }
}

export default useGetKnowledgeAnywhereLink
