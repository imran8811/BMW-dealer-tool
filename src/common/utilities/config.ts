/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import getConfig from 'next/config'

const { publicRuntimeConfig = {} } = process.env.STORYBOOK_STORYBOOK != null ? {} : getConfig()

/**
 * Returns base URL for the API. Trailing slash will be removed.
 *
 * Example:
 *
 *  `https://fair-dev-admin.otoz.biz/api`
 */
export const getAdminApiUrl = (): string => {
  const baseUrl = publicRuntimeConfig?.adminApiUrl as string | null

  if (baseUrl == null || baseUrl.trim() === '') {
    throw new Error(
      'Tried to make an API request, but base url is missing. ' +
        'Are you trying to make API requests from SSG or Storybook?',
    )
  }

  // regex removes / from the end if present
  return baseUrl.replace(/\/*$/, '')
}
