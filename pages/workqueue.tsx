import { useDealershipContext } from '@common/utilities/dealershipContext'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import Inquiries from '@containers/Inquiries'
import Schedule from '@containers/Schedule'
import Appointments from '@containers/Appointments'
import Completed from '@containers/Completed'
import Cancelled from '@containers/Cancelled'
import { useOrdersCount } from '@common/endpoints/useOrders'
import ProgressSpinner from '@components/ProgressSpinner'
import NoData from '@components/NoData'
import Head from 'next/head'
import computeServerSideProps, { ServerSideData, IServerSidePropsReturn } from '@common/utilities/pageProps'
import { NextPage } from 'next'

const messages = {
  noOrders: 'No orders available',
  title: 'Workqueue',
}

const WorkqueuePage: NextPage<ServerSideData> = props => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()
  const { total, isLoading } = useOrdersCount(dealerCode, true)
  const { favIcon } = props

  if (total === undefined || total === 0 || dealerCode === undefined) {
    return (
      <>
        <Head>
          <title>{messages.title}</title>
          <link rel="shortcut icon" href={favIcon as string} />
        </Head>
        <LayoutWithNavigation serverSideProps={props} pagekey="Orders" className="pb-5">
          {isLoading ? (
            <div className="py-5 text-center">
              <ProgressSpinner />
            </div>
          ) : (
            <NoData icon="schedule" className="mt-4">
              {messages.noOrders}
            </NoData>
          )}
        </LayoutWithNavigation>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="Orders" className="pb-5">
        <Inquiries dealerCode={dealerCode} />
        <Schedule dealerCode={dealerCode} />
        <Appointments dealerCode={dealerCode} />
        <Completed dealerCode={dealerCode} />
        <Cancelled dealerCode={dealerCode} />
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

export default WorkqueuePage
