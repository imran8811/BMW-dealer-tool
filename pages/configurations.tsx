import { useDealershipContext } from '@common/utilities/dealershipContext'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import ConfigurationContainer from '@containers/ConfigurationsContainer'
import SectionHeading from '@components/SectionHeading'
import Head from 'next/head'
import { NextPage } from 'next'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { TenantConfig } from '@common/endpoints/typings.gen'
import { useInitializeTenant } from '@common/utilities/tenantFeaturesFlags'
import { useEffect } from 'react'

const messages = {
  dealerConfigurations: 'Dealer Configuration',
  title: 'Dealer Configurations',
}

const Configurations: NextPage<ServerSideData> = props => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()

  const { tenantConfig, favIcon } = props
  const { initializeTenant } = useInitializeTenant()
  useEffect(() => {
    if (tenantConfig) {
      initializeTenant(tenantConfig as TenantConfig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantConfig])

  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="Configurations">
        <div className="pt-5 pb-2">
          <SectionHeading icon="gear">{messages.dealerConfigurations}</SectionHeading>
        </div>
        {dealerCode !== undefined && (
          <ConfigurationContainer tenantConfig={tenantConfig as TenantConfig} dealerCode={dealerCode} />
        )}
      </LayoutWithNavigation>
    </>
  )
}

export async function getServerSideProps(): Promise<IServerSidePropsReturn> {
  const { data, error } = await computeServerSideProps()
  if (error) return { notFound: true }
  return {
    props: data,
  }
}

export default Configurations
