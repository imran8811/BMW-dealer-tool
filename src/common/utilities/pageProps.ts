import { fetchTenantConfiguration } from '@common/endpoints/useTenantConfiguration'

export interface IServerSidePropsReturn {
  redirect?: {
    destination: string
    permanent: string
  }
  notFound?: boolean
  props?: unknown
}

export interface IComputeServerSideProps {
  data?: ServerSideData
  error?: unknown
}

export interface ServerSideData {
  [x: string]: unknown
}

const computeServerSideProps = async (): Promise<IComputeServerSideProps> => {
  try {
    const props = {}
    const { data: tenantConfig, error } = await fetchTenantConfiguration()

    if (error)
      return {
        data: undefined,
        error,
      }
    return {
      data: { ...props, tenantConfig, favIcon: tenantConfig?.configuration?.applicationLogo?.favIconPath },
      error: undefined,
    }
  } catch (error) {
    return {
      data: undefined,
      error: error as unknown,
    }
  }
}

export default computeServerSideProps
