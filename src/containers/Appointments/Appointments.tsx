import { FC, useCallback } from 'react'

import useOrders from '@common/endpoints/useOrders'
import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import { useRouter } from 'next/router'
import { Order } from '@common/endpoints/typings.gen'
import routes from '@common/routes'
import AppointmentsTable from './components/AppointmentsTable'

const messages = {
  title: 'Appointments',
  description: 'Customers have scheduled their pickups/deliveries, please confirm.',
  loadMore: 'Load more',
}

const Appoinments: FC<{ dealerCode?: string }> = ({ dealerCode }) => {
  const router = useRouter()
  const { isLoading, total, pageData, isExhausted, loadMore } = useOrders({
    status: 'appointment',
    pageSize: 5,
    dealerCode,
  })
  const showDetails = pageData && pageData?.length > 0
  const viewOrder = useCallback(
    (data: Order) => {
      void router.push({ pathname: routes.orderDetails, query: { orderId: data.order._id } })
    },
    [router],
  )

  return showDetails ? (
    <>
      <SectionHeading
        icon="scheduled"
        subtitle={showDetails && messages.description}
        className="mt-5"
        itemCount={total}
      >
        {messages.title}
      </SectionHeading>
      {showDetails && <AppointmentsTable data={pageData} isLoading={isLoading} onRowNavigate={viewOrder} />}
      {showDetails && (!isExhausted || isLoading) && (
        <Button
          tertiary
          onClick={loadMore}
          fullWidth
          className="mt-2 utm-workqueue-btn-load-more-appointments"
          loading={isLoading}
        >
          {messages.loadMore}
        </Button>
      )}
    </>
  ) : null
}

export default Appoinments
