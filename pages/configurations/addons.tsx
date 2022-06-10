import { useDealershipContext } from '@common/utilities/dealershipContext'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import AddOnContainer from '@containers/addonsConfiguration'
import Head from 'next/head'
import useAddonFeature from '@common/utilities/tenantFeaturesFlags'
import NotFound from '@components/NotFound'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { NextPage } from 'next'

const messages = {
  title: 'Configure Add-ons',
}

const Addons: NextPage<ServerSideData> = props => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()
  const { isModuleAccessible } = useAddonFeature(dealerCode)

  const { favIcon } = props

  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="Addon">
        {dealerCode && (!isModuleAccessible ? <NotFound /> : <AddOnContainer dealerCode={`${dealerCode}`} />)}
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

export default Addons
