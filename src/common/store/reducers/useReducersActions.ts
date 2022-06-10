import { useReducer } from 'react'
import { TenantConfig } from '@common/endpoints/typings.gen'
import tenantReducer, { initialState as tenantInitialState } from './tenantReducer'
import updateTenantConfig from '../actions/tenantAction'
import { StoreContextType } from '../configs'

const useReducerActions = (): StoreContextType => {
  const [tenantState, tenantDispatch] = useReducer(tenantReducer, tenantInitialState)
  const actions = {
    setTenantConfig: (data: TenantConfig) => updateTenantConfig(data, tenantDispatch),
  }

  return {
    actions,
    states: { tenantState },
  }
}

export default useReducerActions
