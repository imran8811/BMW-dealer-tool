import { TenantConfig } from '@common/endpoints/typings.gen'
import { Dispatch, ReducerAction } from 'react'
import tenantReducer from '../reducers/tenantReducer'
import { UPDATE_TENANT_CONFIG } from './actionTypes'

const updateTenantConfig = (data: TenantConfig, dispatch: Dispatch<ReducerAction<typeof tenantReducer>>): void => {
  if (data) {
    dispatch({ type: UPDATE_TENANT_CONFIG, payload: data })
  }
}

export default updateTenantConfig
