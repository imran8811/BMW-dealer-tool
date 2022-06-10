import { useDealershipContext } from '@common/utilities/dealershipContext'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import ProductContainer from '@containers/ProductsContainer'
import Head from 'next/head'
import { NextPage } from 'next'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { useFniFeature } from '@common/utilities/tenantFeaturesFlags'
import NotFound from '@components/NotFound'

const messages = {
  title: 'Configure F&I Products',
}
const Products: NextPage<ServerSideData> = props => {
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()
  const { isModuleAccessible } = useFniFeature(dealerCode)
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="Product">
        {!isModuleAccessible ? <NotFound /> : dealerCode !== undefined && <ProductContainer dealerCode={dealerCode} />}
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

export default Products
