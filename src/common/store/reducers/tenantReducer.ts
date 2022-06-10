/* eslint-disable default-case */
import { TenantConfig } from '@common/endpoints/typings.gen'
import { UPDATE_TENANT_CONFIG } from '../actions/actionTypes'
import IActions, { ITenantConfigState } from '../configs'

export const initialState: ITenantConfigState = {
  config: null,
}

const reducer = (state: typeof initialState, action: IActions): typeof initialState => {
  switch (action.type) {
    case UPDATE_TENANT_CONFIG:
      return {
        config: action.payload as TenantConfig,
      }
  }
  return state
}

export default reducer
