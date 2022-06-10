import { FC } from 'react'
import cls from 'classnames'
import Icon from '@components/Icon'
import { CustomerDetails, HandOverMode, OrderDetails } from '@common/endpoints/typings.gen'
import { DateDisplay } from '@components/DateDisplay'
import invariant from '@common/utilities/invariant'
import { selectFullName } from '@common/selectors/customer'
import useDealershipConfiguration from '@common/endpoints/useDealershipConfiguration'
import { validateTimeZone } from '@common/utilities/timezone'
import styles from './VehicleAppointmentConfirmed.module.scss'
import RescheduleAppointmentLink from '../RescheduleAppointmentLink'
import ExportCalender from '../ExportCalendar'

export interface IVehicleAppointment {
  time: string
  date: string
}

export interface IVehicleAppointmentConfirmedProps {
  customer: CustomerDetails
  order: OrderDetails
}

const messages = {
  updateDelivery: 'will get the delivery of their vehicle on:',
  updatePickup: 'will pickup their vehicle on:',
  reschedule: 'Reschedule this appointment',
  deliveryLocation: 'Delivery Location',
  noLocationAvailable: 'No Location Available',
  confirmed: {
    [HandOverMode.Pickup]: 'Confirmed pickup date and time.',
    [HandOverMode.Delivery]: 'Confirmed delivery date and time.',
  },
}

const VehicleAppointmentConfirmed: FC<IVehicleAppointmentConfirmedProps> = ({ customer, order }) => {
  const dealer = useDealershipConfiguration()
  const { data: { dealerTimezone: currentTimezone } = {} } = dealer
  const timeSlot = order.selectedDateTimeSlot
  invariant(timeSlot != null, 'At this point selected time slot should be known')
  return (
    <div className="bg-white rounded p-3 pt-4 p-md-5">
      <div className="text-center">
        <h2 className="section-subheading">{messages.confirmed[order.vehicleHandOverMode]}</h2>
        <p className="text-muted">
          {selectFullName(customer)}{' '}
          {order.vehicleHandOverMode === HandOverMode.Delivery ? messages.updateDelivery : messages.updatePickup}
        </p>
        <div className="col-xl-8 offset-xl-2 col-lg-8 offset-lg-2 py-5">
          <div className="row">
            <div className={cls('col', styles.borderRight)}>
              <span className="text-primary">
                <Icon name="calanderTimeMD" size={48} />
              </span>
              <div className="text-muted pt-2">
                <DateDisplay value={timeSlot} format="day-name" timezone={currentTimezone} />
              </div>
              <h4>
                <DateDisplay value={timeSlot} format="short-date" timezone={currentTimezone} />
              </h4>
            </div>
            <div className="col">
              <span className="text-primary">
                <Icon name="calanderTick" size={48} />
              </span>
              {/* TODO: this will be adressed in future PRs */}
              <div className="text-muted pt-2">
                <DateDisplay value={timeSlot} format="time-of-day" timezone={currentTimezone} />
              </div>
              <h4>
                <DateDisplay value={timeSlot} format="time" timezone={currentTimezone} />
              </h4>
            </div>
          </div>
        </div>
        <div className="col-xl-8 offset-xl-2 col-lg-8 offset-lg-2 py-5">
          <div className="row">
            <div className={cls('col-md-6 col-sm-12', styles.borderRightText)}>
              <RescheduleAppointmentLink
                classes="utm-reschedule-appointment-confirmed-link"
                orderId={order._id}
                linkText={messages.reschedule}
              />
            </div>
            <div className="col-md-6 col-sm-12">
              <ExportCalender
                customerName={selectFullName(customer)}
                customerLocation={
                  !order.deliveryAddress
                    ? [
                        customer.parkingAddress.streetAddress.trim(),
                        customer.parkingAddress.city.trim(),
                        customer.parkingAddress.state.trim(),
                        customer.parkingAddress.zipCode.trim(),
                      ].join(' ')
                    : [
                        order.deliveryAddress?.address.concat(` ${order.deliveryAddress?.address2 || ''}`).trim(),
                        order.deliveryAddress?.city.trim(),
                        order.deliveryAddress?.state.trim(),
                        order.deliveryAddress?.zipCode.trim(),
                      ]
                        .join(' ')
                        .trim()
                }
                timezone={validateTimeZone(currentTimezone)}
                handoverMode={order.vehicleHandOverMode}
                timeSlot={timeSlot}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default VehicleAppointmentConfirmed
