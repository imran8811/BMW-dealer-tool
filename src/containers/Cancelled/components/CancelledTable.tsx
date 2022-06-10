import { FC, useCallback } from 'react'

import { Order, OrderState } from '@common/endpoints/typings.gen'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import ProgressSpinner from '@components/ProgressSpinner'
import Table, { Column } from '@components/Table'
import { DateDisplay } from '@components/DateDisplay'
import Link from 'next/link'
import { selectFullName } from '@common/selectors/customer'

const messages = {
  rows: {
    photo: '',
    id: 'ID',
    makeModel: 'Make/Model',
    vinStock: 'VIN/Stock #',
    typeName: 'Vehicle Type',
    customer: 'Customer',
    financialProduct: 'Financial Product',
    financialDate: 'Finance Date',
    cancelledOn: 'Canceled On',
    cancelledBy: 'Canceled By',
    paymentStatus: 'Payment Status',
  },
}

const CancelledTable: FC<{
  data?: Order[]
  isLoading: boolean
  onRowNavigate?: (order: Order) => unknown
}> = ({ data, isLoading, onRowNavigate }) => {
  const handleRowSelect = useCallback((params: { data: Order }) => onRowNavigate?.(params.data), [onRowNavigate])

  if ((!data || data?.length === 0) && isLoading) {
    return (
      <div className="py-5 text-center rounded bg-white">
        <ProgressSpinner />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <MissingDataPlaceholder />
  }

  return (
    <div className="px-3 pt-2 pb-3 rounded bg-white">
      <Table
        value={data}
        rowHover
        autoLayout
        className="p-datatable-sm"
        selectionMode={onRowNavigate != null ? 'single' : ''}
        onRowSelect={handleRowSelect}
      >
        <Column
          header={messages.rows.photo}
          body={({ vehicle }: Order) => {
            const pictures = vehicle?.photoUrls
            return (
              pictures &&
              pictures.length > 0 && (
                <img
                  className="img-fluid ml-2"
                  src={pictures[pictures.length > 1 ? 1 : 0]}
                  alt=""
                  style={{ maxHeight: '70px', marginTop: '-0.5rem', marginBottom: '-0.5rem', minWidth: '75px' }}
                />
              )
            )
          }}
        />
        <Column header={messages.rows.id} body={({ order }: Order) => order?.orderId} />
        <Column
          header={messages.rows.makeModel}
          body={({ vehicle }: Order) => <span className="text-dark">{vehicle?.makeModel}</span>}
        />
        <Column
          header={messages.rows.vinStock}
          body={({ vehicle }: Order) => (
            <p className="mb-0">
              <strong className="text-dark">{vehicle?.vin}</strong>
              <br />
              <span>{vehicle?.stockNumber}</span>
            </p>
          )}
        />
        <Column
          header={messages.rows.customer}
          body={({ customer }: Order) => <span className="text-dark">{selectFullName(customer)}</span>}
        />
        <Column
          header={messages.rows.typeName}
          body={({ vehicle }: Order) => <span className="text-dark">{vehicle?.typeName}</span>}
        />
        <Column
          header={messages.rows.financialProduct}
          body={({ order }: Order) =>
            order?.productDisplayName && <span className="text-dark">{order.productDisplayName}</span>
          }
        />
        <Column
          header={messages.rows.financialDate}
          body={({ order }: Order) =>
            order?.financedDate && (
              <span className="text-dark">
                <DateDisplay value={order?.financedDate} format="date" />
              </span>
            )
          }
        />
        <Column
          header={messages.rows.cancelledOn}
          body={({ order }: Order) =>
            order?.updatedAt && (
              <span className="text-dark">
                <DateDisplay value={order?.updatedAt} format="date" />
              </span>
            )
          }
        />
        <Column
          header={messages.rows.cancelledBy}
          body={({ order }: Order) =>
            [OrderState.CreditError, OrderState.Rejected, OrderState.ContractRejected].includes(order.state) ? (
              <span className="text-dark">Credit App Processing</span>
            ) : (
              order?.orderCancellationDetails?.orderCancelledByUsername && (
                <span className="text-dark">{order?.orderCancellationDetails?.orderCancelledByUsername}</span>
              )
            )
          }
        />
        <Column
          header={messages.rows.paymentStatus}
          body={({ order }: Order) => order?.paymentStatus && <span className="text-dark">{order.paymentStatus}</span>}
        />
        <Column
          header=""
          body={({ order }: Order) =>
            order?.updatedAt && (
              <Link href={`/orders/${order._id}?view=summary`}>
                <a className="utm-workqueue-view-cancelled-order-link">View Order</a>
              </Link>
            )
          }
        />
      </Table>
    </div>
  )
}

export default CancelledTable
