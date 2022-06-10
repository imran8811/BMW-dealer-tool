import { getUser } from '@common/utilities/credentialsStore'
import useSessionStorage from '@common/utilities/useSessionStorage'
import useUser from '@common/utilities/useUser'
import { createContext, FC, useContext } from 'react'

type DealershipContextType = {
  getCurrentDealershipCode: () => string | undefined
  setCurrentDealershipCode: (id: string) => void
  clearDealershipContext: () => void
}

const defaultValues = {
  getCurrentDealershipCode: () => undefined,
  setCurrentDealershipCode: () => {},
  clearDealershipContext: () => {},
}

const DealershipContext = createContext<DealershipContextType>(defaultValues)

export const useDealershipContext = (): DealershipContextType => useContext(DealershipContext)

export const DealershipProvider: FC = ({ children }) => {
  const dealerCode = useUser()?.dealerCode
  const [storedDealerCode, setCurrentDealershipCode, clearDealershipContext] = useSessionStorage(
    'currentDealershipCode',
    dealerCode,
  )

  const getCurrentDealershipCode = () => {
    if (!storedDealerCode) {
      const newDealerCode = getUser()?.dealerCode
      if (newDealerCode) {
        setCurrentDealershipCode(newDealerCode)
      }
      return newDealerCode
    }
    return storedDealerCode
  }

  const { Provider } = DealershipContext

  return (
    <Provider
      value={{
        getCurrentDealershipCode,
        setCurrentDealershipCode,
        clearDealershipContext,
      }}
    >
      {children}
    </Provider>
  )
}

export default DealershipContext
