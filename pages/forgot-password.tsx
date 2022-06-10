import BaseLayout from '@layouts/BaseLayout'
import ForgotPassword from '@containers/ForgotPassword'
import Head from 'next/head'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { NextPage } from 'next'

const messages = {
  title: 'Forgot Password',
}

const ForgotPasswordPage: NextPage<ServerSideData> = props => {
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <BaseLayout serverSideProps={props} pageKey="forgotPass">
        <ForgotPassword />
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

export default ForgotPasswordPage
