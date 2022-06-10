// NOTE: see sendForm.ts
/* eslint-disable max-classes-per-file */
import routes from '@common/routes'
import { getAdminApiUrl } from './config'
import {
  getAccessToken,
  clearCredentials,
  setCredentials,
  getCredentials,
  Credentials,
  isTokenValid,
} from './credentialsStore'

export type FetcherOptions = {
  withAuthentication?: boolean
}

export type ErrorDataType = {
  status?: number
  errorCode?: string
  message?: string
}

export class ApiError extends Error {
  name: string

  constructor(public response: Response, public data?: ErrorDataType, message?: string) {
    super(message || response.statusText)
    this.name = this.constructor.name
  }
}

/**
 * Thrown when user needs to authenticate to access API first
 */
export class Unauthenticated extends ApiError {}

/**
 * Thrown when user doesn't have sufficient permissions to access endpoint
 * */
export class Forbidden extends ApiError {}

/**
 * Thrown when given object does not exist
 */
export class NotFound extends ApiError {}

export class BadRequest extends ApiError {
  getMessage(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return this.data?.message || 'Unknown error'
  }
}

const IS_ABSOLUTE_REGEX = /^https?:\/\//i
const TRIM_LEADING_SLASH_REGEX = /^\/+/
const isAbsoluteUrl = (input: string): boolean => IS_ABSOLUTE_REGEX.exec(input) != null
const makeApiUrl = (path: string): string => `${getAdminApiUrl()}/${path.replace(TRIM_LEADING_SLASH_REGEX, '')}`

export const sendRequest = async (input: string, init?: RequestInit, options?: FetcherOptions): Promise<Response> => {
  const token = options?.withAuthentication !== false ? getAccessToken() : null
  const url = isAbsoluteUrl(input) ? input : makeApiUrl(input)

  const authorizationHeader = {
    Authorization: `Bearer ${token || ''}`,
  }

  const resp = await fetch(url, {
    ...(init || {}),
    headers: {
      ...(token ? authorizationHeader : {}),
      ...(init?.headers ? init.headers : {}),
      ...{
        'Allow-From': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'none'",
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  })

  if (!resp.ok) {
    const isJson = (resp.headers.get('content-type') ?? '').startsWith('application/json')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = isJson ? await resp.json() : undefined

    if (resp.status === 401) {
      // Client needs to authenticate -- redirect to login
      if (typeof window !== 'undefined') {
        clearCredentials()
        if (window.location.pathname !== routes.login)
          window.sessionStorage.setItem('PRE_LOGIN_URL', window.location.pathname)
        window.location.href = routes.login
      }

      throw new Unauthenticated(resp, data)
    }
    // User has no access to given resource
    if (resp.status === 403) throw new Forbidden(resp, data)
    // Object was not found
    if (resp.status === 404) throw new NotFound(resp, data)
    if (resp.status === 400) throw new BadRequest(resp, data)
    throw new ApiError(resp, data)
  }

  return resp
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetcher = async <T = any>(input: string, init?: RequestInit, options?: FetcherOptions): Promise<T> => {
  if (!isTokenValid()) {
    try {
      // Refresh Token Logic
      const token = getCredentials()?.refreshToken
      if (token) {
        const refreshedUserData = (await (await refreshTokenResp(token)).json()) as Credentials
        // Update local storage
        setCredentials({
          accessToken: refreshedUserData.accessToken,
          refreshToken: refreshedUserData.refreshToken,
        })
      }
    } catch (error) {
      // Precautionary check to see if token updated or not
      if (isTokenValid()) {
        // Actual Endpoint Call
        const resp = await sendRequest(input, init, options)
        return (await resp.json()) as Promise<T>
      }
      // if token is not updated in any previous call then redirect to login
      if (typeof window !== 'undefined') {
        clearCredentials()
        if (window.location.pathname !== routes.login)
          window.sessionStorage.setItem('PRE_LOGIN_URL', window.location.pathname)
        window.location.href = routes.login
      }

      throw new Unauthenticated(error)
    }
  }

  // Actual Endpoint Call
  const resp = await sendRequest(input, init, options)
  return (await resp.json()) as Promise<T>
}

/** Refresh token endpoint */
const refreshTokenResp = (token: string) =>
  sendRequest(`/dealer-management/dealer-refresh-token/${token}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'GET',
  })

export const sendForm = <U>(
  url: string,
  values: unknown,
  options?: FetcherOptions & { method?: RequestInit['method'] },
): Promise<U> | never =>
  fetcher<U>(
    url,
    {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(values),
      method: options?.method ?? 'POST',
    },
    options,
  )

/**
 * You can use this helper function to extract form's error message
 * from error response.
 */
export const selectErrorMessage = (err?: Error | null): string => {
  if (err == null) {
    return ''
  }
  if (err instanceof BadRequest) {
    return err.getMessage()
  }
  return 'Unknown error'
}
