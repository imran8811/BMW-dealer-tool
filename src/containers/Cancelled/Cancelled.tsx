import { FC, useCallback } from 'react'

import SectionHeading from '@components/SectionHeading'
import Button from '@components/Button'
import useOrders from '@common/endpoints/useOrders'
import { useRouter } from 'next/router'
import { Order } from '@common/endpoints/typings.gen'
import routes from '@common/routes'
import CancelledTable from './components/CancelledTable'

const messages = {
  title: 'Canceled',
  description: 'Below is the list of Canceled orders.',
  loadMore: 'Load more',
}

const Appoinments: FC<{ dealerCode?: string }> = ({ dealerCode }) => {
  const router = useRouter()
  const { isLoading, total, pageData, isExhausted, loadMore } = useOrders({
    status: 'cancelled',
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
      <SectionHeading icon="cancelled" subtitle={messages.description} className="mt-5" itemCount={total}>
        {messages.title}
      </SectionHeading>
      <CancelledTable data={pageData} isLoading={isLoading} onRowNavigate={viewOrder} />
      {(!isExhausted || isLoading) && (
        <Button
          tertiary
          onClick={loadMore}
          fullWidth
          className="mt-2 utm-workqueue-btn-loadmore-cancelled-orders"
          loading={isLoading}
        >
          {messages.loadMore}
        </Button>
      )}
    </>
  ) : null
}

export default Appoinments
