import NotFound from '@components/NotFound'
import { fetchTenantConfiguration } from '@common/endpoints/useTenantConfiguration'
import { useEffect, useState, FC, useCallback } from 'react'
import { TenantConfig } from '@common/endpoints/typings.gen'
import BaseLayout from '@layouts/BaseLayout'

const PageNotFound: FC = () => {
  const [data, setData] = useState<TenantConfig>()

  const fetchMenu = useCallback(async () => {
    const response = await fetchTenantConfiguration()
    setData(response.data)
  }, [])

  useEffect(() => {
    void fetchMenu()
  }, [fetchMenu])

  return data ? (
    <BaseLayout serverSideProps={{ tenantConfig: data }} pageKey="NotFound">
      <NotFound />
    </BaseLayout>
  ) : (
    <NotFound />
  )
}

export default PageNotFound
