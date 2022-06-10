import { useState } from 'react'
import { useDealershipContext } from '@common/utilities/dealershipContext'
import SectionHeading from '@components/SectionHeading'
import LayoutWithNavigation from '@layouts/LayoutWithNavigation'
import CompositeHeading from '@components/CompositeHeading'
import UsersSection from '@containers/Users/users'
import Button from '@components/Button'
import Dialog from '@components/Dialog'
import UserForm from '@containers/Users/form/UserForm'
import useUsers, { UserAccount } from '@common/endpoints/useUsers'
import Head from 'next/head'
import computeServerSideProps, { IServerSidePropsReturn, ServerSideData } from '@common/utilities/pageProps'
import { NextPage } from 'next'

const messages = {
  pageTitle: 'Manage Users',
  addUsers: 'ADD NEW',
  modalHeader: 'Add New Agent',
  title: 'User Management',
}

const UsersPage: NextPage<ServerSideData> = props => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [activeUser, setActiveUser] = useState<UserAccount | Record<string, undefined> | undefined>()
  const { getCurrentDealershipCode } = useDealershipContext()
  const dealerCode = getCurrentDealershipCode()
  const { pageData, isLoading, isValidating } = useUsers({ dealerCode })
  const { favIcon } = props
  return (
    <>
      <Head>
        <title>{messages.title}</title>
        <link rel="shortcut icon" href={favIcon as string} />
      </Head>
      <LayoutWithNavigation serverSideProps={props} pagekey="UserManagement">
        <Dialog
          onHide={() => {
            setModalOpen(false)
            setActiveUser(undefined)
          }}
          visible={isModalOpen}
          header={<SectionHeading>{messages.modalHeader}</SectionHeading>}
        >
          <UserForm handleFormClose={() => setModalOpen(false)} userData={activeUser} />
        </Dialog>
        <CompositeHeading className="mt-5">
          <SectionHeading icon="gear">{messages.pageTitle}</SectionHeading>
          <Button onClick={() => setModalOpen(true)}>{messages.addUsers}</Button>
        </CompositeHeading>
        <UsersSection
          isLoading={isLoading}
          isValidating={isValidating}
          data={pageData}
          dealerCode={dealerCode}
          handleUserClick={data => {
            if (data) {
              setActiveUser(data)
              setModalOpen(true)
            }
          }}
        />
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

export default UsersPage
