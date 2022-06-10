import { useLDClient } from 'launchdarkly-react-client-sdk'
import { useEffect, useState } from 'react'

/**
 * `Launchdarkly` feature toggle name.
 *
 * Following naming convention should be used while creating feature
 *  toggle in Launch Darkly Dashboard >> `TEMP_FAIR_FEATURE_FLAG_DATE`
 *
 * 1. `TEMP/PERM` indicates type of toggle (Either temporary or permanent).
 * 2. `FAIR` indicates customer/tenant name
 * 3. `FEATURE_FLAG` indicates name of the feature i.e FLORIDA_CONTRACT etc.
 * 4. `DATE` indicates date of creation i.e `20210723`
 */
export enum FeatureFlagsList {
  tempAccessoryUIFlag = 'TEMP_ACCESSORY_UI_FLAG_20210916',
  permAccessoryRightsFlag = 'PERM_ADDON_PERMISSION_FLAG_20210925',
  tempFeeTagUIFlag = 'TEMP_FEE_TAG_FLAG_20210924',
  tempOrderFniFeeFlag = 'TEMP_ORDER_FEE_EDIT_FLAG_20211116',
  permFniRightsFlag = 'PERM_FNI_PERMISSION_FLAG_20211118',
  permFinanceAmountByModel = 'PERM_FINANCE_AMOUNT_BY_MODEL_FLAG_20211207',
  tempVehicleConditionInAddon = 'TEMP_VEHICLE_CONDITION_IN_ADDON_FLAG_20211223',
  tempCustomerReferalFlag = 'TEMP_CUSTOMER_REFERAL_FLAG_20220104',
}

/** `Launchdarkly` feature toggle interface. Keys should be same as `FeatureFlagsList` */
export interface FeatureFlags {
  tempAccessoryUIFlag?: boolean
  tempFeeTagUIFlag?: boolean
  permAccessoryRightsFlag: IAddonAccessRights
  tempOrderFniFeeFlag: boolean
  permFniRightsFlag: IFniAccessRights
  permFinanceAmountByModel: IFinanceByModelRights
  tempVehicleConditionInAddon: boolean
  tempCustomerReferalFlag: boolean
}

type FeatureFlagReturn<T> = {
  featureFlags: (k: keyof typeof FeatureFlagsList) => T
  ldClient: ReturnType<typeof useLDClient>
  isLoading: boolean
}

/** Feature toggle hook based on `Launchdarkly` that returns `featureFlags` & `ldClient`
 *
 * @link
 * https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.ldclient.html
 */
function useFeatureFlag<T>(): FeatureFlagReturn<T> {
  const [isLoading, setIsLoading] = useState(true)
  const ldClient = useLDClient()
  const flag = ldClient?.allFlags()
  useEffect(() => {
    void ldClient?.waitUntilReady().then(() => {
      setIsLoading(false)
      return null
    })
  }, [ldClient])
  const featureFlags = (k: keyof typeof FeatureFlagsList) => (flag?.[FeatureFlagsList[k]] || false) as T
  return {
    featureFlags,
    ldClient,
    isLoading,
  }
}

type AddonFF = { dealerCode: string[]; rule: boolean; tenant: string[] }
export interface IAddonAccessRights {
  image: AddonFF
  module: AddonFF
}
export interface IFniAccessRights {
  module: AddonFF
}

export interface IFinanceByModelRights {
  module: AddonFF
}

export default useFeatureFlag
