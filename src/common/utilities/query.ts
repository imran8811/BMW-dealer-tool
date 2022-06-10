import { stringify } from 'query-string'

export { parse } from 'query-string'

const buildQuery: typeof stringify = (query, options = {}) =>
  stringify(query, {
    arrayFormat: 'comma',
    ...options,
  })

export default buildQuery
