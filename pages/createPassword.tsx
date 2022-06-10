import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import CreatePasswordForm from '@containers/CreatePassword/CreatePasswordForm'
import Head from 'next/head'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { NextPage } from 'next'

const messages = {
  title: 'Create Password',
}
const CreatePasswordPage: NextPage<ServerSideData> = props => {
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="createPassword">
        <CreatePasswordForm />
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

export default CreatePasswordPage
