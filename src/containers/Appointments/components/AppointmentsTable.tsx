import React, { useCallback } from 'react'

import { Order, OrderState } from '@common/endpoints/typings.gen'
import Icon from '@components/Icon'
import MissingDataPlaceholder from '@components/MissingDataPlaceholder'
import ProgressSpinner from '@components/ProgressSpinner'
import Table, { Column } from '@components/Table'
import { DateDisplay } from '@components/DateDisplay'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { selectFullName } from '@common/selectors/customer'
import { useRescheduleAppointment } from '@common/endpoints/orderTransitions'
import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'
import cls from 'classnames'
import styles from './AppointmentsTable.module.scss'

const messages = {
  rows: {
    photo: '',
    id: 'ID',
    makeModel: 'Make/Model',
    customer: 'Customer',
    scheduledTime: 'Scheduled time',
    payment: 'Payment',
    action: 'Action',
  },
  paidStatus: {
    paid: 'Paid',
    notPaid: 'Not paid',
  },
  vin: 'VIN: ',
  stockNumber: 'Stock: ',
  reschedule: 'Reschedule',
  inProgress: 'Rescheduling ...',
}

const AppointmentsTable: React.FC<{
  data?: Order[]
  isLoading: boolean
  onRowNavigate?: (order: Order) => unknown
}> = ({ data, isLoading, onRowNavigate }) => {
  const handleRowSelect = useCallback((params: { data: Order }) => onRowNavigate?.(params.data), [onRowNavigate])
  const dealer = useDealershipConfiguration()
  const { data: { dealerTimezone: currentTimezone } = {} } = dealer

  const reschedule = useRescheduleAppointment()
  const router = useRouter()
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
          body={({ vehicle }: Order) => (
            <p className="mb-0">
              <strong className="text-dark">{vehicle?.makeModel}</strong>
              <br />
              <span>
                {messages.vin}
                {vehicle?.vin}
              </span>
              <br />
              <span>
                {messages.stockNumber}
                {vehicle?.stockNumber}
              </span>
            </p>
          )}
        />
        <Column
          header={messages.rows.customer}
          body={({ customer }: Order) => <span className="text-dark">{selectFullName(customer)}</span>}
        />
        <Column
          header={messages.rows.scheduledTime}
          body={({ order }: Order) =>
            order?.selectedDateTimeSlot && (
              <span className={styles.scheduledTime}>
                <span className={styles.scheduledTimeIcon}>
                  <Icon name="scheduled" size={24} />
                </span>
                <span className={styles.scheduledTimeText}>
                  <DateDisplay value={order?.selectedDateTimeSlot} format="short-date" />
                  <br />
                  <DateDisplay value={order?.selectedDateTimeSlot} format="time" timezone={currentTimezone} />
                  <br />
                </span>
              </span>
            )
          }
        />
        <Column
          header={messages.rows.payment}
          body={({ order }: Order) => (
            <span className="text-dark">
              {order?.financedDate ? messages.paidStatus.paid : messages.paidStatus.notPaid}
            </span>
          )}
        />
        <Column
          header={messages.rows.action}
          body={({ order }: Order) => {
            const resheduleAppointment = () => {
              const orderId = order._id
              if (reschedule.status !== 'running') {
                void reschedule.mutate({ orderId })
              }
              void router.push(`/orders/${order._id}`)
            }
            return order.state === OrderState.AppointmentScheduled ? (
              <>
                <Link href={`/orders/${order._id}`}>
                  <a className="utm-workqueue-appointment-confirmation-link">Confirm</a>
                </Link>
                <br />
                <a
                  href="#"
                  onClick={evt => {
                    evt.preventDefault()
                    if (reschedule.status !== 'running') {
                      resheduleAppointment()
                    }
                  }}
                  className={cls(styles.textUnderline, 'utm-workqueue-reschedule-link')}
                >
                  {reschedule.status === 'running' ? messages.inProgress : messages.reschedule}
                </a>
              </>
            ) : (
              <span className="text-dark">{order.state}</span>
            )
          }}
        />
      </Table>
    </div>
  )
}

export default AppointmentsTable
