import React from 'react'
import Head from 'next/head'
import OrderDetail from '@containers/OrderDetail'
import { NextPage } from 'next'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'

const messages = {
  title: 'Manage Order',
}
const OrderPageWrapper: NextPage<ServerSideData> = props => {
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <OrderDetail {...props} />
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

export default OrderPageWrapper
