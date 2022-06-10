import { useEffect, useState } from 'react'
import { getUser, UserData } from '@common/utilities/credentialsStore'
import useGetKnowledgeAnywhereLink from '@common/endpoints/useGetKnowledgeAnywhereLink'

type UserDataType = UserData | undefined

const useUser = (): UserDataType => {
  const [user, setUser] = useState<UserDataType>({})
  useEffect(() => {
    setUser(getUser())
  }, [])

  return user
}

export const useIsAdmin = (): boolean | undefined => {
  const user = useUser()

  return user?.roleCode === 'DealerAdmin'
}

export const useIsSuperUser = (): boolean | undefined => {
  const user = useUser()

  return user?.roleCode === 'SuperUser'
}

export const useKnowledgeBaseUrl = (): string | null => {
  const { url } = useGetKnowledgeAnywhereLink()
  if (!url) return null
  return url
}

export default useUser
