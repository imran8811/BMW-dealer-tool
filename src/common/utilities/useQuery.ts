import { useRouter } from 'next/router'
import { stringify as toQueryString } from 'querystring'

/**
 * Provides router's query params, but in a more convinient
 * interface (URLSearchParams).
 *
 * router.query's items in TypeScript are typed as `string || string[]`
 * which is technically true, but makes it hard to use in everyday's life.
 *
 * Now you can call `query.get('something')` to get one item or
 * `query.getAll('something')` to get an array.
 */
export default function useQuery(): URLSearchParams {
  const router = useRouter()

  return new URLSearchParams(toQueryString(router.query))
}
