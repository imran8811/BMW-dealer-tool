import { createContext, FC, useContext } from 'react'
import { defaultStoreValues, StoreContextType } from './configs'
import useReducerActions from './reducers/useReducersActions'

export const StoreContext = createContext<StoreContextType>(defaultStoreValues)

export const useStoreContext = (): StoreContextType => useContext(StoreContext)

const StoreProvider: FC = ({ children }) => {
  const { actions, states } = useReducerActions()
  return (
    <StoreContext.Provider
      value={{
        actions,
        states,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default StoreProvider
