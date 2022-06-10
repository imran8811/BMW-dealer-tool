import useSWR from 'swr'
import getConfig from 'next/config'
import { fetcher } from '@common/utilities/http-api'
import { Secrets, TenantConfig } from './typings.gen'

const { publicRuntimeConfig } = getConfig() as { publicRuntimeConfig: { tenantId: string } }
const TENANT_ID = publicRuntimeConfig.tenantId
const endpoint = '/tenant-management/configs'
export const getTenantConfigurationEndpoint = `${endpoint}/getConfig/${TENANT_ID}`
const getSecretsEndpoint = `${endpoint}/getSecrets/APPINSIGHTS_INSTRUMENTATIONKEY,STORAGE_ACCOUNT_URL`
export const getDocumentUploadUrlsEndpoint = `${endpoint}/getUploadUrls/${TENANT_ID}`

export const useTenantConfiguration = (): {
  data?: TenantConfig
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<TenantConfig, Error>(getTenantConfigurationEndpoint, undefined, {
    revalidateOnFocus: false,
  })

  return {
    data,
    error,
    isLoading: !error && !data,
  }
}

export const fetchTenantConfiguration = async (): Promise<{ data?: TenantConfig; error?: unknown }> => {
  try {
    const data = await fetcher<TenantConfig>(getTenantConfigurationEndpoint, {
      headers: {
        'content-type': 'application/json',
      },
      method: 'GET',
    })
    return { data, error: undefined }
  } catch (error) {
    return { data: undefined, error: error as unknown }
  }
}

export const useSecrets = (): {
  data?: Secrets
  error?: Error
  isLoading: boolean
} => {
  const { error, data } = useSWR<Secrets, Error>(getSecretsEndpoint)

  return {
    data,
    error,
    isLoading: !error && !data,
  }
}
