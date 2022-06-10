import { useDealershipContext } from '@common/utilities/dealershipContext'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import FeeTagsContainer from '@containers/feeTagsConfiguration'
import Head from 'next/head'
import FeatureFlag, { Off, On } from '@containers/FeatureFlag'
import { NextPage } from 'next'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import NotFound from '@components/NotFound'

const messages = {
  title: 'Fee Tag Configuration',
}

const FeeTags: NextPage<ServerSideData> = props => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()

  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="FeeTag">
        <FeatureFlag flag="tempFeeTagUIFlag">
          <On>{dealerCode && <FeeTagsContainer />}</On>
          <Off>
            <NotFound />
          </Off>
        </FeatureFlag>
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

export default FeeTags
