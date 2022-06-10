import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import MasterAddOnContainer from '@containers/masterAccessoryConfiguration'
import Head from 'next/head'
import NotFound from '@components/NotFound'
import { NextPage } from 'next'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import useAddonFeature from '@common/utilities/tenantFeaturesFlags'

const messages = {
  title: 'Configure Master Add-ons',
}

const MasterAddons: NextPage<ServerSideData> = props => {
  const { isModuleAccessible, isLoading } = useAddonFeature()

  const { favIcon } = props
  if (isLoading) return <></>
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="MasterAddon">
        {!isModuleAccessible ? <NotFound /> : <MasterAddOnContainer />}
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

export default MasterAddons
