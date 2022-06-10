import { TenantConfig } from '@common/endpoints/typings.gen'

export default interface IActions {
  payload: unknown
  type: string
}

export interface ITenantConfigState {
  config: TenantConfig | null
}

// TODO: add relevant types
export type StoreContextType = {
  actions: {
    setTenantConfig: (data: TenantConfig) => unknown
  }
  states: {
    tenantState: ITenantConfigState | null
  }
}

// TODO: add relevant default values
export const defaultStoreValues = {
  states: { tenantState: null },
  actions: { setTenantConfig: (): void => undefined },
}
