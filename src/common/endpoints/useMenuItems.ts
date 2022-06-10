import fetcher from '@common/utilities/fetcher'
import useSWR from 'swr'
import type { IDealerSocialLinks, IMenuLinks } from './typings.gen'

export const useSocialMedia = (
  dealerCode: string,
): {
  data?: IDealerSocialLinks
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<IDealerSocialLinks, Error>(
    dealerCode && dealerCode !== '0' ? `/dealer-management/menu-items/dealer-social-links/${dealerCode}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )
  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

const useMenuLinks = (
  dealerCode: string,
): {
  data?: IMenuLinks[]
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<IMenuLinks[], Error>(
    dealerCode && dealerCode !== '0' ? `/dealer-management/menu-items/menu-by-dealerCode/${dealerCode}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )
  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export const deleteMenuLink = <U>(id: string, dealerCode: string): Promise<U> | never =>
  fetcher<U>(`/dealer-management/menu-items/menu-links-by-id/${dealerCode}/${id}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'DELETE',
  })

export default useMenuLinks
