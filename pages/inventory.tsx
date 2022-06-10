import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import Inventory from '@containers/Inventory'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import Head from 'next/head'
import { NextPage } from 'next'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'

const messages = {
  title: 'Inventory Management',
}
const InventoryPage: NextPage<ServerSideData> = props => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="Inventory" className="pb-5">
        {dealerCode && <Inventory dealerCode={dealerCode} />}
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

export default InventoryPage
