import Dealership from '@containers/Dealership'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import Head from 'next/head'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { NextPage } from 'next'

const messages = {
  title: 'Manage Dealers',
}
const DealershipManagementPage: NextPage<ServerSideData> = props => {
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="Dealerships" withoutDealershipSwitch className="pb-5">
        <Dealership />
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

export default DealershipManagementPage
