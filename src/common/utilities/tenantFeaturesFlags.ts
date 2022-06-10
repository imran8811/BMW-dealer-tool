import { TenantConfig } from '@common/endpoints/typings.gen'
import { StoreContextType } from '@common/store/configs'
import { useStoreContext } from '@common/store/storeContext'
import getConfig from 'next/config'
import { useCallback } from 'react'
import useFeatureFlag, { IAddonAccessRights, IFniAccessRights } from './useFeatureFlag'

const { publicRuntimeConfig } = getConfig() as { publicRuntimeConfig: { tenantId: string } }
const TENANT_ID = publicRuntimeConfig.tenantId

export const useInitializeTenant = (): StoreContextType & { initializeTenant: (data: TenantConfig) => void } => {
  const { actions, states } = useStoreContext()
  const initializeTenant = useCallback(
    (data: TenantConfig) => {
      if (data) {
        actions.setTenantConfig(data)
      }
    },
    [actions],
  )

  return { states, actions, initializeTenant }
}

function useAddonFeature(
  dealerCode?: string,
): { shouldShowImages: boolean; isModuleAccessible: boolean; isLoading: boolean } {
  const { featureFlags, isLoading } = useFeatureFlag()
  const rule = {
    shouldShowImages: true,
    isModuleAccessible: true,
    isLoading,
  }
  if (!isLoading) {
    const flag = featureFlags('permAccessoryRightsFlag') as IAddonAccessRights
    rule.shouldShowImages = !flag.image.rule
    rule.isModuleAccessible = !flag.module.rule
    if (
      (flag.module.tenant.length > 0 && flag.module.tenant.includes(TENANT_ID)) ||
      (dealerCode && flag.module.dealerCode.includes(dealerCode))
    ) {
      rule.isModuleAccessible = flag.module.rule
    }
    if (
      (flag.image.tenant.length > 0 && flag.image.tenant.includes(TENANT_ID)) ||
      (dealerCode && flag.image.dealerCode.includes(dealerCode))
    ) {
      rule.shouldShowImages = flag.image.rule
    }
    return rule
  }
  return rule
}

export function useFniFeature(dealerCode?: string): { isLoading: boolean; isModuleAccessible: boolean } {
  const { isLoading, featureFlags } = useFeatureFlag<IFniAccessRights>()
  const rule = {
    isModuleAccessible: true,
    isLoading,
  }
  if (!isLoading) {
    const flag = featureFlags('permFniRightsFlag')
    rule.isModuleAccessible = !flag.module.rule
    if (
      (flag.module.tenant.length > 0 && flag.module.tenant.includes(TENANT_ID)) ||
      (dealerCode && flag.module.dealerCode.includes(dealerCode))
    ) {
      rule.isModuleAccessible = flag.module.rule
    }
    return rule
  }
  return rule
}

export function useTenantFeatureFlags(): { isFinanceByModelEnabled: boolean } {
  const { states } = useStoreContext()

  const rule = {
    isFinanceByModelEnabled: !!states?.tenantState?.config?.configuration?.isSpecificMinimumFinance,
  }
  return rule
}

export default useAddonFeature
