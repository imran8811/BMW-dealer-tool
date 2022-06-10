import useSWR from 'swr'
import query from '@common/utilities/query'

export type UserAccount = {
  _id: string
  firstName?: string
  lastName?: string
  isActive?: boolean
  isNewUser?: boolean
  _dealershipId: string
  email?: string
  jobTitle?: string
  phoneNumber?: string | number
  createdAt?: string
  updatedAt?: string
  roleCode?: string
  roleDisplayName?: string
  fullName?: string
}

type Response = {
  pageData: UserAccount[]
}

const mapPageData = (data: Array<UserAccount> | undefined) => {
  if (!data) {
    return
  }

  return data.map(element => {
    return {
      ...element,
      fullName: element?.firstName && element?.lastName ? `${element?.firstName} ${element.lastName}` : '',
    }
  })
}

const useUsers = ({
  dealerCode,
}: {
  dealerCode?: string
}): {
  pageData?: Array<UserAccount>
  error?: Error
  isLoading: boolean
  isValidating: boolean
} => {
  const endpoint = `/dealer-management/get-dealer-accounts?${query({ dealerCode })}`
  const { error, data, isValidating } = useSWR<Response, Error>(
    dealerCode && dealerCode !== '0' ? endpoint : null,
    undefined,
    { revalidateOnFocus: false },
  )

  return {
    pageData: mapPageData(data?.pageData),
    error,
    isLoading: !error && !data,
    isValidating,
  }
}

export default useUsers
