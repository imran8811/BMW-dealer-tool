import BaseLayout from '@layouts/BaseLayout'
import Login from '@containers/Login'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { NextPage } from 'next'
import React from 'react'
import Head from 'next/head'

const messages = {
  title: 'Login - Dealer Tool',
}

const LoginPage: NextPage<ServerSideData> = props => {
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <BaseLayout serverSideProps={props} pageKey="Login">
        <Login />
      </BaseLayout>
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

export default LoginPage
